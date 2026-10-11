import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

/** Only wrap Tab at a boundary; let the browser traverse everything in between. */
export function tabBoundary(index: number, count: number, backwards: boolean): number | null {
  if (count <= 0) return null
  if (index < 0) return backwards ? count - 1 : 0
  if (backwards && index === 0) return count - 1
  if (!backwards && index === count - 1) return 0
  return null
}

export function useModalFocus(open: Ref<boolean>, dialog: Ref<HTMLElement | null>, close: () => void) {
  let opener: HTMLElement | null = null
  let previousOverflow = ''
  let active = false
  const focusables = () => Array.from(dialog.value?.querySelectorAll<HTMLElement>(
    'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]',
  ) ?? []).filter(el => el.tabIndex >= 0 && el.getClientRects().length && el.getAttribute('aria-disabled') !== 'true')
  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); close(); return }
    if (event.key !== 'Tab') return
    const items = focusables()
    if (!items.length) { event.preventDefault(); dialog.value?.focus(); return }
    const next = tabBoundary(items.indexOf(document.activeElement as HTMLElement), items.length, event.shiftKey)
    if (next !== null) { event.preventDefault(); items[next]?.focus() }
  }
  function onFocusin(event: FocusEvent) {
    if (dialog.value && !dialog.value.contains(event.target as Node)) dialog.value.focus()
  }
  function release() {
    if (!active) return
    active = false
    document.removeEventListener('keydown', onKeydown)
    document.removeEventListener('focusin', onFocusin)
    document.body.style.overflow = previousOverflow
    if (opener?.isConnected) opener.focus({ preventScroll: true })
    opener = null
  }
  watch(open, async value => {
    if (!value) { release(); return }
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousOverflow = document.body.style.overflow
    active = true
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
    document.addEventListener('focusin', onFocusin)
    await nextTick()
    if (open.value) dialog.value?.focus({ preventScroll: true })
  }, { immediate: true })
  onBeforeUnmount(release)
}
