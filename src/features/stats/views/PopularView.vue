<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useStatsStore } from '@/stores/stats'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { pathForId } from '@/utils/anniversaryRoutes'
import { useNow } from '@/composables/useNow'
import { useMonths } from '@/composables/useMonths'
import { ALL_MONTHS } from '@/services/anniversaryRepository'
import { countFormat, displayName } from '@/utils/format'
import { useMonthlyRanking } from '../composables/useMonthlyRanking'
import { monthKey, monthLabel, shiftMonth } from '../months'
import PageHero from '@/components/ui/PageHero.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import SegmentedControl from '@/components/ui/SegmentedControl.vue'
import ListGroup from '@/components/ui/ListGroup.vue'
import ListRow from '@/components/ui/ListRow.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'
import CategorySymbol from '@/features/feed/components/CategorySymbol.vue'
import PromoCard from '@/components/ui/PromoCard.vue'
import { RouterLink } from 'vue-router'
import '@/assets/popular.css'

const anniversaries = useAnniversariesStore()
const stats = useStatsStore()
const { snapshot, isLoading: statsLoading, isUnavailable } = storeToRefs(stats)
const { loading: dataLoading, error: dataError, retry: retryData } = useMonths(ALL_MONTHS)
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
const unavailable = computed(() => dataError.value || (isAllTime.value ? isUnavailable.value : monthFailed.value))
function selectPeriod(month: string) {
  if (month) void router.push({ path: '/popular', query: { month } })
}
function retry() {
  void retryData()
  if (isAllTime.value) void stats.refresh()
  else void refreshMonth()
}

watch(isAllTime, (value) => { if (value) void stats.refresh() }, { immediate: true })

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
      category: anniversaries.categoryById.get(anniversary.category),
    }]
  }),
)
const totalRankedViews = computed(() => entries.value.reduce((sum, entry) => sum + entry.views, 0))
const isPending = computed(() => ((isAllTime.value ? statsLoading.value : monthLoading.value) || dataLoading.value) && !unavailable.value)
</script>

<template>
  <div class="home-page popular-page">
    <div class="tool-container">
      <PageHero :kicker="`READERS’ FAVORITES · ${isAllTime ? 'ALL TIME' : 'MONTHLY'}`" title-id="popular-title" description="매달 어떤 이야기가 사랑받았을까요? 그달에 읽힌 횟수로 관심도 순위를 모았어요. 지난달의 발견도 다시 만나보세요.">
        <template #title>가장 많이 발견된<br /><span class="popular-title-accent">기념일 이야기</span><span class="heading-dot">.</span></template>
        <template #footer>
          <dl class="popular-summary"><div><dt>{{ periodLabel }} 순위에 오른 이야기</dt><dd>{{ isPending || unavailable || !validPeriod ? '—' : countFormat.format(entries.length) }}<small>개</small></dd></div><div><dt>상위 이야기 읽음 합계</dt><dd>{{ isPending || unavailable || !validPeriod ? '—' : countFormat.format(totalRankedViews) }}<small>회</small></dd></div></dl>
        </template>
      </PageHero>
      <section class="tool-section ranking-board" aria-labelledby="ranking-board-title" :aria-busy="isPending">
        <div class="popular-controls">
          <SegmentedControl :model-value="isAllTime ? 'all' : 'monthly'" :options="[{ value: 'monthly', label: '월별' }, { value: 'all', label: '누적' }]" label="관심도 집계 기간" @update:model-value="selectPeriod($event === 'all' ? 'all' : currentMonth)" />
          <div v-if="!isAllTime" class="popular-month-stepper">
            <UiButton variant="ghost" size="s" aria-label="이전 달" :disabled="!selectedMonth || selectedMonth <= '2000-01'" @click="selectPeriod(shiftMonth(selectedMonth, -1))">‹</UiButton>
            <div class="popular-month-input"><label for="ranking-month">{{ selectedMonth ? monthLabel(selectedMonth) : '기록 월 선택' }}</label><input id="ranking-month" type="month" :value="selectedMonth" min="2000-01" :max="currentMonth" aria-label="기록 월 선택" @change="selectPeriod(($event.target as HTMLInputElement).value)" /></div>
            <UiButton variant="ghost" size="s" aria-label="다음 달" :disabled="!selectedMonth || selectedMonth >= currentMonth" @click="selectPeriod(shiftMonth(selectedMonth, 1))">›</UiButton>
          </div>
          <UiButton v-if="!isAllTime && selectedMonth !== currentMonth" variant="weak" size="s" @click="selectPeriod(currentMonth)">이번 달</UiButton>
        </div>
        <SectionHeader kicker="POPULARITY INDEX" :title="`${periodLabel} 관심도 TOP 20`" title-id="ranking-board-title">
          <template #action><p class="popular-period-note">{{ isAllTime ? '상세 페이지 누적 읽음 기준이에요' : selectedMonth === currentMonth ? '이번 달 읽음을 모으고 있어요' : '지난 읽음 기록이에요' }}</p></template>
        </SectionHeader>
        <p v-if="!isPending && !unavailable && partialMonth" class="ui-callout">이달은 {{ Number(monthly!.trackingStartedOn!.slice(8)) }}일부터 월별 읽음을 모았어요. 그 이후의 읽음만 포함해요.</p>
        <ResultState v-if="!validPeriod" tone="error" title="올바른 기록 월을 선택해 주세요" description="지금까지의 월별 순위를 볼 수 있어요."><template #actions><UiButton @click="selectPeriod(currentMonth)">이번 달 보기</UiButton></template></ResultState>
        <SkeletonRows v-else-if="isPending" :rows="3" variant="card" label="관심도 순위를 불러오고 있어요" />
        <ResultState v-else-if="unavailable" tone="error" title="지금은 관심도 순위를 불러올 수 없어요" description="잠시 후 다시 시도해 주세요. 기념일 이야기는 달력에서 둘러볼 수 있어요."><template #actions><UiButton icon="retry" @click="retry">다시 불러오기</UiButton><UiButton to="/calendar" variant="outline" icon="next">기념일 달력 보기</UiButton></template></ResultState>
        <ResultState v-else-if="!isAllTime && noHistory" title="이달은 월별 읽음 기록이 없어요" :description="`${monthly?.trackingStartedOn ? `${monthly.trackingStartedOn.replaceAll('-', '.')}부터 월별 기록을 모으고 있어요.` : '월별 기록 수집이 아직 시작되지 않았어요.'} 이전 조회수는 전체 누적에서 볼 수 있어요.`"><template #actions><UiButton icon="next" @click="selectPeriod('all')">전체 누적 보기</UiButton></template></ResultState>
        <ResultState v-else-if="!entries.length" :title="isAllTime || selectedMonth === currentMonth ? '첫 번째 관심 기록을 기다리고 있어요' : '이달에는 읽음 기록이 없어요'" description="마음에 드는 기념일 이야기를 발견해 보세요."><template #actions><UiButton to="/calendar" variant="outline" icon="next">기념일 둘러보기</UiButton></template></ResultState>
        <template v-else>
          <ol class="popular-podium" aria-label="가장 많이 읽은 이야기 1위부터 3위">
            <li v-for="entry in entries.slice(0, 3)" :key="entry.anniversary.id">
              <RouterLink :to="entry.path" class="popular-podium-card">
                <span class="popular-podium-art"><span class="popular-podium-rank"><span class="sr-only">순위 </span>{{ String(entry.rank).padStart(2, '0') }}<span class="sr-only">위</span></span><CategorySymbol :category="entry.anniversary.category" width="64" height="64" aria-hidden="true" /></span>
                <span class="popular-podium-body"><span class="popular-podium-category">{{ entry.category?.label ?? '기념일' }} · {{ entry.date }}</span><strong>{{ displayName(entry.anniversary.name) }}</strong><span class="popular-podium-footer"><span>{{ countFormat.format(entry.views) }}<small>{{ isAllTime ? '누적 읽음' : '해당 월 읽음' }}</small></span><span aria-hidden="true">↗</span></span></span>
              </RouterLink>
            </li>
          </ol>
          <ListGroup v-if="entries.length > 3" as="ol" class="popular-rest" :start="entries[3].rank" label="4위부터의 관심도 순위">
            <li v-for="entry in entries.slice(3)" :key="entry.anniversary.id"><ListRow :to="entry.path"><template #prefix><span class="popular-rest-rank"><span class="sr-only">순위 </span>{{ String(entry.rank).padStart(2, '0') }}<span class="sr-only">위</span></span></template><template #title>{{ displayName(entry.anniversary.name) }}</template><template #detail>{{ entry.category?.label ?? '기념일' }} · {{ entry.date }}</template><template #suffix><span class="popular-views"><strong>{{ countFormat.format(entry.views) }}</strong><small>{{ isAllTime ? '누적 읽음' : '해당 월 읽음' }}</small></span></template></ListRow></li>
          </ListGroup>
        </template>
      </section>
      <div class="tool-cross-links"><PromoCard kicker="YOUR NEXT FAVORITE DAY" title="다음 발견을 찾아보세요." description="기념일 달력에서 좋아하는 날을 하나씩 만나보세요." to="/calendar" cta="기념일 달력 열기" /></div>
    </div>
  </div>
</template>
