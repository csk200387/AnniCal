// ICS 생성 — 반복 규칙의 정확성과 주입 방어.
import { beforeAll, describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Anniversary } from '@/types/anniversary'
import { registerAnchors, resolveOccurrence } from '@/utils/dateUtils'
import { buildCalendarDetailed } from '@/utils/ics'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATA_DIR = join(ROOT, 'src/data/anniversaries')

const anniversaries: Anniversary[] = readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as Anniversary[])

const STAMP = new Date(Date.UTC(2026, 0, 1))

/** 물리 줄을 접기 해제해 논리 줄로 되돌린다. */
function logicalLines(ics: string): string[] {
  return ics.replace(/\r\n /g, '').split('\r\n')
}

function eventFor(ics: string, id: string): string[] {
  const lines = logicalLines(ics)
  const start = lines.findIndex((l) => l === `UID:${id}@annical.vercel.app`)
  if (start < 0) return []
  const begin = lines.lastIndexOf('BEGIN:VEVENT', start)
  const end = lines.indexOf('END:VEVENT', start)
  return lines.slice(begin, end + 1)
}

const fmt = (d: Date) =>
  `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`

function mk(overrides: Partial<Anniversary>): Anniversary {
  return {
    id: 'test-entry',
    date: '01-01',
    dateType: 'annual-fixed',
    name: '테스트',
    category: 'general',
    tags: [],
    memes: [],
    sourceUrl: null,
    storytelling: { origin: '', anecdote: '' },
    ...overrides,
  } as Anniversary
}

beforeAll(() => registerAnchors(anniversaries))

describe('반복 규칙', () => {
  it('상대 날짜 기념일의 이후 연도가 실제 계산과 일치한다', () => {
    // 이게 F-03 의 핵심. FREQ=YEARLY 로 적으면 DTSTART 의 월·일이 그대로 반복돼
    // 블랙프라이데이가 2027년에 하루 어긋났다.
    const { ics } = buildCalendarDetailed(anniversaries, { stamp: STAMP, year: 2026 })
    const mismatches: string[] = []

    for (const a of anniversaries) {
      if (a.dateType !== 'annual-relative-to-holiday' && a.dateType !== 'annual-tabulated') continue
      const block = eventFor(ics, a.id)
      expect(block.length, `${a.id} 의 VEVENT 가 없다`).toBeGreaterThan(0)

      // 규칙으로 표현할 수 없는 타입에 RRULE 이 붙으면 안 된다.
      expect(block.filter((l) => l.startsWith('RRULE:')), `${a.id} 에 RRULE`).toEqual([])

      const start = block.find((l) => l.startsWith('DTSTART'))!.split(':')[1]
      const rdateLine = block.find((l) => l.startsWith('RDATE'))
      const dates = [start, ...(rdateLine ? rdateLine.split(':')[1].split(',') : [])]

      dates.forEach((got, i) => {
        const want = fmt(resolveOccurrence(a, 2026 + i))
        if (got !== want) mismatches.push(`${a.id} ${2026 + i}: ${got} ≠ ${want}`)
      })
    }
    expect(mismatches).toEqual([])
  })

  it('블랙프라이데이 2026~2028 (골든)', () => {
    const bf = anniversaries.find((a) => /black.?friday/i.test(a.id))
    expect(bf, '블랙프라이데이 항목이 데이터에 없다').toBeDefined()
    const { ics } = buildCalendarDetailed([bf!], { stamp: STAMP, year: 2026 })
    const block = eventFor(ics, bf!.id)

    expect(block.find((l) => l.startsWith('DTSTART'))).toBe('DTSTART;VALUE=DATE:20261127')
    const rdates = block.find((l) => l.startsWith('RDATE'))!.split(':')[1].split(',')
    expect(rdates[0]).toBe('20271126') // 넷째 목요일 다음날 — 11-27 이 아니다
    expect(rdates[1]).toBe('20281124')
  })

  it('고정일·N번째 요일은 RRULE 로 표현한다', () => {
    const fixed = mk({ id: 'fixed-x', date: '03-14', dateType: 'annual-fixed' })
    const nth = mk({ id: 'nth-x', date: '05-2-SUN', dateType: 'annual-nth-weekday' })
    const { ics } = buildCalendarDetailed([fixed, nth], { stamp: STAMP, year: 2026 })

    expect(eventFor(ics, 'fixed-x')).toContain('RRULE:FREQ=YEARLY')
    expect(eventFor(ics, 'nth-x')).toContain('RRULE:FREQ=YEARLY;BYMONTH=5;BYDAY=2SU')
  })

  it('음력 명절은 표의 연도별 날짜를 RDATE 로 나열한다', () => {
    const seollal = anniversaries.find((a) => a.date === 'seollal')
    expect(seollal).toBeDefined()
    const { ics } = buildCalendarDetailed([seollal!], { stamp: STAMP, year: 2026 })
    const block = eventFor(ics, seollal!.id)
    const rdates = block.find((l) => l.startsWith('RDATE'))!.split(':')[1].split(',')
    expect(rdates[0]).toBe('20270207') // 2027 설날 — 2026(02-17)과 열흘 넘게 다르다
  })
})

describe('주입 방어', () => {
  const structure = (ics: string) => {
    const l = logicalLines(ics)
    return {
      vevent: l.filter((x) => x === 'BEGIN:VEVENT').length,
      valarm: l.filter((x) => x === 'BEGIN:VALARM').length,
      attendee: l.filter((x) => x.startsWith('ATTENDEE')).length,
      evil: l.filter((x) => x.startsWith('X-EVIL')).length,
    }
  }

  it('CRLF 로 새 속성·이벤트를 만들 수 없다', () => {
    const payload = 'a\r\nEND:VEVENT\r\nBEGIN:VEVENT\r\nUID:fake\r\nATTENDEE:mailto:x@y.z\r\nBEGIN:VALARM'
    const { ics } = buildCalendarDetailed(
      [mk({ id: 'crlf-x', name: payload, storytelling: { origin: payload, anecdote: '' } })],
      { stamp: STAMP, year: 2026 },
    )
    expect(structure(ics)).toEqual({ vevent: 1, valarm: 0, attendee: 0, evil: 0 })
  })

  it('단독 CR 도 이스케이프한다', () => {
    const { ics } = buildCalendarDetailed(
      [mk({ id: 'cr-x', name: 'a\rATTENDEE:mailto:x@y.z' })],
      { stamp: STAMP, year: 2026 },
    )
    expect(structure(ics).attendee).toBe(0)
  })

  it('UID 로 쓸 수 없는 id 는 건너뛰고 이유를 남긴다', () => {
    const r = buildCalendarDetailed([mk({ id: 'a b\r\nX-EVIL:1' })], { stamp: STAMP, year: 2026 })
    expect(r.count).toBe(0)
    expect(r.skipped).toHaveLength(1)
    expect(structure(r.ics).evil).toBe(0)
  })

  it('https 가 아닌 sourceUrl 은 URL 속성에 넣지 않는다', () => {
    for (const bad of ['javascript:alert(1)', 'https://u:p@evil.com/', 'not-a-url']) {
      const { ics } = buildCalendarDetailed([mk({ id: 'url-x', sourceUrl: bad })], {
        stamp: STAMP,
        year: 2026,
      })
      expect(eventFor(ics, 'url-x').filter((l) => l.startsWith('URL:')), bad).toEqual([])
    }
  })
})

describe('출력 형식', () => {
  it('모든 물리 줄이 75 옥텟 이하다', () => {
    const { ics } = buildCalendarDetailed(anniversaries, { stamp: STAMP, year: 2026 })
    const over = ics.split('\r\n').filter((l) => Buffer.byteLength(l, 'utf-8') > 75)
    expect(over).toEqual([])
  })

  it('같은 입력이면 항상 같은 바이트다 (ETag 가 의미를 갖도록)', () => {
    const a = buildCalendarDetailed(anniversaries, { stamp: STAMP, year: 2026 }).ics
    const b = buildCalendarDetailed(anniversaries, { stamp: STAMP, year: 2026 }).ics
    expect(a).toBe(b)
  })

  it('전체 데이터에서 조용히 누락되는 항목이 없다', () => {
    const r = buildCalendarDetailed(anniversaries, { stamp: STAMP, year: 2026 })
    expect(r.skipped).toEqual([])
    expect(r.count).toBe(anniversaries.length)
  })
})
