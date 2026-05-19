<script setup lang="ts">
import { useTodayFeed } from '../composables/useTodayFeed'
import AnniversaryCard from '@/components/card/AnniversaryCard.vue'
import type { Anniversary } from '@/types/anniversary'

const { todays, upcoming, isLoading, error } = useTodayFeed(30)

function handleShare(anv: Anniversary) {
  // TODO: features/share 모듈에 위임 예정
  console.log('share', anv.id)
}
</script>

<template>
  <div class="space-y-8">
    <section>
      <header class="mb-3 flex items-baseline justify-between">
        <h1 class="text-2xl font-extrabold tracking-tight text-neutral-900">
          오늘의 기념일
        </h1>
      </header>

      <p v-if="isLoading" class="text-sm text-neutral-500">불러오는 중…</p>
      <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>

      <template v-else>
        <div v-if="todays.length" class="space-y-4">
          <AnniversaryCard
            v-for="a in todays"
            :key="a.id"
            :anniversary="a"
            @share="handleShare"
          />
        </div>
        <div
          v-else
          class="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center"
        >
          <p class="text-sm text-neutral-500">
            오늘은 등록된 기념일이 없어요.<br />다가오는 기념일을 둘러보세요.
          </p>
        </div>
      </template>
    </section>

    <section v-if="upcoming.length">
      <h2 class="mb-3 text-lg font-bold text-neutral-900">다가오는 기념일</h2>
      <div class="space-y-4">
        <AnniversaryCard
          v-for="{ anniversary, dDay } in upcoming"
          :key="anniversary.id"
          :anniversary="anniversary"
          :d-day="dDay"
          @share="handleShare"
        />
      </div>
    </section>
  </div>
</template>
