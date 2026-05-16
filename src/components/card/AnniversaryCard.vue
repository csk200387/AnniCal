<script setup lang="ts">
import { computed } from 'vue'
import type { Anniversary } from '@/types/anniversary'
import { formatKoreanMonthDay } from '@/utils/dateUtils'
import { colorsForTag, primaryColorForTags } from '@/utils/tagPalette'
import CategoryBadge from '@/components/common/CategoryBadge.vue'

const props = defineProps<{
  anniversary: Anniversary
  /** 다가오는 카드인 경우 D-N 표기를 위한 값. */
  dDay?: number
}>()

defineEmits<{ (e: 'share', anniversary: Anniversary): void }>()

const dateLabel = formatKoreanMonthDay(props.anniversary)

const titleColor = computed(() => primaryColorForTags(props.anniversary.tags).text)
const tagChips = computed(() =>
  props.anniversary.tags.map((tag) => ({ tag, color: colorsForTag(tag) })),
)
</script>

<template>
  <article
    class="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
  >
    <header class="flex items-start justify-between gap-3 px-5 pt-5">
      <div class="flex flex-col gap-1.5">
        <CategoryBadge :category-id="anniversary.category" />
        <p class="text-sm text-neutral-500">{{ dateLabel }}</p>
      </div>
      <span
        v-if="typeof dDay === 'number'"
        class="rounded-full bg-brand-500 px-2.5 py-1 text-xs font-bold text-white"
      >
        D-{{ dDay }}
      </span>
    </header>

    <div class="px-5 pb-5 pt-3">
      <h2 class="text-xl font-bold tracking-tight" :class="titleColor">
        {{ anniversary.name }}
      </h2>

      <ul v-if="tagChips.length" class="mt-3 flex flex-wrap gap-1.5">
        <li
          v-for="{ tag, color } in tagChips"
          :key="tag"
          class="rounded-full border px-2 py-0.5 text-[11px] font-medium"
          :class="[color.text, color.bg, color.border]"
        >
          #{{ tag }}
        </li>
      </ul>

      <section class="mt-4 space-y-3 text-sm leading-relaxed text-neutral-700">
        <p>
          <span class="font-semibold text-neutral-900">유래 · </span>
          {{ anniversary.storytelling.origin }}
        </p>
        <p>
          <span class="font-semibold text-neutral-900">일화 · </span>
          {{ anniversary.storytelling.anecdote }}
        </p>
      </section>

      <section v-if="anniversary.memes.length" class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="(meme, idx) in anniversary.memes"
          :key="idx"
          class="rounded-lg bg-neutral-50 px-3 py-1.5 text-xs italic text-neutral-600"
        >
          “{{ meme.caption }}”
        </span>
      </section>

      <footer class="mt-5 flex items-center justify-between">
        <a
          v-if="anniversary.sourceUrl"
          :href="anniversary.sourceUrl"
          target="_blank"
          rel="noopener"
          class="text-xs text-neutral-400 hover:text-neutral-600 hover:underline"
        >
          출처
        </a>
        <button
          type="button"
          class="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700"
          @click="$emit('share', anniversary)"
        >
          공유하기
        </button>
      </footer>
    </div>
  </article>
</template>
