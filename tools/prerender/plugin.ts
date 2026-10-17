// 빌드 후 모든 공개 페이지를 HTML 로 찍어내는 Vite 플러그인.
//
// 왜 필요한가: 이 앱은 SPA 라 index.html 본문이 <div id="app"></div> 뿐이다. 네이버
// 크롤러(Yeti)·AI 크롤러는 JS 를 실행하지 않아 빈 페이지로 본다. 그래서 빌드 때 앱을
// Vue 로 직접 렌더해(src/entry-server.ts) 그 HTML 을 박아 둔다. 브라우저는 이 DOM 을
// 이어받으므로(hydrate) 새로고침 때 화면이 바뀌어 보이지도 않는다.
//
// <head> 의 title/description/JSON-LD 는 여기서 채운다. 문구는 src/seo/meta.ts 의
// 함수를 그대로 써서 정적 HTML 과 SPA 가 서로 다른 제목을 내는 사고를 막는다.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build, type Plugin } from 'vite'
import {
  SITE_NAME,
  SITE_URL,
  anniversaryDescription,
  anniversaryJsonLd,
  anniversaryTitle,
  dateHubDescription,
  dateHubJsonLd,
  dateHubTitle,
  safeJsonLd,
} from '../../src/seo/meta'
import { ogImageUrl, type StaticPage } from '../../src/seo/og'
import { PAGE_META } from '../../src/seo/pages'
import { buildSitemap, buildTargets, loadLastmod, loadRoutes, type PrerenderTarget } from './routes'

/** HTML 텍스트·속성 문맥 이스케이프. 속성은 항상 큰따옴표로 감싼다. */
const esc = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/** 이미지 메타는 정적 페이지와 상세/허브가 같은 규칙으로 갱신한다. */
function imageMeta(html: string, image: string, alt: string): string {
  for (const [attr, key, value] of [
    ['property', 'og:image', image],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['property', 'og:image:alt', alt],
    ['name', 'twitter:image', image],
    ['name', 'twitter:image:alt', alt],
  ]) {
    const re = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`)
    const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`
    html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', `${tag}\n</head>`)
  }
  return html
}

/**
 * 앱을 SSR 용으로 따로 빌드해 render() 를 돌려준다.
 * 같은 vite.config 를 쓰되 이 플러그인은 SSR 빌드에서 꺼진다(apply).
 */
/** src/entry-server.ts 의 render() 결과. 앱 코드를 노드 타입 검사에 끌어오지 않으려고 따로 적는다. */
interface Rendered {
  html: string
  modules: string[]
}

async function loadRenderer(root: string): Promise<(url: string) => Promise<Rendered>> {
  const out = join(root, 'node_modules/.annical-ssr')
  await build({
    root,
    logLevel: 'warn',
    build: { ssr: 'src/entry-server.ts', outDir: out, emptyOutDir: true, manifest: false },
  })
  const mod = await import(`${pathToFileURL(join(out, 'entry-server.js')).href}?t=${Date.now()}`)
  return mod.render
}

/**
 * JSON-LD 직렬화.
 *
 * safeJsonLd 가 `<`, `>`, `&`, U+2028/29 를 유니코드로 escape 한다. 그냥
 * JSON.stringify 하면 데이터에 든 `</script>` 가 script 요소를 닫고 뒤따르는
 * 내용이 새 스크립트로 실행된다 — 외부 뉴스 요약을 데이터에 넣는 파이프라인이
 * 있어 "우리가 쓴 값만 들어간다"고 가정할 수 없다.
 */
function jsonLd(t: PrerenderTarget, url: string, description: string, slug = ''): string {
  const shown = t.displayDate ?? t.urlDate
  const dates = t.anniversary ? loadLastmod()[t.anniversary.id] : undefined
  const data =
    t.kind === 'detail' && t.anniversary
      ? anniversaryJsonLd(t.anniversary, t.urlDate, url, description, shown, {
          image: ogImageUrl({ kind: 'detail', date: t.urlDate, slug }),
          published: dates?.published,
          modified: dates?.modified,
        })
      : dateHubJsonLd(t.urlDate, url, description)
  return safeJsonLd(data)
}

export function prerender(): Plugin {
  let outDir = 'dist'
  let root = process.cwd()
  return {
    name: 'annical-prerender',
    apply: (config, env) => env.command === 'build' && !config.build?.ssr,
    configResolved(c) {
      outDir = resolve(c.root, c.build.outDir)
      root = c.root
    },
    async closeBundle() {
      const shell = readFileSync(join(outDir, 'index.html'), 'utf-8')
      const render = await loadRenderer(root)
      // 소스 모듈 → 빌드된 CSS·JS. 페이지가 쓴 화면의 CSS 를 <head> 에 걸어야
      // JS 가 돌기 전에도 SSR HTML 이 제 모양으로 보인다. 공용 CSS(feed.css 등)는
      // 따로 청크로 빠지므로 import 를 따라가며 모은다. 배포물에는 남기지 않는다.
      const manifestDir = join(outDir, '.vite')
      const manifest = JSON.parse(
        readFileSync(join(manifestDir, 'manifest.json'), 'utf-8'),
      ) as Record<string, { file: string; css?: string[]; imports?: string[] }>
      rmSync(manifestDir, { recursive: true, force: true })
      const assetsOf = (key: string, seen = new Set<string>()): string[] => {
        const c = manifest[key]
        if (!c || seen.has(key)) return []
        seen.add(key)
        return [
          `/${c.file}`,
          ...(c.css ?? []).map((f) => `/${f}`),
          ...(c.imports ?? []).flatMap((k) => assetsOf(k, seen)),
        ]
      }
      const targets = buildTargets()
      const routes = loadRoutes()

      /** shell 의 #app 을 그 경로의 SSR 결과로 채우고, 그 화면의 CSS 를 <head> 에 건다. */
      const withApp = async (html: string, path: string): Promise<string> => {
        const { html: body, modules } = await render(path)
        // CSS 만 건다. 첫 화면은 이 HTML 과 CSS 로 다 그려지고, JS·월 데이터는 hydrate 에만
        // 필요하다. 그것까지 <head> 에서 미리 받으면 CSS 와 대역폭을 다퉈 첫 화면이 늦어진다
        // (홈 Lighthouse FCP 0.9s → 1.5~2.9s 로 측정됐다).
        const links = [...new Set(modules.flatMap((m) => assetsOf(m)))]
          .filter((f) => f.endsWith('.css') && !html.includes(`"${f}"`))
          .map((f) => `  <link rel="stylesheet" href="${esc(f)}" />`)
          .join('\n')
        return html
          .replace('</head>', `${links}\n  </head>`)
          .replace('<div id="app"></div>', () => `<div id="app">${body}</div>`)
      }
      // 어떤 경로도 이 밖으로 나가면 안 된다. '../..' 가 든 slug 가 저장소
      // 파일을 덮어쓰는 것을 막는 마지막 방어선이다.
      const outRoot = resolve(outDir)

      // 정적 페이지도 제목·설명·이미지와 읽을 수 있는 본문을 미리 만든다.
      for (const page of Object.keys(PAGE_META) as StaticPage[]) {
        const meta = PAGE_META[page]
        const path = page === 'home' ? '/' : `/${page}`
        let html = shell
          .replace(
            /<title>[\s\S]*?<\/title>/,
            `<title>${esc(meta.title + ' | ' + SITE_NAME)}</title>`,
          )
          .replace(
            /<link rel="canonical"[^>]*>/,
            `<link rel="canonical" href="${SITE_URL}${path}" />`,
          )
          .replace(
            /<meta property="og:url"[^>]*>/,
            `<meta property="og:url" content="${SITE_URL}${path}" />`,
          )
        for (const [attr, key, value] of [
          ['name', 'description', meta.description],
          ['name', 'keywords', meta.keywords],
          ['property', 'og:title', meta.title + ' | ' + SITE_NAME],
          ['property', 'og:description', meta.description],
          ['name', 'twitter:title', meta.title + ' | ' + SITE_NAME],
          ['name', 'twitter:description', meta.description],
        ])
          html = html.replace(
            new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`),
            `<meta ${attr}="${key}" content="${esc(value)}" />`,
          )
        html = imageMeta(html, ogImageUrl(page), meta.title)
        html = await withApp(html, path)
        // Vercel 은 rewrite 전에 파일시스템을 확인하므로 공유 경로에 파일을 두면
        // 봇 UA rewrite 가 실행되지 않는다. 일반 요청만 /_pages HTML 로 rewrite 한다.
        const file =
          page === 'birthday' || page === 'together'
            ? join(outDir, '_pages', `${page}.html`)
            : join(outDir, page === 'home' ? '' : page, 'index.html')
        mkdirSync(dirname(file), { recursive: true })
        writeFileSync(file, html, 'utf-8')
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
        let html = shell
          .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(fullTitle)}</title>`)
          .replace(
            /<meta\s+name="description"[\s\S]*?\/>/,
            `<meta name="description" content="${esc(description)}" />`,
          )
          // keywords 는 구글·네이버 모두 랭킹에 쓰지 않는다. 상세 페이지에서는 뺀다.
          .replace(/<meta\s+name="keywords"[\s\S]*?\/>/, '')
          .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${esc(url)}" />`)
          .replace(
            /<meta property="og:type"[^>]*>/,
            `<meta property="og:type" content="${isDetail ? 'article' : 'website'}" />`,
          )
          .replace(
            /<meta property="og:title"[\s\S]*?\/>/,
            `<meta property="og:title" content="${esc(fullTitle)}" />`,
          )
          .replace(
            /<meta\s+property="og:description"[\s\S]*?\/>/,
            `<meta property="og:description" content="${esc(description)}" />`,
          )
          .replace(
            /<meta property="og:url"[^>]*>/,
            `<meta property="og:url" content="${esc(url)}" />`,
          )
          .replace(
            /<meta name="twitter:title"[\s\S]*?\/>/,
            `<meta name="twitter:title" content="${esc(fullTitle)}" />`,
          )
          .replace(
            /<meta\s+name="twitter:description"[\s\S]*?\/>/,
            `<meta name="twitter:description" content="${esc(description)}" />`,
          )
          .replace(
            '</head>',
            `  <script type="application/ld+json" id="ld-page" data-prerendered="${esc(t.path)}">${jsonLd(t, url, description, isDetail ? routes[t.anniversary!.id].slug : '')}</script>\n  </head>`,
          )

        html = await withApp(html, t.path)
        html = imageMeta(
          html,
          ogImageUrl(
            isDetail
              ? { kind: 'detail', date: t.urlDate, slug: routes[t.anniversary!.id].slug }
              : { kind: 'hub', date: t.urlDate },
          ),
          title,
        )

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
      // vercel.json 의 rewrite 를 소수의 정적 SPA 페이지로 좁혔기 때문에, 그 밖의
      // 없는 주소는 여기로 떨어지며 HTTP 상태도 진짜 404 가 된다. 예전에는
      // 모든 경로를 index.html 로 rewrite 해서 없는 페이지도 200 을 냈고,
      // 검색엔진이 그것들을 정상 페이지로 색인할 수 있었다.
      const notFoundHtml = await withApp(
        imageMeta(shell, `${SITE_URL}/og-cover.png`, '페이지를 찾을 수 없어요')
          .replace(
            /<title>[\s\S]*?<\/title>/,
            `<title>${esc(`페이지를 찾을 수 없어요 | ${SITE_NAME}`)}</title>`,
          )
          .replace(/<link rel="canonical"[^>]*>/, '')
          .replace('</head>', '  <meta name="robots" content="noindex, follow" />\n  </head>'),
        '/404',
      )
      writeFileSync(join(outDir, '404.html'), notFoundHtml, 'utf-8')

      // 사이트맵. 프리렌더가 만든 경로가 곧 색인 대상이다 — 내부 rewrite 대상
      // (/_pages/*)과 도구 페이지(/export)는 여기 없으니 따로 걸러낼 것도 없다.
      const urls = Object.entries(buildSitemap(targets))
        .map(([p, d]) => `<url><loc>${esc(SITE_URL + p)}</loc><lastmod>${d}</lastmod></url>`)
        .join('')
      writeFileSync(
        join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>\n`,
        'utf-8',
      )

      const detail = targets.filter((t) => t.kind === 'detail').length
      this.info?.(
        `프리렌더: 상세 ${detail}개 + 날짜 허브 ${targets.length - detail}개 = ${targets.length}개 (+ 404.html)`,
      )
    },
  }
}
