// 배치 검증(읽기 전용). 서비스 파일을 쓰지 않는다. 결과는 verification.json.
//   node tools/research/workflow/batches/contact-expansion-20261012/scripts/verify.mjs
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const batch = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const root = path.resolve(batch, '../../../../..')
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const { records } = read(path.join(batch, 'records.json'))
const proposed = read(path.join(batch, 'proposed-anniversaries.json')).items
const fetchLog = read(path.join(batch, 'fetch-log.json'))
const categories = read(path.join(root, 'src/data/categories.json'))
const catLabel = Object.fromEntries(categories.map((c) => [c.id, c.label]))
const dataDir = path.join(root, 'src/data/anniversaries')
const items = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort()
  .flatMap((f) => read(path.join(dataDir, f)))
assert.equal(items.length, 1756, '서비스 기념일 수가 1,756건이 아니다')

const STATUSES = new Set(['evidenced', 'review', 'blocked', 'rejected'])
const errors = []
const check = (ok, msg) => { if (!ok) errors.push(msg) }

// 1) 인용 ↔ 저장 본문 일치, 원본 해시 일치
let quoteCount = 0
const quoteResults = []
for (const r of records) {
  const evById = Object.fromEntries(r.evidence.map((e) => [e.evidence_id, e]))
  for (const c of r.claims) {
    for (const ref of c.evidence) {
      const e = evById[ref.evidence_id]
      check(e, `${r.candidate_key}.${c.claim_id}: 근거 ${ref.evidence_id} 가 evidence 목록에 없음`)
      if (!e) continue
      const body = fs.readFileSync(path.join(batch, e.local_evidence_path), 'utf8')
      const ok = body.includes(ref.quote)
      quoteCount += 1
      quoteResults.push({ candidate_key: r.candidate_key, claim_id: c.claim_id, evidence_id: ref.evidence_id, matched: ok })
      check(ok, `${r.candidate_key}.${c.claim_id}: 인용 불일치 (${ref.evidence_id})`)
    }
    check(['supported', 'supported_secondary', 'unverified', 'blocked', 'conflicting'].includes(c.verdict), `${r.candidate_key}.${c.claim_id}: verdict ${c.verdict}`)
    if (c.verdict.startsWith('supported')) check(c.evidence.length > 0, `${r.candidate_key}.${c.claim_id}: 근거 없는 supported`)
  }
  for (const e of r.evidence) {
    check(e.access_status === 'body_read_http_200', `${r.candidate_key}: ${e.evidence_id} 접근 상태 ${e.access_status}`)
    const raw = fs.readFileSync(path.join(batch, e.local_raw_path))
    check(crypto.createHash('sha256').update(raw).digest('hex') === e.sha256, `${r.candidate_key}: ${e.evidence_id} 원본 해시 불일치`)
  }
}

// 2) 상태·스키마·초안 규칙
const forbidden = /approved|applied|published|reviewed/i
for (const r of records) {
  check(STATUSES.has(r.status), `${r.candidate_key}: 허용 안 된 상태 ${r.status}`)
  check(!forbidden.test(r.status) && r.review.decision === 'pending' && r.approval.approved_by === null && r.application.commit === null,
    `${r.candidate_key}: 승인/반영 표시 금지 위반`)
  if (r.status === 'evidenced' || r.status === 'review') {
    const types = r.claims.filter((c) => c.verdict.startsWith('supported')).map((c) => c.type).join('+')
    check(/existence/.test(types) && /date/.test(types), `${r.candidate_key}: 존재·날짜 근거 claim 없음`)
    check(r.draft.origin && r.draft.anecdote, `${r.candidate_key}: 초안 비어 있음`)
    check(catLabel[r.draft.category] && r.draft.tags[0] === catLabel[r.draft.category] && r.draft.tags.length === 1, `${r.candidate_key}: category/tags 규칙`)
    check(r.duplicate_of === null, `${r.candidate_key}: duplicate_of 가 있는데 신규 상태`)
  }
  if (r.status === 'blocked') check(r.blocked_reason && r.resume_condition, `${r.candidate_key}: blocked 사유/재개 조건 없음`)
}
const ids = new Set(items.map((a) => a.id))
for (const p of proposed) {
  const a = p.anniversary
  check(!ids.has(a.id), `${a.id}: 기존 id 와 충돌`)
  check(/^[A-Za-z0-9._-]+$/.test(a.id), `${a.id}: id 형식`)
  // eslint-disable-next-line no-control-regex
  check(![a.id, a.name, a.date, a.storytelling.origin, a.storytelling.anecdote, a.sourceUrl ?? ''].some((v) => /[\x00-\x1f\x7f-\x9f]/.test(v)), `${a.id}: 제어문자`)
  check(!/<\/\s*script/i.test(a.name + a.storytelling.origin + a.storytelling.anecdote), `${a.id}: </script>`)
  check(/^https:\/\//.test(a.sourceUrl ?? ''), `${a.id}: sourceUrl 형식`)
}
check(new Set(proposed.map((p) => p.anniversary.id)).size === proposed.length, '제안 id 중복')

// 3) 중복 대조 — 서비스 1,756건 · 기존 research 후보 · 나무위키 발견 행
const STOP = new Set(['day', 'days', 'international', 'world', 'national', 'the', 'and', 'for', 'of', 'people', 'awareness', 'mundial', 'dia', 'do'])
const tokens = (r) => {
  const en = `${r.name_original} ${r.aliases.join(' ')} ${r.name_ko.replace(/[()]/g, ' ')}`.toLowerCase()
    .split(/[^a-z가-힣ぁ-んァ-ン一-龥]+/).filter((t) => t.length >= 2 && !STOP.has(t))
  return [...new Set(en.flatMap((t) => (/^[가-힣]+$/.test(t) ? [t.replace(/(의|날|기념일|국제|세계)$/g, '')] : [t])).filter((t) => t.length >= 2 && !['국제', '세계', '기념', '인식'].includes(t)))]
}
const priorRecords = fs.readdirSync(path.join(batch, '..'), { recursive: true })
  .filter((f) => f.endsWith('records.json') && !f.startsWith('contact-expansion-20261012'))
  .flatMap((f) => (read(path.join(batch, '..', f)).records ?? []).map((x) => ({ ...x, _file: f })))
const namu = read(path.join(root, 'tools/namuwiki/output/final_result.json')).rows
const duplicateAudit = records.map((r) => {
  const ts = tokens(r)
  const hay = (s) => s.toLowerCase()
  const nameHits = items.filter((a) => ts.some((t) => hay(`${a.name} ${a.id}`).includes(t)))
    .map((a) => ({ id: a.id, name: a.name, date: a.date }))
  const sameDate = items.filter((a) => a.date === r.date_rule).map((a) => ({ id: a.id, name: a.name, category: a.category }))
  const prior = priorRecords.filter((x) => x.name_original?.toLowerCase() === r.name_original.toLowerCase()
    || (x.date === r.date_rule) || ts.some((t) => hay(`${x.name_ko} ${x.name_original}`).includes(t)))
    .map((x) => ({ file: x._file, candidate_key: x.candidate_key, name_ko: x.name_ko, date: x.date, status: x.status }))
  const namuLeads = namu.filter((x) => x.date === r.date_rule && ts.some((t) => hay(x.text).includes(t))).map((x) => x.text.slice(0, 80))
  const exact = items.some((a) => a.name.toLowerCase().includes(r.name_original.toLowerCase()) && a.date === r.date_rule)
  check(!exact, `${r.candidate_key}: 서비스에 같은 원명·날짜 항목 존재`)
  check(!prior.some((x) => x.name_ko === r.name_ko || (x.date === r.date_rule && x.status === 'evidenced')),
    `${r.candidate_key}: 기존 research 후보와 같은 이름 또는 같은 날짜 evidenced 후보`)
  return { candidate_key: r.candidate_key, tokens: ts, service_name_or_id_hits: nameHits, service_same_date: sameDate,
    prior_research_hits: prior, namuwiki_discovery_leads: namuLeads,
    distinct_from_similar_reason: r.distinct_from_similar_reason || null }
})

// 4) 실제 resolver 로 2026·2027·2028 발생일 · 날짜별 결과 수(미반영 시뮬레이션)
const server = await createServer({
  root, configFile: false, logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [], entries: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
})
const occurrences = []
const perDate = []
let serverClosed = false
try {
  const { registerAnchors, resolveOccurrence, occursOnBirthday } = await server.ssrLoadModule('/src/utils/dateUtils.ts')
  registerAnchors(items)
  const stamp = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  for (const r of records.filter((x) => x.status !== 'rejected')) {
    for (const y of [2026, 2027, 2028]) {
      const got = stamp(resolveOccurrence({ id: r.candidate_key, date: r.date_rule, dateType: r.date_type }, y))
      check(got === `${y}-${r.date_rule}`, `${r.candidate_key}: ${y} 발생일 ${got}`)
      occurrences.push({ candidate_key: r.candidate_key, year: y, occurrence: got })
    }
  }
  const dates = [...new Set(proposed.map((p) => p.anniversary.date))].sort()
  for (const d of dates) {
    const [m, day] = d.split('-').map(Number)
    for (const y of [2026, 2027, 2028]) {
      const existing = items.filter((a) => occursOnBirthday(a, y, m, day))
      const add = proposed.filter((p) => p.anniversary.date === d)
      perDate.push({ date: d, year: y, existing: existing.length, existing_non_food: existing.filter((a) => a.category !== 'food').length,
        candidates_evidenced: add.filter((p) => p.research_status === 'evidenced').length,
        candidates_review: add.filter((p) => p.research_status === 'review').length })
    }
  }
} finally {
  await server.close()
  serverClosed = true
}

const counts = Object.fromEntries([...STATUSES].map((s) => [s, records.filter((r) => r.status === s).length]))
const lengths = proposed.map((p) => ({ id: p.anniversary.id, origin: [...p.anniversary.storytelling.origin].length, anecdote: [...p.anniversary.storytelling.anecdote].length }))
const out = {
  ok: errors.length === 0, errors, generated_at: new Date().toISOString(), production_items_checked: items.length,
  production_writes: false, vite_server_closed: serverClosed,
  record_count: records.length, status_counts: counts, proposed_count: proposed.length,
  quotes_checked: quoteCount, quotes_matched: quoteResults.filter((q) => q.matched).length,
  fetch_attempts: fetchLog.length, fetch_ok: fetchLog.filter((e) => e.access_status === 'body_read_http_200').length,
  fetch_failed: fetchLog.filter((e) => e.access_status !== 'body_read_http_200').map((e) => ({ key: e.candidate_key, url: e.url, status: e.access_status, error: e.error ?? null })),
  draft_lengths: lengths, occurrences, per_date_simulation: perDate, duplicate_audit: duplicateAudit,
}
fs.writeFileSync(path.join(batch, 'verification.json'), JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify({ ok: out.ok, errors, status_counts: counts, proposed: proposed.length, quotes: `${out.quotes_matched}/${quoteCount}`,
  fetch: `${out.fetch_ok}/${out.fetch_attempts}`, vite_server_closed: serverClosed, production_items_checked: items.length }, null, 2))
process.exitCode = out.ok ? 0 : 1
