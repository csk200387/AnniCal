import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Anniversary } from '@/types/anniversary'

/**
 * 공유 모달 글로벌 상태.
 * - dDay: 다가오는 기념일에서만 전달 (오늘의 기념일이면 undefined).
 */
export const useShareStore = defineStore('share', () => {
  const isOpen = ref(false)
  const anniversary = ref<Anniversary | null>(null)
  const dDay = ref<number | undefined>(undefined)
  /**
   * 이 세션에서 모달을 한 번이라도 열었는가.
   * AppShell 이 비동기 모달 청크를 계속 붙여 둘지 판단하는 데 쓴다 —
   * 닫을 때마다 언마운트하면 다시 열 때 청크를 또 받는다.
   */
  const hasOpened = ref(false)

  function open(anv: Anniversary, d?: number) {
    anniversary.value = anv
    dDay.value = d
    isOpen.value = true
    hasOpened.value = true
  }

  function close() {
    isOpen.value = false
    anniversary.value = null
    dDay.value = undefined
  }

  return { isOpen, anniversary, dDay, hasOpened, open, close }
})
