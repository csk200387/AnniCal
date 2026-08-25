import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../api/stats'
import { allAnniversaries } from '../src/data/anniversaries/all'

interface Reply {
  status: number
  body: string
  headers: Record<string, string>
}

async function call(
  method: string,
  url: string,
  options: { body?: unknown; headers?: Record<string, string> } = {},
): Promise<Reply> {
  const req = {
    method,
    url,
    body: options.body,
    headers: options.headers ?? {},
  } as never
  const reply: Reply = { status: 0, body: '', headers: {} }
  const res = {
    get statusCode() {
      return reply.status
    },
    set statusCode(value: number) {
      reply.status = value
    },
    setHeader: (key: string, value: string | number | readonly string[]) => {
      reply.headers[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : String(value)
    },
    end: (body?: string) => {
      reply.body = body ?? ''
    },
  } as never
  await handler(req, res)
  return reply
}

const anniversaryId = allAnniversaries[0]!.id
const eventId = '1035f67e-89ab-4cde-8123-0123456789ab'

describe('통계 API', () => {
  beforeEach(() => {
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'secret')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('GET은 공개 통계와 관심도 순위를 정규화해 반환한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { result: 42 },
      { result: 7 },
      { result: '123' },
      { result: [anniversaryId, '9'] },
    ]), { status: 200 })))

    const response = await call('GET', '/api/stats')
    expect(response.status).toBe(200)
    expect(JSON.parse(response.body)).toEqual({
      visitorsToday: 7,
      visitorsTotal: 42,
      pageViewsTotal: 123,
      ranking: [{ id: anniversaryId, views: 9 }],
    })
    expect(response.headers['cache-control']).toContain('s-maxage=15')
  })

  it('POST는 익명 쿠키를 발급하고 상세 조회수와 순위를 돌려준다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      result: [43, 8, '124', '10', 0, [anniversaryId, '10']],
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await call('POST', '/api/stats', {
      body: { eventId, anniversaryId },
      headers: { 'content-type': 'application/json' },
    })

    expect(response.status).toBe(200)
    expect(JSON.parse(response.body).detail).toEqual({ id: anniversaryId, views: 10, rank: 1 })
    expect(response.headers['set-cookie']).toContain('HttpOnly')
    expect(response.headers['set-cookie']).toContain('SameSite=Lax')

    const command = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body)) as unknown[]
    expect(command[0]).toBe('EVAL')
    expect(command).toContain(anniversaryId)
  })

  it('쓰기 요청의 형식과 기념일 id를 검증한다', async () => {
    expect((await call('POST', '/api/stats', {
      body: { eventId },
      headers: { 'content-type': 'text/plain' },
    })).status).toBe(415)

    expect((await call('POST', '/api/stats', {
      body: { eventId: 'not-a-uuid' },
      headers: { 'content-type': 'application/json' },
    })).status).toBe(400)

    expect((await call('POST', '/api/stats', {
      body: { eventId, anniversaryId: 'anv-does-not-exist' },
      headers: { 'content-type': 'application/json' },
    })).status).toBe(400)
  })

  it('저장소가 없으면 가짜 0 대신 503을 반환한다', async () => {
    vi.stubEnv('KV_REST_API_URL', '')
    vi.stubEnv('KV_REST_API_TOKEN', '')
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '')
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '')

    const response = await call('GET', '/api/stats')
    expect(response.status).toBe(503)
    expect(response.body).toContain('not configured')
  })

  it('지원하지 않는 메서드와 쿼리를 거절한다', async () => {
    const method = await call('DELETE', '/api/stats')
    expect(method.status).toBe(405)
    expect(method.headers.allow).toBe('GET, POST')
    expect((await call('GET', '/api/stats?limit=999')).status).toBe(400)
    expect((await call('GET', '/api/stats?id=unknown')).status).toBe(400)
  })
})
