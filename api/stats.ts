// 공개 통계 API.
//
// - 브라우저에는 무작위 익명 식별자만 HttpOnly 쿠키로 둔다.
// - Redis에는 그 식별자를 원문으로 저장하지 않고 HyperLogLog에만 넣는다.
// - 상세 페이지 조회수는 sorted set으로 누적해 관심도 순위를 만든다.
// - 클라이언트가 재시도해도 eventId가 같으면 한 번만 집계한다.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHash, randomUUID } from 'node:crypto'
import { allAnniversaries } from '../src/data/anniversaries/all.js'

const COOKIE_NAME = 'annical_vid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const EVENT_TTL_SECONDS = 60 * 60 * 24
const DAILY_TTL_SECONDS = 60 * 60 * 48
const RANKING_LIMIT = 5
const MAX_BODY_BYTES = 1024
const ID_RE = /^[a-z0-9][a-z0-9-]{2,159}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const VALID_ANNIVERSARY_IDS = new Set(allAnniversaries.map((a) => a.id))

const KEYS = {
  visitorsAll: 'annical:stats:v1:visitors:all',
  pageViews: 'annical:stats:v1:pageviews',
  anniversaryViews: 'annical:stats:v1:anniversary-views',
} as const

interface StatsSnapshot {
  visitorsToday: number
  visitorsTotal: number
  pageViewsTotal: number
  ranking: Array<{ id: string; views: number }>
  detail?: { id: string; views: number; rank: number | null }
}

interface RecordBody {
  eventId?: unknown
  anniversaryId?: unknown
}

interface RedisEnvelope {
  result?: unknown
  error?: string
}

type RedisCommand = Array<string | number>

/**
 * SET NX와 모든 카운터 갱신을 한 번에 수행한다. Upstash pipeline은 원자적이지
 * 않으므로, 중복 요청 사이에 끼어들 여지가 없는 Lua 스크립트를 사용한다.
 */
const RECORD_SCRIPT = `
local rate = redis.call('INCR', KEYS[6])
if rate == 1 then redis.call('EXPIRE', KEYS[6], 60) end

local fresh = false
if rate <= 60 then
  fresh = redis.call('SET', KEYS[1], '1', 'NX', 'EX', tonumber(ARGV[3]))
end

if fresh then
  redis.call('PFADD', KEYS[2], ARGV[1])
  redis.call('PFADD', KEYS[3], ARGV[1])
  redis.call('EXPIRE', KEYS[3], tonumber(ARGV[4]))
  redis.call('INCR', KEYS[4])
  if ARGV[2] ~= '' then
    redis.call('ZINCRBY', KEYS[5], 1, ARGV[2])
  end
end

local detailViews = 0
local detailRank = -1
if ARGV[2] ~= '' then
  detailViews = redis.call('ZSCORE', KEYS[5], ARGV[2]) or 0
  detailRank = redis.call('ZREVRANK', KEYS[5], ARGV[2]) or -1
end

return {
  redis.call('PFCOUNT', KEYS[2]),
  redis.call('PFCOUNT', KEYS[3]),
  redis.call('GET', KEYS[4]) or 0,
  detailViews,
  detailRank,
  redis.call('ZREVRANGE', KEYS[5], 0, ${RANKING_LIMIT - 1}, 'WITHSCORES')
}
`

function redisConfig(): { url: string; token: string } | null {
  // Vercel Marketplace는 KV_* 이름을, Upstash에서 직접 연결하면 UPSTASH_* 이름을
  // 주로 쓴다. 둘 다 받아 어느 방식으로 연결해도 코드는 바뀌지 않게 한다.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function redisCommand(config: { url: string; token: string }, command: RedisCommand): Promise<unknown> {
  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
  })
  const payload = (await response.json()) as RedisEnvelope
  if (!response.ok || payload.error) {
    throw new Error(payload.error ?? `Redis HTTP ${response.status}`)
  }
  return payload.result
}

async function redisPipeline(
  config: { url: string; token: string },
  commands: RedisCommand[],
): Promise<unknown[]> {
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })
  const payload = (await response.json()) as RedisEnvelope[]
  if (!response.ok || !Array.isArray(payload)) {
    throw new Error(`Redis HTTP ${response.status}`)
  }
  const failed = payload.find((item) => item.error)
  if (failed?.error) throw new Error(failed.error)
  return payload.map((item) => item.result)
}

function safeCount(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0
}

function parseRanking(value: unknown): Array<{ id: string; views: number }> {
  if (!Array.isArray(value)) return []
  const result: Array<{ id: string; views: number }> = []
  for (let i = 0; i + 1 < value.length; i += 2) {
    const id = String(value[i] ?? '')
    if (!VALID_ANNIVERSARY_IDS.has(id)) continue
    result.push({ id, views: safeCount(value[i + 1]) })
  }
  return result
}

function snapshotFromResults(results: unknown[], anniversaryId: string | null): StatsSnapshot {
  const snapshot: StatsSnapshot = {
    visitorsTotal: safeCount(results[0]),
    visitorsToday: safeCount(results[1]),
    pageViewsTotal: safeCount(results[2]),
    ranking: parseRanking(results[5] ?? results[3]),
  }
  if (anniversaryId) {
    const rawRank = Number(results[4])
    snapshot.detail = {
      id: anniversaryId,
      views: safeCount(results[3]),
      rank: Number.isInteger(rawRank) && rawRank >= 0 ? rawRank + 1 : null,
    }
  }
  return snapshot
}

function seoulDay(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

function cookieValue(req: IncomingMessage): string | null {
  const raw = req.headers.cookie
  if (!raw) return null
  for (const part of raw.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name !== COOKIE_NAME) continue
    const value = rest.join('=')
    return UUID_RE.test(value) ? value.toLowerCase() : null
  }
  return null
}

function setVisitorCookie(res: ServerResponse, visitorId: string): void {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${visitorId}; Path=/api/stats; Max-Age=${COOKIE_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`,
  )
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  const supplied = (req as IncomingMessage & { body?: unknown }).body
  if (supplied !== undefined) return supplied

  const declared = Number(req.headers['content-length'] ?? 0)
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE')

  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_BODY_BYTES) throw new Error('BODY_TOO_LARGE')
    chunks.push(buffer)
  }
  if (!chunks.length) return {}
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'))
}

function writeJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(data))
}

async function readSnapshot(
  config: { url: string; token: string },
  anniversaryId: string | null,
): Promise<StatsSnapshot> {
  const dayKey = `annical:stats:v1:visitors:${seoulDay()}`
  const commands: RedisCommand[] = [
    ['PFCOUNT', KEYS.visitorsAll],
    ['PFCOUNT', dayKey],
    ['GET', KEYS.pageViews],
    ['ZREVRANGE', KEYS.anniversaryViews, 0, RANKING_LIMIT - 1, 'WITHSCORES'],
  ]
  if (anniversaryId) {
    commands.push(
      ['ZSCORE', KEYS.anniversaryViews, anniversaryId],
      ['ZREVRANK', KEYS.anniversaryViews, anniversaryId],
    )
  }
  const result = await redisPipeline(config, commands)
  const snapshot: StatsSnapshot = {
    visitorsTotal: safeCount(result[0]),
    visitorsToday: safeCount(result[1]),
    pageViewsTotal: safeCount(result[2]),
    ranking: parseRanking(result[3]),
  }
  if (anniversaryId) {
    const rawRank = Number(result[5])
    snapshot.detail = {
      id: anniversaryId,
      views: safeCount(result[4]),
      rank: Number.isInteger(rawRank) && rawRank >= 0 ? rawRank + 1 : null,
    }
  }
  return snapshot
}

async function recordPageView(
  config: { url: string; token: string },
  visitorId: string,
  eventId: string,
  anniversaryId: string | null,
): Promise<StatsSnapshot> {
  const day = seoulDay()
  // 쿠키의 무작위 값조차 Redis 키나 값으로 그대로 보내지 않는다.
  const visitorFingerprint = createHash('sha256')
    .update(`annical:v1:${visitorId}`)
    .digest('hex')
  const result = await redisCommand(config, [
    'EVAL',
    RECORD_SCRIPT,
    6,
    `annical:stats:v1:event:${eventId}`,
    KEYS.visitorsAll,
    `annical:stats:v1:visitors:${day}`,
    KEYS.pageViews,
    KEYS.anniversaryViews,
    `annical:stats:v1:rate:${visitorFingerprint}`,
    visitorFingerprint,
    anniversaryId ?? '',
    EVENT_TTL_SECONDS,
    DAILY_TTL_SECONDS,
  ])
  return snapshotFromResults(Array.isArray(result) ? result : [], anniversaryId)
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'GET' && method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    writeJson(res, 405, { error: 'Method Not Allowed' })
    return
  }

  const config = redisConfig()
  if (!config) {
    // 로컬 개발이나 아직 Redis를 연결하지 않은 배포에서 가짜 0을 보여주지 않는다.
    // 클라이언트는 503을 받으면 통계 블록을 숨긴다.
    writeJson(res, 503, { error: 'Statistics storage is not configured' })
    return
  }

  const url = new URL(req.url ?? '/api/stats', 'http://localhost')
  for (const key of url.searchParams.keys()) {
    if (key !== 'id') {
      writeJson(res, 400, { error: 'Unsupported query parameter' })
      return
    }
  }
  const queryId = url.searchParams.get('id')
  if (queryId && !VALID_ANNIVERSARY_IDS.has(queryId)) {
    writeJson(res, 400, { error: 'Unknown anniversary' })
    return
  }

  try {
    if (method === 'GET') {
      const snapshot = await readSnapshot(config, queryId)
      res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
      writeJson(res, 200, snapshot)
      return
    }

    if (!String(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) {
      writeJson(res, 415, { error: 'Content-Type must be application/json' })
      return
    }
    const body = (await readBody(req)) as RecordBody
    const eventId = typeof body?.eventId === 'string' ? body.eventId : ''
    const anniversaryId =
      typeof body?.anniversaryId === 'string' && body.anniversaryId ? body.anniversaryId : null

    if (!UUID_RE.test(eventId)) {
      writeJson(res, 400, { error: 'Invalid eventId' })
      return
    }
    if (anniversaryId && (!ID_RE.test(anniversaryId) || !VALID_ANNIVERSARY_IDS.has(anniversaryId))) {
      writeJson(res, 400, { error: 'Unknown anniversary' })
      return
    }

    let visitorId = cookieValue(req)
    if (!visitorId) {
      visitorId = randomUUID()
      setVisitorCookie(res, visitorId)
    }
    const snapshot = await recordPageView(config, visitorId, eventId, anniversaryId)
    res.setHeader('Cache-Control', 'no-store')
    writeJson(res, 200, snapshot)
  } catch (error) {
    const status = error instanceof Error && error.message === 'BODY_TOO_LARGE' ? 413 : 503
    writeJson(res, status, { error: status === 413 ? 'Request body too large' : 'Statistics unavailable' })
  }
}
