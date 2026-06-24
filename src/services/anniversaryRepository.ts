import type { Anniversary } from '@/types/anniversary'
import type { Category } from '@/types/category'
import categoriesJson from '@/data/categories.json'

/**
 * 월별 분할 데이터(01..12.json)를 동적 import 로 로드.
 * Vite 가 각 월 파일을 별도 async 청크로 코드 분할하므로, 1MB 가 넘는 기념일
 * 데이터가 메인 번들에서 빠지고 앱 부팅 후 병렬로 fetch 된다.
 */
const monthFiles = import.meta.glob<{ default: Anniversary[] }>(
  '../data/anniversaries/*.json',
)

/**
 * 데이터 소스 추상화 레이어.
 *
 * 현재는 정적 JSON 을 동적으로 읽어 반환하지만,
 * 추후 Supabase / Firestore / 자체 API 로 옮길 때
 * 호출부(스토어) 코드 수정 없이 이 파일만 갈아끼우면 된다.
 *
 * 모든 함수는 Promise 를 반환하도록 통일 — 추후 비동기 전환 비용 0.
 */
export const anniversaryRepository = {
  async findAll(): Promise<Anniversary[]> {
    const modules = await Promise.all(
      Object.values(monthFiles).map((load) => load()),
    )
    return modules.flatMap((m) => m.default)
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
