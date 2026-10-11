import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import type { Anniversary } from '@/types/anniversary'
import { registerAnchors, resolveOccurrence } from '@/utils/dateUtils'

const root = fileURLToPath(new URL('..', import.meta.url))
const all: Anniversary[] = readdirSync(join(root, 'src/data/anniversaries'))
  .filter(f => /^\d{2}\.json$/.test(f))
  .flatMap(f => JSON.parse(readFileSync(join(root, 'src/data/anniversaries', f), 'utf8')))
registerAnchors(all)

// Existing ID and permanent indexed route must survive the date correction.
const rareId = 'anv-fixed-02-28-rare-disease-day-global'

describe('research publication: Rare Disease Day', () => {
  it('observes the last day of February in every supported year', () => {
    const rare = all.find(a => a.id === rareId)!
    expect(rare).toBeDefined()
    for (let year = 2020; year <= 2050; year++) {
      const actual = resolveOccurrence(rare, year)
      const expected = new Date(year, 2, 0)
      expect([actual.getFullYear(), actual.getMonth(), actual.getDate()], String(year))
        .toEqual([year, 1, expected.getDate()])
    }
    const routes = JSON.parse(readFileSync(join(root, 'src/data/routes.json'), 'utf8'))
    expect(routes[rareId]).toEqual({ slug: 'rare-disease-day', urlDate: '02-28' })
  })
})
