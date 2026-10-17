// 프리렌더 — 빌드 입력이 오염됐을 때 파일 경로와 HTML 을 지키는지.
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveConfig } from 'vite'
import { dateHubDescription, safeJsonLd } from '@/seo/meta'
import {
  shiftUrlDate,
  ORDINAL_DATES,
  displayDateFor,
  DISPLAY_YEAR,
} from '../tools/prerender/routes'
import { registerAnchors } from '@/utils/dateUtils'
import type { Anniversary } from '@/types/anniversary'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = join(ROOT, 'dist')

it('로컬 dev/preview는 /birthday 라우트를 SPA 폴백으로 제공한다 (서버 실행 없이 검사)', async () => {
  // dev 와 preview 는 모두 serve 설정의 appType 으로 HTML 폴백을 결정한다.
  const config = await resolveConfig({ root: ROOT }, 'serve')
  expect(config.appType).toBe('spa')
  expect(config.plugins.some((p) => p.name === 'annical-prerender')).toBe(false)
  expect(readFileSync(join(ROOT, 'index.html'), 'utf-8')).toContain('<div id="app"></div>')
  expect(readFileSync(join(ROOT, 'src/router/index.ts'), 'utf-8')).toContain("path: '/birthday'")
})

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
      id: 'md',
      date: '05-2-SUN',
      dateType: 'annual-nth-weekday',
      name: 'M',
      category: 'general',
      tags: [],
      memes: [],
      sourceUrl: null,
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
      id: 'b',
      date: 'ghost:1',
      dateType: 'annual-relative-to-holiday',
      name: 'B',
      category: 'general',
      tags: [],
      memes: [],
      sourceUrl: null,
      storytelling: { origin: '', anecdote: '' },
    } as Anniversary
    expect(displayDateFor(broken, '07-04')).toBe('07-04')
  })
})

it('허브 설명은 원어 괄호 없이 표시 이름을 쓴다', () => {
  const anv = { name: '대체 연료의 날 (Alternative Fuel Day)' } as Anniversary
  expect(dateHubDescription('10-17', [anv])).toBe('10월 17일의 기념일 1개 — 대체 연료의 날.')
})

// dist 가 있을 때만 — 테스트가 빌드를 강제하지 않도록.
describe.runIf(existsSync(join(DIST, 'index.html')))('빌드 산출물', () => {
  it('모든 허브 366개가 만들어졌다', () => {
    const missing = ORDINAL_DATES.filter((d) => !existsSync(join(DIST, 'day', d, 'index.html')))
    expect(missing).toEqual([])
  })

  it('상세 페이지에 본문이 박혀 있다 (JS 없이 읽히도록)', () => {
    const routes = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8')) as Record<
      string,
      { slug: string; urlDate: string }
    >
    const [, r] = Object.entries(routes)[0]
    const html = readFileSync(join(DIST, 'day', r.urlDate, r.slug, 'index.html'), 'utf-8')
    expect(html).toContain('<article>')
    expect(html).toContain('application/ld+json')
    expect(html).not.toContain('<div id="app"></div>')
    expect(html).toMatch(
      new RegExp(`<link rel="modulepreload" crossorigin href="/assets/${r.urlDate.slice(0, 2)}-`),
    )
  })

  // main.ts 는 상세 mount 전에 urlDate 의 달 하나만 기다린다. 기념일이나 그 기준일이
  // 다른 달 파일에 있으면 mount 직후 정적 본문이 스켈레톤으로 바뀐다.
  it('모든 기념일과 그 기준일이 urlDate 와 같은 달 파일에 있다', () => {
    const routes = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8')) as Record<
      string,
      { urlDate: string }
    >
    const fileOf = new Map<string, string>()
    const all: [string, Anniversary][] = []
    for (const mm of ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']) {
      for (const a of JSON.parse(
        readFileSync(join(ROOT, `src/data/anniversaries/${mm}.json`), 'utf-8'),
      ) as Anniversary[]) {
        fileOf.set(a.id, mm)
        all.push([mm, a])
      }
    }
    const bad = all.filter(([mm, a]) => {
      const anchor = a.dateType === 'annual-relative-to-holiday' ? a.date.split(':')[0] : null
      return routes[a.id]?.urlDate.slice(0, 2) !== mm || (anchor && fileOf.get(anchor) !== mm)
    })
    expect(bad.map(([, a]) => a.id)).toEqual([])
  })

  it('어떤 페이지의 JSON-LD 도 script 를 탈출하지 않는다', () => {
    for (const d of ['01-01', '02-29', '12-31']) {
      const html = readFileSync(join(DIST, 'day', d, 'index.html'), 'utf-8')
      const ld = /<script type="application\/ld\+json" id="ld-page"[^>]*>([\s\S]*?)<\/script>/.exec(
        html,
      )
      expect(ld, d).toBeTruthy()
      expect(() => JSON.parse(ld![1])).not.toThrow()
      expect(ld![1]).not.toContain('<')
    }
  })

  it('상세 JSON-LD 에 lastmod.json 의 날짜와 작성자·이미지가 들어간다', async () => {
    const { loadLastmod } = await import('../tools/prerender/routes')
    const routes = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8')) as Record<
      string,
      { slug: string; urlDate: string }
    >
    const [id, r] = Object.entries(routes)[0]
    const html = readFileSync(join(DIST, 'day', r.urlDate, r.slug, 'index.html'), 'utf-8')
    const ld = JSON.parse(/id="ld-page"[^>]*>([\s\S]*?)<\/script>/.exec(html)![1])
    const article = ld['@graph'][0]
    expect(article.dateModified).toBe(loadLastmod()[id].modified)
    expect(article.datePublished).toBe(loadLastmod()[id].published)
    expect(article.author).toEqual({ '@id': 'https://www.annical.me/#org' })
    expect(article.image).toContain('/api/og?kind=detail')
    // 클라이언트가 첫 로드에서 이 JSON-LD 를 덮어쓰지 않도록 표시가 붙는다.
    expect(html).toContain(`data-prerendered="/day/${r.urlDate}/${r.slug}"`)
  })

  it('lastmod.json 이 모든 기념일을 덮는다 (빠지면 python3 tools/lastmod/generate_lastmod.py)', async () => {
    const { loadAnniversaries, loadLastmod } = await import('../tools/prerender/routes')
    const missing = loadAnniversaries()
      .map((a) => a.id)
      .filter((id) => !loadLastmod()[id])
    expect(missing).toEqual([])
  })

  it('404.html 이 noindex 로 만들어진다', () => {
    const html = readFileSync(join(DIST, '404.html'), 'utf-8')
    expect(html).toContain('noindex')
    // canonical 이 남아 있으면 없는 페이지가 정상 페이지를 가리킨다.
    expect(html).not.toContain('rel="canonical"')
  })

  it('공유 경로를 가리는 파일이 없고 내부 HTML만 존재한다', () => {
    for (const page of ['birthday', 'together']) {
      // 디렉터리 index 외에도 clean URL 과 일치할 수 있는 파일을 모두 검사한다.
      for (const path of [page, `${page}.html`, `${page}/index.html`]) {
        expect(existsSync(join(DIST, path)), path).toBe(false)
      }
      expect(existsSync(join(DIST, '_pages', `${page}.html`))).toBe(true)
    }
  })

  it('사이트맵은 공개 공유 경로만 포함하고 내부 HTML 경로는 제외한다', () => {
    const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf-8')
    for (const page of ['birthday', 'together']) {
      expect(sitemap).toContain(`<loc>https://www.annical.me/${page}</loc>`)
    }
    expect(sitemap).not.toContain('/_pages/')
    expect(sitemap).not.toContain('/export</loc>')
    // 상세 1,815 + 허브 366 + 정적 6. lastmod 는 날짜 단위, 구글이 무시하는 태그는 없다.
    expect(sitemap.match(/<url>/g)).toHaveLength(2187)
    expect(sitemap.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)).toHaveLength(2187)
    expect(sitemap).not.toMatch(/changefreq|priority|xmlns:/)
  })

  it('라우터의 모든 유효 경로가 정적 파일이거나 rewrite 대상이다', () => {
    // vercel.json 의 rewrite 를 소수의 정적 SPA 페이지로 좁혔기 때문에, 그 밖의
    // 유효 경로는 반드시 정적 파일로 존재해야 한다. 하나라도 빠지면 정상
    // 페이지가 404 를 낸다.
    const vercel = JSON.parse(readFileSync(join(ROOT, 'vercel.json'), 'utf-8')) as {
      rewrites: Array<{ source: string; destination: string; has?: unknown[] }>
    }
    // 조건부 봇 rewrite 만 있으면 사람의 요청을 보장하지 못한다.
    const rewritten = new Set(vercel.rewrites.filter((r) => !r.has).map((r) => r.source))
    for (const r of vercel.rewrites.filter((r) => r.destination.startsWith('/_pages/'))) {
      expect(existsSync(join(DIST, r.destination.slice(1))), r.destination).toBe(true)
    }
    const router = readFileSync(join(ROOT, 'src/router/index.ts'), 'utf-8')
    const declared = [...router.matchAll(/path: '([^']+)'/g)].map((m) => m[1])

    const uncovered = declared.filter((p) => {
      if (p.startsWith('/:')) return false // catch-all — 404.html 이 받는다
      if (rewritten.has(p)) return false
      if (p === '/') return !existsSync(join(DIST, 'index.html'))
      if (p.includes(':')) return false // 동적 — 아래에서 따로 검사
      return !existsSync(join(DIST, p.slice(1), 'index.html'))
    })
    expect(
      uncovered,
      'vercel.json rewrites 에 추가하거나 프리렌더하세요 (dist 가 낡았을 수도 있다 — npm run build 먼저)',
    ).toEqual([])

    // 동적 경로: routes.json 전건과 허브 366개가 모두 파일로 있어야 한다.
    const routes = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8')) as Record<
      string,
      { slug: string; urlDate: string }
    >
    const missingDetail = Object.values(routes).filter(
      (r) => !existsSync(join(DIST, 'day', r.urlDate, r.slug, 'index.html')),
    )
    expect(
      missingDetail,
      'routes.json 에 있는데 dist 에 없다 — npm run build 를 먼저 실행하세요',
    ).toEqual([])
  })

  it('2월 29일 허브의 이웃 링크가 2/28 과 3/1 이다', () => {
    const html = readFileSync(join(DIST, 'day', '02-29', 'index.html'), 'utf-8')
    expect(html).toContain('/day/02-28')
    expect(html).toContain('/day/03-01')
    expect(html).not.toContain('/day/03-02')
  })
})

describe.runIf(existsSync(join(DIST, 'index.html')))('페이지별 OG 메타', () => {
  it('정적 페이지 6개에 전용 이미지·본문·canonical이 있다', async () => {
    const { PAGE_META } = await import('../src/seo/pages')
    const { ogImageUrl } = await import('../src/seo/og')
    for (const page of Object.keys(PAGE_META) as Array<keyof typeof PAGE_META>) {
      const file =
        page === 'birthday' || page === 'together'
          ? join(DIST, '_pages', `${page}.html`)
          : join(DIST, page === 'home' ? '' : page, 'index.html')
      const html = readFileSync(file, 'utf-8')
      const image = ogImageUrl(page).replace(/&/g, '&amp;')
      expect(html).toContain(`property="og:image" content="${image}"`)
      expect(html).toContain(`name="twitter:image" content="${image}"`)
      expect(html).toContain(PAGE_META[page].title)
      expect(html).toContain('og:image:width" content="1200')
      expect(html).toContain('og:image:height" content="630')
      expect(html).toContain('twitter:image:alt')
      expect(html).toMatch(/<script\b[^>]*src="\/assets\/[^\"]+"/)
      // 홈도 JS 없이 읽히는 본문과 사이트 안으로 들어가는 링크가 있어야 한다.
      expect(html).toContain('<h1>')
      expect(html).toMatch(/<nav><a href="\/[a-z]*">/)
      expect(html).toContain(
        `rel="canonical" href="https://www.annical.me/${page === 'home' ? '' : page}"`,
      )
    }
  })
  it('상세·허브는 각자의 동적 이미지 URL을 쓴다', async () => {
    const { ogImageUrl } = await import('../src/seo/og')
    const routes = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8')) as Record<
      string,
      { slug: string; urlDate: string }
    >
    for (const r of Object.values(routes)) {
      const html = readFileSync(join(DIST, 'day', r.urlDate, r.slug, 'index.html'), 'utf-8')
      const image = ogImageUrl({ kind: 'detail', date: r.urlDate, slug: r.slug }).replace(
        /&/g,
        '&amp;',
      )
      expect(html).toContain(`property="og:image" content="${image}"`)
      expect(html).toContain(`name="twitter:image" content="${image}"`)
    }
    for (const date of ORDINAL_DATES) {
      const html = readFileSync(join(DIST, 'day', date, 'index.html'), 'utf-8')
      expect(html).toContain(ogImageUrl({ kind: 'hub', date }).replace(/&/g, '&amp;'))
    }
  })
})
