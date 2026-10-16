// 메뉴 표시와 페이지 전환이 같은 순서를 사용한다.
// dockLabel 은 모바일 하단바의 한 줄 이름이다. null 이면 하단바에서 뺀다 — 칸이 6개면
// 두 줄 글자가 빽빽해서 5칸으로 줄였고, 캘린더 연동은 한 번 설정하면 끝이라 홈 배너·푸터로 충분하다.
export const primaryNavigation = [
  { name: 'feed', to: '/', lines: ['오늘의', '발견'], dockLabel: '오늘' },
  { name: 'calendar', to: '/calendar', lines: ['기념일', '달력'], dockLabel: '달력' },
  { name: 'birthday', to: '/birthday', lines: ['내', '생일은?'], dockLabel: '내 생일' },
  { name: 'together', to: '/together', lines: ['우리의', '날'], dockLabel: '우리의 날' },
  { name: 'popular', to: '/popular', lines: ['인기', '순위'], dockLabel: '인기' },
  { name: 'export', to: '/export', lines: ['캘린더', '연동'], dockLabel: null },
] as const

export function pageTransitionFor(to: unknown, from: unknown): 'route-forward' | 'route-back' {
  const toIndex = primaryNavigation.findIndex((item) => item.name === to)
  const fromIndex = primaryNavigation.findIndex((item) => item.name === from)
  // 상세 화면에서 메뉴로 돌아올 때도 같은 가로축을 유지한다.
  if (fromIndex < 0 && toIndex >= 0) return 'route-back'
  return toIndex >= 0 && toIndex < fromIndex ? 'route-back' : 'route-forward'
}
