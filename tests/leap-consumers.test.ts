import { describe, expect, it, vi } from 'vitest'

// Isolated in-memory candidate: no production data or URL-map writes.
vi.mock('../src/data/anniversaries/all.js', () => ({ allAnniversaries: [{
  id: 'test-leap', date: '02-29', dateType: 'annual-fixed', name: '윤일 테스트',
  category: 'general', tags: ['일반'], memes: [], sourceUrl: null,
  storytelling: { origin: '', anecdote: '' },
}] }))
vi.mock('../src/data/routes.json', () => ({ default: {
  'test-leap': { urlDate: '02-29', slug: 'test-leap' },
} }))

import { itemsOnDate, parseOgQuery } from '../server/og/query'
import { shareMeta } from '../server/shareMeta'

const parse = (query: string) => parseOgQuery(new URLSearchParams(query), 2026)

describe('윤일 서버 탐색 정책', () => {
  it('평년의 생일 선택은 유지하고 실제 허브는 비운다', () => {
    const birthday = parse('kind=birthday&date=02-29&year=2026&pick=test-leap')
    expect(birthday).not.toBe(404)
    expect(typeof birthday === 'object' && birthday.pick).toBe('test-leap')
    expect(itemsOnDate(2026, '02-29')).toEqual([])
    expect(itemsOnDate(2026, '03-01')).toEqual([])
    expect(itemsOnDate(2028, '02-29')).toHaveLength(1)
    const detail = parse('kind=detail&date=02-29&slug=test-leap&year=2026')
    expect(typeof detail === 'object' && detail.card.date).toBe('2월 29일')
    const meta = shareMeta(new URLSearchParams('page=birthday&date=02-29&year=2026&pick=test-leap'), new Date(2026, 0, 1))
    expect(meta.title).toContain('윤일 테스트')
    expect(meta.image).toContain('pick=test-leap')
  })
})
