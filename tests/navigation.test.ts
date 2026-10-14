import { describe, expect, it } from 'vitest'
import { pageTransitionFor, primaryNavigation } from '../src/components/layout/navigation'

describe('primary navigation transitions', () => {
  it('slides in menu order for every pair, including 우리의 날', () => {
    expect(primaryNavigation.map(item => item.name)).toContain('together')
    for (const [fromIndex, from] of primaryNavigation.entries()) {
      for (const [toIndex, to] of primaryNavigation.entries()) {
        if (toIndex === fromIndex) continue
        expect(pageTransitionFor(to.name, from.name)).toBe(toIndex > fromIndex ? 'route-forward' : 'route-back')
      }
    }
  })

  it('keeps detail and fallback routes on the same horizontal axis', () => {
    expect(pageTransitionFor('day-detail', 'calendar')).toBe('route-forward')
    expect(pageTransitionFor('calendar', 'day-detail')).toBe('route-back')
    expect(pageTransitionFor('day-detail', 'date-hub')).toBe('route-forward')
    expect(pageTransitionFor('feed', undefined)).toBe('route-back')
    expect(pageTransitionFor('not-found', 'together')).toBe('route-forward')
  })
})
