/**
 * 태그 문자열 → 고정된 색상 매핑.
 * 같은 태그는 항상 같은 색을 받도록 결정적(deterministic) 해시 사용.
 *
 * Tailwind JIT 가 클래스명을 감지할 수 있도록
 * 팔레트의 모든 클래스명은 문자열 리터럴 그대로 등장한다.
 */

export interface TagColor {
  /** 제목/텍스트 색상 */
  text: string
  /** 칩 배경 */
  bg: string
  /** 칩 테두리 */
  border: string
}

const PALETTE: TagColor[] = [
  { text: 'text-rose-600',     bg: 'bg-rose-50',     border: 'border-rose-200' },
  { text: 'text-orange-600',   bg: 'bg-orange-50',   border: 'border-orange-200' },
  { text: 'text-amber-700',    bg: 'bg-amber-50',    border: 'border-amber-200' },
  { text: 'text-emerald-700',  bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  { text: 'text-teal-700',     bg: 'bg-teal-50',     border: 'border-teal-200' },
  { text: 'text-sky-700',      bg: 'bg-sky-50',      border: 'border-sky-200' },
  { text: 'text-indigo-700',   bg: 'bg-indigo-50',   border: 'border-indigo-200' },
  { text: 'text-fuchsia-700',  bg: 'bg-fuchsia-50',  border: 'border-fuchsia-200' },
]

const NEUTRAL: TagColor = {
  text: 'text-neutral-900',
  bg: 'bg-neutral-100',
  border: 'border-neutral-200',
}

// djb2 — 결정적이고 분포가 고른 문자열 해시.
function hashString(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) + s.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

/** 태그 한 개 → 색상 세트. 빈 문자열이면 중립 색. */
export function colorsForTag(tag: string): TagColor {
  if (!tag) return NEUTRAL
  return PALETTE[hashString(tag) % PALETTE.length]
}

/**
 * 기념일의 "대표 색" = 첫 번째 태그의 색.
 * 태그가 없으면 중립 색.
 */
export function primaryColorForTags(tags: readonly string[]): TagColor {
  if (!tags.length) return NEUTRAL
  return colorsForTag(tags[0])
}
