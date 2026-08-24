// 공개 구독 API — 인증이 없으므로 입력 검증과 캐시 정규화가 곧 방어선이다.
import { describe, expect, it } from 'vitest'
import handler from '../api/calendar'
import { allAnniversaries } from '../src/data/anniversaries/all'

interface Reply {
  status: number
  body: string
  headers: Record<string, string>
}

function call(method: string, url: string, headers: Record<string, string> = {}): Reply {
  const req = { method, url, headers } as never
  const reply: Reply = { status: 0, body: '', headers: {} }
  const res = {
    get statusCode() {
      return reply.status
    },
    set statusCode(v: number) {
      reply.status = v
    },
    setHeader: (k: string, v: string) => {
      reply.headers[k.toLowerCase()] = String(v)
    },
    end: (b?: string) => {
      reply.body = b ?? ''
    },
  } as never
  handler(req, res)
  return reply
}

const veventCount = (s: string) => (s.match(/\r\nBEGIN:VEVENT\r\n/g) ?? []).length

describe('메서드 제한', () => {
  it('GET 과 HEAD 만 허용한다', () => {
    expect(call('GET', '/api/calendar').status).toBe(200)
    expect(call('HEAD', '/api/calendar').status).toBe(200)
  })

  it('그 외 메서드는 405 + Allow', () => {
    for (const m of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const r = call(m, '/api/calendar')
      expect(r.status, m).toBe(405)
      expect(r.headers.allow).toBe('GET, HEAD')
      // 405 에 1MB 본문을 실어 보내면 거부하는 의미가 없다.
      expect(r.body.length).toBeLessThan(100)
    }
  })

  it('HEAD 는 본문을 만들지 않지만 Content-Length 는 알려준다', () => {
    const r = call('HEAD', '/api/calendar')
    expect(r.body).toBe('')
    expect(Number(r.headers['content-length'])).toBeGreaterThan(0)
  })
})

describe('쿼리 검증', () => {
  it('categories 외의 키는 400 — 캐시 키를 무한히 늘리지 못하게', () => {
    expect(call('GET', '/api/calendar?nonce=1').status).toBe(400)
    expect(call('GET', '/api/calendar?foo=1&categories=food').status).toBe(400)
  })

  it('지나치게 긴 쿼리는 414', () => {
    expect(call('GET', `/api/calendar?categories=${'a'.repeat(300)}`).status).toBe(414)
  })

  it('유효한 카테고리가 하나도 없으면 400 (전체 피드로 넘어가지 않는다)', () => {
    // "카테고리를 전부 해제했더니 전체가 구독됐다"가 이 지점의 사고였다.
    expect(call('GET', '/api/calendar?categories=').status).toBe(400)
    expect(call('GET', '/api/calendar?categories=bogus').status).toBe(400)
    expect(call('GET', '/api/calendar?categories=,,,').status).toBe(400)
  })
})

describe('캐시 키 정규화', () => {
  it('순서·대소문자·중복·오타를 하나의 정규형으로 접는다', () => {
    const base = call('GET', '/api/calendar?categories=food,holiday')
    for (const variant of [
      '/api/calendar?categories=holiday,food',
      '/api/calendar?categories=FOOD,HOLIDAY',
      '/api/calendar?categories=food,food,holiday',
      '/api/calendar?categories=food,holiday,unknown-id',
      '/api/calendar?categories= food , holiday ',
    ]) {
      expect(call('GET', variant).headers.etag, variant).toBe(base.headers.etag)
    }
  })

  it('선택이 다르면 ETag 도 다르다', () => {
    const a = call('GET', '/api/calendar?categories=food').headers.etag
    const b = call('GET', '/api/calendar?categories=holiday').headers.etag
    const all = call('GET', '/api/calendar').headers.etag
    expect(new Set([a, b, all]).size).toBe(3)
  })
})

describe('조건부 요청과 결정성', () => {
  it('ETag 가 같으면 304 를 본문 없이 돌려준다', () => {
    const full = call('GET', '/api/calendar')
    const again = call('GET', '/api/calendar', { 'if-none-match': full.headers.etag })
    expect(again.status).toBe(304)
    expect(again.body).toBe('')
  })

  it('같은 요청은 항상 같은 바이트를 낸다', () => {
    // DTSTAMP 에 요청 시각을 넣던 시절엔 매번 달라져 캐시가 무의미했고,
    // 캘린더 앱은 전체 이벤트를 "변경됨"으로 처리했다.
    expect(call('GET', '/api/calendar').body).toBe(call('GET', '/api/calendar').body)
  })

  it('Last-Modified 와 nosniff 를 함께 보낸다', () => {
    const r = call('GET', '/api/calendar')
    expect(r.headers['last-modified']).toBeTruthy()
    expect(r.headers['x-content-type-options']).toBe('nosniff')
    expect(r.headers['content-type']).toContain('text/calendar')
  })
})

describe('필터 동작', () => {
  it('부분 선택은 전체보다 적고 0 보다 많다', () => {
    const all = veventCount(call('GET', '/api/calendar').body)
    const food = veventCount(call('GET', '/api/calendar?categories=food').body)
    expect(food).toBeGreaterThan(0)
    expect(food).toBeLessThan(all)
  })

  it('두 카테고리의 합이 각각의 합과 같다', () => {
    const food = veventCount(call('GET', '/api/calendar?categories=food').body)
    const holiday = veventCount(call('GET', '/api/calendar?categories=holiday').body)
    const both = veventCount(call('GET', '/api/calendar?categories=food,holiday').body)
    expect(both).toBe(food + holiday)
  })
})

// ─── 그룹(법정기념일) 필터 ───────────────────────────────────────
// 그룹은 category 와 달리 tags 에 레이블로 들어 있고, URL 로는 ASCII id 를 받는다.
// 카테고리와 OR 로 합쳐지는 것이 핵심이라 그 경계를 못 박아 둔다.
describe('groups 필터', () => {
  const statutoryCount = allAnniversaries.filter((a) =>
    a.tags.includes('법정기념일'),
  ).length

  it('groups=statutory 는 법정기념일만 담는다', () => {
    expect(statutoryCount).toBeGreaterThan(0)
    const r = call('GET', '/api/calendar?groups=statutory')
    expect(r.status).toBe(200)
    expect(veventCount(r.body)).toBe(statutoryCount)
  })

  it('카테고리와 그룹은 OR 로 합쳐진다', () => {
    const onlyCat = veventCount(call('GET', '/api/calendar?categories=romance').body)
    const both = veventCount(
      call('GET', '/api/calendar?categories=romance&groups=statutory').body,
    )
    // romance 에는 법정기념일이 없으므로 정확히 합만큼 늘어난다.
    expect(both).toBe(onlyCat + statutoryCount)
    expect(both).toBeLessThan(allAnniversaries.length)
  })

  it('알 수 없는 그룹 id 만 주면 전체 피드로 새지 않는다', () => {
    const r = call('GET', '/api/calendar?groups=nope')
    expect(r.status).toBe(400)
  })

  it('카테고리가 무효여도 그룹이 유효하면 그룹만 내보낸다', () => {
    const r = call('GET', '/api/calendar?categories=nope&groups=statutory')
    expect(r.status).toBe(200)
    expect(veventCount(r.body)).toBe(statutoryCount)
  })

  it('허용하지 않는 쿼리 키는 여전히 거절한다', () => {
    expect(call('GET', '/api/calendar?tags=statutory').status).toBe(400)
  })

  it('순서만 다른 요청은 같은 ETag 를 쓴다', () => {
    const a = call('GET', '/api/calendar?categories=food,romance&groups=statutory')
    const b = call('GET', '/api/calendar?groups=statutory&categories=romance,food')
    expect(a.headers.etag).toBe(b.headers.etag)
  })
})
