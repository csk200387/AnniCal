<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
withDefaults(defineProps<{
  variant?: 'solid' | 'outline-weak'; selected?: boolean; count?: number
  radio?: boolean; disabled?: boolean; to?: RouteLocationRaw; static?: boolean
}>(), { variant: 'outline-weak' })
</script>
<template>
  <component :is="static ? 'span' : to ? RouterLink : 'button'" :to="to"
    :type="!static && !to ? 'button' : undefined" class="ui-chip"
    :class="[`ui-chip--${variant}`, { 'is-selected': selected, 'ui-chip--static': static }]"
    :role="!static && !to && radio ? 'radio' : undefined"
    :aria-checked="!static && !to && radio ? !!selected : undefined"
    :aria-pressed="!static && !to && !radio ? !!selected : undefined"
    :tabindex="!static && !to && radio ? selected ? 0 : -1 : undefined"
    :disabled="!static && !to ? disabled : undefined"><slot /><span v-if="count !== undefined">{{ count }}</span></component>
</template>
