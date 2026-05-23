<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { Anniversary } from '@/types/anniversary'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { primaryColorForTags } from '@/utils/tagPalette'
import { useAnniversariesStore } from '@/stores/anniversaries'

const props = defineProps<{
  anniversary: Anniversary
  /** 다가오는 기념일일 때 D-N 값. 오늘이면 undefined. */
  dDay?: number
}>()

const store = useAnniversariesStore()
const category = computed(() =>
  store.categories.find((c) => c.id === props.anniversary.category),
)

const accentDot = computed(
  () => primaryColorForTags(props.anniversary.tags).dot,
)

const dateKo = computed(() => formatKoreanMonthDay(props.anniversary))

const dateEn = computed(() => {
  // 영문 약식 — "MAY 27"
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ]
  // formatKoreanMonthDay 와 동일한 occurrence 사용을 위해 같은 util 활용
  const text = dateKo.value // "M월 D일"
  const m = text.match(/(\d+)월\s*(\d+)일/)
  if (!m) return ''
  return `${months[Number(m[1]) - 1]} ${m[2]}`
})

const todayStamp = computed(() => dayjs().format('YYYY.MM.DD'))

// 다가오는 기념일일 때 "당신의 캘린더에 D−3" 같은 보조 카피
const dDayCaption = computed(() => {
  if (typeof props.dDay !== 'number') return null
  if (props.dDay === 0) return '오늘'
  return `오늘로부터 ${props.dDay}일 뒤`
})
</script>

<template>
  <!--
    1:1 캡처 카드 — 540×540 px.
    pixelRatio:2 로 저장하면 최종 1080×1080.
  -->
  <div
    class="share-card relative overflow-hidden bg-paper-100 text-ink-700"
    style="width: 540px; height: 540px;"
  >
    <!-- 배경 추상 도형 ─────────────────────────── -->
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 540 540"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="sc-grad-1" cx="85%" cy="105%" r="75%">
          <stop offset="0%" stop-color="#8b2c2c" stop-opacity="0.13" />
          <stop offset="60%" stop-color="#8b2c2c" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#8b2c2c" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="sc-grad-2" cx="0%" cy="0%" r="80%">
          <stop offset="0%" stop-color="#2f2c28" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#2f2c28" stop-opacity="0" />
        </radialGradient>
      </defs>

      <!-- 좌상단 부드러운 빛 -->
      <rect x="0" y="0" width="540" height="540" fill="url(#sc-grad-2)" />
      <!-- 우하단 액센트 글로우 -->
      <circle cx="540" cy="540" r="340" fill="url(#sc-grad-1)" />

      <!-- 좌상단 동심원 (가는 선) -->
      <g stroke="#2f2c28" fill="none" stroke-opacity="0.12">
        <circle cx="36" cy="40" r="120" stroke-width="0.6" />
        <circle cx="36" cy="40" r="190" stroke-width="0.5" stroke-opacity="0.08" />
        <circle cx="36" cy="40" r="260" stroke-width="0.5" stroke-opacity="0.05" />
      </g>

      <!-- 우상단 작은 도트 클러스터 -->
      <g fill="#8b2c2c" fill-opacity="0.55">
        <circle cx="486" cy="84" r="3" />
        <circle cx="500" cy="98" r="1.4" fill-opacity="0.35" />
        <circle cx="472" cy="100" r="1.4" fill-opacity="0.35" />
      </g>

      <!-- 중앙을 가로지르는 가는 수평선 -->
      <line
        x1="60" y1="312" x2="480" y2="312"
        stroke="#2f2c28" stroke-opacity="0.05" stroke-width="0.5"
      />

      <!-- 우측 길게 늘어진 가는 곡선 -->
      <path
        d="M 540 180 Q 380 240 400 380 Q 420 500 540 480"
        fill="none" stroke="#2f2c28" stroke-opacity="0.07" stroke-width="0.6"
      />
    </svg>

    <!-- 콘텐츠 ───────────────────────────────── -->
    <div class="relative z-10 flex h-full flex-col px-12 py-11">
      <!-- 상단: 발행 마크 / D-Day -->
      <header class="flex items-start justify-between gap-4">
        <div>
          <p
            class="font-sans text-[10px] font-medium uppercase tracking-[0.28em] text-ink-500"
          >
            Anniversarium
          </p>
          <p
            class="mt-1 font-sans text-[9.5px] uppercase tracking-[0.24em] text-ink-400"
          >
            A Daily Curation
          </p>
        </div>

        <div v-if="typeof dDay === 'number'" class="text-right">
          <p
            class="font-sans text-[9.5px] font-medium uppercase tracking-[0.28em] text-accent-600"
          >
            D −
          </p>
          <p
            class="-mt-0.5 font-display text-[2.6rem] font-medium leading-none tabular-nums text-accent-600"
          >
            {{ dDay }}
          </p>
          <p
            v-if="dDayCaption"
            class="mt-1 font-sans text-[9px] uppercase tracking-[0.2em] text-ink-400"
          >
            {{ dDayCaption }}
          </p>
        </div>
      </header>

      <!-- 중앙: 카테고리 + 제목 -->
      <div class="mt-auto">
        <div
          class="flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.26em] text-ink-500"
        >
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="accentDot"
            aria-hidden="true"
          />
          <span v-if="category">{{ category.label }}</span>
        </div>

        <h1
          class="mt-3 font-display font-medium leading-[1.04] tracking-[-0.015em] text-ink-900"
          :class="anniversary.name.length > 10 ? 'text-[2.7rem]' : 'text-[3.5rem]'"
        >
          {{ anniversary.name }}
        </h1>

        <!-- 큰 날짜 라인 -->
        <p class="mt-5 flex items-baseline gap-3 text-ink-600">
          <span
            class="font-display text-[1.6rem] font-medium leading-none tracking-tight"
          >
            {{ dateKo }}
          </span>
          <span class="h-px w-6 self-center bg-ink-300" aria-hidden="true" />
          <span
            class="font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ink-500"
          >
            {{ dateEn }}
          </span>
        </p>
      </div>

      <!-- 하단: 태그 + 워치마크 -->
      <footer class="mt-8">
        <ul
          v-if="anniversary.tags.length"
          class="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-sans text-[10px] uppercase tracking-[0.22em] text-ink-500"
        >
          <li
            v-for="tag in anniversary.tags.slice(0, 5)"
            :key="tag"
            class="flex items-center gap-1.5"
          >
            <span class="h-px w-3 bg-ink-300" aria-hidden="true" />
            <span>{{ tag }}</span>
          </li>
        </ul>

        <div
          class="mt-5 flex items-end justify-between border-t pt-3.5"
          style="border-color: var(--color-rule);"
        >
          <span class="font-display text-[0.95rem] tracking-tight text-ink-700">
            기념일 만물상
          </span>
          <span
            class="font-sans text-[9.5px] uppercase tracking-[0.28em] text-ink-400 tabular-nums"
          >
            Captured · {{ todayStamp }}
          </span>
        </div>
      </footer>
    </div>
  </div>
</template>
