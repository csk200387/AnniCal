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
  isPreviewExpanded.value ? previewItems.value : previewItems.value.slice(0, PREVIEW_INITIAL_COUNT),
)
const hiddenPreviewCount = computed(() =>
  Math.max(0, previewItems.value.length - PREVIEW_INITIAL_COUNT),
)
const selectionNote = computed(() => {
  const labels = categoryOptions.value.filter((option) => isSelected(option.id)).map((option) => option.label)
  if (!labels.length) {
    const groups = groupOptions.value.filter((option) => isGroupSelected(option.id)).map((option) => option.label)
    return groups.length ? `${groups.join(' · ')}만 담습니다.` : '카테고리를 선택해 주세요.'
  }
  return labels.length <= 3
    ? labels.join(' · ')
    : `${labels.slice(0, 3).join(' · ')} 외 ${labels.length - 3}개 주제`
})

watch(previewItems, () => {
  isPreviewExpanded.value = false
})
</script>

<template>
  <div>
    <header class="grid items-end gap-10 border-b border-ink-900 pb-10 md:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:gap-20">
      <div>
        <div class="flex items-center gap-3"><span class="h-px w-10 bg-accent-600" /><span class="eyebrow">Calendar Collection</span></div>
        <h1 class="mt-6 font-display text-[3.25rem] font-normal leading-[0.98] tracking-[-0.055em] text-ink-900 sm:text-[4.6rem]">
          좋아하는 날들을<br /><em class="font-normal text-accent-600">한 권의 달력처럼.</em>
        </h1>
      </div>
      <div class="border-t hairline pt-5 md:border-l md:border-t-0 md:pl-5 md:pt-0">
        <p class="font-display text-lg leading-[1.7] text-ink-600">
          관심 있는 주제를 골라 나만의 기념일 캘린더를 만드세요. 한 번 내려받거나, 살아 있는 링크로 계속 구독할 수 있습니다.
        </p>
        <div class="mt-5 flex gap-8 border-t hairline pt-4">
          <div><span class="eyebrow">Selected</span><strong class="mt-1 block font-display text-2xl font-normal">{{ selectedCount }}</strong></div>
          <div><span class="eyebrow">Format</span><strong class="mt-1 block font-display text-2xl font-normal">.ics</strong></div>
        </div>
      </div>
    </header>

    <p v-if="isLoading" class="mt-12 eyebrow">Loading…</p>
    <p v-else-if="error" class="mt-12 text-sm text-accent-600">{{ error }}</p>

    <template v-else>
      <section class="mt-14">
        <div class="mb-5 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p class="eyebrow"><span class="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border hairline font-display text-xs text-accent-600">01</span>Curate</p>
            <h2 class="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-ink-900 sm:text-4xl">어떤 기념일을 담을까요?</h2>
          </div>
          <div class="flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.16em]">
            <button type="button" class="text-ink-400 transition hover:text-ink-900" @click="selectAll">전체 선택</button>
            <span class="h-3 w-px bg-rule-strong" aria-hidden="true" />
            <button type="button" class="text-ink-400 transition hover:text-ink-900" @click="selectNone">모두 해제</button>
          </div>
        </div>

        <div class="grid border-l border-t hairline sm:grid-cols-2 lg:grid-cols-4">
          <button
            v-for="opt in categoryOptions"
            :key="opt.id"
            type="button"
            class="relative grid min-h-[70px] grid-cols-[2.15rem_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-r p-3.5 text-left transition"
            :class="isSelected(opt.id) ? 'border-rule bg-ink-900 text-paper-50 after:absolute after:inset-x-0 after:top-0 after:h-[3px] after:bg-accent-500' : 'border-rule bg-paper-50/60 text-ink-600 hover:bg-paper-50 hover:text-ink-900'"
            :aria-pressed="isSelected(opt.id)"
            @click="toggle(opt.id)"
          >
            <span class="grid h-[2.15rem] w-[2.15rem] place-items-center rounded-full border border-current/20 text-base" aria-hidden="true">{{ opt.emoji }}</span>
            <span class="truncate font-display text-sm">{{ opt.label }}</span>
            <span class="text-[0.62rem] tabular-nums opacity-60">{{ opt.count }}</span>
          </button>
        </div>

        <div v-if="groupOptions.length" class="mt-4 space-y-3">
          <div
            v-for="opt in groupOptions"
            :key="opt.id"
            class="flex items-center justify-between gap-5 border border-accent-500/20 bg-accent-500/[0.06] px-4 py-4"
          >
            <div class="flex min-w-0 items-center gap-3">
              <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-accent-500/20" aria-hidden="true">{{ opt.emoji }}</span>
              <div>
                <strong class="font-display text-sm font-normal text-ink-800">{{ opt.label }}도 함께 담기</strong>
                <p class="mt-0.5 text-[0.68rem] leading-relaxed text-ink-400">선택한 주제와 별개로, 이 묶음에 속한 {{ opt.count }}개 기념일을 더합니다.</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              class="relative h-6 w-11 shrink-0 rounded-full border transition"
              :class="isGroupSelected(opt.id) ? 'border-accent-600 bg-accent-600' : 'border-rule-strong bg-paper-50'"
              :aria-label="`${opt.label}도 함께 담기`"
              :aria-checked="isGroupSelected(opt.id)"
              @click="toggleGroup(opt.id)"
            >
              <span class="absolute left-[3px] top-[3px] h-4 w-4 rounded-full bg-current transition-transform" :class="isGroupSelected(opt.id) ? 'translate-x-5 text-paper-50' : 'text-ink-400'" />
            </button>
          </div>
        </div>

        <div class="mt-5 flex flex-col items-start justify-between gap-3 border-y border-ink-900 py-4 sm:flex-row sm:items-center">
          <div class="flex items-baseline gap-3"><strong class="font-display text-3xl font-normal text-ink-900">{{ selectedCount }}건</strong><span class="text-xs text-ink-400">캘린더에 담길 예정</span></div>
          <p class="font-display text-sm italic text-ink-400 sm:text-right">{{ selectionNote }}</p>
        </div>
      </section>

      <section class="mt-14">
        <div class="mb-5">
          <p class="eyebrow"><span class="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border hairline font-display text-xs text-accent-600">02</span>Export</p>
          <h2 class="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-ink-900 sm:text-4xl">내 캘린더로 가져오기</h2>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <article class="relative flex min-h-[330px] flex-col overflow-hidden border border-ink-900 bg-ink-900 p-7 text-paper-50">
            <div class="absolute -bottom-24 -right-16 h-64 w-64 rounded-full border border-paper-50/10 shadow-[0_0_0_34px_rgba(255,255,255,0.025),0_0_0_68px_rgba(255,255,255,0.018)]" aria-hidden="true" />
            <span class="absolute right-7 top-6 font-display text-xs text-paper-300/60">A</span>
            <span class="eyebrow !text-paper-300">.ics Download</span>
            <h3 class="mt-4 font-display text-3xl font-normal leading-tight tracking-[-0.03em]">한 번에 받아<br />직접 가져오기</h3>
            <p class="mt-4 max-w-md text-sm leading-relaxed text-paper-300">Google Calendar, Apple Calendar 등 대부분의 캘린더에서 열 수 있는 표준 파일입니다.</p>
            <div class="relative z-10 mt-auto pt-8">
              <button type="button" class="flex w-full items-center justify-between border border-paper-50 px-4 py-3.5 text-[0.68rem] font-medium uppercase tracking-[0.18em] transition hover:bg-paper-50 hover:text-ink-900 disabled:opacity-40" :disabled="!selectedCount" @click="downloadIcs">
                <span v-if="selectedCount">Download · {{ selectedCount }}건 저장</span><span v-else>카테고리를 선택하세요</span><span aria-hidden="true">↓</span>
              </button>
            </div>
          </article>

          <article class="relative flex min-h-[330px] flex-col border hairline bg-paper-50 p-7">
            <span class="absolute right-7 top-6 font-display text-xs text-ink-400">B</span>
            <span class="eyebrow">Subscription Link</span>
            <h3 class="mt-4 font-display text-3xl font-normal leading-tight tracking-[-0.03em] text-ink-900">새로운 날까지<br />계속 받아보기</h3>
            <p class="mt-4 max-w-md text-sm leading-relaxed text-ink-500">링크를 구독하면 새로운 기념일이 추가될 때 캘린더도 자동으로 업데이트됩니다.</p>
            <div class="mt-auto pt-8">
              <div class="flex flex-col gap-2 sm:flex-row">
                <input :value="feedWebcalUrl ?? ''" readonly :placeholder="hasSelection ? '' : '카테고리를 선택하세요'" class="h-11 min-w-0 flex-1 border hairline bg-paper-100 px-3 text-xs text-ink-600 focus:border-ink-800 focus:outline-none disabled:opacity-40" aria-label="구독 URL" :disabled="!hasSelection" @focus="(e) => (e.target as HTMLInputElement).select()" />
                <button type="button" class="h-11 shrink-0 border border-ink-900 bg-ink-900 px-4 text-[0.65rem] uppercase tracking-[0.16em] text-paper-50 transition hover:bg-accent-600 disabled:opacity-40" :disabled="!hasSelection" @click="copyFeedUrl">{{ copied ? '복사됨' : 'Copy' }}</button>
              </div>
              <div v-if="hasSelection" class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.62rem] uppercase tracking-[0.14em]">
                <a :href="googleAddUrl!" target="_blank" rel="noopener noreferrer" class="text-ink-500 transition hover:text-accent-600">Google Calendar →</a>
                <a :href="feedWebcalUrl!" class="text-ink-500 transition hover:text-accent-600">Apple · Other →</a>
              </div>
              <p v-else class="mt-3 text-[0.68rem] text-ink-400">카테고리를 하나 이상 선택하면 구독 링크가 만들어져요.</p>
              <p class="mt-4 text-[0.65rem] leading-relaxed text-ink-400">※ 구독 피드는 배포된 사이트에서 동작합니다.</p>
            </div>
          </article>
        </div>
      </section>

      <section class="mt-14 border-y border-ink-900" aria-labelledby="calendar-preview-title">
        <div class="flex items-end justify-between gap-4 border-b hairline py-5">
          <div><p class="eyebrow"><span class="mr-2 inline-grid h-6 w-6 place-items-center rounded-full border hairline font-display text-xs text-accent-600">03</span>Calendar Preview</p><h2 id="calendar-preview-title" class="mt-2 font-display text-3xl font-normal tracking-[-0.04em] text-ink-900 sm:text-4xl">담기는 기념일</h2></div>
          <strong class="font-display text-2xl font-normal tabular-nums text-ink-700">{{ selectedCount }}건</strong>
        </div>

        <ul v-if="visiblePreviewItems.length" id="calendar-preview-list" class="grid sm:grid-cols-2 sm:[&>li:nth-child(odd)]:border-r">
          <li v-for="item in visiblePreviewItems" :key="item.id" class="grid min-h-14 grid-cols-[4.5rem_minmax(0,1fr)] items-baseline gap-4 border-b hairline py-4 sm:odd:pr-6 sm:even:pl-6">
            <time class="text-xs tabular-nums text-ink-400">{{ item.dateLabel }}</time><span class="font-display text-sm leading-snug text-ink-800">{{ item.name }}</span>
          </li>
        </ul>
        <p v-else class="py-12 text-center font-display text-sm italic text-ink-400">카테고리를 하나 이상 선택하면 포함되는 기념일을 확인할 수 있어요.</p>

        <div v-if="hiddenPreviewCount" class="py-4 text-center">
          <button type="button" class="min-w-48 border-b border-ink-800 pb-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-ink-600 transition hover:border-accent-600 hover:text-accent-600" :aria-expanded="isPreviewExpanded" aria-controls="calendar-preview-list" @click="isPreviewExpanded = !isPreviewExpanded">
            {{ isPreviewExpanded ? '접기' : `더보기 · ${hiddenPreviewCount}건` }}
          </button>
        </div>
      </section>
    </template>
  </div>
</template>
