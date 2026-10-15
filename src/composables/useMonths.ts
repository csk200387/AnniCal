import { computed, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useAnniversariesStore } from '@/stores/anniversaries'

/**
 * 화면에 필요한 달을 받아 오고, 그 달들이 들어왔는지로 로딩·오류 상태를 낸다.
 *
 * 로딩은 "이 화면에 필요한 달이 아직 없다"일 때만이다. prefetchAll 로 나머지 달을
 * 뒤에서 받는 동안에도 필요한 달이 이미 있으면 화면은 그대로 둔다 — 그래야
 * 프리렌더된 본문이 mount 직후 스켈레톤으로 바뀌었다 돌아오는 깜빡임이 없다.
 */
export function useMonths(
  months: MaybeRefOrGetter<readonly number[]>,
  { prefetchAll = false } = {},
) {
  const store = useAnniversariesStore()

  async function load(): Promise<void> {
    await store.ensureMonths(toValue(months))
    // 첫 화면을 막지 않고 나머지 달을 뒤이어 받는다. 다른 화면으로 넘어갈 때 이미 와 있게 된다.
    if (prefetchAll) void store.ensureAll()
  }
  watch(() => toValue(months), () => void load(), { immediate: true })

  const ready = computed(() => store.hasMonths(toValue(months)))
  return {
    ready,
    loading: computed(() => !ready.value && !store.error),
    error: computed(() => (ready.value ? null : store.error)),
    retry: load,
  }
}
