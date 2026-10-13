// 배치 검증(읽기 전용). 서비스 파일을 쓰지 않는다. 결과는 verification.json.
//   node tools/research/workflow/batches/quirky-discovery-20261012/scripts/verify.mjs
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const batch = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const root = path.resolve(batch, '../../../../..')
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'))
const { records, statuses, kinds } = read(path.join(batch, 'records.json'))
const fetchLog = read(path.join(batch, 'fetch-log.json'))
const dataDir = path.join(root, 'src/data/anniversaries')
const items = fs.readdirSync(dataDir).filter((f) => f.endsWith('.json')).sort().flatMap((f) => read(path.join(dataDir, f)))
const errors = []
const check = (ok, msg) => { if (!ok) errors.push(msg) }
check(items.length === 1756, `서비스 기념일 수 ${items.length} ≠ 1,756`)

// 1) 인용 ↔ 저장 본문 글자 일치, 원본 해시 일치
const quoteResults = []
for (const r of records) {
  const evById = Object.fromEntries(r.evidence.map((e) => [e.evidence_id, e]))
  for (const c of r.claims) {
    for (const ref of c.evidence) {
      const e = evById[ref.evidence_id]
      const body = e?.local_text_path ? fs.readFileSync(path.join(batch, e.local_text_path), 'utf8') : ''
      const matched = body.includes(ref.quote)
      quoteResults.push({ candidate_key: r.candidate_key, claim_id: c.claim_id, evidence_id: ref.evidence_id, matched })
      check(matched, `${r.candidate_key}.${c.claim_id}: 인용 불일치 (${ref.evidence_id})`)
      check(e?.read_status === 'original_read', `${r.candidate_key}.${c.claim_id}: 원문 미독 근거를 인용 (${ref.evidence_id})`)
    }
    if (c.verdict === 'supported_by_original') check(c.evidence.length > 0, `${r.candidate_key}.${c.claim_id}: 인용 없는 supported`)
    if (c.verdict === 'search_result_only') check(c.evidence.length === 0, `${r.candidate_key}.${c.claim_id}: 검색결과만인데 인용 있음`)
  }
  for (const e of r.evidence.filter((x) => x.local_raw_path)) {
    const raw = fs.readFileSync(path.join(batch, e.local_raw_path))
    check(crypto.createHash('sha256').update(raw).digest('hex') === e.sha256, `${r.candidate_key}: ${e.evidence_id} 해시 불일치`)
  }
}

// 2) 상태 규칙 — 발견 상태만 허용, 승인·반영 표시 금지
for (const r of records) {
  check(r.discovery_status in statuses, `${r.candidate_key}: 허용 안 된 상태 ${r.discovery_status}`)
  check(!/approved|applied|published|evidenced/i.test(r.discovery_status), `${r.candidate_key}: 승인 흐름 상태 사용`)
  if (r.discovery_status === 'duplicate') { check(items.some((a) => a.id === r.duplicate_check.existing_id), `${r.candidate_key}: 기존 id 없음`); continue }
  check(r.kind in kinds, `${r.candidate_key}: kind`)
  check(r.review.decision === 'pending' && r.application.applied === false, `${r.candidate_key}: 승인/반영 표시`)
  const read = r.claims.some((c) => c.verdict === 'supported_by_original')
  if (r.discovery_status === 'blocked') check(!read || !r.date_rule, `${r.candidate_key}: blocked 인데 원문·날짜 모두 확보`)
  else check(read, `${r.candidate_key}: 원문 근거 없이 ${r.discovery_status}`)
  if (r.discovery_status === 'documented_unofficial') check(!r.listing_sources_only, `${r.candidate_key}: 목록 사이트만으로 documented`)
  if (r.discovery_status === 'date_conflict') check(r.claims.some((c) => c.verdict === 'conflicting') && r.date_note, `${r.candidate_key}: 상충 근거/메모 없음`)
  check(r.source_urls.length > 0, `${r.candidate_key}: 출처 URL 없음`)
}

// 3) 중복 대조 — 서비스 1,756건(이름·id·같은 날) · 이전 배치 records
const STOP = new Set(['day', 'national', 'international', 'world', 'the', 'of', 'and', 'your', 'a', 'in', 'on', 'at', 'to', 'it', 's'])
const priorRecords = fs.readdirSync(path.join(batch, '..'), { recursive: true })
  .filter((f) => f.endsWith('records.json') && !f.startsWith(path.basename(batch)))
  .flatMap((f) => (read(path.join(batch, '..', f)).records ?? []).map((x) => ({ ...x, _file: f })))
const audit = records.filter((r) => r.discovery_status !== 'duplicate').map((r) => {
  const ts = [...new Set(`${r.name_original} ${(r.aliases ?? []).join(' ')}`.toLowerCase().split(/[^a-z0-9ぁ-んァ-ヶ一-龥가-힣]+/))]
    .filter((t) => t.length >= 3 && !STOP.has(t))
  const hay = (a) => `${a.name} ${a.id}`.toLowerCase()
  const nameHits = items.filter((a) => ts.some((t) => hay(a).includes(t))).map((a) => `${a.id} | ${a.name}`)
  const sameDate = r.date_rule ? items.filter((a) => a.date === r.date_rule).map((a) => `${a.category} | ${a.name}`) : []
  const prior = priorRecords.filter((x) => ts.some((t) => `${x.name_ko ?? ''} ${x.name_original ?? ''}`.toLowerCase().includes(t)))
    .map((x) => `${x._file}: ${x.candidate_key}`)
  const exact = items.some((a) => a.date === r.date_rule && a.name.toLowerCase().includes(r.name_original.toLowerCase()))
  check(!exact, `${r.candidate_key}: 서비스에 같은 원명·날짜 항목`)
  return { candidate_key: r.candidate_key, tokens: ts, service_name_or_id_hits: nameHits, service_same_date: sameDate,
    prior_batch_record_hits: prior, prior_discovery_mentions: r.prior_research_mentions, related_existing: r.duplicate_check.related_existing.map((x) => x.id) }
})

// 4) 실제 resolver 로 2026·2027·2028 발생일 (계산 성공 ≠ 날짜 사실 증명)
const server = await createServer({ root, configFile: false, logLevel: 'error',
  optimizeDeps: { noDiscovery: true, include: [], entries: [] }, server: { middlewareMode: true, watch: null, hmr: false } })
const occurrences = []
let serverClosed = false
try {
  const { registerAnchors, resolveOccurrence } = await server.ssrLoadModule('/src/utils/dateUtils.ts')
  registerAnchors(items)
  const stamp = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  for (const r of records.filter((x) => x.discovery_status !== 'duplicate' && x.date_rule)) {
    for (const y of [2026, 2027, 2028]) {
      const got = stamp(resolveOccurrence({ id: r.candidate_key, date: r.date_rule, dateType: r.date_type }, y))
      if (r.date_type === 'annual-fixed') check(got === `${y}-${r.date_rule}`, `${r.candidate_key}: ${y} 발생일 ${got}`)
      occurrences.push({ candidate_key: r.candidate_key, date_type: r.date_type, rule: r.date_rule, year: y, occurrence: got })
    }
  }
} finally {
  await server.close()
  serverClosed = true
}

const cands = records.filter((r) => r.discovery_status !== 'duplicate')
const tally = (xs, f) => xs.reduce((m, x) => ({ ...m, [f(x)]: (m[f(x)] ?? 0) + 1 }), {})
const out = {
  ok: errors.length === 0, errors, generated_at: new Date().toISOString(), production_items_checked: items.length,
  production_writes: false, vite_server_closed: serverClosed,
  record_count: records.length, candidate_count: cands.length,
  unique_new_candidates: cands.filter((r) => r.discovery_status !== 'blocked').length,
  status_counts: tally(records, (r) => r.discovery_status), kind_counts: tally(cands, (r) => r.kind_label),
  kind_status_counts: tally(cands, (r) => `${r.kind_label} / ${r.discovery_status}`),
  confidence_counts: tally(cands, (r) => r.confidence),
  with_prior_discovery_mention: cands.filter((r) => r.prior_research_mentions.length).map((r) => r.candidate_key),
  quotes_checked: quoteResults.length, quotes_matched: quoteResults.filter((q) => q.matched).length,
  fetch_attempts: fetchLog.length, fetch_body_read: fetchLog.filter((e) => e.access_status === 'body_read_http_200').length,
  fetch_failed: fetchLog.filter((e) => e.access_status !== 'body_read_http_200').map((e) => ({ key: e.candidate_key, url: e.url, status: e.access_status, error: e.error ?? null })),
  fetch_status_overrides: records.flatMap((r) => r.evidence.filter((e) => e.access_status !== 'body_read_http_200' && e.http_status === 200).map((e) => ({ id: e.evidence_id, access_status: e.access_status }))),
  occurrences, duplicate_audit: audit, quote_results: quoteResults,
}
fs.writeFileSync(path.join(batch, 'verification.json'), JSON.stringify(out, null, 2) + '\n')
console.log(JSON.stringify({ ok: out.ok, errors, candidates: out.candidate_count, unique_new: out.unique_new_candidates, status_counts: out.status_counts,
  kind_counts: out.kind_counts, quotes: `${out.quotes_matched}/${out.quotes_checked}`, fetch: `${out.fetch_body_read}/${out.fetch_attempts}`,
  overrides: out.fetch_status_overrides, occurrences: occurrences.length, vite_server_closed: serverClosed }, null, 1))
process.exitCode = out.ok ? 0 : 1
