<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="sticky top-0 z-10 border-b border-neutral-200 bg-white/80 backdrop-blur">
    <div class="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
      <RouterLink to="/" class="flex items-center gap-2">
        <span class="text-2xl">🗓️</span>
        <span class="text-lg font-bold tracking-tight text-neutral-900">기념일 만물상</span>
      </RouterLink>
      <nav class="flex items-center gap-1 text-sm font-medium">
        <RouterLink
          to="/"
          class="rounded-full px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          active-class="bg-brand-100 text-brand-700 hover:bg-brand-100 hover:text-brand-700"
        >
          오늘
        </RouterLink>
        <RouterLink
          to="/calendar"
          class="rounded-full px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          active-class="bg-brand-100 text-brand-700 hover:bg-brand-100 hover:text-brand-700"
        >
          달력
        </RouterLink>
        <RouterLink
          to="/export"
          class="rounded-full px-3 py-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
          active-class="bg-brand-100 text-brand-700 hover:bg-brand-100 hover:text-brand-700"
        >
          캘린더 연동
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
