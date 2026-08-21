<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useDayDetail, formatUrlDate } from '../composables/useDayPages'
import { datePath, pathForId } from '@/utils/anniversaryRoutes'
import { EXTERNAL_LINK_REL, isExternalUrl, sourceHost } from '@/utils/sourceUrl'
import { primaryColorForTags } from '@/utils/tagPalette'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import { applyAnniversaryMeta, applyNotFoundMeta } from '@/seo/head'
import { useShareStore } from '@/stores/share'

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
  <div class="mx-auto w-full max-w-2xl px-5 py-10 sm:px-6">
    <!-- 빵부스러기: 날짜 허브로 올라가는 내부 링크 -->
    <nav aria-label="위치" class="mb-6 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.18em] text-ink-400">
      <RouterLink to="/" class="transition-colors hover:text-ink-700">홈</RouterLink>
      <span aria-hidden="true">/</span>
      <RouterLink :to="datePath(hubDate)" class="transition-colors hover:text-ink-700">
        {{ dateLabel }}
      </RouterLink>
    </nav>

    <p v-if="state === 'not-found'" class="py-16 text-center text-ink-500">
      찾을 수 없는 기념일이에요.
      <RouterLink to="/calendar" class="underline underline-offset-4">달력에서 찾아보기</RouterLink>
    </p>

    <!-- 데이터를 못 받아온 것과 기념일이 없는 것은 다르다. 재시도할 수 있게 한다. -->
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

    <!-- 로딩 중에는 아무것도 그리지 않는다. 프리렌더된 정적 본문을 지우고
         빈 화면이나 "찾을 수 없음"을 잠깐 보여주면 크롤러가 그걸 볼 수 있다. -->
    <p v-else-if="state === 'loading'" class="py-16 text-center text-ink-400">
      불러오는 중…
    </p>

    <article v-else-if="anniversary">
      <header>
        <div class="flex items-center gap-3">
          <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="accentDot" aria-hidden="true" />
          <CategoryBadge :category-id="anniversary.category" />
          <span class="h-3 w-px bg-rule-strong" aria-hidden="true" />
          <span class="font-display text-[0.82rem] tracking-wide text-ink-500">{{ dateLabel }}</span>
        </div>

        <h1 class="mt-4 font-display text-[2.2rem] font-medium leading-[1.12] tracking-tight text-ink-900 sm:text-[2.7rem]">
          {{ anniversary.name }}
        </h1>

        <!-- 'N번째 O요일'·음력처럼 매년 날짜가 움직이는 기념일 안내 -->
        <p v-if="dateDrifts" class="mt-3 text-[0.85rem] text-ink-500">
          매년 날짜가 바뀌는 기념일이에요. <strong class="text-ink-700">올해는 {{ actualDateLabel }}</strong>입니다.
        </p>
      </header>

      <div class="mt-6 flex items-center gap-3">
        <span class="h-px flex-1 bg-rule" />
        <span class="eyebrow !text-[0.6rem]">Story</span>
        <span class="h-px flex-1 bg-rule" />
      </div>

      <section class="mt-6 space-y-6 text-[1rem] leading-[1.8] text-ink-700">
        <div v-if="anniversary.storytelling.origin?.trim()">
          <h2 class="eyebrow mb-2">유래</h2>
          <p>{{ anniversary.storytelling.origin }}</p>
        </div>
        <div v-if="anniversary.storytelling.anecdote?.trim()">
          <h2 class="eyebrow mb-2">이야깃거리</h2>
          <p>{{ anniversary.storytelling.anecdote }}</p>
        </div>
      </section>

      <section v-if="anniversary.memes.length" class="mt-8 space-y-2 border-l border-ink-200 pl-5">
        <blockquote
          v-for="(meme, idx) in anniversary.memes"
          :key="idx"
          class="font-display text-[1rem] italic leading-snug text-ink-500"
        >
          &ldquo;{{ meme.caption }}&rdquo;
        </blockquote>
      </section>

      <ul
        v-if="anniversary.tags.length"
        class="mt-8 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[0.7rem] uppercase tracking-[0.18em] text-ink-400"
      >
        <li v-for="tag in anniversary.tags" :key="tag" class="flex items-center gap-1.5">
          <span class="h-px w-3 bg-ink-300" aria-hidden="true" />
          <span>{{ tag }}</span>
        </li>
      </ul>

      <p v-if="isExternalUrl(anniversary.sourceUrl)" class="mt-8 border-t hairline pt-4 text-[0.75rem] text-ink-400">
        출처
        <a
          :href="anniversary.sourceUrl!"
          target="_blank"
          :rel="EXTERNAL_LINK_REL"
          class="underline underline-offset-4 transition-colors hover:text-ink-700"
        >{{ sourceHost(anniversary.sourceUrl) }}</a>
      </p>

      <div class="mt-8 flex justify-start border-t hairline pt-6">
        <button
          type="button"
          class="group/share inline-flex items-center gap-2 border border-ink-800 bg-paper-50 px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-ink-800 transition hover:bg-paper-200"
          @click="openShare"
        >
          <span>Share</span>
          <span class="font-display normal-case tracking-normal text-[0.85rem]">공유하기</span>
          <span class="transition-transform group-hover/share:translate-x-0.5" aria-hidden="true">→</span>
        </button>
      </div>
    </article>

    <!-- 같은 날의 다른 기념일 — 날짜 허브와 상세를 잇는 내부 링크 -->
    <section v-if="sameDay.length" class="mt-14">
      <h2 class="eyebrow mb-4">{{ dateLabel }}의 다른 기념일</h2>
      <ul class="divide-y divide-rule border-y hairline">
        <li v-for="a in sameDay" :key="a.id">
          <RouterLink
            :to="pathForId(a.id) ?? '/'"
            class="flex items-center justify-between gap-4 py-3 transition-colors hover:text-accent-600"
          >
            <span class="font-display text-[1.02rem] text-ink-800">{{ a.name }}</span>
            <span aria-hidden="true" class="text-ink-300">→</span>
          </RouterLink>
        </li>
      </ul>
    </section>

    <section v-if="related.length" class="mt-12">
      <h2 class="eyebrow mb-4">비슷한 주제의 기념일</h2>
      <ul class="flex flex-wrap gap-x-5 gap-y-2">
        <li v-for="a in related" :key="a.id">
          <RouterLink
            :to="pathForId(a.id) ?? '/'"
            class="text-[0.9rem] text-ink-600 underline decoration-rule-strong underline-offset-4 transition-colors hover:text-accent-600"
          >{{ a.name }}</RouterLink>
        </li>
      </ul>
    </section>

    <p v-if="anniversary" class="mt-14 border-t hairline pt-6 text-[0.85rem] text-ink-500">
      <RouterLink :to="datePath(hubDate)" class="underline underline-offset-4 hover:text-ink-800">
        {{ dateLabel }}은 무슨 날인지 전부 보기
      </RouterLink>
    </p>
  </div>
</template>
