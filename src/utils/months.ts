/**
 * 어떤 달에 "발생하는" 기념일이 들어 있을 수 있는 파일들.
 *
 * 파일은 기준연도(2026) 발생 월로 나뉘어 있지만 실제 발생일은 움직인다.
 * 음력 명절은 최대 한 달까지 밀리고(설날은 1월·2월 양쪽), 기준일 상대 기념일은
 * 며칠 차이로 달을 넘을 수 있다. 그래서 앞뒤 달을 함께 읽는다.
 * (anchor 는 항상 같은 파일에 함께 있으므로 추가로 챙길 필요가 없다.)
 */
export function monthsCovering(month: number): number[] {
  const prev = month === 1 ? 12 : month - 1
  const next = month === 12 ? 1 : month + 1
  return [prev, month, next]
}

/** 홈 피드가 보여 주는 "다가오는 기념일" 범위(일). */
export const FEED_WINDOW_DAYS = 30

/** 홈 피드(오늘 + 다가오는 N일)를 확정하는 데 필요한 달. */
export function feedMonths(today: Date, windowDays = FEED_WINDOW_DAYS): number[] {
  const end = new Date(today)
  end.setDate(end.getDate() + windowDays)
  return [
    ...new Set([...monthsCovering(today.getMonth() + 1), ...monthsCovering(end.getMonth() + 1)]),
  ]
}

/**
 * 첫 화면이 데이터를 들고 시작하는 경로와 그 달들.
 *
 * 빌드 때 SSR(entry-server)은 이 달들을 채운 상태로 HTML 을 만들고, 브라우저는 같은
 * 달들을 받은 뒤에 hydrate 한다(main.ts). 둘이 어긋나면 hydrate 하면서 화면 일부가
 * 다시 그려진다. 여기 없는 경로는 양쪽 다 빈 데이터로 시작해 화면이 스스로 불러온다.
 * 이 파일은 메인 청크에 들어가므로 데이터 저장소를 import 하지 않는다.
 */
export function initialMonths(path: string, today: Date): number[] {
  const m = /^\/day\/(\d{2})-\d{2}(\/|$)/.exec(path)
  if (m) {
    const month = Number(m[1])
    if (month < 1 || month > 12) return []
    // 상세는 그 달 하나 — 기념일과 기준일은 urlDate 와 같은 달 파일에 있다(AGENTS.md).
    return m[2] === '/' ? [month] : monthsCovering(month)
  }
  if (path === '/') return feedMonths(today)
  if (path === '/calendar') return monthsCovering(today.getMonth() + 1) // 이번 달 달력
  return []
}
