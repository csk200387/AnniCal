// 날짜 계산의 경계 조건 — 윤일, 다섯째 요일, 표 범위, 자정, anchor 순환.
import { describe, expect, it } from 'vitest'
import type { Anniversary } from '@/types/anniversary'
import {
  OutOfTableRangeError,
  daysUntil,
  isToday,
  occursOn,
  registerAnchors,
  resolveOccurrence,
  resolveOccurrenceSafe,
  tabulatedYearRange,
} from '@/utils/dateUtils'
import {
  isValidUrlDate,
  shiftUrlDate,
  allUrlDates,
} from '@/utils/anniversaryRoutes'
import {
  msUntilNextSiteMidnight,
  nowInSiteZone,
  todayInSiteZone,
} from '@/utils/clock'

function mk(overrides: Partial<Anniversary>): Anniversary {
  return {
    id: 'x',
    date: '01-01',
    dateType: 'annual-fixed',
    name: 'n',
    category: 'general',
    tags: [],
    memes: [],
    sourceUrl: null,
    storytelling: { origin: '', anecdote: '' },
    ...overrides,
  } as Anniversary
}

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

describe('N번째 요일', () => {
  it('둘째 일요일 — 어머니의 날은 매년 실제 날짜가 다르다', () => {
    const a = mk({ date: '05-2-SUN', dateType: 'annual-nth-weekday' })
    expect(iso(resolveOccurrence(a, 2026))).toBe('2026-05-10')
    expect(iso(resolveOccurrence(a, 2027))).toBe('2027-05-09')
    expect(iso(resolveOccurrence(a, 2028))).toBe('2028-05-14')
  })

  it('L 은 그 달 마지막 해당 요일', () => {
    const a = mk({ date: '05-L-MON', dateType: 'annual-nth-weekday' })
    expect(iso(resolveOccurrence(a, 2026))).toBe('2026-05-25')
  })

  it('다섯째 요일이 없는 달은 다음 달로 넘어가지 않는다', () => {
    // 2026년 2월은 28일(일요일 시작)이라 다섯째 일요일이 없다.
    const a = mk({ date: '02-5-SUN', dateType: 'annual-nth-weekday' })
    const d = resolveOccurrence(a, 2026)
    expect(d.getMonth(), '2월을 벗어나면 안 된다').toBe(1)
    expect(iso(d)).toBe('2026-02-22') // 그 달의 마지막 일요일로 되돌림
  })

  it('해석할 수 없는 규칙은 예외', () => {
    expect(() => resolveOccurrence(mk({ date: '13-9-XXX', dateType: 'annual-nth-weekday' }), 2026)).toThrow()
    expect(resolveOccurrenceSafe(mk({ date: '13-9-XXX', dateType: 'annual-nth-weekday' }), 2026)).toBeNull()
  })
})

describe('annual-tabulated 범위', () => {
  it('표 범위 밖은 조용히 지어내지 않고 예외를 던진다', () => {
    const { max } = tabulatedYearRange()
    const a = mk({ date: 'seollal', dateType: 'annual-tabulated' })
    // 범위 안은 정상
    expect(resolveOccurrence(a, max)).toBeInstanceOf(Date)
    // 범위 밖은 OutOfTableRangeError — 예전에는 max 연도 값을 그대로 붙여
    // 2051년 설날을 2050년 날짜로 표시했다.
    expect(() => resolveOccurrence(a, max + 1)).toThrow(OutOfTableRangeError)
    expect(resolveOccurrenceSafe(a, max + 1)).toBeNull()
  })

  it('범위는 모든 row 의 교집합이다', () => {
    const { min, max } = tabulatedYearRange()
    expect(min).toBeLessThan(max)
    expect(min).toBeGreaterThan(1900)
  })
})

describe('anchor 재귀 가드', () => {
  it('순환 참조가 스택을 터뜨리지 않고 예외로 끝난다', () => {
    const a = mk({ id: 'a', date: 'b:1', dateType: 'annual-relative-to-holiday' })
    const b = mk({ id: 'b', date: 'a:1', dateType: 'annual-relative-to-holiday' })
    registerAnchors([a, b])
    expect(() => resolveOccurrence(a, 2026)).toThrow(/너무 깊|순환/)
    expect(resolveOccurrenceSafe(a, 2026)).toBeNull()
  })

  it('없는 anchor 는 예외', () => {
    registerAnchors([])
    expect(resolveOccurrenceSafe(mk({ date: 'ghost:1', dateType: 'annual-relative-to-holiday' }), 2026)).toBeNull()
  })
})

describe('URL 날짜 검증과 이웃', () => {
  it('366일 전부를 유효로 본다', () => {
    expect(allUrlDates()).toHaveLength(366)
    expect(isValidUrlDate('02-29')).toBe(true)
    expect(isValidUrlDate('12-31')).toBe(true)
  })

  it('달력에 없는 날짜는 거부한다', () => {
    // 정규식만 쓰던 시절엔 전부 통과했다.
    for (const bad of ['02-31', '04-31', '06-31', '99-99', '00-01', '01-00', '13-01']) {
      expect(isValidUrlDate(bad), bad).toBe(false)
    }
  })

  it('2월 29일의 이웃이 2/28 과 3/1 이다', () => {
    // 비윤년 기준 Date 산술을 쓰던 시절엔 02-29 가 03-01 로 normalize 돼
    // 다음 날이 03-02 가 됐다.
    expect(shiftUrlDate('02-29', -1)).toBe('02-28')
    expect(shiftUrlDate('02-29', 1)).toBe('03-01')
    expect(shiftUrlDate('02-28', 1)).toBe('02-29')
    expect(shiftUrlDate('03-01', -1)).toBe('02-29')
  })

  it('연말연시를 순환한다', () => {
    expect(shiftUrlDate('12-31', 1)).toBe('01-01')
    expect(shiftUrlDate('01-01', -1)).toBe('12-31')
  })
})

describe('오늘 기준 계산', () => {
  it('isToday 는 넘긴 기준일을 따른다', () => {
    registerAnchors([])
    const a = mk({ date: '03-14' })
    expect(isToday(a, new Date(2026, 2, 14))).toBe(true)
    expect(isToday(a, new Date(2026, 2, 15))).toBe(false)
  })

  it('daysUntil 은 올해가 지났으면 내년으로 롤오버한다', () => {
    const a = mk({ date: '01-01' })
    expect(daysUntil(a, new Date(2026, 11, 31))).toBe(1)
    expect(daysUntil(a, new Date(2026, 0, 1))).toBe(0)
  })

  it('계산 불가면 null 을 돌려준다 (0 이나 NaN 이 아니라)', () => {
    registerAnchors([])
    expect(daysUntil(mk({ date: 'ghost:1', dateType: 'annual-relative-to-holiday' }), new Date(2026, 0, 1))).toBeNull()
  })

  it('occursOn 은 계산 실패를 false 로 흡수한다', () => {
    registerAnchors([])
    expect(occursOn(mk({ date: 'ghost:1', dateType: 'annual-relative-to-holiday' }), 2026, 1, 1)).toBe(false)
  })
})

describe('사이트 기준 시계 (Asia/Seoul)', () => {
  it('보는 사람의 타임존과 무관하게 서울 날짜를 낸다', () => {
    // 2026-03-14 00:30 KST = 2026-03-13 15:30 UTC
    const utc = new Date(Date.UTC(2026, 2, 13, 15, 30))
    const seoul = nowInSiteZone(utc)
    expect(seoul.getFullYear()).toBe(2026)
    expect(seoul.getMonth() + 1).toBe(3)
    expect(seoul.getDate()).toBe(14)
  })

  it('서울 자정 직전/직후로 날짜가 넘어간다', () => {
    const before = todayInSiteZone(new Date(Date.UTC(2026, 2, 13, 14, 59))) // 23:59 KST
    const after = todayInSiteZone(new Date(Date.UTC(2026, 2, 13, 15, 1))) // 00:01 KST
    expect(before.getDate()).toBe(13)
    expect(after.getDate()).toBe(14)
  })

  it('다음 자정까지 남은 시간이 24시간 이내 양수다', () => {
    for (const h of [0, 6, 14, 15, 23]) {
      const ms = msUntilNextSiteMidnight(new Date(Date.UTC(2026, 2, 13, h)))
      expect(ms, `UTC ${h}시`).toBeGreaterThan(0)
      expect(ms).toBeLessThanOrEqual(24 * 60 * 60 * 1000 + 1000)
    }
  })
})
