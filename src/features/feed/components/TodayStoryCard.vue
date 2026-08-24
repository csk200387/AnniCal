<script setup lang="ts">
import { computed } from 'vue'
import type { Anniversary } from '@/types/anniversary'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { EXTERNAL_LINK_REL, isExternalUrl } from '@/utils/sourceUrl'

const props = defineProps<{
  anniversary: Anniversary
  index: number
  featured?: boolean
}>()

defineEmits<{ (e: 'share', anniversary: Anniversary): void }>()

const dateLabel = computed(() => formatKoreanMonthDay(props.anniversary) ?? '')
const storyNumber = computed(() => String(props.index + 1).padStart(2, '0'))
</script>

<template>
  <article
    class="flex min-h-[420px] flex-col overflow-hidden border transition-shadow duration-300 hover:shadow-[0_20px_50px_-30px_rgba(31,29,26,0.35)]"
    :class="featured ? 'border-ink-900 bg-ink-900 text-paper-50' : 'border-rule bg-paper-50 text-ink-900'"
  >
    <header
      class="flex items-center justify-between gap-4 border-b px-5 py-3.5"
      :class="featured ? 'border-paper-50/15' : 'border-rule'"
    >
      <CategoryBadge
        :category-id="anniversary.category"
        :class="featured ? '[&>span]:!text-paper-200 !text-paper-300' : ''"
      />
      <time
        class="font-display text-xs tracking-[0.12em]"
        :class="featured ? 'text-paper-300' : 'text-ink-400'"
      >
        {{ dateLabel }}
      </time>
    </header>

    <div class="flex-1 px-6 py-7 sm:px-8 sm:py-9">
      <span class="font-display text-xs" :class="featured ? 'text-paper-300' : 'text-ink-400'">
        Story No. {{ storyNumber }}
      </span>
      <h2
        class="mt-4 font-display font-medium leading-[1.08] tracking-[-0.04em]"
        :class="[
          featured ? 'text-paper-50' : 'text-ink-900',
          featured ? 'text-[2.25rem] sm:text-[3rem]' : 'text-[2rem] sm:text-[2.4rem]',
        ]"
      >
        {{ anniversary.name }}
      </h2>

      <div class="mt-6 flex items-center gap-3">
        <span class="h-px flex-1" :class="featured ? 'bg-paper-50/15' : 'bg-rule'" />
        <span
          class="text-[0.58rem] uppercase tracking-[0.22em]"
          :class="featured ? 'text-paper-300' : 'text-ink-400'"
        >Story</span>
        <span class="h-px flex-1" :class="featured ? 'bg-paper-50/15' : 'bg-rule'" />
      </div>

      <div
        class="mt-5 space-y-4 text-sm leading-[1.8]"
        :class="featured ? 'text-paper-300' : 'text-ink-600'"
      >
        <p v-if="anniversary.storytelling.origin?.trim()">
          {{ anniversary.storytelling.origin }}
        </p>
        <p v-if="anniversary.storytelling.anecdote?.trim()">
          {{ anniversary.storytelling.anecdote }}
        </p>
      </div>

      <blockquote
        v-if="anniversary.memes[0]?.caption"
        class="mt-6 border-l pl-4 font-display text-sm italic leading-relaxed"
        :class="featured ? 'border-paper-300/50 text-paper-300' : 'border-accent-500 text-ink-500'"
      >
        &ldquo;{{ anniversary.memes[0].caption }}&rdquo;
      </blockquote>
    </div>

    <footer
      class="flex items-center justify-between border-t px-5 py-3.5"
      :class="featured ? 'border-paper-50/15' : 'border-rule bg-paper-100/60'"
    >
      <a
        v-if="isExternalUrl(anniversary.sourceUrl)"
        :href="anniversary.sourceUrl!"
        target="_blank"
        :rel="EXTERNAL_LINK_REL"
        class="text-[0.65rem] uppercase tracking-[0.18em] transition-colors"
        :class="featured ? 'text-paper-300 hover:text-paper-50' : 'text-ink-400 hover:text-ink-800'"
      >
        Source →
      </a>
      <span v-else />
      <button
        type="button"
        class="text-[0.65rem] uppercase tracking-[0.18em] transition-colors hover:text-accent-500"
        :class="featured ? 'text-paper-300' : 'text-ink-600'"
        @click="$emit('share', anniversary)"
      >
        Share · 공유 →
      </button>
    </footer>
  </article>
</template>
