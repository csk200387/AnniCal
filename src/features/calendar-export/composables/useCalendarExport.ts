import { computed, onMounted, ref, watch } from 'vue'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { buildCalendar } from '@/utils/ics'
import { SITE_URL } from '@/seo/head'

export interface CategoryOption {
  id: string
  label: string
  emoji: string
  count: number
}

/**
 * 그룹 옵션 — 카테고리와 교차하는 두 번째 선택축(현재는 "법정기념일" 하나).
 * 카테고리와 OR 로 합쳐진다. 그래서 '음식'만 골라도 법정기념일인 김치의 날은
 * 그룹을 함께 켜면 빠지지 않는다.
 */
export type GroupOption = CategoryOption

export function useCalendarExport() {
  const store = useAnniversariesStore()
  onMounted(() => store.load())

  // categories.json 순서를 유지하면서 실제 데이터가 있는 카테고리만 노출.
  const categoryOptions = computed<CategoryOption[]>(() => {
    const counts = new Map<string, number>()
    for (const a of store.items) {
      counts.set(a.category, (counts.get(a.category) ?? 0) + 1)
    }
    return store.categories
      .filter((c) => counts.has(c.id))
      .map((c) => ({
        id: c.id,
        label: c.label,
        emoji: c.emoji,
        count: counts.get(c.id) ?? 0,
      }))
  })

  // groups.json 순서를 유지하면서 실제로 붙어 있는 그룹만 노출.
  // 그룹 소속 여부는 tags 에 레이블이 들어 있는지로 판정한다(§types/group.ts).
  const groupOptions = computed<GroupOption[]>(() => {
    const counts = new Map<string, number>()
    for (const a of store.items) {
      for (const g of store.groups) {
        if (a.tags.includes(g.label)) counts.set(g.id, (counts.get(g.id) ?? 0) + 1)
      }
    }
    return store.groups
      .filter((g) => counts.has(g.id))
      .map((g) => ({ id: g.id, label: g.label, emoji: g.emoji, count: counts.get(g.id) ?? 0 }))
  })

  // 선택 집합은 카테고리와 그룹을 따로 둔다. 한 Set 에 섞으면 나중에 그룹 id 가
  // 카테고리 id 와 겹치는 순간 조용히 오작동한다.
  const selected = ref<Set<string>>(new Set())
  const selectedGroups = ref<Set<string>>(new Set())
  let initialized = false
  watch(
    [categoryOptions, groupOptions],
    ([opts, gopts]) => {
      if (!initialized && opts.length) {
        selected.value = new Set(opts.map((o) => o.id))
        selectedGroups.value = new Set(gopts.map((o) => o.id))
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
  function isGroupSelected(id: string): boolean {
    return selectedGroups.value.has(id)
  }
  function toggleGroup(id: string): void {
    const next = new Set(selectedGroups.value)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    selectedGroups.value = next
  }
  function selectAll(): void {
    selected.value = new Set(categoryOptions.value.map((o) => o.id))
    selectedGroups.value = new Set(groupOptions.value.map((o) => o.id))
  }
  function selectNone(): void {
    selected.value = new Set()
    selectedGroups.value = new Set()
  }

  const allSelected = computed(
    () =>
      categoryOptions.value.length > 0 &&
      selected.value.size === categoryOptions.value.length &&
      selectedGroups.value.size === groupOptions.value.length,
  )

  /** 선택한 그룹의 레이블 — 항목의 tags 와 대조할 값. */
  const selectedGroupLabels = computed(
    () =>
      new Set(
        store.groups.filter((g) => selectedGroups.value.has(g.id)).map((g) => g.label),
      ),
  )

  // 카테고리 OR 그룹. 둘 중 하나라도 걸리면 포함한다.
  const selectedItems = computed(() =>
    store.items.filter(
      (a) =>
        selected.value.has(a.category) ||
        a.tags.some((t) => selectedGroupLabels.value.has(t)),
    ),
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
      : `anniversarium-${[...selected.value, ...selectedGroups.value].join('-')}.ics`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  // ─── 구독 피드 URL (살아있는 URL) ─────────────────────────────
  // 전체 선택이면 깔끔한 기본 URL, 일부만 선택이면 ?categories= 쿼리 부착.
  //
  // 0개 선택은 전체 선택과 반드시 구분해야 한다. 예전에는 둘 다 빈 쿼리를 내보냈고,
  // 파라미터가 없는 요청을 API 가 "전체"로 해석해서 — 카테고리를 모두 해제한
  // 사용자가 1,400건 전체를 구독하게 됐다. 이제 0개면 URL 자체를 만들지 않는다.
  const hasSelection = computed(
    () => selected.value.size > 0 || selectedGroups.value.size > 0,
  )

  const feedHttpUrl = computed<string | null>(() => {
    if (!hasSelection.value) return null
    if (allSelected.value) return `${SITE_URL}/api/calendar`
    const params = new URLSearchParams()
    const cats = categoryOptions.value
      .filter((o) => selected.value.has(o.id))
      .map((o) => o.id)
    const grps = groupOptions.value
      .filter((o) => selectedGroups.value.has(o.id))
      .map((o) => o.id)
    if (cats.length) params.set('categories', cats.join(','))
    if (grps.length) params.set('groups', grps.join(','))
    return `${SITE_URL}/api/calendar?${params.toString()}`
  })

  const feedWebcalUrl = computed<string | null>(() =>
    feedHttpUrl.value ? feedHttpUrl.value.replace(/^https?:\/\//, 'webcal://') : null,
  )

  // 구글 캘린더 "URL로 추가" 진입점.
  const googleAddUrl = computed<string | null>(() =>
    feedWebcalUrl.value
      ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedWebcalUrl.value)}`
      : null,
  )

  const copied = ref(false)
  async function copyFeedUrl(): Promise<void> {
    const url = feedWebcalUrl.value
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
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
    groupOptions,
    isSelected,
    toggle,
    isGroupSelected,
    toggleGroup,
    selectAll,
    selectNone,
    allSelected,
    hasSelection,
    selectedCount,
    downloadIcs,
    feedWebcalUrl,
    googleAddUrl,
    copied,
    copyFeedUrl,
  }
}
