import type { IncomingMessage, ServerResponse } from 'node:http'
import { createHash, createSign } from 'node:crypto'
import { allAnniversaries } from '../src/data/anniversaries/all.js'
import routes from '../src/data/routes.json' with { type: 'json' }

const MAX_BODY_BYTES = 5_000
const MAX_MESSAGE_LENGTH = 2_000
const MAX_SOURCE_LENGTH = 500
const RATE_LIMIT = 3
const RATE_WINDOW_SECONDS = 60 * 60
const GITHUB_API = 'https://api.github.com'
const FEEDBACK_REPOSITORY = process.env.GITHUB_FEEDBACK_REPOSITORY ?? 'csk200387/AnniCal-feedback'

const TYPE_META = {
  error: { label: '정보 오류', title: '정보 오류' },
  addition: { label: '내용 추가', title: '내용 추가' },
  source: { label: '출처 요청', title: '출처 요청' },
  deletion: { label: '삭제 요청', title: '삭제 요청' },
} as const

type FeedbackType = keyof typeof TYPE_META
type RouteEntry = { slug: string; urlDate: string }

const ANNIVERSARY_BY_ID = new Map(allAnniversaries.map((item) => [item.id, item]))
const ROUTES = routes as Record<string, RouteEntry>

interface FeedbackBody {
  anniversaryId?: unknown
  type?: unknown
  message?: unknown
  sourceUrl?: unknown
  website?: unknown
}

interface RedisEnvelope { result?: unknown; error?: string }

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url')
}

function githubAppJwt(appId: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  // GitHub는 서버 시계가 조금 어긋난 경우를 고려해 iat를 60초 전으로 잡도록 권장한다.
  const payload = base64Url(JSON.stringify({ iat: now - 60, exp: now + 9 * 60, iss: appId }))
  const unsigned = `${header}.${payload}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  return `${unsigned}.${signer.sign(privateKey, 'base64url')}`
}

async function githubInstallationToken(): Promise<string> {
  const appId = process.env.GITHUB_FEEDBACK_APP_ID
  const installationId = process.env.GITHUB_FEEDBACK_INSTALLATION_ID
  const privateKey = process.env.GITHUB_FEEDBACK_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!appId || !installationId || !privateKey) throw new Error('GITHUB_NOT_CONFIGURED')

  const response = await fetch(`${GITHUB_API}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${githubAppJwt(appId, privateKey)}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'AnniCal-Feedback',
    },
  })
  if (!response.ok) throw new Error('GITHUB_UNAVAILABLE')
  const result = await response.json() as { token?: unknown }
  if (typeof result.token !== 'string' || !result.token) throw new Error('GITHUB_UNAVAILABLE')
  return result.token
}

function writeJson(res: ServerResponse, status: number, data: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.end(JSON.stringify(data))
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

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

function requesterFingerprint(req: IncomingMessage, salt: string): string {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '').split(',')[0]?.trim()
  const ip = forwarded || req.socket?.remoteAddress || 'unknown'
  return createHash('sha256').update(`annical:feedback:v1:${salt}:${ip}`).digest('hex')
}

async function checkRateLimit(req: IncomingMessage): Promise<boolean> {
  const config = redisConfig()
  if (!config) throw new Error('RATE_LIMIT_UNAVAILABLE')
  const fingerprint = requesterFingerprint(req, config.token)
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['INCR', `annical:feedback:v1:rate:${fingerprint}`],
      ['EXPIRE', `annical:feedback:v1:rate:${fingerprint}`, RATE_WINDOW_SECONDS, 'NX'],
    ]),
  })
  const payload = await response.json() as RedisEnvelope[]
  if (!response.ok || !Array.isArray(payload) || payload.some((item) => item.error)) {
    throw new Error('RATE_LIMIT_UNAVAILABLE')
  }
  return Number(payload[0]?.result) <= RATE_LIMIT
}

function cleanText(value: unknown): string {
  return typeof value === 'string' ? value.trim().replace(/\r\n?/g, '\n') : ''
}

function safeMarkdown(value: string): string {
  // 비공개 Issue라도 사용자 입력이 팀원이나 다른 Issue를 멘션하지 않게 한다.
  return value.replace(/@/g, '@\u200b')
}

function validSourceUrl(value: string): boolean {
  if (!value) return true
  try {
    const url = new URL(value)
    return (url.protocol === 'https:' || url.protocol === 'http:') && !url.username && !url.password
  } catch {
    return false
  }
}

async function createIssue(body: FeedbackBody): Promise<number> {
  const anniversaryId = cleanText(body.anniversaryId)
  const type = cleanText(body.type) as FeedbackType
  const message = cleanText(body.message)
  const sourceUrl = cleanText(body.sourceUrl)
  const anniversary = ANNIVERSARY_BY_ID.get(anniversaryId)
  const route = ROUTES[anniversaryId]

  if (!anniversary || !route || !(type in TYPE_META)) throw new Error('INVALID_INPUT')
  if (message.length < 20 || message.length > MAX_MESSAGE_LENGTH) throw new Error('INVALID_INPUT')
  if (sourceUrl.length > MAX_SOURCE_LENGTH || !validSourceUrl(sourceUrl)) throw new Error('INVALID_INPUT')

  const meta = TYPE_META[type]
  const pageUrl = `https://www.annical.me/day/${route.urlDate}/${route.slug}`
  const issueBody = [
    '## 사용자 요청',
    '',
    safeMarkdown(message),
    '',
    '## 대상 기념일',
    '',
    `- 이름: ${anniversary.name}`,
    `- ID: \`${anniversary.id}\``,
    `- 페이지: ${pageUrl}`,
    `- 참고 링크: ${sourceUrl ? safeMarkdown(sourceUrl) : '없음'}`,
    '',
    '> AnniCal 사이트의 익명 정보 요청 폼에서 자동 접수되었습니다.',
  ].join('\n')

  const token = await githubInstallationToken()

  const response = await fetch(`${GITHUB_API}/repos/${FEEDBACK_REPOSITORY}/issues`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'AnniCal-Feedback',
    },
    body: JSON.stringify({
      title: `[${meta.title}] ${anniversary.name}`,
      body: issueBody,
      labels: [meta.label],
    }),
  })
  if (!response.ok) throw new Error('GITHUB_UNAVAILABLE')
  const result = await response.json() as { number?: unknown }
  const issueNumber = Number(result.number)
  if (!Number.isInteger(issueNumber) || issueNumber < 1) throw new Error('GITHUB_UNAVAILABLE')
  return issueNumber
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = (req.method ?? 'GET').toUpperCase()
  if (method !== 'POST') {
    res.setHeader('Allow', 'POST')
    writeJson(res, 405, { error: 'Method Not Allowed' })
    return
  }
  if (!String(req.headers['content-type'] ?? '').toLowerCase().startsWith('application/json')) {
    writeJson(res, 415, { error: 'Content-Type must be application/json' })
    return
  }

  try {
    const body = await readBody(req) as FeedbackBody
    // 화면에는 보이지 않는 허니팟. 봇에는 성공처럼 답하되 실제 Issue는 만들지 않는다.
    if (cleanText(body.website)) {
      writeJson(res, 202, { accepted: true })
      return
    }
    if (!await checkRateLimit(req)) {
      writeJson(res, 429, { error: 'Too many requests' })
      return
    }
    const issueNumber = await createIssue(body)
    writeJson(res, 201, { accepted: true, reference: issueNumber })
  } catch (error) {
    const reason = error instanceof Error ? error.message : ''
    if (reason === 'BODY_TOO_LARGE') writeJson(res, 413, { error: 'Request body too large' })
    else if (reason === 'INVALID_INPUT' || error instanceof SyntaxError) writeJson(res, 400, { error: 'Invalid feedback' })
    else writeJson(res, 503, { error: 'Feedback service unavailable' })
  }
}
