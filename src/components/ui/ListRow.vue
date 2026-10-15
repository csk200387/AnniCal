<script setup lang="ts">
import { RouterLink, type RouteLocationRaw } from 'vue-router'
withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    action?: boolean
    radio?: boolean
    selected?: boolean
    align?: 'center' | 'top'
  }>(),
  { align: 'center' },
)
</script>
<template>
  <component
    :is="to ? RouterLink : action || radio ? 'button' : 'div'"
    :to="to"
    :type="!to && (action || radio) ? 'button' : undefined"
    class="ui-list-row"
    :class="[
      `ui-list-row--${align}`,
      { 'is-selected': selected, 'ui-list-row--interactive': to || action || radio },
    ]"
    :role="radio ? 'radio' : undefined"
    :aria-checked="radio ? !!selected : undefined"
    :aria-pressed="action && !radio ? !!selected : undefined"
    :tabindex="radio ? (selected ? 0 : -1) : undefined"
  >
    <span class="ui-list-row-content">
      <span v-if="$slots.prefix" class="ui-list-row-prefix"><slot name="prefix" /></span>
      <span class="ui-list-row-copy"
        ><strong class="ui-list-row-title"><slot name="title" /></strong
        ><span v-if="$slots.detail" class="ui-list-row-detail"><slot name="detail" /></span
      ></span>
      <span v-if="$slots.suffix" class="ui-list-row-suffix"><slot name="suffix" /></span>
    </span>
  </component>
</template>
