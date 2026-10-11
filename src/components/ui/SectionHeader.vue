<script setup lang="ts">
withDefaults(defineProps<{ kicker?: string; title?: string; description?: string; titleId?: string; level?: 2 | 3 }>(), { level: 2 })
</script>
<template>
  <div class="section-heading">
    <div>
      <p v-if="kicker" class="section-kicker"><span /> {{ kicker }}</p>
      <slot name="title"><component :is="`h${level}`" :id="titleId">{{ title }}<span class="heading-dot">.</span></component></slot>
      <p v-if="description" class="section-description">{{ description }}</p>
    </div>
    <slot name="action" />
  </div>
</template>
