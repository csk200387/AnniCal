<script setup lang="ts">
import '@/assets/article.css'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { applyNotFoundMeta } from '@/seo/head'

import ResultState from '@/components/ui/ResultState.vue'
import UiButton from '@/components/ui/UiButton.vue'
const route = useRoute()

// 존재하지 않는 주소에 이전 페이지의 메타가 남지 않게 하고, 색인도 막는다.
// (Vercel 이 모든 경로를 index.html 로 rewrite 하므로 HTTP 상태는 200 이다.
//  실제 404 를 내려면 배포 계층에서 처리해야 한다 — vercel.json 참고)
onMounted(() => applyNotFoundMeta(route.fullPath))
</script>

<template>
  <div class="home-page"><div class="article-shell tool-container">
    <ResultState large :level="1" asset="✳" title="찾는 페이지가 없어요" description="주소가 바뀌었거나 잘못 입력했을 수 있어요. 오늘의 기념일부터 다시 둘러보는 건 어때요?">
      <template #actions><UiButton to="/" icon="arrow">오늘의 기념일 보기</UiButton><UiButton to="/calendar" variant="outline" icon="next">달력에서 찾아보기</UiButton></template>
    </ResultState>
  </div></div>
</template>
