<script setup lang="ts">
import { useMonthCalendar } from '../composables/useMonthCalendar'
import AnniversaryCard from '@/components/card/AnniversaryCard.vue'
import type { Anniversary } from '@/types/anniversary'

const {
  monthLabel,
  weeks,
  selectedDate,
  selectedAnniversaries,
  isLoading,
  error,
  goPrevMonth,
  goNextMonth,
  goToday,
  selectDate,
} = useMonthCalendar()

const weekdayLabels = ['일', '월', '화', '수', '목', '금', '토']

function handleShare(anv: Anniversary) {
  // TODO: features/share 모듈에 위임 예정
  console.log('share', anv.id)
}
</script>

<template>
  <div class="space-y-6">
    <header class="flex items-center justify-between">
      <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900">
        {{ monthLabel }}
      </h1>
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="rounded-full px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
          @click="goPrevMonth"
        >
          ‹
        </button>
        <button
          type="button"
          class="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-200"
          @click="goToday"
        >
          오늘
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
          @click="goNextMonth"
        >
          ›
        </button>
      </div>
    </header>

    <p v-if="isLoading" class="text-sm text-neutral-500">불러오는 중…</p>
    <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

    <template v-else>
      <div class="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div class="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50 text-center text-xs font-semibold text-neutral-500">
          <div
            v-for="(label, i) in weekdayLabels"
            :key="label"
            class="py-2"
            :class="{
              'text-rose-500': i === 0,
              'text-sky-500': i === 6,
            }"
          >
            {{ label }}
          </div>
        </div>

        <div class="grid grid-cols-7">
          <button
            v-for="cell in weeks.flat()"
            :key="cell.date.format('YYYY-MM-DD')"
            type="button"
            class="relative flex min-h-[72px] flex-col items-stretch gap-1 border-b border-r border-neutral-100 p-1.5 text-left transition hover:bg-neutral-50 sm:min-h-[88px]"
            :class="{
              'bg-neutral-50/60 text-neutral-300': !cell.isCurrentMonth,
              'ring-2 ring-inset ring-brand-500':
                selectedDate.isSame(cell.date, 'day'),
            }"
            @click="selectDate(cell.date)"
          >
            <span
              class="inline-flex h-6 w-6 items-center justify-center text-xs font-medium"
              :class="{
                'rounded-full bg-brand-500 text-white': cell.isToday,
                'text-neutral-900': cell.isCurrentMonth && !cell.isToday,
              }"
            >
              {{ cell.date.date() }}
            </span>

            <div
              v-if="cell.anniversaries.length"
              class="flex flex-col gap-0.5 overflow-hidden"
            >
              <span
                v-for="anv in cell.anniversaries.slice(0, 2)"
                :key="anv.id"
                class="truncate rounded px-1 text-[10px] font-medium leading-tight"
                :class="cell.isCurrentMonth ? 'bg-brand-50 text-brand-700' : 'bg-neutral-100 text-neutral-400'"
                :title="anv.name"
              >
                {{ anv.name }}
              </span>
              <span
                v-if="cell.anniversaries.length > 2"
                class="px-1 text-[10px] text-neutral-400"
              >
                +{{ cell.anniversaries.length - 2 }}
              </span>
            </div>
          </button>
        </div>
      </div>

      <section>
        <h2 class="mb-3 text-sm font-bold text-neutral-700">
          {{ selectedDate.format('M월 D일') }} 의 기념일
          <span class="font-normal text-neutral-400">
            ({{ selectedAnniversaries.length }}건)
          </span>
        </h2>

        <div v-if="selectedAnniversaries.length" class="space-y-4">
          <AnniversaryCard
            v-for="a in selectedAnniversaries"
            :key="a.id"
            :anniversary="a"
            @share="handleShare"
          />
        </div>
        <div
          v-else
          class="rounded-2xl border border-dashed border-neutral-300 bg-white p-6 text-center text-sm text-neutral-500"
        >
          이 날엔 등록된 기념일이 없어요.
        </div>
      </section>
    </template>
  </div>
</template>
