<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { RouterLink } from 'vue-router'
import { useTodayFeed } from '../composables/useTodayFeed'
import TodayStoryCard from '../components/TodayStoryCard.vue'
import type { Anniversary } from '@/types/anniversary'
import { useShareStore } from '@/stores/share'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { pathFor } from '@/utils/anniversaryRoutes'
import AudienceStats from '@/features/stats/components/AudienceStats.vue'
import PopularityRanking from '@/features/stats/components/PopularityRanking.vue'

const { todays, upcoming, today, isLoading, error } = useTodayFeed(30)
const shareStore = useShareStore()

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
    if (entries[0]?.isIntersecting && hasMore.value) revealCount.value += PAGE_SIZE
  })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const todayValue = computed(() => dayjs(today.value))
const issueLabel = computed(() => {
  const d = todayValue.value
  const dayOfYear = d.diff(d.startOf('year'), 'day') + 1
  return `Vol. ${d.year()} · Issue ${String(dayOfYear).padStart(3, '0')}`
})
const monthLabel = computed(() =>
  ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][todayValue.value.month()],
)
const weekdayLabel = computed(() =>
  ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][todayValue.value.day()],
)
const todayStoryLine = computed(() => {
  if (!todays.value.length) return '오늘은 등록된 기념일이 없어요. 다가오는 이야기를 먼저 만나보세요.'
  const names = todays.value.map((item) => item.name)
  if (names.length <= 2) return `오늘의 이야기 — ${names.join(' · ')}`
  return `오늘의 이야기 — ${names.slice(0, 2).join(' · ')} 외 ${names.length - 2}개`
})

function handleShare(anv: Anniversary, dDay?: number) {
  shareStore.open(anv, dDay)
}
</script>

<template>
  <div>
    <section class="grid overflow-hidden border-b border-ink-900 md:grid-cols-[minmax(220px,0.68fr)_minmax(0,1.32fr)]">
      <div class="relative flex min-h-[285px] flex-col justify-between overflow-hidden bg-accent-600 p-7 text-paper-50 md:min-h-[430px] md:p-8">
        <div class="absolute -right-28 -top-24 h-72 w-72 rounded-full border border-paper-50/15" aria-hidden="true" />
        <div class="absolute -bottom-24 -right-12 h-56 w-56 rounded-full border border-paper-50/15 shadow-[0_0_0_28px_rgba(255,255,255,0.035)]" aria-hidden="true" />
        <p class="eyebrow !text-paper-200">{{ issueLabel }}</p>
        <strong class="relative z-10 my-8 font-display text-[7.5rem] font-normal leading-[0.75] tracking-[-0.09em] md:text-[10.5rem]">
          {{ todayValue.date() }}
        </strong>
        <div class="relative z-10 flex items-end justify-between gap-5">
          <span class="font-display text-3xl">{{ monthLabel }}</span>
          <span class="pb-1 text-right text-[0.6rem] uppercase tracking-[0.2em]">
            {{ weekdayLabel }}<br />{{ todayValue.year() }}
          </span>
        </div>
      </div>

      <div class="flex flex-col justify-end py-9 md:py-10 md:pl-16 lg:pl-20">
        <div class="flex items-center gap-3">
          <span class="h-px w-10 bg-accent-600" />
          <span class="eyebrow">The Daily Edition</span>
        </div>
        <h1 class="mt-7 font-display text-[3.1rem] font-normal leading-[0.98] tracking-[-0.055em] text-ink-900 sm:text-[4rem] lg:text-[4.75rem]">
          오늘이라는 날짜에<br /><em class="font-normal text-accent-600">이야기를 더합니다.</em>
        </h1>
        <p class="mt-6 max-w-2xl font-display text-lg leading-[1.7] text-ink-600">
          평범해 보이는 하루에도 누군가가 기억해 둔 이야기가 있습니다.
        </p>
        <p class="mt-2 max-w-2xl text-xs leading-relaxed text-ink-400">{{ todayStoryLine }}</p>
        <div class="mt-7 flex max-w-xl gap-10 border-t hairline pt-4">
          <div><span class="eyebrow">Today</span><strong class="mt-1 block font-display text-2xl font-normal">{{ todays.length }} stories</strong></div>
          <div><span class="eyebrow">Next 30 days</span><strong class="mt-1 block font-display text-2xl font-normal">{{ upcoming.length }} stories</strong></div>
        </div>
      </div>
    </section>

    <AudienceStats />

    <p v-if="isLoading" class="mt-14 eyebrow">Loading…</p>
    <p v-else-if="error" class="mt-14 text-sm text-accent-600">{{ error }}</p>

    <template v-else>
      <section class="mt-16">
        <div class="mb-6 flex flex-col items-start justify-between gap-4 border-b border-ink-900 pb-5 sm:flex-row sm:items-end">
          <div>
            <p class="eyebrow"><span class="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border hairline font-display text-xs text-accent-600">01</span>Today’s Stories</p>
            <h2 class="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-ink-900 sm:text-4xl">
              {{ todayValue.month() + 1 }}월 {{ todayValue.date() }}일의 기념일
            </h2>
          </div>
          <p class="max-w-xs font-display text-sm italic leading-relaxed text-ink-400 sm:text-right">
            오늘 등록된 모든 기념일을 한 편의 짧은 기사처럼 읽어보세요.
          </p>
        </div>

        <div v-if="todays.length" class="grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
          <TodayStoryCard
            v-for="(anniversary, index) in todays"
            :key="anniversary.id"
            :anniversary="anniversary"
            :index="index"
            :featured="index === 0"
            @share="handleShare"
          />
        </div>
        <div v-else class="border-y hairline bg-paper-50 px-6 py-16 text-center">
          <p class="eyebrow">No entries for today</p>
          <p class="mt-3 font-display text-lg italic text-ink-500">오늘은 등록된 기념일이 없어요.</p>
          <p class="mt-1 text-sm text-ink-400">아래에서 다가오는 기념일을 둘러보세요.</p>
        </div>
      </section>

      <section v-if="upcoming.length" class="mt-16">
        <div class="mb-6 flex flex-col items-start justify-between gap-4 border-b border-ink-900 pb-5 sm:flex-row sm:items-end">
          <div>
            <p class="eyebrow"><span class="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border hairline font-display text-xs text-accent-600">02</span>Upcoming</p>
            <h2 class="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-ink-900 sm:text-4xl">다가오는 기념일</h2>
          </div>
          <p class="max-w-xs font-display text-sm italic leading-relaxed text-ink-400 sm:text-right">
            앞으로 30일 동안 이어질 이야기를 날짜순으로 살펴봅니다.
          </p>
        </div>

        <div class="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <ol class="border-t hairline">
            <li
              v-for="{ anniversary, dDay } in visibleUpcoming"
              :key="anniversary.id"
              class="grid min-h-20 grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b hairline sm:gap-5"
            >
              <time class="text-xs tabular-nums text-ink-400">{{ formatKoreanMonthDay(anniversary, todayValue.year()) }}</time>
              <div class="min-w-0">
                <RouterLink
                  v-if="pathFor(anniversary)"
                  :to="pathFor(anniversary)!"
                  class="font-display text-lg text-ink-800 transition hover:text-accent-600"
                >{{ anniversary.name }}</RouterLink>
                <span v-else class="font-display text-lg text-ink-800">{{ anniversary.name }}</span>
                <span class="mt-1 block text-[0.58rem] uppercase tracking-[0.16em] text-ink-400">{{ anniversary.tags[0] }}</span>
              </div>
              <button
                type="button"
                class="font-display text-base text-accent-600 transition hover:text-accent-700"
                :aria-label="`${anniversary.name} 공유`"
                @click="handleShare(anniversary, dDay)"
              >D−{{ dDay }}</button>
            </li>
          </ol>

          <aside class="border-t-4 border-accent-600 bg-paper-200 p-6">
            <p class="eyebrow">Browse the month</p>
            <strong class="mt-4 block font-display text-2xl font-normal leading-tight text-ink-900">
              이번 달의 모든 날을<br />한눈에 살펴보기
            </strong>
            <p class="mt-4 font-display text-sm leading-relaxed text-ink-500">
              달력에서 날짜를 고르면 그날의 기념일과 이야기를 바로 확인할 수 있습니다.
            </p>
            <RouterLink
              to="/calendar"
              class="mt-7 inline-block border-b border-ink-800 pb-1 text-[0.65rem] uppercase tracking-[0.16em] text-ink-800 transition hover:border-accent-600 hover:text-accent-600"
            >Open Calendar →</RouterLink>
          </aside>
        </div>

        <div v-if="hasMore" ref="sentinelRef" class="pt-10 text-center">
          <span class="eyebrow">Loading more…</span>
        </div>
      </section>
    </template>

    <PopularityRanking />
  </div>
</template>
