"""국가별 data/<CC>.json 작성 보조. 저장 전에 모든 인용이 저장된 원문 텍스트에 그대로 있는지 확인한다."""
import json
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
DEF = dict(aliases=[], search_result_only=[], related_existing_ids=[], related_prior_candidates=[], quirk=None)


def cl(cid, ko, verdict, *ev):
    """ev: (evidence_id, 원문 인용, 한국어 번역). 다른 후보 폴더의 근거는 '후보키/라벨'."""
    return {'claim_id': cid, 'claim_ko': ko, 'verdict': verdict,
            'evidence': [{'evidence_id': e, 'quote': q, 'quote_ko': k} for e, q, k in ev]}


def cand(**kw):
    return {**DEF, **kw}


def quote_problems(doc):
    log = {(e['candidate_key'], e['label']): e for e in json.loads((BATCH / 'fetch-log.json').read_text())}
    bad = []
    for c in doc['candidates']:
        for claim in c['claims']:
            for ev in claim['evidence']:
                key, label = ev['evidence_id'].split('/', 1) if '/' in ev['evidence_id'] else (c['candidate_key'], ev['evidence_id'])
                e = log.get((key, label))
                if not e or not e.get('text_path'):
                    bad.append((c['candidate_key'], ev['evidence_id'], 'no_evidence'))
                elif ev['quote'] not in (BATCH / e['text_path']).read_text(encoding='utf-8'):
                    bad.append((c['candidate_key'], ev['evidence_id'], ev['quote'][:50]))
    return bad


def save(doc):
    bad = quote_problems(doc)
    path = BATCH / 'data' / f"{doc['country']}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
    print('saved', path.name, len(doc['candidates']), 'quote problems:', bad)
