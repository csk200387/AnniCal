<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{ today: Date }>()
const date = computed(() => dayjs(props.today))
const month = computed(() => ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'][date.value.month()])
const weekday = computed(() => ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'][date.value.day()])
</script>

<template>
  <div class="calendar-artwork" aria-hidden="true">
    <div class="art-orbit" />
    <div class="art-spark art-spark--small">✳</div>
    <div class="art-back-sheet art-back-sheet--ink" />
    <div class="art-back-sheet art-back-sheet--cream" />
    <div class="art-calendar">
      <i class="calendar-ring calendar-ring--left" />
      <i class="calendar-ring calendar-ring--right" />
      <div class="art-calendar-heading"><span>{{ month }}</span><span>{{ date.year() }}</span></div>
      <div class="art-calendar-date">{{ String(date.date()).padStart(2, '0') }}</div>
      <div class="art-calendar-bottom"><span>{{ weekday }}</span><span class="art-calendar-smile">☺</span></div>
    </div>
    <div class="art-seal">
      <svg viewBox="0 0 160 160" fill="none">
        <circle cx="80" cy="80" r="72" fill="var(--color-paper-300)" />
        <circle cx="80" cy="80" r="65" stroke="var(--color-accent-500)" stroke-width="1.2" />
        <circle cx="80" cy="80" r="48" stroke="var(--color-accent-500)" stroke-width="1.2" />
        <g stroke="var(--color-accent-500)" stroke-width="1.6">
          <path v-for="angle in Array.from({ length: 24 }, (_, i) => i * 15)" :key="angle" d="M80 21v7" :transform="`rotate(${angle} 80 80)`" />
        </g>
        <path d="M80 42q5 33 38 38-33 5-38 38-5-33-38-38 33-5 38-38Z" fill="var(--color-accent-600)" />
        <circle cx="80" cy="80" r="5" fill="var(--color-paper-300)" />
      </svg>
    </div>
    <div class="art-sticker"><span>A LITTLE REASON</span><strong>to celebrate.</strong><span>EVERY SINGLE DAY ↗</span></div>
    <div class="art-caption"><span class="live-dot" /> 오늘도, 특별한 하루</div>
  </div>
</template>
