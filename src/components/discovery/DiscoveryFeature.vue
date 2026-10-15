<script setup lang="ts">
import type { Anniversary } from '@/types/anniversary'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import CategorySymbol from '@/features/feed/components/CategorySymbol.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { pathForId } from '@/utils/anniversaryRoutes'
import { displayName } from '@/utils/format'
defineProps<{ anniversary: Anniversary; featureId: string; caption: string; dateLabel?: string; title?: string; note?: string }>()
const emit = defineEmits<{ share: [] }>()
</script>
<template>
  <article :id="featureId" class="discovery-story" aria-label="선택한 기념일">
    <div class="discovery-story-art"><span>{{ dateLabel }}</span><CategorySymbol :category="anniversary.category" width="64" height="64" aria-hidden="true" /></div>
    <div class="discovery-story-body">
      <p class="discovery-story-caption">{{ caption }}</p>
      <h3>{{ title || displayName(anniversary.name) }}</h3>
      <CategoryBadge :category-id="anniversary.category" />
      <p class="discovery-origin">{{ anniversary.storytelling.origin || '이날에 담긴 이야기를 기념일 페이지에서 만나보세요.' }}</p>
      <p v-if="note" class="discovery-story-note">{{ note }}</p>
      <div class="discovery-story-actions"><UiButton variant="brand" icon="arrow" @click="emit('share')">카드 만들기</UiButton><UiButton :to="pathForId(anniversary.id) ?? undefined" variant="ghost" icon="next">유래 더 읽기</UiButton></div>
    </div>
  </article>
</template>
