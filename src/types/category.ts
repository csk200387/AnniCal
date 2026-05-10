/**
 * 기념일 카테고리 식별자.
 * 사용자가 캘린더 Export / 알림 설정에서 선택하는 단위가 된다.
 */
export type CategoryId =
  | 'general'
  | 'romance'
  | 'holiday'
  | 'motorsport'
  | 'extreme'
  | 'brand'

export interface Category {
  id: CategoryId
  label: string
  description: string
  emoji: string
  /** Tailwind 색 토큰 키 (예: "rose", "amber"). UI 배지 컬러에 사용. */
  colorToken: string
}
