<script setup lang="ts">
import { computed } from 'vue'
import { useMonthCalendar } from '../composables/useMonthCalendar'
import AnniversaryCard from '@/components/card/AnniversaryCard.vue'
import type { Anniversary } from '@/types/anniversary'
import { useShareStore } from '@/stores/share'
import { daysUntil } from '@/utils/dateUtils'

const shareStore = useShareStore()

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

const weekdayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const selectedHumanDate = computed(() => {
  const d = selectedDate.value
  const wd = ['일', '월', '화', '수', '목', '금', '토'][d.day()]
  return `${d.month() + 1}월 ${d.date()}일 · ${wd}요일`
})

function handleShare(anv: Anniversary) {
  // 오늘이거나 이미 지난 일이면 D-day 표기는 생략.
  const d = daysUntil(anv)
  shareStore.open(anv, d > 0 ? d : undefined)
}
</script>

<template>
  <div class="space-y-12">
    <!-- Section header -->
    <header>
      <div class="flex items-center gap-3">
        <span class="h-px w-10 bg-ink-700" />
        <span class="eyebrow">Calendar</span>
      </div>
      <div class="mt-5 flex items-end justify-between gap-4 border-b hairline pb-5">
        <h1 class="font-display text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink-900 sm:text-[3rem]">
          {{ monthLabel }}
        </h1>
        <div class="flex items-center gap-1.5">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center border border-rule font-display text-base text-ink-500 transition hover:border-ink-800 hover:text-ink-900"
            aria-label="이전 달"
            @click="goPrevMonth"
          >
            ‹
          </button>
          <button
            type="button"
            class="border border-ink-800 bg-ink-800 px-3.5 py-2 text-[0.68rem] font-medium uppercase tracking-[0.2em] text-paper-50 transition hover:bg-ink-900"
            @click="goToday"
          >
            Today
          </button>
          <button
            type="button"
            class="grid h-9 w-9 place-items-center border border-rule font-display text-base text-ink-500 transition hover:border-ink-800 hover:text-ink-900"
            aria-label="다음 달"
            @click="goNextMonth"
          >
            ›
          </button>
        </div>
      </div>
    </header>

    <p v-if="isLoading" class="eyebrow">Loading…</p>
    <p v-else-if="error" class="text-sm text-accent-600">{{ error }}</p>

    <template v-else>
      <!-- Calendar grid -->
      <div class="overflow-hidden border hairline bg-paper-50">
        <div class="grid grid-cols-7 border-b hairline bg-paper-100/70 text-center">
          <div
            v-for="(label, i) in weekdayLabels"
            :key="label"
            class="py-3 text-[0.62rem] font-medium uppercase tracking-[0.22em]"
            :class="{
              'text-accent-600': i === 0,
              'text-ink-400': i !== 0 && i !== 6,
              'text-ink-700': i === 6,
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
            class="group relative flex min-h-[88px] flex-col items-stretch gap-1.5 border-b border-r border-rule p-2 text-left transition-colors hover:bg-paper-200/40 sm:min-h-[108px]"
            :class="{
              'bg-paper-100/40 text-ink-300': !cell.isCurrentMonth,
              'bg-ink-900 hover:bg-ink-900 text-paper-50':
                selectedDate.isSame(cell.date, 'day'),
            }"
            @click="selectDate(cell.date)"
          >
            <span
              class="font-display text-sm leading-none"
              :class="{
                'text-paper-50': selectedDate.isSame(cell.date, 'day'),
                'text-accent-600 font-medium': cell.isToday && !selectedDate.isSame(cell.date, 'day'),
                'text-ink-700': cell.isCurrentMonth && !cell.isToday && !selectedDate.isSame(cell.date, 'day'),
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
                class="truncate text-[10.5px] leading-tight"
                :class="{
                  'text-paper-200': selectedDate.isSame(cell.date, 'day'),
                  'text-ink-600': cell.isCurrentMonth && !selectedDate.isSame(cell.date, 'day'),
                  'text-ink-300': !cell.isCurrentMonth,
                }"
                :title="anv.name"
              >
                <span class="mr-1">·</span>{{ anv.name }}
              </span>
              <span
                v-if="cell.anniversaries.length > 2"
                class="text-[10px]"
                :class="selectedDate.isSame(cell.date, 'day') ? 'text-paper-300' : 'text-ink-400'"
              >
                +{{ cell.anniversaries.length - 2 }} more
              </span>
            </div>
          </button>
        </div>
      </div>

      <!-- Selected day section -->
      <section>
        <div class="mb-6 flex items-center gap-5">
          <span class="h-px flex-1 bg-rule" />
          <div class="flex flex-col items-center">
            <span class="eyebrow">Selected</span>
            <span class="mt-1 font-display text-lg tracking-tight text-ink-800">
              {{ selectedHumanDate }}
              <span class="ml-2 font-sans text-xs tracking-normal text-ink-400">
                ({{ selectedAnniversaries.length }}건)
              </span>
            </span>
          </div>
          <span class="h-px flex-1 bg-rule" />
        </div>

        <div v-if="selectedAnniversaries.length" class="space-y-10">
          <AnniversaryCard
            v-for="a in selectedAnniversaries"
            :key="a.id"
            :anniversary="a"
            @share="handleShare"
          />
        </div>
        <div
          v-else
          class="border-y hairline bg-paper-50 px-6 py-12 text-center"
        >
          <p class="eyebrow">No entries</p>
          <p class="mt-2 font-display text-base italic text-ink-500">
            이 날엔 등록된 기념일이 없어요.
          </p>
        </div>
      </section>
    </template>
  </div>
</template>
