<script setup lang="ts">
const props = defineProps<{ label: string; for: string; helper?: string; error?: string }>()
</script>
<template>
  <div class="ui-field" :class="{ 'ui-field--error': error }">
    <label :for="props.for">{{ label }}</label>
    <slot :describedby="error ? `${props.for}-error` : helper ? `${props.for}-helper` : undefined" :invalid="!!error" />
    <p v-if="error" :id="`${props.for}-error`" class="ui-field-error" role="alert">{{ error }}</p>
    <p v-else-if="helper" :id="`${props.for}-helper`" class="ui-field-helper">{{ helper }}</p>
  </div>
</template>
