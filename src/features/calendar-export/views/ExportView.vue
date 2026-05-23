<script setup lang="ts">
// TODO: 다음 단계에서 카테고리 선택 + .ics 다운로드 / 구독 링크 생성 구현
</script>

<template>
  <div class="space-y-12">
    <header>
      <div class="flex items-center gap-3">
        <span class="h-px w-10 bg-ink-700" />
        <span class="eyebrow">Subscribe</span>
      </div>
      <h1 class="mt-5 font-display text-[2.6rem] font-medium leading-none tracking-[-0.02em] text-ink-900 sm:text-[3rem]">
        캘린더 연동
      </h1>
      <div class="mt-5 border-b hairline pb-4">
        <p class="font-display text-base italic text-ink-500">
          관심 있는 기념일을 당신의 캘린더로 가져오세요.
        </p>
      </div>
    </header>

    <section class="grid gap-8 sm:grid-cols-2">
      <article class="border hairline bg-paper-50 p-7">
        <span class="eyebrow">.ics Download</span>
        <h2 class="mt-3 font-display text-2xl tracking-tight text-ink-900">
          한 번에 내려받기
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-ink-500">
          선택한 카테고리의 기념일을 표준 .ics 파일로 받아 Google Calendar,
          Apple Calendar 등 어디서든 가져올 수 있어요.
        </p>
        <p class="mt-6 inline-flex items-center gap-2 border-b border-ink-300 pb-0.5 text-[0.72rem] uppercase tracking-[0.2em] text-ink-400">
          Coming soon
        </p>
      </article>

      <article class="border hairline bg-paper-50 p-7">
        <span class="eyebrow">Subscription Link</span>
        <h2 class="mt-3 font-display text-2xl tracking-tight text-ink-900">
          구독 링크 만들기
        </h2>
        <p class="mt-3 text-sm leading-relaxed text-ink-500">
          살아있는 URL로 구독하면 새 기념일이 추가될 때마다 캘린더가
          자동으로 업데이트됩니다.
        </p>
        <p class="mt-6 inline-flex items-center gap-2 border-b border-ink-300 pb-0.5 text-[0.72rem] uppercase tracking-[0.2em] text-ink-400">
          Coming soon
        </p>
      </article>
    </section>

    <aside class="border-y hairline bg-paper-50 px-6 py-10 text-center">
      <span class="eyebrow">Note</span>
      <p class="mt-3 font-display text-lg italic text-ink-500">
        다음 작업 단계에서 구현 예정입니다.
      </p>
    </aside>
  </div>
</template>
