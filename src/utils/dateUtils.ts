import dayjs from 'dayjs'
import type { Anniversary } from '@/types/anniversary'
import anniversariesJson from '@/data/anniversaries.json'

const DOW_MAP: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
}

let anchorById: Map<string, Anniversary> | null = null

/** "{anchorId}:{offsetDays}" 를 기준 Anniversary 와 오프셋(일)으로 분해. */
function resolveAnchor(dateStr: string): { anchor: Anniversary; offsetDays: number } {
  const sepIdx = dateStr.lastIndexOf(':')
  const anchorId = dateStr.slice(0, sepIdx)
  const offsetDays = Number(dateStr.slice(sepIdx + 1))

  if (!anchorById) {
    anchorById = new Map((anniversariesJson as Anniversary[]).map((a) => [a.id, a]))
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
    anv.dateType === 'annual-relative-to-holiday'
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
  if (anv.dateType === 'annual-relative-to-holiday') {
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
