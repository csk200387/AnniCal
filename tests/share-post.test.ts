import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Anniversary } from '@/types/anniversary'
import { shareMessageFor } from '@/utils/sharePost'

const anniversary: Anniversary = {
  id: 'test', name: '파이의 날 (Pi Day)', date: '03-14', dateType: 'annual-fixed',
  category: 'general', tags: [], memes: [], sourceUrl: null,
  storytelling: { origin: '', anecdote: '' },
}

afterEach(() => vi.useRealTimers())

describe('공유 문구의 날짜 기준', () => {
  it('서울 자정을 기준으로 오늘 문구로 전환한다', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-13T14:59:59Z'))
    expect(shareMessageFor(anniversary)).toBe('3월14일은 무슨 날? 파이의 날.\nAnnical에서 다른 기념일을 구경해보세요.')
    vi.setSystemTime(new Date('2026-03-13T15:00:00Z'))
    expect(shareMessageFor(anniversary)).toBe('오늘은 무슨 날? 파이의 날.\nAnnical에서 자세한 정보를 알아보세요.')
  })

  it('이동 기념일은 해당 연도의 날짜로 비교한다', () => {
    const floating = { ...anniversary, name: '어머니의 날', date: '05-2-SUN', dateType: 'annual-nth-weekday' as const }
    expect(shareMessageFor(floating, null, new Date(2026, 4, 10))).toContain('오늘은 무슨 날?')
    expect(shareMessageFor(floating, null, new Date(2027, 4, 10))).toContain('5월9일은 무슨 날?')
  })

  it('이전 연도의 일회성 기념일을 오늘로 표시하지 않는다', () => {
    const past = { ...anniversary, date: '2025-03-14', dateType: 'one-time' as const }
    expect(shareMessageFor(past, null, new Date(2026, 2, 14))).toContain('3월14일은 무슨 날?')
  })

  it('생일 공유는 공유 링크의 날짜와 연도를 따른다', () => {
    expect(shareMessageFor(anniversary, { date: '03-14', year: 2026 }, new Date(2026, 2, 14))).toContain('오늘은 무슨 날?')
    expect(shareMessageFor(anniversary, { date: '03-14', year: 2025 }, new Date(2026, 2, 14))).toContain('3월14일은 무슨 날?')
  })

  it('윤일을 3월 1일로 바꾸지 않는다', () => {
    expect(shareMessageFor({ ...anniversary, date: '02-29' }, null, new Date(2026, 2, 1))).toContain('2월29일은 무슨 날?')
  })
})
