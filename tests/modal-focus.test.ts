import { describe, expect, it } from 'vitest'
import { tabBoundary } from '../src/composables/modalFocus'

describe('modal Tab boundaries', () => {
  it('wraps forward from the last control and backward from the first', () => {
    expect(tabBoundary(2, 3, false)).toBe(0)
    expect(tabBoundary(0, 3, true)).toBe(2)
  })
  it('enters the controls from the focused dialog or an outside element', () => {
    expect(tabBoundary(-1, 3, false)).toBe(0)
    expect(tabBoundary(-1, 3, true)).toBe(2)
  })
  it('leaves native traversal alone between boundaries', () => {
    expect(tabBoundary(1, 3, false)).toBeNull()
    expect(tabBoundary(1, 3, true)).toBeNull()
  })
  it('keeps a single control focused and handles no enabled controls', () => {
    expect(tabBoundary(0, 1, false)).toBe(0)
    expect(tabBoundary(0, 1, true)).toBe(0)
    expect(tabBoundary(-1, 0, false)).toBeNull()
  })
})
