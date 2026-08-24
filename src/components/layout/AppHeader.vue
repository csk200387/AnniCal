<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'

const todayLabel = computed(() => {
  const d = dayjs()
  const weekday = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][d.day()]
  return `${weekday} · ${d.format('YYYY.MM.DD')}`
})
</script>

<template>
  <header class="sticky top-0 z-20 border-t-[3px] border-t-ink-900 bg-paper-100/90 backdrop-blur-md">
    <div class="border-b hairline">
      <!-- Masthead row -->
      <div class="mx-auto flex min-h-[86px] w-full max-w-[1180px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-10">
        <div class="flex flex-col">
          <span class="eyebrow">A Daily Curation</span>
          <RouterLink to="/" class="mt-1 leading-none">
            <span class="font-display text-[1.7rem] font-medium tracking-[-0.04em] text-ink-900 sm:text-[2rem]">
              기념일 만물상
            </span>
          </RouterLink>
        </div>

        <div class="hidden flex-col items-end text-right sm:flex">
          <span class="eyebrow">Today</span>
          <span class="mt-1 font-display text-sm tracking-wide text-ink-600">
            {{ todayLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Sub-nav row, hairline separated -->
    <nav class="border-b hairline">
      <div class="mx-auto flex w-full max-w-[1180px] items-center gap-5 overflow-x-auto px-5 sm:gap-8 sm:px-8 lg:px-10">
        <RouterLink
          v-for="item in [
            { to: '/', label: '오늘', en: 'Today' },
            { to: '/calendar', label: '달력', en: 'Calendar' },
            { to: '/export', label: '캘린더 연동', en: 'Subscribe' },
          ]"
          :key="item.to"
          :to="item.to"
          class="group relative -mb-px shrink-0 py-3 text-[0.72rem] font-medium tracking-[0.18em] uppercase text-ink-400 transition-colors hover:text-ink-800 sm:text-[0.78rem]"
          active-class="!text-ink-900"
        >
          <span>{{ item.en }}</span>
          <span class="mx-2 text-ink-300">/</span>
          <span class="font-display text-[0.95rem] normal-case tracking-normal">
            {{ item.label }}
          </span>
          <span
            class="absolute inset-x-0 -bottom-px h-0.5 scale-x-0 bg-accent-600 transition-transform duration-300 group-[.router-link-exact-active]:scale-x-100"
          />
        </RouterLink>
      </div>
    </nav>
  </header>
</template>
