import { SITE_URL } from './meta.js'
import { todayInSiteZone } from '../utils/clock.js'

// 디자인·폰트 변경 시 버전을 올려 CDN의 이전 이미지를 무효화한다.
export const OG_VERSION = '1'
export type StaticPage = 'home' | 'calendar' | 'export' | 'popular' | 'birthday' | 'together'
export type OgQuery =
  | { kind: 'detail'; date: string; slug: string; year?: number }
  | { kind: 'hub'; date: string; year?: number }
  | { kind: 'birthday'; date: string; pick?: string; year?: number }
  | { kind: 'together'; date: string; m: string; pick?: string }

/** 프리렌더·SPA·봇 HTML이 같은 주소 생성기를 사용한다. */
export function ogImageUrl(query: OgQuery | StaticPage): string {
  if (typeof query === 'string') return `${SITE_URL}/og/${query}.png?v=${OG_VERSION}`
  // 실제 발생일이 해마다 바뀌므로 연도도 CDN URL에 넣는다.
  const normalized = query.kind === 'together' ? query : { ...query, year: query.year ?? todayInSiteZone().getFullYear() }
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(normalized)) if (value !== undefined) params.set(key, String(value))
  params.set('v', OG_VERSION)
  return `${SITE_URL}/api/og?${params}`
}
