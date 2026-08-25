<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useStatsStore } from '@/stores/stats'
import { pathForId } from '@/utils/anniversaryRoutes'
import { primaryColorForTags } from '@/utils/tagPalette'

const anniversaries = useAnniversariesStore()
const stats = useStatsStore()
const number = new Intl.NumberFormat('ko-KR')

const entries = computed(() =>
  (stats.snapshot?.ranking ?? []).flatMap((ranked, index) => {
    const anniversary = anniversaries.byId.get(ranked.id)
    const path = pathForId(ranked.id)
    return anniversary && path
      ? [{ rank: index + 1, views: ranked.views, anniversary, path }]
      : []
  }),
)
</script>

<template>
  <section v-if="entries.length" aria-labelledby="popularity-title" class="mt-16">
    <div class="mb-6 flex flex-col items-start justify-between gap-4 border-b border-ink-900 pb-5 sm:flex-row sm:items-end">
      <div>
        <p class="eyebrow">
          <span class="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border hairline font-display text-xs text-accent-600">03</span>
          Readers’ choice
        </p>
        <h2 id="popularity-title" class="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-ink-900 sm:text-4xl">
          지금 가장 많이 읽힌 기념일
        </h2>
      </div>
      <p class="max-w-xs font-display text-sm italic leading-relaxed text-ink-400 sm:text-right">
        상세 페이지의 누적 조회수를 바탕으로 한 실시간 관심도 순위입니다.
      </p>
    </div>

    <ol class="border-t hairline">
      <li v-for="entry in entries" :key="entry.anniversary.id" class="border-b hairline">
        <RouterLink
          :to="entry.path"
          class="group grid min-h-24 grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-4 py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto]"
        >
          <span class="font-display text-3xl tabular-nums text-ink-300 transition-colors group-hover:text-accent-600">
            {{ String(entry.rank).padStart(2, '0') }}
          </span>
          <span class="min-w-0">
            <span class="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.16em] text-ink-400">
              <span class="h-1.5 w-1.5 rounded-full" :class="primaryColorForTags(entry.anniversary.tags).dot" aria-hidden="true" />
              {{ entry.anniversary.tags[0] ?? 'Anniversary' }}
            </span>
            <strong class="mt-1 block truncate font-display text-xl font-normal text-ink-900 transition-colors group-hover:text-accent-600">
              {{ entry.anniversary.name }}
            </strong>
          </span>
          <span class="text-right">
            <strong class="block font-display text-lg font-normal tabular-nums text-ink-700">{{ number.format(entry.views) }}</strong>
            <span class="text-[0.58rem] uppercase tracking-[0.14em] text-ink-400">views</span>
          </span>
        </RouterLink>
      </li>
    </ol>
  </section>
</template>
