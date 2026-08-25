import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import type { DetailStats, RankedAnniversary, StatsSnapshot } from '@/types/stats'

function finiteCount(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : null
}

function parseSnapshot(value: unknown): StatsSnapshot | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  const visitorsToday = finiteCount(raw.visitorsToday)
  const visitorsTotal = finiteCount(raw.visitorsTotal)
  const pageViewsTotal = finiteCount(raw.pageViewsTotal)
  if (visitorsToday === null || visitorsTotal === null || pageViewsTotal === null) return null

  const ranking: RankedAnniversary[] = []
  if (Array.isArray(raw.ranking)) {
    for (const candidate of raw.ranking) {
      if (!candidate || typeof candidate !== 'object') continue
      const entry = candidate as Record<string, unknown>
      const views = finiteCount(entry.views)
      if (typeof entry.id === 'string' && views !== null) ranking.push({ id: entry.id, views })
    }
  }

  let detail: DetailStats | undefined
  if (raw.detail && typeof raw.detail === 'object') {
    const candidate = raw.detail as Record<string, unknown>
    const views = finiteCount(candidate.views)
    const rank = candidate.rank === null ? null : finiteCount(candidate.rank)
    const hasValidRank = candidate.rank === null || rank !== null
    if (typeof candidate.id === 'string' && views !== null && hasValidRank) {
      detail = { id: candidate.id, views, rank: rank && rank > 0 ? rank : null }
    }
  }
  return { visitorsToday, visitorsTotal, pageViewsTotal, ranking, detail }
}

function createEventId(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80
  const hex = [...bytes].map((n) => n.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export const useStatsStore = defineStore('stats', () => {
  const snapshot = shallowRef<StatsSnapshot | null>(null)
  const detailById = shallowRef<Record<string, DetailStats>>({})
  const isLoading = shallowRef(false)
  const isAvailable = computed(() => snapshot.value !== null)
  // 최초 요청이 끝나기 전(true/false 둘 다 모름)에는 통계 블록을 숨기지 않는다 —
  // 0으로 먼저 그려 두었다가 응답이 오면 그 값으로 애니메이션한다. 최초 요청이
  // 끝났는데도 snapshot 이 없으면(Redis 미연결 등) 그때 가서 확정적으로 숨긴다.
  const hasSettled = shallowRef(false)
  const isUnavailable = computed(() => hasSettled.value && snapshot.value === null)
  let latestRequest = 0

  function apply(next: StatsSnapshot, request: number): void {
    // 서로 다른 페이지의 요청이 겹쳐도 숫자가 뒤로 가지 않게 한다.
    const previous = snapshot.value
    if (!previous || request >= latestRequest) {
      snapshot.value = previous
        ? {
            ...next,
            visitorsToday: Math.max(previous.visitorsToday, next.visitorsToday),
            visitorsTotal: Math.max(previous.visitorsTotal, next.visitorsTotal),
            pageViewsTotal: Math.max(previous.pageViewsTotal, next.pageViewsTotal),
          }
        : next
      latestRequest = request
    }
    if (next.detail) {
      const old = detailById.value[next.detail.id]
      detailById.value = {
        ...detailById.value,
        [next.detail.id]: old && old.views > next.detail.views ? old : next.detail,
      }
    }
  }

  async function request(url: string, init?: RequestInit): Promise<StatsSnapshot | null> {
    const response = await fetch(url, init)
    if (!response.ok) return null
    return parseSnapshot(await response.json())
  }

  async function refresh(anniversaryId: string | null = null): Promise<void> {
    const requestNumber = ++latestRequest
    isLoading.value = true
    try {
      const query = anniversaryId ? `?id=${encodeURIComponent(anniversaryId)}` : ''
      const next = await request(`/api/stats${query}`)
      if (next) apply(next, requestNumber)
    } catch {
      // 통계는 부가 기능이다. 본문을 오류 상태로 만들거나 콘솔을 더럽히지 않는다.
    } finally {
      if (requestNumber === latestRequest) isLoading.value = false
      hasSettled.value = true
    }
  }

  async function trackPage(anniversaryId: string | null = null): Promise<void> {
    // 브라우저의 추적 거부 의사는 존중하되, 공개된 집계값은 그대로 보여준다.
    if (navigator.doNotTrack === '1') {
      await refresh(anniversaryId)
      return
    }

    const requestNumber = ++latestRequest
    isLoading.value = true
    try {
      const next = await request('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: createEventId(), anniversaryId }),
      })
      if (next) apply(next, requestNumber)
    } catch {
      // Redis 미연결·오프라인이어도 사이트의 핵심 기능은 그대로 동작한다.
    } finally {
      if (requestNumber === latestRequest) isLoading.value = false
      hasSettled.value = true
    }
  }

  return {
    snapshot,
    detailById,
    isLoading,
    isAvailable,
    isUnavailable,
    refresh,
    trackPage,
  }
})
