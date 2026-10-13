"""라운드2: integration-result.json 의 pending_uids 27건 초안만 다룬다.
drafts-round2.json 에 합치고 proposed-records-round2.json·evidence-map-round2.json·progress-round2.md 를 다시 만든다.
1라운드 파일(drafts.json·evidence-map.json·proposed-records.json·progress.md)과 서비스 파일은 읽기만 한다.

    python3 -I scripts/add_drafts_round2.py < part.json
    python3 -I scripts/add_drafts_round2.py --rebuild

draft: {uid, status, anniversary:{...}, claims_used:[원본 claim_id], extra:[{claim_id, claim_ko, path, quote}],
        notes:[...], dedup:str, date_check:str}
extra.path 는 repo 루트 기준. quote 는 그 파일에 글자 그대로 있어야 한다. url 은 원문 수집 기록에서 자동으로 채운다.
"""
import json
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
BATCH = Path(__file__).resolve().parents[1]
REL = lambda p: str(Path(p).resolve().relative_to(ROOT))
STATUSES = {'ready_for_review', 'shorter_evidenced', 'blocked', 'duplicate', 'date_support_unverified'}
PROPOSABLE = {'ready_for_review', 'shorter_evidenced'}
pending = json.loads((BATCH / 'integration-result.json').read_text())['pending_uids']
queue = [e for e in json.loads((BATCH / 'queue.json').read_text())['entries'] if e['uid'] in pending]
labels = {c['id']: c['label'] for c in json.loads((ROOT / 'src/data/categories.json').read_text())}
service_ids = {a['id'] for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')) for a in json.loads(f.read_text())}
round1_ids = {d['anniversary']['id'] for d in json.loads((BATCH / 'drafts.json').read_text())['drafts'].values()}
DRAFTS = BATCH / 'drafts-round2.json'
store = json.loads(DRAFTS.read_text()) if DRAFTS.exists() else {
    '_note': '라운드2 작성자 초안(pending 27건). 승인·반영 아님. status 는 검수 요청 상태이며 approved/applied 를 쓰지 않는다.',
    'batch_id': 'priority-editorial-20261012', 'round': 2, 'drafts': {}}


def source_record(e):
    recs = json.loads((ROOT / e['source_record_path']).read_text())['records']
    return next(r for r in recs if r['candidate_key'] == e['candidate_key'])


# 원문 파일 경로 → 수집 URL (원본 record + 이 배치 fetch-log)
path_url = {}
for e in queue:
    src_dir = (ROOT / e['source_record_path']).parent
    for ev in source_record(e)['evidence']:
        lp = ev.get('local_text_path') or ev.get('local_evidence_path')
        if lp:
            path_url[REL(src_dir / lp)] = ev['url']
for f in json.loads((BATCH / 'fetch-log.json').read_text()):
    if f.get('text_path'):
        path_url[REL(BATCH / f['text_path'])] = f['url']


def check(d):
    errs, a = [], d['anniversary']
    if d['status'] not in STATUSES:
        errs.append(f"status {d['status']}")
    if a['category'] not in labels:
        errs.append(f"category {a['category']}")
    if a['tags'] != [labels.get(a['category'])]:
        errs.append(f"tags {a['tags']}")
    if a['id'] in service_ids or a['id'] in round1_ids:
        errs.append(f"id 충돌 {a['id']}")
    for x in d.get('extra', []):
        if x['path'] not in path_url:
            errs.append(f"수집 기록 없는 경로 {x['path']}")
        elif x['quote'] not in (ROOT / x['path']).read_text(encoding='utf-8'):
            errs.append(f"extra quote 불일치 {x['claim_id']}: {x['quote'][:60]}")
    return errs


if '--rebuild' not in sys.argv:
    part = json.load(sys.stdin)
    bad = []
    for d in part:
        if d['uid'] not in pending:
            bad.append(f"{d['uid']}: pending 아님")
            continue
        d['anniversary'].setdefault('tags', [labels.get(d['anniversary']['category'])])
        bad += [f"{d['uid']}: {m}" for m in check(d)]
    if bad:
        sys.exit('중단:\n' + '\n'.join(bad))
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    for d in part:
        st = d['anniversary']['storytelling']
        d['lengths'] = {'origin': len(st['origin']), 'anecdote': len(st['anecdote'] or ''),
                        'total': len(st['origin']) + len(st['anecdote'] or '')}
        d['written_at'] = now
        store['drafts'][d['uid']] = d

drafts = store['drafts']
for d in drafts.values():
    for x in d.get('extra', []):
        x['url'] = path_url.get(x['path'], x.get('url'))
DRAFTS.write_text(json.dumps(store, ensure_ascii=False, indent=1) + '\n')
order = [e['uid'] for e in queue]

prop = {'_note': '라운드2 검수 전 제안. 서비스에 반영되지 않았고 승인되지 않았다. ready_for_review/shorter_evidenced 만 담는다. '
                 '보류(blocked/duplicate/date_support_unverified) 초안은 drafts-round2.json 참고.',
        'batch_id': 'priority-editorial-20261012', 'round': 2,
        'records': {u: drafts[u]['anniversary'] for u in order if u in drafts and drafts[u]['status'] in PROPOSABLE},
        'withheld': {u: drafts[u]['status'] for u in order if u in drafts and drafts[u]['status'] not in PROPOSABLE}}
(BATCH / 'proposed-records-round2.json').write_text(json.dumps(prop, ensure_ascii=False, indent=1) + '\n')

emap = {'_note': '라운드2 주장별 근거. path 는 repo 루트 기준. origin_batch=원본 배치 record 인용, this_batch=이번에 새로 붙인 인용. '
                 'used=본문에 쓴 주장인지.', 'round': 2, 'items': {}}
for e in queue:
    u = e['uid']
    if u not in drafts:
        continue
    r = source_record(e)
    src_dir = (ROOT / e['source_record_path']).parent
    evs = {ev['evidence_id']: ev for ev in r['evidence']}
    used = set(drafts[u].get('claims_used', []))
    claims = []
    for c in r['claims']:
        quotes = []
        for ref in c['evidence']:
            ev = evs.get(ref['evidence_id'], {})
            lp = ev.get('local_text_path') or ev.get('local_evidence_path')
            quotes.append({'evidence_id': ref['evidence_id'], 'url': ev.get('url'), 'path': REL(src_dir / lp) if lp else None,
                           'quote': ref['quote'], 'quote_ko': ref.get('quote_ko')})
        claims.append({'claim_id': c['claim_id'], 'claim_ko': c.get('claim_ko') or c.get('claim'), 'verdict': c['verdict'],
                       'scope': 'origin_batch', 'used': c['claim_id'] in used, 'quotes': quotes})
    for x in drafts[u].get('extra', []):
        claims.append({'claim_id': x['claim_id'], 'claim_ko': x['claim_ko'], 'verdict': 'supported_by_original',
                       'scope': 'this_batch', 'used': True, 'quotes': [{'url': x['url'], 'path': x['path'], 'quote': x['quote']}]})
    emap['items'][u] = {'candidate_key': e['candidate_key'], 'source_record_path': e['source_record_path'],
                        'sourceUrl': drafts[u]['anniversary']['sourceUrl'], 'claims': claims}
(BATCH / 'evidence-map-round2.json').write_text(json.dumps(emap, ensure_ascii=False, indent=1) + '\n')

cnt = Counter(drafts[u]['status'] for u in drafts)
lines = ['# 진행 상황 — priority-editorial-20261012 라운드2 (pending 27)', '',
         f'갱신: {datetime.now(timezone.utc).isoformat(timespec="seconds")}', '',
         f'처리 {len(drafts)}/{len(queue)} · ' + ' · '.join(f'{k} {v}' for k, v in sorted(cnt.items())), '',
         '| uid | 상태 | id | date | origin/anecdote 자 |', '|---|---|---|---|---|']
for u in order:
    d = drafts.get(u)
    lines.append(f"| {u} | {d['status']} | {d['anniversary']['id']} | {d['anniversary']['date']} | {d['lengths']['origin']}/{d['lengths']['anecdote']} |"
                 if d else f'| {u} | (미처리) | | | |')
(BATCH / 'progress-round2.md').write_text('\n'.join(lines) + '\n')
print(f'round2 drafts {len(drafts)}/{len(queue)}', dict(cnt))
