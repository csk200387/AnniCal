export interface RankedAnniversary {
  id: string
  views: number
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
