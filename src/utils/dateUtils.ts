import dayjs from 'dayjs'
import type { Anniversary } from '@/types/anniversary'

/**
 * 임의의 Anniversary 가 "특정 연도의 어떤 Date 에 해당하는가"를 계산.
 * - annual-fixed("MM-DD") → 해당 연도의 같은 월/일
 * - annual-floating / one-time("YYYY-MM-DD") → 그 자체
 */
export function resolveOccurrence(anv: Anniversary, year: number): Date {
  if (anv.dateType === 'annual-fixed') {
    const [mm, dd] = anv.date.split('-').map(Number)
    return new Date(year, mm - 1, dd)
  }
  return dayjs(anv.date).toDate()
}

/** 오늘 일어나는 기념일인지 (연도 무시, 월/일 기준) */
export function isToday(anv: Anniversary, today: Date = new Date()): boolean {
  const occurrence = resolveOccurrence(anv, today.getFullYear())
  return (
    occurrence.getMonth() === today.getMonth() &&
    occurrence.getDate() === today.getDate()
  )
}

/** 오늘로부터 며칠 남았는지 (음수면 이미 지남) */
export function daysUntil(anv: Anniversary, from: Date = new Date()): number {
  const todayStart = dayjs(from).startOf('day')
  const occurrenceThisYear = resolveOccurrence(anv, from.getFullYear())
  let target = dayjs(occurrenceThisYear).startOf('day')

  // 이미 지났다면 내년으로 (annual-fixed 한정).
  if (anv.dateType === 'annual-fixed' && target.isBefore(todayStart)) {
    target = dayjs(resolveOccurrence(anv, from.getFullYear() + 1)).startOf('day')
  }

  return target.diff(todayStart, 'day')
}

/** 한국식 날짜 표기 ("3월 14일") */
export function formatKoreanMonthDay(anv: Anniversary, year: number = new Date().getFullYear()): string {
  const d = resolveOccurrence(anv, year)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/**
 * 특정 (year, month, day) 에 발생하는 기념일인지.
 * - annual-fixed: 월/일만 비교
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
  const d = dayjs(anv.date)
  return d.year() === year && d.month() + 1 === month && d.date() === day
}
