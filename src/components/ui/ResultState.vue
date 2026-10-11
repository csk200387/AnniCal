<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'empty' | 'error' | 'loading'; title: string; description?: string; asset?: string; large?: boolean; level?: 1 | 2 | 3 }>(), { tone: 'empty', level: 3 })
</script>
<template>
  <div class="ui-result" :class="{ 'ui-result--large': large }" :role="tone === 'error' ? 'alert' : 'status'">
    <span v-if="asset" class="empty-flower" aria-hidden="true">{{ asset }}</span>
    <component :is="`h${level}`">{{ title }}</component><p v-if="description">{{ description }}</p><slot />
    <div v-if="$slots.actions" class="ui-result-actions"><slot name="actions" /></div>
  </div>
</template>
