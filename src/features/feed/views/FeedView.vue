<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useTodayFeed } from '../composables/useTodayFeed'
import AnniversaryCard from '@/components/card/AnniversaryCard.vue'
import type { Anniversary } from '@/types/anniversary'
import { useShareStore } from '@/stores/share'

const { todays, upcoming, isLoading, error } = useTodayFeed(30)
const shareStore = useShareStore()

// 오늘의 기념일은 항상 전부 즉시 렌더링한다. "다가오는 기념일"은 자칫 한 번에
// 수십~백여 장이 그려질 수 있어, (오늘 + 다가오는) 합이 PAGE_SIZE 이상일 때만
// 처음엔 PAGE_SIZE 개만 보여주고 스크롤로 바닥에 닿을 때마다 더 풀어준다.
const PAGE_SIZE = 10
const revealCount = ref(PAGE_SIZE)

const totalCount = computed(() => todays.value.length + upcoming.value.length)
const needsPaging = computed(() => totalCount.value >= PAGE_SIZE)

const visibleUpcoming = computed(() => {
  if (!needsPaging.value) return upcoming.value
  const limit = Math.max(revealCount.value - todays.value.length, 0)
  return upcoming.value.slice(0, limit)
})

const hasMore = computed(
  () => needsPaging.value && visibleUpcoming.value.length < upcoming.value.length,
)

// 데이터가 늦게 도착해 todays/upcoming 이 바뀌어도 첫 페이지 크기를 유지.
watch([todays, upcoming], () => {
  if (revealCount.value < PAGE_SIZE) revealCount.value = PAGE_SIZE
})

const sentinelRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

watch(sentinelRef, (el) => {
  observer?.disconnect()
  observer = null
  if (!el) return
  observer = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && hasMore.value) {
      revealCount.value += PAGE_SIZE
    }
  })
  observer.observe(el)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})

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
          v-for="{ anniversary, dDay } in visibleUpcoming"
          :key="anniversary.id"
          :anniversary="anniversary"
          :d-day="dDay"
          @share="(anv) => handleShare(anv, dDay)"
        />
      </div>

      <!-- 스크롤 감지용 sentinel — 보이는 순간 다음 PAGE_SIZE 개를 더 풀어준다. -->
      <div v-if="hasMore" ref="sentinelRef" class="pt-10 text-center">
        <span class="eyebrow">Loading more…</span>
      </div>
    </section>
  </div>
</template>
