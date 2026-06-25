// Vercel 서버리스 함수 — "살아있는 URL"(캘린더 구독 피드).
// 캘린더 앱이 주기적으로 이 엔드포인트를 다시 받아오므로, 데이터가 추가/배포되면
// 구독자 캘린더가 자동으로 갱신된다. (정적 .ics 다운로드와 달리 스냅샷이 아님)
//
// 예) webcal://annical.vercel.app/api/calendar
//     webcal://annical.vercel.app/api/calendar?categories=general,holiday
import type { IncomingMessage, ServerResponse } from 'node:http'
import { allAnniversaries } from '../src/data/anniversaries/all'
import { registerAnchors } from '../src/utils/dateUtils'
import { buildCalendar } from '../src/utils/ics'

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  // annual-relative-to-holiday 해석을 위해 전체 목록으로 anchor 맵 등록.
  registerAnchors(allAnniversaries)

  const url = new URL(req.url ?? '/', 'http://localhost')
  const catParam = url.searchParams.get('categories')
  const cats = catParam
    ? catParam.split(',').map((s) => s.trim()).filter(Boolean)
    : null

  const items =
    cats && cats.length
      ? allAnniversaries.filter((a) => cats.includes(a.category))
      : allAnniversaries

  const body = buildCalendar(items, { calName: '기념일 만물상' })

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
  // CDN 12시간 캐시 + 24시간 stale-while-revalidate (구독 폴링 부하 완화)
  res.setHeader('Cache-Control', 'public, s-maxage=43200, stale-while-revalidate=86400')
  res.setHeader('Content-Disposition', 'inline; filename="anniversarium.ics"')
  res.end(body)
}
