<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AppBackdrop from './AppBackdrop.vue'
import { useShareStore } from '@/stores/share'

// 공유 모달은 html-to-image(웹폰트 base64 인라인 포함)와 ShareCard 를 끌고 온다.
// 정적 import 하면 공유를 한 번도 안 누르는 사람도 그 코드를 메인 번들로 받는다.
// 실제로 열릴 때 가져오고, 그전까지는 DOM 에 아예 없다.
const ShareModal = defineAsyncComponent(() => import('@/components/share/ShareModal.vue'))

const shareStore = useShareStore()
const { isOpen } = storeToRefs(shareStore)
// 한 번 열면 계속 붙여 둔다 — 닫을 때마다 청크를 버리고 다시 받을 이유가 없다.
const everOpened = computed(() => isOpen.value || shareStore.hasOpened)
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
    <ShareModal v-if="everOpened" />
  </div>
</template>
