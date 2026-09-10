<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Anniversary } from '@/types/anniversary'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { pathFor } from '@/utils/anniversaryRoutes'
import { EXTERNAL_LINK_REL, isExternalUrl } from '@/utils/sourceUrl'

const props = defineProps<{ anniversary: Anniversary; index: number }>()
defineEmits<{ (e: 'share', anniversary: Anniversary): void }>()
const store = useAnniversariesStore()
const category = computed(() => store.categories.find((item) => item.id === props.anniversary.category))
const path = computed(() => pathFor(props.anniversary))
const displayName = computed(() => props.anniversary.name.replace(/\s+\([A-Za-z][^)]*\)$/, ''))
const artwork = computed(() => {
  if (['campaign', 'academic', 'history'].includes(props.anniversary.category)) return 'world'
  if (['food', 'brand'].includes(props.anniversary.category)) return 'food'
  if (props.anniversary.category === 'romance') return 'heart'
  return 'flower'
})
</script>

<template>
  <article class="today-story" :class="`story-tone-${index % 4}`">
    <div class="story-art" aria-hidden="true">
      <span class="story-art-label">{{ category?.label ?? '기념일' }}</span>
      <span class="story-art-number">{{ String(index + 1).padStart(2, '0') }} / TODAY</span>
      <svg class="story-illustration" viewBox="0 0 240 180" fill="none">
        <template v-if="artwork === 'world'">
          <ellipse cx="122" cy="148" rx="62" ry="9" fill="currentColor" opacity=".09" />
          <circle cx="120" cy="85" r="60" fill="var(--art-fill)" />
          <circle cx="120" cy="85" r="60" stroke="currentColor" stroke-width="2.5" />
          <ellipse cx="120" cy="85" rx="27" ry="60" stroke="currentColor" stroke-width="2.5" />
          <path d="M62 85h116M70 55q50 16 100 0M70 115q50-16 100 0" stroke="currentColor" stroke-width="2.5" />
          <path d="M181 23v24m-12-12h24" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <circle cx="54" cy="123" r="8" fill="currentColor" />
        </template>
        <template v-else-if="artwork === 'food'">
          <ellipse cx="119" cy="149" rx="60" ry="8" fill="currentColor" opacity=".08" />
          <path d="M78 74h76v45q0 24-38 24t-38-24V74Z" fill="var(--art-fill)" stroke="currentColor" stroke-width="3" />
          <path d="M154 84h10q26 0 19 24t-29 11M104 54c-18-17 18-18 0-35M126 54c-18-17 18-18 0-35" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <path d="M68 148h98" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <path d="M97 101q19 20 38 0" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <path d="M49 53v20M39 63h20" stroke="currentColor" stroke-width="2.5" />
        </template>
        <template v-else-if="artwork === 'heart'">
          <path d="M120 143 62 87C20 42 87 8 120 55c33-47 100-13 58 32l-58 56Z" fill="var(--art-fill)" stroke="currentColor" stroke-width="3" />
          <path d="M104 95q16 18 32 0" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
          <circle cx="103" cy="80" r="3" fill="currentColor" /><circle cx="137" cy="80" r="3" fill="currentColor" />
        </template>
        <template v-else>
          <g fill="var(--art-fill)" stroke="currentColor" stroke-width="2"><ellipse v-for="angle in [0, 45, 90, 135]" :key="angle" cx="120" cy="85" rx="24" ry="66" :transform="`rotate(${angle} 120 85)`" /></g>
          <circle cx="120" cy="85" r="29" fill="var(--art-fill)" stroke="currentColor" stroke-width="2" />
          <path d="M109 91q11 13 22 0" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" /><circle cx="110" cy="78" r="2.5" fill="currentColor" /><circle cx="130" cy="78" r="2.5" fill="currentColor" />
          <path d="m185 116 7 7-7 7-7-7 7-7Z" fill="currentColor" /><circle cx="51" cy="43" r="5" fill="currentColor" />
        </template>
      </svg>
      <span class="story-art-caption">A DAY WORTH KNOWING</span>
    </div>
    <div class="story-body">
      <div class="story-tags"><span v-for="tag in anniversary.tags.slice(0, 2)" :key="tag">#{{ tag }}</span></div>
      <h3><RouterLink v-if="path" :to="path" :aria-label="anniversary.name">{{ displayName }}</RouterLink><template v-else>{{ displayName }}</template></h3>
      <p>{{ anniversary.storytelling.origin || anniversary.storytelling.anecdote || '이 날에 담긴 이야기를 만나보세요.' }}</p>
      <div class="story-footer">
        <RouterLink v-if="path" :to="path" class="story-read">이야기 읽기 <span aria-hidden="true">↗</span></RouterLink>
        <a v-else-if="isExternalUrl(anniversary.sourceUrl)" :href="anniversary.sourceUrl!" target="_blank" :rel="EXTERNAL_LINK_REL" class="story-read">출처 보기 ↗</a>
        <span v-else />
        <button type="button" class="round-icon-button" :aria-label="`${anniversary.name} 공유`" @click="$emit('share', anniversary)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M6 11H4v9h16v-9h-2" stroke-linecap="round" stroke-linejoin="round" /></svg></button>
      </div>
    </div>
  </article>
</template>
