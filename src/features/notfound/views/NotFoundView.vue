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
  <div class="mx-auto w-full max-w-2xl px-5 py-24 text-center sm:px-6">
    <p class="eyebrow">404</p>
    <h1 class="mt-4 font-display text-[2.2rem] font-medium leading-[1.12] tracking-tight text-ink-900">
      찾는 페이지가 없어요
    </h1>
    <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-500">
      주소가 바뀌었거나 잘못 입력했을 수 있어요.
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.85rem]">
      <RouterLink to="/" class="underline underline-offset-4 hover:text-ink-800">
        오늘의 기념일
      </RouterLink>
      <RouterLink to="/calendar" class="underline underline-offset-4 hover:text-ink-800">
        달력에서 찾아보기
      </RouterLink>
    </div>
  </div>
</template>
