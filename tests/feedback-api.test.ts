import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generateKeyPairSync } from 'node:crypto'
import handler from '../api/feedback'
import { allAnniversaries } from '../src/data/anniversaries/all'

interface Reply { status: number; body: string; headers: Record<string, string> }

const TEST_PRIVATE_KEY = generateKeyPairSync('rsa', { modulusLength: 2048 })
  .privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()

async function call(method: string, body: unknown, contentType = 'application/json'): Promise<Reply> {
  const req = {
    method,
    url: '/api/feedback',
    body,
    headers: { 'content-type': contentType, 'x-forwarded-for': '192.0.2.1' },
    socket: {},
  } as never
  const reply: Reply = { status: 0, body: '', headers: {} }
  const res = {
    set statusCode(value: number) { reply.status = value },
    get statusCode() { return reply.status },
    setHeader(key: string, value: string) { reply.headers[key.toLowerCase()] = String(value) },
    end(value?: string) { reply.body = value ?? '' },
  } as never
  await handler(req, res)
  return reply
}

const anniversaryId = allAnniversaries[0]!.id
const validBody = {
  anniversaryId,
  type: 'error',
  message: '날짜 설명과 공식 기관 자료의 내용이 서로 다릅니다.',
  sourceUrl: 'https://example.com/source',
  website: '',
}

describe('정보 요청 API', () => {
  beforeEach(() => {
    vi.stubEnv('KV_REST_API_URL', 'https://redis.example')
    vi.stubEnv('KV_REST_API_TOKEN', 'redis-secret')
    vi.stubEnv('GITHUB_FEEDBACK_APP_ID', '123456')
    vi.stubEnv('GITHUB_FEEDBACK_INSTALLATION_ID', '987654')
    vi.stubEnv('GITHUB_FEEDBACK_PRIVATE_KEY', TEST_PRIVATE_KEY)
    vi.stubEnv('GITHUB_FEEDBACK_REPOSITORY', 'csk200387/AnniCal-feedback')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('검증된 요청을 비공개 GitHub Issue로 생성한다', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ result: 1 }, { result: 1 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'installation-token' }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ number: 7 }), { status: 201 }))
    vi.stubGlobal('fetch', fetchMock)

    const response = await call('POST', validBody)
    expect(response.status).toBe(201)
    expect(JSON.parse(response.body)).toEqual({ accepted: true, reference: 7 })

    const githubRequest = fetchMock.mock.calls[2]!
    expect(String(githubRequest[0])).toContain('/csk200387/AnniCal-feedback/issues')
    const payload = JSON.parse(String(githubRequest[1]?.body)) as { title: string; labels: string[]; body: string }
    expect(payload.title).toContain('[정보 오류]')
    expect(payload.labels).toEqual(['정보 오류'])
    expect(payload.body).toContain(anniversaryId)
    expect(payload.body).not.toContain('192.0.2.1')
  })

  it('메서드와 콘텐츠 타입을 제한한다', async () => {
    expect((await call('GET', {})).status).toBe(405)
    expect((await call('POST', validBody, 'text/plain')).status).toBe(415)
  })

  it('짧은 본문과 알 수 없는 기념일을 거절한다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(
      new Response(JSON.stringify([{ result: 1 }, { result: 1 }]), { status: 200 }),
    )))
    expect((await call('POST', { ...validBody, message: '짧음' })).status).toBe(400)
    expect((await call('POST', { ...validBody, anniversaryId: 'unknown-id' })).status).toBe(400)
  })

  it('시간당 요청 제한을 넘으면 Issue를 생성하지 않는다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([{ result: 4 }, { result: 1 }]), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    expect((await call('POST', validBody)).status).toBe(429)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('허니팟에 값이 있으면 외부 서비스를 호출하지 않는다', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    const response = await call('POST', { ...validBody, website: 'spam.example' })
    expect(response.status).toBe(202)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
