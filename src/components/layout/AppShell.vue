<script setup lang="ts">
import { computed, defineAsyncComponent, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import AppBackdrop from './AppBackdrop.vue'
import { useShareStore } from '@/stores/share'
import { useStatsStore } from '@/stores/stats'

// 공유 모달은 html-to-image(웹폰트 base64 인라인 포함)와 ShareCard 를 끌고 온다.
// 정적 import 하면 공유를 한 번도 안 누르는 사람도 그 코드를 메인 번들로 받는다.
// 실제로 열릴 때 가져오고, 그전까지는 DOM 에 아예 없다.
const ShareModal = defineAsyncComponent(() => import('@/components/share/ShareModal.vue'))

const shareStore = useShareStore()
const { isOpen } = storeToRefs(shareStore)
// 한 번 열면 계속 붙여 둔다 — 닫을 때마다 청크를 버리고 다시 받을 이유가 없다.
const everOpened = computed(() => isOpen.value || shareStore.hasOpened)

// 최초 진입과 SPA 내부 이동을 각각 한 페이지뷰로 집계한다. 쿼리 문자열만 바뀐
// 경우는 같은 페이지로 보고 path만 감시한다.
const route = useRoute()
const statsStore = useStatsStore()
let trackingVersion = 0
watch(
  () => route.path,
  async () => {
    const version = ++trackingVersion
    if (route.name !== 'day-detail') {
      void statsStore.trackPage(null)
      return
    }

    // 1,500여 개 상세 URL 매핑은 큰 JSON이다. 홈 첫 화면에 끌어들이지 않고
    // 상세 페이지에서 이미 필요한 청크와 함께 지연 로드한다.
    const date = String(route.params.date ?? '')
    const slug = String(route.params.slug ?? '')
    const { idForPath } = await import('@/utils/anniversaryRoutes')
    if (version !== trackingVersion) return
    void statsStore.trackPage(idForPath(date, slug))
  },
  { immediate: true },
)
</script>

<template>
  <div class="relative flex min-h-full flex-col bg-paper-100 text-ink-700">
    <AppBackdrop />
    <div class="relative z-10 flex min-h-full flex-1 flex-col">
      <AppHeader />
      <main class="mx-auto w-full max-w-[1180px] flex-1 px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        <slot />
      </main>
      <AppFooter />
    </div>
    <ShareModal v-if="everOpened" />
  </div>
</template>
