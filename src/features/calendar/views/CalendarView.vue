<script setup lang="ts">
import '@/assets/calendar.css'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Dayjs } from 'dayjs'
import { RouterLink } from 'vue-router'
import { useMonthCalendar } from '../composables/useMonthCalendar'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import type { Anniversary } from '@/types/anniversary'
import type { CategoryColor } from '@/types/category'
import { useShareStore } from '@/stores/share'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { daysUntil, formatKoreanMonthDay } from '@/utils/dateUtils'
import { MONTH_EN, WEEKDAY_KO, displayName } from '@/utils/format'
import { pathFor } from '@/utils/anniversaryRoutes'

import PageHero from '@/components/ui/PageHero.vue'
import UiButton from '@/components/ui/UiButton.vue'
import FieldShell from '@/components/ui/FieldShell.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import UiChip from '@/components/ui/UiChip.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'

const dayPanel = ref<HTMLElement | null>(null)
const calendarRoot = ref<HTMLElement | null>(null)
async function revealSelection() {
  await nextTick()
  if (window.matchMedia('(max-width: 760px)').matches) {
    dayPanel.value?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }
}
function chooseDate(date: Dayjs, event: MouseEvent) {
  selectDate(date)
  if (event.detail > 0) void revealSelection()
}
const shareStore = useShareStore()
const store = useAnniversariesStore()
const {
  cursor,
  monthLabel,
  weeks,
  selectedDate,
  selectedAnniversaries,
  searchQuery,
  searchResults,
  loading,
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
async function goToAnniversary(anv: Anniversary, event: MouseEvent) {
  selectAnniversary(anv)
  searchQuery.value = ''
  await nextTick()
  calendarRoot.value
    ?.querySelector<HTMLButtonElement>('.is-selected')
    ?.focus({ preventScroll: true })
  if (event.detail > 0) void revealSelection()
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
  return `${d.month() + 1}월 ${d.date()}일 · ${WEEKDAY_KO[d.day()]}요일`
})
const selectedMonthEn = computed(() => MONTH_EN[selectedDate.value.month()])
const selectedWeekdayEn = computed(() => weekdayLabels[selectedDate.value.day()])
const monthStoryCount = computed(() =>
  weeks.value
    .flat()
    .filter((cell) => cell.isCurrentMonth)
    .reduce((sum, cell) => sum + cell.anniversaries.length, 0),
)

const colorOf = (anv: Anniversary) => store.categoryById.get(anv.category)?.colorToken

/** 범례 — 색마다 그 색을 쓰는 카테고리를 모은다. categories.json 의 colorToken 에서 만들어지므로 점 색과 어긋날 수 없다. */
const legend = computed(() => {
  const byColor = new Map<CategoryColor, string[]>()
  for (const c of store.categories)
    byColor.set(c.colorToken, [...(byColor.get(c.colorToken) ?? []), c.label.split(' & ')[0]])
  return byColor
})

function handleShare(anv: Anniversary) {
  const d = daysUntil(anv)
  shareStore.open(anv, d !== null && d > 0 ? d : undefined)
}
</script>

<template>
  <div class="home-page">
    <div class="tool-container">
      <PageHero
        :kicker="`CALENDAR ALMANAC · ${cursor.year()}`"
        title-id="calendar-title"
        description="날짜를 고르면 그날의 기념일과 짧은 이야기가 같은 화면에 펼쳐져요."
      >
        <template #title
          >{{ monthLabel }}<span class="heading-dot">,</span> <br />어떤 날들이 있을까요<span
            class="heading-dot"
            >?</span
          ></template
        >
        <template #footer
          ><dl class="calendar-summary">
            <div>
              <dt>THIS MONTH</dt>
              <dd>{{ monthStoryCount }}<small>개의 이야기</small></dd>
            </div>
            <div>
              <dt>SELECTED</dt>
              <dd>{{ selectedDate.format('MM.DD') }}</dd>
            </div>
          </dl></template
        >
      </PageHero>

      <p v-if="outOfRangeNotice" class="page-note">{{ outOfRangeNotice }}</p>
      <ResultState
        v-if="error"
        tone="error"
        title="기념일을 불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        ><template #actions
          ><UiButton icon="retry" @click="retry">다시 시도</UiButton></template
        ></ResultState
      >

      <div class="calendar-toolbar">
        <div class="month-nav">
          <UiButton
            variant="ghost"
            size="s"
            aria-label="이전 달"
            :disabled="!canGoPrev"
            @click="goPrevMonth"
            >‹</UiButton
          >
          <strong>{{ monthLabel }}</strong>
          <UiButton
            variant="ghost"
            size="s"
            aria-label="다음 달"
            :disabled="!canGoNext"
            @click="goNextMonth"
            >›</UiButton
          >
        </div>
        <UiButton size="s" @click="goToday">오늘로</UiButton>

        <div ref="searchRootEl" class="calendar-search">
          <FieldShell for="calendar-search" label="기념일 검색">
            <input
              id="calendar-search"
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              placeholder="기념일 이름·태그 검색…"
              :aria-controls="searchQuery.trim() ? 'calendar-search-results' : undefined"
              @keydown.esc.stop="searchQuery = ''"
            />
          </FieldShell>
          <p class="sr-only" role="status">
            {{ searchQuery.trim() ? `검색 결과 ${searchResults.length}개` : '' }}
          </p>
          <div
            v-if="searchQuery.trim()"
            id="calendar-search-results"
            class="search-results"
            role="region"
            aria-label="기념일 검색 결과"
          >
            <ul v-if="searchResults.length">
              <li v-for="anv in searchResults" :key="anv.id">
                <button type="button" @click="goToAnniversary(anv, $event)">
                  <span>{{ displayName(anv.name) }}</span
                  ><span>{{ resultDate(anv) }}</span>
                </button>
              </li>
            </ul>
            <p v-else class="search-empty">검색 결과가 없어요.</p>
          </div>
        </div>
      </div>

      <SkeletonRows v-if="loading" :rows="3" variant="card" label="기념일을 불러오는 중이에요" />
      <template v-else-if="!error">
        <div class="calendar-layout">
          <section ref="calendarRoot" class="month-card" aria-label="월간 달력">
            <div class="month-weekdays">
              <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
            </div>
            <div class="month-grid">
              <button
                v-for="cell in weeks.flat()"
                :key="cell.date.format('YYYY-MM-DD')"
                type="button"
                class="month-cell"
                :class="{
                  'is-selected': selectedDate.isSame(cell.date, 'day'),
                  'is-today': cell.isToday,
                  'is-outside': !cell.isCurrentMonth,
                }"
                :disabled="!isMonthInRange(cell.date)"
                :aria-label="`${cell.date.format('YYYY년 M월 D일')} · 기념일 ${cell.anniversaries.length}개`"
                :aria-pressed="selectedDate.isSame(cell.date, 'day')"
                :aria-current="cell.isToday ? 'date' : undefined"
                @click="chooseDate(cell.date, $event)"
              >
                <time :datetime="cell.date.format('YYYY-MM-DD')">{{ cell.date.date() }}</time>
                <template v-if="cell.anniversaries.length">
                  <div class="cell-dots" aria-hidden="true">
                    <i
                      v-for="anv in cell.anniversaries.slice(0, 4)"
                      :key="anv.id"
                      class="cell-dot category-dot"
                      :data-color="colorOf(anv)"
                    />
                    <span v-if="cell.anniversaries.length > 4" class="cell-more"
                      >+{{ cell.anniversaries.length - 4 }}</span
                    >
                  </div>
                  <div class="cell-events">
                    <span v-for="anv in cell.anniversaries.slice(0, 2)" :key="anv.id">
                      <i class="cell-dot category-dot" :data-color="colorOf(anv)" />
                      <span>{{ displayName(anv.name) }}</span>
                    </span>
                    <span v-if="cell.anniversaries.length > 2" class="cell-more"
                      >+{{ cell.anniversaries.length - 2 }} more</span
                    >
                  </div>
                </template>
              </button>
            </div>
          </section>

          <aside ref="dayPanel" class="day-panel" aria-labelledby="selected-date-heading">
            <div class="day-panel-head">
              <p class="section-kicker"><span /> SELECTED DATE</p>
              <div class="day-panel-date">
                <strong>{{ selectedDate.date() }}</strong>
                <span>{{ selectedMonthEn }} <br />{{ selectedWeekdayEn }}</span>
              </div>
              <span class="day-panel-ring" aria-hidden="true" />
            </div>

            <div class="day-panel-body">
              <div class="day-panel-title" aria-live="polite" aria-atomic="true">
                <h2 id="selected-date-heading">{{ selectedHumanDate }}</h2>
                <span>{{ selectedAnniversaries.length }}개</span>
              </div>
              <ol
                v-if="selectedAnniversaries.length"
                class="day-panel-list"
                aria-label="선택한 날짜의 기념일 목록"
                tabindex="0"
              >
                <li v-for="anv in selectedAnniversaries" :key="anv.id">
                  <CategoryBadge :category-id="anv.category" />
                  <RouterLink v-if="pathFor(anv)" :to="pathFor(anv)!">{{
                    displayName(anv.name)
                  }}</RouterLink>
                  <h3 v-else>{{ displayName(anv.name) }}</h3>
                  <p>{{ anv.storytelling.origin }}</p>
                  <UiButton variant="ghost" size="s" icon="arrow" @click="handleShare(anv)"
                    >공유하기</UiButton
                  >
                </li>
              </ol>
              <ResultState v-else title="이 날엔 등록된 기념일이 없어요" />
            </div>
          </aside>
        </div>

        <ChipGroup class="calendar-legend" label="달력 색상 범례">
          <UiChip v-for="[color, labels] in legend" :key="color" static
            ><i class="category-dot" :data-color="color" aria-hidden="true" />{{
              labels.join(' · ')
            }}</UiChip
          >
        </ChipGroup>
      </template>
    </div>
  </div>
</template>
