// "지금"의 단일 기준점.
//
// 왜 필요한가 — 두 가지 문제를 함께 푼다.
//
// 1) 자정을 넘겨도 화면이 안 바뀐다. 각 화면이 setup 시점에 `new Date()` 를 잡아
//    두면 그 값은 Vue 의 반응형 의존성이 아니라서 영영 갱신되지 않는다. 23:59 에
//    열어 둔 탭은 날짜가 바뀌어도 어제의 "오늘의 기념일"을 계속 보여준다.
//
// 2) 사용자마다 "오늘"이 다르다. 이 사이트는 한국 기념일을 다루고 구독 피드도
//    Asia/Seoul 을 선언한다. 그런데 날짜 계산은 브라우저 로컬 타임존을 쓰고 있어,
//    해외 사용자에게는 ICS 와 화면의 날짜가 어긋난다.
//
// 그래서 기준 시각을 "서울 벽시계"로 통일한다. 아래 함수가 돌려주는 Date 는
// **로컬 구성요소(getFullYear/getMonth/getDate)가 서울의 연·월·일과 같도록**
// 만들어져 있다. dateUtils 의 모든 계산이 로컬 구성요소를 쓰므로, 이 값만
// 넘기면 어느 타임존에서 보든 같은 날짜를 얻는다.

/** 사이트가 기준으로 삼는 타임존. ICS 의 X-WR-TIMEZONE 과 같아야 한다. */
export const SITE_TIMEZONE = 'Asia/Seoul'

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: SITE_TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

interface SiteParts {
  year: number
  month: number // 1~12
  day: number
  hour: number
  minute: number
  second: number
}

function partsInSiteZone(base: Date): SiteParts {
  const map: Record<string, string> = {}
  for (const p of partsFormatter.formatToParts(base)) {
    if (p.type !== 'literal') map[p.type] = p.value
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    // Intl 은 자정을 '24' 로 낼 수 있다(hourCycle h24). 0 으로 정규화한다.
    hour: Number(map.hour) % 24,
    minute: Number(map.minute),
    second: Number(map.second),
  }
}

/**
 * 서울 벽시계를 로컬 구성요소로 옮겨 담은 Date.
 *
 * 주의: 이 값의 절대 시각(epoch)은 실제와 다르다. 오직 연·월·일·시·분·초를
 * 읽을 목적으로만 쓴다 — 날짜 계산 전용 값이다.
 */
export function nowInSiteZone(base: Date = new Date()): Date {
  const p = partsInSiteZone(base)
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
}

/** 서울 기준 오늘 00:00 을 로컬 구성요소로 담은 Date. */
export function todayInSiteZone(base: Date = new Date()): Date {
  const p = partsInSiteZone(base)
  return new Date(p.year, p.month - 1, p.day)
}

/**
 * 다음 서울 자정까지 남은 밀리초.
 *
 * 실제 경과 시간으로 계산해야 하므로 벽시계 변환값이 아니라 원래 시각을 쓴다.
 * 타이머가 조금 일찍 깨어나 자정 직전에 갱신하는 사고를 막으려고 1초를 더한다.
 */
export function msUntilNextSiteMidnight(base: Date = new Date()): number {
  const p = partsInSiteZone(base)
  const elapsedToday = (p.hour * 60 * 60 + p.minute * 60 + p.second) * 1000
  return 24 * 60 * 60 * 1000 - elapsedToday + 1000
}
