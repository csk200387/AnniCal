<script setup lang="ts">
import type { CategoryId } from '@/types/category'

defineProps<{ category: CategoryId }>()

// Thirteen symbols, drawn on the same grid and reused on stamps and compact rows.
const paths: Record<CategoryId, string[]> = {
  general: ['M14 16h36v36H14zM14 26h36M22 11v10m20-10v10', 'M24 34h6v6h-6zM36 34h6v6h-6z'],
  holiday: ['M18 54V12m0 3c10-9 20 9 30 0v22c-10 9-20-9-30 0M11 54h16'],
  romance: ['M10 26v26h44V26M10 26l22 17 22-17M11 51l15-13m12 0 15 13', 'M32 31 20 20c-9-10 5-18 12-8 7-10 21-2 12 8L32 31Z'],
  food: ['M46 32a14 14 0 1 1-28 0 14 14 0 0 1 28 0Z', 'M9 12v15m-5-15v10q0 6 5 6t5-6V12M9 28v25M56 12v41M56 12q-10 6-8 22h8'],
  animal: ['M15 49C4 23 32 12 52 12c0 24-5 44-29 38M15 53l29-30M23 43V30m0 13h13'],
  culture: ['M32 18v35M32 18c-8-6-15-6-23-4v34c8-2 15-2 23 5 8-7 15-7 23-5V14c-8-2-15-2-23 4Z', 'M16 23l9 2m-9 7 9 2m14-9 9-2m-9 11 9-2'],
  academic: ['M54 32c0 6-10 11-22 11S10 38 10 32s10-11 22-11 22 5 22 11Z', 'M43 13c5 3 4 14-2 25S26 55 21 52s-4-14 2-25 15-17 20-14Z', 'M21 13c5-3 14 3 20 14s7 22 2 25-14-3-20-14-7-22-2-25ZM34 32a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z'],
  sports: ['M22 9h20l-4 19H26L22 9ZM32 9v18', 'M47 42a15 15 0 1 1-30 0 15 15 0 0 1 30 0ZM32 33l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z'],
  career: ['M10 23h44v29H10zM23 23v-9h18v9M10 32q22 12 44 0M29 34h6v8h-6z'],
  history: ['M17 10h30M17 54h30M20 10v9c0 7 12 8 12 13s-12 6-12 13v9M44 10v9c0 7-12 8-12 13s12 6 12 13v9', 'M24 18h16M25 46l7-6 7 6'],
  campaign: ['M25 25c-5-13 0-18 7-18s12 5 7 18L20 56l-2-13 7 1 14-24M39 25l12 20-13-1 7 12-20-31M25 15h14'],
  quirky: ['M23 42c0-8-9-9-9-21a18 18 0 0 1 36 0c0 12-9 13-9 21H23ZM23 48h18m-15 6h12', 'M27 22l5 6 5-6m-5 6v14M6 18H2m60 0h-4'],
  brand: ['M9 30 31 8h23v23L32 53 9 30ZM45 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', 'M24 29l11 11m-16-6 8 8'],
}
</script>

<template>
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-for="(path, index) in paths[category]" :key="index" :d="path" />
  </svg>
</template>
