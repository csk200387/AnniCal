import type { CategoryId } from './category'

/**
 * 날짜의 성격.
 * - annual-fixed: 매년 같은 (월, 일) — 예: 3월 14일 파이의 날
 * - annual-floating: 매년 반복되지만 날짜가 바뀜 — 예: F1 모나코 GP 결승일
 * - one-time: 특정 연도 1회성 — 예: 핼리혜성 회귀
 */
export type DateType = 'annual-fixed' | 'annual-floating' | 'one-time'

export type MemeType = 'image' | 'text'

export interface Meme {
  type: MemeType
  /** image 타입일 때만 사용. text 타입은 null. */
  url: string | null
  caption: string
}

export interface Storytelling {
  /** 기념일의 유래/배경 */
  origin: string
  /** 흥미로운 일화·관련 사건 */
  anecdote: string
}

export interface Anniversary {
  /** 고유 식별자. 충돌 방지용으로 `anv-{YYYY}-{MM-DD}-{slug}` 컨벤션 권장. */
  id: string
  /**
   * 날짜.
   * - annual-fixed: "MM-DD"
   * - annual-floating / one-time: "YYYY-MM-DD"
   */
  date: string
  dateType: DateType
  name: string
  category: CategoryId
  tags: string[]
  storytelling: Storytelling
  memes: Meme[]
  /** 출처 URL (Wikipedia, 공식 사이트 등). 신뢰도 표기용. */
  sourceUrl: string | null
}
