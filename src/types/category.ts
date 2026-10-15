/**
 * 기념일 카테고리 식별자.
 * 사용자가 캘린더 Export / 알림 설정에서 선택하는 단위가 된다.
 */
export type CategoryId =
  | 'general'
  | 'romance'
  | 'holiday'
  | 'brand'
  | 'food'
  | 'animal'
  | 'culture'
  | 'academic'
  | 'sports'
  | 'career'
  | 'history'
  | 'campaign'
  | 'quirky'

/** 카테고리 색 그룹. 실제 색값은 ui.css 의 [data-color] 규칙이 토큰으로 정한다. */
export type CategoryColor = 'accent' | 'green' | 'purple' | 'blue' | 'gold'

export interface Category {
  id: CategoryId
  label: string
  description: string
  emoji: string
  /** 달력 점·범례·우표 그림 색. 여러 카테고리가 한 색을 나눠 쓴다. */
  colorToken: CategoryColor
}
