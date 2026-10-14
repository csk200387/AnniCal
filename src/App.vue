<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { pageTransitionFor } from '@/components/layout/navigation'
import { Analytics } from '@vercel/analytics/vue'

const route = useRoute()

// 상단 탭의 순서와 같은 축으로 페이지를 넘긴다. 쿼리만 바뀌는 순위의 월 이동은
// 같은 route.name 이므로 화면 전체가 다시 넘어가지 않는다.
const pageTransition = ref('route-forward')

watch(
  () => route.name,
  (to, from) => {
    pageTransition.value = pageTransitionFor(to, from)
  },
)
</script>

<template>
  <AppShell>
    <RouterView v-slot="{ Component, route: routed }">
      <Transition :name="pageTransition" mode="out-in">
        <component :is="Component" :key="routed.name" />
      </Transition>
    </RouterView>
  </AppShell>
  <Analytics />
</template>
