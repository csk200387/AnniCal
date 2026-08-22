// 프리렌더 — 빌드 입력이 오염됐을 때 파일 경로와 HTML 을 지키는지.
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { safeJsonLd } from '@/seo/meta'
import { shiftUrlDate, ORDINAL_DATES, displayDateFor, DISPLAY_YEAR } from '../tools/prerender/routes'
import { registerAnchors } from '@/utils/dateUtils'
import type { Anniversary } from '@/types/anniversary'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')

describe('JSON-LD 직렬화', () => {
  it('</script> 로 script 요소를 닫을 수 없다', () => {
    const out = safeJsonLd({ name: 'a</script><script>alert(1)</script>' })
    expect(out).not.toContain('</script')
    expect(out).not.toContain('<script')
    // 값 자체는 보존된다 — escape 이지 삭제가 아니다.
    expect(JSON.parse(out).name).toBe('a</script><script>alert(1)</script>')
  })

  it('<, >, & 를 유니코드로 escape 한다', () => {
    const out = safeJsonLd({ v: '<>&' })
    expect(out).toContain('\\u003c')
    expect(out).toContain('\\u003e')
    expect(out).toContain('\\u0026')
  })

  it('U+2028/U+2029 를 escape 한다 (JS 파서가 줄바꿈으로 읽는 문자)', () => {
    const raw = `a\u2028b\u2029c`
    const out = safeJsonLd({ v: raw })
    expect(out).not.toMatch(/[\u2028\u2029]/)
    expect(JSON.parse(out).v).toBe(raw)
  })
})

describe('366일 고리', () => {
  it('윤일을 포함해 366개다', () => {
    expect(ORDINAL_DATES).toHaveLength(366)
    expect(ORDINAL_DATES).toContain('02-29')
  })

  it('2월 29일 이웃이 정확하다', () => {
    expect(shiftUrlDate('02-29', -1)).toBe('02-28')
    expect(shiftUrlDate('02-29', 1)).toBe('03-01')
  })

  it('없는 날짜는 null', () => {
    expect(shiftUrlDate('02-31', 1)).toBeNull()
  })
})

describe('표시 날짜는 실제 발생일을 따른다', () => {
  it('N번째 요일 기념일은 DISPLAY_YEAR 의 실제 날짜를 쓴다', () => {
    const mothersDay = {
      id: 'md', date: '05-2-SUN', dateType: 'annual-nth-weekday',
      name: 'M', category: 'general', tags: [], memes: [], sourceUrl: null,
      storytelling: { origin: '', anecdote: '' },
    } as Anniversary
    registerAnchors([mothersDay])
    // URL 은 2026년으로 고정(05-10)이지만 표시는 그 해 실제 날짜여야 한다.
    const expected = ['2026-05-10', '2027-05-09', '2028-05-14']
      .find((s) => s.startsWith(String(DISPLAY_YEAR)))!
      .slice(5)
    expect(displayDateFor(mothersDay, '05-10')).toBe(expected)
  })

  it('계산 불가면 URL 날짜로 물러선다', () => {
    registerAnchors([])
    const broken = {
      id: 'b', date: 'ghost:1', dateType: 'annual-relative-to-holiday',
      name: 'B', category: 'general', tags: [], memes: [], sourceUrl: null,
      storytelling: { origin: '', anecdote: '' },
    } as Anniversary
    expect(displayDateFor(broken, '07-04')).toBe('07-04')
  })
})

// dist 가 있을 때만 — 테스트가 빌드를 강제하지 않도록.
describe.runIf(existsSync(join(DIST, 'index.html')))('빌드 산출물', () => {
  it('모든 허브 366개가 만들어졌다', () => {
    const missing = ORDINAL_DATES.filter(
      (d) => !existsSync(join(DIST, 'day', d, 'index.html')),
    )
    expect(missing).toEqual([])
  })

  it('상세 페이지에 본문이 박혀 있다 (JS 없이 읽히도록)', () => {
    const routes = JSON.parse(
      readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8'),
    ) as Record<string, { slug: string; urlDate: string }>
    const [, r] = Object.entries(routes)[0]
    const html = readFileSync(join(DIST, 'day', r.urlDate, r.slug, 'index.html'), 'utf-8')
    expect(html).toContain('<article>')
    expect(html).toContain('application/ld+json')
    expect(html).not.toContain('<div id="app"></div>')
  })

  it('어떤 페이지의 JSON-LD 도 script 를 탈출하지 않는다', () => {
    for (const d of ['01-01', '02-29', '12-31']) {
      const html = readFileSync(join(DIST, 'day', d, 'index.html'), 'utf-8')
      const ld = /<script type="application\/ld\+json" id="ld-page">([\s\S]*?)<\/script>/.exec(html)
      expect(ld, d).toBeTruthy()
      expect(() => JSON.parse(ld![1])).not.toThrow()
      expect(ld![1]).not.toContain('<')
    }
  })

  it('404.html 이 noindex 로 만들어진다', () => {
    const html = readFileSync(join(DIST, '404.html'), 'utf-8')
    expect(html).toContain('noindex')
    // canonical 이 남아 있으면 없는 페이지가 정상 페이지를 가리킨다.
    expect(html).not.toContain('rel="canonical"')
  })

  it('라우터의 모든 유효 경로가 정적 파일이거나 rewrite 대상이다', () => {
    // vercel.json 의 rewrite 를 /calendar·/export 로 좁혔기 때문에, 그 밖의
    // 유효 경로는 반드시 정적 파일로 존재해야 한다. 하나라도 빠지면 정상
    // 페이지가 404 를 낸다.
    const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf-8')) as {
      rewrites: Array<{ source: string }>
    }
    const rewritten = new Set(vercel.rewrites.map((r) => r.source))
    const router = readFileSync(join(ROOT, 'src/router/index.ts'), 'utf-8')
    const declared = [...router.matchAll(/path: '([^']+)'/g)].map((m) => m[1])

    const uncovered = declared.filter((p) => {
      if (p.startsWith('/:')) return false // catch-all — 404.html 이 받는다
      if (rewritten.has(p)) return false
      if (p === '/') return !existsSync(join(DIST, 'index.html'))
      if (p.includes(':')) return false // 동적 — 아래에서 따로 검사
      return !existsSync(join(DIST, p.slice(1), 'index.html'))
    })
    expect(uncovered, 'vercel.json rewrites 에 추가하거나 프리렌더하세요 (dist 가 낡았을 수도 있다 — npm run build 먼저)').toEqual([])

    // 동적 경로: routes.json 전건과 허브 366개가 모두 파일로 있어야 한다.
    const routes = JSON.parse(
      readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8'),
    ) as Record<string, { slug: string; urlDate: string }>
    const missingDetail = Object.values(routes).filter(
      (r) => !existsSync(join(DIST, 'day', r.urlDate, r.slug, 'index.html')),
    )
    expect(missingDetail, 'routes.json 에 있는데 dist 에 없다 — npm run build 를 먼저 실행하세요').toEqual([])
  })

  it('2월 29일 허브의 이웃 링크가 2/28 과 3/1 이다', () => {
    const html = readFileSync(join(DIST, 'day', '02-29', 'index.html'), 'utf-8')
    expect(html).toContain('/day/02-28')
    expect(html).toContain('/day/03-01')
    expect(html).not.toContain('/day/03-02')
  })
})
