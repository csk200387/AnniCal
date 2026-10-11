import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const records = JSON.parse(fs.readFileSync(path.join(out, 'records.json'), 'utf8')).records;
const server = await createServer({ configFile: false, optimizeDeps: { noDiscovery: true, include: [], entries: [] }, server: { middlewareMode: true, watch: null, hmr: false }, appType: 'custom' });
try {
  const { registerAnchors, resolveOccurrence } = await server.ssrLoadModule('/src/utils/dateUtils.ts');
  const months = fs.readdirSync('src/data/anniversaries').filter(x => /^\d{2}\.json$/.test(x));
  const baseline = months.flatMap(x => JSON.parse(fs.readFileSync(path.join('src/data/anniversaries', x), 'utf8')));
  registerAnchors(baseline);
  const results = records.filter(x => x.status === 'evidenced').map(r => ({ candidate_key: r.candidate_key, years: [2026,2027,2028].map(year => {
    const d = resolveOccurrence(r, year);
    const actual = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (actual !== `${year}-${r.date}`) throw Error(`Date mismatch ${r.candidate_key}`);
    return {year, actual};
  })}));
  const required = ['candidate_key','name_ko','name_original','date','dateType','scope','officiality','category','status','duplicate_of','duplicate_check_notes','origin','anecdote','sourceUrl','evidence','unverified_fields','notes'];
  for (const r of records) {
    for (const key of required) if (!(key in r)) throw Error(`Missing ${key}`);
    for (const e of r.evidence) if (!fs.readFileSync(e.local_evidence_path,'utf8').includes(e.quote_original)) throw Error('Nonliteral quote');
    if (r.status === 'rejected_duplicate' && !baseline.some(x => x.id === r.duplicate_of)) throw Error('Missing duplicate');
  }
  const validation = {baseline_count:baseline.length, record_count:records.length, counts:records.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{}), per_date: Object.fromEntries(['07-09','07-21','08-17'].map(date=>[date,records.filter(x=>x.date===date&&x.status==='evidenced').length])), resolver:results, required_fields:'passed', literal_quotes:'passed', duplicate_targets:'passed', independent_review:'pending', service_integration:false};
  fs.writeFileSync(path.join(out,'validation.json'), JSON.stringify(validation,null,2));
  console.log(JSON.stringify(validation,null,2));
} finally { await server.close(); }
