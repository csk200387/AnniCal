import { computed, onScopeDispose, readonly, ref, type Ref } from 'vue'
import { msUntilNextSiteMidnight, nowInSiteZone } from '@/utils/clock'

// 앱 전체가 공유하는 하나의 시계.
//
// 화면마다 타이머를 두면 자정에 서로 다른 순간에 갱신돼 헤더는 새 날짜인데 피드는
// 어제인 상태가 생긴다. 구독자가 하나라도 있는 동안만 타이머를 돌리고, 모두
// 사라지면 정리한다.

const current = ref<Date>(nowInSiteZone())
let subscribers = 0
let timer: ReturnType<typeof setTimeout> | null = null

function refresh(): void {
  current.value = nowInSiteZone()
}

function scheduleNextMidnight(): void {
  if (timer !== null) clearTimeout(timer)
  timer = setTimeout(() => {
    refresh()
    scheduleNextMidnight()
  }, msUntilNextSiteMidnight())
}

/**
 * 백그라운드 탭에서는 타이머가 크게 지연되거나 묶여서 발화한다. 탭이 다시
 * 보이는 순간 즉시 바로잡고 다음 자정 타이머도 다시 잡는다.
 */
function onVisibilityChange(): void {
  if (document.visibilityState === 'visible') {
    refresh()
    scheduleNextMidnight()
  }
}

function start(): void {
  scheduleNextMidnight()
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibilityChange)
  }
}

function stop(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }
}

export interface SiteClock {
  /** 서울 벽시계 기준 현재 시각(로컬 구성요소). 자정에 갱신된다. */
  now: Readonly<Ref<Date>>
  /** 서울 기준 오늘 00:00. 날짜 비교용. */
  today: Readonly<Ref<Date>>
}

/**
 * 서울 자정마다 갱신되는 반응형 시계를 구독한다.
 * 컴포넌트 스코프가 사라지면 자동으로 구독 해제된다.
 */
export function useNow(): SiteClock {
  if (subscribers === 0) start()
  subscribers += 1
  // 구독 시점에 한 번 맞춰 둔다 — 마지막 구독 해제 이후 시간이 흘렀을 수 있다.
  refresh()

  onScopeDispose(() => {
    subscribers -= 1
    if (subscribers === 0) stop()
  })

  // current 는 이미 서울 벽시계를 로컬 구성요소로 담고 있으므로,
  // 연·월·일만 떼면 그대로 서울 기준 오늘 00:00 이 된다.
  const today = computed(() => {
    const n = current.value
    return new Date(n.getFullYear(), n.getMonth(), n.getDate())
  })

  return { now: readonly(current) as Readonly<Ref<Date>>, today: today as Readonly<Ref<Date>> }
}
