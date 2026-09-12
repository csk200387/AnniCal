<script setup lang="ts">
import type { CategoryId } from '@/types/category'
import CategorySymbol from './CategorySymbol.vue'

defineProps<{ category: CategoryId; dateLabel: string; serial: string }>()
const perforations = Array.from({ length: 12 }, (_, index) => 17 + index * 13)
</script>

<template>
  <svg class="anniversary-stamp" viewBox="0 0 250 180" fill="none" aria-hidden="true">
    <!-- An archival bookmark behind the perforated postage stamp. -->
    <path d="M143 12h41v128l-20-13-21 13V12Z" fill="var(--color-paper-300)" />
    <path d="M163 25v43" stroke="currentColor" stroke-opacity=".3" />
    <g class="stamp-sheet">
      <path d="M63 10h111v159H63z" fill="var(--color-paper-50)" />
      <g fill="var(--art-bg, var(--color-paper-200))">
        <template v-for="position in perforations" :key="position">
          <circle cx="63" :cy="position" r="3" />
          <circle cx="174" :cy="position" r="3" />
        </template>
        <template v-for="position in [70, 83, 96, 109, 122, 135, 148, 161]" :key="position">
          <circle :cx="position" cy="10" r="3" />
          <circle :cx="position" cy="169" r="3" />
        </template>
      </g>
      <path d="M73 22h91v134H73z" stroke="currentColor" stroke-opacity=".35" />
      <text x="118" y="39" text-anchor="middle" fill="currentColor" font-size="9" letter-spacing="2">ANNICAL</text>
      <CategorySymbol :category="category" x="86" y="53" width="65" height="65" />
      <path d="M88 127h60" stroke="currentColor" stroke-opacity=".25" />
      <text x="118" y="145" text-anchor="middle" fill="currentColor" font-size="12" letter-spacing="2">{{ dateLabel }}</text>
    </g>
    <g class="stamp-postmark" stroke="currentColor" stroke-opacity=".45" stroke-width="1">
      <circle cx="193" cy="119" r="23" />
      <circle cx="193" cy="119" r="18" />
      <path d="M214 110q10-6 22 0m-22 9q10-6 22 0m-22 9q10-6 22 0" />
    </g>
    <text x="193" y="123" text-anchor="middle" fill="currentColor" font-size="10">{{ serial }}</text>
  </svg>
</template>
