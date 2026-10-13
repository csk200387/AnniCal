"""data/<국가>.json(국가별 즉시 저장본) + fetch-log.json → records.json (native-languages 형식 + 추가 필드).

    python3 -I scripts/build_records.py

인용·번역은 data 파일에 적힌 그대로 옮긴다(이 스크립트는 인용을 만들지 않는다).
근거 메타데이터(URL·해시·저장 경로·접근일)는 fetch-log 에서 가져온다.
native-languages 판과 달리 claim 이 '다른키/라벨' 로 다른 후보 폴더의 근거를 가리키면 그것도 evidence 에 연결한다
(pl-dzien-wagarowicza 근거 누락의 원인 수정).
"""
import json
from collections import Counter
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
ACCESSED = 'body_read_http_200'
STATUSES = {
    'new_candidate': '신규 후보(독립 원문 2곳 이상 확인)',
    'new_candidate_single_source': '신규 후보(단일 출처 미검증)',
    'listing_only_unverified': '기념일 목록·약한 출처만 확인(미검증)',
    'date_conflict': '존재는 확인, 날짜 상충',
    'search_result_only': '검색결과만 확인(원문 미확인)',
    'blocked': '원문 차단·근거 부족',
    'prior_candidate': '이전 배치 후보와 동일',
    'duplicate': '기존 서비스에 이미 등록',
}
OFFICIALITY = {
    'official_national': '공식(국가 지정 기념일·공휴일)', 'official_observance_not_holiday': '공식(기념일, 공휴일 아님)',
    'official_regional': '공식(지방정부)', 'official_religious_holiday': '공식 공휴일(종교 명절)',
    'regional_tradition': '지역 전통', 'regional_festival': '지역 축제', 'folk_tradition': '민속 전통',
    'folk_tradition_unesco_listed': '민속 전통(UNESCO 무형유산)', 'religious_festival': '종교 축제',
    'commercial': '상업 기원', 'industry': '업계 기념일', 'organization': '단체 지정',
    'unofficial': '비공식', 'unverified': '미확인',
}
OFFICIALITY_CLASS = {
    'official_national': 'official', 'official_observance_not_holiday': 'official', 'official_religious_holiday': 'official',
    'official_regional': 'regional_official', 'regional_tradition': 'folk_tradition', 'regional_festival': 'regional_festival',
    'folk_tradition': 'folk_tradition', 'folk_tradition_unesco_listed': 'folk_tradition', 'religious_festival': 'folk_tradition',
    'commercial': 'commercial', 'industry': 'industry', 'organization': 'organization', 'unofficial': 'unofficial',
    'unverified': 'unknown',
}
REQUIRED = ['candidate_key', 'name_original', 'name_ko', 'aliases', 'date_type', 'date_rule', 'date_note',
            'app_date_support', 'scope', 'kind', 'kind_group', 'officiality', 'meaning_ko', 'quirk', 'founder_origin',
            'founder_check_level', 'founder_check', 'claims', 'search_result_only', 'uncertainty', 'confidence']


def main() -> None:
    log = json.loads((BATCH / 'fetch-log.json').read_text())
    by_key_label = {}
    for e in log:  # 같은 키·라벨을 다시 받은 경우 마지막 시도를 쓴다
        by_key_label[(e['candidate_key'], e['label'])] = e
    files = [json.loads(f.read_text()) for f in sorted((BATCH / 'data').glob('[A-Z][A-Z].json'))]
    sources = {k: v for c in files for k, v in c['sources'].items()}
    records, limits = [], []
    for country in files:
        for c in country['candidates']:
            missing = [k for k in REQUIRED if k not in c]
            assert not missing, f"{c.get('candidate_key')}: 필드 누락 {missing}"
            key = c['candidate_key']
            refs = {ref['evidence_id'] for cl in c['claims'] for ref in cl['evidence']}
            wanted = [(k, lb) for (k, lb) in by_key_label if k == key]
            wanted += [tuple(r.split('/', 1)) for r in refs if '/' in r]
            evidence = []
            for k, label in wanted:
                e = by_key_label[(k, label)]
                eid = label if k == key else f'{k}/{label}'
                evidence.append({
                    'evidence_id': eid, 'url': e['url'], 'final_url': e.get('final_url'),
                    'source_org': sources.get(label, '미기재'),
                    'accessed_at': e['accessed_at'], 'http_status': e.get('status'),
                    'access_status': e['access_status'], 'error': e.get('error'),
                    'read_status': 'original_read' if e['access_status'] == ACCESSED else 'not_read',
                    'sha256': e.get('sha256'), 'local_raw_path': e.get('raw_path'), 'local_text_path': e.get('text_path'),
                })
            ids = {ev['evidence_id'] for ev in evidence}
            assert refs <= ids, f'{key}: 근거 연결 실패 {refs - ids}'
            supported = [cl for cl in c['claims'] if cl['verdict'] == 'supported_by_original']
            read_orgs = {ev['source_org'] for ev in evidence if ev['read_status'] == 'original_read'}
            cited_orgs = {ev['source_org'] for ev in evidence
                          if any(ref['evidence_id'] == ev['evidence_id'] for cl in supported for ref in cl['evidence'])}
            single = len({o.split(' (')[0] for o in cited_orgs}) <= 1
            if c.get('duplicate_of'):
                status = 'duplicate'
            elif c.get('prior_candidate_of'):
                status = 'prior_candidate'
            elif c.get('blocked'):
                status = 'blocked'
            elif not supported:
                status = 'search_result_only'
            elif c.get('date_status') == 'conflict':
                status = 'date_conflict'
            elif c.get('listing_only'):
                status = 'listing_only_unverified'
            elif single:
                status = 'new_candidate_single_source'
            else:
                status = 'new_candidate'
            records.append({
                'candidate_key': key, 'country': country['country'], 'country_ko': country['country_ko'],
                'search_language': country['search_language'],
                'name_original': c['name_original'], 'name_ko': c['name_ko'], 'aliases': c['aliases'],
                'date_type': c['date_type'], 'date_rule': c['date_rule'], 'date_rule_folk': c.get('date_rule_folk'),
                'date_note': c['date_note'], 'date_status': c.get('date_status', 'ok' if (c['date_rule'] or c.get('date_rule_folk')) else 'undetermined'),
                'app_date_support': c['app_date_support'],
                'scope': c['scope'], 'kind': c['kind'], 'kind_group': c['kind_group'],
                'officiality': c['officiality'], 'officiality_label': OFFICIALITY[c['officiality']],
                'officiality_class': OFFICIALITY_CLASS[c['officiality']],
                'meaning_ko': c['meaning_ko'], 'quirk': c['quirk'],
                'founder_origin': c['founder_origin'], 'founder_check_level': c['founder_check_level'],
                'founder_check': c['founder_check'],
                'claims': c['claims'], 'evidence': evidence, 'search_result_only': c['search_result_only'],
                'source_urls': [ev['url'] for ev in evidence if ev['read_status'] == 'original_read'],
                'original_read': bool(supported), 'read_source_orgs': sorted(read_orgs), 'cited_source_orgs': sorted(cited_orgs),
                'single_source_unverified': single and bool(supported), 'listing_only': bool(c.get('listing_only')),
                'duplicate_check': {
                    'verdict': 'duplicate' if c.get('duplicate_of') else ('prior_candidate' if c.get('prior_candidate_of') else 'new'),
                    'duplicate_of': c.get('duplicate_of'), 'prior_candidate_of': c.get('prior_candidate_of'),
                    'related_existing_ids': c.get('related_existing_ids', []),
                    'related_prior_candidates': c.get('related_prior_candidates', []),
                    'distinct_reason': c.get('distinct_reason'),
                },
                'status': status, 'status_label': STATUSES[status],
                'confidence': c['confidence'], 'uncertainty': c['uncertainty'],
                'review': {'decision': 'pending', 'reviewer': None},
                'application': {'applied': False},
            })
        limits.append({'country': country['country'], 'country_ko': country['country_ko'],
                       'summary_ko': country.get('summary_ko'), 'limits': country.get('limits')})
    keys = [r['candidate_key'] for r in records]
    assert len(keys) == len(set(keys)), '후보 키 중복'
    out = {
        '_note': '신규 후보는 독립 검수·반영 승인 전 단계다. 서비스 데이터에 반영되지 않았다.',
        'batch_id': BATCH.name, 'researched_at': '2026-10-12', 'owner': 'Claude Code (Opus 5.5)',
        'statuses': STATUSES, 'officiality_labels': OFFICIALITY,
        'country_limits': limits, 'records': records,
    }
    (BATCH / 'records.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    print(len(records), dict(Counter(r['status'] for r in records)), dict(Counter(r['country'] for r in records)))


if __name__ == '__main__':
    main()
