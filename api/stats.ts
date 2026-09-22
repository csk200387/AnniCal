// 공개 통계 API.
//
// - 브라우저에는 무작위 익명 식별자만 HttpOnly 쿠키로 둔다.
// - Redis에는 그 식별자를 원문으로 저장하지 않고 HyperLogLog에만 넣는다.
// - 상세 페이지 조회수는 sorted set으로 누적해 관심도 순위를 만든다.
// - 클라이언트가 재시도해도 eventId가 같으면 한 번만 집계한다.
import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHash, randomUUID } from 'node:crypto'
import { checkBotId } from 'botid/server'
import { readJsonObject, requesterFingerprint } from '../server/request.js'
import { allAnniversaries } from '../src/data/anniversaries/all.js'

const COOKIE_NAME = 'annical_vid'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365
const EVENT_TTL_SECONDS = 60 * 60 * 24
const DAILY_TTL_SECONDS = 60 * 60 * 48
// 홈에서는 상위 5개만 잘라 보여주고, 인기 페이지는 상위 20개를 사용한다.
// 한 번이라도 읽힌 기념일만 Redis sorted set에 들어가므로 빈 순위는 전송되지 않는다.
const RANKING_LIMIT = 20
const MAX_BODY_BYTES = 1024
// 공유 IP를 쓰는 정상 방문자를 고려하되, 전체 저장소 쓰기에도 상한을 둔다.
const NETWORK_RATE_LIMIT = 120
const GLOBAL_RATE_LIMIT = 3000
const RATE_WINDOW_SECONDS = 60

class RateLimitError extends Error {
  constructor(readonly retryAfter: number) { super('RATE_LIMITED') }
}
// Googlebot 은 evergreen Chromium 으로 페이지를 렌더링하므로 trackPage() 가 그대로
// 실행된다. 그런데 렌더 사이에 쿠키를 유지하지 않아 크롤 1회가 신규 방문자 1명으로
// 잡힌다. 하루 900여 건의 크롤이 방문자 수를 10배 이상 부풀리고 있었다.
const BOT_UA_RE =
  /bot|crawl|spider|slurp|headless|scrape|curl|wget|python-requests|facebookexternalhit|whatsapp|embedly/i
const ID_RE = /^[a-z0-9][a-z0-9-]{2,159}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const VALID_ANNIVERSARY_IDS = new Set(allAnniversaries.map((a) => a.id))

const KEYS = {
  visitorsAll: 'annical:stats:v2:visitors:all',
  pageViews: 'annical:stats:v2:pageviews',
  anniversaryViews: 'annical:stats:v2:anniversary-views',
  monthlyStartedOn: 'annical:stats:v2:monthly-started-on',
} as const

interface StatsSnapshot {
  visitorsToday: number
  visitorsTotal: number
  pageViewsTotal: number
  ranking: Array<{ id: string; views: number }>
  detail?: { id: string; views: number; rank: number | null }
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
-- 초과 요청은 이벤트 키 생성, HLL/순위 조회 전에 끝낸다.
-- 전체 한도를 먼저 읽어 IP를 바꾼 요청도 제한 키를 무한 생성하지 못하게 한다.
if tonumber(redis.call('GET', KEYS[9]) or '0') >= ${GLOBAL_RATE_LIMIT} then
  return {-1, math.max(1, redis.call('TTL', KEYS[9]))}
end
if tonumber(redis.call('GET', KEYS[6]) or '0') >= ${NETWORK_RATE_LIMIT} then
  return {-1, math.max(1, redis.call('TTL', KEYS[6]))}
end
for _, key in ipairs({KEYS[9], KEYS[6]}) do
  local count = redis.call('INCR', key)
  if count == 1 then redis.call('EXPIRE', key, ${RATE_WINDOW_SECONDS}) end
end
local fresh = redis.call('SET', KEYS[1], '1', 'NX', 'EX', tonumber(ARGV[3]))

if fresh then
  local startedOn = redis.call('GET', KEYS[8])
  if not startedOn or ARGV[5] < startedOn then
    redis.call('SET', KEYS[8], ARGV[5])
  end
  redis.call('PFADD', KEYS[2], ARGV[1])
  redis.call('PFADD', KEYS[3], ARGV[1])
  redis.call('EXPIRE', KEYS[3], tonumber(ARGV[4]))
  redis.call('INCR', KEYS[4])
  if ARGV[2] ~= '' then
    redis.call('ZINCRBY', KEYS[5], 1, ARGV[2])
    redis.call('ZINCRBY', KEYS[7], 1, ARGV[2])
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
    signal: AbortSignal.timeout(5000),
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
    signal: AbortSignal.timeout(5000),
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
    const rawRank = results[4] == null ? -1 : Number(results[4])
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

function writeJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  if (status >= 400) res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(data))
}

async function readSnapshot(
  config: { url: string; token: string },
  anniversaryId: string | null,
): Promise<StatsSnapshot> {
  const dayKey = `annical:stats:v2:visitors:${seoulDay()}`
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
    const rawRank = result[5] == null ? -1 : Number(result[5])
    snapshot.detail = {
      id: anniversaryId,
      views: safeCount(result[4]),
      rank: Number.isInteger(rawRank) && rawRank >= 0 ? rawRank + 1 : null,
    }
  }
  return snapshot
}

function monthlyKey(month: string): string {
  // 월별 기록은 만료시키지 않아 다음 달 이후에도 조회할 수 있다.
  return `${KEYS.anniversaryViews}:month:${month}`
}

async function readMonthlyRanking(config: { url: string; token: string }, month: string, currentMonth: string) {
  const results = await redisPipeline(config, [
    ['ZREVRANGE', monthlyKey(month), 0, RANKING_LIMIT - 1, 'WITHSCORES'],
    ['GET', KEYS.monthlyStartedOn],
  ])
  return {
    month,
    currentMonth,
    trackingStartedOn: typeof results[1] === 'string' ? results[1] : null,
    ranking: parseRanking(results[0]),
  }
}

/**
 * UA 로 거른 뒤 BotID 로 한 번 더 본다. UA 는 Googlebot 처럼 정직하게 밝히는
 * 크롤러를, BotID 는 사람인 척하는 스크래퍼를 잡는다.
 *
 * BotID 가 장애로 던지면 UA 판정만 쓴다 — 통계는 부가 기능이라, 집계를 멈추는
 * 것보다 덜 정확해지는 쪽이 낫다. 지금 문제(일 900건 크롤)는 UA 만으로도 걸린다.
 */
async function isBot(req: IncomingMessage): Promise<boolean> {
  if (BOT_UA_RE.test(String(req.headers['user-agent'] ?? ''))) return true
  try {
    const verification = await checkBotId({ advancedOptions: { headers: req.headers } })
    return verification.isBot
  } catch {
    return false
  }
}

async function recordPageView(
  config: { url: string; token: string },
  visitorId: string,
  networkFingerprint: string,
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
    9,
    `annical:stats:v2:event:${eventId}`,
    KEYS.visitorsAll,
    `annical:stats:v2:visitors:${day}`,
    KEYS.pageViews,
    KEYS.anniversaryViews,
    `annical:stats:v2:rate:network:${networkFingerprint}`,
    monthlyKey(day.slice(0, 7)),
    KEYS.monthlyStartedOn,
    'annical:stats:v2:rate:global',
    visitorFingerprint,
    anniversaryId ?? '',
    EVENT_TTL_SECONDS,
    DAILY_TTL_SECONDS,
    day,
  ])
  if (!Array.isArray(result)) throw new Error('INVALID_REDIS_RESPONSE')
  if (result[0] === -1) {
    const retry = Number(result[1])
    throw new RateLimitError(Number.isFinite(retry) ? Math.max(1, Math.min(60, Math.ceil(retry))) : 60)
  }
  if (result.length !== 6) throw new Error('INVALID_REDIS_RESPONSE')
  return snapshotFromResults(result, anniversaryId)
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
    if ((key !== 'id' && key !== 'month') || url.searchParams.getAll(key).length > 1) {
      writeJson(res, 400, { error: 'Unsupported query parameter' })
      return
    }
  }
  const queryId = url.searchParams.get('id')
  const month = url.searchParams.get('month')
  const currentMonth = seoulDay().slice(0, 7)
  if (month !== null && (method !== 'GET' || url.searchParams.has('id') || !/^20\d{2}-(0[1-9]|1[0-2])$/.test(month) || month > currentMonth)) {
    writeJson(res, 400, { error: 'Invalid ranking month' })
    return
  }
  if (queryId && !VALID_ANNIVERSARY_IDS.has(queryId)) {
    writeJson(res, 400, { error: 'Unknown anniversary' })
    return
  }

  try {
    if (method === 'GET') {
      const snapshot = month !== null
        ? await readMonthlyRanking(config, month, currentMonth)
        : await readSnapshot(config, queryId)
      res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30')
      writeJson(res, 200, snapshot)
      return
    }

    if (String(req.headers['content-type'] ?? '').split(';')[0]?.trim().toLowerCase() !== 'application/json') {
      writeJson(res, 415, { error: 'Content-Type must be application/json' })
      return
    }
    const body = await readJsonObject(req, MAX_BODY_BYTES, ['eventId', 'anniversaryId'])
    if (body.anniversaryId != null && typeof body.anniversaryId !== 'string') throw new Error('INVALID_INPUT')
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

    // 봇에게도 공개 수치는 그대로 보여주되, 집계에는 넣지 않는다.
    if (await isBot(req)) {
      res.setHeader('Cache-Control', 'no-store')
      writeJson(res, 200, await readSnapshot(config, anniversaryId))
      return
    }

    const existingVisitor = cookieValue(req)
    const visitorId = existingVisitor ?? randomUUID()
    const fingerprint = requesterFingerprint(req, config.token, 'annical:stats:v2')
    const snapshot = await recordPageView(config, visitorId, fingerprint, eventId, anniversaryId)
    // 거절된 요청에는 새 쿠키를 발급하지 않는다.
    if (!existingVisitor) setVisitorCookie(res, visitorId)
    res.setHeader('Cache-Control', 'no-store')
    writeJson(res, 200, snapshot)
  } catch (error) {
    if (error instanceof RateLimitError) {
      res.setHeader('Retry-After', String(error.retryAfter))
      writeJson(res, 429, { error: 'Too many requests' })
      return
    }
    const reason = error instanceof Error ? error.message : ''
    if (reason === 'BODY_TOO_LARGE') writeJson(res, 413, { error: 'Request body too large' })
    else if (reason === 'INVALID_INPUT' || error instanceof SyntaxError) writeJson(res, 400, { error: 'Invalid request' })
    else writeJson(res, 503, { error: 'Statistics unavailable' })
  }
}
