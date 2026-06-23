import type { CategoryId } from './category'

/**
 * 날짜의 성격.
 * - annual-fixed: 매년 같은 (월, 일) — 예: 3월 14일 파이의 날
 * - annual-floating: 매년 반복되지만 날짜가 바뀜, 연도별 별도 엔트리 — 예: F1 모나코 GP 결승일
 * - annual-nth-weekday: 매년 'N번째 X요일' 규칙 — 예: 5월 둘째 주 일요일 (어머니의 날)
 * - annual-relative-to-holiday: 다른 기념일(id) 기준 +N/-N일 — 예: 추수감사절 다음날 블랙프라이데이
 * - one-time: 특정 연도 1회성 — 예: 핼리혜성 회귀
 */
export type DateType =
  | 'annual-fixed'
  | 'annual-floating'
  | 'annual-nth-weekday'
  | 'annual-relative-to-holiday'
  | 'one-time'

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
   * 날짜 (dateType 별 포맷).
   * - annual-fixed:        "MM-DD"           예) "03-14"
   * - annual-floating:     "YYYY-MM-DD"      예) "2026-05-24"
   * - annual-nth-weekday:  "MM-N-DOW"        예) "05-2-SUN" / "11-4-THU" / "05-L-MON"
   *     · N: 1~5 또는 'L'(마지막)
   *     · DOW: SUN | MON | TUE | WED | THU | FRI | SAT
   * - annual-relative-to-holiday: "{anchorId}:{offsetDays}"  예) "anv-nth-11-4-thu-thanksgiving-day-us:1"
   *     · anchorId: 기준이 되는 다른 Anniversary 의 id (데이터셋에 존재해야 함)
   *     · offsetDays: 기준일로부터 며칠 뒤(+)/전(-)인지. 정수 문자열.
   * - one-time:            "YYYY-MM-DD"
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
