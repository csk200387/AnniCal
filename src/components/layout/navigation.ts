// 메뉴 표시와 페이지 전환이 같은 순서를 사용한다.
export const primaryNavigation = [
  { name: 'feed', to: '/', lines: ['오늘의', '발견'] },
  { name: 'calendar', to: '/calendar', lines: ['기념일', '달력'] },
  { name: 'birthday', to: '/birthday', lines: ['내', '생일은?'] },
  { name: 'together', to: '/together', lines: ['우리의', '날'] },
  { name: 'popular', to: '/popular', lines: ['인기', '순위'] },
  { name: 'export', to: '/export', lines: ['캘린더', '연동'] },
] as const

export function pageTransitionFor(to: unknown, from: unknown): 'route-forward' | 'route-back' {
  const toIndex = primaryNavigation.findIndex(item => item.name === to)
  const fromIndex = primaryNavigation.findIndex(item => item.name === from)
  // 상세 화면에서 메뉴로 돌아올 때도 같은 가로축을 유지한다.
  if (fromIndex < 0 && toIndex >= 0) return 'route-back'
  return toIndex >= 0 && toIndex < fromIndex ? 'route-back' : 'route-forward'
}
