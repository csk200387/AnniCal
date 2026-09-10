<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { applyNotFoundMeta } from '@/seo/head'

const route = useRoute()

// 존재하지 않는 주소에 이전 페이지의 메타가 남지 않게 하고, 색인도 막는다.
// (Vercel 이 모든 경로를 index.html 로 rewrite 하므로 HTTP 상태는 200 이다.
//  실제 404 를 내려면 배포 계층에서 처리해야 한다 — vercel.json 참고)
onMounted(() => applyNotFoundMeta(route.fullPath))
</script>

<template>
  <div class="home-page">
    <div class="article-shell">
      <div class="home-empty">
        <span class="empty-flower" aria-hidden="true">✳</span>
        <h1>찾는 페이지가 없어요<span class="heading-dot">.</span></h1>
        <p>주소가 바뀌었거나 잘못 입력했을 수 있어요.<br />오늘의 기념일부터 다시 둘러보는 건 어때요?</p>
        <RouterLink to="/" class="home-button home-button--dark">오늘의 기념일 보기 <span aria-hidden="true">↗</span></RouterLink>
        <p class="notfound-alt"><RouterLink to="/calendar">달력에서 찾아보기 →</RouterLink></p>
      </div>
    </div>
  </div>
</template>
