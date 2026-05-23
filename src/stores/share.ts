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

  function open(anv: Anniversary, d?: number) {
    anniversary.value = anv
    dDay.value = d
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    anniversary.value = null
    dDay.value = undefined
  }

  return { isOpen, anniversary, dDay, open, close }
})
