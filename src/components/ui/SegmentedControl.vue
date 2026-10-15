<script setup lang="ts">
import { computed } from 'vue'
import { navigateRadios } from './radioNavigation'
const props = defineProps<{
  options: { value: string; label: string }[]
  modelValue: string
  label: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const index = computed(() =>
  Math.max(
    0,
    props.options.findIndex((option) => option.value === props.modelValue),
  ),
)
</script>
<template>
  <div
    class="ui-segmented"
    role="radiogroup"
    :aria-label="label"
    :style="{ '--segments': options.length, '--selected-index': index }"
    @keydown="navigateRadios"
  >
    <span class="ui-segmented-indicator" aria-hidden="true" />
    <button
      v-for="(option, i) in options"
      :key="option.value"
      type="button"
      role="radio"
      :aria-checked="modelValue === option.value"
      :tabindex="i === index ? 0 : -1"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>
