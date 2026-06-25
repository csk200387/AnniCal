import { computed, onMounted, ref, watch } from 'vue'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { buildCalendar } from '@/utils/ics'
import { SITE_URL } from '@/seo/head'

// categories.json 에 없는(레지스트리 누락) 카테고리용 한글 라벨 폴백.
// 데이터에는 존재하지만 카테고리 정의가 빠진 항목들을 사용자에게 노출하기 위함.
const FALLBACK_LABELS: Record<string, string> = {
  general: '일반',
  romance: '연애',
  holiday: '공휴일',
  motorsport: '모터스포츠',
  extreme: '익스트림',
  brand: '브랜드 데이',
  commemorative: '기념·추모',
  anniversary: '기념일',
  international: '세계·해외',
  quirky: '이색·엉뚱',
}

export interface CategoryOption {
  id: string
  label: string
  emoji: string
  count: number
}

export function useCalendarExport() {
  const store = useAnniversariesStore()
  onMounted(() => store.load())

  // 데이터에 실제 존재하는 카테고리만 건수와 함께 노출(건수 내림차순).
  const categoryOptions = computed<CategoryOption[]>(() => {
    const counts = new Map<string, number>()
    for (const a of store.items) {
      counts.set(a.category, (counts.get(a.category) ?? 0) + 1)
    }
    return [...counts.entries()]
      .map(([id, count]) => {
        const fromJson = store.categories.find((c) => c.id === id)
        return {
          id,
          label: fromJson?.label ?? FALLBACK_LABELS[id] ?? id,
          emoji: fromJson?.emoji ?? '',
          count,
        }
      })
      .sort((a, b) => b.count - a.count)
  })

  // 선택된 카테고리 id 집합. 첫 로드 시 전체 선택.
  const selected = ref<Set<string>>(new Set())
  let initialized = false
  watch(
    categoryOptions,
    (opts) => {
      if (!initialized && opts.length) {
        selected.value = new Set(opts.map((o) => o.id))
        initialized = true
      }
    },
    { immediate: true },
  )

  function isSelected(id: string): boolean {
    return selected.value.has(id)
  }
  function toggle(id: string): void {
    if (selected.value.has(id)) selected.value.delete(id)
    else selected.value.add(id)
  }
  function selectAll(): void {
    selected.value = new Set(categoryOptions.value.map((o) => o.id))
  }
  function selectNone(): void {
    selected.value = new Set()
  }

  const allSelected = computed(
    () =>
      categoryOptions.value.length > 0 &&
      selected.value.size === categoryOptions.value.length,
  )

  const selectedItems = computed(() =>
    store.items.filter((a) => selected.value.has(a.category)),
  )
  const selectedCount = computed(() => selectedItems.value.length)

  // ─── .ics 다운로드 (클라이언트) ───────────────────────────────
  function downloadIcs(): void {
    if (!selectedItems.value.length) return
    const ics = buildCalendar(selectedItems.value, { calName: '기념일 만물상' })
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = allSelected.value
      ? 'anniversarium.ics'
      : `anniversarium-${[...selected.value].join('-')}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // ─── 구독 피드 URL (살아있는 URL) ─────────────────────────────
  // 전체 선택이면 깔끔한 기본 URL, 일부만 선택이면 ?categories= 쿼리 부착.
  const categoryQuery = computed(() => {
    if (allSelected.value || selected.value.size === 0) return ''
    const ids = categoryOptions.value
      .filter((o) => selected.value.has(o.id))
      .map((o) => o.id)
    return `?categories=${ids.join(',')}`
  })
  const feedHttpUrl = computed(() => `${SITE_URL}/api/calendar${categoryQuery.value}`)
  const feedWebcalUrl = computed(() =>
    feedHttpUrl.value.replace(/^https?:\/\//, 'webcal://'),
  )
  // 구글 캘린더 "URL로 추가" 진입점.
  const googleAddUrl = computed(
    () => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedWebcalUrl.value)}`,
  )

  const copied = ref(false)
  async function copyFeedUrl(): Promise<void> {
    try {
      await navigator.clipboard.writeText(feedWebcalUrl.value)
      copied.value = true
      setTimeout(() => (copied.value = false), 2000)
    } catch {
      // 클립보드 권한 거부 등 — 사용자가 직접 선택 복사 가능하므로 조용히 무시.
    }
  }

  return {
    isLoading: computed(() => store.isLoading),
    error: computed(() => store.error),
    categoryOptions,
    isSelected,
    toggle,
    selectAll,
    selectNone,
    allSelected,
    selectedCount,
    downloadIcs,
    feedWebcalUrl,
    googleAddUrl,
    copied,
    copyFeedUrl,
  }
}
