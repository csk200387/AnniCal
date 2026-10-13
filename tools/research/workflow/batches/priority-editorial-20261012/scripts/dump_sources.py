"""읽기 전용: queue 항목별 원본 record 의 claims/evidence/uncertainty 를 요약 출력한다.
  python3 -I scripts/dump_sources.py <start> <end>   (queue 인덱스 범위)"""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[6]
BATCH = pathlib.Path(__file__).resolve().parents[1]
q = json.loads((BATCH / 'queue.json').read_text())['entries']
a, b = int(sys.argv[1]), int(sys.argv[2])
cache = {}
for e in q[a:b]:
    p = ROOT / e['source_record_path']
    recs = cache.setdefault(p, json.loads(p.read_text())['records'])
    r = next(x for x in recs if x['candidate_key'] == e['candidate_key'])
    src_dir = p.parent
    print('=' * 100)
    print(e['uid'], '|', e['name_ko'], '|', e['date_type'], e['date_rule'], '| note:', e.get('date_note'))
    for k in ('scope', 'officiality', 'officiality_label', 'meaning_ko', 'meaning', 'founder_origin', 'caution', 'date_note', 'date_rule_folk', 'uncertainty', 'unverified_fields', 'blocked_reason', 'category_reason', 'distinct_from_similar_reason', 'duplicate_check', 'quirk'):
        if r.get(k): print(f'  [{k}]', json.dumps(r[k], ensure_ascii=False)[:700])
    print('  [queue.uncertainty]', e.get('uncertainty'), '| conflicts:', e.get('conflicting_claims'))
    for c in r['claims']:
        print(f"  - CLAIM {c['claim_id']} ({c['verdict']}): {c.get('claim_ko') or c.get('claim')}")
        for ev in c['evidence']:
            print(f"      <{ev['evidence_id']}> {ev['quote'][:400]}")
    for ev in r['evidence']:
        lp = ev.get('local_text_path') or ev.get('local_evidence_path')
        size = (src_dir / lp).stat().st_size if lp and (src_dir / lp).exists() else None
        print(f"  * EV {ev['evidence_id']} | {ev.get('access_status') or ev.get('read_status')} | {ev['url'][:120]} | {lp} ({size})")
    for f in r.get('search_result_only', []) + r.get('failed_access_attempts', []):
        print('  ~ ', json.dumps(f, ensure_ascii=False)[:250])
