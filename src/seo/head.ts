// 페이지별 <head> 메타 주입 유틸 — 의존성 없는 경량 구현.
// SPA 라우트마다 고유한 title·description·OG 태그를 부여해 구글·네이버가
// 각 페이지를 구분해 색인하도록 한다. router.afterEach 에서 호출된다.
import type { RouteLocationNormalized } from 'vue-router'

export const SITE_NAME = '기념일 만물상'
export const SITE_URL = 'https://annical.vercel.app'
const OG_IMAGE = `${SITE_URL}/og-cover.png`

// 라우트에 메타가 없을 때 쓰는 홈 기준 기본값.
const DEFAULT_DESCRIPTION =
  '오늘은 무슨 날? 전 세계 1,200여 개의 기념일을 매일 큐레이션. ' +
  '세계 ~의 날, 음식·역사·이색 기념일과 D-day, 기념일 캘린더·검색을 한곳에서.'

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

/**
 * 현재 라우트에 맞춰 document.title 과 description/OG/Twitter/canonical 메타를 갱신.
 * 라우트 meta 가 비어 있으면 홈 기준 기본값으로 폴백한다.
 */
export function applyRouteMeta(to: RouteLocationNormalized): void {
  const pageTitle = (to.meta.title as string | undefined) ?? ''
  const description =
    (to.meta.description as string | undefined) ?? DEFAULT_DESCRIPTION
  const keywords = to.meta.keywords as string | undefined

  const fullTitle = pageTitle ? `${pageTitle} | ${SITE_NAME}` : SITE_NAME
  const url = `${SITE_URL}${to.path === '/' ? '' : to.path}`

  document.title = fullTitle

  upsertMeta('name', 'description', description)
  if (keywords) upsertMeta('name', 'keywords', keywords)
  upsertCanonical(url || SITE_URL)

  upsertMeta('property', 'og:title', fullTitle)
  upsertMeta('property', 'og:description', description)
  upsertMeta('property', 'og:url', url || SITE_URL)
  upsertMeta('property', 'og:image', OG_IMAGE)

  upsertMeta('name', 'twitter:title', fullTitle)
  upsertMeta('name', 'twitter:description', description)
  upsertMeta('name', 'twitter:image', OG_IMAGE)
}
