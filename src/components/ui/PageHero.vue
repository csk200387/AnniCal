<script setup lang="ts">
import { ref } from 'vue'
withDefaults(
  defineProps<{
    kicker?: string
    meta?: string
    title?: string
    titleId: string
    description?: string
    variant?: 'default' | 'compact'
    layout?: 'home' | 'tool'
  }>(),
  { variant: 'default', layout: 'tool' },
)
const el = ref<HTMLElement | null>(null)
defineExpose({ el })
</script>

<template>
  <section
    ref="el"
    class="home-hero"
    :class="
      layout === 'tool'
        ? ['ui-page-hero', `ui-page-hero--${variant}`, { 'ui-page-hero--solo': !$slots.aside }]
        : undefined
    "
    :aria-labelledby="titleId"
  >
    <div v-if="$slots.topline || kicker || meta" class="hero-topline">
      <slot name="topline"
        ><span class="hero-edition">{{ kicker }}</span
        ><span v-if="meta">{{ meta }}</span></slot
      >
    </div>
    <div class="hero-content">
      <div class="hero-copy">
        <slot name="copy">
          <h1 :id="titleId">
            <slot name="title">{{ title }}</slot>
          </h1>
          <p v-if="description" class="hero-description">{{ description }}</p>
          <slot />
          <div v-if="$slots.actions" class="hero-actions"><slot name="actions" /></div>
        </slot>
      </div>
      <slot name="aside" />
    </div>
    <div v-if="$slots.footer" class="hero-bottomline"><slot name="footer" /></div>
  </section>
</template>
