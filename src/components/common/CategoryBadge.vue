<script setup lang="ts">
import { computed } from 'vue'
import { useAnniversariesStore } from '@/stores/anniversaries'
import type { CategoryId } from '@/types/category'

const props = defineProps<{ categoryId: CategoryId }>()

const store = useAnniversariesStore()
const category = computed(() =>
  store.categories.find((c) => c.id === props.categoryId),
)
</script>

<template>
  <span
    v-if="category"
    class="inline-flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-ink-500"
  >
    <span aria-hidden="true" class="text-ink-700 normal-case tracking-normal">{{ category.emoji }}</span>
    <span>{{ category.label }}</span>
  </span>
</template>
