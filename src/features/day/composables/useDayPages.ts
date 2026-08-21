import { computed, watch, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { ALL_MONTHS, monthsCovering } from '@/services/anniversaryRepository'
import { useNow } from '@/composables/useNow'
import type { Anniversary } from '@/types/anniversary'
import {
  idForPath,
  isValidUrlDate,
  koreanUrlDate,
  routeForId,
} from '@/utils/anniversaryRoutes'
import { formatKoreanMonthDay, resolveOccurrenceSafe } from '@/utils/dateUtils'

/** urlDate("03-22") → "3월 22일". 유효하지 않은 값은 그대로 돌려준다. */
export function formatUrlDate(urlDate: string): string {
  return koreanUrlDate(urlDate) ?? urlDate
}

/**
 * 이 날짜 페이지에 필요한 달만 먼저 받고, 나머지는 뒤이어 채운다.
 *
 * 기념일 하나를 보러 온 사람에게 12개 월 파일을 전부 내려보낼 이유가 없다.
 * 앞뒤 달까지 3개만 있으면 이 날짜의 목록은 확정된다(음력 명절이 최대 한 달,
 * 기준일 상대 기념일이 며칠 움직이는 것까지 이 범위가 덮는다).
 * "비슷한 주제의 기념일"은 전체가 있어야 잘 고를 수 있으므로, 첫 화면을 막지
 * 않고 뒤에서 마저 받아 온다.
 */
function useLoadedStore(urlDate: ComputedRef<string>) {
  const store = useAnniversariesStore()

  function prime() {
    const month = Number(urlDate.value.slice(0, 2))
    const needed = Number.isInteger(month) && month >= 1 && month <= 12
      ? monthsCovering(month)
      : ALL_MONTHS
    void store.ensureMonths(needed).then(() => store.ensureAll())
  }

  // 라우트 직접 진입(프리렌더된 HTML) 시에도 데이터가 필요하므로 여기서 보장한다.
  prime()
  watch(urlDate, prime)

  return store
}

/** 화면이 구분해서 그려야 하는 네 가지 상태. */
export type PageState = 'loading' | 'error' | 'ready' | 'not-found'

export interface DayDetail {
  anniversary: ComputedRef<Anniversary | null>
  /** 같은 날(그 해 실제 발생일 기준)의 다른 기념일. */
  sameDay: ComputedRef<Anniversary[]>
  /** 같은 카테고리의 다른 기념일 (최대 6건) — 관련 문서 링크용. */
  related: ComputedRef<Anniversary[]>
  /** 올해 실제 발생일의 MM-DD. 허브 링크와 표시에 쓴다. */
  actualUrlDate: ComputedRef<string | null>
  /** 올해 실제 발생일 "5월 9일". */
  actualDateLabel: ComputedRef<string | null>
  /** URL 에 박힌 날짜와 올해 실제 날짜가 다른가. */
  dateDrifts: ComputedRef<boolean>
  state: ComputedRef<PageState>
  error: ComputedRef<string | null>
  retry: () => void
}

/** 관련 문서 링크 최대 건수. */
const RELATED_LIMIT = 6

export function useDayDetail(
  urlDate: ComputedRef<string>,
  slug: ComputedRef<string>,
): DayDetail {
  const store = useLoadedStore(urlDate)
  const { items, hasData, isLoading, error } = storeToRefs(store)
  const { today } = useNow()

  const targetId = computed(() => idForPath(urlDate.value, slug.value))

  const anniversary = computed(() => {
    if (!targetId.value) return null
    return store.byId.get(targetId.value) ?? null
  })

  /** 올해 실제 발생일. URL 의 고정 날짜가 아니라 이 값이 "언제인가"의 답이다. */
  const occurrence = computed(() => {
    const a = anniversary.value
    return a ? resolveOccurrenceSafe(a, today.value.getFullYear()) : null
  })

  const actualUrlDate = computed(() => {
    const d = occurrence.value
    if (!d) return null
    return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  })

  const actualDateLabel = computed(() => {
    const a = anniversary.value
    return a ? formatKoreanMonthDay(a, today.value.getFullYear()) : null
  })

  const dateDrifts = computed(
    () => !!actualUrlDate.value && actualUrlDate.value !== urlDate.value,
  )

  // "같은 날의 다른 기념일" 은 URL 의 고정 날짜가 아니라 올해 실제로 같은 날에
  // 일어나는 것들이어야 한다. 그래야 2027년에 어머니의 날(5/9) 페이지가
  // 5월 10일 기념일이 아니라 5월 9일 기념일을 이웃으로 보여준다.
  const sameDay = computed(() => {
    const d = occurrence.value
    if (!d) return []
    return store
      .onDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
      .filter((a) => a.id !== targetId.value && routeForId(a.id))
  })

  const related = computed(() => {
    const current = anniversary.value
    if (!current) return []
    const excluded = new Set([current.id, ...sameDay.value.map((a) => a.id)])
    const out: Anniversary[] = []
    for (const a of items.value) {
      if (a.category !== current.category || excluded.has(a.id)) continue
      if (!routeForId(a.id)) continue
      out.push(a)
      if (out.length >= RELATED_LIMIT) break
    }
    return out
  })

  // 로딩·오류·정상·없음을 구분한다. 예전에는 전부 "없음"으로 뭉뚱그려서,
  // 청크 하나가 실패해도 프리렌더된 본문을 지우고 "찾을 수 없는 기념일"을 띄웠다.
  const state = computed<PageState>(() => {
    if (!targetId.value) return 'not-found' // 매핑 자체가 없으면 데이터와 무관하게 404
    if (anniversary.value) return 'ready'
    if (error.value) return 'error'
    // 필요한 달이 아직 안 왔으면 로딩이다. routes.json 에 매핑이 있는데 항목이
    // 안 보이는 건 "없음"이 아니라 "아직 안 옴"이다.
    if (isLoading.value || !hasData.value) return 'loading'
    return 'not-found'
  })

  return {
    anniversary,
    sameDay,
    related,
    actualUrlDate,
    actualDateLabel,
    dateDrifts,
    state,
    error: computed(() => error.value),
    retry: store.retry,
  }
}

export interface DateHub {
  anniversaries: ComputedRef<Anniversary[]>
  label: ComputedRef<string>
  isValid: ComputedRef<boolean>
  state: ComputedRef<PageState>
  error: ComputedRef<string | null>
  retry: () => void
}

export function useDateHub(urlDate: ComputedRef<string>): DateHub {
  const store = useLoadedStore(urlDate)
  const { hasData, isLoading, error } = storeToRefs(store)
  const { today } = useNow()

  const isValid = computed(() => isValidUrlDate(urlDate.value))

  /**
   * 이 날짜에 실제로 일어나는 기념일들 — 올해 기준.
   *
   * 예전에는 routes.json 의 고정 urlDate 로 묶었다. 그러면 2027년에도
   * /day/05-10 이 어머니의 날(실제 5/9)을 "5월 10일 기념일"이라고 보여준다.
   * 주소는 그대로 두되 목록은 매년 실제 날짜를 따르게 한다.
   */
  const anniversaries = computed(() => {
    if (!isValid.value) return []
    const [mm, dd] = urlDate.value.split('-').map(Number)
    return store
      .onDate(today.value.getFullYear(), mm, dd)
      .filter((a) => routeForId(a.id))
  })

  const state = computed<PageState>(() => {
    if (!isValid.value) return 'not-found'
    if (error.value) return 'error'
    if (isLoading.value || !hasData.value) return 'loading'
    return 'ready'
  })

  return {
    anniversaries,
    label: computed(() => formatUrlDate(urlDate.value)),
    isValid,
    state,
    error: computed(() => error.value),
    retry: store.retry,
  }
}
