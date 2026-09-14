<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { Analytics } from '@vercel/analytics/vue'

const route = useRoute()

// 상단 탭의 순서와 같은 축으로 페이지를 넘긴다. 쿼리만 바뀌는 순위의 월 이동은
// 같은 route.name 이므로 화면 전체가 다시 넘어가지 않는다.
const primaryRouteOrder = ['feed', 'calendar', 'birthday', 'popular', 'export']
const pageTransition = ref('route-fade')

function primaryRouteIndex(name: unknown): number {
  return primaryRouteOrder.indexOf(String(name))
}

watch(
  () => route.name,
  (to, from) => {
    const toIndex = primaryRouteIndex(to)
    const fromIndex = primaryRouteIndex(from)
    if (toIndex < 0 || fromIndex < 0 || toIndex === fromIndex) {
      pageTransition.value = 'route-fade'
      return
    }
    pageTransition.value = toIndex > fromIndex ? 'route-forward' : 'route-back'
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
