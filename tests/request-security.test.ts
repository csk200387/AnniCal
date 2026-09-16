import { Readable } from 'node:stream'
import type { IncomingMessage } from 'node:http'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { readJsonObject, requesterFingerprint } from '../server/request'

function request(body: unknown, headers: Record<string, string> = {}): IncomingMessage {
  return { body, headers } as unknown as IncomingMessage
}

afterEach(() => vi.unstubAllEnvs())

describe('제한된 JSON 본문', () => {
  it('Content-Length는 body getter를 읽기 전에 검사한다', async () => {
    const getter = vi.fn(() => ({ message: 'ok' }))
    const req = { headers: { 'content-length': '100000' }, get body() { return getter() } }
    await expect(readJsonObject(req as unknown as IncomingMessage, 1024, ['message'])).rejects.toThrow('BODY_TOO_LARGE')
    expect(getter).not.toHaveBeenCalled()
  })

  it('파싱된 객체도 문자열 길이가 아닌 UTF-8 바이트로 제한한다', async () => {
    await expect(readJsonObject(request({ message: '한'.repeat(400) }), 1024, ['message'])).rejects.toThrow('BODY_TOO_LARGE')
    expect(await readJsonObject(request({ message: 'ok' }), 1024, ['message'])).toEqual({ message: 'ok' })
  })

  it('본문 Buffer와 문자열도 크기를 제한한다', async () => {
    for (const body of [' '.repeat(1025), Buffer.alloc(1025)]) {
      await expect(readJsonObject(request(body), 1024, [])).rejects.toThrow('BODY_TOO_LARGE')
    }
    expect(await readJsonObject(request('{"message":"ok"}'), 1024, ['message'])).toEqual({ message: 'ok' })
  })

  it('선언 길이가 작거나 없어도 스트림의 실제 누적 바이트를 제한한다', async () => {
    for (const headers of [{}, { 'content-length': '1' }]) {
      const stream = Object.assign(Readable.from(['x'.repeat(700), 'x'.repeat(700)]), { headers })
      await expect(readJsonObject(stream as unknown as IncomingMessage, 1024, [])).rejects.toThrow('BODY_TOO_LARGE')
    }
    const stream = Object.assign(Readable.from(['{"message":', '"ok"}']), { headers: {} })
    expect(await readJsonObject(stream as unknown as IncomingMessage, 1024, ['message'])).toEqual({ message: 'ok' })
  })

  it('null·배열·원시값·허용하지 않은 필드·잘못된 JSON을 거절한다', async () => {
    for (const body of [null, [], 1, true, { unexpected: 'field' }, '{bad']) {
      await expect(readJsonObject(request(body), 1024, ['message'])).rejects.toThrow()
    }
  })
})

describe('요청 제한용 네트워크 식별', () => {
  function fingerprint(address: string, forwarded?: string): string {
    const req = { headers: { 'x-forwarded-for': forwarded }, socket: { remoteAddress: address } }
    return requesterFingerprint(req as unknown as IncomingMessage, 'test-only-secret', 'stats')
  }

  it('Vercel 밖에서는 임의의 forwarded 헤더를 무시한다', () => {
    vi.stubEnv('VERCEL', '')
    expect(fingerprint('192.0.2.1', '198.51.100.1')).toBe(fingerprint('192.0.2.1', '198.51.100.2'))
    expect(fingerprint('192.0.2.1')).not.toBe(fingerprint('192.0.2.2'))
  })

  it('Vercel에서는 검증된 단일 IP 헤더만 사용한다', () => {
    vi.stubEnv('VERCEL', '1')
    expect(fingerprint('127.0.0.1', '192.0.2.1')).toBe(fingerprint('127.0.0.2', '192.0.2.1'))
    expect(fingerprint('127.0.0.1', '192.0.2.1')).not.toBe(fingerprint('127.0.0.1', '192.0.2.2'))
    expect(fingerprint('127.0.0.1', 'not-an-ip')).toBe(fingerprint('127.0.0.1', '192.0.2.1, 10.0.0.1'))
  })

  it('IPv4-mapped 주소와 IPv6 /64의 표기·임시 주소 변경을 정규화한다', () => {
    vi.stubEnv('VERCEL', '')
    expect(fingerprint('::ffff:192.0.2.1')).toBe(fingerprint('192.0.2.1'))
    expect(fingerprint('2001:db8:1234:5678::1')).toBe(fingerprint('2001:0DB8:1234:5678:ffff:ffff:ffff:ffff'))
    expect(fingerprint('2001:db8:1234:5678::1')).not.toBe(fingerprint('2001:db8:1234:5679::1'))
    expect(fingerprint('2001:db8::1')).toMatch(/^[a-f0-9]{64}$/)
  })
})
