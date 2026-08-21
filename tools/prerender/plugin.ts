// 빌드 후 기념일 상세·날짜 허브를 정적 HTML 로 찍어내는 Vite 플러그인.
//
// 왜 필요한가: 이 앱은 CSR SPA 라 index.html 본문이 <div id="app"></div> 뿐이다.
// 구글은 JS 를 실행해 주지만 네이버 크롤러(Yeti)는 사실상 실행하지 않아, 검색엔진에
// 빈 페이지로 보인다. 각 기념일의 본문을 HTML 에 직접 박아두면 JS 없이도 읽힌다.
// Vue 는 부팅하면서 #app 안을 자기 렌더 결과로 교체하므로 사용자 경험은 그대로다.
//
// title/description 문구는 src/seo/meta.ts 의 함수를 그대로 import 해서 쓴다.
// 정적 HTML 과 SPA 가 서로 다른 제목을 내는 사고를 막기 위함이다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import type { Plugin } from 'vite'
import type { Anniversary } from '../../src/types/anniversary'
import {
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  anniversaryDescription,
  anniversaryJsonLd,
  anniversaryTitle,
  dateHubDescription,
  dateHubJsonLd,
  dateHubTitle,
  isHttpUrl,
  koreanDate,
  safeJsonLd,
} from '../../src/seo/meta'
import {
  buildTargets,
  loadRoutes,
  shiftUrlDate,
  type PrerenderTarget,
} from './routes'

/** HTML 텍스트·속성 문맥 이스케이프. 속성은 항상 큰따옴표로 감싼다. */
const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * URL 경로 조각 이스케이프.
 *
 * slug 와 날짜는 generate_slugs.py 와 buildTargets 이 이미 검증하지만, href 로
 * 나가는 값은 한 겹 더 감싼다. 검증을 우회한 값이 링크를 깨뜨리거나 속성을
 * 탈출하지 못하게 하는 게 목적이다.
 */
const escPath = (s: string): string => encodeURIComponent(s)

/** 외부 링크에 일관되게 붙이는 rel — referrer 유출과 탭 탈취를 함께 막는다. */
const EXTERNAL_REL = 'noopener noreferrer nofollow'

/** 상세 페이지 본문 — Vue 가 그리는 내용과 같은 텍스트를 같은 순서로. */
function detailBody(
  anv: Anniversary,
  displayDate: string,
  sameDay: Anniversary[],
  routes: Record<string, { slug: string; urlDate: string }>,
): string {
  const link = (a: Anniversary) => {
    const r = routes[a.id]
    if (!r) return ''
    return `<li><a href="/day/${escPath(r.urlDate)}/${escPath(r.slug)}">${esc(a.name)}</a></li>`
  }
  const story = [
    anv.storytelling.origin?.trim()
      ? `<section><h2>유래</h2><p>${esc(anv.storytelling.origin)}</p></section>` : '',
    anv.storytelling.anecdote?.trim()
      ? `<section><h2>이야깃거리</h2><p>${esc(anv.storytelling.anecdote)}</p></section>` : '',
  ].join('')
  const quotes = anv.memes.length
    ? `<aside>${anv.memes.map((m) => `<blockquote>${esc(m.caption)}</blockquote>`).join('')}</aside>`
    : ''
  const tags = anv.tags.length
    ? `<ul>${anv.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''
  const source = isHttpUrl(anv.sourceUrl)
    ? `<p>출처 <a href="${esc(anv.sourceUrl)}" rel="${EXTERNAL_REL}">${esc(anv.sourceUrl)}</a></p>` : ''
  const hub = `/day/${escPath(displayDate)}`
  const others = sameDay.length
    ? `<section><h2>${koreanDate(displayDate)}의 다른 기념일</h2><ul>${sameDay.map(link).join('')}</ul></section>` : ''

  return `<nav><a href="/">홈</a> / <a href="${hub}">${koreanDate(displayDate)}</a></nav>` +
    `<article><h1>${esc(anv.name)}</h1><p>${koreanDate(displayDate)}</p>` +
    `${story}${quotes}${tags}${source}</article>${others}` +
    `<p><a href="${hub}">${koreanDate(displayDate)}은 무슨 날인지 전부 보기</a></p>`
}

/** 날짜 허브 본문. */
function hubBody(urlDate: string, items: Anniversary[],
                 routes: Record<string, { slug: string; urlDate: string }>): string {
  const rows = items.map((a) => {
    const r = routes[a.id]
    if (!r) return ''
    const lead = a.storytelling.origin?.trim()
    return `<li><a href="/day/${escPath(r.urlDate)}/${escPath(r.slug)}"><h2>${esc(a.name)}</h2></a>` +
      (lead ? `<p>${esc(lead)}</p>` : '') + '</li>'
  }).join('')

  // 366일 고리를 따라 이동한다. 비윤년 Date 산술을 쓰던 시절엔 02-29 가 03-01 로
  // normalize 돼 다음 날이 03-02 가 됐다.
  const shift = (n: number) => {
    const p = shiftUrlDate(urlDate, n)
    return p ? `<a href="/day/${escPath(p)}">${koreanDate(p)}</a>` : ''
  }

  return `<nav><a href="/">홈</a> / ${koreanDate(urlDate)}</nav>` +
    `<h1>${koreanDate(urlDate)}은 무슨 날?</h1>` +
    (items.length
      ? `<p>${koreanDate(urlDate)}에 있는 기념일 ${items.length}개를 모았어요.</p><ul>${rows}</ul>`
      : `<p>${koreanDate(urlDate)}에 등록된 기념일이 아직 없어요.</p>`) +
    `<nav>${shift(-1)} · <a href="/calendar">달력 전체</a> · ${shift(1)}</nav>`
}

/**
 * JSON-LD 직렬화.
 *
 * safeJsonLd 가 `<`, `>`, `&`, U+2028/29 를 유니코드로 escape 한다. 그냥
 * JSON.stringify 하면 데이터에 든 `</script>` 가 script 요소를 닫고 뒤따르는
 * 내용이 새 스크립트로 실행된다 — 외부 뉴스 요약을 데이터에 넣는 파이프라인이
 * 있어 "우리가 쓴 값만 들어간다"고 가정할 수 없다.
 */
function jsonLd(t: PrerenderTarget, url: string, description: string): string {
  const shown = t.displayDate ?? t.urlDate
  const data =
    t.kind === 'detail' && t.anniversary
      ? anniversaryJsonLd(t.anniversary, t.urlDate, url, description, shown)
      : dateHubJsonLd(t.urlDate, url, description)
  return safeJsonLd(data)
}

export function prerender(): Plugin {
  let outDir = 'dist'
  return {
    name: 'annical-prerender',
    apply: 'build',
    configResolved(c) {
      outDir = c.build.outDir
    },
    closeBundle() {
      const shell = readFileSync(join(outDir, 'index.html'), 'utf-8')
      const targets = buildTargets()
      const routes = loadRoutes()
      // 어떤 경로도 이 밖으로 나가면 안 된다. '../..' 가 든 slug 가 저장소
      // 파일을 덮어쓰는 것을 막는 마지막 방어선이다.
      const outRoot = resolve(outDir)

      const byDate = new Map<string, Anniversary[]>()
      for (const t of targets) {
        if (t.kind === 'hub') byDate.set(t.urlDate, t.items ?? [])
      }

      for (const t of targets) {
        const url = `${SITE_URL}${t.path}`
        const isDetail = t.kind === 'detail' && !!t.anniversary
        // 사람이 읽는 문구에는 그 해 실제 발생일을 쓴다. canonical 주소만
        // URL 에 박힌 고정 날짜를 그대로 유지한다(색인 보존).
        const shown = t.displayDate ?? t.urlDate
        const title = isDetail
          ? anniversaryTitle(t.anniversary!, t.urlDate, shown)
          : dateHubTitle(t.urlDate)
        const description = isDetail
          ? anniversaryDescription(t.anniversary!, t.urlDate, shown)
          : dateHubDescription(t.urlDate, t.items ?? [])
        const fullTitle = `${title} | ${SITE_NAME}`
        const body = isDetail
          ? detailBody(
              t.anniversary!,
              shown,
              (byDate.get(shown) ?? []).filter((a) => a.id !== t.anniversary!.id),
              routes,
            )
          : hubBody(t.urlDate, t.items ?? [], routes)

        const html = shell
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
          .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(description)}" />`)
          // keywords 는 구글·네이버 모두 랭킹에 쓰지 않는다. 상세 페이지에서는 뺀다.
          .replace(/<meta\s+name="keywords"[\s\S]*?\/>/, '')
          .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}" />`)
          .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${isDetail ? 'article' : 'website'}" />`)
          .replace(/<meta property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
          .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(description)}" />`)
          .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${esc(url)}" />`)
          .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${esc(OG_IMAGE)}" />`)
          .replace(/<meta name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
          .replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(description)}" />`)
          .replace('</head>', `  <script type="application/ld+json" id="ld-page">${jsonLd(t, url, description)}</script>\n  </head>`)
          .replace('<div id="app"></div>', `<div id="app">${body}</div>`)

        const file = resolve(outDir, t.path.replace(/^\//, ''), 'index.html')
        if (file !== join(outRoot, 'index.html') && !file.startsWith(outRoot + sep)) {
          throw new Error(
            `프리렌더 경로가 outDir 을 벗어납니다: ${t.path} → ${file}. ` +
              'routes.json 의 slug/urlDate 를 확인하세요.',
          )
        }
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html, 'utf-8')
      }

      // 정적으로 매칭되지 않는 주소용 404 페이지.
      //
      // vercel.json 의 rewrite 를 /calendar·/export 로 좁혔기 때문에, 그 밖의
      // 없는 주소는 여기로 떨어지며 HTTP 상태도 진짜 404 가 된다. 예전에는
      // 모든 경로를 index.html 로 rewrite 해서 없는 페이지도 200 을 냈고,
      // 검색엔진이 그것들을 정상 페이지로 색인할 수 있었다.
      const notFoundHtml = shell
        .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(`페이지를 찾을 수 없어요 | ${SITE_NAME}`)}</title>`)
        .replace(/<link rel="canonical"[^>]*>/, '')
        .replace('</head>', '  <meta name="robots" content="noindex, follow" />\n  </head>')
        .replace(
          '<div id="app"></div>',
          '<div id="app"><h1>찾는 페이지가 없어요</h1>' +
            '<p>주소가 바뀌었거나 잘못 입력했을 수 있어요.</p>' +
            '<nav><a href="/">오늘의 기념일</a> · <a href="/calendar">달력에서 찾아보기</a></nav></div>',
        )
      writeFileSync(join(outDir, '404.html'), notFoundHtml, 'utf-8')

      const detail = targets.filter((t) => t.kind === 'detail').length
      this.info?.(`프리렌더: 상세 ${detail}개 + 날짜 허브 ${targets.length - detail}개 = ${targets.length}개 (+ 404.html)`)
    },
  }
}
