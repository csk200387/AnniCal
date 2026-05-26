<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AppBackdrop from './AppBackdrop.vue'
import ShareModal from '@/components/share/ShareModal.vue'
</script>

<template>
  <div class="relative flex min-h-full flex-col bg-paper-100 text-ink-700">
    <AppBackdrop />
    <div class="relative z-10 flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <slot />
      </main>
      <AppFooter />
    </div>
    <ShareModal />
  </div>
</template>
