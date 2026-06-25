<script setup lang="ts">
import { useCalendarExport } from '../composables/useCalendarExport'

const {
  isLoading,
  error,
  categoryOptions,
  isSelected,
  toggle,
  selectAll,
  selectNone,
  selectedCount,
  downloadIcs,
  feedWebcalUrl,
  googleAddUrl,
  copied,
  copyFeedUrl,
} = useCalendarExport()
</script>

<template>
  <div class="space-y-12">
    <header>
      <div class="flex items-center gap-3">
        <span class="h-px w-10 bg-ink-700" />
        <span class="eyebrow">Subscribe</span>
      </div>
      <h1 class="mt-5 font-display text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink-900 sm:text-[3rem]">
        캘린더 연동
      </h1>
      <div class="mt-5 border-b hairline pb-4">
        <p class="font-display text-base italic text-ink-500">
          관심 있는 기념일을 당신의 캘린더로 가져오세요.
        </p>
      </div>
    </header>

    <p v-if="isLoading" class="eyebrow">Loading…</p>
    <p v-else-if="error" class="text-sm text-accent-600">{{ error }}</p>

    <template v-else>
      <!-- 카테고리 선택 (다운로드·구독 공통) -->
      <section>
        <div class="mb-4 flex items-end justify-between gap-4">
          <div>
            <span class="eyebrow">Categories</span>
            <p class="mt-1 font-display text-lg tracking-tight text-ink-800">
              어떤 기념일을 담을까요?
            </p>
          </div>
          <div class="flex shrink-0 items-center gap-3 text-[0.7rem] uppercase tracking-[0.18em]">
            <button
              type="button"
              class="text-ink-400 transition hover:text-ink-900"
              @click="selectAll"
            >
              전체
            </button>
            <span class="h-3 w-px bg-rule-strong" aria-hidden="true" />
            <button
              type="button"
              class="text-ink-400 transition hover:text-ink-900"
              @click="selectNone"
            >
              해제
            </button>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="opt in categoryOptions"
            :key="opt.id"
            type="button"
            class="inline-flex items-center gap-2 border px-3.5 py-2 text-sm transition"
            :class="
              isSelected(opt.id)
                ? 'border-ink-900 bg-ink-900 text-paper-50'
                : 'border-rule bg-paper-50 text-ink-500 hover:border-ink-800 hover:text-ink-900'
            "
            :aria-pressed="isSelected(opt.id)"
            @click="toggle(opt.id)"
          >
            <span v-if="opt.emoji" aria-hidden="true">{{ opt.emoji }}</span>
            <span class="font-display tracking-tight">{{ opt.label }}</span>
            <span
              class="font-sans text-[0.68rem] tabular-nums"
              :class="isSelected(opt.id) ? 'text-paper-300' : 'text-ink-400'"
            >
              {{ opt.count }}
            </span>
          </button>
        </div>
      </section>

      <section class="grid gap-8 sm:grid-cols-2">
        <!-- .ics 다운로드 -->
        <article class="flex flex-col border hairline bg-paper-50 p-7">
          <span class="eyebrow">.ics Download</span>
          <h2 class="mt-3 font-display text-2xl tracking-tight text-ink-900">
            한 번에 내려받기
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-ink-500">
            선택한 카테고리의 기념일을 표준 .ics 파일로 받아 Google Calendar,
            Apple Calendar 등 어디서든 가져올 수 있어요.
          </p>
          <div class="mt-6 flex-1" />
          <button
            type="button"
            class="w-full border border-ink-900 bg-ink-900 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-paper-50 transition hover:bg-ink-800 disabled:opacity-40"
            :disabled="!selectedCount"
            @click="downloadIcs"
          >
            <span v-if="selectedCount">Download · {{ selectedCount }}건 저장</span>
            <span v-else>카테고리를 선택하세요</span>
          </button>
        </article>

        <!-- 구독 링크 (살아있는 URL) -->
        <article class="flex flex-col border hairline bg-paper-50 p-7">
          <span class="eyebrow">Subscription Link</span>
          <h2 class="mt-3 font-display text-2xl tracking-tight text-ink-900">
            구독 링크 만들기
          </h2>
          <p class="mt-3 text-sm leading-relaxed text-ink-500">
            아래 URL로 구독하면 새 기념일이 추가될 때마다 캘린더가 자동으로
            업데이트됩니다.
          </p>

          <div class="mt-5 flex items-stretch gap-2">
            <input
              :value="feedWebcalUrl"
              readonly
              class="min-w-0 flex-1 border hairline bg-paper-100 px-3 py-2 font-sans text-xs text-ink-600 focus:border-ink-800 focus:outline-none"
              aria-label="구독 URL"
              @focus="(e) => (e.target as HTMLInputElement).select()"
            />
            <button
              type="button"
              class="shrink-0 border border-ink-800 px-3.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-800 transition hover:bg-ink-900 hover:text-paper-50"
              @click="copyFeedUrl"
            >
              {{ copied ? '복사됨' : 'Copy' }}
            </button>
          </div>

          <div class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.7rem] uppercase tracking-[0.18em]">
            <a
              :href="googleAddUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center gap-1 text-ink-500 transition hover:text-accent-600"
            >
              Google 캘린더 <span aria-hidden="true">→</span>
            </a>
            <a
              :href="feedWebcalUrl"
              class="inline-flex items-center gap-1 text-ink-500 transition hover:text-accent-600"
            >
              Apple · 기타 <span aria-hidden="true">→</span>
            </a>
          </div>

          <p class="mt-4 text-[0.7rem] leading-relaxed text-ink-400">
            ※ 구독 피드는 배포된 사이트에서 동작합니다.
          </p>
        </article>
      </section>
    </template>
  </div>
</template>
