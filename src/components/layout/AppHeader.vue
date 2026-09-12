<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import dayjs from 'dayjs'
import AnnicalMark from '@/components/common/AnnicalMark.vue'
import { useNow } from '@/composables/useNow'

const { today } = useNow()
const todayLabel = computed(() => dayjs(today.value).format('YYYY.MM.DD'))
const scrolled = ref(false)
function updateScroll() { scrolled.value = window.scrollY > 32 }
onMounted(() => {
  updateScroll()
  window.addEventListener('scroll', updateScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', updateScroll))
</script>

<template>
  <header class="site-header" :class="{ 'is-scrolled': scrolled }">
    <div class="site-header-inner">
      <RouterLink to="/" class="brand" aria-label="AnniCal 기념일 만물상 홈">
        <AnnicalMark class="brand-mark" />
        <span class="brand-wordmark">Anni<span>Cal</span></span>
      </RouterLink>
      <nav class="header-nav" aria-label="주 메뉴">
        <RouterLink to="/" exact-active-class="is-active">오늘의 발견</RouterLink>
        <RouterLink to="/calendar" active-class="is-active">기념일 달력</RouterLink>
        <RouterLink to="/popular" active-class="is-active">인기 순위</RouterLink>
        <RouterLink to="/export" active-class="is-active">캘린더 연동 <span aria-hidden="true">↗</span></RouterLink>
      </nav>
      <div class="header-today"><span class="live-dot" /><span>{{ todayLabel }}</span><span class="header-today-label">좋은 하루예요!</span></div>
    </div>
  </header>
</template>
