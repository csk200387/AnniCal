<script setup lang="ts">
import { computed } from 'vue'
import type { Anniversary } from '@/types/anniversary'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { primaryColorForTags } from '@/utils/tagPalette'
import CategoryBadge from '@/components/common/CategoryBadge.vue'

const props = defineProps<{
  anniversary: Anniversary
  /** 다가오는 카드인 경우 D-N 표기를 위한 값. */
  dDay?: number
}>()

defineEmits<{ (e: 'share', anniversary: Anniversary): void }>()

const dateLabel = formatKoreanMonthDay(props.anniversary)
const accentDot = computed(() => primaryColorForTags(props.anniversary.tags).dot)
</script>

<template>
  <article
    class="group relative overflow-hidden rounded-[2px] border border-rule bg-paper-50 transition-shadow duration-300 hover:shadow-[0_18px_40px_-24px_rgba(31,29,26,0.25)]"
  >
    <!-- Top meta strip: category eyebrow · date · D-day -->
    <header class="flex items-center justify-between gap-3 border-b hairline px-7 py-3.5">
      <div class="flex items-center gap-3 min-w-0">
        <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="accentDot" aria-hidden="true" />
        <CategoryBadge :category-id="anniversary.category" />
        <span class="hidden h-3 w-px bg-rule-strong sm:block" aria-hidden="true" />
        <span class="hidden font-display text-[0.82rem] tracking-wide text-ink-500 sm:inline">
          {{ dateLabel }}
        </span>
      </div>
      <span
        v-if="typeof dDay === 'number'"
        class="flex items-baseline gap-1 font-display text-[0.78rem] uppercase tracking-[0.18em] text-accent-600"
      >
        <span class="text-[0.62rem]">D −</span>
        <span class="text-base font-medium">{{ dDay }}</span>
      </span>
    </header>

    <!-- Body -->
    <div class="px-7 pt-7 pb-6">
      <p class="eyebrow sm:hidden mb-2">{{ dateLabel }}</p>

      <!-- Headline: serif display, generous leading -->
      <h2 class="font-display text-[1.9rem] font-medium leading-[1.15] tracking-tight text-ink-900 sm:text-[2.2rem]">
        {{ anniversary.name }}
      </h2>

      <!-- Drop-rule under headline (editorial divider) -->
      <div class="mt-5 flex items-center gap-3">
        <span class="h-px flex-1 bg-rule" />
        <span class="eyebrow !text-[0.6rem]">Story</span>
        <span class="h-px flex-1 bg-rule" />
      </div>

      <!-- Origin & anecdote — labeled like magazine sidenotes -->
      <section
        v-if="anniversary.storytelling.origin?.trim() || anniversary.storytelling.anecdote?.trim()"
        class="mt-5 space-y-5 text-[0.95rem] leading-[1.75] text-ink-600"
      >
        <p v-if="anniversary.storytelling.origin?.trim()" class="relative pl-6">
          <span class="absolute left-0 top-1 font-display text-[0.62rem] uppercase tracking-[0.25em] text-ink-400 [writing-mode:vertical-rl] [text-orientation:mixed]">
            Origin
          </span>
          {{ anniversary.storytelling.origin }}
        </p>
        <p v-if="anniversary.storytelling.anecdote?.trim()" class="relative pl-6">
          <span class="absolute left-0 top-1 font-display text-[0.62rem] uppercase tracking-[0.25em] text-ink-400 [writing-mode:vertical-rl] [text-orientation:mixed]">
            Anecdote
          </span>
          {{ anniversary.storytelling.anecdote }}
        </p>
      </section>

      <!-- Pull quotes (memes) -->
      <section v-if="anniversary.memes.length" class="mt-7 space-y-2 border-l border-ink-200 pl-5">
        <blockquote
          v-for="(meme, idx) in anniversary.memes"
          :key="idx"
          class="font-display text-[0.95rem] italic leading-snug text-ink-500"
        >
          &ldquo;{{ meme.caption }}&rdquo;
        </blockquote>
      </section>

      <!-- Tags as small dotted markers -->
      <ul
        v-if="anniversary.tags.length"
        class="mt-7 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-ink-400"
      >
        <li v-for="tag in anniversary.tags" :key="tag" class="flex items-center gap-1.5">
          <span class="h-px w-3 bg-ink-300" aria-hidden="true" />
          <span>{{ tag }}</span>
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <footer class="flex items-center justify-between border-t hairline bg-paper-100/60 px-7 py-3.5">
      <a
        v-if="anniversary.sourceUrl"
        :href="anniversary.sourceUrl"
        target="_blank"
        rel="noopener"
        class="group/link inline-flex items-center gap-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-ink-400 transition-colors hover:text-ink-700"
      >
        <span>출처</span>
        <span class="transition-transform group-hover/link:translate-x-0.5" aria-hidden="true">→</span>
      </a>
      <span v-else />
      <button
        type="button"
        class="group/btn inline-flex items-center gap-2 text-[0.72rem] uppercase tracking-[0.2em] text-ink-700 transition-colors hover:text-accent-600"
        @click="$emit('share', anniversary)"
      >
        <span>Share</span>
        <span class="font-display normal-case tracking-normal text-[0.85rem]">공유</span>
        <span class="transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true">→</span>
      </button>
    </footer>
  </article>
</template>
