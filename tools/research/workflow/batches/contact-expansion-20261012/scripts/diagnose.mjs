// 읽기 전용 진단: 실제 dateUtils resolver 로 2026·2027·2028 날짜별 기념일 수를 센다.
// 서비스 파일을 쓰지 않는다. 출력은 배치 폴더의 diagnosis.json 하나.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const dir = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const root = path.resolve(dir, '../../../../..')
const dataDir = path.join(root, 'src/data/anniversaries')
const items = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()
  .flatMap(f => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8')))

const server = await createServer({
  root, configFile: false, logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [], entries: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
})
const out = { generated_at: new Date().toISOString(), production_items: items.length, years: {} }
try {
  const { registerAnchors, occursOnBirthday, resolveOccurrenceSafe } = await server.ssrLoadModule('/src/utils/dateUtils.ts')
  registerAnchors(items)
  for (const year of [2026, 2027, 2028]) {
    const days = []
    for (let d = new Date(year, 0, 1); d.getFullYear() === year; d.setDate(d.getDate() + 1)) {
      const m = d.getMonth() + 1, day = d.getDate()
      const hits = items.filter(a => occursOnBirthday(a, year, m, day))
      days.push({
        date: `${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        count: hits.length,
        nonFood: hits.filter(a => a.category !== 'food').length,
        items: hits.map(a => `${a.category}:${a.name}`),
      })
    }
    const unresolved = items.filter(a => !resolveOccurrenceSafe(a, year)).map(a => a.id)
    out.years[year] = {
      unresolved,
      histogram: Object.fromEntries([0, 1, 2, 3].map(n => [n, days.filter(x => x.count === n).length])),
      sparse_le2: days.filter(x => x.count <= 2),
      nonfood_le1: days.filter(x => x.nonFood <= 1).map(x => ({ date: x.date, count: x.count, nonFood: x.nonFood })),
    }
  }
} finally {
  await server.close()
}
fs.writeFileSync(path.join(dir, 'diagnosis.json'), JSON.stringify(out, null, 2) + '\n')
for (const [y, v] of Object.entries(out.years)) {
  console.log(y, 'hist', JSON.stringify(v.histogram), 'unresolved', v.unresolved.length, 'nonfood<=1', v.nonfood_le1.length)
  console.log('  <=2:', v.sparse_le2.map(x => `${x.date}(${x.count}/${x.nonFood})`).join(' '))
}
console.log('server closed; items', items.length)
