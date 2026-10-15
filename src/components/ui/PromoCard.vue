<script setup lang="ts">
import UiButton from './UiButton.vue'
defineProps<{
  kicker: string
  title: string
  titleId?: string
  description: string
  to?: string
  cta: string
  canonical?: boolean
}>()
const emit = defineEmits<{ action: [] }>()
</script>
<template>
  <section
    class="subscribe-banner"
    :class="!canonical ? 'ui-promo' : undefined"
    :aria-labelledby="titleId"
  >
    <slot name="art"
      ><div v-if="canonical" class="subscribe-art" aria-hidden="true">
        <span>✓</span><span>✳</span>
      </div></slot
    >
    <div>
      <p class="section-kicker">{{ kicker }}</p>
      <h2 :id="titleId">{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
    <UiButton :to="to" :canonical="canonical" icon="arrow" @click="emit('action')">{{
      cta
    }}</UiButton>
  </section>
</template>
