import { onScopeDispose, ref, watch, type Ref } from 'vue'

/**
 * source 가 바뀔 때마다 표시값을 현재 값에서 새 값까지 서서히 올린다.
 * source 가 null 인 동안(데이터를 아직 못 받아온 상태)은 0을 보여준다 —
 * 통계 블록을 API 응답 전에도 바로 그려서 나중에 팝업되는 느낌을 없애기 위함.
 */
export function useCountUp(source: Ref<number | null>, durationMs = 700): Readonly<Ref<number>> {
  const display = ref(0)
  let frame: number | null = null

  function animateTo(target: number): void {
    if (frame !== null) cancelAnimationFrame(frame)
    const start = display.value
    const delta = target - start
    if (delta === 0) return
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / durationMs, 1)
      const eased = 1 - (1 - progress) ** 3
      display.value = Math.round(start + delta * eased)
      frame = progress < 1 ? requestAnimationFrame(step) : null
    }
    frame = requestAnimationFrame(step)
  }

  watch(
    source,
    (value) => {
      if (value !== null) animateTo(value)
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    if (frame !== null) cancelAnimationFrame(frame)
  })

  return display
}
