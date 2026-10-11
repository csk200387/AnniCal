import { describe, expect, it } from 'vitest'
import { radioIndex } from '../src/components/ui/radioNavigation'

describe('single-choice keyboard navigation', () => {
  it('moves with horizontal and vertical arrows and wraps at both ends', () => {
    expect(radioIndex('ArrowRight', 2, 3)).toBe(0)
    expect(radioIndex('ArrowDown', 0, 3)).toBe(1)
    expect(radioIndex('ArrowLeft', 0, 3)).toBe(2)
    expect(radioIndex('ArrowUp', 2, 3)).toBe(1)
  })
  it('uses Home and End to reach the first and last choices', () => {
    expect(radioIndex('Home', 2, 4)).toBe(0)
    expect(radioIndex('End', 0, 4)).toBe(3)
  })
  it('leaves native Tab, Enter and Space behaviour alone', () => {
    for (const key of ['Tab', 'Enter', ' ', 'Escape']) expect(radioIndex(key, 0, 3)).toBeNull()
  })
  it('handles a single choice and empty results without moving outside the group', () => {
    expect(radioIndex('ArrowLeft', 0, 1)).toBe(0)
    expect(radioIndex('End', 0, 0)).toBeNull()
  })
})
