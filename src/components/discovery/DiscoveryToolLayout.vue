<script setup lang="ts">
import PageHero from '@/components/ui/PageHero.vue'
import '@/assets/discovery.css'
defineProps<{ kicker: string; titleId: string; description: string; results?: boolean; resultsId?: string; busy?: boolean; hasFeature?: boolean }>()
</script>
<template>
  <div class="tool-container discovery-tool">
    <slot name="breadcrumb" />
    <PageHero :kicker="kicker" :title-id="titleId" :description="description">
      <template #title><slot name="title" /></template>
      <slot name="invitation" />
      <template #aside><slot name="form" /></template>
    </PageHero>
    <slot name="notice" />
    <section v-if="results" class="tool-section discovery-results" :aria-labelledby="resultsId" :aria-busy="busy">
      <slot name="resultsHeader" />
      <slot name="highlight" />
      <slot name="status" />
      <slot name="featureHeader" />
      <div v-if="hasFeature" class="discovery-result-layout">
        <div class="discovery-choices"><slot name="choices" /></div>
        <div class="discovery-feature"><slot name="feature" /></div>
      </div>
    </section>
    <slot name="intro" />
    <div v-if="$slots.crossLinks" class="tool-cross-links"><slot name="crossLinks" /></div>
  </div>
</template>
