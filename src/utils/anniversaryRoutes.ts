// 기념일 ↔ URL 매핑. routes.json 은 tools/slugs/generate_slugs.py 가 생성한다.
// URL 구조: /day/{MM-DD}/{slug}  (상세)  ·  /day/{MM-DD}  (날짜 허브)
//
// urlDate 는 "URL 에 고정된" MM-DD 다. annual-nth-weekday 처럼 매년 날짜가
// 바뀌는 기념일도 URL 은 절대 흔들리지 않도록 기준 연도(2026) 발생일로 못박았다.
// 따라서 화면에 표시할 실제 날짜는 urlDate 가 아니라 dateUtils 로 계산해야 한다.
import routesJson from '@/data/routes.json'
import type { Anniversary } from '@/types/anniversary'

export interface AnniversaryRoute {
  slug: string
  urlDate: string
}

const routes = routesJson as Record<string, AnniversaryRoute>

/** (urlDate, slug) → id 역방향 조회. 라우트 파라미터로 기념일을 찾을 때 쓴다. */
const idByPathKey = new Map(
  Object.entries(routes).map(([id, r]) => [`${r.urlDate}/${r.slug}`, id]),
)

export function routeForId(id: string): AnniversaryRoute | null {
  return routes[id] ?? null
}

/** 기념일 상세 경로. 매핑이 없으면 null (라우트 생성 대상에서 제외). */
export function pathForId(id: string): string | null {
  const r = routes[id]
  return r ? `/day/${r.urlDate}/${r.slug}` : null
}

export function pathFor(anv: Anniversary): string | null {
  return pathForId(anv.id)
}

/** 날짜 허브 경로. */
export function datePath(urlDate: string): string {
  return `/day/${urlDate}`
}

export function idForPath(urlDate: string, slug: string): string | null {
  return idByPathKey.get(`${urlDate}/${slug}`) ?? null
}

/** 해당 urlDate 에 걸린 모든 기념일 id. 날짜 허브가 목록을 만들 때 쓴다. */
export function idsForDate(urlDate: string): string[] {
  return Object.entries(routes)
    .filter(([, r]) => r.urlDate === urlDate)
    .map(([id]) => id)
}

/** 프리렌더·사이트맵 생성용 전체 목록. */
export function allRoutes(): Array<{ id: string } & AnniversaryRoute> {
  return Object.entries(routes).map(([id, r]) => ({ id, ...r }))
}

/** URL 파라미터 검증 — "03-22" 형태인지. */
export function isValidUrlDate(v: string): boolean {
  return /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(v)
}
