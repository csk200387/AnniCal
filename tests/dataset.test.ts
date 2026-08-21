// 데이터셋 자체의 불변조건 — 여기가 깨지면 빌드가 성공해도 사이트가 틀린다.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Anniversary } from '@/types/anniversary'
import { registerAnchors, resolveOccurrence } from '@/utils/dateUtils'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATA_DIR = join(ROOT, 'src/data/anniversaries')

const anniversaries: Anniversary[] = readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as Anniversary[])

const routes = JSON.parse(
  readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8'),
) as Record<string, { slug: string; urlDate: string }>

registerAnchors(anniversaries)

describe('데이터셋 ↔ routes.json', () => {
  // 예전에는 "routes 에 있는데 데이터에 없는 id" 만 검사했다. 반대 방향을 안 봐서,
  // 기념일을 추가하고 generate_slugs.py 를 안 돌려도 빌드가 통과했고 새 기념일은
  // 상세·사이트맵·공유 링크에서 조용히 빠졌다.
  it('양방향으로 정확히 일치한다', () => {
    const dataIds = new Set(anniversaries.map((a) => a.id))
    const routeIds = new Set(Object.keys(routes))

    const missingRoutes = [...dataIds].filter((id) => !routeIds.has(id))
    const orphanRoutes = [...routeIds].filter((id) => !dataIds.has(id))

    expect(missingRoutes, 'routes.json 에 없는 기념일 — generate_slugs.py 를 실행하세요').toEqual([])
    expect(orphanRoutes, '데이터에 없는 route').toEqual([])
  })

  it('URL (urlDate, slug) 조합이 유일하다', () => {
    const seen = new Map<string, string>()
    const collisions: string[] = []
    for (const [id, r] of Object.entries(routes)) {
      const key = `${r.urlDate}/${r.slug}`
      const prev = seen.get(key)
      if (prev) collisions.push(`${key}: ${prev} vs ${id}`)
      else seen.set(key, id)
    }
    expect(collisions).toEqual([])
  })

  it('slug 는 소문자-하이픈 형태만 쓴다', () => {
    // 이 값이 파일 경로와 HTML 속성에 그대로 들어간다.
    const bad = Object.entries(routes)
      .filter(([, r]) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r.slug))
      .map(([id, r]) => `${id} → ${r.slug}`)
    expect(bad).toEqual([])
  })

  it('urlDate 는 달력에 실제로 있는 날짜다', () => {
    const bad = Object.entries(routes)
      .filter(([, r]) => {
        if (!/^\d{2}-\d{2}$/.test(r.urlDate)) return true
        const [mm, dd] = r.urlDate.split('-').map(Number)
        const d = new Date(2024, mm - 1, dd) // 2024 = 윤년
        return d.getMonth() + 1 !== mm || d.getDate() !== dd
      })
      .map(([id, r]) => `${id} → ${r.urlDate}`)
    expect(bad).toEqual([])
  })
})

describe('날짜 규칙', () => {
  it('모든 기념일이 유효한 실제 날짜를 만든다', () => {
    const failures: string[] = []
    for (const a of anniversaries) {
      try {
        const d = resolveOccurrence(a, 2026)
        if (Number.isNaN(d.getTime())) failures.push(`${a.id}: NaN`)
      } catch (e) {
        failures.push(`${a.id}: ${e instanceof Error ? e.message : e}`)
      }
    }
    expect(failures).toEqual([])
  })

  it('anchor 그래프가 DAG 다 (순환 없음)', () => {
    const parent = new Map<string, string>()
    for (const a of anniversaries) {
      if (a.dateType === 'annual-relative-to-holiday') {
        parent.set(a.id, a.date.slice(0, a.date.lastIndexOf(':')))
      }
    }
    const cycles: string[] = []
    for (const start of parent.keys()) {
      const path: string[] = []
      let node: string | undefined = start
      while (node && parent.has(node)) {
        if (path.includes(node)) {
          cycles.push([...path.slice(path.indexOf(node)), node].join(' → '))
          break
        }
        path.push(node)
        node = parent.get(node)
      }
    }
    expect(cycles).toEqual([])
  })

  it('모든 anchor 가 데이터셋에 존재한다', () => {
    const ids = new Set(anniversaries.map((a) => a.id))
    const dangling = anniversaries
      .filter((a) => a.dateType === 'annual-relative-to-holiday')
      .map((a) => ({ id: a.id, anchor: a.date.slice(0, a.date.lastIndexOf(':')) }))
      .filter((x) => !ids.has(x.anchor))
      .map((x) => `${x.id} → ${x.anchor}`)
    expect(dangling).toEqual([])
  })
})

describe('데이터 값 위생', () => {
  it('제어문자가 없다 (ICS 속성 주입 방지)', () => {
    // eslint-disable-next-line no-control-regex
    const control = /[\x00-\x1f\x7f-\x9f]/
    const bad: string[] = []
    for (const a of anniversaries) {
      for (const [label, v] of [
        ['id', a.id],
        ['name', a.name],
        ['date', a.date],
        ['origin', a.storytelling?.origin ?? ''],
        ['anecdote', a.storytelling?.anecdote ?? ''],
        ['sourceUrl', a.sourceUrl ?? ''],
      ] as const) {
        if (control.test(v)) bad.push(`${a.id}.${label}`)
      }
    }
    expect(bad).toEqual([])
  })

  it('</script> 시퀀스가 없다 (JSON-LD 탈출 방지)', () => {
    const bad = anniversaries
      .filter((a) =>
        /<\/\s*script/i.test(
          `${a.name}${a.storytelling?.origin ?? ''}${a.storytelling?.anecdote ?? ''}`,
        ),
      )
      .map((a) => a.id)
    expect(bad).toEqual([])
  })

  it('id 가 ICS UID 로 안전한 형태다', () => {
    const bad = anniversaries.filter((a) => !/^[A-Za-z0-9._-]+$/.test(a.id)).map((a) => a.id)
    expect(bad).toEqual([])
  })
})
