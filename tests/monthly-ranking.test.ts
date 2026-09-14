import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useMonthlyRanking } from '@/features/stats/composables/useMonthlyRanking'
import { shiftMonth } from '@/features/stats/months'

afterEach(() => vi.unstubAllGlobals())

describe('월별 순위 탐색', () => {
  it('지난달·다음 달 이동은 연도 경계를 넘는다', () => {
    expect(shiftMonth('2027-01', -1)).toBe('2026-12')
    expect(shiftMonth('2026-12', 1)).toBe('2027-01')
  })

  it('늦게 도착한 이번 달 응답이 선택한 지난달 결과를 덮지 않는다', async () => {
    const resolvers: Array<(response: Response) => void> = []
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => resolvers.push(resolve))))
    const scope = effectScope()
    const month = ref('2026-09')
    const ranking = scope.run(() => useMonthlyRanking(month))!
    month.value = '2026-08'
    await nextTick()
    const response = (month: string) => new Response(JSON.stringify({ month, currentMonth: '2026-09', trackingStartedOn: '2026-08-01', ranking: [] }))
    resolvers[1]!(response('2026-08'))
    await vi.waitFor(() => expect(ranking.data.value?.month).toBe('2026-08'))
    resolvers[0]!(response('2026-09'))
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(ranking.data.value?.month).toBe('2026-08')
    expect(ranking.failed.value).toBe(false)
    scope.stop()
  })

  it('집계 장애를 빈 순위로 처리하지 않고 재시도할 수 있다', async () => {
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ month: '2026-09', currentMonth: '2026-09', trackingStartedOn: '2026-09-14', ranking: [] }))))
    const scope = effectScope()
    const ranking = scope.run(() => useMonthlyRanking(ref('2026-09')))!
    await vi.waitFor(() => expect(ranking.failed.value).toBe(true))
    expect(ranking.data.value).toBeNull()
    await ranking.refresh()
    expect(ranking.failed.value).toBe(false)
    expect(ranking.data.value?.ranking).toEqual([])
    scope.stop()
  })
})
