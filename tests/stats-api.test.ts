import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// BotID 는 Vercel 런타임에서만 판정할 수 있다. 여기서는 판정 결과만 갈아끼워
// 핸들러가 그 결과를 실제로 반영하는지 본다.
const checkBotId = vi.hoisted(() => vi.fn(async () => ({ isBot: false })))
vi.mock('botid/server', () => ({ checkBotId }))

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
    socket: { remoteAddress: '192.0.2.1' },
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
const humanUA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

describe('통계 API', () => {
  beforeEach(() => {
    vi.stubEnv('VERCEL', '')
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'secret')
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T02:00:00Z'))
    checkBotId.mockResolvedValue({ isBot: false })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    vi.useRealTimers()
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

  it('봇 UA의 POST는 집계하지 않고 읽기 전용 스냅샷만 돌려준다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { result: 42 },
      { result: 7 },
      { result: '123' },
      { result: [anniversaryId, '9'] },
    ]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await call('POST', '/api/stats', {
      body: { eventId, anniversaryId },
      headers: {
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    })

    expect(response.status).toBe(200)
    expect(JSON.parse(response.body).visitorsToday).toBe(7)
    // 쿠키를 발급하지 않아야 다음 크롤도 같은 경로로 걸러진다.
    expect(response.headers['set-cookie']).toBeUndefined()
    // 기록용 EVAL 이 아니라 읽기 파이프라인만 나간다.
    const sent = JSON.parse(String(fetchMock.mock.calls[0]![1]?.body)) as unknown[]
    expect(JSON.stringify(sent)).not.toContain('EVAL')
    expect(JSON.stringify(sent)).toContain('PFCOUNT')
  })

  it('사람 브라우저 UA는 평소대로 집계한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      result: [43, 8, '124', '10', 0, [anniversaryId, '10']],
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await call('POST', '/api/stats', {
      body: { eventId, anniversaryId },
      headers: {
        'content-type': 'application/json',
        'user-agent': humanUA,
      },
    })

    expect(response.status).toBe(200)
    expect(response.headers['set-cookie']).toContain('HttpOnly')
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))[0]).toBe('EVAL')
  })

  it('사람 UA 라도 BotID 가 봇으로 보면 집계하지 않는다', async () => {
    checkBotId.mockResolvedValue({ isBot: true })
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { result: 42 }, { result: 7 }, { result: '123' }, { result: [anniversaryId, '9'] },
    ]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await call('POST', '/api/stats', {
      body: { eventId, anniversaryId },
      headers: { 'content-type': 'application/json', 'user-agent': humanUA },
    })

    expect(response.status).toBe(200)
    expect(response.headers['set-cookie']).toBeUndefined()
    expect(JSON.stringify(fetchMock.mock.calls[0]![1]?.body)).not.toContain('EVAL')
  })

  it('BotID 가 장애로 던지면 UA 판정만으로 떨어뜨린다', async () => {
    checkBotId.mockRejectedValue(new Error('botid down'))
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      result: [43, 8, '124', '10', 0, [anniversaryId, '10']],
    }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await call('POST', '/api/stats', {
      body: { eventId, anniversaryId },
      headers: { 'content-type': 'application/json', 'user-agent': humanUA },
    })

    // 사람은 계속 집계된다 — 통계가 멈추는 것보다 덜 정확한 쪽을 택했다.
    expect(response.status).toBe(200)
    expect(JSON.parse(String(fetchMock.mock.calls[0]![1]?.body))[0]).toBe('EVAL')
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

  it('지난달 조회는 누적 키가 아닌 해당 월 기록과 집계 시작일을 반환한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { result: [anniversaryId, '4'] },
      { result: '2026-08-20' },
    ]), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    const response = await call('GET', '/api/stats?month=2026-08')
    expect(response.status).toBe(200)
    expect(JSON.parse(response.body)).toEqual({
      month: '2026-08', currentMonth: '2026-09', trackingStartedOn: '2026-08-20',
      ranking: [{ id: anniversaryId, views: 4 }],
    })
    const commands = JSON.parse(fetchMock.mock.calls[0]![1].body)
    expect(commands[0]).toEqual(['ZREVRANGE', 'annical:stats:v2:anniversary-views:month:2026-08', 0, 19, 'WITHSCORES'])
    expect(commands.flat()).not.toContain('annical:stats:v2:anniversary-views')
  })

  it('기록이 없는 과거 달에 누적 수치를 복제하지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { result: [] }, { result: '2026-09-14' },
    ]), { status: 200 })))
    const response = await call('GET', '/api/stats?month=2026-08')
    expect(JSON.parse(response.body)).toEqual({
      month: '2026-08', currentMonth: '2026-09', trackingStartedOn: '2026-09-14', ranking: [],
    })
  })

  it('유효하지 않은 월·미래·중복 쿼리는 Redis 요청 없이 거절한다', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    for (const query of ['month=', 'month=2026-13', 'month=2026-00', 'month=2026-9', 'month=2026-10', 'month=2026-09&month=2026-08', `month=2026-09&id=${anniversaryId}`]) {
      expect((await call('GET', `/api/stats?${query}`)).status).toBe(400)
    }
    expect((await call('POST', '/api/stats?month=2026-08')).status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('한국 시간의 월 경계에서 새 월 키를 사용하고 eventId는 월간 중복 집계도 막는다', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ result: [1, 1, 1, 1, 0, []] })))
    vi.stubGlobal('fetch', fetchMock)
    const options = { body: { eventId, anniversaryId }, headers: { 'content-type': 'application/json' } }
    vi.setSystemTime(new Date('2026-09-30T14:59:59Z'))
    await call('POST', '/api/stats', options)
    vi.setSystemTime(new Date('2026-09-30T15:00:00Z'))
    await call('POST', '/api/stats', options)
    const before = JSON.parse(fetchMock.mock.calls[0]![1].body)
    const after = JSON.parse(fetchMock.mock.calls[1]![1].body)
    expect(before).toContain('annical:stats:v2:anniversary-views:month:2026-09')
    expect(after).toContain('annical:stats:v2:anniversary-views:month:2026-10')
    expect(before[3]).toBe(after[3]) // 월이 달라도 같은 이벤트의 중복 방지 키 유지
    expect(after.at(-1)).toBe('2026-10-01')
    expect(after[2]).toBe(9)
  })

  it('읽음이 없는 상세 페이지를 1위라고 표시하지 않는다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { result: 1 }, { result: 1 }, { result: 1 }, { result: [] }, { result: null }, { result: null },
    ]))))
    const response = await call('GET', `/api/stats?id=${anniversaryId}`)
    expect(JSON.parse(response.body).detail).toEqual({ id: anniversaryId, views: 0, rank: null })
  })
})


describe('통계 쓰기 방어', () => {
  beforeEach(() => {
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'test-only-token')
    vi.stubEnv('VERCEL', '')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('쿠키를 생략·교체하고 eventId를 바꿔도 네트워크 제한 키는 유지된다', async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ result: [1, 1, 1, 1, 0, []] })))
    vi.stubGlobal('fetch', fetchMock)
    for (const cookie of ['', 'annical_vid=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'annical_vid=bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb']) {
      await call('POST', '/api/stats', {
        body: { eventId: crypto.randomUUID(), anniversaryId },
        headers: { 'content-type': 'application/json', cookie },
      })
    }
    const commands = fetchMock.mock.calls.map((args) => JSON.parse(args[1].body))
    const key = commands[0][8]
    expect(key).toMatch(/^annical:stats:v2:rate:network:[a-f0-9]{64}$/)
    expect(new Set(commands.map((cmd) => cmd[8])).size).toBe(1)
    expect(new Set(commands.map((cmd) => cmd[3])).size).toBe(3)
    expect(commands.every((cmd) => cmd.includes('annical:stats:v2:rate:global'))).toBe(true)
    expect(JSON.stringify(commands)).not.toContain('192.0.2.1')
  })

  it('제한 초과는 429·Retry-After로 끝나고 쿠키 발급·추가 조회를 하지 않는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: [-1, 42] })))
    vi.stubGlobal('fetch', fetchMock)
    const reply = await call('POST', '/api/stats', { body: { eventId }, headers: { 'content-type': 'application/json' } })
    expect(reply.status).toBe(429)
    expect(reply.headers['retry-after']).toBe('42')
    expect(reply.headers['cache-control']).toBe('no-store')
    expect(reply.headers['set-cookie']).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('파싱된 과대 본문과 잘못된 스키마를 Redis 호출 전에 거절한다', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const oversized = await call('POST', '/api/stats', {
      body: { eventId, padding: 'x'.repeat(100000) }, headers: { 'content-type': 'application/json' },
    })
    expect(oversized.status).toBe(413)
    for (const body of [null, [], { eventId, anniversaryId: 7 }, { eventId, extra: 'x' }, '{bad']) {
      expect((await call('POST', '/api/stats', { body, headers: { 'content-type': 'application/json' } })).status).toBe(400)
    }
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
