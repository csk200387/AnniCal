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
  <section
    v-if="!isUnavailable"
    aria-labelledby="audience-stats-title"
    class="mt-10 grid border-y border-ink-900 bg-paper-50 lg:grid-cols-[1.15fr_1.85fr]"
  >
    <div class="border-b border-ink-900 px-6 py-6 lg:border-b-0 lg:border-r lg:px-8">
      <p class="eyebrow">Live readership</p>
      <h2 id="audience-stats-title" class="mt-2 font-display text-2xl font-normal tracking-tight text-ink-900">
        오늘도 이야기가 읽히고 있어요.
      </h2>
      <p class="mt-2 max-w-sm text-xs leading-relaxed text-ink-400">
        익명 브라우저 기준으로 집계하며, 개인을 알아볼 수 있는 정보는 저장하지 않습니다.
      </p>
    </div>

    <dl class="grid grid-cols-3 divide-x divide-rule">
      <div class="flex min-h-28 flex-col justify-between px-4 py-5 sm:px-7">
        <dt class="text-[0.58rem] uppercase tracking-[0.16em] text-ink-400">오늘 방문자</dt>
        <dd class="font-display text-[1.7rem] tabular-nums text-ink-900 sm:text-3xl">
          {{ number.format(visitorsToday) }}<small class="ml-1 text-[0.65rem] text-ink-400">명</small>
        </dd>
      </div>
      <div class="flex min-h-28 flex-col justify-between px-4 py-5 sm:px-7">
        <dt class="text-[0.58rem] uppercase tracking-[0.16em] text-ink-400">누적 방문자</dt>
        <dd class="font-display text-[1.7rem] tabular-nums text-ink-900 sm:text-3xl">
          {{ number.format(visitorsTotal) }}<small class="ml-1 text-[0.65rem] text-ink-400">명</small>
        </dd>
      </div>
      <div class="flex min-h-28 flex-col justify-between px-4 py-5 sm:px-7">
        <dt class="text-[0.58rem] uppercase tracking-[0.16em] text-ink-400">전체 페이지뷰</dt>
        <dd class="font-display text-[1.7rem] tabular-nums text-accent-600 sm:text-3xl">
          {{ number.format(pageViewsTotal) }}<small class="ml-1 text-[0.65rem] text-ink-400">회</small>
        </dd>
      </div>
    </dl>
  </section>
</template>
