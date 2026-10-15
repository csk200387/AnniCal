import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHash } from 'node:crypto'
import { BoundedCache } from '../server/boundedCache.js'
import { shareMeta, shareMetaHtml } from '../server/shareMeta.js'
import { todayInSiteZone } from '../src/utils/clock.js'

const cache = new BoundedCache<{ body: string; etag: string }>(128, 2 * 1024 * 1024)
export default function handler(req: IncomingMessage, res: ServerResponse): void {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end()
    return
  }
  const url = new URL(req.url ?? '/', 'http://localhost')
  // 긴 쿼리는 값을 읽지 않고 페이지 공통 메타로 폴백한다.
  const params =
    url.search.length > 512
      ? new URLSearchParams({
          page: url.searchParams.get('page') === 'together' ? 'together' : 'birthday',
        })
      : url.searchParams
  const meta = shareMeta(params)
  const key = JSON.stringify(meta)
  let entry = cache.get(key)
  if (!entry) {
    const body = shareMetaHtml(meta)
    entry = { body, etag: `"${createHash('sha256').update(body).digest('hex')}"` }
    cache.set(key, entry, Math.max(body.length * 2, Buffer.byteLength(body)) + key.length * 2 + 256)
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  // UA에 따라 사람용 파일과 봇 메타가 다르므로 공유 캐시에 Vary를 명시한다.
  res.setHeader('Vary', 'User-Agent')
  // 날짜/기준 연도 생략 링크는 서울 자정에 다시 평가한다.
  const now = new Date(),
    tomorrow = todayInSiteZone(now)
  const ttl = Math.max(
    1,
    Math.min(
      3600,
      Math.floor(
        (Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate() + 1) -
          9 * 3600000 -
          now.getTime()) /
          1000,
      ),
    ),
  )
  res.setHeader('Cache-Control', `public, max-age=${ttl}, s-maxage=${ttl}`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('ETag', entry.etag)
  if (req.headers['if-none-match'] === entry.etag) {
    res.statusCode = 304
    res.end()
    return
  }
  res.statusCode = 200
  res.setHeader('Content-Length', String(Buffer.byteLength(entry.body)))
  res.end(method === 'HEAD' ? undefined : entry.body)
}
