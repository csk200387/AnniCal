<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useShareStore } from '@/stores/share'
import { useNow } from '@/composables/useNow'
import { useMonths } from '@/composables/useMonths'
import { monthsCovering } from '@/services/anniversaryRepository'
import { isYearSupported } from '@/utils/dateUtils'
import { pathForId } from '@/utils/anniversaryRoutes'
import { displayName } from '@/utils/format'
import {
  isoDate,
  milestoneDate,
  milestoneLabel,
  milestoneWindow,
  togetherPath,
  validStart,
  type Milestone,
  type TogetherContext,
} from '../milestones'
import DiscoveryToolLayout from '@/components/discovery/DiscoveryToolLayout.vue'
import DiscoveryChoices from '@/components/discovery/DiscoveryChoices.vue'
import DiscoveryFeature from '@/components/discovery/DiscoveryFeature.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import FieldShell from '@/components/ui/FieldShell.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'
import PromoCard from '@/components/ui/PromoCard.vue'
import ListGroup from '@/components/ui/ListGroup.vue'
import ListRow from '@/components/ui/ListRow.vue'
import '@/assets/together.css'

const route = useRoute()
const router = useRouter()
const store = useAnniversariesStore()
const share = useShareStore()
const { today } = useNow()
const startInput = ref('')
const formError = ref('')
const selectedId = ref('')
const showPast = ref(false)
const heading = ref<HTMLElement | null>(null)
const start = computed(() =>
  validStart(route.query.start, today.value) ? route.query.start : null,
)
const timeline = computed(() =>
  start.value ? milestoneWindow(start.value, today.value) : { next: null, later: [], past: [] },
)
const activeM = computed(() =>
  typeof route.query.m === 'string'
    ? route.query.m
    : route.query.m === undefined
      ? timeline.value.next?.ids[0]
      : undefined,
)
const context = computed<TogetherContext | null>(() => {
  if (!start.value || !activeM.value) return null
  const date = milestoneDate(start.value, activeM.value)
  return date ? { start: start.value, m: activeM.value, date } : null
})
const invalidLink = computed(
  () =>
    (route.query.start !== undefined || route.query.m !== undefined) &&
    (!start.value || (route.query.m !== undefined && !context.value)),
)
const rows = computed(() =>
  [timeline.value.next, ...timeline.value.later, ...timeline.value.past].filter(
    (row): row is Milestone => !!row,
  ),
)
// 타임라인의 모든 날짜와 고른 날짜를 덮는 달.
const { loading, error, retry } = useMonths(() => {
  if (!start.value) return []
  const dates = rows.value.map((row) => row.date)
  if (context.value) dates.push(context.value.date)
  return [...new Set(dates.flatMap((date) => monthsCovering(Number(date.slice(5, 7)))))]
})
const loadError = computed(() => !!error.value)
function items(date: string) {
  if (loading.value || loadError.value) return []
  const [year, month, day] = date.split('-').map(Number)
  return store
    .onDate(year, month, day)
    .filter((a) => pathForId(a.id) && (isYearSupported(year) || a.dateType === 'annual-fixed'))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
}
const choices = computed(() => (context.value ? items(context.value.date) : []))
const selected = computed(
  () => choices.value.find((a) => a.id === selectedId.value) ?? choices.value[0],
)
watch(
  context,
  (value) => {
    if (value && timeline.value.past.some((row) => row.date === value.date)) showPast.value = true
  },
  { immediate: true },
)
function storySummary(date: string) {
  const stories = items(date)
  const summary = stories
    .slice(0, 2)
    .map((a) => displayName(a.name))
    .join(' · ')
  return summary
    ? `${summary}${stories.length > 2 ? ` · 외 ${stories.length - 2}개` : ''}`
    : '아직 등록된 기념일이 없어요.'
}
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  timeZone: 'UTC',
})
const dateLabel = (date: string) => dateFormatter.format(new Date(`${date}T00:00:00Z`))
const startLabel = computed(() =>
  start.value
    ? new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(`${start.value}T00:00:00Z`))
    : '',
)
const dDay = (days: number) => (days === 0 ? '오늘' : days > 0 ? `D-${days}` : `${-days}일 전`)
// 공유 링크로 들어와도 입력칸이 그 시작일을 보여 주게 맞춘다.
watch(
  start,
  (value) => {
    if (value) startInput.value = value
  },
  { immediate: true },
)
watch(
  () => route.query.pick,
  (pick) => {
    selectedId.value = typeof pick === 'string' ? pick : ''
  },
  { immediate: true },
)
async function discover() {
  formError.value = ''
  if (!validStart(startInput.value, today.value)) {
    formError.value = '1950년 1월 1일부터 오늘까지의 날짜를 입력해 주세요.'
    return
  }
  await router.push(`/together?${new URLSearchParams({ start: startInput.value })}`)
  await nextTick()
  heading.value?.focus({ preventScroll: true })
  heading.value?.scrollIntoView({ block: 'start' })
}
function chooseMilestone(row: Milestone) {
  if (!start.value) return
  void router.push(togetherPath({ start: start.value, m: row.ids[0], date: row.date }))
}
function openCard() {
  if (selected.value && context.value) share.openTogether(selected.value, context.value)
}
</script>

<template>
  <div class="home-page together-page">
    <DiscoveryToolLayout
      kicker="OUR DAYS, OUR STORIES"
      title-id="together-title"
      description="처음 만난 날·사귄 날·결혼한 날 무엇이든. 함께 쌓은 시간에 새로운 이야기를 더해요."
      :results="!!start && !invalidLink"
      results-id="together-result-title"
      :busy="loading"
      :has-feature="!!selected && !loading && !loadError"
    >
      <template #breadcrumb
        ><nav class="crumbs" aria-label="위치">
          <RouterLink to="/">홈</RouterLink><span aria-hidden="true">/</span><span>우리의 날</span>
        </nav></template
      >
      <template #title>우리 N주년은<br />무슨 날<span class="heading-dot">?</span></template>
      <template #invitation
        ><p class="discovery-invitation">
          100일부터 50주년까지, 그날의 기념일을 카드로 남겨보세요.
        </p></template
      >
      <template #form>
        <form class="discovery-form" @submit.prevent="discover">
          <p class="discovery-form-kicker">함께 시작한 작은 발견</p>
          <h2>우리의 시작은 언제인가요<span class="heading-dot">?</span></h2>
          <FieldShell
            for="together-start"
            label="시작한 날 (양력)"
            :error="formError"
            helper="1950년 1월 1일부터 오늘까지 선택할 수 있어요."
          >
            <template #default="{ describedby, invalid }"
              ><input
                id="together-start"
                v-model="startInput"
                type="date"
                min="1950-01-01"
                :max="isoDate(today)"
                required
                :aria-invalid="invalid"
                :aria-describedby="`${describedby} together-rule`"
            /></template>
          </FieldShell>
          <UiButton type="submit" size="l" block icon="arrow">우리의 날 찾기</UiButton>
          <p id="together-rule" class="discovery-form-note">
            시작일을 1일로 세어요. 100일은 시작일에서 99일 뒤예요.<br />2월 29일에 시작했다면 평년의
            주년은 2월 28일이에요.
          </p>
        </form>
      </template>
      <template #notice
        ><ResultState
          v-if="invalidLink"
          class="tool-section"
          tone="error"
          title="공유 링크의 날짜를 다시 확인해 주세요"
          description="시작일이나 기념일이 올바르지 않아요. 위에서 날짜를 다시 입력해 주세요."
      /></template>
      <template #resultsHeader>
        <SectionHeader kicker="OUR NEXT DISCOVERY"
          ><template #title
            ><h2 id="together-result-title" ref="heading" tabindex="-1">
              우리의 다음 기념일<span class="heading-dot">.</span>
            </h2></template
          ><template #action
            ><span class="date-pill">{{ startLabel }}부터</span></template
          ></SectionHeader
        >
      </template>
      <template #highlight>
        <button
          v-if="timeline.next"
          type="button"
          class="together-highlight"
          :aria-pressed="context?.date === timeline.next.date"
          @click="chooseMilestone(timeline.next)"
        >
          <span class="section-kicker"><span /> 다가오는 우리의 날</span>
          <span class="together-highlight-heading"
            ><strong>{{ timeline.next.labels.join(' · ') }}</strong
            ><span class="dday-pill">{{ dDay(timeline.next.daysAway) }}</span></span
          >
          <time :datetime="timeline.next.date">{{ dateLabel(timeline.next.date) }}</time
          ><span class="together-highlight-arrow" aria-hidden="true">↗</span>
        </button>
        <p v-else class="ui-callout">
          준비한 50주년·10,000일을 모두 지났어요. 최근 지난 날의 이야기를 만나보세요.
        </p>
      </template>
      <template #status>
        <SkeletonRows v-if="loading" :rows="5" label="그날에 담긴 이야기를 찾고 있어요" />
        <ResultState
          v-else-if="loadError"
          tone="error"
          title="기념일을 불러오지 못했어요"
          description="잠시 후 다시 시도해 주세요."
          ><template #actions
            ><UiButton icon="retry" @click="retry">다시 불러오기</UiButton></template
          ></ResultState
        >
        <div v-else class="together-timeline">
          <h3>다가오는 날</h3>
          <ListGroup v-if="timeline.later.length" as="ul" label="다가오는 우리의 날">
            <li v-for="row in timeline.later" :key="row.date">
              <ListRow action :selected="context?.date === row.date" @click="chooseMilestone(row)"
                ><template #prefix
                  ><span class="dday-pill">{{ dDay(row.daysAway) }}</span></template
                ><template #title>{{ row.labels.join(' · ') }}</template
                ><template #detail
                  ><time :datetime="row.date">{{ dateLabel(row.date) }}</time
                  ><br />{{ storySummary(row.date) }}</template
                ><template #suffix><span aria-hidden="true">→</span></template></ListRow
              >
            </li>
          </ListGroup>
          <p v-else class="ui-callout">
            다가오는 날은 모두 만나봤어요. 지난 날의 이야기도 둘러보세요.
          </p>
          <UiButton
            variant="weak"
            size="s"
            :aria-expanded="showPast"
            aria-controls="together-past"
            @click="showPast = !showPast"
            >{{ showPast ? '지난 날 접기' : '지난 날 보기'
            }}<span aria-hidden="true">{{ showPast ? '↑' : '↓' }}</span></UiButton
          >
          <div v-show="showPast" id="together-past" class="together-past">
            <h3>최근 지난 우리의 날</h3>
            <ListGroup v-if="timeline.past.length" as="ul" label="최근 지난 우리의 날"
              ><li v-for="row in timeline.past" :key="row.date">
                <ListRow action :selected="context?.date === row.date" @click="chooseMilestone(row)"
                  ><template #prefix
                    ><span class="dday-pill">{{ dDay(row.daysAway) }}</span></template
                  ><template #title>{{ row.labels.join(' · ') }}</template
                  ><template #detail
                    ><time :datetime="row.date">{{ dateLabel(row.date) }}</time
                    ><br />{{ storySummary(row.date) }}</template
                  ><template #suffix><span aria-hidden="true">→</span></template></ListRow
                >
              </li></ListGroup
            >
            <p v-else class="ui-callout">아직 지난 날의 기록이 없어요.</p>
          </div>
        </div>
      </template>
      <template #featureHeader>
        <div v-if="context && !loading && !loadError" class="together-discovery-heading">
          <SectionHeader
            kicker="A STORY FOR OUR DAY"
            :level="3"
            :title="`우리 ${milestoneLabel(context.m)}에 담긴 이야기`"
            :description="dateLabel(context.date)"
          />
          <p v-if="!isYearSupported(Number(context.date.slice(0, 4)))" class="ui-callout">
            이 연도는 날짜 계산 자료의 범위를 벗어나 매년 같은 날짜의 기념일만 보여드려요.
          </p>
          <ResultState
            v-if="!selected"
            title="이날의 이야기를 기다리고 있어요"
            description="새로운 이야기도 차근차근 채워갈게요."
            ><template #actions
              ><UiButton :to="`/day/${context.date.slice(5)}`" variant="outline" icon="next"
                >이날의 이야기 더 읽기</UiButton
              ></template
            ></ResultState
          >
        </div>
      </template>
      <template #choices
        ><DiscoveryChoices
          v-if="selected"
          :items="choices"
          :model-value="selected.id"
          feature-id="together-feature"
          label="우리의 카드에 담을 이야기"
          @update:model-value="selectedId = $event"
      /></template>
      <template #feature
        ><DiscoveryFeature
          v-if="selected && context"
          :anniversary="selected"
          feature-id="together-feature"
          :caption="`우리 ${milestoneLabel(context.m)}에 만난 이야기예요`"
          :date-label="dateLabel(context.date)"
          @share="openCard"
      /></template>
      <template #crossLinks>
        <PromoCard
          kicker="YOUR DAY, YOUR STORY"
          title="내 생일에도 이야기가 있어요."
          description="매년 돌아오는 나만의 날도 발견해보세요."
          to="/birthday"
          cta="내 생일은?"
        />
        <PromoCard
          kicker="YOUR NEXT FAVORITE DAY"
          title="좋아하는 날을 찾아보세요."
          description="한 달의 기념일을 한눈에 만나보세요."
          to="/calendar"
          cta="기념일 달력 열기"
        />
      </template>
    </DiscoveryToolLayout>
  </div>
</template>
