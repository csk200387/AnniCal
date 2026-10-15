<script setup lang="ts">
import '@/assets/article.css'
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useDayDetail } from '../composables/useDayPages'
import { datePath, koreanUrlDate, pathForId } from '@/utils/anniversaryRoutes'
import { EXTERNAL_LINK_REL, isExternalUrl, sourceHost } from '@/utils/sourceUrl'
import { countFormat, displayName } from '@/utils/format'
import { useAnniversariesStore } from '@/stores/anniversaries'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import { applyAnniversaryMeta, applyNotFoundMeta } from '@/seo/head'
import { useShareStore } from '@/stores/share'
import { useStatsStore } from '@/stores/stats'

import PageHero from '@/components/ui/PageHero.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import PromoCard from '@/components/ui/PromoCard.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import UiChip from '@/components/ui/UiChip.vue'
import ListGroup from '@/components/ui/ListGroup.vue'
import ListRow from '@/components/ui/ListRow.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'

const FeedbackModal = defineAsyncComponent(() => import('@/features/feedback/components/FeedbackModal.vue'))

const route = useRoute()
const urlDate = computed(() => String(route.params.date ?? ''))
const slug = computed(() => String(route.params.slug ?? ''))

const {
  anniversary,
  sameDay,
  related,
  actualUrlDate,
  actualDateLabel,
  dateDrifts,
  state,
  error,
  retry,
} = useDayDetail(urlDate, slug)
const shareStore = useShareStore()
const statsStore = useStatsStore()
const store = useAnniversariesStore()
const feedbackOpen = ref(false)
const detailStats = computed(() => {
  const id = anniversary.value?.id
  return id ? statsStore.detailById[id] ?? null : null
})

// 검색으로 이 페이지에 바로 들어온 사람에게도 공유 수단이 필요하다.
// 모달은 AppShell 에 상시 떠 있으므로 스토어만 열어 주면 된다.
function openShare() {
  if (anniversary.value) shareStore.open(anniversary.value)
}

/**
 * 화면에 쓰는 날짜는 URL 의 고정 날짜가 아니라 올해 실제 발생일이다.
 * URL 은 색인을 지키려고 2026년 발생일로 못박혀 있어서, 그대로 쓰면 2027년에
 * 어머니의 날이 "5월 10일"로 뜬다(실제 5월 9일).
 */
const dateLabel = computed(
  () => actualDateLabel.value ?? koreanUrlDate(urlDate.value) ?? urlDate.value,
)
/** 빵부스러기·하단 링크가 가리킬 허브 — 실제 날짜 쪽으로 보낸다. */
const hubDate = computed(() => actualUrlDate.value ?? urlDate.value)

// 기념일이 확정되면 title·description·OG·JSON-LD 를 그 기념일에 맞게 갱신.
// canonical 은 URL 에 박힌 주소를 그대로 쓰고(색인 유지), 문구에 들어가는 날짜만
// 실제 발생일을 쓴다.
watch(
  [anniversary, hubDate, state],
  ([a]) => {
    if (a) {
      applyAnniversaryMeta(a, `/day/${urlDate.value}/${slug.value}`, hubDate.value)
    } else if (state.value === 'not-found') {
      // 이전 상세 페이지의 title·canonical·OG·JSON-LD 가 남지 않게 되돌린다.
      applyNotFoundMeta(`/day/${urlDate.value}/${slug.value}`)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="home-page detail-page">
    <div class="article-shell tool-container">
      <nav aria-label="위치" class="crumbs"><RouterLink to="/">홈</RouterLink><span aria-hidden="true">/</span><RouterLink :to="datePath(hubDate)">{{ dateLabel }}</RouterLink></nav>
      <ResultState v-if="state === 'not-found'" title="찾을 수 없는 기념일이에요" asset="✳" large :level="1"><template #actions><UiButton to="/calendar" icon="next">달력에서 찾아보기</UiButton></template></ResultState>
      <ResultState v-else-if="state === 'error'" tone="error" title="기념일을 불러오지 못했어요" :description="error ?? undefined"><template #actions><UiButton icon="retry" @click="retry">다시 시도</UiButton></template></ResultState>
      <SkeletonRows v-else-if="state === 'loading'" :rows="3" label="기념일을 불러오는 중이에요" />
      <article v-else-if="anniversary">
        <PageHero variant="compact" title-id="detail-title" :title="anniversary.name">
          <template #topline><div class="article-meta"><i class="category-dot" :data-color="store.categoryById.get(anniversary.category)?.colorToken" aria-hidden="true" /><CategoryBadge :category-id="anniversary.category" /><span class="meta-divider" aria-hidden="true" /><span>{{ dateLabel }}</span></div></template>
          <p v-if="dateDrifts" class="article-drift">매년 날짜가 바뀌는 기념일이에요. <strong>올해는 {{ actualDateLabel }}</strong>입니다.</p>
          <template v-if="detailStats" #footer><div class="article-stats" aria-label="기념일 관심도 통계"><span>누적 <strong>{{ countFormat.format(detailStats.views) }}</strong>회 읽음</span><span v-if="detailStats.rank">누적 관심도 <strong class="heading-dot">{{ countFormat.format(detailStats.rank) }}위</strong></span></div></template>
        </PageHero>
        <div class="article-layout tool-section">
          <div class="article-body">
            <section v-if="anniversary.storytelling.origin?.trim()" aria-labelledby="origin-title"><SectionHeader kicker="ORIGIN" title="유래" title-id="origin-title" /><p>{{ anniversary.storytelling.origin }}</p></section>
            <section v-if="anniversary.storytelling.anecdote?.trim()" aria-labelledby="anecdote-title"><SectionHeader kicker="A LITTLE MORE TO KNOW" title="이야깃거리" title-id="anecdote-title" /><p>{{ anniversary.storytelling.anecdote }}</p></section>
            <section v-if="anniversary.memes.length" class="article-quotes" aria-label="이날에 어울리는 한마디"><blockquote v-for="(meme, idx) in anniversary.memes" :key="idx">&ldquo;{{ meme.caption }}&rdquo;</blockquote></section>
            <ChipGroup v-if="anniversary.tags.length" class="article-tags" label="이야기의 주제"><UiChip v-for="tag in anniversary.tags" :key="tag" static>{{ tag }}</UiChip></ChipGroup>
            <p v-if="isExternalUrl(anniversary.sourceUrl)" class="article-source">출처 <a :href="anniversary.sourceUrl!" target="_blank" :rel="EXTERNAL_LINK_REL">{{ sourceHost(anniversary.sourceUrl) }}</a></p>
          </div>
          <aside class="article-aside" aria-label="이야기 공유와 다음 발견">
            <section class="article-actions" aria-labelledby="article-actions-title"><h2 id="article-actions-title">이 이야기를 함께 나눠요<span class="heading-dot">.</span></h2><UiButton variant="brand" block icon="arrow" @click="openShare">공유하기</UiButton><UiButton variant="outline" block @click="feedbackOpen = true">정보 요청 <span aria-hidden="true">✎</span></UiButton></section>
            <PromoCard kicker="YOUR DAY, YOUR STORY" title="이 날이 생일이라면?" :description="`${dateLabel}에 담긴 이야기를 생일 카드로 남겨보세요.`" :to="`/birthday?date=${hubDate}`" cta="내 생일의 이야기 보기" />
            <section v-if="sameDay.length" class="article-section" aria-labelledby="same-day-title"><SectionHeader :level="3" :title="`${dateLabel}의 다른 기념일`" title-id="same-day-title" /><ListGroup as="ul" label="같은 날의 다른 기념일"><li v-for="a in sameDay" :key="a.id"><ListRow :to="pathForId(a.id) ?? '/'"><template #title>{{ displayName(a.name) }}</template><template #suffix><span aria-hidden="true">→</span></template></ListRow></li></ListGroup></section>
            <section v-if="related.length" class="article-section" aria-labelledby="related-title"><SectionHeader :level="3" title="비슷한 주제의 기념일" title-id="related-title" /><ChipGroup label="비슷한 주제의 기념일"><UiChip v-for="a in related" :key="a.id" :to="pathForId(a.id) ?? '/'">{{ displayName(a.name) }}</UiChip></ChipGroup></section>
          </aside>
        </div>
        <div class="article-foot"><UiButton :to="datePath(hubDate)" variant="ghost" icon="arrow">{{ dateLabel }}은 무슨 날인지 전부 보기</UiButton></div>
      </article>
    </div>
    <FeedbackModal v-if="feedbackOpen && anniversary" :anniversary="anniversary" @close="feedbackOpen = false" />
  </div>
</template>
