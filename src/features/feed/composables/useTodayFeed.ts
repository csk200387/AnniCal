import { computed, onMounted } from 'vue'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { monthsCovering } from '@/services/anniversaryRepository'
import { useNow } from '@/composables/useNow'
import { isToday, daysUntil } from '@/utils/dateUtils'
import type { Anniversary } from '@/types/anniversary'

/**
 * 메인 피드용 컴포저블.
 * - todays: 오늘의 기념일
 * - upcoming: 다가오는 기념일 (N일 이내, 가까운 순)
 *
 * 기준 시각은 공용 시계(useNow)에서 받는다. computed 안에서 `new Date()` 를
 * 부르면 Vue 가 그 값을 의존성으로 보지 않아 한 번 계산된 뒤 영영 굳는다 —
 * 자정을 넘겨도 어제의 피드가 그대로 남는 게 그 때문이었다.
 */
export function useTodayFeed(upcomingWindowDays = 14) {
  const store = useAnniversariesStore()
  const { today } = useNow()

  onMounted(() => {
    // 오늘과 앞뒤 달이면 "오늘 + 다가오는 N일"은 확정된다. 나머지 달은
    // 첫 화면을 막지 않고 뒤이어 받는다 — 홈에서 달력·내보내기로 넘어갈 때
    // 이미 도착해 있게 된다.
    const now = today.value
    const months = new Set(monthsCovering(now.getMonth() + 1))
    const end = new Date(now)
    end.setDate(end.getDate() + upcomingWindowDays)
    for (const m of monthsCovering(end.getMonth() + 1)) months.add(m)
    void store.ensureMonths(months).then(() => store.ensureAll())
  })

  const todays = computed<Anniversary[]>(() =>
    store.items.filter((a) => isToday(a, today.value)),
  )

  const upcoming = computed(() => {
    const from = today.value
    return store.items
      .map((a) => ({ anniversary: a, dDay: daysUntil(a, from) }))
      .filter(
        (x): x is { anniversary: Anniversary; dDay: number } =>
          x.dDay !== null && x.dDay > 0 && x.dDay <= upcomingWindowDays,
      )
      .sort((a, b) => a.dDay - b.dDay)
  })

  return {
    todays,
    upcoming,
    today,
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
  }
}
