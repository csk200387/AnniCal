<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useShareStore } from '@/stores/share'
import { monthsCovering } from '@/services/anniversaryRepository'
import { useNow } from '@/composables/useNow'
import { koreanUrlDate, pathForId } from '@/utils/anniversaryRoutes'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import CategorySymbol from '@/features/feed/components/CategorySymbol.vue'
import { birthdayDays, birthdayPath, parseBirthday } from '../birthday'
import '@/assets/birthday.css'

const route = useRoute()
const router = useRouter()
const store = useAnniversariesStore()
const share = useShareStore()
const { today } = useNow()
const month = ref(0)
const day = ref(0)
const formError = ref('')
const monthInput = ref<HTMLSelectElement | null>(null)
const resultsHeading = ref<HTMLElement | null>(null)
const selectedId = ref('')
const loading = ref(false)
const loadError = ref(false)
const context = computed(() => parseBirthday(route.query.date, route.query.year, today.value.getFullYear()))
const invalidLink = computed(() => route.query.date !== undefined && !context.value)
const days = computed(() => birthdayDays(month.value))
const dateLabel = computed(() => context.value ? koreanUrlDate(context.value.date) : '')
const anniversaries = computed(() => {
  if (!context.value || loading.value || loadError.value) return []
  const [m, d] = context.value.date.split('-').map(Number)
  return store.onDate(context.value.year, m, d).filter(a => pathForId(a.id))
    .slice().sort((a, b) => Number(b.dateType === 'annual-fixed') - Number(a.dateType === 'annual-fixed') || a.name.localeCompare(b.name, 'ko'))
})
const selected = computed(() => anniversaries.value.find(a => a.id === selectedId.value) ?? anniversaries.value[0])
const shortName = computed(() => selected.value?.name.replace(/\s+\([A-Za-z][^)]*\)$/, '') ?? '')
const leapBirthday = computed(() => context.value?.date === '02-29' && new Date(context.value.year, 1, 29).getMonth() !== 1)

watch(month, () => { if (day.value > days.value) day.value = 0 })
let loadVersion = 0
async function loadResults() {
  const version = ++loadVersion
  formError.value = ''
  loadError.value = false
  const value = context.value
  if (!value) { loading.value = false; return }
  const [m, d] = value.date.split('-').map(Number)
  month.value = m
  day.value = d
  loading.value = true
  await store.ensureMonths(monthsCovering(m))
  if (version !== loadVersion) return
  loadError.value = !monthsCovering(m).every(n => store.loadedMonths.has(n))
  loading.value = false
  selectedId.value = typeof route.query.pick === 'string' ? route.query.pick : ''
}
watch(context, loadResults, { immediate: true })

async function discover() {
  if (!month.value || !day.value) { formError.value = '생일의 월과 일을 모두 골라주세요.'; return }
  const date = `${String(month.value).padStart(2, '0')}-${String(day.value).padStart(2, '0')}`
  await router.push(birthdayPath({ date, year: today.value.getFullYear() }))
  await nextTick()
  resultsHeading.value?.focus({ preventScroll: true })
  resultsHeading.value?.scrollIntoView({ block: 'start', behavior: 'auto' })
}
async function findFriend() {
  await router.push('/birthday')
  month.value = 0
  day.value = 0
  await nextTick()
  monthInput.value?.focus()
}
function openCard() {
  if (selected.value && context.value) share.openBirthday(selected.value, context.value)
}
</script>

<template>
  <div class="home-page birthday-page">
    <div class="birthday-shell">
      <nav class="crumbs" aria-label="위치"><RouterLink to="/">홈</RouterLink><span aria-hidden="true">/</span><span>내 생일의 발견</span></nav>
      <section class="birthday-intro" aria-labelledby="birthday-title">
        <div class="birthday-copy">
          <p class="section-kicker"><span /> YOUR DAY, YOUR STORY</p>
          <h1 id="birthday-title">내 생일은<br />무슨 날<span class="heading-dot">?</span></h1>
          <p class="birthday-description">매년 돌아오는 익숙한 날짜에,<br />아직 몰랐던 이야기가 숨어 있을지도 몰라요.</p>
          <p class="birthday-invitation">생일과 같은 날의 기념일을 찾아 나만의 카드로 남겨보세요.</p>
        </div>
        <div class="birthday-envelope">
          <span class="birthday-postmark" aria-hidden="true">A LITTLE<br />REASON TO<br />CELEBRATE ✳</span>
          <form class="birthday-form" @submit.prevent="discover">
            <p class="birthday-form-kicker">나를 위한 작은 발견</p>
            <h2>생일이 언제인가요?</h2>
            <div class="birthday-fields">
              <div class="birthday-field"><label for="birthday-month">월</label><select id="birthday-month" ref="monthInput" v-model.number="month" :aria-invalid="!!formError" :aria-describedby="formError ? 'birthday-form-error' : undefined"><option :value="0" disabled>몇 월</option><option v-for="m in 12" :key="m" :value="m">{{ m }}월</option></select></div>
              <span class="birthday-slash" aria-hidden="true">/</span>
              <div class="birthday-field"><label for="birthday-day">일</label><select id="birthday-day" v-model.number="day" :disabled="!month" :aria-invalid="!!formError" :aria-describedby="formError ? 'birthday-form-error' : undefined"><option :value="0" disabled>며칠</option><option v-for="d in days" :key="d" :value="d">{{ d }}일</option></select></div>
            </div>
            <p v-if="formError" id="birthday-form-error" class="birthday-error" role="alert">{{ formError }}</p>
            <button class="home-button home-button--dark birthday-submit" type="submit">내 생일의 기념일 찾기 <span aria-hidden="true">↗</span></button>
            <p class="birthday-form-note">양력 생일 기준 · 태어난 연도는 필요 없어요.</p>
          </form>
        </div>
      </section>

      <p v-if="invalidLink" class="birthday-notice" role="alert">공유 링크의 날짜 또는 기준 연도가 올바르지 않아요. 생일을 다시 선택해 주세요.</p>

      <section v-if="context" class="birthday-results" aria-labelledby="birthday-result-title" :aria-busy="loading">
        <header class="birthday-result-heading">
          <div><p class="section-kicker"><span /> BIRTHDAY DISCOVERIES</p><h2 id="birthday-result-title" ref="resultsHeading" tabindex="-1">{{ dateLabel }}에 담긴 이야기<span class="heading-dot">.</span></h2></div>
          <span class="date-pill">{{ context.year }}년 기준</span>
        </header>
        <p v-if="loading" class="birthday-notice" role="status">생일과 같은 날의 기념일을 찾고 있어요…</p>
        <div v-else-if="loadError" class="birthday-notice" role="alert"><p>기념일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p><button class="home-button" type="button" @click="loadResults">다시 불러오기 ↻</button></div>
        <template v-else-if="selected">
          <p class="birthday-result-intro" role="status">이날의 기념일 <strong>{{ anniversaries.length }}개</strong>를 찾았어요. 마음에 드는 이야기를 골라 카드로 만들어보세요.</p>
          <p v-if="leapBirthday" class="birthday-notice">{{ context.year }}년에는 2월 29일이 없지만, 2월 29일로 정해진 기념일은 만나볼 수 있어요.</p>
          <div class="birthday-result-layout">
            <article class="birthday-feature" aria-label="선택한 기념일">
              <div class="birthday-feature-top"><span>MY BIRTHDAY DISCOVERY</span><CategorySymbol :category="selected.category" width="56" height="56" aria-hidden="true" /></div>
              <p class="birthday-feature-date">{{ dateLabel }}</p>
              <p class="birthday-feature-caption">내 생일과 같은 날,</p>
              <h3>{{ shortName }}</h3>
              <CategoryBadge :category-id="selected.category" />
              <p class="birthday-origin">{{ selected.storytelling.origin || '이날에 담긴 이야기를 기념일 페이지에서 만나보세요.' }}</p>
              <span class="birthday-date-note">{{ selected.dateType === 'annual-fixed' ? '매년 같은 날짜의 기념일이에요.' : `${context.year}년에 생일과 겹치는 기념일이에요. 해마다 날짜가 달라질 수 있어요.` }}</span>
              <div class="birthday-feature-actions"><button type="button" class="home-button home-button--dark" @click="openCard">이 이야기로 생일 카드 만들기 <span aria-hidden="true">↗</span></button><RouterLink :to="pathForId(selected.id)!">유래 더 읽기 →</RouterLink></div>
            </article>
            <div class="birthday-choices">
              <h3>같은 날짜, 서로 다른 이야기</h3>
              <p>가장 마음에 드는 기념일을 골라보세요.</p>
              <div class="birthday-choice-list" role="group" aria-label="생일 카드에 담을 기념일">
                <button v-for="(a, index) in anniversaries" :key="a.id" type="button" :aria-pressed="selected.id === a.id" @click="selectedId = a.id"><span class="birthday-choice-index">{{ String(index + 1).padStart(2, '0') }}</span><span><strong>{{ a.name }}</strong><small>{{ a.dateType === 'annual-fixed' ? '매년 같은 날' : `${context.year}년 기준` }}</small></span><span aria-hidden="true">{{ selected.id === a.id ? '✓' : '↗' }}</span></button>
              </div>
            </div>
          </div>
        </template>
        <div v-else class="birthday-notice"><p>아직 {{ dateLabel }}에 등록된 기념일이 없어요.<br />이날의 새로운 이야기도 차근차근 채워갈게요.</p><RouterLink to="/calendar" class="section-text-link">다른 날짜 둘러보기 →</RouterLink></div>
        <div v-if="!loading && !loadError" class="birthday-friend"><span class="birthday-friend-spark" aria-hidden="true">✳</span><div><h3>그 친구의 생일도 궁금하다면.</h3><p>“네 생일에 이런 날이 있더라.” 먼저 이야기를 건네보세요.</p></div><button type="button" class="home-button" @click="findFriend">친구 생일도 알아보기 <span aria-hidden="true">→</span></button></div>
      </section>
      <div v-else-if="!invalidLink" class="birthday-how" aria-label="이렇게 즐겨보세요"><p><span>01</span> 생일을 고르고</p><p><span>02</span> 나와 닮은 이야기를 발견하고</p><p><span>03</span> 카드 한 장으로 나눠요</p></div>
    </div>
  </div>
</template>
