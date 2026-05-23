<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import ShareModal from '@/components/share/ShareModal.vue'
</script>

<template>
  <div class="flex min-h-full flex-col bg-paper-100 text-ink-700">
    <AppHeader />
    <main class="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
      <slot />
    </main>
    <AppFooter />
    <ShareModal />
  </div>
</template>
