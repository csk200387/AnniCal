/**
 * 태그 문자열 → 고정된 색상 매핑.
 * 같은 태그는 항상 같은 색을 받도록 결정적(deterministic) 해시 사용.
 *
 * 매거진 톤 — 채도를 낮춘 잉크에 가까운 컬러로 통일.
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
  /** 도트 인디케이터 (헤드라인 옆 점 등) */
  dot: string
}

const PALETTE: TagColor[] = [
  { text: 'text-rose-900',     bg: 'bg-rose-50/60',     border: 'border-rose-200/70',     dot: 'bg-rose-700' },
  { text: 'text-amber-900',    bg: 'bg-amber-50/60',    border: 'border-amber-200/70',    dot: 'bg-amber-700' },
  { text: 'text-stone-800',    bg: 'bg-stone-100/60',   border: 'border-stone-300/70',    dot: 'bg-stone-700' },
  { text: 'text-emerald-900',  bg: 'bg-emerald-50/60',  border: 'border-emerald-200/70',  dot: 'bg-emerald-700' },
  { text: 'text-teal-900',     bg: 'bg-teal-50/60',     border: 'border-teal-200/70',     dot: 'bg-teal-700' },
  { text: 'text-sky-900',      bg: 'bg-sky-50/60',      border: 'border-sky-200/70',      dot: 'bg-sky-700' },
  { text: 'text-indigo-900',   bg: 'bg-indigo-50/60',   border: 'border-indigo-200/70',   dot: 'bg-indigo-700' },
  { text: 'text-fuchsia-900',  bg: 'bg-fuchsia-50/60',  border: 'border-fuchsia-200/70',  dot: 'bg-fuchsia-700' },
]

const NEUTRAL: TagColor = {
  text: 'text-ink-900',
  bg: 'bg-paper-200/60',
  border: 'border-rule',
  dot: 'bg-ink-700',
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
