import { isValidUrlDate } from '@/utils/anniversaryRoutes'
import { isYearSupported } from '@/utils/dateUtils'

export interface BirthdayContext {
  date: string
  year: number
}

/** 2월 29일도 생일로 선택할 수 있다. */
export function birthdayDays(month: number): number {
  return Number.isInteger(month) && month >= 1 && month <= 12
    ? new Date(2024, month, 0).getDate() : 0
}

export function parseBirthday(date: unknown, year: unknown, currentYear: number): BirthdayContext | null {
  if (typeof date !== 'string' || !isValidUrlDate(date)) return null
  const resolvedYear = year === undefined ? currentYear
    : typeof year === 'string' && /^\d{4}$/.test(year) ? Number(year) : NaN
  if (!isYearSupported(resolvedYear)) return null
  return { date, year: resolvedYear }
}

export function birthdayPath(context: BirthdayContext, id?: string): string {
  const query = new URLSearchParams({ date: context.date, year: String(context.year) })
  if (id) query.set('pick', id)
  return `/birthday?${query}`
}
