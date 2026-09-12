<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Anniversary } from '@/types/anniversary'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { pathFor } from '@/utils/anniversaryRoutes'
import { EXTERNAL_LINK_REL, isExternalUrl } from '@/utils/sourceUrl'
import AnniversaryStamp from './AnniversaryStamp.vue'
import CategorySymbol from './CategorySymbol.vue'

const props = defineProps<{
  anniversary: Anniversary
  index: number
  dateLabel: string
}>()
defineEmits<{ (e: 'share', anniversary: Anniversary): void }>()
const store = useAnniversariesStore()
const category = computed(() => store.categories.find((item) => item.id === props.anniversary.category))
const path = computed(() => pathFor(props.anniversary))
const displayName = computed(() => props.anniversary.name.replace(/\s+\([A-Za-z][^)]*\)$/, ''))
</script>

<template>
  <article class="today-story" :class="index === 0 ? 'today-story--featured' : 'today-story--compact'"
    :data-category="anniversary.category">
    <div class="story-art" aria-hidden="true">
      <AnniversaryStamp :category="anniversary.category" :date-label="dateLabel"
        :serial="String(index + 1).padStart(2, '0')" />
      <CategorySymbol class="story-mini-symbol" :category="anniversary.category" />
    </div>
    <div class="story-body">
      <div class="story-meta">
        <span>{{ category?.label ?? '기념일' }}</span>
        <span v-if="index === 0" class="story-selection">오늘의 첫 이야기</span>
      </div>
      <h3>
        <RouterLink v-if="path" :to="path" :aria-label="anniversary.name">{{ displayName }}</RouterLink>
        <template v-else>{{ displayName }}</template>
      </h3>
      <p>{{ anniversary.storytelling.origin || anniversary.storytelling.anecdote || '이 날에 담긴 이야기를 만나보세요.' }}</p>
      <div class="story-footer">
        <RouterLink v-if="path" :to="path" class="story-read" :aria-label="`${displayName} 이야기 읽기`">
          이야기 읽기 <span aria-hidden="true">↗</span>
        </RouterLink>
        <a v-else-if="isExternalUrl(anniversary.sourceUrl)" :href="anniversary.sourceUrl!"
          target="_blank" :rel="EXTERNAL_LINK_REL" class="story-read">출처 보기 ↗</a>
        <span v-else />
        <button type="button" class="round-icon-button" :aria-label="`${anniversary.name} 공유`"
          @click="$emit('share', anniversary)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M12 15V3m-4 4 4-4 4 4M6 11H4v9h16v-9h-2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>
