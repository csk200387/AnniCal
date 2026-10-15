// 화면의 로딩 판정은 "이 화면에 필요한 달이 있는가"로만 한다(composables/useMonths.ts).
import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { computed, effectScope, watch } from 'vue'
import { useDateHub } from '@/features/day/composables/useDayPages'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { monthsCovering } from '@/services/anniversaryRepository'

describe('로딩 상태', () => {
  // 예전에는 어느 달이든 받는 동안 켜지는 전역 isLoading 을 봤다. 그래서 필요한 3개월을
  // 이미 받고 mount 한 날짜 허브가 뒤에서 나머지 9개월을 받는 동안 프리렌더 본문을
  // 스켈레톤으로 바꿨다가 되돌렸다 — main.ts 가 mount 를 미뤄 막으려던 바로 그 깜빡임이다.
  it('필요한 달을 이미 받은 날짜 허브는 나머지 달을 받는 동안에도 ready 를 유지한다', async () => {
    setActivePinia(createPinia())
    const store = useAnniversariesStore()
    // main.ts warmInitialRoute(): 이 날짜에 필요한 3개월만 받은 뒤 mount 한다.
    await store.ensureMonths(monthsCovering(5))

    const seen: string[] = []
    const scope = effectScope()
    scope.run(() => {
      const hub = useDateHub(computed(() => '05-10'))
      watch(hub.state, (state) => seen.push(state), { immediate: true, flush: 'sync' })
    })
    await store.ensureAll()
    scope.stop()

    expect(store.isComplete).toBe(true)
    expect(seen).toEqual(['ready'])
  })
})
