import type { IncomingMessage } from 'node:http'
import { createHmac } from 'node:crypto'
import { isIP } from 'node:net'

/** Vercel의 body helper와 순수 Node 스트림 경로에 같은 제한을 적용한다. */
export async function readJsonObject(
  req: IncomingMessage,
  maxBytes: number,
  allowedKeys: readonly string[],
): Promise<Record<string, unknown>> {
  const declared = req.headers['content-length']
  if (declared !== undefined) {
    if (typeof declared !== 'string' || !/^\d+$/.test(declared)) throw new Error('INVALID_INPUT')
    if (Number(declared) > maxBytes) throw new Error('BODY_TOO_LARGE')
  }

  let body = (req as IncomingMessage & { body?: unknown }).body
  if (body === undefined) {
    const chunks: Buffer[] = []
    let size = 0
    for await (const chunk of req) {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > maxBytes) throw new Error('BODY_TOO_LARGE')
      chunks.push(buffer)
    }
    body = Buffer.concat(chunks)
  }

  if (Buffer.isBuffer(body) || typeof body === 'string') {
    if (Buffer.byteLength(body) > maxBytes) throw new Error('BODY_TOO_LARGE')
    body = JSON.parse(body.toString())
  } else {
    const serialized = JSON.stringify(body)
    if (serialized && Buffer.byteLength(serialized) > maxBytes) throw new Error('BODY_TOO_LARGE')
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('INVALID_INPUT')
  const object = body as Record<string, unknown>
  if (Object.keys(object).some((key) => !allowedKeys.includes(key))) throw new Error('INVALID_INPUT')
  return object
}

function clientNetwork(req: IncomingMessage): string {
  // Vercel이 덮어쓰는 헤더만 신뢰한다. 다른 호스팅에서는 소켓 주소를 쓴다.
  const forwarded = req.headers['x-forwarded-for']
  const address = process.env.VERCEL === '1' && typeof forwarded === 'string'
    ? forwarded.trim()
    : req.socket?.remoteAddress ?? ''
  if (isIP(address) === 4) return address
  if (isIP(address) !== 6) return 'unknown'

  const canonical = new URL(`http://[${address}]/`).hostname.slice(1, -1)
  const [left = '', right = ''] = canonical.split('::')
  const head = left ? left.split(':') : []
  const tail = right ? right.split(':') : []
  const parts = canonical.includes('::')
    ? [...head, ...Array<string>(8 - head.length - tail.length).fill('0'), ...tail]
    : head
  const words = parts.map((part) => Number.parseInt(part, 16))
  // IPv4-mapped IPv6도 같은 IPv4 버킷에 넣는다.
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) {
    return [words[6]! >> 8, words[6]! & 255, words[7]! >> 8, words[7]! & 255].join('.')
  }
  // IPv6 임시 주소를 바꿔도 같은 /64에서는 제한을 공유한다.
  return `${words.slice(0, 4).map((word) => word.toString(16)).join(':')}::/64`
}

export function requesterFingerprint(req: IncomingMessage, secret: string, scope: string): string {
  return createHmac('sha256', secret).update(`${scope}:${clientNetwork(req)}`).digest('hex')
}
