<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <AppShell>
    <RouterView />
  </AppShell>
  <Analytics />
</template>
