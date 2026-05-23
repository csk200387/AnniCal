<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t hairline">
    <div class="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-5 py-10 text-center sm:px-8 lg:px-10">
      <span class="font-display text-base tracking-tight text-ink-700">
        기념일 만물상
      </span>
      <span class="eyebrow">Anniversarium · Est. {{ year }}</span>
      <p class="max-w-md text-xs leading-relaxed text-ink-400">
        매일의 작은 기념일을 큐레이션하는 디지털 저널.
        <br />
        세상이 기록한 하루의 이야기를 한 페이지로 전합니다.
      </p>
    </div>
  </footer>
</template>
