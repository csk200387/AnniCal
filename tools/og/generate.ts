import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { allAnniversaries } from '../../src/data/anniversaries/all.js'
import routes from '../../src/data/routes.json' with { type: 'json' }
import { displayName } from '../../src/seo/meta.js'
import { ogImageUrl, type StaticPage } from '../../src/seo/og.js'
import { pageCard } from '../../server/og/query.js'
import { renderOg } from '../../server/og/render.js'
import handler from '../../api/og.js'

if (process.argv[2] === 'samples') {
  const out = join(homedir(), '.hermes/cache/scratch/og-samples')
  mkdirSync(out, { recursive: true })
  const longest = allAnniversaries.slice().sort((a, b) => displayName(b.name).length - displayName(a.name).length)[0]
  const route = (routes as Record<string, { urlDate: string; slug: string }>)[longest.id]
  const queries = {
    birthday: { kind: 'birthday', date: '10-11', year: 2026, pick: 'anv-fixed-10-11-sausage-pizza-day-us' },
    together: { kind: 'together', date: '2026-06-21', m: 'd100', pick: allAnniversaries.find(a => a.dateType === 'annual-fixed' && a.date === '06-21')!.id },
    'detail-long': { kind: 'detail', date: route.urlDate, slug: route.slug },
    hub: { kind: 'hub', date: '10-11' },
  } as const
  for (const [name, query] of Object.entries(queries)) {
    const url = ogImageUrl(query)
    let status = 0
    // 샘플도 /api/og 핸들러를 직접 호출해 검증·캐시·렌더 경로를 모두 통과한다.
    await handler({ method: 'GET', url, headers: {} } as never, {
      set statusCode(value: number) { status = value }, setHeader() {},
      end(body?: Buffer) { if (status !== 200 || !body) throw new Error(`${name}: HTTP ${status}`); writeFileSync(join(out, `${name}.png`), body) },
    } as never)
    console.log(`${name}: ${url}`)
  }
} else {
  mkdirSync('public/og', { recursive: true })
  for (const page of ['home', 'calendar', 'export', 'popular', 'birthday', 'together'] as StaticPage[]) {
    writeFileSync(`public/og/${page}.png`, await renderOg(pageCard(page)))
    console.log(`public/og/${page}.png`)
  }
}
