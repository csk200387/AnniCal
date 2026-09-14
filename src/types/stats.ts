export interface RankedAnniversary {
  id: string
  views: number
}

export interface MonthlyRanking {
  month: string
  currentMonth: string
  trackingStartedOn: string | null
  ranking: RankedAnniversary[]
}

export interface DetailStats {
  id: string
  views: number
  rank: number | null
}

export interface StatsSnapshot {
  visitorsToday: number
  visitorsTotal: number
  pageViewsTotal: number
  ranking: RankedAnniversary[]
  detail?: DetailStats
}
