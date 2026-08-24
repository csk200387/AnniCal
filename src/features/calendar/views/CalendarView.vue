<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useMonthCalendar } from '../composables/useMonthCalendar'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import type { Anniversary } from '@/types/anniversary'
import { useShareStore } from '@/stores/share'
import { daysUntil, formatKoreanMonthDay } from '@/utils/dateUtils'
import { primaryColorForTags } from '@/utils/tagPalette'
import { pathFor } from '@/utils/anniversaryRoutes'

const shareStore = useShareStore()
const {
  cursor,
  monthLabel,
  weeks,
  selectedDate,
  selectedAnniversaries,
  searchQuery,
  searchResults,
  isLoading,
  error,
  retry,
  canGoPrev,
  canGoNext,
  isMonthInRange,
  outOfRangeNotice,
  goPrevMonth,
  goNextMonth,
  goToday,
  selectDate,
  selectAnniversary,
} = useMonthCalendar()

const searchRootEl = ref<HTMLElement | null>(null)
function goToAnniversary(anv: Anniversary) {
  selectAnniversary(anv)
  searchQuery.value = ''
}
function resultDate(anv: Anniversary): string {
  return formatKoreanMonthDay(anv, cursor.value.year()) ?? ''
}
function onDocPointerDown(e: PointerEvent) {
  if (searchQuery.value && searchRootEl.value && !searchRootEl.value.contains(e.target as Node)) {
    searchQuery.value = ''
  }
}
onMounted(() => document.addEventListener('pointerdown', onDocPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointerDown))

const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const selectedHumanDate = computed(() => {
  const d = selectedDate.value
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.day()]
  return `${d.month() + 1}월 ${d.date()}일 · ${wd}요일`
})
const selectedMonthEn = computed(() =>
  ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][selectedDate.value.month()],
)
const selectedWeekdayEn = computed(() => weekdayLabels[selectedDate.value.day()])
const monthStoryCount = computed(() =>
  weeks.value
    .flat()
    .filter((cell) => cell.isCurrentMonth)
    .reduce((sum, cell) => sum + cell.anniversaries.length, 0),
)

function handleShare(anv: Anniversary) {
  const d = daysUntil(anv)
  shareStore.open(anv, d !== null && d > 0 ? d : undefined)
}
</script>

<template>
  <div>
    <header class="relative grid min-h-[210px] items-end gap-8 overflow-hidden border-b border-ink-900 pb-8 md:grid-cols-[1fr_auto]">
      <span
        class="pointer-events-none absolute -bottom-14 right-64 hidden font-display text-[12rem] leading-none text-accent-600/[0.07] lg:block"
        aria-hidden="true"
      >{{ String(cursor.month() + 1).padStart(2, '0') }}</span>
      <div class="relative z-10">
        <div class="flex items-center gap-3"><span class="h-px w-10 bg-accent-600" /><span class="eyebrow">Calendar Almanac · {{ cursor.year() }}</span></div>
        <h1 class="mt-6 font-display text-[3.25rem] font-normal leading-none tracking-[-0.055em] text-ink-900 sm:text-[4.75rem]">
          {{ monthLabel }}
        </h1>
      </div>
      <div class="relative z-10 max-w-sm border-t hairline pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <p class="eyebrow">Month at a glance</p>
        <p class="mt-2 font-display text-sm leading-relaxed text-ink-500">
          날짜를 고르면 그날의 기념일과 짧은 이야기가 같은 화면에 펼쳐집니다.
        </p>
        <div class="mt-4 flex gap-8 border-t hairline pt-3">
          <div><span class="eyebrow">Stories</span><strong class="mt-1 block font-display text-xl font-normal">{{ monthStoryCount }}개</strong></div>
          <div><span class="eyebrow">Selected</span><strong class="mt-1 block font-display text-xl font-normal">{{ selectedDate.date() }}</strong></div>
        </div>
      </div>
    </header>

    <p v-if="outOfRangeNotice" class="mt-3 text-[0.8rem] text-ink-400">{{ outOfRangeNotice }}</p>
    <p v-if="error" class="mt-3 text-[0.8rem] text-ink-500">
      기념일을 불러오지 못했어요.
      <button type="button" class="underline underline-offset-4 hover:text-ink-800" @click="retry">다시 시도</button>
    </p>

    <div class="mt-7 flex flex-col gap-4 border-y hairline py-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-1.5">
        <button type="button" class="grid h-10 w-10 place-items-center border hairline bg-paper-50 font-display text-xl text-ink-500 transition hover:border-ink-800 hover:text-ink-900 disabled:opacity-30" aria-label="이전 달" :disabled="!canGoPrev" @click="goPrevMonth">‹</button>
        <button type="button" class="h-10 border border-ink-900 bg-ink-900 px-5 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-paper-50 transition hover:border-accent-600 hover:bg-accent-600" @click="goToday">Today</button>
        <button type="button" class="grid h-10 w-10 place-items-center border hairline bg-paper-50 font-display text-xl text-ink-500 transition hover:border-ink-800 hover:text-ink-900 disabled:opacity-30" aria-label="다음 달" :disabled="!canGoNext" @click="goNextMonth">›</button>
      </div>

      <div ref="searchRootEl" class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="search"
          autocomplete="off"
          placeholder="기념일 이름·태그 검색…"
          class="h-10 w-full border hairline bg-paper-50/70 px-3 pr-10 font-display text-sm text-ink-900 placeholder:text-ink-300 focus:border-ink-800 focus:outline-none"
        />
        <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true">⌕</span>
        <div v-if="searchQuery.trim()" class="absolute right-0 top-full z-30 mt-2 w-full min-w-[18rem] border border-ink-900 bg-paper-50 shadow-xl">
          <ul v-if="searchResults.length" class="max-h-80 divide-y divide-rule overflow-y-auto">
            <li v-for="anv in searchResults" :key="anv.id">
              <button type="button" class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-paper-200/50" @click="goToAnniversary(anv)">
                <span class="truncate font-display text-sm text-ink-800">{{ anv.name }}</span>
                <span class="shrink-0 text-xs tabular-nums text-ink-400">{{ resultDate(anv) }}</span>
              </button>
            </li>
          </ul>
          <p v-else class="px-4 py-6 text-center font-display text-sm italic text-ink-500">검색 결과가 없어요.</p>
        </div>
      </div>
    </div>

    <p v-if="isLoading" class="mt-8 eyebrow">Loading…</p>
    <template v-else-if="!error">
      <div class="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_310px]">
        <section class="overflow-hidden border hairline bg-paper-50" aria-label="월간 달력">
          <div class="grid grid-cols-7 border-b border-ink-900 bg-paper-100 text-center">
            <div
              v-for="(label, i) in weekdayLabels"
              :key="label"
              class="py-3 text-[0.58rem] font-medium uppercase tracking-[0.2em]"
              :class="i === 0 ? 'text-accent-600' : i === 6 ? 'text-ink-700' : 'text-ink-400'"
            >{{ label }}</div>
          </div>

          <div class="grid grid-cols-7">
            <button
              v-for="cell in weeks.flat()"
              :key="cell.date.format('YYYY-MM-DD')"
              type="button"
              class="group relative flex min-h-[72px] flex-col items-stretch gap-2 border-b border-r border-rule p-2 text-left transition-colors hover:bg-paper-200/40 sm:min-h-[106px] sm:p-2.5"
              :class="{
                'bg-paper-100/50 text-ink-300': !cell.isCurrentMonth,
                'bg-ink-900 text-paper-50 hover:bg-ink-900': selectedDate.isSame(cell.date, 'day'),
              }"
              :disabled="!isMonthInRange(cell.date)"
              @click="selectDate(cell.date)"
            >
              <span
                v-if="cell.isToday && !selectedDate.isSame(cell.date, 'day')"
                class="absolute left-1.5 top-1.5 h-7 w-7 rounded-full border border-accent-600"
                aria-hidden="true"
              />
              <span
                class="relative z-10 font-display text-sm leading-none"
                :class="{
                  'text-paper-50': selectedDate.isSame(cell.date, 'day'),
                  'text-accent-600': cell.isToday && !selectedDate.isSame(cell.date, 'day'),
                  'text-ink-700': cell.isCurrentMonth && !cell.isToday && !selectedDate.isSame(cell.date, 'day'),
                }"
              >{{ cell.date.date() }}</span>

              <div v-if="cell.anniversaries.length" class="flex flex-wrap items-center gap-1 sm:hidden">
                <span v-for="anv in cell.anniversaries.slice(0, 4)" :key="anv.id" class="h-1.5 w-1.5 rounded-full" :class="primaryColorForTags(anv.tags).dot" />
                <span v-if="cell.anniversaries.length > 4" class="text-[9px]" :class="selectedDate.isSame(cell.date, 'day') ? 'text-paper-300' : 'text-ink-400'">+{{ cell.anniversaries.length - 4 }}</span>
              </div>
              <div v-if="cell.anniversaries.length" class="hidden min-w-0 flex-col gap-1 overflow-hidden sm:flex">
                <span
                  v-for="anv in cell.anniversaries.slice(0, 2)"
                  :key="anv.id"
                  class="flex min-w-0 items-center gap-1.5 text-[9.5px] leading-tight"
                  :class="selectedDate.isSame(cell.date, 'day') ? 'text-paper-200' : cell.isCurrentMonth ? 'text-ink-600' : 'text-ink-300'"
                >
                  <span class="h-1 w-1 shrink-0 rounded-full" :class="primaryColorForTags(anv.tags).dot" />
                  <span class="truncate">{{ anv.name }}</span>
                </span>
                <span v-if="cell.anniversaries.length > 2" class="text-[9px]" :class="selectedDate.isSame(cell.date, 'day') ? 'text-paper-300' : 'text-ink-400'">+{{ cell.anniversaries.length - 2 }} more</span>
              </div>
            </button>
          </div>
        </section>

        <aside class="overflow-hidden border border-ink-900 bg-paper-50 lg:sticky lg:top-40" aria-labelledby="selected-date-heading">
          <div class="relative min-h-[170px] overflow-hidden bg-accent-600 p-6 text-paper-50">
            <div class="absolute -bottom-16 -right-10 h-48 w-48 rounded-full border border-paper-50/15 shadow-[0_0_0_25px_rgba(255,255,255,0.035)]" aria-hidden="true" />
            <p class="eyebrow !text-paper-200">Selected Date</p>
            <div class="relative z-10 mt-9 flex items-end gap-3">
              <strong class="font-display text-[4.75rem] font-normal leading-[0.75] tracking-[-0.07em]">{{ selectedDate.date() }}</strong>
              <span class="pb-0.5 font-display text-lg leading-tight">{{ selectedMonthEn }}<br />{{ selectedWeekdayEn }}</span>
            </div>
          </div>

          <div class="p-5">
            <div class="flex items-center justify-between gap-3 border-b hairline pb-4">
              <h2 id="selected-date-heading" class="font-display text-xl font-normal text-ink-900">{{ selectedHumanDate }}</h2>
              <span class="shrink-0 text-[0.65rem] text-ink-400">{{ selectedAnniversaries.length }} stories</span>
            </div>
            <ol v-if="selectedAnniversaries.length">
              <li v-for="anv in selectedAnniversaries" :key="anv.id" class="border-b hairline py-5 last:border-b-0">
                <CategoryBadge :category-id="anv.category" />
                <RouterLink v-if="pathFor(anv)" :to="pathFor(anv)!" class="mt-2 block font-display text-xl leading-tight text-ink-900 transition hover:text-accent-600">{{ anv.name }}</RouterLink>
                <h3 v-else class="mt-2 font-display text-xl font-normal leading-tight text-ink-900">{{ anv.name }}</h3>
                <p class="mt-2 line-clamp-3 font-display text-xs leading-relaxed text-ink-500">{{ anv.storytelling.origin }}</p>
                <button type="button" class="mt-3 text-[0.6rem] uppercase tracking-[0.16em] text-ink-500 transition hover:text-accent-600" @click="handleShare(anv)">Share →</button>
              </li>
            </ol>
            <p v-else class="py-10 text-center font-display text-sm italic text-ink-400">이 날엔 등록된 기념일이 없어요.</p>
          </div>
        </aside>
      </div>

      <div class="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-y hairline py-4 text-[0.58rem] uppercase tracking-[0.14em] text-ink-400">
        <span class="flex items-center gap-2"><i class="h-1.5 w-1.5 rounded-full bg-amber-700" />음식 & 디저트</span>
        <span class="flex items-center gap-2"><i class="h-1.5 w-1.5 rounded-full bg-fuchsia-700" />문화 & 예술</span>
        <span class="flex items-center gap-2"><i class="h-1.5 w-1.5 rounded-full bg-sky-700" />국제 캠페인</span>
        <span class="flex items-center gap-2"><i class="h-1.5 w-1.5 rounded-full bg-emerald-700" />동물 & 자연</span>
        <span class="flex items-center gap-2"><i class="h-1.5 w-1.5 rounded-full bg-rose-700" />역사 & 공휴일</span>
      </div>
    </template>
  </div>
</template>
