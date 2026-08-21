// 기념일 ↔ URL 매핑. routes.json 은 tools/slugs/generate_slugs.py 가 생성한다.
// URL 구조: /day/{MM-DD}/{slug}  (상세)  ·  /day/{MM-DD}  (날짜 허브)
//
// ## urlDate 는 날짜가 아니라 주소다
//
// urlDate 는 URL 에 못박힌 MM-DD 다. annual-nth-weekday 처럼 매년 날짜가 바뀌는
// 기념일도 주소는 흔들리면 안 되므로 기준 연도(2026) 발생일로 고정했다. 색인이
// 쌓이는 자산이라 한 번 정해지면 바꾸지 않는다.
//
// 그래서 urlDate 는 **고유 식별자일 뿐 그 기념일이 실제로 일어나는 날이 아니다.**
// 어머니의 날 주소는 영원히 /day/05-10/... 이지만 2027년 실제 날짜는 5월 9일이다.
// 화면에 보이는 날짜, 날짜 허브 소속, SEO 문구는 전부 dateUtils 의
// resolveOccurrence 로 그 해의 실제 날짜를 구해서 써야 한다.
//
// 이 파일이 제공하는 것은 "주소 ↔ id" 변환뿐이다. 날짜 질문은 dateUtils 에게.
import routesJson from '@/data/routes.json'
import type { Anniversary } from '@/types/anniversary'

export interface AnniversaryRoute {
  slug: string
  /** URL 에 박힌 고정 MM-DD. 실제 발생일이 아니다 — 위 주석 참고. */
  urlDate: string
}

const routes = routesJson as Record<string, AnniversaryRoute>

/** (urlDate, slug) → id 역방향 조회. 라우트 파라미터로 기념일을 찾을 때 쓴다. */
const idByPathKey = new Map(
  Object.entries(routes).map(([id, r]) => [`${r.urlDate}/${r.slug}`, id]),
)

/**
 * 달력에 실재하는 366개 "MM-DD" 를 1월 1일부터 순서대로.
 * 윤년(2024)을 기준으로 만들어 02-29 를 포함한다.
 *
 * URL 검증과 앞뒤 날짜 이동이 모두 이 배열 하나를 본다. 정규식만 쓰면 02-31 이나
 * 04-31 같은 없는 날짜가 통과하고, Date 산술로 이웃을 구하면 비윤년을 기준 삼는
 * 바람에 /day/02-29 의 다음 날이 3월 2일이 되는 사고가 난다.
 */
const ORDINAL_DATES: string[] = (() => {
  const out: string[] = []
  for (let m = 1; m <= 12; m += 1) {
    const daysInMonth = new Date(2024, m, 0).getDate() // 2024 = 윤년
    for (let d = 1; d <= daysInMonth; d += 1) {
      out.push(`${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
  }
  return out
})()

const ORDINAL_INDEX = new Map(ORDINAL_DATES.map((d, i) => [d, i]))

/** 366개 유효 MM-DD 전체. 프리렌더·사이트맵이 허브 목록을 만들 때 쓴다. */
export function allUrlDates(): readonly string[] {
  return ORDINAL_DATES
}

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

/** 프리렌더·사이트맵 생성용 전체 목록. */
export function allRoutes(): Array<{ id: string } & AnniversaryRoute> {
  return Object.entries(routes).map(([id, r]) => ({ id, ...r }))
}

/** URL 파라미터 검증 — 달력에 실제로 있는 "03-22" 형태인지. */
export function isValidUrlDate(v: string): boolean {
  return ORDINAL_INDEX.has(v)
}

/**
 * 앞뒤 날짜 — 366일 고리를 따라 순환한다.
 * 12-31 의 다음은 01-01, 01-01 의 이전은 12-31.
 */
export function shiftUrlDate(urlDate: string, days: number): string | null {
  const i = ORDINAL_INDEX.get(urlDate)
  if (i === undefined) return null
  const n = ORDINAL_DATES.length
  return ORDINAL_DATES[(((i + days) % n) + n) % n]
}

/** "03-22" → "3월 22일". 유효하지 않으면 null. */
export function koreanUrlDate(urlDate: string): string | null {
  if (!isValidUrlDate(urlDate)) return null
  const [mm, dd] = urlDate.split('-').map(Number)
  return `${mm}월 ${dd}일`
}
