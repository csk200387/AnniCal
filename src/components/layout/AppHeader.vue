<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import dayjs from 'dayjs'
import AnnicalMark from '@/components/common/AnnicalMark.vue'
import { useNow } from '@/composables/useNow'

const { today } = useNow()
const route = useRoute()
const todayLabel = computed(() => dayjs(today.value).format('YYYY.MM.DD'))
const scrolled = ref(false)
const navRef = ref<HTMLElement | null>(null)
const indicatorX = ref(0)
const indicatorY = ref(0)
const indicatorWidth = ref(0)
const indicatorHeight = ref(0)
const indicatorReady = ref(false)
const indicatorStyle = computed(() => ({
  width: `${indicatorWidth.value}px`,
  height: `${indicatorHeight.value}px`,
  transform: `translate3d(${indicatorX.value}px, ${indicatorY.value}px, 0)`,
}))

function updateScroll() { scrolled.value = window.scrollY > 32 }
function updateNavIndicator() {
  void nextTick(() => {
    const nav = navRef.value
    const activeLink = nav?.querySelector<HTMLAnchorElement>('a.is-active')
    if (!nav || !activeLink) {
      indicatorReady.value = false
      return
    }
    const navRect = nav.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    indicatorX.value = linkRect.left - navRect.left + nav.scrollLeft
    indicatorY.value = linkRect.top - navRect.top + nav.scrollTop
    indicatorWidth.value = linkRect.width
    indicatorHeight.value = linkRect.height
    indicatorReady.value = true
  })
}

let navResizeObserver: ResizeObserver | null = null
onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
  updateNavIndicator()
  if (typeof ResizeObserver !== 'undefined' && navRef.value) {
    navResizeObserver = new ResizeObserver(updateNavIndicator)
    navResizeObserver.observe(navRef.value)
  }
})
watch(() => route.path, updateNavIndicator, { flush: 'post' })
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateScroll)
  navResizeObserver?.disconnect()
})
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled }">
    <div class="site-header-inner">
      <RouterLink to="/" class="brand" aria-label="AnniCal 기념일 도감 홈">
        <AnnicalMark class="brand-mark" />
        <span class="brand-wordmark">Anni<span>Cal</span></span>
      </RouterLink>
      <nav ref="navRef" class="header-nav" aria-label="주 메뉴">
        <span
          class="header-nav-indicator"
          :class="{ 'is-ready': indicatorReady }"
          :style="indicatorStyle"
          aria-hidden="true"
        />
        <RouterLink to="/" exact-active-class="is-active"><span>오늘의</span> <span>발견</span></RouterLink>
        <RouterLink to="/calendar" active-class="is-active"><span>기념일</span> <span>달력</span></RouterLink>
        <RouterLink to="/birthday" active-class="is-active"><span>내</span> <span>생일은?</span></RouterLink>
        <RouterLink to="/popular" active-class="is-active"><span>인기</span> <span>순위</span></RouterLink>
        <RouterLink to="/export" active-class="is-active"><span>캘린더</span> <span>연동 <span class="header-nav-arrow" aria-hidden="true">↗</span></span></RouterLink>
      </nav>
      <div class="header-today"><span class="live-dot" /><span>{{ todayLabel }}</span><span class="header-today-label">좋은 하루예요!</span></div>
    </div>
  </header>
</template>
