<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCalendarExport } from '../composables/useCalendarExport'

const PREVIEW_INITIAL_COUNT = 12

const {
  isLoading,
  error,
  categoryOptions,
  groupOptions,
  isSelected,
  toggle,
  isGroupSelected,
  toggleGroup,
  selectAll,
  selectNone,
  hasSelection,
  selectedCount,
  previewItems,
  downloadIcs,
  feedWebcalUrl,
  googleAddUrl,
  copied,
  copyFeedUrl,
} = useCalendarExport()

const isPreviewExpanded = ref(false)
const visiblePreviewItems = computed(() =>
  isPreviewExpanded.value
    ? previewItems.value
    : previewItems.value.slice(0, PREVIEW_INITIAL_COUNT),
)
const hiddenPreviewCount = computed(() =>
  Math.max(0, previewItems.value.length - PREVIEW_INITIAL_COUNT),
)

// 다른 카테고리를 고르면 다시 간략한 12개 미리보기부터 보여준다.
watch(previewItems, () => {
  isPreviewExpanded.value = false
})
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

        <!-- 그룹 — 카테고리와 교차하는 묶음. OR 로 합쳐진다. -->
        <div v-if="groupOptions.length" class="mt-6 border-t hairline pt-5">
          <p class="mb-3 text-[0.7rem] uppercase tracking-[0.18em] text-ink-400">
            묶음으로 고르기
          </p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="opt in groupOptions"
              :key="opt.id"
              type="button"
              class="inline-flex items-center gap-2 border px-3.5 py-2 text-sm transition"
              :class="
                isGroupSelected(opt.id)
                  ? 'border-ink-900 bg-ink-900 text-paper-50'
                  : 'border-rule bg-paper-50 text-ink-500 hover:border-ink-800 hover:text-ink-900'
              "
              :aria-pressed="isGroupSelected(opt.id)"
              @click="toggleGroup(opt.id)"
            >
              <span v-if="opt.emoji" aria-hidden="true">{{ opt.emoji }}</span>
              <span class="font-display tracking-tight">{{ opt.label }}</span>
              <span
                class="font-sans text-[0.68rem] tabular-nums"
                :class="isGroupSelected(opt.id) ? 'text-paper-300' : 'text-ink-400'"
              >
                {{ opt.count }}
              </span>
            </button>
          </div>
          <p class="mt-2.5 text-[0.78rem] leading-relaxed text-ink-400">
            카테고리와 별개로 더해집니다. 소재가 달라도 법령이 정한 기념일이면 함께 담깁니다.
          </p>
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
              :value="feedWebcalUrl ?? ''"
              readonly
              :placeholder="hasSelection ? '' : '카테고리를 선택하세요'"
              class="min-w-0 flex-1 border hairline bg-paper-100 px-3 py-2 font-sans text-xs text-ink-600 focus:border-ink-800 focus:outline-none disabled:opacity-40"
              aria-label="구독 URL"
              :disabled="!hasSelection"
              @focus="(e) => (e.target as HTMLInputElement).select()"
            />
            <button
              type="button"
              class="shrink-0 border border-ink-800 px-3.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink-800 transition hover:bg-ink-900 hover:text-paper-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ink-800"
              :disabled="!hasSelection"
              @click="copyFeedUrl"
            >
              {{ copied ? '복사됨' : 'Copy' }}
            </button>
          </div>

          <!-- 0개 선택이면 링크를 아예 렌더하지 않는다. 링크가 살아 있으면
               "아무것도 선택 안 함"이 전체 구독으로 둔갑한다. -->
          <div
            v-if="hasSelection"
            class="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.7rem] uppercase tracking-[0.18em]"
          >
            <a
              :href="googleAddUrl!"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-ink-500 transition hover:text-accent-600"
            >
              Google 캘린더 <span aria-hidden="true">→</span>
            </a>
            <a
              :href="feedWebcalUrl!"
              class="inline-flex items-center gap-1 text-ink-500 transition hover:text-accent-600"
            >
              Apple · 기타 <span aria-hidden="true">→</span>
            </a>
          </div>
          <p v-else class="mt-3 text-[0.7rem] text-ink-400">
            카테고리를 하나 이상 선택하면 구독 링크가 만들어져요.
          </p>

          <p class="mt-4 text-[0.7rem] leading-relaxed text-ink-400">
            ※ 구독 피드는 배포된 사이트에서 동작합니다.
          </p>
        </article>
      </section>

      <!-- 선택된 기념일 미리보기 -->
      <section class="border hairline bg-paper-50" aria-labelledby="calendar-preview-title">
        <div class="flex items-end justify-between gap-4 border-b hairline px-5 py-4 sm:px-7">
          <div>
            <span class="eyebrow">Calendar Preview</span>
            <h2
              id="calendar-preview-title"
              class="mt-1 font-display text-xl tracking-tight text-ink-900"
            >
              담기는 기념일
            </h2>
          </div>
          <span class="shrink-0 font-sans text-xs tabular-nums text-ink-400">
            {{ selectedCount }}건
          </span>
        </div>

        <div v-if="visiblePreviewItems.length" class="px-5 py-2 sm:px-7">
          <ul
            id="calendar-preview-list"
            class="grid divide-y divide-rule sm:grid-cols-2 sm:gap-x-8 sm:[&>li:nth-child(2)]:border-t-0"
          >
            <li
              v-for="item in visiblePreviewItems"
              :key="item.id"
              class="flex min-w-0 items-baseline gap-4 py-3"
            >
              <time class="w-16 shrink-0 font-sans text-xs tabular-nums text-ink-400">
                {{ item.dateLabel }}
              </time>
              <span class="min-w-0 font-display text-sm leading-snug text-ink-800">
                {{ item.name }}
              </span>
            </li>
          </ul>
        </div>
        <p v-else class="px-5 py-8 text-center text-sm text-ink-400 sm:px-7">
          카테고리를 하나 이상 선택하면 포함되는 기념일을 확인할 수 있어요.
        </p>

        <div v-if="hiddenPreviewCount" class="border-t hairline p-4 text-center">
          <button
            type="button"
            class="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-500 transition hover:text-ink-900"
            :aria-expanded="isPreviewExpanded"
            aria-controls="calendar-preview-list"
            @click="isPreviewExpanded = !isPreviewExpanded"
          >
            {{ isPreviewExpanded ? '접기' : `더보기 · ${hiddenPreviewCount}건` }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>
