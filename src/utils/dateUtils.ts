import dayjs from 'dayjs'
// 서버리스 함수(Node ESM)에서도 컴파일되도록 상대경로 타입 import 사용.
import type { Anniversary } from '../types/anniversary.js'
// Node ESM 런타임에서 JSON import 는 import 속성이 필수 (all.ts 와 같은 규칙).
import observancesJson from '../data/observances.json' with { type: 'json' }

const DOW_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

/** anchor 참조 사슬의 최대 깊이. 이보다 깊으면 데이터가 잘못된 것이다. */
const MAX_ANCHOR_DEPTH = 8

/** 표에 수록되지 않은 연도를 물었을 때. 호출부가 "모름"과 "오류"를 구분하도록. */
export class OutOfTableRangeError extends Error {
  constructor(readonly key: string, readonly year: number, readonly min: number, readonly max: number) {
    super(`annual-tabulated: "${key}" 는 ${min}~${max}년만 수록돼 있어 ${year}년을 알 수 없습니다`)
    this.name = 'OutOfTableRangeError'
  }
}

/**
 * annual-tabulated 용 연도별 발생일 표. { 키: { "2026": "02-17", … } }
 *
 * 음력 명절(설날·추석)은 양력과 규칙적인 관계가 없고, 24절기는 태양 황경으로
 * 정의돼 천문 계산이 필요하다. 둘 다 런타임에서 계산하는 대신 미리 뽑아 둔다.
 * 표는 tools/observances/generate_observances.py 가 만든다.
 */
const observances = observancesJson as Record<string, Record<string, string>>

/**
 * 표에 수록된 연도 범위.
 *
 * 예전에는 첫 row 하나만 보고 전역 범위를 추론했는데, row 마다 범위가 다르면
 * 조용히 어긋난다. 모든 row 의 교집합을 쓴다 — 어떤 키를 묻든 답할 수 있는 구간.
 */
const observanceYears = (() => {
  const rows = Object.values(observances)
  if (!rows.length) return { min: 0, max: 0 }
  let min = -Infinity
  let max = Infinity
  for (const row of rows) {
    const ys = Object.keys(row).map(Number).filter(Number.isFinite)
    if (!ys.length) continue
    min = Math.max(min, Math.min(...ys))
    max = Math.min(max, Math.max(...ys))
  }
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : { min: 0, max: 0 }
})()

/** annual-tabulated 표가 담고 있는 연도 범위. ics 가 RDATE 를 채울 때 쓴다. */
export function tabulatedYearRange(): { min: number; max: number } {
  return observanceYears
}

/** 그 연도를 표에서 답할 수 있는지. 달력이 이동 범위를 정할 때 쓴다. */
export function isYearSupported(year: number): boolean {
  return year >= observanceYears.min && year <= observanceYears.max
}

/**
 * 표에서 해당 연도의 MM-DD 를 찾는다.
 *
 * 수록 범위를 벗어나면 예외를 던진다. 예전에는 가장 가까운 연도로 clamp 했는데,
 * 24절기는 하루 안팎이라 무해해도 음력 명절은 완전히 다른 날짜가 된다
 * (2051년 설날을 2050년 날짜로 표시하는 식). 모르는 건 모른다고 해야 한다.
 * 범위를 넓히려면 생성기의 연도 범위를 늘려 표를 다시 만들 것.
 */
function resolveTabulated(key: string, year: number): Date {
  const row = observances[key]
  if (!row) {
    throw new Error(`annual-tabulated: observances.json 에 없는 키 "${key}"`)
  }
  const md = row[String(year)]
  if (!md) {
    throw new OutOfTableRangeError(key, year, observanceYears.min, observanceYears.max)
  }
  const [mm, dd] = md.split('-').map(Number)
  return new Date(year, mm - 1, dd)
}

// annual-relative-to-holiday 의 anchor 조회용 맵.
// 데이터가 동적 로드로 바뀌어 더 이상 여기서 정적 import 하지 않으므로,
// 스토어가 로드 직후 registerAnchors() 로 주입한다.
let anchorById: Map<string, Anniversary> | null = null

/** 전체 기념일 리스트로 anchor 조회 맵을 등록. (anniversaries 스토어 load 시 호출) */
export function registerAnchors(items: Anniversary[]): void {
  anchorById = new Map(items.map((a) => [a.id, a]))
}

/** "{anchorId}:{offsetDays}" 를 기준 Anniversary 와 오프셋(일)으로 분해. */
function resolveAnchor(dateStr: string): { anchor: Anniversary; offsetDays: number } {
  const sepIdx = dateStr.lastIndexOf(':')
  const anchorId = dateStr.slice(0, sepIdx)
  const offsetDays = Number(dateStr.slice(sepIdx + 1))

  if (!anchorById) {
    throw new Error(
      'annual-relative-to-holiday: anchor 맵이 아직 등록되지 않았습니다. registerAnchors() 가 선행되어야 합니다.',
    )
  }
  const anchor = anchorById.get(anchorId)
  if (!anchor) {
    throw new Error(`annual-relative-to-holiday: 알 수 없는 anchor id "${anchorId}"`)
  }
  if (!Number.isFinite(offsetDays)) {
    throw new Error(`annual-relative-to-holiday: 잘못된 offset "${dateStr}"`)
  }
  return { anchor, offsetDays }
}

/**
 * "MM-N-DOW" 규칙을 특정 연도의 Date 로 변환.
 *   N: 1~5 또는 'L'(마지막).
 *   예) ('2026', '05-2-SUN') → 2026-05-10
 *
 * N=5 인데 그 달에 다섯째 해당 요일이 없는 해가 있다. 그대로 더하면 JS Date 가
 * 다음 달로 넘겨 버려 5월 기념일이 6월에 뜬다. 그 달 안의 마지막 발생일로 되돌린다.
 */
function resolveNthWeekday(year: number, dateStr: string): Date {
  const [mmStr, nStr, dowStr] = dateStr.split('-')
  const month = Number(mmStr) - 1 // 0-indexed
  const dow = DOW_MAP[(dowStr ?? '').toUpperCase()]

  if (dow === undefined || !Number.isInteger(month) || month < 0 || month > 11) {
    throw new Error(`annual-nth-weekday: 해석할 수 없는 규칙 "${dateStr}"`)
  }

  const lastDay = new Date(year, month + 1, 0)
  const lastOccurrence = lastDay.getDate() - ((lastDay.getDay() - dow + 7) % 7)

  if ((nStr ?? '').toUpperCase() === 'L') {
    return new Date(year, month, lastOccurrence)
  }

  const n = Number(nStr)
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw new Error(`annual-nth-weekday: 서수 "${nStr}" 가 1~5 또는 L 이 아닙니다`)
  }
  const first = new Date(year, month, 1)
  const firstOccurrenceDay = 1 + ((dow - first.getDay() + 7) % 7)
  const day = firstOccurrenceDay + (n - 1) * 7
  return new Date(year, month, Math.min(day, lastOccurrence))
}

/**
 * Anniversary 가 "특정 연도" 에 떨어지는 Date 를 계산.
 * - annual-fixed("MM-DD")                       → 같은 연도의 그 월/일
 * - annual-nth-weekday("MM-N-DOW")               → 같은 연도의 N째 요일
 * - annual-relative-to-holiday("anchorId:N일")   → anchor 의 같은 연도 occurrence + N일
 * - annual-tabulated("키")                       → observances.json 에서 그 연도의 날짜 조회
 * - annual-floating / one-time                  → 저장된 YYYY-MM-DD 그대로
 *
 * 해석할 수 없으면 예외를 던진다. "일어나는가"만 알면 되는 호출부는
 * resolveOccurrenceSafe 를 쓸 것.
 */
export function resolveOccurrence(anv: Anniversary, year: number, _depth = 0): Date {
  if (anv.dateType === 'annual-fixed') {
    const [mm, dd] = anv.date.split('-').map(Number)
    return new Date(year, mm - 1, dd)
  }
  if (anv.dateType === 'annual-nth-weekday') {
    return resolveNthWeekday(year, anv.date)
  }
  if (anv.dateType === 'annual-relative-to-holiday') {
    // 데이터가 순환하면(A→B→A) 가드 없이는 스택이 터지고, 그 예외가 computed
    // 전체를 무너뜨려 피드·달력이 통째로 빈 화면이 된다. 편집 도구가 순환 저장을
    // 막지만 런타임도 스스로를 지킨다.
    if (_depth >= MAX_ANCHOR_DEPTH) {
      throw new Error(
        `annual-relative-to-holiday: anchor 사슬이 너무 깊습니다(${MAX_ANCHOR_DEPTH}단계 초과) — "${anv.id}" 에서 순환 가능성`,
      )
    }
    const { anchor, offsetDays } = resolveAnchor(anv.date)
    return dayjs(resolveOccurrence(anchor, year, _depth + 1)).add(offsetDays, 'day').toDate()
  }
  if (anv.dateType === 'annual-tabulated') {
    return resolveTabulated(anv.date, year)
  }
  return dayjs(anv.date).toDate()
}

/** 해석 실패를 null 로 돌려주는 판. 목록 필터처럼 실패해도 넘어가야 하는 곳에서 쓴다. */
export function resolveOccurrenceSafe(anv: Anniversary, year: number): Date | null {
  try {
    const d = resolveOccurrence(anv, year)
    return Number.isNaN(d.getTime()) ? null : d
  } catch {
    return null
  }
}

/** 매년 반복되는 타입인지. */
export function isRecurring(anv: Anniversary): boolean {
  return (
    anv.dateType === 'annual-fixed' ||
    anv.dateType === 'annual-nth-weekday' ||
    anv.dateType === 'annual-relative-to-holiday' ||
    anv.dateType === 'annual-tabulated'
  )
}

/** 오늘 일어나는 기념일인지. `today` 는 사이트 기준 시각(clock.ts)을 넘길 것. */
export function isToday(anv: Anniversary, today: Date = new Date()): boolean {
  const occurrence = resolveOccurrenceSafe(anv, today.getFullYear())
  if (!occurrence) return false
  return (
    occurrence.getFullYear() === today.getFullYear() &&
    occurrence.getMonth() === today.getMonth() &&
    occurrence.getDate() === today.getDate()
  )
}

/** 오늘로부터 며칠 남았는지 (음수면 이미 지남). 계산 불가면 null. */
export function daysUntil(anv: Anniversary, from: Date = new Date()): number | null {
  const todayStart = dayjs(from).startOf('day')
  const thisYear = from.getFullYear()
  const thisYearDate = resolveOccurrenceSafe(anv, thisYear)
  if (!thisYearDate) return null

  let target = dayjs(thisYearDate).startOf('day')

  // 매년 반복되는 타입은 올해 일정이 지났으면 내년으로 롤오버.
  if (isRecurring(anv) && target.isBefore(todayStart)) {
    const nextYearDate = resolveOccurrenceSafe(anv, thisYear + 1)
    if (!nextYearDate) return null
    target = dayjs(nextYearDate).startOf('day')
  }

  return target.diff(todayStart, 'day')
}

/** 한국식 날짜 표기 ("3월 14일"). 계산 불가면 null. */
export function formatKoreanMonthDay(
  anv: Anniversary,
  year: number = new Date().getFullYear(),
): string | null {
  const d = resolveOccurrenceSafe(anv, year)
  return d ? `${d.getMonth() + 1}월 ${d.getDate()}일` : null
}

/**
 * 특정 (year, month, day) 에 발생하는 기념일인지.
 * - annual-fixed:               월/일만 비교
 * - annual-nth-weekday:         해당 연도의 규칙 해석 결과와 비교
 * - annual-relative-to-holiday: 해당 연도의 anchor 기준 occurrence 와 비교
 * - annual-tabulated:           observances.json 에서 조회한 날짜와 비교
 * - annual-floating / one-time: 연/월/일 모두 비교
 * month 는 1~12.
 */
export function occursOn(
  anv: Anniversary,
  year: number,
  month: number,
  day: number,
): boolean {
  if (anv.dateType === 'annual-fixed') {
    const [mm, dd] = anv.date.split('-').map(Number)
    return mm === month && dd === day
  }
  if (
    anv.dateType === 'annual-nth-weekday' ||
    anv.dateType === 'annual-relative-to-holiday' ||
    anv.dateType === 'annual-tabulated'
  ) {
    const occ = resolveOccurrenceSafe(anv, year)
    return (
      !!occ &&
      occ.getFullYear() === year &&
      occ.getMonth() + 1 === month &&
      occ.getDate() === day
    )
  }
  const d = dayjs(anv.date)
  return d.year() === year && d.month() + 1 === month && d.date() === day
}
