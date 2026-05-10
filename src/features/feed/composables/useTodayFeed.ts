import { computed, onMounted } from 'vue'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { isToday, daysUntil } from '@/utils/dateUtils'
import type { Anniversary } from '@/types/anniversary'

/**
 * 메인 피드용 컴포저블.
 * - todays: 오늘의 기념일
 * - upcoming: 다가오는 기념일 (N일 이내, 가까운 순)
 */
export function useTodayFeed(upcomingWindowDays = 14) {
  const store = useAnniversariesStore()

  onMounted(() => {
    store.load()
  })

  const todays = computed<Anniversary[]>(() =>
    store.items.filter((a) => isToday(a)),
  )

  const upcoming = computed(() => {
    const now = new Date()
    return store.items
      .map((a) => ({ anniversary: a, dDay: daysUntil(a, now) }))
      .filter(({ dDay }) => dDay > 0 && dDay <= upcomingWindowDays)
      .sort((a, b) => a.dDay - b.dDay)
  })

  return {
    todays,
    upcoming,
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
  }
}
