"""초안 묶음을 drafts.json 에 합치고 proposed-records.json·evidence-map.json·progress.md 를 다시 만든다.
서비스 파일(src/data 등)은 읽기만 한다.

    python3 -I scripts/add_drafts.py < part.json      # part.json = [draft, ...]
    python3 -I scripts/add_drafts.py --rebuild         # 입력 없이 파생 파일만 재생성

draft 형식:
  {uid, status, anniversary:{...}, claims_used:[원본 claim_id], extra:[{claim_id, claim_ko, path, url, quote}],
   notes:[...], dedup:str, date_check:str}
extra.path 는 repo 루트 기준 상대경로. quote 는 그 파일 본문에 글자 그대로 있어야 한다(없으면 중단).
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
BATCH = Path(__file__).resolve().parents[1]
REL = lambda p: str(Path(p).resolve().relative_to(ROOT))
STATUSES = {'ready_for_review', 'shorter_evidenced', 'blocked', 'duplicate', 'date_support_unverified'}
PROPOSABLE = {'ready_for_review', 'shorter_evidenced'}
queue = json.loads((BATCH / 'queue.json').read_text())['entries']
labels = {c['id']: c['label'] for c in json.loads((ROOT / 'src/data/categories.json').read_text())}
DRAFTS = BATCH / 'drafts.json'
store = json.loads(DRAFTS.read_text()) if DRAFTS.exists() else {
    '_note': '작성자 초안. 승인·반영 아님. status 는 검수 요청 상태이며 approved/applied 를 쓰지 않는다.',
    'batch_id': 'priority-editorial-20261012', 'drafts': {}}


def source_record(e):
    recs = json.loads((ROOT / e['source_record_path']).read_text())['records']
    return next(r for r in recs if r['candidate_key'] == e['candidate_key'])


def check(d):
    errs = []
    a = d['anniversary']
    if d['status'] not in STATUSES:
        errs.append(f"status {d['status']}")
    if a['category'] not in labels:
        errs.append(f"category {a['category']}")
    if a['tags'] != [labels.get(a['category'])]:
        errs.append(f"tags {a['tags']}")
    for x in d.get('extra', []):
        body = (ROOT / x['path']).read_text(encoding='utf-8')
        if x['quote'] not in body:
            errs.append(f"extra quote 불일치 {x['claim_id']}: {x['quote'][:60]}")
    return errs


if '--rebuild' not in sys.argv:
    part = json.load(sys.stdin)
    qids = {e['uid'] for e in queue}
    bad = []
    for d in part:
        if d['uid'] not in qids:
            bad.append(f"{d['uid']}: queue 에 없음")
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
    DRAFTS.write_text(json.dumps(store, ensure_ascii=False, indent=1) + '\n')

drafts = store['drafts']
order = [e['uid'] for e in queue]

# extra 인용의 url 을 원문 파일을 저장한 원본 record(또는 이 배치 fetch-log)의 url 로 맞춘다 — 손으로 옮겨 적은 url 오타 방지.
path_url = {}
for e in queue:
    src_dir = (ROOT / e['source_record_path']).parent
    for ev in source_record(e)['evidence']:
        lp = ev.get('local_text_path') or ev.get('local_evidence_path')
        if lp:
            path_url[REL(src_dir / lp)] = ev['url']
flog = BATCH / 'fetch-log.json'
for f in (json.loads(flog.read_text()) if flog.exists() else []):
    if f.get('text_path'):
        path_url[REL(BATCH / f['text_path'])] = f['url']
for d in drafts.values():
    for x in d.get('extra', []):
        x['url'] = path_url.get(x['path'], x['url'])
DRAFTS.write_text(json.dumps(store, ensure_ascii=False, indent=1) + '\n')

# proposed-records.json — 검수 요청 가능한 상태만. 보류 항목 초안은 drafts.json 에만 둔다.
prop = {'_note': '검수 전 제안. 서비스에 반영되지 않았고 승인되지 않았다. 반영 전 독립 검수·사람 승인·generate_slugs 필요. '
                 'ready_for_review/shorter_evidenced 만 담는다. 보류(blocked/duplicate/date_support_unverified) 초안은 drafts.json 참고.',
        'batch_id': 'priority-editorial-20261012',
        'records': {u: drafts[u]['anniversary'] for u in order if u in drafts and drafts[u]['status'] in PROPOSABLE},
        'withheld': {u: drafts[u]['status'] for u in order if u in drafts and drafts[u]['status'] not in PROPOSABLE}}
(BATCH / 'proposed-records.json').write_text(json.dumps(prop, ensure_ascii=False, indent=1) + '\n')

# evidence-map.json — 원본 record 의 주장·인용 + 이 배치에서 새로 붙인 인용. 경로는 repo 루트 기준.
emap = {'_note': '주장별 근거. path 는 repo 루트 기준 상대경로. origin_batch=원본 배치 record 의 인용(이번에 본문 대조), '
                 'this_batch=이번 배치에서 새로 붙인 인용. used=본문에 쓴 주장인지.', 'items': {}}
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
                       'scope': 'this_batch', 'used': True,
                       'quotes': [{'evidence_id': x.get('evidence_id'), 'url': x['url'], 'path': x['path'], 'quote': x['quote']}]})
    emap['items'][u] = {'candidate_key': e['candidate_key'], 'source_record_path': e['source_record_path'],
                        'sourceUrl': drafts[u]['anniversary']['sourceUrl'], 'claims': claims}
(BATCH / 'evidence-map.json').write_text(json.dumps(emap, ensure_ascii=False, indent=1) + '\n')

# progress.md
from collections import Counter
cnt = Counter(drafts[u]['status'] for u in drafts)
lines = ['# 진행 상황 — priority-editorial-20261012', '',
         f'갱신: {datetime.now(timezone.utc).isoformat(timespec="seconds")}', '',
         f'처리 {len(drafts)}/{len(queue)} · ' + ' · '.join(f'{k} {v}' for k, v in sorted(cnt.items())), '',
         '| # | uid | 상태 | id | origin/anecdote 자 |', '|---|---|---|---|---|']
for i, u in enumerate(order):
    d = drafts.get(u)
    if d:
        lines.append(f"| {i} | {u} | {d['status']} | {d['anniversary']['id']} | {d['lengths']['origin']}/{d['lengths']['anecdote']} |")
    else:
        lines.append(f'| {i} | {u} | (미처리) | | |')
(BATCH / 'progress.md').write_text('\n'.join(lines) + '\n')
print(f'drafts {len(drafts)}/{len(queue)}', dict(cnt))
