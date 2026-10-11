<script setup lang="ts">
withDefaults(defineProps<{ tone?: 'empty' | 'error' | 'loading'; title: string; description?: string; asset?: string }>(), { tone: 'empty' })
</script>
<template>
  <div class="ui-result" :role="tone === 'error' ? 'alert' : 'status'">
    <span v-if="asset" class="empty-flower" aria-hidden="true">{{ asset }}</span>
    <h3>{{ title }}</h3><p v-if="description">{{ description }}</p><slot />
    <div v-if="$slots.actions" class="ui-result-actions"><slot name="actions" /></div>
  </div>
</template>
