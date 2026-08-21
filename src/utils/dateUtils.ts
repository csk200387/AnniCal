import dayjs from 'dayjs'
// 서버리스 함수(Node ESM)에서도 컴파일되도록 상대경로 타입 import 사용.
import type { Anniversary } from '../types/anniversary.js'
// Node ESM 런타임에서 JSON import 는 import 속성이 필수 (all.ts 와 같은 규칙).
import observancesJson from '../data/observances.json' with { type: 'json' }

const DOW_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

/**
 * annual-tabulated 용 연도별 발생일 표. { 키: { "2026": "02-17", … } }
 *
 * 음력 명절(설날·추석)은 양력과 규칙적인 관계가 없고, 24절기는 태양 황경으로
 * 정의돼 천문 계산이 필요하다. 둘 다 런타임에서 계산하는 대신 미리 뽑아 둔다.
 * 표는 tools/observances/generate_observances.py 가 만든다.
 */
const observances = observancesJson as Record<string, Record<string, string>>

/** 표에 수록된 연도 범위. 벗어나면 가장 가까운 연도로 물러선다. */
const observanceYears = (() => {
  const first = Object.values(observances)[0] ?? {}
  const ys = Object.keys(first).map(Number).sort((a, b) => a - b)
  return { min: ys[0] ?? 0, max: ys[ys.length - 1] ?? 0 }
})()

/** annual-tabulated 표가 담고 있는 연도 범위. ics 가 RDATE 를 채울 때 쓴다. */
export function tabulatedYearRange(): { min: number; max: number } {
  return observanceYears
}

/**
 * 표에서 해당 연도의 MM-DD 를 찾는다.
 *
 * 수록 범위를 벗어난 연도는 가장 가까운 연도 값으로 대신한다. 24절기는 해마다
 * 하루 안팎만 움직여 이 근사가 무해하지만, 음력 명절은 크게 어긋난다.
 * 범위를 넓히려면 생성기의 연도 범위를 늘려 표를 다시 만들 것.
 */
function resolveTabulated(key: string, year: number): Date {
  const row = observances[key]
  if (!row) {
    throw new Error(`annual-tabulated: observances.json 에 없는 키 "${key}"`)
  }
  const clamped = Math.min(Math.max(year, observanceYears.min), observanceYears.max)
  const md = row[String(clamped)]
  if (!md) {
    throw new Error(`annual-tabulated: "${key}" 에 ${clamped}년 값이 없습니다`)
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
  return { anchor, offsetDays }
}

/**
 * "MM-N-DOW" 규칙을 특정 연도의 Date 로 변환.
 *   N: 1~5 또는 'L'(마지막).
 *   예) ('2026', '05-2-SUN') → 2026-05-10
 */
function resolveNthWeekday(year: number, dateStr: string): Date {
  const [mmStr, nStr, dowStr] = dateStr.split('-')
  const month = Number(mmStr) - 1 // 0-indexed
  const dow = DOW_MAP[dowStr.toUpperCase()]

  if (nStr.toUpperCase() === 'L') {
    // 그 달 마지막 날에서 거꾸로 가장 가까운 같은 요일.
    const lastDay = new Date(year, month + 1, 0)
    const offset = (lastDay.getDay() - dow + 7) % 7
    return new Date(year, month, lastDay.getDate() - offset)
  }

  const n = Number(nStr)
  const first = new Date(year, month, 1)
  const firstOccurrenceDay = 1 + ((dow - first.getDay() + 7) % 7)
  return new Date(year, month, firstOccurrenceDay + (n - 1) * 7)
}

/**
 * Anniversary 가 "특정 연도" 에 떨어지는 Date 를 계산.
 * - annual-fixed("MM-DD")                       → 같은 연도의 그 월/일
 * - annual-nth-weekday("MM-N-DOW")               → 같은 연도의 N째 요일
 * - annual-relative-to-holiday("anchorId:N일")   → anchor 의 같은 연도 occurrence + N일
 * - annual-tabulated("키")                       → observances.json 에서 그 연도의 날짜 조회
 * - annual-floating / one-time                  → 저장된 YYYY-MM-DD 그대로
 */
export function resolveOccurrence(anv: Anniversary, year: number): Date {
  if (anv.dateType === 'annual-fixed') {
    const [mm, dd] = anv.date.split('-').map(Number)
    return new Date(year, mm - 1, dd)
  }
  if (anv.dateType === 'annual-nth-weekday') {
    return resolveNthWeekday(year, anv.date)
  }
  if (anv.dateType === 'annual-relative-to-holiday') {
    const { anchor, offsetDays } = resolveAnchor(anv.date)
    return dayjs(resolveOccurrence(anchor, year)).add(offsetDays, 'day').toDate()
  }
  if (anv.dateType === 'annual-tabulated') {
    return resolveTabulated(anv.date, year)
  }
  return dayjs(anv.date).toDate()
}

/** 오늘 일어나는 기념일인지. */
export function isToday(anv: Anniversary, today: Date = new Date()): boolean {
  const occurrence = resolveOccurrence(anv, today.getFullYear())
  return (
    occurrence.getFullYear() === today.getFullYear() &&
    occurrence.getMonth() === today.getMonth() &&
    occurrence.getDate() === today.getDate()
  )
}

/** 오늘로부터 며칠 남았는지 (음수면 이미 지남). */
export function daysUntil(anv: Anniversary, from: Date = new Date()): number {
  const todayStart = dayjs(from).startOf('day')
  const thisYear = from.getFullYear()
  let target = dayjs(resolveOccurrence(anv, thisYear)).startOf('day')

  // 매년 반복되는 타입은 올해 일정이 지났으면 내년으로 롤오버.
  const isRecurring =
    anv.dateType === 'annual-fixed' ||
    anv.dateType === 'annual-nth-weekday' ||
    anv.dateType === 'annual-relative-to-holiday' ||
    anv.dateType === 'annual-tabulated'
  if (isRecurring && target.isBefore(todayStart)) {
    target = dayjs(resolveOccurrence(anv, thisYear + 1)).startOf('day')
  }

  return target.diff(todayStart, 'day')
}

/** 한국식 날짜 표기 ("3월 14일"). */
export function formatKoreanMonthDay(
  anv: Anniversary,
  year: number = new Date().getFullYear(),
): string {
  const d = resolveOccurrence(anv, year)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
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
  if (anv.dateType === 'annual-nth-weekday') {
    const occ = resolveNthWeekday(year, anv.date)
    return (
      occ.getMonth() + 1 === month &&
      occ.getDate() === day
    )
  }
  if (
    anv.dateType === 'annual-relative-to-holiday' ||
    anv.dateType === 'annual-tabulated'
  ) {
    const occ = resolveOccurrence(anv, year)
    return (
      occ.getFullYear() === year &&
      occ.getMonth() + 1 === month &&
      occ.getDate() === day
    )
  }
  const d = dayjs(anv.date)
  return d.year() === year && d.month() + 1 === month && d.date() === day
}
