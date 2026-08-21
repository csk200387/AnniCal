<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useDateHub } from '../composables/useDayPages'
import { pathForId, shiftUrlDate, koreanUrlDate } from '@/utils/anniversaryRoutes'
import { primaryColorForTags } from '@/utils/tagPalette'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import { applyDateHubMeta, applyNotFoundMeta } from '@/seo/head'

const route = useRoute()
const urlDate = computed(() => String(route.params.date ?? ''))

const { anniversaries, label, isValid, state, error, retry } = useDateHub(urlDate)

/**
 * 앞뒤 날짜로 이동 — 허브끼리 이어 크롤러가 366개를 모두 타고 다니게 한다.
 *
 * 366일 고리를 그대로 걷는다. 예전에는 비윤년 2026을 기준으로 Date 산술을 해서
 * /day/02-29 가 내부적으로 03-01 로 normalize 되고, 다음 날이 03-02 가 됐다.
 */
const neighbours = computed(() => {
  if (!isValid.value) return null
  const at = (days: number) => {
    const p = shiftUrlDate(urlDate.value, days)
    return p ? { path: `/day/${p}`, label: koreanUrlDate(p) ?? p } : null
  }
  const prev = at(-1)
  const next = at(1)
  return prev && next ? { prev, next } : null
})

watch(
  [urlDate, anniversaries, state],
  () => {
    // 목록이 확정되기 전에 메타를 쓰면 "기념일 0개" 설명이 잠깐 나갔다 바뀐다.
    if (state.value === 'ready') applyDateHubMeta(urlDate.value, anniversaries.value)
    else if (state.value === 'not-found') applyNotFoundMeta(`/day/${urlDate.value}`)
  },
  { immediate: true },
)
</script>

<template>
  <div class="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6">
    <nav aria-label="위치" class="mb-6 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-400">
      <RouterLink to="/" class="transition-colors hover:text-ink-700">홈</RouterLink>
      <span aria-hidden="true">/</span>
      <span class="text-ink-600">{{ label }}</span>
    </nav>

    <p v-if="state === 'not-found'" class="py-16 text-center text-ink-500">
      올바르지 않은 날짜예요.
      <RouterLink to="/calendar" class="underline underline-offset-4">달력으로 가기</RouterLink>
    </p>

    <!-- 불러오기 실패를 "기념일이 없는 날"로 표시하면 안 된다. -->
    <div v-else-if="state === 'error'" class="py-16 text-center">
      <p class="text-ink-500">기념일을 불러오지 못했어요.</p>
      <p v-if="error" class="mt-1 text-[0.8rem] text-ink-400">{{ error }}</p>
      <button
        type="button"
        class="mt-4 border border-ink-800 px-5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-800 transition hover:bg-paper-200"
        @click="retry"
      >
        다시 시도
      </button>
    </div>

    <template v-else>
      <header>
        <h1 class="font-display text-[2.2rem] font-medium leading-[1.12] tracking-tight text-ink-900 sm:text-[2.7rem]">
          {{ label }}은 무슨 날?
        </h1>
        <p class="mt-3 text-[0.95rem] leading-relaxed text-ink-500">
          <template v-if="state === 'loading'">불러오는 중…</template>
          <template v-else-if="anniversaries.length">
            {{ label }}에 있는 기념일 {{ anniversaries.length }}개를 모았어요.
          </template>
          <template v-else>{{ label }}에 등록된 기념일이 아직 없어요.</template>
        </p>
      </header>

      <ul v-if="anniversaries.length" class="mt-8 divide-y divide-rule border-y hairline">
        <li v-for="a in anniversaries" :key="a.id">
          <RouterLink :to="pathForId(a.id) ?? '/'" class="group block py-5">
            <div class="flex items-center gap-3">
              <span
                class="h-1.5 w-1.5 shrink-0 rounded-full"
                :class="primaryColorForTags(a.tags).dot"
                aria-hidden="true"
              />
              <CategoryBadge :category-id="a.category" />
            </div>
            <h2 class="mt-2 font-display text-[1.35rem] font-medium leading-snug text-ink-900 transition-colors group-hover:text-accent-600">
              {{ a.name }}
            </h2>
            <p v-if="a.storytelling.origin?.trim()" class="mt-1.5 line-clamp-2 text-[0.9rem] leading-relaxed text-ink-500">
              {{ a.storytelling.origin }}
            </p>
          </RouterLink>
        </li>
      </ul>

      <nav v-if="neighbours" aria-label="다른 날짜" class="mt-12 flex items-center justify-between border-t hairline pt-6 text-[0.85rem]">
        <RouterLink :to="neighbours.prev.path" class="text-ink-500 transition-colors hover:text-ink-800">
          ← {{ neighbours.prev.label }}
        </RouterLink>
        <RouterLink to="/calendar" class="eyebrow !text-[0.62rem] transition-colors hover:text-ink-800">
          달력 전체
        </RouterLink>
        <RouterLink :to="neighbours.next.path" class="text-ink-500 transition-colors hover:text-ink-800">
          {{ neighbours.next.label }} →
        </RouterLink>
      </nav>
    </template>
  </div>
</template>
