import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Anniversary } from '@/types/anniversary'
import type { Category } from '@/types/category'
import {
  anniversaryRepository,
  categoryRepository,
} from '@/services/anniversaryRepository'

export const useAnniversariesStore = defineStore('anniversaries', () => {
  const items = ref<Anniversary[]>([])
  const categories = ref<Category[]>([])
  const isLoaded = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    if (isLoaded.value || isLoading.value) return
    isLoading.value = true
    error.value = null
    try {
      const [anvs, cats] = await Promise.all([
        anniversaryRepository.findAll(),
        categoryRepository.findAll(),
      ])
      items.value = anvs
      categories.value = cats
      isLoaded.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
      isLoading.value = false
    }
  }

  return { items, categories, isLoaded, isLoading, error, load }
})
