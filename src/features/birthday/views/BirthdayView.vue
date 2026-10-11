<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useShareStore } from '@/stores/share'
import { monthsCovering } from '@/services/anniversaryRepository'
import { useNow } from '@/composables/useNow'
import { koreanUrlDate, pathForId } from '@/utils/anniversaryRoutes'
import { birthdayDays, birthdayPath, parseBirthday } from '../birthday'
import DiscoveryToolLayout from '@/components/discovery/DiscoveryToolLayout.vue'
import DiscoveryChoices from '@/components/discovery/DiscoveryChoices.vue'
import DiscoveryFeature from '@/components/discovery/DiscoveryFeature.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import FieldShell from '@/components/ui/FieldShell.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'
import PromoCard from '@/components/ui/PromoCard.vue'
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
const dateLabel = computed(() => context.value ? (koreanUrlDate(context.value.date) ?? '') : '')
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
watch(() => route.query.pick, pick => { selectedId.value = typeof pick === 'string' ? pick : '' }, { immediate: true })

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
    <DiscoveryToolLayout kicker="YOUR DAY, YOUR STORY" title-id="birthday-title" description="매년 돌아오는 익숙한 날짜에, 아직 몰랐던 이야기가 숨어 있을지도 몰라요."
      :results="!!context" results-id="birthday-result-title" :busy="loading" :has-feature="!!selected && !loading && !loadError">
      <template #breadcrumb><nav class="crumbs" aria-label="위치"><RouterLink to="/">홈</RouterLink><span aria-hidden="true">/</span><span>내 생일의 발견</span></nav></template>
      <template #title>내 생일은<br />무슨 날<span class="heading-dot">?</span></template>
      <template #invitation><p class="discovery-invitation">생일과 같은 날의 기념일을 찾아 나만의 카드로 남겨보세요.</p></template>
      <template #form>
        <form class="discovery-form" @submit.prevent="discover">
          <p class="discovery-form-kicker">나를 위한 작은 발견</p><h2>생일이 언제인가요<span class="heading-dot">?</span></h2>
          <div class="birthday-fields">
            <FieldShell for="birthday-month" label="월"><select id="birthday-month" ref="monthInput" v-model.number="month" :aria-invalid="!!formError" :aria-describedby="formError ? 'birthday-form-error' : 'birthday-form-note'"><option :value="0" disabled>몇 월</option><option v-for="m in 12" :key="m" :value="m">{{ m }}월</option></select></FieldShell>
            <FieldShell for="birthday-day" label="일"><select id="birthday-day" v-model.number="day" :disabled="!month" :aria-invalid="!!formError" :aria-describedby="formError ? 'birthday-form-error' : 'birthday-form-note'"><option :value="0" disabled>며칠</option><option v-for="d in days" :key="d" :value="d">{{ d }}일</option></select></FieldShell>
          </div>
          <p v-if="formError" id="birthday-form-error" class="birthday-error" role="alert">{{ formError }}</p>
          <UiButton type="submit" size="l" block icon="arrow">내 생일의 기념일 찾기</UiButton>
          <p id="birthday-form-note" class="discovery-form-note">양력 생일 기준이에요. 태어난 연도는 필요 없어요.</p>
        </form>
      </template>
      <template #notice><ResultState v-if="invalidLink" class="tool-section" tone="error" title="공유 링크의 날짜를 다시 확인해 주세요" description="날짜 또는 기준 연도가 올바르지 않아요. 위에서 생일을 다시 선택해 주세요." /></template>
      <template #resultsHeader>
        <SectionHeader kicker="BIRTHDAY DISCOVERIES">
          <template #title><h2 id="birthday-result-title" ref="resultsHeading" tabindex="-1">{{ dateLabel }}에 담긴 이야기<span class="heading-dot">.</span></h2></template>
          <template #action><span v-if="context" class="date-pill">{{ context.year }}년 기준</span></template>
        </SectionHeader>
      </template>
      <template #status>
        <SkeletonRows v-if="loading" :rows="3" label="생일과 같은 날의 기념일을 찾고 있어요" />
        <ResultState v-else-if="loadError" tone="error" title="기념일을 불러오지 못했어요" description="잠시 후 다시 시도해 주세요."><template #actions><UiButton icon="retry" @click="loadResults">다시 불러오기</UiButton></template></ResultState>
        <template v-else-if="selected">
          <p class="birthday-result-intro" role="status">이날의 기념일 <strong>{{ anniversaries.length }}개</strong>를 찾았어요. 마음에 드는 이야기를 카드로 만들어보세요.</p>
          <p v-if="leapBirthday && context" class="ui-callout">{{ context.year }}년에는 2월 29일이 없지만, 2월 29일로 정해진 기념일은 만나볼 수 있어요.</p>
        </template>
        <ResultState v-else :title="`${dateLabel}의 이야기를 기다리고 있어요`" description="이날의 새로운 이야기도 차근차근 채워갈게요."><template #actions><UiButton to="/calendar" variant="outline" icon="next">다른 날짜 둘러보기</UiButton></template></ResultState>
      </template>
      <template #choices><DiscoveryChoices v-if="selected" :items="anniversaries" :model-value="selected.id" :year="context?.year" feature-id="birthday-feature" label="생일 카드에 담을 이야기" @update:model-value="selectedId = $event" /></template>
      <template #feature><DiscoveryFeature v-if="selected && context" :anniversary="selected" :title="shortName" feature-id="birthday-feature" caption="내 생일과 같은 날이에요" :date-label="dateLabel" :note="selected.dateType === 'annual-fixed' ? '매년 같은 날짜의 기념일이에요.' : `${context.year}년에 생일과 겹치는 기념일이에요. 해마다 날짜가 달라질 수 있어요.`" @share="openCard" /></template>
      <template #intro><div v-if="!context && !invalidLink" class="birthday-how" aria-label="이렇게 즐겨보세요"><p><span>01</span> 생일을 골라요</p><p><span>02</span> 나와 닮은 이야기를 발견해요</p><p><span>03</span> 카드 한 장으로 나눠요</p></div></template>
      <template #crossLinks>
        <PromoCard kicker="A LITTLE DISCOVERY TO SHARE" title="친구의 생일도 발견해요." description="“네 생일에 이런 날이 있더라.” 먼저 이야기를 건네보세요." cta="친구 생일도 알아보기" @action="findFriend" />
        <PromoCard kicker="OUR DAYS, OUR STORIES" title="함께한 날에 이야기를 더해요." description="처음 만난 날부터 다가오는 우리의 날을 찾아보세요." to="/together" cta="우리의 날 찾기" />
      </template>
    </DiscoveryToolLayout>
  </div>
</template>
