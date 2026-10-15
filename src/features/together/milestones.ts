// 날짜 산술은 UTC 구성요소로 계산해 브라우저의 DST에 영향받지 않는다.
import { todayInSiteZone } from '../../utils/clock.js'

export const DAY_MILESTONES = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7000,
  8000, 9000, 10000,
] as const
export const MILESTONE_IDS = [
  ...DAY_MILESTONES.map((n) => `d${n}`),
  ...Array.from({ length: 50 }, (_, i) => `y${i + 1}`),
]
export interface TogetherContext {
  start: string
  m: string
  date: string
}
export interface Milestone {
  date: string
  ids: string[]
  labels: string[]
  daysAway: number
}

export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
export function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return isoDate(date) === value ? date : null
}
export function validStart(value: unknown, today = todayInSiteZone()): value is string {
  return (
    !!parseIsoDate(value) &&
    (value as string) >= '1950-01-01' &&
    (value as string) <= isoDate(today)
  )
}
export function milestoneLabel(id: string): string {
  return id.startsWith('d') ? `${id.slice(1)}일` : `${id.slice(1)}주년`
}
export function milestoneDate(start: string, id: string): string | null {
  const date = parseIsoDate(start)
  if (!date || !MILESTONE_IDS.includes(id)) return null
  const y = date.getFullYear(),
    m = date.getMonth(),
    d = date.getDate()
  if (id.startsWith('d'))
    return new Date(Date.UTC(y, m, d + Number(id.slice(1)) - 1)).toISOString().slice(0, 10)
  const year = y + Number(id.slice(1))
  const day = m === 1 && d === 29 ? Math.min(d, new Date(Date.UTC(year, 2, 0)).getUTCDate()) : d
  return new Date(Date.UTC(year, m, day)).toISOString().slice(0, 10)
}
export function milestones(start: string, today = todayInSiteZone()): Milestone[] {
  if (!validStart(start, today)) return []
  return mergeMilestones(
    MILESTONE_IDS.map((id) => ({ id, date: milestoneDate(start, id)! })),
    today,
  )
}
/** 일수와 주년이 같은 날이면 타임라인에는 한 항목으로 표시한다. */
export function mergeMilestones(
  dated: Array<{ id: string; date: string }>,
  today: Date,
): Milestone[] {
  const todayMs = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
  const grouped = new Map<string, Milestone>()
  for (const { id, date } of dated) {
    let row = grouped.get(date)
    if (!row) {
      row = {
        date,
        ids: [],
        labels: [],
        daysAway: (Date.parse(date + 'T00:00:00Z') - todayMs) / 86400000,
      }
      grouped.set(date, row)
    }
    row.ids.push(id)
    row.labels.push(milestoneLabel(id))
  }
  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function milestoneWindow(start: string, today = todayInSiteZone()) {
  const all = milestones(start, today)
  const upcoming = all.filter((row) => row.daysAway >= 0)
  return {
    next: upcoming[0] ?? null,
    later: upcoming.slice(1, 6),
    past: all
      .filter((row) => row.daysAway < 0)
      .slice(-2)
      .reverse(),
  }
}
export function togetherPath(context: TogetherContext, pick?: string): string {
  const query = new URLSearchParams({ start: context.start, m: context.m })
  if (pick) query.set('pick', pick)
  return `/together?${query}`
}
