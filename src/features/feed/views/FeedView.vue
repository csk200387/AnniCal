<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import { useTodayFeed } from '../composables/useTodayFeed'
import AnniversaryCard from '@/components/card/AnniversaryCard.vue'
import type { Anniversary } from '@/types/anniversary'
import { useShareStore } from '@/stores/share'

const { todays, upcoming, isLoading, error } = useTodayFeed(30)
const shareStore = useShareStore()

const todayLong = computed(() => {
  const d = dayjs()
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.day()]
  return `${d.year()}년 ${d.month() + 1}월 ${d.date()}일 ${wd}요일`
})

const issueLabel = computed(() => {
  const d = dayjs()
  const dayOfYear = d.diff(dayjs(`${d.year()}-01-01`), 'day') + 1
  return `Vol. ${d.year()} · Issue ${String(dayOfYear).padStart(3, '0')}`
})

function handleShare(anv: Anniversary, dDay?: number) {
  shareStore.open(anv, dDay)
}
</script>

<template>
  <div class="space-y-14">
    <!-- Hero / cover header — magazine cover treatment -->
    <section class="relative">
      <div class="flex items-center gap-3">
        <span class="h-px w-10 bg-ink-700" />
        <span class="eyebrow">{{ issueLabel }}</span>
      </div>

      <h1 class="mt-6 font-display text-[3rem] font-medium leading-[0.98] tracking-[-0.02em] text-ink-900 sm:text-[4rem]">
        오늘의<br />기념일
      </h1>

      <div class="mt-6 flex items-baseline justify-between border-b hairline pb-4">
        <p class="font-display text-base italic text-ink-500">
          {{ todayLong }}
        </p>
        <p class="hidden font-display text-sm tracking-wide text-ink-400 sm:block">
          The Daily Curation
        </p>
      </div>
    </section>

    <!-- Today's anniversaries -->
    <section>
      <p v-if="isLoading" class="eyebrow">Loading…</p>
      <p v-else-if="error" class="text-sm text-accent-600">{{ error }}</p>

      <template v-else>
        <div v-if="todays.length" class="space-y-10">
          <AnniversaryCard
            v-for="a in todays"
            :key="a.id"
            :anniversary="a"
            @share="handleShare"
          />
        </div>
        <div
          v-else
          class="border-y hairline bg-paper-50 px-6 py-16 text-center"
        >
          <p class="eyebrow">No entries for today</p>
          <p class="mt-3 font-display text-lg italic text-ink-500">
            오늘은 등록된 기념일이 없어요.
          </p>
          <p class="mt-1 text-sm text-ink-400">
            아래에서 다가오는 기념일을 둘러보세요.
          </p>
        </div>
      </template>
    </section>

    <!-- Upcoming section divider -->
    <section v-if="upcoming.length">
      <div class="mb-8 flex items-center gap-5">
        <span class="h-px flex-1 bg-rule" />
        <div class="flex flex-col items-center">
          <span class="eyebrow">Upcoming</span>
          <span class="mt-1 font-display text-xl tracking-tight text-ink-800">
            다가오는 기념일
          </span>
        </div>
        <span class="h-px flex-1 bg-rule" />
      </div>

      <div class="space-y-10">
        <AnniversaryCard
          v-for="{ anniversary, dDay } in upcoming"
          :key="anniversary.id"
          :anniversary="anniversary"
          :d-day="dDay"
          @share="(anv) => handleShare(anv, dDay)"
        />
      </div>
    </section>
  </div>
</template>
