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
  <div class="home-page">
    <div class="home-container">
      <header class="page-hero" aria-labelledby="calendar-title">
        <p class="section-kicker"><span /> CALENDAR ALMANAC · {{ cursor.year() }}</p>
        <h1 id="calendar-title">{{ monthLabel }}<span class="heading-dot">,</span><br />어떤 날들이 있을까요<span class="heading-dot">?</span></h1>
        <p class="page-hero-description">날짜를 고르면 그날의 기념일과 짧은 이야기가 같은 화면에 펼쳐져요.</p>
        <div class="page-hero-stats">
          <div><span>THIS MONTH</span><strong>{{ monthStoryCount }}<small>개의 이야기</small></strong></div>
          <div><span>SELECTED</span><strong>{{ String(selectedDate.month() + 1).padStart(2, '0') }}.{{ String(selectedDate.date()).padStart(2, '0') }}</strong></div>
        </div>
        <span class="page-hero-spark" aria-hidden="true">✳</span>
      </header>

      <p v-if="outOfRangeNotice" class="page-note">{{ outOfRangeNotice }}</p>
      <p v-if="error" class="page-note">
        기념일을 불러오지 못했어요.
        <button type="button" @click="retry">다시 시도</button>
      </p>

      <div class="calendar-toolbar">
        <div class="month-nav">
          <button type="button" class="round-icon-button" aria-label="이전 달" :disabled="!canGoPrev" @click="goPrevMonth">‹</button>
          <strong>{{ monthLabel }}</strong>
          <button type="button" class="round-icon-button" aria-label="다음 달" :disabled="!canGoNext" @click="goNextMonth">›</button>
        </div>
        <button type="button" class="today-button" @click="goToday">오늘로</button>

        <div ref="searchRootEl" class="calendar-search">
          <input
            v-model="searchQuery"
            type="search"
            autocomplete="off"
            placeholder="기념일 이름·태그 검색…"
          />
          <span aria-hidden="true">⌕</span>
          <div v-if="searchQuery.trim()" class="search-results">
            <ul v-if="searchResults.length">
              <li v-for="anv in searchResults" :key="anv.id">
                <button type="button" @click="goToAnniversary(anv)">
                  <span>{{ anv.name }}</span><span>{{ resultDate(anv) }}</span>
                </button>
              </li>
            </ul>
            <p v-else class="search-empty">검색 결과가 없어요.</p>
          </div>
        </div>
      </div>

      <p v-if="isLoading" class="page-note">기념일을 불러오는 중…</p>
      <template v-else-if="!error">
        <div class="calendar-layout">
          <section class="month-card" aria-label="월간 달력">
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
                @click="selectDate(cell.date)"
              >
                <time :datetime="cell.date.format('YYYY-MM-DD')">{{ cell.date.date() }}</time>
                <template v-if="cell.anniversaries.length">
                  <div class="cell-dots" aria-hidden="true">
                    <i v-for="anv in cell.anniversaries.slice(0, 4)" :key="anv.id" class="cell-dot" :class="primaryColorForTags(anv.tags).dot" />
                    <span v-if="cell.anniversaries.length > 4" class="cell-more">+{{ cell.anniversaries.length - 4 }}</span>
                  </div>
                  <div class="cell-events">
                    <span v-for="anv in cell.anniversaries.slice(0, 2)" :key="anv.id">
                      <i class="cell-dot" :class="primaryColorForTags(anv.tags).dot" />
                      <span>{{ anv.name }}</span>
                    </span>
                    <span v-if="cell.anniversaries.length > 2" class="cell-more">+{{ cell.anniversaries.length - 2 }} more</span>
                  </div>
                </template>
              </button>
            </div>
          </section>

          <aside class="day-panel" aria-labelledby="selected-date-heading">
            <div class="day-panel-head">
              <p class="section-kicker"><span /> SELECTED DATE</p>
              <div class="day-panel-date">
                <strong>{{ selectedDate.date() }}</strong>
                <span>{{ selectedMonthEn }}<br />{{ selectedWeekdayEn }}</span>
              </div>
              <span class="day-panel-ring" aria-hidden="true" />
            </div>

            <div class="day-panel-body">
              <div class="day-panel-title">
                <h2 id="selected-date-heading">{{ selectedHumanDate }}</h2>
                <span>{{ selectedAnniversaries.length }}개</span>
              </div>
              <ol v-if="selectedAnniversaries.length" class="day-panel-list" aria-label="선택한 날짜의 기념일 목록" tabindex="0">
                <li v-for="anv in selectedAnniversaries" :key="anv.id">
                  <CategoryBadge :category-id="anv.category" />
                  <RouterLink v-if="pathFor(anv)" :to="pathFor(anv)!">{{ anv.name }}</RouterLink>
                  <h3 v-else>{{ anv.name }}</h3>
                  <p>{{ anv.storytelling.origin }}</p>
                  <button type="button" class="panel-share" @click="handleShare(anv)">공유하기 <span aria-hidden="true">↗</span></button>
                </li>
              </ol>
              <p v-else class="day-panel-empty">이 날엔 등록된 기념일이 없어요.</p>
            </div>
          </aside>
        </div>

        <div class="calendar-legend">
          <span><i class="bg-amber-700" />음식 &amp; 디저트</span>
          <span><i class="bg-fuchsia-700" />문화 &amp; 예술</span>
          <span><i class="bg-sky-700" />국제 캠페인</span>
          <span><i class="bg-emerald-700" />동물 &amp; 자연</span>
          <span><i class="bg-rose-700" />역사 &amp; 공휴일</span>
        </div>
      </template>
    </div>
  </div>
</template>
