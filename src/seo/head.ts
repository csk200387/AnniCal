// 페이지별 <head> 메타 주입 유틸 — 의존성 없는 경량 구현.
// SPA 라우트마다 고유한 title·description·OG 태그를 부여해 구글·네이버가
// 각 페이지를 구분해 색인하도록 한다. router.afterEach 에서 호출된다.
//
// 문구와 JSON-LD 를 만드는 순수 함수는 src/seo/meta.ts 에 있다.
// 빌드 타임 프리렌더(tools/prerender/plugin.ts)가 같은 함수를 쓰기 때문에,
// 정적 HTML 과 SPA 의 메타는 항상 일치한다.
import type { RouteLocationNormalized } from 'vue-router'
import type { Anniversary } from '@/types/anniversary'
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
} from './meta'

export { SITE_NAME, SITE_URL }

/** 상세·허브 페이지가 주입하는 JSON-LD <script> 의 id. */
const LD_ID = 'ld-page'

// 라우트에 메타가 없을 때 쓰는 홈 기준 기본값.
const DEFAULT_DESCRIPTION =
  '오늘은 무슨 날? 세계 곳곳의 특이한 기념일과 이색 기념일을 ' +
  '월별로 모아 매일 큐레이션해요.'

// name= 또는 property= 기준으로 <meta> 를 찾아 없으면 만들고 content 를 갱신.
function upsertMeta(
  selectorAttr: 'name' | 'property',
  key: string,
  content: string,
): void {
  const selector = `meta[${selectorAttr}="${key}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(selectorAttr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// <link rel="canonical"> 갱신(없으면 생성).
function upsertCanonical(href: string): void {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/** id 로 구분되는 JSON-LD <script> 를 없으면 만들고 있으면 갱신. */
function upsertJsonLd(data: unknown): void {
  let el = document.getElementById(LD_ID) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = LD_ID
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

/** title·description·canonical·OG·Twitter 를 한 번에 갱신하고 정규 URL 을 돌려준다. */
function applyPageMeta(title: string, description: string, path: string): string {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
  const url = `${SITE_URL}${path === '/' ? '' : path}` || SITE_URL

  document.title = fullTitle
  upsertMeta('name', 'description', description)
  upsertCanonical(url)
  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url)
  upsertMeta('property', 'og:image', OG_IMAGE)
  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', OG_IMAGE)
  return url
}

/**
 * 현재 라우트에 맞춰 정적 페이지의 메타를 갱신.
 * 라우트 meta 가 비어 있으면 홈 기준 기본값으로 폴백한다.
 */
export function applyRouteMeta(to: RouteLocationNormalized): void {
  const description = to.meta.description ?? DEFAULT_DESCRIPTION
  applyPageMeta(to.meta.title ?? '', description, to.path)

  if (to.meta.keywords) upsertMeta('name', 'keywords', to.meta.keywords)

  // 상세/허브에서 넘어온 경우 그 페이지가 남긴 흔적을 되돌린다.
  upsertMeta('property', 'og:type', 'website')
  document.getElementById(LD_ID)?.remove()
}

/** 기념일 상세 페이지 — 데이터에서 메타와 Article/Breadcrumb JSON-LD 를 만든다. */
export function applyAnniversaryMeta(anv: Anniversary, path: string): void {
  const urlDate = path.split('/')[2] ?? ''
  const description = anniversaryDescription(anv, urlDate)
  const url = applyPageMeta(anniversaryTitle(anv, urlDate), description, path)
  upsertMeta('property', 'og:type', 'article')
  upsertJsonLd(anniversaryJsonLd(anv, urlDate, url, description))
}

/** 날짜 허브 페이지 — CollectionPage/Breadcrumb JSON-LD. */
export function applyDateHubMeta(urlDate: string, items: Anniversary[]): void {
  const description = dateHubDescription(urlDate, items)
  const url = applyPageMeta(dateHubTitle(urlDate), description, `/day/${urlDate}`)
  upsertMeta('property', 'og:type', 'website')
  upsertJsonLd(dateHubJsonLd(urlDate, url, description))
}
