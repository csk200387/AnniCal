<script setup lang="ts">
import '@/assets/article.css'
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useDateHub } from '../composables/useDayPages'
import { shiftUrlDate, koreanUrlDate } from '@/utils/anniversaryRoutes'
import { applyDateHubMeta, applyNotFoundMeta } from '@/seo/head'

import PageHero from '@/components/ui/PageHero.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import PromoCard from '@/components/ui/PromoCard.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'
import TodayStoryCard from '@/features/feed/components/TodayStoryCard.vue'
import { useShareStore } from '@/stores/share'
import '@/assets/feed.css'
const shareStore = useShareStore()
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
  <div class="home-page hub-page">
    <div class="article-shell tool-container">
      <nav aria-label="위치" class="crumbs">
        <RouterLink to="/">홈</RouterLink><span aria-hidden="true">/</span><span>{{ label }}</span>
      </nav>
      <ResultState
        v-if="state === 'not-found'"
        title="올바르지 않은 날짜예요"
        asset="✳"
        large
        :level="1"
        ><template #actions
          ><UiButton to="/calendar" icon="next">달력으로 가기</UiButton></template
        ></ResultState
      >
      <ResultState
        v-else-if="state === 'error'"
        tone="error"
        title="기념일을 불러오지 못했어요"
        :description="error ?? undefined"
        ><template #actions
          ><UiButton icon="retry" @click="retry">다시 시도</UiButton></template
        ></ResultState
      >
      <template v-else>
        <PageHero
          variant="compact"
          kicker="DATE HUB"
          title-id="hub-title"
          :description="
            state === 'loading'
              ? '불러오는 중…'
              : anniversaries.length
                ? `${label}에 있는 기념일 ${anniversaries.length}개를 모았어요.`
                : `${label}에 등록된 기념일이 아직 없어요.`
          "
        >
          <template #title>{{ label }}은<br />무슨 날<span class="heading-dot">?</span></template>
          <template #footer
            ><nav v-if="neighbours" aria-label="다른 날짜" class="hub-nav">
              <UiButton
                variant="ghost"
                size="s"
                :to="neighbours.prev.path"
                :aria-label="`이전 날짜 · ${neighbours.prev.label}`"
                >← {{ neighbours.prev.label }}</UiButton
              ><UiButton variant="outline" size="s" to="/calendar">달력 전체</UiButton
              ><UiButton
                variant="ghost"
                size="s"
                :to="neighbours.next.path"
                :aria-label="`다음 날짜 · ${neighbours.next.label}`"
                >{{ neighbours.next.label }} →</UiButton
              >
            </nav></template
          >
        </PageHero>
        <section
          class="tool-section"
          aria-labelledby="hub-stories-title"
          :aria-busy="state === 'loading'"
        >
          <SectionHeader
            kicker="STORIES FOR THIS DAY"
            title="이날에 담긴 이야기"
            title-id="hub-stories-title"
          />
          <SkeletonRows
            v-if="state === 'loading'"
            :rows="3"
            variant="card"
            label="이날의 기념일을 불러오는 중이에요"
          />
          <div v-else-if="anniversaries.length" class="story-grid hub-story-grid">
            <TodayStoryCard
              v-for="(a, index) in anniversaries"
              :key="a.id"
              :anniversary="a"
              :index="index"
              :date-label="label"
              selection-label="이날의 첫 이야기"
              @share="shareStore.open($event)"
            />
          </div>
          <ResultState
            v-else
            title="이날의 이야기를 기다리고 있어요"
            description="새로운 이야기도 차근차근 채워갈게요."
          />
        </section>
        <div class="tool-cross-links">
          <PromoCard
            kicker="YOUR DAY, YOUR STORY"
            title="이 날이 생일이라면?"
            :description="`${label}에 담긴 이야기를 생일 카드로 남겨보세요.`"
            :to="`/birthday?date=${urlDate}`"
            cta="내 생일의 이야기 보기"
          />
        </div>
      </template>
    </div>
  </div>
</template>
