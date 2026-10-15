<script setup lang="ts">
import { navigateRadios } from './radioNavigation'
withDefaults(defineProps<{ as?: 'div' | 'ol' | 'ul'; single?: boolean; label?: string }>(), {
  as: 'div',
})
</script>
<template>
  <component
    :is="as"
    class="ui-list-group"
    :role="single ? 'radiogroup' : as === 'div' && label ? 'group' : undefined"
    :aria-label="label"
    @keydown="single && navigateRadios($event)"
    ><slot
  /></component>
</template>
