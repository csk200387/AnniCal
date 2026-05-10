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
    class="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
  >
    <span aria-hidden="true">{{ category.emoji }}</span>
    {{ category.label }}
  </span>
</template>
