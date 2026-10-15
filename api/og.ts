// 공개 이미지 함수: 허용된 데이터만 렌더링하며 메모리와 캐시 키를 제한한다.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHash } from 'node:crypto'
import { BoundedCache } from '../server/boundedCache.js'
import { parseOgQuery } from '../server/og/query.js'
import { renderOg } from '../server/og/render.js'

const cache = new BoundedCache<{ body: Buffer; etag: string }>(64, 16 * 1024 * 1024)
// 같은 인스턴스에 동시 요청이 와도 렌더는 직렬화해 WASM/폰트 작업 메모리를 제한한다.
let queue: Promise<unknown> = Promise.resolve()
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'HEAD') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET, HEAD')
    res.end()
    return
  }
  const url = new URL(req.url ?? '/', 'http://localhost')
  if (url.search.length > 512) {
    res.statusCode = 400
    res.end()
    return
  }
  const parsed = parseOgQuery(url.searchParams)
  if (typeof parsed === 'number') {
    res.statusCode = parsed
    res.end()
    return
  }
  try {
    const job = queue.then(async () => {
      let entry = cache.get(parsed.key)
      if (!entry) {
        const body = await renderOg(parsed.card)
        entry = { body, etag: `"${createHash('sha256').update(body).digest('hex')}"` }
        cache.set(parsed.key, entry, body.byteLength + parsed.key.length * 2 + 256)
      }
      return entry
    })
    queue = job.catch(() => {})
    const entry = await job
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800',
    )
    res.setHeader('ETag', entry.etag)
    if (req.headers['if-none-match'] === entry.etag) {
      res.statusCode = 304
      res.end()
      return
    }
    res.statusCode = 200
    res.setHeader('Content-Length', String(entry.body.byteLength))
    res.end(method === 'HEAD' ? undefined : entry.body)
  } catch {
    res.statusCode = 500
    res.setHeader('Cache-Control', 'no-store')
    res.end()
  }
}
