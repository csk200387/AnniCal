import type { IncomingMessage, ServerResponse } from 'node:http'
import { createSign } from 'node:crypto'
import { readJsonObject, requesterFingerprint } from '../server/request.js'
import { allAnniversaries } from '../src/data/anniversaries/all.js'
import routes from '../src/data/routes.json' with { type: 'json' }

// 한글 2,000자와 최대 500자의 출처 링크도 UTF-8 본문 한도 안에 들어간다.
const MAX_BODY_BYTES = 8_000
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
  const repository = FEEDBACK_REPOSITORY.split('/')
  if (repository.length !== 2 || repository.some((part) => !/^[A-Za-z0-9_.-]+$/.test(part))) {
    throw new Error('GITHUB_NOT_CONFIGURED')
  }

  const response = await fetch(`${GITHUB_API}/app/installations/${installationId}/access_tokens`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
    headers: {
      Authorization: `Bearer ${githubAppJwt(appId, privateKey)}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'AnniCal-Feedback',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repositories: [repository[1]], permissions: { issues: 'write' } }),
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

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

async function checkRateLimit(req: IncomingMessage): Promise<boolean> {
  const config = redisConfig()
  if (!config) throw new Error('RATE_LIMIT_UNAVAILABLE')
  const fingerprint = requesterFingerprint(req, config.token, 'annical:feedback:v2')
  const response = await fetch(`${config.url}/pipeline`, {
    method: 'POST',
    signal: AbortSignal.timeout(5000),
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
  const count = Number(payload[0]?.result)
  if (!Number.isSafeInteger(count) || count < 1) throw new Error('RATE_LIMIT_UNAVAILABLE')
  return count <= RATE_LIMIT
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

  if (!anniversary || !route || !Object.hasOwn(TYPE_META, type)) throw new Error('INVALID_INPUT')
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
    signal: AbortSignal.timeout(5000),
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
  if (String(req.headers['content-type'] ?? '').split(';')[0]?.trim().toLowerCase() !== 'application/json') {
    writeJson(res, 415, { error: 'Content-Type must be application/json' })
    return
  }

  try {
    const body = await readJsonObject(req, MAX_BODY_BYTES, ['anniversaryId', 'type', 'message', 'sourceUrl', 'website'])
    if (Object.values(body).some((value) => typeof value !== 'string')) throw new Error('INVALID_INPUT')
    if (!Object.hasOwn(TYPE_META, cleanText(body.type))) throw new Error('INVALID_INPUT')
    // 화면에는 보이지 않는 허니팟. 봇에는 성공처럼 답하되 실제 Issue는 만들지 않는다.
    if (cleanText(body.website)) {
      writeJson(res, 202, { accepted: true })
      return
    }
    if (!await checkRateLimit(req)) {
      res.setHeader('Retry-After', String(RATE_WINDOW_SECONDS))
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
