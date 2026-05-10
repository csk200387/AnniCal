import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { CategoryId } from '@/types/category'

const STORAGE_KEY = 'oddcal:preferences:v1'

interface PersistedShape {
  selectedCategories: CategoryId[]
}

function readPersisted(): PersistedShape | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PersistedShape) : null
  } catch {
    return null
  }
}

export const useUserPreferencesStore = defineStore('userPreferences', () => {
  const persisted = readPersisted()
  const selectedCategories = ref<CategoryId[]>(persisted?.selectedCategories ?? [])

  function toggleCategory(id: CategoryId) {
    const idx = selectedCategories.value.indexOf(id)
    if (idx >= 0) selectedCategories.value.splice(idx, 1)
    else selectedCategories.value.push(id)
  }

  watch(
    selectedCategories,
    (next) => {
      const payload: PersistedShape = { selectedCategories: next }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    },
    { deep: true },
  )

  return { selectedCategories, toggleCategory }
})
