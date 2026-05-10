import { computed, onMounted, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { occursOn } from '@/utils/dateUtils'
import type { Anniversary } from '@/types/anniversary'

export interface CalendarCell {
  date: Dayjs
  isCurrentMonth: boolean
  isToday: boolean
  anniversaries: Anniversary[]
}

/**
 * 월별 6×7 달력 데이터 + 선택일 상태를 관리하는 컴포저블.
 * 일요일 시작 기준.
 */
export function useMonthCalendar() {
  const store = useAnniversariesStore()
  const today = dayjs().startOf('day')
  const cursor = ref<Dayjs>(today.startOf('month'))
  const selectedDate = ref<Dayjs>(today)

  onMounted(() => store.load())

  const monthLabel = computed(() => cursor.value.format('YYYY년 M월'))

  const weeks = computed<CalendarCell[][]>(() => {
    const start = cursor.value.startOf('month').startOf('week') // 일요일
    const grid: CalendarCell[][] = []
    let d = start
    for (let w = 0; w < 6; w++) {
      const row: CalendarCell[] = []
      for (let i = 0; i < 7; i++) {
        const y = d.year()
        const m = d.month() + 1
        const day = d.date()
        const anvs = store.items.filter((a) => occursOn(a, y, m, day))
        row.push({
          date: d,
          isCurrentMonth: d.month() === cursor.value.month(),
          isToday: d.isSame(today, 'day'),
          anniversaries: anvs,
        })
        d = d.add(1, 'day')
      }
      grid.push(row)
    }
    return grid
  })

  const selectedAnniversaries = computed<Anniversary[]>(() => {
    const y = selectedDate.value.year()
    const m = selectedDate.value.month() + 1
    const day = selectedDate.value.date()
    return store.items.filter((a) => occursOn(a, y, m, day))
  })

  function goPrevMonth() {
    cursor.value = cursor.value.subtract(1, 'month').startOf('month')
  }
  function goNextMonth() {
    cursor.value = cursor.value.add(1, 'month').startOf('month')
  }
  function goToday() {
    cursor.value = today.startOf('month')
    selectedDate.value = today
  }
  function selectDate(d: Dayjs) {
    selectedDate.value = d
    if (d.month() !== cursor.value.month()) {
      cursor.value = d.startOf('month')
    }
  }

  return {
    cursor,
    monthLabel,
    weeks,
    today,
    selectedDate,
    selectedAnniversaries,
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    goPrevMonth,
    goNextMonth,
    goToday,
    selectDate,
  }
}
