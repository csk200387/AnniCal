<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useMonthlyRanking } from '../composables/useMonthlyRanking'
import { monthKey } from '../months'
import { useNow } from '@/composables/useNow'
import { pathForId } from '@/utils/anniversaryRoutes'
import { primaryColorForTags } from '@/utils/tagPalette'

const anniversaries = useAnniversariesStore()
const { today } = useNow()
const month = computed(() => monthKey(today.value))
const { data } = useMonthlyRanking(month)
const number = new Intl.NumberFormat('ko-KR')

const entries = computed(() =>
  (data.value?.ranking ?? []).slice(0, 5).flatMap((ranked, index) => {
    const anniversary = anniversaries.byId.get(ranked.id)
    const path = pathForId(ranked.id)
    return anniversary && path
      ? [{ rank: index + 1, views: ranked.views, anniversary, path }]
      : []
  }),
)
</script>

<template>
  <section v-if="entries.length" aria-labelledby="popularity-title" class="home-section popularity-section">
    <div class="section-heading">
      <div>
        <p class="section-kicker"><span /> READERS’ FAVORITES</p>
        <h2 id="popularity-title">이번 달, 많이 발견한 이야기<span class="heading-dot">.</span></h2>
        <p class="section-description">{{ today.getMonth() + 1 }}월에 읽힌 횟수로 살펴보는 관심도 순위.</p>
      </div>
      <span class="date-pill">TOP {{ entries.length }}</span>
    </div>
    <ol class="popularity-list">
      <li v-for="entry in entries" :key="entry.anniversary.id">
        <RouterLink :to="entry.path">
          <span class="popularity-rank">{{ String(entry.rank).padStart(2, '0') }}</span>
          <span class="popularity-story">
            <span class="popularity-tag"><i :class="primaryColorForTags(entry.anniversary.tags).dot" aria-hidden="true" />{{ entry.anniversary.tags[0] ?? '기념일' }}</span>
            <strong>{{ entry.anniversary.name }}</strong>
          </span>
          <span class="popularity-views"><strong>{{ number.format(entry.views) }}</strong><span>회 읽었어요</span></span>
          <span class="popularity-arrow" aria-hidden="true">↗</span>
        </RouterLink>
      </li>
    </ol>
    <RouterLink class="section-text-link" to="/popular">전체 관심도 순위 보기 <span aria-hidden="true">→</span></RouterLink>
  </section>
</template>
