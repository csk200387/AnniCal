<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useShareStore } from '@/stores/share'
import { useNow } from '@/composables/useNow'
import { monthsCovering } from '@/services/anniversaryRepository'
import { isYearSupported } from '@/utils/dateUtils'
import { pathForId } from '@/utils/anniversaryRoutes'
import { displayName } from '@/seo/meta'
import CategoryBadge from '@/components/common/CategoryBadge.vue'
import { isoDate, milestoneDate, milestoneLabel, milestoneWindow, togetherPath, validStart, type Milestone, type TogetherContext } from '../milestones'
import '@/assets/birthday.css'
import '@/assets/together.css'

const route = useRoute(), router = useRouter()
const store = useAnniversariesStore(), share = useShareStore()
const { today } = useNow()
const startInput = ref(''), formError = ref(''), loading = ref(false), loadError = ref(false)
const selectedId = ref('')
const heading = ref<HTMLElement | null>(null)
const start = computed(() => validStart(route.query.start, today.value) ? route.query.start : null)
const timeline = computed(() => start.value ? milestoneWindow(start.value, today.value) : { next: null, later: [], past: [] })
const activeM = computed(() => typeof route.query.m === 'string' ? route.query.m : route.query.m === undefined ? timeline.value.next?.ids[0] : undefined)
const context = computed<TogetherContext | null>(() => {
  if (!start.value || !activeM.value) return null
  const date = milestoneDate(start.value, activeM.value)
  return date ? { start: start.value, m: activeM.value, date } : null
})
const invalidLink = computed(() => (route.query.start !== undefined || route.query.m !== undefined) && (!start.value || (route.query.m !== undefined && !context.value)))
const rows = computed(() => [timeline.value.next, ...timeline.value.later, ...timeline.value.past].filter((row): row is Milestone => !!row))
function items(date: string) {
  if (loading.value || loadError.value) return []
  const [year, month, day] = date.split('-').map(Number)
  return store.onDate(year, month, day).filter(a => pathForId(a.id) && (isYearSupported(year) || a.dateType === 'annual-fixed'))
    .slice().sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}
const choices = computed(() => context.value ? items(context.value.date) : [])
const selected = computed(() => choices.value.find(a => a.id === selectedId.value) ?? choices.value[0])
const dateFormatter = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short', timeZone: 'UTC' })
const dateLabel = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`))
const dDay = (days: number) => days === 0 ? '오늘' : days > 0 ? `D-${days}` : `${-days}일 전`
let loadVersion = 0
async function loadResults() {
  const version = ++loadVersion
  if (!start.value) { loading.value = false; loadError.value = false; return }
  startInput.value = start.value
  const dates = rows.value.map(row => row.date)
  if (context.value) dates.push(context.value.date)
  const months = [...new Set(dates.flatMap(date => monthsCovering(Number(date.slice(5, 7)))))]
  loading.value = true; loadError.value = false
  await store.ensureMonths(months)
  if (version !== loadVersion) return
  loadError.value = !months.every(m => store.loadedMonths.has(m))
  loading.value = false
}
watch([start, rows, context], loadResults, { immediate: true })
watch(() => route.query.pick, pick => { selectedId.value = typeof pick === 'string' ? pick : '' }, { immediate: true })
async function discover() {
  formError.value = ''
  if (!validStart(startInput.value, today.value)) { formError.value = '1950년 1월 1일부터 오늘까지의 날짜를 입력해 주세요.'; return }
  await router.push(`/together?${new URLSearchParams({ start: startInput.value })}`)
  await nextTick(); heading.value?.focus({ preventScroll: true }); heading.value?.scrollIntoView({ block: 'start' })
}
function chooseMilestone(row: Milestone) {
  if (!start.value) return
  void router.push(togetherPath({ start: start.value, m: row.ids[0], date: row.date }))
}
function openCard() { if (selected.value && context.value) share.openTogether(selected.value, context.value) }
</script>

<template>
  <div class="home-page together-page">
    <div class="birthday-shell">
      <nav class="crumbs" aria-label="위치"><RouterLink to="/">홈</RouterLink><span aria-hidden="true">/</span><span>우리의 날</span></nav>
      <section class="birthday-intro" aria-labelledby="together-title">
        <div class="birthday-copy">
          <p class="section-kicker"><span /> OUR DAYS, OUR STORIES</p>
          <h1 id="together-title">우리 N주년은<br />무슨 날<span class="heading-dot">?</span></h1>
          <p class="birthday-description">처음 만난 날·사귄 날·결혼한 날 무엇이든.<br />함께 쌓은 시간에 새로운 이야기를 더해요.</p>
          <p class="birthday-invitation">100일부터 50주년까지, 그날의 기념일을 카드로 남겨보세요.</p>
        </div>
        <div class="birthday-envelope">
          <form class="birthday-form" @submit.prevent="discover">
            <p class="birthday-form-kicker">함께 시작한 작은 발견</p><h2>우리의 시작은 언제인가요?</h2>
            <div class="birthday-field together-start"><label for="together-start">시작한 날 (양력)</label><input id="together-start" v-model="startInput" type="date" min="1950-01-01" :max="isoDate(today)" required :aria-invalid="!!formError" :aria-describedby="formError ? 'together-error' : 'together-rule'" /></div>
            <p v-if="formError" id="together-error" class="birthday-error" role="alert">{{ formError }}</p>
            <button class="home-button home-button--dark birthday-submit" type="submit">우리의 날 찾기 <span aria-hidden="true">↗</span></button>
            <p id="together-rule" class="birthday-form-note">시작일을 1일로 세어요. 100일은 시작일 + 99일.<br />2월 29일에 시작했다면 평년의 주년은 2월 28일이에요.</p>
          </form>
        </div>
      </section>
      <p v-if="invalidLink" class="birthday-notice" role="alert">공유 링크의 시작일이나 마일스톤이 올바르지 않아요. 날짜를 다시 입력해 주세요.</p>
      <section v-if="start && !invalidLink" class="birthday-results" aria-labelledby="together-result-title" :aria-busy="loading">
        <header class="birthday-result-heading"><div><p class="section-kicker"><span /> OUR NEXT DISCOVERY</p><h2 id="together-result-title" ref="heading" tabindex="-1">우리의 다음 기념일<span class="heading-dot">.</span></h2></div><span class="date-pill">{{ start }}부터</span></header>
        <button v-if="timeline.next" type="button" class="together-next" @click="chooseMilestone(timeline.next)"><span><small>다가오는 우리의 날</small><strong>{{ timeline.next.labels.join(' · ') }}</strong><span>{{ dateLabel(timeline.next.date) }}</span></span><b>{{ dDay(timeline.next.daysAway) }}</b></button>
        <p v-else class="birthday-notice">준비한 50주년·10,000일 마일스톤을 모두 지났어요. 최근 지난 날의 이야기를 만나보세요.</p>
        <p v-if="loading" class="birthday-notice" role="status">그날에 담긴 이야기를 찾고 있어요…</p>
        <div v-else-if="loadError" class="birthday-notice" role="alert"><p>기념일을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p><button type="button" class="home-button" @click="loadResults">다시 불러오기 ↻</button></div>
        <template v-else>
          <div class="together-timeline">
            <section v-for="group in [{ title: '이후 다섯 번의 발견', list: timeline.later }, { title: '최근 지난 우리의 날', list: timeline.past }]" :key="group.title">
              <h3>{{ group.title }}</h3>
              <ul><li v-for="row in group.list" :key="row.date">
                <button type="button" class="together-row" :aria-pressed="context?.date === row.date" @click="chooseMilestone(row)"><span><strong>{{ row.labels.join(' · ') }}</strong><span>{{ dateLabel(row.date) }}</span><small>{{ items(row.date).length ? items(row.date).map(a => displayName(a.name)).join(' · ') : '아직 등록된 기념일이 없어요.' }}</small></span><b>{{ dDay(row.daysAway) }}</b></button>
              </li></ul><p v-if="!group.list.length" class="birthday-notice">아직 이 구간의 기록이 없어요.</p>
            </section>
          </div>
          <section v-if="context" class="together-discovery" aria-labelledby="together-pick-title">
            <h3 id="together-pick-title">우리 {{ milestoneLabel(context.m) }}, {{ dateLabel(context.date) }}</h3>
            <p v-if="!isYearSupported(Number(context.date.slice(0, 4)))" class="birthday-notice">이 연도는 날짜 계산 자료의 범위를 벗어나 매년 같은 날짜의 기념일만 보여드려요.</p>
            <div v-if="selected" class="birthday-result-layout">
              <article class="birthday-feature">
                <p class="birthday-feature-caption">우리 {{ milestoneLabel(context.m) }},</p><h3>{{ displayName(selected.name) }}</h3>
                <CategoryBadge :category-id="selected.category" /><p class="birthday-origin">{{ selected.storytelling.origin }}</p>
                <div class="birthday-feature-actions"><button type="button" class="home-button home-button--dark" @click="openCard">우리의 카드 만들기 ↗</button><RouterLink :to="pathForId(selected.id)!">그날의 이야기 더 읽기 →</RouterLink></div>
              </article>
              <div class="birthday-choices"><h3>함께 나눌 이야기를 골라보세요</h3><div class="birthday-choice-list" role="group" aria-label="우리의 카드에 담을 기념일"><button v-for="(a, index) in choices" :key="a.id" type="button" :aria-pressed="selected.id === a.id" @click="selectedId = a.id"><span class="birthday-choice-index">{{ String(index + 1).padStart(2, '0') }}</span><strong>{{ displayName(a.name) }}</strong><span aria-hidden="true">{{ selected.id === a.id ? '✓' : '↗' }}</span></button></div></div>
            </div>
            <p v-else class="birthday-notice">이날의 새로운 이야기도 차근차근 채워갈게요. <RouterLink :to="`/day/${context.date.slice(5)}`">이날의 이야기 더 읽기 →</RouterLink></p>
          </section>
        </template>
      </section>
      <div class="birthday-friend"><span class="birthday-friend-spark" aria-hidden="true">✳</span><div><h3>내 생일에도 이야기가 숨어 있을까요?</h3><p>매년 돌아오는 나만의 날도 발견해보세요.</p></div><RouterLink to="/birthday" class="home-button">내 생일은? →</RouterLink></div>
    </div>
  </div>
</template>
