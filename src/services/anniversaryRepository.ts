import type { Anniversary } from '@/types/anniversary'
import type { Category } from '@/types/category'
import type { Group } from '@/types/group'
import categoriesJson from '@/data/categories.json'
import groupsJson from '@/data/groups.json'

/**
 * 월별 분할 데이터(01..12.json)를 동적 import 로 로드.
 * Vite 가 각 월 파일을 별도 async 청크로 코드 분할한다.
 */
const monthFiles = import.meta.glob<{ default: Anniversary[] }>(
  '../data/anniversaries/*.json',
)

/** 월 번호(1~12) → 그 달 파일을 가져오는 로더. */
const loaderByMonth = new Map<number, () => Promise<{ default: Anniversary[] }>>()
for (const [path, load] of Object.entries(monthFiles)) {
  const m = /(\d{2})\.json$/.exec(path)
  if (m) loaderByMonth.set(Number(m[1]), load)
}

export const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

/**
 * 월별 Promise 캐시.
 *
 * 같은 달을 여러 화면이 동시에 요청해도 네트워크 요청은 한 번이다. 예전에는
 * 어떤 화면이든 `Promise.all(12개)` 를 돌려서, 기념일 하나를 보러 온 사람도
 * 1,400개 전부를 받아 파싱했다.
 */
const pending = new Map<number, Promise<Anniversary[]>>()

function loadMonth(month: number): Promise<Anniversary[]> {
  let p = pending.get(month)
  if (!p) {
    const loader = loaderByMonth.get(month)
    p = loader ? loader().then((m) => m.default) : Promise.resolve([])
    // 실패한 Promise 를 캐시에 남겨 두면 재시도가 같은 실패를 즉시 되돌려준다.
    p = p.catch((e) => {
      pending.delete(month)
      throw e
    })
    pending.set(month, p)
  }
  return p
}

/**
 * 어떤 달에 "발생하는" 기념일이 들어 있을 수 있는 파일들.
 *
 * 파일은 기준연도(2026) 발생 월로 나뉘어 있지만 실제 발생일은 움직인다.
 * 음력 명절은 최대 한 달까지 밀리고(설날은 1월·2월 양쪽), 기준일 상대 기념일은
 * 며칠 차이로 달을 넘을 수 있다. 그래서 앞뒤 달을 함께 읽는다.
 * (anchor 는 항상 같은 파일에 함께 있으므로 추가로 챙길 필요가 없다.)
 */
export function monthsCovering(month: number): number[] {
  const prev = month === 1 ? 12 : month - 1
  const next = month === 12 ? 1 : month + 1
  return [prev, month, next]
}

export const anniversaryRepository = {
  /** 지정한 달들만 로드해 합친다. 이미 받은 달은 캐시에서 바로 나온다. */
  async findByMonths(months: Iterable<number>): Promise<Anniversary[]> {
    const unique = [...new Set(months)].filter((m) => m >= 1 && m <= 12)
    const chunks = await Promise.all(unique.map(loadMonth))
    return chunks.flat()
  },

  async findAll(): Promise<Anniversary[]> {
    return this.findByMonths(ALL_MONTHS)
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

export const groupRepository = {
  async findAll(): Promise<Group[]> {
    return groupsJson as Group[]
  },
}
