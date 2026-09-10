<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useStatsStore } from '@/stores/stats'
import { useCountUp } from '@/composables/useCountUp'

const stats = useStatsStore()
const { snapshot, isUnavailable } = storeToRefs(stats)
const number = new Intl.NumberFormat('ko-KR')

// 응답이 오기 전에도 블록을 0으로 먼저 그려서 나중에 툭 튀어나오지 않게 한다.
// 값이 도착하면 0(또는 이전 값)에서 새 값까지 애니메이션으로 올라간다.
const visitorsToday = useCountUp(computed(() => snapshot.value?.visitorsToday ?? null))
const visitorsTotal = useCountUp(computed(() => snapshot.value?.visitorsTotal ?? null))
const pageViewsTotal = useCountUp(computed(() => snapshot.value?.pageViewsTotal ?? null))
</script>

<template>
  <section v-if="!isUnavailable" aria-labelledby="audience-stats-title" class="audience-stats">
    <div>
      <p class="section-kicker"><span class="live-dot" /> EVERY DAY, TOGETHER</p>
      <h2 id="audience-stats-title">오늘도 함께 발견하고 있어요.</h2>
      <p class="audience-note">익명 방문 기준으로 집계해요.</p>
    </div>
    <dl>
      <div><dt>오늘 방문자</dt><dd>{{ number.format(visitorsToday) }}<small>명</small></dd></div>
      <div><dt>누적 방문자</dt><dd>{{ number.format(visitorsTotal) }}<small>명</small></dd></div>
      <div><dt>전체 페이지뷰</dt><dd>{{ number.format(pageViewsTotal) }}<small>회</small></dd></div>
    </dl>
  </section>
</template>
