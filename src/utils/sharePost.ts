import type { Anniversary } from '@/types/anniversary'
import { milestoneLabel, type TogetherContext } from '@/features/together/milestones'
import { displayName, koreanDate } from './format'
import type { BirthdayContext } from '@/features/birthday/birthday'
import { todayInSiteZone } from './clock'
import { resolveOccurrenceSafe } from './dateUtils'

export function shareMessageFor(
  anv: Anniversary,
  birthday?: BirthdayContext | null,
  today: Date = todayInSiteZone(),
  together?: TogetherContext | null,
): string {
  const name = displayName(anv.name)
  if (together) {
    return `우리 ${milestoneLabel(together.m)}은 ${koreanDate(together.date.slice(5))}, ${name}이래.\n기념일 도감에서 그날의 이야기를 함께 알아보세요.`
  }
  const occurrence = resolveOccurrenceSafe(anv, birthday?.year ?? today.getFullYear())
  // Preserve fixed dates (including February 29) instead of rolling them into March.
  const fixedDate = birthday?.date ?? (anv.dateType === 'annual-fixed' ? anv.date : null)
  const [month, day] = fixedDate
    ? fixedDate.split('-').map(Number)
    : [occurrence ? occurrence.getMonth() + 1 : null, occurrence?.getDate() ?? null]
  const isToday =
    (birthday?.year ?? occurrence?.getFullYear()) === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate()
  const dateLabel = month && day ? `${month}월${day}일` : '이날'
  return isToday
    ? `오늘은 무슨 날? ${name}.\nAnnical에서 자세한 정보를 알아보세요.`
    : `${dateLabel}은 무슨 날? ${name}.\nAnnical에서 다른 기념일을 구경해보세요.`
}
