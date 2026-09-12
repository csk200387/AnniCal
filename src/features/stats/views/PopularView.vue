<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useStatsStore } from '@/stores/stats'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { pathForId } from '@/utils/anniversaryRoutes'
import { primaryColorForTags } from '@/utils/tagPalette'
import '@/assets/popular.css'

const anniversaries = useAnniversariesStore()
const stats = useStatsStore()
const { snapshot, isLoading: statsLoading, isUnavailable } = storeToRefs(stats)
const number = new Intl.NumberFormat('ko-KR')

onMounted(async () => {
  await anniversaries.ensureAll()
  // AppShell의 페이지뷰 요청 결과가 이미 있더라도 최신 공개 순위를 다시 확인한다.
  await stats.refresh()
})

const categoryById = computed(() => new Map(anniversaries.categories.map((category) => [category.id, category])))
const entries = computed(() =>
  (snapshot.value?.ranking ?? []).flatMap((ranked, index) => {
    const anniversary = anniversaries.byId.get(ranked.id)
    const path = pathForId(ranked.id)
    if (!anniversary || !path) return []
    return [{
      rank: index + 1,
      views: ranked.views,
      anniversary,
      path,
      date: formatKoreanMonthDay(anniversary) ?? '날짜 미정',
      category: categoryById.value.get(anniversary.category),
    }]
  }),
)
const totalRankedViews = computed(() => entries.value.reduce((sum, entry) => sum + entry.views, 0))
const isPending = computed(() => (statsLoading.value || anniversaries.isLoading) && !entries.value.length && !isUnavailable.value)
</script>

<template>
  <div class="home-page popular-page">
    <div class="home-container">
      <header class="page-hero popular-hero" aria-labelledby="popular-title">
        <p class="section-kicker"><span /> READERS’ FAVORITES · ALL TIME</p>
        <h1 id="popular-title">가장 많이 발견된<br /><em>기념일 이야기</em><span class="heading-dot">.</span></h1>
        <p class="page-hero-description">독자들이 기념일 상세 페이지를 읽은 횟수를 누적해 보여드려요. 새로운 발견이 쌓일 때마다 순위도 함께 달라집니다.</p>
        <div class="page-hero-stats">
          <div><span>RANKED STORIES</span><strong>{{ number.format(entries.length) }}<small>개</small></strong></div>
          <div><span>TOP STORIES READ</span><strong>{{ number.format(totalRankedViews) }}<small>회</small></strong></div>
        </div>
        <span class="page-hero-spark" aria-hidden="true">✳</span>
      </header>

      <section class="ranking-board" aria-labelledby="ranking-board-title" aria-live="polite">
        <div class="ranking-board-heading">
          <div>
            <p class="section-kicker"><span /> POPULARITY INDEX</p>
            <h2 id="ranking-board-title">누적 관심도 순위</h2>
          </div>
          <p>상세 페이지 누적 읽음 기준</p>
        </div>

        <div v-if="isPending" class="ranking-state">
          <span class="ranking-loader" aria-hidden="true" />
          <strong>순위를 불러오고 있어요</strong>
          <p>잠시만 기다려 주세요.</p>
        </div>
        <div v-else-if="isUnavailable" class="ranking-state">
          <span aria-hidden="true">☁</span>
          <strong>지금은 관심도 순위를 불러올 수 없어요</strong>
          <p>기념일 이야기는 그대로 둘러볼 수 있어요.</p>
          <RouterLink to="/calendar">기념일 달력 보기 →</RouterLink>
        </div>
        <div v-else-if="!entries.length" class="ranking-state">
          <span aria-hidden="true">✦</span>
          <strong>첫 번째 관심 기록을 기다리고 있어요</strong>
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
              <span class="ranking-views"><strong>{{ number.format(entry.views) }}</strong><small>누적 읽음</small></span>
              <span class="ranking-go" aria-hidden="true">↗</span>
            </RouterLink>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>
