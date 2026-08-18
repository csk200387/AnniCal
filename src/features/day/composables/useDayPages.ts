import { computed, type ComputedRef } from 'vue'
import { storeToRefs } from 'pinia'
import { useAnniversariesStore } from '@/stores/anniversaries'
import type { Anniversary } from '@/types/anniversary'
import { idForPath, idsForDate, routeForId } from '@/utils/anniversaryRoutes'

/** urlDate("03-22") → "3월 22일" */
export function formatUrlDate(urlDate: string): string {
  const [mm, dd] = urlDate.split('-').map(Number)
  return `${mm}월 ${dd}일`
}

function useLoadedStore() {
  const store = useAnniversariesStore()
  // 라우트 직접 진입(프리렌더된 HTML) 시에도 데이터가 필요하므로 여기서 보장한다.
  void store.load()
  return store
}

export interface DayDetail {
  anniversary: ComputedRef<Anniversary | null>
  /** 같은 날짜의 다른 기념일 — 내부 링크 + "이 날의 다른 기념일" 섹션용. */
  sameDay: ComputedRef<Anniversary[]>
  /** 같은 카테고리의 다른 기념일 (최대 6건) — 관련 문서 링크용. */
  related: ComputedRef<Anniversary[]>
  isLoading: ComputedRef<boolean>
  notFound: ComputedRef<boolean>
}

export function useDayDetail(
  urlDate: ComputedRef<string>,
  slug: ComputedRef<string>,
): DayDetail {
  const store = useLoadedStore()
  const { items, isLoaded, isLoading } = storeToRefs(store)

  const targetId = computed(() => idForPath(urlDate.value, slug.value))

  const anniversary = computed(() => {
    if (!targetId.value) return null
    return items.value.find((a) => a.id === targetId.value) ?? null
  })

  const sameDay = computed(() => {
    const ids = new Set(idsForDate(urlDate.value))
    ids.delete(targetId.value ?? '')
    return items.value.filter((a) => ids.has(a.id))
  })

  const related = computed(() => {
    const current = anniversary.value
    if (!current) return []
    const excluded = new Set([current.id, ...sameDay.value.map((a) => a.id)])
    return items.value
      .filter((a) => a.category === current.category && !excluded.has(a.id))
      .filter((a) => routeForId(a.id))
      .slice(0, 6)
  })

  // 매핑 자체가 없으면 데이터 로딩과 무관하게 404.
  const notFound = computed(
    () => !targetId.value || (isLoaded.value && !anniversary.value),
  )

  return {
    anniversary,
    sameDay,
    related,
    isLoading: computed(() => isLoading.value),
    notFound,
  }
}

export function useDateHub(urlDate: ComputedRef<string>) {
  const store = useLoadedStore()
  const { items, isLoading } = storeToRefs(store)

  const anniversaries = computed(() => {
    const ids = new Set(idsForDate(urlDate.value))
    return items.value.filter((a) => ids.has(a.id))
  })

  return {
    anniversaries,
    label: computed(() => formatUrlDate(urlDate.value)),
    isLoading: computed(() => isLoading.value),
  }
}
