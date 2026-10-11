import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
const dir = path.dirname(fileURLToPath(import.meta.url));
const root = '/Users/csk200387/Desktop/AnniCal';
const { records } = JSON.parse(fs.readFileSync(path.join(dir, 'records.json'), 'utf8'));
const required = 'candidate_key name_ko name_original date dateType scope officiality category status duplicate_of duplicate_check_notes origin anecdote sourceUrl evidence unverified_fields notes'.split(' ');
const items = fs.readdirSync(path.join(root, 'src/data/anniversaries')).filter(f=>f.endsWith('.json')).flatMap(f=>JSON.parse(fs.readFileSync(path.join(root,'src/data/anniversaries',f),'utf8')));
assert.equal(items.length,1734);
assert.equal(new Set(records.map(r=>r.candidate_key)).size,records.length);
for (const r of records) {
  for (const key of required) assert.ok(Object.hasOwn(r,key),`${r.candidate_key}: ${key}`);
  if(r.status === 'evidenced') {
    assert.equal(r.duplicate_of,null);
    assert.ok(r.origin && r.anecdote);
    assert.ok(r.evidence.length);
    for(const e of r.evidence) {
      assert.equal(e.access_status,'body_read_http_200');
      assert.ok(e.quote_original);
      const body=fs.readFileSync(e.local_evidence_path,'utf8');
      for (const q of e.quote_original.split('\n')) assert.ok(body.includes(q),`${r.candidate_key}: quote mismatch`);
    }
  }
  if(r.status==='rejected_duplicate') assert.ok(items.some(x=>x.id===r.duplicate_of));
}
const s=await createServer({root,configFile:false,optimizeDeps:{noDiscovery:true,include:[],entries:[]},server:{middlewareMode:true,watch:null,hmr:false}});
const occurrenceChecks=[];
const baseline=[];
try {
 const {registerAnchors,resolveOccurrence}=await s.ssrLoadModule('/src/utils/dateUtils.ts');
 registerAnchors(items);
 const stamp=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 for(const y of [2026,2027,2028]) {
   for(const d of ['02-24','05-26','06-16']) baseline.push({year:y,date:d,existing:items.filter(x=>stamp(resolveOccurrence(x,y))===`${y}-${d}`).map(x=>({id:x.id,name:x.name,dateType:x.dateType}))});
   for(const r of records.filter(x=>x.status==='evidenced')) {
     const result=stamp(resolveOccurrence({id:r.candidate_key,date:r.date,dateType:r.dateType},y));
     assert.equal(result,`${y}-${r.date}`);
     occurrenceChecks.push({candidate_key:r.candidate_key,year:y,occurrence:result});
   }
 }
} finally {await s.close();}
const counts=Object.fromEntries(['evidenced','blocked','rejected_duplicate'].map(status=>[status,records.filter(r=>r.status===status).length]));
const byDate=Object.fromEntries(['02-24','05-26','06-16'].map(date=>[date,records.filter(r=>r.date===date&&r.status==='evidenced').length]));
assert.equal(counts.evidenced,6);
assert.equal(counts.blocked,1);
assert.equal(counts.rejected_duplicate,3);
for(const count of Object.values(byDate)) assert.equal(count,2);
console.log(JSON.stringify({ok:true,production_items_checked:items.length,record_count:records.length,status_counts:counts,evidenced_by_date:byDate,quote_substrings_verified:true,required_fields_verified:true,occurrenceChecks,baseline,production_writes:false},null,2));
