<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useStatsStore } from '@/stores/stats'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { pathForId } from '@/utils/anniversaryRoutes'
import { primaryColorForTags } from '@/utils/tagPalette'
import { useNow } from '@/composables/useNow'
import { useMonthlyRanking } from '../composables/useMonthlyRanking'
import { monthKey, monthLabel, shiftMonth } from '../months'
import '@/assets/popular.css'

const anniversaries = useAnniversariesStore()
const stats = useStatsStore()
const { snapshot, isLoading: statsLoading, isUnavailable } = storeToRefs(stats)
const number = new Intl.NumberFormat('ko-KR')
const route = useRoute()
const router = useRouter()
const { today } = useNow()
const currentMonth = computed(() => monthKey(today.value))
const period = computed(() => route.query.month ?? currentMonth.value)
const isAllTime = computed(() => period.value === 'all')
const validPeriod = computed(() => isAllTime.value || (typeof period.value === 'string' && /^20\d{2}-(0[1-9]|1[0-2])$/.test(period.value) && period.value <= currentMonth.value))
const selectedMonth = computed(() => !isAllTime.value && validPeriod.value ? String(period.value) : '')
const { data: monthly, loading: monthLoading, failed: monthFailed, refresh: refreshMonth } = useMonthlyRanking(selectedMonth)
const periodLabel = computed(() => isAllTime.value ? '누적' : selectedMonth.value ? monthLabel(selectedMonth.value) : '월별')
const noHistory = computed(() => !!monthly.value && (!monthly.value.trackingStartedOn || monthly.value.month < monthly.value.trackingStartedOn.slice(0, 7)))
const partialMonth = computed(() => !!monthly.value?.trackingStartedOn && monthly.value.trackingStartedOn.startsWith(selectedMonth.value) && !monthly.value.trackingStartedOn.endsWith('-01'))
const unavailable = computed(() => anniversaries.error || (isAllTime.value ? isUnavailable.value : monthFailed.value))
function selectPeriod(month: string) {
  if (month) void router.push({ path: '/popular', query: { month } })
}
function retry() {
  void anniversaries.ensureAll()
  if (isAllTime.value) void stats.refresh()
  else void refreshMonth()
}

onMounted(async () => {
  await anniversaries.ensureAll()
})
watch(isAllTime, (value) => { if (value) void stats.refresh() }, { immediate: true })

const categoryById = computed(() => new Map(anniversaries.categories.map((category) => [category.id, category])))
const entries = computed(() =>
  (isAllTime.value ? snapshot.value?.ranking ?? [] : monthly.value?.ranking ?? []).flatMap((ranked, index) => {
    const anniversary = anniversaries.byId.get(ranked.id)
    const path = pathForId(ranked.id)
    if (!anniversary || !path) return []
    return [{
      rank: index + 1,
      views: ranked.views,
      anniversary,
      path,
      date: formatKoreanMonthDay(anniversary, selectedMonth.value ? Number(selectedMonth.value.slice(0, 4)) : undefined) ?? '날짜 미정',
      category: categoryById.value.get(anniversary.category),
    }]
  }),
)
const totalRankedViews = computed(() => entries.value.reduce((sum, entry) => sum + entry.views, 0))
const isPending = computed(() => ((isAllTime.value ? statsLoading.value : monthLoading.value) || anniversaries.isLoading) && !unavailable.value)
</script>

<template>
  <div class="home-page popular-page">
    <div class="home-container">
      <header class="page-hero popular-hero" aria-labelledby="popular-title">
        <p class="section-kicker"><span /> READERS’ FAVORITES · {{ isAllTime ? 'ALL TIME' : 'MONTHLY' }}</p>
        <h1 id="popular-title">가장 많이 발견된<br /><em>기념일 이야기</em><span class="heading-dot">.</span></h1>
        <p class="page-hero-description">매달 어떤 이야기가 사랑받았을까요? 그달에 읽힌 횟수로 관심도 순위를 모았어요. 지난달의 발견도 다시 만나보세요.</p>
        <div class="page-hero-stats">
          <div><span>{{ periodLabel }} 순위에 오른 이야기</span><strong>{{ isPending || unavailable ? '—' : number.format(entries.length) }}<small>개</small></strong></div>
          <div><span>상위 이야기 읽음 합계</span><strong>{{ isPending || unavailable ? '—' : number.format(totalRankedViews) }}<small>회</small></strong></div>
        </div>
        <span class="page-hero-spark" aria-hidden="true">✳</span>
      </header>

      <section class="ranking-board" aria-labelledby="ranking-board-title">
        <div class="ranking-period-controls">
          <div class="ranking-period-tabs" role="group" aria-label="관심도 집계 기간">
            <button type="button" :aria-pressed="!isAllTime" @click="selectPeriod(currentMonth)">월별 순위</button>
            <button type="button" :aria-pressed="isAllTime" @click="selectPeriod('all')">전체 누적</button>
          </div>
          <div v-if="!isAllTime" class="ranking-month-picker">
            <label for="ranking-month">기록 월</label>
            <button type="button" aria-label="이전 달" :disabled="!selectedMonth || selectedMonth <= '2000-01'" @click="selectPeriod(shiftMonth(selectedMonth, -1))">←</button>
            <input id="ranking-month" type="month" :value="selectedMonth" min="2000-01" :max="currentMonth" @change="selectPeriod(($event.target as HTMLInputElement).value)" />
            <button type="button" aria-label="다음 달" :disabled="!selectedMonth || selectedMonth >= currentMonth" @click="selectPeriod(shiftMonth(selectedMonth, 1))">→</button>
          </div>
        </div>
        <div v-if="!isAllTime" class="ranking-month-shortcuts">
          <button type="button" :aria-pressed="selectedMonth === currentMonth" @click="selectPeriod(currentMonth)">이번 달</button>
          <button type="button" :aria-pressed="selectedMonth === shiftMonth(currentMonth, -1)" @click="selectPeriod(shiftMonth(currentMonth, -1))">지난달 기록</button>
          <span>한국 시간 기준 · 해당 월에 읽힌 횟수</span>
        </div>
        <div class="ranking-board-heading">
          <div>
            <p class="section-kicker"><span /> POPULARITY INDEX</p>
            <h2 id="ranking-board-title">{{ periodLabel }} 관심도 TOP 20</h2>
          </div>
          <p>{{ isAllTime ? '상세 페이지 누적 읽음 기준' : selectedMonth === currentMonth ? '이번 달 · 집계 중' : '지난 기록' }}</p>
        </div>
        <p v-if="!isPending && !unavailable && partialMonth" class="ranking-history-note">이달은 {{ Number(monthly!.trackingStartedOn!.slice(8)) }}일부터 월별 집계를 시작했어요. 그 이후의 읽음만 포함됩니다.</p>

        <div v-if="!validPeriod" class="ranking-state" role="alert"><strong>올바른 기록 월을 선택해 주세요</strong><p>미래의 순위는 아직 볼 수 없어요.</p><button type="button" class="home-button" @click="selectPeriod(currentMonth)">이번 달 보기</button></div>
        <div v-else-if="isPending" class="ranking-state" role="status">
          <span class="ranking-loader" aria-hidden="true" />
          <strong>순위를 불러오고 있어요</strong>
          <p>잠시만 기다려 주세요.</p>
        </div>
        <div v-else-if="unavailable" class="ranking-state" role="alert">
          <span aria-hidden="true">☁</span>
          <strong>지금은 관심도 순위를 불러올 수 없어요</strong>
          <p>기념일 이야기는 그대로 둘러볼 수 있어요.</p>
          <button type="button" class="home-button" @click="retry">다시 불러오기 ↻</button>
          <RouterLink to="/calendar">기념일 달력 보기 →</RouterLink>
        </div>
        <div v-else-if="!isAllTime && noHistory" class="ranking-state" role="status">
          <span aria-hidden="true">◷</span><strong>이달은 월별 집계 기록이 없어요</strong>
          <p>{{ monthly?.trackingStartedOn ? `${monthly.trackingStartedOn.replaceAll('-', '.')}부터 월별 기록을 모으고 있어요.` : '월별 기록 수집이 아직 시작되지 않았어요.' }} 이전 조회수는 전체 누적에서 볼 수 있어요.</p>
          <button type="button" class="home-button" @click="selectPeriod('all')">전체 누적 보기 →</button>
        </div>
        <div v-else-if="!entries.length" class="ranking-state" role="status">
          <span aria-hidden="true">✦</span>
          <strong>{{ isAllTime || selectedMonth === currentMonth ? '첫 번째 관심 기록을 기다리고 있어요' : '이달에는 읽음 기록이 없어요' }}</strong>
          <p>마음에 드는 기념일 이야기를 발견해 보세요.</p>
          <RouterLink to="/calendar">기념일 둘러보기 →</RouterLink>
        </div>

        <ol v-else class="ranking-list">
          <li v-for="entry in entries" :key="entry.anniversary.id" :class="{ 'is-podium': entry.rank <= 3 }">
            <RouterLink :to="entry.path">
              <span class="ranking-number">{{ String(entry.rank).padStart(2, '0') }}</span>
              <span class="ranking-medal" aria-hidden="true">{{ entry.rank === 1 ? '●' : entry.rank === 2 ? '◐' : entry.rank === 3 ? '○' : '' }}</span>
              <span class="ranking-copy">
                <span class="ranking-meta">
                  <i :class="primaryColorForTags(entry.anniversary.tags).dot" aria-hidden="true" />
                  {{ entry.category?.label ?? '기념일' }} · {{ entry.date }}
                </span>
                <strong>{{ entry.anniversary.name }}</strong>
                <span class="ranking-tags">{{ entry.anniversary.tags.slice(0, 3).join(' · ') }}</span>
              </span>
              <span class="ranking-views"><strong>{{ number.format(entry.views) }}</strong><small>{{ isAllTime ? '누적 읽음' : '해당 월 읽음' }}</small></span>
              <span class="ranking-go" aria-hidden="true">↗</span>
            </RouterLink>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
