<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useDayDetail, formatUrlDate } from '../composables/useDayPages'
import { datePath, pathForId } from '@/utils/anniversaryRoutes'
import { EXTERNAL_LINK_REL, isExternalUrl, sourceHost } from '@/utils/sourceUrl'
import { primaryColorForTags } from '@/utils/tagPalette'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import { applyAnniversaryMeta, applyNotFoundMeta } from '@/seo/head'
import { useShareStore } from '@/stores/share'
import { useStatsStore } from '@/stores/stats'

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
const number = new Intl.NumberFormat('ko-KR')
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
  () => actualDateLabel.value ?? formatUrlDate(urlDate.value),
)
/** 빵부스러기·하단 링크가 가리킬 허브 — 실제 날짜 쪽으로 보낸다. */
const hubDate = computed(() => actualUrlDate.value ?? urlDate.value)

const accentDot = computed(() =>
  anniversary.value ? primaryColorForTags(anniversary.value.tags).dot : '',
)

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
  <div class="home-page">
    <div class="article-shell">
      <!-- 빵부스러기: 날짜 허브로 올라가는 내부 링크 -->
      <nav aria-label="위치" class="crumbs">
        <RouterLink to="/">홈</RouterLink>
        <span aria-hidden="true">/</span>
        <RouterLink :to="datePath(hubDate)">{{ dateLabel }}</RouterLink>
      </nav>

      <p v-if="state === 'not-found'" class="page-state">
        찾을 수 없는 기념일이에요.
        <RouterLink to="/calendar">달력에서 찾아보기</RouterLink>
      </p>

      <!-- 데이터를 못 받아온 것과 기념일이 없는 것은 다르다. 재시도할 수 있게 한다. -->
      <div v-else-if="state === 'error'" class="page-state">
        <p>기념일을 불러오지 못했어요.</p>
        <p v-if="error">{{ error }}</p>
        <button type="button" class="home-button home-button--dark" @click="retry">다시 시도 <span aria-hidden="true">↻</span></button>
      </div>

      <!-- 로딩 중에는 아무것도 그리지 않는다. 프리렌더된 정적 본문을 지우고
           빈 화면이나 "찾을 수 없음"을 잠깐 보여주면 크롤러가 그걸 볼 수 있다. -->
      <p v-else-if="state === 'loading'" class="page-state">불러오는 중…</p>

      <!-- prerender 테스트가 여는 태그를 문자열로 확인한다 — 속성을 붙이지 말 것. -->
      <article v-else-if="anniversary">
        <header class="article-hero">
          <div class="article-meta">
            <i :class="accentDot" aria-hidden="true" />
            <CategoryBadge :category-id="anniversary.category" />
            <span class="meta-divider" aria-hidden="true" />
            <span>{{ dateLabel }}</span>
          </div>

          <h1>{{ anniversary.name }}</h1>

          <!-- 'N번째 O요일'·음력처럼 매년 날짜가 움직이는 기념일 안내 -->
          <p v-if="dateDrifts" class="article-drift">
            매년 날짜가 바뀌는 기념일이에요. <strong>올해는 {{ actualDateLabel }}</strong>입니다.
          </p>

          <div v-if="detailStats" class="article-stats" aria-label="기념일 관심도 통계">
            <span>누적 <strong>{{ number.format(detailStats.views) }}</strong>회 읽음</span>
            <span v-if="detailStats.rank" class="meta-divider" aria-hidden="true" />
            <span v-if="detailStats.rank">누적 관심도 <strong class="accent">{{ number.format(detailStats.rank) }}위</strong></span>
          </div>
        </header>

        <section class="article-body">
          <div v-if="anniversary.storytelling.origin?.trim()">
            <h2>유래</h2>
            <p>{{ anniversary.storytelling.origin }}</p>
          </div>
          <div v-if="anniversary.storytelling.anecdote?.trim()">
            <h2>이야깃거리</h2>
            <p>{{ anniversary.storytelling.anecdote }}</p>
          </div>
        </section>

        <section v-if="anniversary.memes.length" class="article-quotes">
          <blockquote v-for="(meme, idx) in anniversary.memes" :key="idx">&ldquo;{{ meme.caption }}&rdquo;</blockquote>
        </section>

        <ul v-if="anniversary.tags.length" class="article-tags">
          <li v-for="tag in anniversary.tags" :key="tag">{{ tag }}</li>
        </ul>

        <p v-if="isExternalUrl(anniversary.sourceUrl)" class="article-source">
          출처
          <a :href="anniversary.sourceUrl!" target="_blank" :rel="EXTERNAL_LINK_REL">{{ sourceHost(anniversary.sourceUrl) }}</a>
        </p>

        <div class="article-share">
          <button type="button" class="home-button home-button--dark" @click="openShare">공유하기 <span aria-hidden="true">↗</span></button>
          <button type="button" class="article-feedback-button" @click="feedbackOpen = true">정보 요청 <span aria-hidden="true">✎</span></button>
        </div>
      </article>

      <!-- 같은 날의 다른 기념일 — 날짜 허브와 상세를 잇는 내부 링크 -->
      <section v-if="sameDay.length" class="article-section">
        <h2>{{ dateLabel }}의 다른 기념일</h2>
        <ul class="article-list">
          <li v-for="a in sameDay" :key="a.id">
            <RouterLink :to="pathForId(a.id) ?? '/'">{{ a.name }}<span aria-hidden="true">→</span></RouterLink>
          </li>
        </ul>
      </section>

      <section v-if="related.length" class="article-section">
        <h2>비슷한 주제의 기념일</h2>
        <div class="article-related">
          <RouterLink v-for="a in related" :key="a.id" :to="pathForId(a.id) ?? '/'">{{ a.name }}</RouterLink>
        </div>
      </section>

      <div v-if="anniversary" class="article-foot">
        <RouterLink :to="datePath(hubDate)">{{ dateLabel }}은 무슨 날인지 전부 보기 <span aria-hidden="true">↗</span></RouterLink>
      </div>
    </div>
    <FeedbackModal v-if="feedbackOpen && anniversary" :anniversary="anniversary" @close="feedbackOpen = false" />
  </div>
</template>
