import { describe, expect, it } from 'vitest'
import type { Anniversary } from '@/types/anniversary'
import { buildTargets } from '../tools/prerender/routes'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const leap: Anniversary = {
  id: 'test-leap',
  date: '02-29',
  dateType: 'annual-fixed',
  name: '윤일 테스트',
  category: 'general',
  tags: [],
  memes: [],
  sourceUrl: null,
  storytelling: { origin: '', anecdote: '' },
}
const routes = { [leap.id]: { urlDate: '02-29', slug: 'test-leap' } }

describe('윤일 프리렌더', () => {
  const built = fileURLToPath(
    new URL('../dist/day/02-29/bachelors-day-ie/index.html', import.meta.url),
  )
  it.runIf(existsSync(built))('상세 HTML에도 윤년에만 발생하는 규칙을 설명한다', () => {
    const html = readFileSync(built, 'utf-8')
    expect(html).toContain('2월 29일 (윤년에만)')
    expect(html).not.toContain('3월 1일')
    expect(html).toContain('href="/day/02-29"')
  })
  it('평년에도 윤일 상세·2월 29일 허브는 남기고 3월 1일로 밀지 않는다', () => {
    const targets = buildTargets([leap], routes, 2026)
    expect(targets.find((t) => t.path === '/day/02-29/test-leap')?.displayDate).toBe('02-29')
    // 2월 29일 허브는 평년에도 윤일 기념일을 소개한다(3월 1일로 밀지는 않는다).
    expect(targets.find((t) => t.path === '/day/02-29')?.items).toEqual([leap])
    expect(targets.find((t) => t.path === '/day/03-01')?.items).toEqual([])
    expect(buildTargets([leap], routes, 2028).find((t) => t.path === '/day/02-29')?.items).toEqual([
      leap,
    ])
  })
})
