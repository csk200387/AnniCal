<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'solid' | 'outline-weak'; selected?: boolean; count?: number; radio?: boolean; disabled?: boolean }>(), { variant: 'outline-weak' })
</script>
<template>
  <button type="button" class="ui-chip" :class="[`ui-chip--${variant}`, { 'is-selected': selected }]" :role="radio ? 'radio' : undefined" :aria-checked="radio ? !!selected : undefined" :aria-pressed="!radio ? !!selected : undefined" :tabindex="radio ? selected ? 0 : -1 : undefined" :disabled="disabled"><slot /><span v-if="count !== undefined">{{ count }}</span></button>
</template>
