import { describe, expect, it } from 'vitest'
import { BoundedCache } from '../server/boundedCache'

describe('메모리 예산이 있는 LRU 캐시', () => {
  it('조회한 항목을 유지하고 가장 오래 사용하지 않은 항목을 퇴출한다', () => {
    const cache = new BoundedCache<string>(2, 100)
    cache.set('a', 'first', 10)
    cache.set('b', 'second', 10)
    expect(cache.get('a')).toBe('first')
    cache.set('c', 'third', 10)
    expect(cache.get('b')).toBeUndefined()
    expect(cache.get('a')).toBe('first')
    expect(cache.size).toBe(2)
  })

  it('바이트 예산을 초과하면 여러 항목을 퇴출하고 과대 응답은 저장하지 않는다', () => {
    const cache = new BoundedCache<string>(10, 100)
    cache.set('a', 'first', 40)
    cache.set('b', 'second', 40)
    cache.set('c', 'third', 90)
    expect(cache.size).toBe(1)
    expect(cache.retainedBytes).toBe(90)
    cache.set('large', 'not cached', 101)
    expect(cache.get('large')).toBeUndefined()
    expect(cache.get('c')).toBe('third')
    cache.set('c', 'replacement', 10)
    expect(cache.retainedBytes).toBe(10)
  })
})
