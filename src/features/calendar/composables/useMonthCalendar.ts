import { computed, onMounted, ref } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { monthsCovering } from '@/services/anniversaryRepository'
import { useNow } from '@/composables/useNow'
import { resolveOccurrenceSafe, tabulatedYearRange } from '@/utils/dateUtils'
import type { Anniversary } from '@/types/anniversary'

export interface CalendarCell {
  date: Dayjs
  isCurrentMonth: boolean
  isToday: boolean
  anniversaries: Anniversary[]
}

/** 검색 결과 최대 건수. */
const SEARCH_LIMIT = 30

/**
 * 월별 6×7 달력 데이터 + 선택일 상태를 관리하는 컴포저블.
 * 일요일 시작 기준.
 */
export function useMonthCalendar() {
  const store = useAnniversariesStore()
  const { today: todayDate } = useNow()

  const today = computed(() => dayjs(todayDate.value).startOf('day'))
  const cursor = ref<Dayjs>(dayjs(todayDate.value).startOf('month'))
  const selectedDate = ref<Dayjs>(dayjs(todayDate.value).startOf('day'))

  onMounted(() => {
    // 보이는 달과 앞뒤 달을 먼저 그리고, 검색·월 이동에 필요한 나머지는
    // 뒤이어 받는다.
    void store
      .ensureMonths(monthsCovering(cursor.value.month() + 1))
      .then(() => store.ensureAll())
  })

  const monthLabel = computed(() => cursor.value.format('YYYY년 M월'))

  // 음력·절기는 표에 있는 연도만 답할 수 있다. 표 밖으로 나가면 그 항목들이
  // 조용히 빠지므로, 이동을 막고 화면에 이유를 알린다.
  const yearRange = tabulatedYearRange()
  const canGoPrev = computed(
    () => cursor.value.subtract(1, 'month').year() >= yearRange.min,
  )
  const canGoNext = computed(
    () => cursor.value.add(1, 'month').year() <= yearRange.max,
  )
  /** 그 달로 커서를 옮겨도 되는지 — 표에 있는 연도 안인지. */
  function isMonthInRange(d: Dayjs): boolean {
    return d.year() >= yearRange.min && d.year() <= yearRange.max
  }

  const outOfRangeNotice = computed(() => {
    const y = cursor.value.year()
    if (y < yearRange.min || y > yearRange.max) {
      return `음력 명절과 24절기는 ${yearRange.min}~${yearRange.max}년만 수록돼 있어요.`
    }
    return null
  })

  const weeks = computed<CalendarCell[][]>(() => {
    const start = cursor.value.startOf('month').startOf('week') // 일요일
    const todayValue = today.value
    const cursorMonth = cursor.value.month()
    const grid: CalendarCell[][] = []
    let d = start
    for (let w = 0; w < 6; w++) {
      const row: CalendarCell[] = []
      for (let i = 0; i < 7; i++) {
        row.push({
          date: d,
          isCurrentMonth: d.month() === cursorMonth,
          isToday: d.isSame(todayValue, 'day'),
          // 전수 스캔 대신 스토어의 연도별 색인을 조회한다.
          anniversaries: store.onDate(d.year(), d.month() + 1, d.date()),
        })
        d = d.add(1, 'day')
      }
      grid.push(row)
    }
    return grid
  })

  const selectedAnniversaries = computed<Anniversary[]>(() =>
    store.onDate(
      selectedDate.value.year(),
      selectedDate.value.month() + 1,
      selectedDate.value.date(),
    ),
  )

  // 검색: 이름 또는 태그에 질의어가 포함되는 기념일.
  const searchQuery = ref('')
  const searchResults = computed<Anniversary[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    if (!q) return []
    const out: Anniversary[] = []
    for (const { anniversary, haystack } of store.searchIndex) {
      if (haystack.includes(q)) {
        out.push(anniversary)
        if (out.length >= SEARCH_LIMIT) break // 30건을 채우면 더 볼 이유가 없다
      }
    }
    return out
  })

  /**
   * 달을 옮길 때 선택일도 함께 옮긴다.
   * 예전에는 커서만 움직여서, 새 달 격자에는 선택 셀이 없는데 아래 "선택한 날짜"
   * 영역은 이전 달 날짜와 그 기념일을 계속 보여줬다.
   * 같은 '일'을 유지하되 그 달에 없는 날이면 말일로 맞춘다(1/31 → 2/28).
   */
  function moveCursor(months: number) {
    const nextCursor = cursor.value.add(months, 'month').startOf('month')
    cursor.value = nextCursor
    const day = Math.min(selectedDate.value.date(), nextCursor.daysInMonth())
    selectedDate.value = nextCursor.date(day)
  }

  function goPrevMonth() {
    if (canGoPrev.value) moveCursor(-1)
  }
  function goNextMonth() {
    if (canGoNext.value) moveCursor(1)
  }
  function goToday() {
    cursor.value = today.value.startOf('month')
    selectedDate.value = today.value
  }
  function selectDate(d: Dayjs) {
    // 6×7 격자는 앞뒤 달을 물고 있다. 2050년 12월 화면의 끝 셀은 2051년 1월인데,
    // 그걸 클릭하면 커서가 표 범위 밖으로 나가 음력·절기가 조용히 사라진다.
    // 다음 달 버튼을 막아 둔 것과 같은 이유로 여기서도 막는다.
    if (!isMonthInRange(d)) return
    selectedDate.value = d
    if (!d.isSame(cursor.value, 'month')) {
      cursor.value = d.startOf('month')
    }
  }
  /** 검색 결과 클릭 → 현재 커서 연도 기준 발생일로 이동·선택. */
  function selectAnniversary(anv: Anniversary) {
    const occ = resolveOccurrenceSafe(anv, cursor.value.year())
    if (occ) selectDate(dayjs(occ))
  }

  return {
    cursor,
    monthLabel,
    weeks,
    today,
    selectedDate,
    selectedAnniversaries,
    searchQuery,
    searchResults,
    canGoPrev,
    canGoNext,
    isMonthInRange,
    outOfRangeNotice,
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    retry: store.retry,
    goPrevMonth,
    goNextMonth,
    goToday,
    selectDate,
    selectAnniversary,
  }
}
