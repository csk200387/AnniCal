<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { RouterLink } from 'vue-router'
import { useTodayFeed } from '../composables/useTodayFeed'
import { useFeedMotion } from '../composables/useFeedMotion'
import TodayStoryCard from '../components/TodayStoryCard.vue'
import CalendarArtwork from '../components/CalendarArtwork.vue'
import type { Anniversary } from '@/types/anniversary'
import type { CategoryId } from '@/types/category'
import { useShareStore } from '@/stores/share'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { pathFor } from '@/utils/anniversaryRoutes'
import { WEEKDAY_KO, displayName } from '@/utils/format'
import AudienceStats from '@/features/stats/components/AudienceStats.vue'
import PopularityRanking from '@/features/stats/components/PopularityRanking.vue'
import PageHero from '@/components/ui/PageHero.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import PromoCard from '@/components/ui/PromoCard.vue'
import '@/assets/feed.css'

const { todays, upcoming, today, loading, error, retry } = useTodayFeed(30)
const { vReveal, reducedMotion } = useFeedMotion()
const shareStore = useShareStore()
const store = useAnniversariesStore()
const todayValue = computed(() => dayjs(today.value))
const dateLabel = computed(() => todayValue.value.format('YYYY.MM.DD'))
const weekday = computed(() => WEEKDAY_KO[todayValue.value.day()])
const featuredStory = computed(() => todays.value[0] ?? null)
const featuredPath = computed(() => (featuredStory.value ? pathFor(featuredStory.value) : null))
const featuredTitle = computed(() =>
  featuredStory.value ? displayName(featuredStory.value.name) : '',
)
const motionPaused = ref(false)
const storiesRef = ref<HTMLElement | null>(null)
const heroRef = ref<InstanceType<typeof PageHero> | null>(null)
const activeCategory = ref<CategoryId | 'all'>('all')
const pageSize = 8
const revealCount = ref(pageSize)
const categoryFilters = computed(() =>
  store.categories.filter((category) =>
    upcoming.value.some(({ anniversary }) => anniversary.category === category.id),
  ),
)
const filteredUpcoming = computed(() =>
  upcoming.value.filter(
    ({ anniversary }) =>
      activeCategory.value === 'all' || anniversary.category === activeCategory.value,
  ),
)
const visibleUpcoming = computed(() => filteredUpcoming.value.slice(0, revealCount.value))
const hasMore = computed(() => revealCount.value < filteredUpcoming.value.length)
watch(activeCategory, () => {
  revealCount.value = pageSize
})
watch(categoryFilters, (categories) => {
  if (
    activeCategory.value !== 'all' &&
    !categories.some((category) => category.id === activeCategory.value)
  )
    activeCategory.value = 'all'
})

const miniCalendar = computed(() => {
  const start = todayValue.value.startOf('month')
  return Array.from({ length: start.day() + start.daysInMonth() }, (_, index) =>
    index < start.day() ? null : index - start.day() + 1,
  )
})

function scrollToStories() {
  storiesRef.value?.scrollIntoView({
    behavior: reducedMotion.value ? 'auto' : 'smooth',
    block: 'start',
  })
  storiesRef.value?.focus({ preventScroll: true })
}
function moveArtwork(event: PointerEvent) {
  if (
    !heroRef.value?.el ||
    reducedMotion.value ||
    motionPaused.value ||
    event.pointerType !== 'mouse'
  )
    return
  const rect = heroRef.value.el.getBoundingClientRect()
  heroRef.value.el.style.setProperty(
    '--pointer-x',
    `${((event.clientX - rect.left) / rect.width - 0.5) * 14}px`,
  )
  heroRef.value.el.style.setProperty(
    '--pointer-y',
    `${((event.clientY - rect.top) / rect.height - 0.5) * 10}px`,
  )
}
function resetArtwork() {
  heroRef.value?.el?.style.setProperty('--pointer-x', '0px')
  heroRef.value?.el?.style.setProperty('--pointer-y', '0px')
}
watch(motionPaused, resetArtwork)
function handleShare(anniversary: Anniversary, dDay?: number) {
  shareStore.open(anniversary, dDay)
}
function upcomingDate(dDay: number) {
  return todayValue.value.add(dDay, 'day')
}
function categoryLabel(id: CategoryId) {
  return store.categoryById.get(id)?.label ?? '기념일'
}
</script>

<template>
  <div class="home-page feed-page" :class="{ 'motion-paused': motionPaused || reducedMotion }">
    <PageHero
      ref="heroRef"
      layout="home"
      title-id="hero-title"
      @pointermove="moveArtwork"
      @pointerleave="resetArtwork"
    >
      <template #topline>
        <span class="hero-edition">ANNICAL DAILY JOURNAL</span>
        <time :datetime="todayValue.format('YYYY-MM-DD')">{{ dateLabel }} · {{ weekday }}요일</time>
      </template>
      <template #copy>
        <p class="hero-eyebrow">
          <span class="tiny-spark" aria-hidden="true">✳</span> 하루에 하나, 새로운 발견
        </p>
        <h1 id="hero-title">
          평범한 하루에, <br />기념할 이유
          <span class="hero-last-word">
            하나
            <svg class="hero-underline" viewBox="0 0 160 18" fill="none" aria-hidden="true">
              <path
                d="M4 12Q72 0 155 8"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
              />
              <path
                d="M18 16Q90 8 141 13"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg> </span
          ><span class="hero-period">.</span>
        </h1>
        <p class="hero-description">날짜에 담긴 이야기를 발견하고, 좋아하는 날을 기억해요.</p>
        <div class="hero-featured">
          <span class="hero-featured-label">오늘의 첫 이야기</span>
          <RouterLink
            v-if="featuredStory && featuredPath && !error"
            :to="featuredPath"
            :aria-label="`오늘의 첫 이야기: ${featuredStory.name}`"
          >
            <strong>{{ featuredTitle }}</strong
            ><span aria-hidden="true">↗</span>
          </RouterLink>
          <button v-else-if="featuredStory && !error" type="button" @click="scrollToStories">
            <strong>{{ featuredTitle }}</strong
            ><span aria-hidden="true">↓</span>
          </button>
          <p v-else role="status">
            {{
              error
                ? '오늘의 이야기를 다시 불러와 주세요.'
                : loading
                  ? '오늘의 이야기를 고르고 있어요…'
                  : '오늘은 나만의 기념일을 만들어보세요.'
            }}
          </p>
        </div>
        <div class="hero-actions">
          <UiButton canonical icon="arrow" @click="scrollToStories">오늘의 기념일 보기</UiButton>
          <RouterLink to="/together" class="hero-calendar-link"
            >우리의 날 찾기 <span aria-hidden="true">→</span></RouterLink
          >
          <RouterLink to="/birthday" class="hero-calendar-link"
            >내 생일은 무슨 날? <span aria-hidden="true">→</span></RouterLink
          >
        </div>
      </template>
      <template #aside><CalendarArtwork :today="today" /></template>
      <template #footer>
        <p>
          <span class="live-dot" /> {{ dateLabel }} <span class="hero-bottom-divider">/</span>
          {{ weekday }}요일의 작은 발견
        </p>
        <button
          v-if="!reducedMotion"
          type="button"
          class="motion-control"
          :aria-pressed="motionPaused"
          :aria-label="motionPaused ? '장식 애니메이션 재생' : '장식 애니메이션 일시정지'"
          @click="motionPaused = !motionPaused"
        >
          <span aria-hidden="true">{{ motionPaused ? '▶' : 'Ⅱ' }}</span>
        </button>
        <button type="button" class="hero-scroll" @click="scrollToStories">
          SCROLL TO DISCOVER <span aria-hidden="true">↓</span>
        </button>
      </template>
    </PageHero>

    <div class="discovery-strip" aria-label="기념일 안내">
      <span
        ><span class="strip-flower" aria-hidden="true">✳</span> 모든 날에는 이야기가 있어요</span
      >
      <span
        >오늘의 기념일 <strong>{{ loading ? '—' : todays.length }}<small>개</small></strong></span
      >
      <span
        >앞으로 30일
        <strong>{{ loading ? '—' : upcoming.length }}<small>개의 발견</small></strong></span
      >
    </div>

    <div class="home-container">
      <section
        ref="storiesRef"
        class="home-section today-section"
        tabindex="-1"
        aria-labelledby="today-title"
      >
        <SectionHeader
          v-reveal
          kicker="TODAY’S DISCOVERIES"
          :description="`${todayValue.month() + 1}월 ${todayValue.date()}일, 알고 나면 조금 다르게 보일 오늘.`"
        >
          <template #title
            ><h2 id="today-title">
              오늘은 이런 날이에요<span class="heading-dot">.</span>
            </h2></template
          >
          <template #action
            ><span class="date-pill"
              >{{ todayValue.format('MM.DD') }} <span>{{ weekday }}요일</span></span
            ></template
          >
        </SectionHeader>
        <div v-if="loading" class="story-grid" role="status" aria-label="오늘의 기념일 불러오는 중">
          <div v-for="n in 3" :key="n" class="story-skeleton"><span /><span /><span /></div>
        </div>
        <div v-else-if="error" class="home-empty" role="alert">
          <h3>이야기를 불러오지 못했어요.</h3>
          <p>잠시 후 다시 시도해 주세요.</p>
          <button type="button" class="home-button home-button--dark" @click="retry">
            다시 불러오기 ↗
          </button>
        </div>
        <div
          v-else-if="todays.length"
          class="story-grid"
          :class="{
            'story-grid--two': todays.length === 2,
            'story-grid--one': todays.length === 1,
          }"
        >
          <TodayStoryCard
            v-for="(anniversary, index) in todays"
            :key="anniversary.id"
            v-reveal
            :anniversary="anniversary"
            :index="index"
            :date-label="todayValue.format('MM.DD')"
            :style="{ '--reveal-delay': `${Math.min(index, 2) * 75}ms` }"
            @share="handleShare"
          />
        </div>
        <div v-else class="home-empty">
          <span class="empty-flower" aria-hidden="true">✳</span>
          <h3>아직 이름 붙이지 않은 하루예요.</h3>
          <p>
            오늘은 나만의 기념일을 만들어보는 건 어때요? <br />아래에서 다가오는 기념일도
            만나보세요.
          </p>
        </div>
      </section>

      <section v-if="upcoming.length" class="home-section" aria-labelledby="upcoming-title">
        <SectionHeader
          v-reveal
          kicker="SOMETHING TO LOOK FORWARD TO"
          description="미리 알아두면 더 즐거운, 앞으로 30일의 기념일."
          ><template #title
            ><h2 id="upcoming-title">
              다가올 날도 기대되니까<span class="heading-dot">.</span>
            </h2></template
          ><template #action
            ><RouterLink to="/calendar" class="section-text-link"
              >전체 달력 보기 <span aria-hidden="true">↗</span></RouterLink
            ></template
          ></SectionHeader
        >
        <div class="upcoming-layout">
          <div v-reveal class="upcoming-main">
            <div class="category-filters" role="group" aria-label="다가오는 기념일 카테고리">
              <button
                type="button"
                :aria-pressed="activeCategory === 'all'"
                @click="activeCategory = 'all'"
              >
                전체 <span>{{ upcoming.length }}</span>
              </button>
              <button
                v-for="category in categoryFilters"
                :key="category.id"
                type="button"
                :aria-pressed="activeCategory === category.id"
                @click="activeCategory = category.id"
              >
                {{ category.label }}
              </button>
            </div>
            <p class="upcoming-result-count" role="status">
              {{ activeCategory === 'all' ? '전체' : categoryLabel(activeCategory) }} 기념일
              {{ filteredUpcoming.length }}개
            </p>
            <ol class="upcoming-list">
              <li
                v-for="{ anniversary, dDay } in visibleUpcoming"
                :key="anniversary.id"
                class="upcoming-item"
              >
                <time :datetime="upcomingDate(dDay).format('YYYY-MM-DD')" class="upcoming-date"
                  ><span>{{ upcomingDate(dDay).month() + 1 }}월</span
                  ><strong>{{ String(upcomingDate(dDay).date()).padStart(2, '0') }}</strong></time
                >
                <div class="upcoming-info">
                  <span>{{ categoryLabel(anniversary.category) }}</span
                  ><RouterLink v-if="pathFor(anniversary)" :to="pathFor(anniversary)!">{{
                    displayName(anniversary.name)
                  }}</RouterLink
                  ><strong v-else>{{ displayName(anniversary.name) }}</strong>
                </div>
                <span class="dday-pill">D−{{ dDay }}</span>
                <button
                  type="button"
                  class="round-icon-button upcoming-share"
                  :aria-label="`${anniversary.name} 공유`"
                  @click="handleShare(anniversary, dDay)"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    aria-hidden="true"
                  >
                    <path
                      d="M12 15V3m-4 4 4-4 4 4M6 11H4v9h16v-9h-2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </button>
              </li>
            </ol>
            <button
              v-if="hasMore"
              type="button"
              class="load-more-button"
              @click="revealCount += pageSize"
            >
              기념일 더 보기
              <span>{{ visibleUpcoming.length }} / {{ filteredUpcoming.length }}</span
              ><span aria-hidden="true">↓</span>
            </button>
          </div>
          <aside v-reveal class="calendar-promo">
            <p class="section-kicker">YOUR NEXT FAVORITE DAY</p>
            <h3>좋아하는 날을 <br />하나씩 찾아보세요.</h3>
            <p>한 달의 이야기를 한눈에. <br />날짜마다 새로운 발견이 기다려요.</p>
            <div class="mini-calendar" aria-hidden="true">
              <div class="mini-calendar-heading">
                <strong
                  >{{ todayValue.year() }}.{{
                    String(todayValue.month() + 1).padStart(2, '0')
                  }}</strong
                ><span>↗</span>
              </div>
              <div class="mini-calendar-grid">
                <span
                  v-for="(day, index) in ['S', 'M', 'T', 'W', 'T', 'F', 'S']"
                  :key="`weekday-${index}`"
                  class="mini-weekday"
                  >{{ day }}</span
                ><span
                  v-for="(day, index) in miniCalendar"
                  :key="index"
                  :class="{ 'mini-today': day === todayValue.date() }"
                  >{{ day }}</span
                >
              </div>
            </div>
            <UiButton canonical to="/calendar" variant="brand" icon="arrow"
              >기념일 달력 열기</UiButton
            ><span class="promo-spark" aria-hidden="true">✳</span>
          </aside>
        </div>
      </section>

      <PopularityRanking />

      <PromoCard
        v-reveal
        canonical
        kicker="KEEP YOUR FAVORITE DAYS CLOSE"
        title="기억하고 싶은 날은, 내 캘린더에."
        title-id="subscribe-title"
        description="구글·애플 캘린더에 담아두고 매일의 작은 기념일을 만나보세요."
        to="/export"
        cta="내 캘린더에 담기"
      />
      <AudienceStats />
    </div>
  </div>
</template>
