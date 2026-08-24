// Vercel 서버리스 함수 — "살아있는 URL"(캘린더 구독 피드).
// 캘린더 앱이 주기적으로 이 엔드포인트를 다시 받아오므로, 데이터가 추가/배포되면
// 구독자 캘린더가 자동으로 갱신된다. (정적 .ics 다운로드와 달리 스냅샷이 아님)
//
// 예) webcal://annical.vercel.app/api/calendar
//     webcal://annical.vercel.app/api/calendar?categories=general,holiday
//
// ## 이 엔드포인트는 인증 없이 공개된다
//
// 요청 하나가 1,400건을 ICS 로 직렬화해 1MB 넘는 응답을 만든다. 방치하면 쿼리를
// 조금씩 바꾸는 것만으로 CDN 캐시를 우회해 서버리스 호출·CPU·egress 를 마음대로
// 늘릴 수 있다. 그래서 아래를 강제한다.
//
//   - GET/HEAD 만 허용 (그 외 405)
//   - 쿼리 키는 categories·groups 둘만, 길이·개수 상한 있음
//   - 값은 categories.json / groups.json 의 id allowlist 로 걸러 중복 제거·정렬
//     → 서로 다른 표기가 같은 정규형으로 접혀 캐시 키가 유한해진다
//   - 정규형별 결과를 모듈 메모리에 캐시 (인스턴스 재사용 시 재계산 없음)
//   - 결정적 DTSTAMP + ETag 로 조건부 요청에 304 응답
import type { IncomingMessage, ServerResponse } from 'node:http'
// Vercel 은 이 함수를 Node ESM(type:module)으로 실행하므로 상대 import 에
// 명시적 .js 확장자가 필요하다(없으면 런타임 ERR_MODULE_NOT_FOUND → 500).
import { allAnniversaries } from '../src/data/anniversaries/all.js'
import categoriesJson from '../src/data/categories.json' with { type: 'json' }
import groupsJson from '../src/data/groups.json' with { type: 'json' }
import { registerAnchors } from '../src/utils/dateUtils.js'
import { buildCalendar } from '../src/utils/ics.js'

// anchor 맵은 데이터에만 의존하므로 모듈 초기화 때 한 번만 등록한다.
// 요청마다 1,400개 Map 을 다시 만들 이유가 없다.
registerAnchors(allAnniversaries)

const VALID_CATEGORIES = new Set(
  (categoriesJson as Array<{ id: string }>).map((c) => c.id),
)

// 그룹은 tags 에 레이블로 들어 있다(src/types/group.ts). URL 에는 ASCII id 를
// 받고 여기서 레이블로 되돌린다 — 한글을 쿼리로 받으면 인코딩 표기가 갈려
// 같은 선택이 서로 다른 캐시 키를 만든다.
const GROUP_LABEL_BY_ID = new Map(
  (groupsJson as Array<{ id: string; label: string }>).map((g) => [g.id, g.label]),
)

/** 쿼리 문자열 상한 — 정상 요청은 13개 id 를 합쳐도 120자를 넘지 않는다. */
const MAX_QUERY_LEN = 256
const MAX_CATEGORIES = 32
const MAX_GROUPS = 16

/**
 * 배포마다 고정되는 DTSTAMP.
 *
 * 요청 시각을 쓰면 데이터가 그대로여도 매 응답의 바이트와 ETag 가 달라져 캐시가
 * 무의미해지고, 캘린더 앱은 1,400개 이벤트를 전부 "변경됨"으로 처리한다.
 * Vercel 이 주입하는 배포 커밋 SHA 를 시각 대신 쓰면, 데이터가 바뀌어 재배포될
 * 때만 값이 움직인다.
 */
const BUILD_TIME = (() => {
  const t = process.env.VERCEL_DEPLOYMENT_CREATED_AT
  const parsed = t ? Number(t) : NaN
  return Number.isFinite(parsed) ? new Date(parsed) : new Date(0)
})()
const BUILD_ID =
  process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.VERCEL_DEPLOYMENT_ID ?? 'dev'

/** 정규화된 (카테고리, 그룹) 키 → 완성된 ICS 본문. 인스턴스 수명 동안 유지된다. */
const cache = new Map<string, { body: string; etag: string }>()

/**
 * `categories` 쿼리를 정규형으로 접는다.
 * - 알 수 없는 id 는 버린다 (오타로 전체 피드를 받는 사고를 막는다)
 * - 중복 제거 + 정렬 → 순서만 바꾼 요청이 같은 캐시 키를 공유한다
 * - null 은 "필터 없음"(전체), 빈 배열은 "아무것도 선택 안 함"으로 구분한다
 */
function parseIds(
  raw: string | null,
  allow: (id: string) => boolean,
  max: number,
): string[] | null {
  if (raw === null) return null
  const picked = raw
    .split(',')
    .slice(0, max)
    .map((s) => s.trim().toLowerCase())
    .filter(allow)
  return [...new Set(picked)].sort()
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Method Not Allowed')
    return
  }

  const url = new URL(req.url ?? '/', 'http://localhost')

  if (url.search.length > MAX_QUERY_LEN) {
    res.statusCode = 414
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Query string too long')
    return
  }

  // categories 외의 키는 받지 않는다. 임의의 키를 붙여 캐시 키를 무한히
  // 늘리는 것을 막는 게 목적이다.
  for (const key of url.searchParams.keys()) {
    if (key !== 'categories' && key !== 'groups') {
      res.statusCode = 400
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end(`Unsupported query parameter: ${key.slice(0, 40)}`)
      return
    }
  }

  const cats = parseIds(
    url.searchParams.get('categories'),
    (id) => VALID_CATEGORIES.has(id),
    MAX_CATEGORIES,
  )
  const groups = parseIds(
    url.searchParams.get('groups'),
    (id) => GROUP_LABEL_BY_ID.has(id),
    MAX_GROUPS,
  )

  // 파라미터를 줬는데 유효한 id 가 하나도 없으면 전체 피드로 넘어가지 않는다.
  // "카테고리를 전부 해제했더니 1,400건이 구독됐다"가 이 지점의 사고였다.
  // 두 파라미터는 OR 로 합쳐지므로, 합집합이 비었을 때만 거절한다.
  const gave = cats !== null || groups !== null
  if (gave && (cats?.length ?? 0) === 0 && (groups?.length ?? 0) === 0) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('No valid category or group selected')
    return
  }

  const cacheKey = !gave ? '*' : `c:${cats?.join(',') ?? ''}|g:${groups?.join(',') ?? ''}`
  let entry = cache.get(cacheKey)
  if (!entry) {
    const catFilter = cats && cats.length ? new Set(cats) : null
    const labelFilter =
      groups && groups.length
        ? new Set(groups.map((id) => GROUP_LABEL_BY_ID.get(id) as string))
        : null
    const items = !gave
      ? allAnniversaries
      : allAnniversaries.filter(
          (a) =>
            (catFilter?.has(a.category) ?? false) ||
            (labelFilter ? a.tags.some((t) => labelFilter.has(t)) : false),
        )
    const body = buildCalendar(items, {
      calName: '기념일 만물상',
      stamp: BUILD_TIME,
    })
    entry = { body, etag: `"${BUILD_ID}-${cacheKey}-${body.length}"` }
    cache.set(cacheKey, entry)
  }

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  // CDN 12시간 캐시 + 24시간 stale-while-revalidate (구독 폴링 부하 완화)
  res.setHeader('Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=86400')
  res.setHeader('Content-Disposition', 'inline; filename="anniversarium.ics"')
  res.setHeader('ETag', entry.etag)
  res.setHeader('Last-Modified', BUILD_TIME.toUTCString())
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // 데이터가 그대로면 1MB 를 다시 보내지 않는다.
  if (req.headers['if-none-match'] === entry.etag) {
    res.statusCode = 304
    res.end()
    return
  }

  res.statusCode = 200
  if (method === 'HEAD') {
    res.setHeader('Content-Length', String(Buffer.byteLength(entry.body, 'utf-8')))
    res.end()
    return
  }
  res.end(entry.body)
}
