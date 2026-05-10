import type { Anniversary } from '@/types/anniversary'
import type { Category } from '@/types/category'
import anniversariesJson from '@/data/anniversaries.json'
import categoriesJson from '@/data/categories.json'

/**
 * 데이터 소스 추상화 레이어.
 *
 * 현재는 정적 JSON 을 그대로 반환하지만,
 * 추후 Supabase / Firestore / 자체 API 로 옮길 때
 * 호출부(스토어) 코드 수정 없이 이 파일만 갈아끼우면 된다.
 *
 * 모든 함수는 Promise 를 반환하도록 통일 — 추후 비동기 전환 비용 0.
 */
export const anniversaryRepository = {
  async findAll(): Promise<Anniversary[]> {
    return anniversariesJson as Anniversary[]
  },

  async findById(id: string): Promise<Anniversary | null> {
    const all = await this.findAll()
    return all.find((a) => a.id === id) ?? null
  },
}

export const categoryRepository = {
  async findAll(): Promise<Category[]> {
    return categoriesJson as Category[]
  },
}
