import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import type { Anniversary } from '@/types/anniversary'
import { OutOfTableRangeError, registerAnchors, resolveOccurrence, tabulatedYearRange } from '@/utils/dateUtils'

const root = fileURLToPath(new URL('..', import.meta.url))
const all: Anniversary[] = readdirSync(join(root, 'src/data/anniversaries'))
  .filter(f => /^\d{2}\.json$/.test(f))
  .flatMap(f => JSON.parse(readFileSync(join(root, 'src/data/anniversaries', f), 'utf8')))
registerAnchors(all)

// Existing ID and permanent indexed route must survive the date correction.
const rareId = 'anv-fixed-02-28-rare-disease-day-global'

describe('research publication: Rare Disease Day', () => {
  it('observes the last day of February in every supported year', () => {
    const rare = all.find(a => a.id === rareId)!
    expect(rare).toBeDefined()
    for (let year = 2020; year <= 2050; year++) {
      const actual = resolveOccurrence(rare, year)
      const expected = new Date(year, 2, 0)
      expect([actual.getFullYear(), actual.getMonth(), actual.getDate()], String(year))
        .toEqual([year, 1, expected.getDate()])
    }
    const routes = JSON.parse(readFileSync(join(root, 'src/data/routes.json'), 'utf8'))
    expect(routes[rareId]).toEqual({ slug: 'rare-disease-day', urlDate: '02-28' })
  })
})

// 사용자 승인으로 보류를 해제한 5건 (held-resolution-20261013).
// 지역 표 3키는 2020~2069, 기존 38키는 2020~2050 그대로다.
describe('research publication: held-resolution 5', () => {
  const observances = JSON.parse(readFileSync(join(root, 'src/data/observances.json'), 'utf8')) as Record<string, Record<string, string>>
  const routes = JSON.parse(readFileSync(join(root, 'src/data/routes.json'), 'utf8'))
  const REGIONAL = ['chubun-cn', 'lunar-08-14-hk', 'yama-no-hi-jp']
  const byId = (id: string) => all.find(a => a.id === id)!
  const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const ids = {
    marzanna: 'anv-fixed-03-21-marzanna-pl',
    farmers: 'anv-term-chubun-cn-farmers-harvest-festival',
    fireDragon: 'anv-rel-chuseok-minus1-tai-hang-fire-dragon-hk',
    mountain: 'anv-fixed-08-11-mountain-day-jp',
    setsubun: 'anv-rel-ipchun-minus1-setsubun-jp',
  }

  it('regional tables hold exactly 2020~2069 with real dates', () => {
    for (const key of REGIONAL) {
      const row = observances[key]
      expect(Object.keys(row), key).toEqual(Array.from({ length: 50 }, (_, i) => String(2020 + i)))
      for (const [y, v] of Object.entries(row)) {
        expect(v, `${key} ${y}`).toMatch(/^\d{2}-\d{2}$/)
        const d = new Date(Number(y), Number(v.slice(0, 2)) - 1, Number(v.slice(3)))
        expect(md(d), `${key} ${y}`).toBe(v)
      }
    }
  })

  it('existing 38 keys keep their 2020~2050 values', async () => {
    const { createHash } = await import('node:crypto')
    const keys = Object.keys(observances).filter(k => !REGIONAL.includes(k)).sort()
    expect(keys).toHaveLength(38)
    const hash = createHash('sha256').update(JSON.stringify(keys.map(k => [k, observances[k]]))).digest('hex')
    expect(hash).toBe('5c4a5095392fd04b7a730f836eb7b1544458ce600b880f804d6b68798ca2a2cd')
    expect(tabulatedYearRange()).toEqual({ min: 2020, max: 2050 })
  })

  it('resolves local dates that the Korean keys get wrong', () => {
    expect(md(resolveOccurrence(byId(ids.farmers), 2041))).toBe('09-22')     // 한국 chubun 09-23
    expect(md(resolveOccurrence(byId(ids.fireDragon), 2040))).toBe('09-19')  // 한국 chuseok-1 09-20
    expect(md(resolveOccurrence(byId(ids.mountain), 2020))).toBe('08-10')
    expect(md(resolveOccurrence(byId(ids.mountain), 2021))).toBe('08-08')    // 08-09 는 대체휴일
    expect(md(resolveOccurrence(byId(ids.mountain), 2069))).toBe('08-11')
    expect(md(resolveOccurrence(byId(ids.farmers), 2069))).toMatch(/^09-2[234]$/)
  })

  it('outside 2020~2069 throws with the row range, not the global one', () => {
    for (const id of [ids.farmers, ids.fireDragon, ids.mountain]) {
      for (const year of [2019, 2070]) {
        let err: unknown
        try { resolveOccurrence(byId(id), year) } catch (e) { err = e }
        expect(err, `${id} ${year}`).toBeInstanceOf(OutOfTableRangeError)
        expect([(err as OutOfTableRangeError).min, (err as OutOfTableRangeError).max]).toEqual([2020, 2069])
      }
    }
  })

  it('representative dates say so in the first 150 chars', () => {
    const setsubun = byId(ids.setsubun)
    expect([setsubun.dateType, setsubun.date]).toEqual(['annual-fixed', '02-03'])
    const s = setsubun.storytelling.origin.slice(0, 150)
    expect(s).toContain('입춘 전날')
    expect(s).toContain('대표')
    expect(setsubun.storytelling.origin + setsubun.storytelling.anecdote).not.toMatch(/매년 2월 3일/)
    const marzanna = byId(ids.marzanna)
    expect([marzanna.dateType, marzanna.date]).toEqual(['annual-fixed', '03-21'])
    const m = marzanna.storytelling.origin.slice(0, 150)
    expect(m).toContain('대표 날짜')
    expect(m).toContain('다른 날')
  })

  it('adds five routes without moving existing ones', () => {
    expect(routes[ids.marzanna]).toEqual({ slug: 'marzanna-pl', urlDate: '03-21' })
    expect(routes[ids.farmers]).toEqual({ slug: 'chubun-cn-farmers-harvest-festival', urlDate: '09-23' })
    expect(routes[ids.fireDragon]).toEqual({ slug: 'tai-hang-fire-dragon-hk', urlDate: '09-24' })
    expect(routes[ids.mountain]).toEqual({ slug: 'mountain-day', urlDate: '08-11' })
    expect(routes[ids.setsubun]).toEqual({ slug: 'setsubun', urlDate: '02-03' })
    expect(routes['anv-rel-chuseok-minus1-separated-families-day-kr'])
      .toEqual({ slug: 'separated-families-day', urlDate: '09-24' })
    expect(Object.keys(routes)).toHaveLength(1815)
    expect(all).toHaveLength(1815)
  })
})
