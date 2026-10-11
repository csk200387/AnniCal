<script setup lang="ts">
withDefaults(defineProps<{ rows?: number; variant?: 'list' | 'card'; label?: string }>(), { rows: 3, variant: 'list', label: '이야기를 불러오고 있어요' })
</script>
<template>
  <div class="ui-skeleton" :class="`ui-skeleton--${variant}`" role="status" :aria-label="label"><div v-for="n in rows" :key="n" class="ui-skeleton-row" aria-hidden="true"><span /><span /><span /></div></div>
</template>
