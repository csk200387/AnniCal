import { onScopeDispose, ref, shallowRef, watch, type Ref } from 'vue'
import type { MonthlyRanking } from '@/types/stats'

/** 누적 통계 요청과 분리해 과거 순위가 현재 순위로 덮이는 것을 막는다. */
export function useMonthlyRanking(month: Ref<string>) {
  const data = shallowRef<MonthlyRanking | null>(null)
  const loading = ref(false)
  const failed = ref(false)
  let controller: AbortController | null = null
  let version = 0

  async function refresh() {
    const requestVersion = ++version
    controller?.abort()
    data.value = null
    failed.value = false
    if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month.value)) { loading.value = false; return }
    controller = new AbortController()
    loading.value = true
    try {
      const response = await fetch(`/api/stats?month=${encodeURIComponent(month.value)}`, { signal: controller.signal })
      if (!response.ok) throw new Error('Monthly ranking unavailable')
      const raw = await response.json() as MonthlyRanking
      if (raw.month !== month.value || !Array.isArray(raw.ranking) || typeof raw.currentMonth !== 'string'
        || (raw.trackingStartedOn !== null && typeof raw.trackingStartedOn !== 'string')) throw new Error('Invalid ranking')
      if (requestVersion === version) data.value = raw
    } catch {
      if (requestVersion === version) failed.value = true
    } finally {
      if (requestVersion === version) loading.value = false
    }
  }
  watch(month, refresh, { immediate: true })
  onScopeDispose(() => { ++version; controller?.abort() })
  return { data, loading, failed, refresh }
}
