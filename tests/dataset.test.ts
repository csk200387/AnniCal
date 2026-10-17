// 데이터셋 자체의 불변조건 — 여기가 깨지면 빌드가 성공해도 사이트가 틀린다.
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Anniversary } from '@/types/anniversary'
import { registerAnchors, resolveOccurrence, resolveOccurrenceSafe } from '@/utils/dateUtils'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DATA_DIR = join(ROOT, 'src/data/anniversaries')

const anniversaries: Anniversary[] = readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as Anniversary[])

const routes = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8')) as Record<
  string,
  { slug: string; urlDate: string }
>

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

    expect(missingRoutes, 'routes.json 에 없는 기념일 — generate_slugs.py 를 실행하세요').toEqual(
      [],
    )
    expect(orphanRoutes, '데이터에 없는 route').toEqual([])
  })

  // 생성기는 데이터에서 주소를 계산한다. 데이터를 고칠 때마다 다시 계산하면 색인된
  // URL 이 조용히 바뀐다(이산가족의 날: 날짜 규칙 수정으로 09-24 → 09-23 이 될 뻔했다).
  it('generate_slugs.py 를 돌려도 기존 주소는 그대로다', () => {
    const path = join(ROOT, 'src/data/routes.json')
    const before = readFileSync(path, 'utf-8')
    try {
      execFileSync('python3', ['tools/slugs/generate_slugs.py'], { cwd: ROOT, stdio: 'ignore' })
      expect(readFileSync(path, 'utf-8') === before).toBe(true)
    } finally {
      writeFileSync(path, before)
    }
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
        // 윤일만 평년의 합법적인 부재다. 규칙 자체는 윤년에도 반드시 검증한다.
        const leapOnly = a.dateType === 'annual-fixed' && a.date === '02-29'
        const d = resolveOccurrence(a, leapOnly ? 2028 : 2026)
        if (leapOnly && resolveOccurrenceSafe(a, 2026) !== null)
          failures.push(`${a.id}: 평년 윤일 발생`)
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

describe('카테고리 색', () => {
  // 색 배정은 categories.json 의 colorToken 한 곳, 실제 색값은 ui.css 의 [data-color] 규칙이다.
  // 오타가 나면 그 카테고리 점만 기본색으로 떨어지는데, 화면으로는 알아채기 어렵다.
  it('모든 colorToken 에 대응하는 ui.css 규칙이 있다', () => {
    const categories = JSON.parse(
      readFileSync(join(ROOT, 'src/data/categories.json'), 'utf-8'),
    ) as { id: string; colorToken: string }[]
    const css = readFileSync(join(ROOT, 'src/assets/ui.css'), 'utf-8')
    const missing = categories
      .filter((c) => !css.includes(`[data-color='${c.colorToken}']`))
      .map((c) => `${c.id}:${c.colorToken}`)
    expect(missing).toEqual([])
  })
})

describe('illustrations.json', () => {
  // 파일을 빠뜨리면 상세 히어로에 깨진 그림이, 없는 id 면 아무 데도 안 실리는 그림이 남는다.
  const map = JSON.parse(
    readFileSync(join(ROOT, 'src/data/illustrations.json'), 'utf-8'),
  ) as Record<string, { file: string; alt: string; credit: string }>
  it('있는 기념일만 가리키고 두 크기 파일이 다 있다', () => {
    for (const [id, { file, alt, credit }] of Object.entries(map)) {
      expect(routes[id], id).toBeDefined()
      expect(alt && credit, id).toBeTruthy()
      for (const w of [480, 960]) {
        expect(
          existsSync(join(ROOT, `public/illustrations/${file}-${w}.webp`)),
          `${file}-${w}`,
        ).toBe(true)
      }
    }
  })
})
