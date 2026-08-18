// 빌드 후 기념일 상세·날짜 허브를 정적 HTML 로 찍어내는 Vite 플러그인.
//
// 왜 필요한가: 이 앱은 CSR SPA 라 index.html 본문이 <div id="app"></div> 뿐이다.
// 구글은 JS 를 실행해 주지만 네이버 크롤러(Yeti)는 사실상 실행하지 않아, 검색엔진에
// 빈 페이지로 보인다. 각 기념일의 본문을 HTML 에 직접 박아두면 JS 없이도 읽힌다.
// Vue 는 부팅하면서 #app 안을 자기 렌더 결과로 교체하므로 사용자 경험은 그대로다.
//
// title/description 문구는 src/seo/head.ts 의 함수를 그대로 import 해서 쓴다.
// 정적 HTML 과 SPA 가 서로 다른 제목을 내는 사고를 막기 위함이다.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
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
} from '../../src/seo/meta'
import { buildTargets, type PrerenderTarget } from './routes'

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** 상세 페이지 본문 — Vue 가 그리는 내용과 같은 텍스트를 같은 순서로. */
function detailBody(anv: Anniversary, urlDate: string, sameDay: Anniversary[],
                    routes: Record<string, { slug: string; urlDate: string }>): string {
  const link = (a: Anniversary) => {
    const r = routes[a.id]
    return r ? `<li><a href="/day/${r.urlDate}/${r.slug}">${esc(a.name)}</a></li>` : ''
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
    ? `<p>출처 <a href="${esc(anv.sourceUrl)}" rel="noopener nofollow">${esc(anv.sourceUrl)}</a></p>` : ''
  const others = sameDay.length
    ? `<section><h2>${koreanDate(urlDate)}의 다른 기념일</h2><ul>${sameDay.map(link).join('')}</ul></section>` : ''

  return `<nav><a href="/">홈</a> / <a href="/day/${urlDate}">${koreanDate(urlDate)}</a></nav>` +
    `<article><h1>${esc(anv.name)}</h1><p>${koreanDate(urlDate)}</p>` +
    `${story}${quotes}${tags}${source}</article>${others}` +
    `<p><a href="/day/${urlDate}">${koreanDate(urlDate)}은 무슨 날인지 전부 보기</a></p>`
}

/** 날짜 허브 본문. */
function hubBody(urlDate: string, items: Anniversary[],
                 routes: Record<string, { slug: string; urlDate: string }>): string {
  const rows = items.map((a) => {
    const r = routes[a.id]
    if (!r) return ''
    const lead = a.storytelling.origin?.trim()
    return `<li><a href="/day/${r.urlDate}/${r.slug}"><h2>${esc(a.name)}</h2></a>` +
      (lead ? `<p>${esc(lead)}</p>` : '') + '</li>'
  }).join('')

  const [mm, dd] = urlDate.split('-').map(Number)
  const base = new Date(2026, mm - 1, dd)
  const shift = (n: number) => {
    const d = new Date(base)
    d.setDate(d.getDate() + n)
    const p = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    return `<a href="/day/${p}">${d.getMonth() + 1}월 ${d.getDate()}일</a>`
  }

  return `<nav><a href="/">홈</a> / ${koreanDate(urlDate)}</nav>` +
    `<h1>${koreanDate(urlDate)}은 무슨 날?</h1>` +
    (items.length
      ? `<p>${koreanDate(urlDate)}에 있는 기념일 ${items.length}개를 모았어요.</p><ul>${rows}</ul>`
      : `<p>${koreanDate(urlDate)}에 등록된 기념일이 아직 없어요.</p>`) +
    `<nav>${shift(-1)} · <a href="/calendar">달력 전체</a> · ${shift(1)}</nav>`
}

function jsonLd(t: PrerenderTarget, url: string, description: string): string {
  const data =
    t.kind === 'detail' && t.anniversary
      ? anniversaryJsonLd(t.anniversary, t.urlDate, url, description)
      : dateHubJsonLd(t.urlDate, url, description)
  return JSON.stringify(data)
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
      const routes = JSON.parse(
        readFileSync(new URL('../../src/data/routes.json', import.meta.url), 'utf-8'),
      ) as Record<string, { slug: string; urlDate: string }>

      const byDate = new Map<string, Anniversary[]>()
      for (const t of targets) {
        if (t.kind === 'hub') byDate.set(t.urlDate, t.items ?? [])
      }

      for (const t of targets) {
        const url = `${SITE_URL}${t.path}`
        const isDetail = t.kind === 'detail' && !!t.anniversary
        const title = isDetail
          ? anniversaryTitle(t.anniversary!, t.urlDate)
          : dateHubTitle(t.urlDate)
        const description = isDetail
          ? anniversaryDescription(t.anniversary!, t.urlDate)
          : dateHubDescription(t.urlDate, t.items ?? [])
        const fullTitle = `${title} | ${SITE_NAME}`
        const body = isDetail
          ? detailBody(
              t.anniversary!,
              t.urlDate,
              (byDate.get(t.urlDate) ?? []).filter((a) => a.id !== t.anniversary!.id),
              routes,
            )
          : hubBody(t.urlDate, t.items ?? [], routes)

        const html = shell
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
          .replace(/<meta\s+name="description"[\s\S]*?\/>/, `<meta name="description" content="${esc(description)}" />`)
          // keywords 는 구글·네이버 모두 랭킹에 쓰지 않는다. 상세 페이지에서는 뺀다.
          .replace(/<meta\s+name="keywords"[\s\S]*?\/>/, '')
          .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${url}" />`)
          .replace(/<meta property="og:type"[^>]*>/, `<meta property="og:type" content="${isDetail ? 'article' : 'website'}" />`)
          .replace(/<meta property="og:title"[\s\S]*?\/>/, `<meta property="og:title" content="${esc(fullTitle)}" />`)
          .replace(/<meta\s+property="og:description"[\s\S]*?\/>/, `<meta property="og:description" content="${esc(description)}" />`)
          .replace(/<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${url}" />`)
          .replace(/<meta property="og:image"[^>]*>/, `<meta property="og:image" content="${OG_IMAGE}" />`)
          .replace(/<meta name="twitter:title"[\s\S]*?\/>/, `<meta name="twitter:title" content="${esc(fullTitle)}" />`)
          .replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/, `<meta name="twitter:description" content="${esc(description)}" />`)
          .replace('</head>', `  <script type="application/ld+json" id="ld-page">${jsonLd(t, url, description)}</script>\n  </head>`)
          .replace('<div id="app"></div>', `<div id="app">${body}</div>`)

        const file = join(outDir, t.path.replace(/^\//, ''), 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html, 'utf-8')
      }

      const detail = targets.filter((t) => t.kind === 'detail').length
      this.info?.(`프리렌더: 상세 ${detail}개 + 날짜 허브 ${targets.length - detail}개 = ${targets.length}개`)
    },
  }
}
