<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { Anniversary } from '@/types/anniversary'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { SITE_URL } from '@/seo/meta'
import CategorySymbol from '@/features/feed/components/CategorySymbol.vue'
import type { BirthdayContext } from '@/features/birthday/birthday'

const props = defineProps<{
  anniversary: Anniversary
  /** 다가오는 기념일일 때 D-N 값. 오늘이면 undefined. */
  dDay?: number
  birthday?: BirthdayContext
}>()

const store = useAnniversariesStore()
const category = computed(() =>
  store.categories.find((c) => c.id === props.anniversary.category),
)

// 피드 카드와 같은 규칙 — 뒤에 붙은 영문 원어명은 떼고 보여준다.
const displayName = computed(() =>
  props.anniversary.name.replace(/\s+\([A-Za-z][^)]*\)$/, ''),
)

/** 제목 길이에 맞춘 본문 크기. 540px 안에서 두 줄을 넘기지 않게 한다. */
const titleSize = computed(() => {
  const length = displayName.value.length
  if (length <= 8) return '52px'
  if (length <= 13) return '44px'
  if (length <= 20) return '36px'
  return '30px'
})

const dateKo = computed(() => {
  if (props.birthday) {
    const [m, d] = props.birthday.date.split('-').map(Number)
    return `${m}월 ${d}일`
  }
  return formatKoreanMonthDay(props.anniversary)
})

const dateEn = computed(() => {
  // 영문 약식 — "MAY 27"
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ]
  // formatKoreanMonthDay 와 동일한 occurrence 사용을 위해 같은 util 활용
  const text = dateKo.value // "M월 D일" — 날짜를 계산할 수 없으면 null
  const m = text?.match(/(\d+)월\s*(\d+)일/)
  if (!m) return ''
  return `${months[Number(m[1]) - 1]} ${m[2]}`
})

/** 다가오는 기념일 배지. 오늘이면 "오늘". */
const dDayBadge = computed(() => {
  if (typeof props.dDay !== 'number') return null
  return props.dDay === 0 ? '오늘' : `D−${props.dDay}`
})

const todayStamp = computed(() => dayjs().format('YYYY.MM.DD'))
// 이미지 안에서는 www 를 빼 브랜드 도메인을 짧고 또렷하게 보여 준다.
// 실제 공유 URL은 ShareModal 이 SITE_URL(www.annical.me)을 그대로 사용한다.
const siteLabel = SITE_URL.replace(/^https?:\/\/(?:www\.)?/, '')

// 우표 천공. 뒤에 깔린 종이색(paper-200)으로 구멍을 뚫는다.
const holesY = Array.from({ length: 11 }, (_, i) => 18 + i * 12)
const holesX = Array.from({ length: 13 }, (_, i) => 18 + i * 14)
</script>

<template>
  <!--
    1:1 캡처 카드 — 540×540 px. pixelRatio:2 로 저장하면 최종 1080×1080.
    색은 html-to-image 가 복제 트리에서 CSS 변수를 못 푸는 경우가 있어,
    SVG 안에서는 토큰과 같은 값을 리터럴로 적는다.
    바탕은 사이트의 히어로 패널과 같은 paper-200 — 우표(paper-50)가 떠 보인다.
  -->
  <div
    class="share-card relative overflow-hidden bg-paper-200 text-ink-700"
    style="width: 540px; height: 540px;"
  >
    <!-- 배경: 사이트 곳곳에 쓰는 링 장식 ─────────── -->
    <svg
      class="absolute inset-0 h-full w-full"
      viewBox="0 0 540 540"
      aria-hidden="true"
    >
      <circle cx="470" cy="470" r="150" fill="none" stroke="#8b2c2c" stroke-opacity="0.16" />
      <circle cx="470" cy="470" r="206" fill="none" stroke="#8b2c2c" stroke-opacity="0.09" />
      <circle cx="470" cy="470" r="272" fill="none" stroke="#2f2c28" stroke-opacity="0.05" />
      <circle cx="64" cy="84" r="118" fill="none" stroke="#2f2c28" stroke-opacity="0.06" />
    </svg>

    <!-- 콘텐츠 ───────────────────────────────── -->
    <div class="relative z-10 flex h-full flex-col px-12 py-11">
      <header class="flex items-start justify-between gap-5">
        <div>
          <p class="flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-ink-500">
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
            ANNICAL
          </p>
          <p class="mt-2.5 text-[15px] font-semibold tracking-[-0.04em] text-ink-700">
            {{ birthday ? '내 생일의 발견' : '기념일 도감' }}
          </p>
        </div>

        <!-- 오늘의 발견 카드와 같은 우표 모티프 -->
        <svg width="200" height="148" viewBox="0 0 210 155" fill="none" aria-hidden="true">
          <g transform="rotate(-4 105 77)">
            <rect x="6" y="6" width="198" height="143" fill="#fdfcf9" />
            <g fill="#f3ede0">
              <template v-for="y in holesY" :key="`y${y}`">
                <circle cx="6" :cy="y" r="3.4" />
                <circle cx="204" :cy="y" r="3.4" />
              </template>
              <template v-for="x in holesX" :key="`x${x}`">
                <circle :cx="x" cy="6" r="3.4" />
                <circle :cx="x" cy="149" r="3.4" />
              </template>
            </g>
            <rect x="18" y="20" width="174" height="115" stroke="#6f2222" stroke-opacity="0.35" />
            <text
              x="105" y="38" text-anchor="middle" fill="#6f2222"
              font-size="8.5" letter-spacing="2.4"
            >ANNICAL</text>
            <CategorySymbol
              :category="anniversary.category"
              x="76" y="48" width="58" height="58"
              style="color: #6f2222"
            />
            <path d="M32 116h146" stroke="#6f2222" stroke-opacity="0.25" />
            <text
              x="105" y="131" text-anchor="middle" fill="#6f2222"
              font-size="11" letter-spacing="1.6"
            >{{ dateEn || dateKo }}</text>
          </g>
        </svg>
      </header>

      <!-- 중앙: 카테고리 + 제목 + 날짜 -->
      <div class="mt-auto">
        <p v-if="birthday" class="mb-3 text-[16px] font-semibold text-accent-600">내 생일과 같은 날,</p>
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-2 text-[11px] tracking-[0.12em] text-ink-500">
            <span class="inline-block h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
            {{ category?.label ?? '기념일' }}
          </span>
          <span
            v-if="dDayBadge"
            class="rounded-full bg-accent-600 px-3 py-1 text-[11px] font-semibold tracking-[-0.01em] text-paper-50"
          >{{ dDayBadge }}</span>
        </div>

        <h1
          class="mt-4 font-bold leading-[1.24] tracking-[-0.055em] text-ink-700"
          style="word-break: keep-all;"
          :style="{ fontSize: titleSize }"
        >
          {{ displayName }}
        </h1>

        <p class="mt-5 flex items-center gap-4">
          <span class="text-[22px] font-semibold leading-none tracking-[-0.045em] text-ink-600">
            {{ dateKo }}
          </span>
          <span class="h-px w-7 bg-ink-300" aria-hidden="true" />
          <span class="text-[11px] font-medium tracking-[0.24em] text-ink-500">
            {{ dateEn }}
          </span>
        </p>
      </div>

      <footer
        class="mt-9 flex items-end justify-between border-t pt-4"
        style="border-color: #e3ddd1;"
      >
        <span class="text-[12px] font-medium tracking-[-0.02em] text-ink-500">
          {{ siteLabel }}{{ birthday ? '/birthday' : '' }}
        </span>
        <span class="text-[9.5px] tracking-[0.22em] text-ink-400 tabular-nums">
          {{ birthday ? `네 생일은 무슨 날? · ${birthday.year}년 기준` : `CAPTURED · ${todayStamp}` }}
        </span>
      </footer>
    </div>
  </div>
</template>
