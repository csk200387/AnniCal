<script setup lang="ts">
import { navigateRadios } from './radioNavigation'
withDefaults(defineProps<{ scrollable?: boolean; single?: boolean; label: string }>(), { scrollable: false })
</script>
<template>
  <div class="ui-chip-group" :class="{ 'ui-chip-group--scrollable': scrollable }" :role="single ? 'radiogroup' : 'group'" :aria-label="label" @keydown="single && navigateRadios($event)"><slot /></div>
</template>
