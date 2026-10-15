/** Roving focus for single-choice button groups; native buttons handle Space/Enter. */
export function radioIndex(key: string, index: number, count: number): number | null {
  if (!count) return null
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  if (key === 'ArrowRight' || key === 'ArrowDown') return (index + 1) % count
  if (key === 'ArrowLeft' || key === 'ArrowUp') return (index + count - 1) % count
  return null
}
export function navigateRadios(event: KeyboardEvent) {
  if (!(event.currentTarget instanceof HTMLElement) || !(event.target instanceof HTMLElement))
    return
  const buttons = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)'),
  )
  const target = event.target
  const index = buttons.findIndex((button) => button === target || button.contains(target))
  if (index < 0) return
  const next = radioIndex(event.key, index, buttons.length)
  if (next === null) return
  event.preventDefault()
  buttons[next].focus({ preventScroll: true })
  buttons[next].click()
  buttons[next].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' })
}
