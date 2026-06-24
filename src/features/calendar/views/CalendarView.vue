<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useMonthCalendar } from '../composables/useMonthCalendar'
import AnniversaryCard from '@/components/card/AnniversaryCard.vue'
import type { Anniversary } from '@/types/anniversary'
import { useShareStore } from '@/stores/share'
import { daysUntil, formatKoreanMonthDay } from '@/utils/dateUtils'
import { primaryColorForTags } from '@/utils/tagPalette'

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
  goPrevMonth,
  goNextMonth,
  goToday,
  selectDate,
  selectAnniversary,
} = useMonthCalendar()

// 검색 UI: 아이콘 클릭으로 입력창을 펼치고, 결과 클릭 시 해당 날짜로 이동.
const isSearchOpen = ref(false)
const searchInputEl = ref<HTMLInputElement | null>(null)
const searchRootEl = ref<HTMLElement | null>(null)

function openSearch() {
  isSearchOpen.value = true
  nextTick(() => searchInputEl.value?.focus())
}
function closeSearch() {
  isSearchOpen.value = false
  searchQuery.value = ''
}
function toggleSearch() {
  if (isSearchOpen.value) closeSearch()
  else openSearch()
}
function goToAnniversary(anv: Anniversary) {
  selectAnniversary(anv)
  closeSearch()
}
function resultDate(anv: Anniversary): string {
  return formatKoreanMonthDay(anv, cursor.value.year())
}

function onDocPointerDown(e: PointerEvent) {
  if (!isSearchOpen.value) return
  if (searchRootEl.value && !searchRootEl.value.contains(e.target as Node)) {
    closeSearch()
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

function handleShare(anv: Anniversary) {
  // 오늘이거나 이미 지난 일이면 D-day 표기는 생략.
  const d = daysUntil(anv)
  shareStore.open(anv, d > 0 ? d : undefined)
}
</script>

<template>
  <div class="space-y-[1.2rem]">
    <!-- Section header -->
    <header>
      <div class="flex items-center gap-3">
        <span class="h-px w-10 bg-ink-700" />
        <span class="eyebrow">Calendar</span>
      </div>
      <div class="mt-5 flex items-end justify-between gap-4 border-b hairline pb-5">
        <h1 class="font-display text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink-900 sm:text-[3rem]">
          {{ monthLabel }}
        </h1>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center border border-rule font-display text-base text-ink-500 transition hover:border-ink-800 hover:text-ink-900"
            aria-label="이전 달"
            @click="goPrevMonth"
          >
            ‹
          </button>
          <button
            type="button"
            class="border border-ink-800 bg-ink-800 px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-paper-50 transition hover:bg-ink-900"
            @click="goToday"
          >
            Today
          </button>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center border border-rule font-display text-base text-ink-500 transition hover:border-ink-800 hover:text-ink-900"
            aria-label="다음 달"
            @click="goNextMonth"
          >
            ›
          </button>
        </div>
      </div>
    </header>

    <p v-if="isLoading" class="eyebrow">Loading…</p>
    <p v-else-if="error" class="text-sm text-accent-600">{{ error }}</p>

    <template v-else>
      <!-- Search -->
      <div ref="searchRootEl" class="relative">
        <div class="flex items-center justify-end gap-2">
          <div
            class="overflow-hidden transition-all duration-300 ease-out"
            :class="
              isSearchOpen
                ? 'w-full max-w-xs opacity-100'
                : 'pointer-events-none w-0 opacity-0'
            "
          >
            <input
              ref="searchInputEl"
              v-model="searchQuery"
              type="text"
              placeholder="기념일 이름·태그 검색…"
              class="w-full border-b hairline bg-transparent px-1 py-1.5 font-display text-base text-ink-900 placeholder:text-ink-300 focus:border-ink-800 focus:outline-none"
              @keydown.escape="closeSearch"
            />
          </div>
          <button
            type="button"
            class="grid h-9 w-9 shrink-0 place-items-center border border-rule text-ink-500 transition hover:border-ink-800 hover:text-ink-900"
            :class="{ 'border-ink-800 text-ink-900': isSearchOpen }"
            :aria-label="isSearchOpen ? '검색 닫기' : '기념일 검색'"
            :aria-expanded="isSearchOpen"
            @click="toggleSearch"
          >
            <svg
              v-if="!isSearchOpen"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Search results -->
        <div
          v-if="isSearchOpen && searchQuery.trim()"
          class="absolute right-0 top-full z-30 mt-2 w-full max-w-md border hairline bg-paper-50 shadow-xl"
        >
          <ul
            v-if="searchResults.length"
            class="max-h-80 divide-y divide-rule overflow-y-auto"
          >
            <li v-for="anv in searchResults" :key="anv.id">
              <button
                type="button"
                class="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-paper-200/50"
                @click="goToAnniversary(anv)"
              >
                <span class="truncate font-display text-sm text-ink-800">
                  {{ anv.name }}
                </span>
                <span class="shrink-0 font-sans text-xs tabular-nums text-ink-400">
                  {{ resultDate(anv) }}
                </span>
              </button>
            </li>
          </ul>
          <p
            v-else
            class="px-4 py-6 text-center font-display text-sm italic text-ink-500"
          >
            검색 결과가 없어요.
          </p>
        </div>
      </div>

      <!-- Calendar grid -->
      <div class="overflow-hidden border hairline bg-paper-50">
        <div class="grid grid-cols-7 border-b hairline bg-paper-100/70 text-center">
          <div
            v-for="(label, i) in weekdayLabels"
            :key="label"
            class="py-3 text-[0.62rem] font-medium uppercase tracking-[0.22em]"
            :class="{
              'text-accent-600': i === 0,
              'text-ink-400': i !== 0 && i !== 6,
              'text-ink-700': i === 6,
            }"
          >
            {{ label }}
          </div>
        </div>

        <div class="grid grid-cols-7">
          <button
            v-for="cell in weeks.flat()"
            :key="cell.date.format('YYYY-MM-DD')"
            type="button"
            class="group relative flex min-h-[88px] flex-col items-stretch gap-1.5 border-b border-r border-rule p-2 text-left transition-colors hover:bg-paper-200/40 sm:min-h-[108px]"
            :class="{
              'bg-paper-100/40 text-ink-300': !cell.isCurrentMonth,
              'bg-ink-900 hover:bg-ink-900 text-paper-50':
                selectedDate.isSame(cell.date, 'day'),
            }"
            @click="selectDate(cell.date)"
          >
            <span
              class="font-display text-sm leading-none"
              :class="{
                'text-paper-50': selectedDate.isSame(cell.date, 'day'),
                'text-accent-600 font-medium': cell.isToday && !selectedDate.isSame(cell.date, 'day'),
                'text-ink-700': cell.isCurrentMonth && !cell.isToday && !selectedDate.isSame(cell.date, 'day'),
              }"
            >
              {{ cell.date.date() }}
            </span>

            <!-- 모바일: 칸이 좁아 이름 텍스트가 잘려 안 보이므로 태그 색 점으로 대체.
                 탭하면 아래 "Selected" 섹션에서 전체 목록을 볼 수 있다. -->
            <div
              v-if="cell.anniversaries.length"
              class="flex flex-wrap items-center gap-1 sm:hidden"
            >
              <span
                v-for="anv in cell.anniversaries.slice(0, 4)"
                :key="anv.id"
                class="h-1.5 w-1.5 shrink-0 rounded-full"
                :class="[primaryColorForTags(anv.tags).dot, { 'opacity-40': !cell.isCurrentMonth }]"
                :title="anv.name"
              />
              <span
                v-if="cell.anniversaries.length > 4"
                class="text-[9px] leading-none"
                :class="selectedDate.isSame(cell.date, 'day') ? 'text-paper-300' : 'text-ink-400'"
              >
                +{{ cell.anniversaries.length - 4 }}
              </span>
            </div>

            <!-- sm 이상: 칸이 넓어져 이름 일부가 보일 만큼 공간이 생기므로 기존 텍스트 목록 유지. -->
            <div
              v-if="cell.anniversaries.length"
              class="hidden flex-col gap-0.5 overflow-hidden sm:flex"
            >
              <span
                v-for="anv in cell.anniversaries.slice(0, 2)"
                :key="anv.id"
                class="truncate text-[10.5px] leading-tight"
                :class="{
                  'text-paper-200': selectedDate.isSame(cell.date, 'day'),
                  'text-ink-600': cell.isCurrentMonth && !selectedDate.isSame(cell.date, 'day'),
                  'text-ink-300': !cell.isCurrentMonth,
                }"
                :title="anv.name"
              >
                <span class="mr-1">·</span>{{ anv.name }}
              </span>
              <span
                v-if="cell.anniversaries.length > 2"
                class="text-[10px]"
                :class="selectedDate.isSame(cell.date, 'day') ? 'text-paper-300' : 'text-ink-400'"
              >
                +{{ cell.anniversaries.length - 2 }} more
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Selected day section -->
      <section>
        <div class="mb-6 flex items-center gap-5">
          <span class="h-px flex-1 bg-rule" />
          <div class="flex flex-col items-center">
            <span class="eyebrow">Selected</span>
            <span class="mt-1 font-display text-lg tracking-tight text-ink-800">
              {{ selectedHumanDate }}
              <span class="ml-2 font-sans text-xs tracking-normal text-ink-400">
                ({{ selectedAnniversaries.length }}건)
              </span>
            </span>
          </div>
          <span class="h-px flex-1 bg-rule" />
        </div>

        <div v-if="selectedAnniversaries.length" class="space-y-10">
          <AnniversaryCard
            v-for="a in selectedAnniversaries"
            :key="a.id"
            :anniversary="a"
            @share="handleShare"
          />
        </div>
        <div
          v-else
          class="border-y hairline bg-paper-50 px-6 py-12 text-center"
        >
          <p class="eyebrow">No entries</p>
          <p class="mt-2 font-display text-base italic text-ink-500">
            이 날엔 등록된 기념일이 없어요.
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
