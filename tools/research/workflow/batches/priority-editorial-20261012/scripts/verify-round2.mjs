// 라운드2(pending 27) 읽기 전용 검증. 서비스 파일을 쓰지 않는다. 결과는 verification-round2.json.
//   node tools/research/workflow/batches/priority-editorial-20261012/scripts/verify-round2.mjs
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const batch = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const root = path.resolve(batch, '../../../../..')
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const B = (f) => path.join(batch, f)
const errors = []
const warnings = []
const check = (ok, msg) => { if (!ok) errors.push(msg) }

const pending = read(B('integration-result.json')).pending_uids
const queue = read(B('queue.json')).entries.filter((e) => pending.includes(e.uid))
const drafts = read(B('drafts-round2.json')).drafts
const proposed = read(B('proposed-records-round2.json'))
const emap = read(B('evidence-map-round2.json')).items
const round1 = read(B('drafts.json')).drafts
const labels = Object.fromEntries(read(path.join(root, 'src/data/categories.json')).map((c) => [c.id, c.label]))
const groupLabels = read(path.join(root, 'src/data/groups.json')).map((g) => g.label)
const dataDir = path.join(root, 'src/data/anniversaries')
const items = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort().flatMap((f) => read(path.join(dataDir, f)))
const serviceIds = new Set(items.map((a) => a.id))
const fetchLog = read(B('fetch-log.json'))
const searchLog = read(B('search-log.json'))

// 0) 범위 — pending 27 정확히, 1라운드 32건과 겹치지 않음
check(pending.length === 27 && queue.length === 27, `pending/queue 수 ${pending.length}/${queue.length}`)
check(new Set(pending).size === 27, 'pending uid 중복')
const uids = Object.keys(drafts)
check(uids.length === 27 && pending.every((u) => uids.includes(u)) && uids.every((u) => pending.includes(u)), `drafts-round2 uid 범위 불일치 (${uids.length})`)
check(uids.every((u) => !(u in round1)), '1라운드 uid 와 겹침')
check(items.length === 1787, `서비스 기념일 수 ${items.length} ≠ 1,787`)

// 1) 상태·id·필드
const STATUSES = new Set(['ready_for_review', 'shorter_evidenced', 'blocked', 'duplicate', 'date_support_unverified'])
const ids = uids.map((u) => drafts[u].anniversary.id)
check(new Set(ids).size === ids.length, '라운드2 id 중복')
const round1Ids = new Set(Object.values(round1).map((d) => d.anniversary.id))
const HANGUL = /[가-힣]/
const collectedUrls = new Set(fetchLog.map((f) => f.url))
for (const e of queue) {
  const rec = read(path.join(root, e.source_record_path)).records.find((r) => r.candidate_key === e.candidate_key)
  for (const ev of rec.evidence) collectedUrls.add(ev.url)
}
for (const u of uids) {
  const d = drafts[u]
  const a = d.anniversary
  check(STATUSES.has(d.status), `${u}: 상태 ${d.status}`)
  check(!/approved|applied|published/i.test(d.status), `${u}: 승인/반영 상태 표기`)
  check(!serviceIds.has(a.id), `${u}: 서비스 id 충돌 ${a.id}`)
  check(!round1Ids.has(a.id), `${u}: 1라운드 id 충돌 ${a.id}`)
  check(/^anv-(fixed|nth|rel|term|lunar)-[a-z0-9-]+$/.test(a.id), `${u}: id 형식 ${a.id}`)
  check(a.category in labels, `${u}: category ${a.category}`)
  check(Array.isArray(a.tags) && a.tags.length === 1 && a.tags[0] === labels[a.category], `${u}: tags ${JSON.stringify(a.tags)}`)
  check(!a.tags.some((t) => groupLabels.includes(t)), `${u}: 해외 항목에 그룹 레이블`)
  check(HANGUL.test(a.name) && HANGUL.test(a.storytelling.origin) && HANGUL.test(a.storytelling.anecdote ?? ''), `${u}: 한국어 필드`)
  check(!/[—–]\s/.test(a.name) && a.name.length <= 30, `${u}: 이름에 긴 부제 (${a.name})`)
  check(/^https?:\/\//.test(a.sourceUrl ?? ''), `${u}: sourceUrl 형식`)
  check(collectedUrls.has(a.sourceUrl), `${u}: sourceUrl 이 수집 기록에 없음 ${a.sourceUrl}`)
  check(a.memes.length === 1 && a.memes.every((m) => m.type === 'text' && m.url === null && m.caption), `${u}: memes 형식`)
  const fmt = { 'annual-fixed': /^\d{2}-\d{2}$/, 'annual-nth-weekday': /^\d{2}-([1-5]|L)-(SUN|MON|TUE|WED|THU|FRI|SAT)$/,
    'annual-tabulated': /^[a-z-]+$/, 'annual-relative-to-holiday': /^[a-z0-9-]+:-?\d+$/ }[a.dateType]
  check(fmt && fmt.test(a.date), `${u}: date/dateType 짝 ${a.dateType} ${a.date}`)
  const inProp = u in proposed.records
  check(inProp === ['ready_for_review', 'shorter_evidenced'].includes(d.status), `${u}: proposed-records 포함 여부와 상태 불일치`)
  if (inProp) check(JSON.stringify(proposed.records[u]) === JSON.stringify(a), `${u}: proposed 객체가 draft 와 다름`)
  if (a.storytelling.origin.length < 150 || (a.storytelling.anecdote ?? '').length < 150) warnings.push(`${u}: 150자 미만 필드 (${a.storytelling.origin.length}/${(a.storytelling.anecdote ?? '').length})`)
}

// 2) 근거 — 사용 claim 존재, 모든 인용 문자 일치(원본 배치 인용 + 이번 배치 인용)
const quoteResults = []
for (const e of queue) {
  const u = e.uid
  const rec = read(path.join(root, e.source_record_path)).records.find((r) => r.candidate_key === e.candidate_key)
  const claimIds = new Set(rec.claims.map((c) => c.claim_id))
  for (const c of drafts[u].claims_used) check(claimIds.has(c), `${u}: claims_used ${c} 가 원본 record 에 없음`)
  const item = emap[u]
  check(!!item, `${u}: evidence-map 항목 없음`)
  for (const c of item?.claims ?? []) {
    if (c.scope === 'origin_batch' && !c.used) continue
    for (const q of c.quotes) {
      const body = q.path && fs.existsSync(path.join(root, q.path)) ? fs.readFileSync(path.join(root, q.path), 'utf8') : ''
      const matched = body.includes(q.quote)
      quoteResults.push({ uid: u, claim_id: c.claim_id, scope: c.scope, path: q.path, matched })
      check(matched, `${u}.${c.claim_id}: 인용 불일치 (${q.path})`)
      check(!path.isAbsolute(q.path ?? '') && (q.path ?? '').startsWith('tools/research/'), `${u}.${c.claim_id}: 경로가 repo 루트 상대경로가 아님`)
    }
  }
  check(item?.claims.some((c) => c.scope === 'this_batch' || c.used), `${u}: 본문에 쓴 근거 없음`)
}
// 이번 배치에서 받은 원문 해시 일치
for (const f of fetchLog.filter((x) => x.raw_path)) {
  const raw = fs.readFileSync(B(f.raw_path))
  check(crypto.createHash('sha256').update(raw).digest('hex') === f.sha256, `fetch 해시 불일치 ${f.raw_path}`)
}

// 3) 홍콩천문대(UTC+8) 연표 2020~2050 ↔ 앱 observances 표
const obs = read(path.join(root, 'src/data/observances.json'))
const termName = { chubun: 'Autumnal Equinox', gyeongchip: 'Insects Waken', ipchun: 'Spring Commences' }
const hkoDiff = []
const pad = (n) => String(n).padStart(2, '0')
for (let y = 2020; y <= 2050; y += 1) {
  const lines = fs.readFileSync(B(`evidence/_shared-hko-calendar/hko-T${y}e.txt`), 'utf8').split('\n')
  const md = (l) => { const [, m, d] = l.split(' ')[0].split('/'); return `${pad(m)}-${pad(d)}` }
  for (const [k, n] of Object.entries(termName)) {
    const hk = md(lines.find((l) => l.endsWith(n)))
    if (obs[k][String(y)] !== hk) hkoDiff.push({ key: k, year: y, app_table: obs[k][String(y)], hko_utc8: hk })
  }
  const i = lines.findIndex((l) => l.startsWith(`${y}/`) && l.includes(' 8th Lunar Month'))
  const hk = md(lines[i + 14])
  if (obs.chuseok[String(y)] !== hk) hkoDiff.push({ key: 'chuseok', year: y, app_table: obs.chuseok[String(y)], hko_utc8: hk })
}

// 4) 실제 resolver 로 2026·2027·2028 발생일 (계산 성공 ≠ 현지 날짜 사실 증명)
const expected = {
  'asia:cn-farmers-harvest': ['2026-09-23', '2027-09-23', '2028-09-22'],
  'asia:hk-villain-hitting': ['2026-03-05', '2027-03-06', '2028-03-05'],
  'asia:hk-fire-dragon': ['2026-09-24', '2027-09-14', '2028-10-02'],
  'asia:jp-setsubun': ['2026-02-03', '2027-02-03', '2028-02-03'],
  'asia:jp-keiro-no-hi': ['2026-09-21', '2027-09-20', '2028-09-18'],
  'asia:jp-seijin-no-hi': ['2026-01-12', '2027-01-11', '2028-01-10'],
  'asia:ph-heroes-day': ['2026-08-31', '2027-08-30', '2028-08-28'],
}
const server = await createServer({ root, configFile: false, logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [], entries: [] }, server: { middlewareMode: true, watch: null, hmr: false } })
const occurrences = []
let serverClosed = false
try {
  const { registerAnchors, resolveOccurrence } = await server.ssrLoadModule('/src/utils/dateUtils.ts')
  registerAnchors([...items, ...uids.map((u) => drafts[u].anniversary)])
  const stamp = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  for (const u of uids) {
    const a = drafts[u].anniversary
    const got = [2026, 2027, 2028].map((y) => {
      try { return stamp(resolveOccurrence(a, y)) } catch (err) { errors.push(`${u}: ${y} 계산 실패 ${err.message}`); return null }
    })
    if (a.dateType === 'annual-fixed') got.forEach((g, i) => check(g === `${2026 + i}-${a.date}`, `${u}: ${2026 + i} 발생일 ${g}`))
    if (expected[u]) check(JSON.stringify(got) === JSON.stringify(expected[u]), `${u}: 발생일 ${got} ≠ 기대 ${expected[u]}`)
    occurrences.push({ uid: u, id: a.id, dateType: a.dateType, date: a.date, status: drafts[u].status, '2026': got[0], '2027': got[1], '2028': got[2] })
  }
} finally {
  await server.close()
  serverClosed = true
}

const tally = (xs) => xs.reduce((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {})
const len = uids.map((u) => drafts[u].lengths)
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(B(f))).digest('hex')
const out = {
  ok: errors.length === 0, errors, warnings, generated_at: new Date().toISOString(),
  scope: { pending_uids: pending.length, drafted: uids.length, unwritten: pending.filter((u) => !uids.includes(u)) },
  service_items_checked: items.length, production_writes: false, vite_server_closed: serverClosed,
  status_counts: tally(uids.map((u) => drafts[u].status)),
  proposed_count: Object.keys(proposed.records).length, withheld: proposed.withheld,
  lengths: { origin_min: Math.min(...len.map((l) => l.origin)), origin_max: Math.max(...len.map((l) => l.origin)),
    anecdote_min: Math.min(...len.map((l) => l.anecdote)), anecdote_max: Math.max(...len.map((l) => l.anecdote)),
    total_avg: Math.round(len.reduce((s, l) => s + l.total, 0) / len.length) },
  quotes_checked: quoteResults.length, quotes_matched: quoteResults.filter((q) => q.matched).length,
  quotes_this_batch: quoteResults.filter((q) => q.scope === 'this_batch').length,
  fetch_log_entries: fetchLog.length, search_log_entries: searchLog.length,
  hko_vs_app_table_2020_2050: hkoDiff,
  occurrences,
  round1_files_sha256: Object.fromEntries(['drafts.json', 'evidence-map.json', 'proposed-records.json', 'progress.md', 'integration-result.json'].map((f) => [f, sha(f)])),
  quote_results: quoteResults,
}
fs.writeFileSync(B('verification-round2.json'), JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify({ ok: out.ok, errors, warnings: warnings.length, scope: out.scope, status_counts: out.status_counts,
  proposed: out.proposed_count, lengths: out.lengths, quotes: `${out.quotes_matched}/${out.quotes_checked} (이번 배치 ${out.quotes_this_batch})`,
  hko_diff: hkoDiff, vite_server_closed: serverClosed }, null, 1))
process.exitCode = out.ok ? 0 : 1
