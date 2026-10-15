import { defineStore } from 'pinia'
import { computed, shallowRef, triggerRef } from 'vue'
import type { Anniversary } from '@/types/anniversary'
import type { Category } from '@/types/category'
import type { Group } from '@/types/group'
import {
  ALL_MONTHS,
  anniversaryRepository,
  categoryRepository,
  groupRepository,
} from '@/services/anniversaryRepository'
import { occursOnBirthday, registerAnchors, resolveOccurrenceSafe } from '@/utils/dateUtils'
import { monthDayKey } from '@/utils/format'

export const useAnniversariesStore = defineStore('anniversaries', () => {
  // 기념일 데이터는 로드 후 변경되지 않는다. 깊은 ref 로 감싸면 1,400개 객체와
  // 그 안의 storytelling·tags·memes 까지 전부 Proxy 가 씌워지는데, 얻는 건 없고
  // 순회 비용만 늘어난다. shallowRef 로 통째 교체만 반응하게 둔다.
  const items = shallowRef<Anniversary[]>([])
  const categories = shallowRef<Category[]>([])
  const groups = shallowRef<Group[]>([])
  const error = shallowRef<string | null>(null)

  /** 지금까지 받아 온 달. 화면마다 필요한 만큼만 채워 나간다. */
  const loadedMonths = shallowRef<ReadonlySet<number>>(new Set())
  const isComplete = computed(() => loadedMonths.value.size === ALL_MONTHS.length)

  /**
   * 이 달들이 모두 들어왔는가. 화면의 "로딩 중" 판정은 이것으로 한다.
   *
   * 예전에는 어느 달이든 받는 동안 켜지는 전역 플래그를 썼다. 그러면 필요한 달을
   * 이미 가진 화면도 뒤에서 나머지 달을 받는 동안 스켈레톤으로 돌아갔다.
   */
  function hasMonths(months: readonly number[]): boolean {
    return months.every((m) => loadedMonths.value.has(m))
  }

  const byId = computed(() => new Map(items.value.map((a) => [a.id, a])))
  const categoryById = computed(() => new Map(categories.value.map((c) => [c.id, c])))

  /**
   * 연도별 발생일 색인 — { "MM-DD" → 그날 일어나는 기념일들 }.
   *
   * 달력은 한 화면에 42칸을 그리는데, 칸마다 전체를 훑으면 월을 넘길 때마다
   * 42 × 1,400 = 58,800 번 날짜를 다시 계산한다. 연도당 한 번만 색인을 만들어 두면
   * 그 뒤로는 Map 조회로 끝난다. items 가 바뀌면 캐시를 통째로 버린다.
   */
  const occurrenceIndex = computed(() => {
    const source = items.value
    const cache = new Map<number, Map<string, Anniversary[]>>()

    return (year: number): Map<string, Anniversary[]> => {
      let index = cache.get(year)
      if (index) return index

      index = new Map()
      for (const a of source) {
        const d = resolveOccurrenceSafe(a, year)
        const key =
          d && d.getFullYear() === year ? monthDayKey(d.getMonth() + 1, d.getDate()) : null
        if (!key) continue
        const bucket = index.get(key)
        if (bucket) bucket.push(a)
        else index.set(key, [a])
      }
      cache.set(year, index)
      return index
    }
  })

  /** (year, month, day) 에 일어나는 기념일들. 색인 조회라 상수 시간이다. */
  function onDate(year: number, month: number, day: number): Anniversary[] {
    return occurrenceIndex.value(year).get(monthDayKey(month, day)) ?? []
  }

  /** 실제 발생일 색인과 달리 생일 탐색은 평년의 02-29도 허용한다. */
  function onBirthdayDate(year: number, month: number, day: number): Anniversary[] {
    return items.value.filter((a) => occursOnBirthday(a, year, month, day))
  }

  /** 검색용으로 미리 소문자화해 둔 문자열. 입력할 때마다 다시 만들지 않는다. */
  const searchIndex = computed(() =>
    items.value.map((a) => ({
      anniversary: a,
      haystack: `${a.name}\n${a.tags.join('\n')}`.toLowerCase(),
    })),
  )

  let categoriesPromise: Promise<[Category[], Group[]]> | null = null
  async function ensureCategories() {
    // 카테고리와 그룹은 둘 다 정적 JSON 이라 한 번에 받아 둔다.
    if (!categoriesPromise) {
      categoriesPromise = Promise.all([categoryRepository.findAll(), groupRepository.findAll()])
    }
    const [c, g] = await categoriesPromise
    categories.value = c
    groups.value = g
  }

  /**
   * 필요한 달만 받아 온다. 이미 받은 달은 즉시 반환된다.
   *
   * anchor 맵은 누적된 전체 목록으로 다시 등록한다 —
   * annual-relative-to-holiday 는 anchor 가 같은 파일에 함께 있으므로,
   * 부분 로드 상태에서도 자기 anchor 는 항상 곁에 있다.
   */
  async function ensureMonths(months: Iterable<number>): Promise<void> {
    const want = [...new Set(months)].filter((m) => !loadedMonths.value.has(m))
    if (!want.length) {
      if (!categories.value.length) await ensureCategories()
      return
    }

    error.value = null
    try {
      const [fetched] = await Promise.all([
        anniversaryRepository.findByMonths(want),
        ensureCategories(),
      ])
      // 동시 호출로 같은 달이 두 번 들어오지 않도록 id 로 걸러 합친다.
      const seen = new Set(items.value.map((a) => a.id))
      const merged = items.value.concat(fetched.filter((a) => !seen.has(a.id)))
      registerAnchors(merged)
      items.value = merged
      const next = new Set(loadedMonths.value)
      for (const m of want) next.add(m)
      loadedMonths.value = next
      triggerRef(items)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    }
  }

  /** 전체 12개월. 달력·내보내기처럼 정말 전부가 필요한 화면만 부른다. */
  function ensureAll(): Promise<void> {
    return ensureMonths(ALL_MONTHS)
  }

  /** 로드 실패 후 재시도. 실패한 달은 캐시에 남지 않으므로 다시 시도된다. */
  function retry(): Promise<void> {
    error.value = null
    return ensureMonths(ALL_MONTHS)
  }

  return {
    items,
    categories,
    groups,
    error,
    loadedMonths,
    isComplete,
    hasMonths,
    byId,
    categoryById,
    onDate,
    onBirthdayDate,
    searchIndex,
    ensureMonths,
    ensureAll,
    retry,
  }
})
