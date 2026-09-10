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
  <div class="home-page">
    <div class="article-shell">
      <nav aria-label="위치" class="crumbs">
        <RouterLink to="/">홈</RouterLink>
        <span aria-hidden="true">/</span>
        <span>{{ label }}</span>
      </nav>

      <p v-if="state === 'not-found'" class="page-state">
        올바르지 않은 날짜예요.
        <RouterLink to="/calendar">달력으로 가기</RouterLink>
      </p>

      <!-- 불러오기 실패를 "기념일이 없는 날"로 표시하면 안 된다. -->
      <div v-else-if="state === 'error'" class="page-state">
        <p>기념일을 불러오지 못했어요.</p>
        <p v-if="error">{{ error }}</p>
        <button type="button" class="home-button home-button--dark" @click="retry">다시 시도 <span aria-hidden="true">↻</span></button>
      </div>

      <template v-else>
        <header class="article-hero">
          <p class="section-kicker"><span /> DATE HUB</p>
          <h1>{{ label }}은<br />무슨 날<span class="heading-dot">?</span></h1>
          <p class="article-drift">
            <template v-if="state === 'loading'">불러오는 중…</template>
            <template v-else-if="anniversaries.length">
              {{ label }}에 있는 기념일 {{ anniversaries.length }}개를 모았어요.
            </template>
            <template v-else>{{ label }}에 등록된 기념일이 아직 없어요.</template>
          </p>
        </header>

        <ul v-if="anniversaries.length" class="hub-list article-section">
          <li v-for="a in anniversaries" :key="a.id">
            <RouterLink :to="pathForId(a.id) ?? '/'">
              <div class="hub-list-meta">
                <i :class="primaryColorForTags(a.tags).dot" aria-hidden="true" />
                <CategoryBadge :category-id="a.category" />
              </div>
              <h2>{{ a.name }}</h2>
              <p v-if="a.storytelling.origin?.trim()">{{ a.storytelling.origin }}</p>
            </RouterLink>
          </li>
        </ul>

        <nav v-if="neighbours" aria-label="다른 날짜" class="hub-nav">
          <RouterLink :to="neighbours.prev.path">← {{ neighbours.prev.label }}</RouterLink>
          <RouterLink to="/calendar" class="hub-nav-all">달력 전체</RouterLink>
          <RouterLink :to="neighbours.next.path">{{ neighbours.next.label }} →</RouterLink>
        </nav>
      </template>
    </div>
  </div>
</template>
