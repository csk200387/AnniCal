"""data/<국가>.json(국가별 즉시 저장본) + fetch-log.json → records.json.

    python3 -I scripts/build_records.py

인용·번역은 data 파일에 따로 적힌 그대로 옮긴다(이 스크립트는 인용을 만들지 않는다).
근거 메타데이터(URL·해시·저장 경로·접근일)는 fetch-log 에서 그대로 가져온다.
"""
import json
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
ACCESSED = 'body_read_http_200'

STATUSES = {
    'new_candidate': '신규 후보(원문 확인)',
    'new_candidate_single_source': '신규 후보(단일 출처 미검증)',
    'hold_rule_unsupported': '보류 — 날짜 규칙 미지원(부활절·음력 표 없음)',
    'search_result_only': '검색결과만 확인(원문 미확인)',
    'prior_candidate': '이전 배치 후보와 동일',
    'duplicate': '기존 서비스에 이미 등록',
    'blocked': '원문 차단·근거 부족',
}
OFFICIALITY = {
    'official_state_law': '공식(주 법률)', 'official_cabinet_resolution': '공식(내각 결의)',
    'official_national': '공식(국정 기념일)', 'official_observance_not_holiday': '공식(기념일, 공휴일 아님)',
    'regional_tradition': '지역 전통', 'regional_festival': '지역 축제',
    'folk_tradition': '민속 전통', 'folk_tradition_unesco_listed': '민속 전통(UNESCO 무형유산)',
    'religious_feast_folk_custom': '종교 축일의 민간 풍습', 'folk_business_custom': '민속·상업 풍습',
    'commercial': '상업 기원', 'industry': '업계 기념일', 'industry_folk': '업계·전설',
    'unofficial': '비공식', 'unverified': '미확인',
}


def main() -> None:
    log = json.loads((BATCH / 'fetch-log.json').read_text())
    by_key_label = {}
    for e in log:  # 같은 키·라벨을 다시 받은 경우 마지막 시도를 쓴다
        by_key_label[(e['candidate_key'], e['label'])] = e
    records = []
    for f in sorted((BATCH / 'data').glob('*.json')):
        country = json.loads(f.read_text())
        overrides = country.get('read_status_overrides', {})
        for c in country['candidates']:
            key = c['candidate_key']
            evidence = []
            for (k, label), e in by_key_label.items():
                if k != key:
                    continue
                access = overrides.get(label, {}).get('access_status', e['access_status'])
                evidence.append({
                    'evidence_id': label, 'url': e['url'], 'final_url': e.get('final_url'),
                    'source_org': country['sources'].get(label, '미기재'),
                    'accessed_at': e['accessed_at'], 'http_status': e.get('status'),
                    'access_status': access, 'error': e.get('error'),
                    'read_status': 'original_read' if access == ACCESSED else 'not_read',
                    'override_note': overrides.get(label, {}).get('note'),
                    'sha256': e.get('sha256'), 'local_raw_path': e.get('raw_path'), 'local_text_path': e.get('text_path'),
                })
            supported = [cl for cl in c['claims'] if cl['verdict'] == 'supported_by_original']
            read_orgs = {ev['source_org'] for ev in evidence if ev['read_status'] == 'original_read'}
            cited_orgs = {ev['source_org'] for ev in evidence
                          if any(ref['evidence_id'] == ev['evidence_id'] for cl in c['claims'] for ref in cl['evidence'])}
            single = len({o.split(' (')[0] for o in cited_orgs}) <= 1
            if c.get('duplicate_of'):
                status = 'duplicate'
            elif c.get('prior_candidate_of'):
                status = 'prior_candidate'
            elif c.get('rule_support', '').startswith('unsupported'):
                status = 'hold_rule_unsupported'
            elif not supported:
                status = 'search_result_only'
            elif single:
                status = 'new_candidate_single_source'
            else:
                status = 'new_candidate'
            records.append({
                'candidate_key': key, 'country': country['country'], 'country_ko': country['country_ko'],
                'search_language': country['search_language'],
                'name_original': c['name_original'], 'name_ko': c['name_ko'], 'aliases': c['aliases'],
                'date_type': c['date_type'], 'date_rule': c['date_rule'], 'date_note': c['date_note'],
                'rule_support': c.get('rule_support', 'supported' if c['date_type'] else 'unknown'),
                'scope': c['scope'], 'kind': c['kind'],
                'officiality': c['officiality'], 'officiality_label': OFFICIALITY[c['officiality']],
                'meaning_ko': c['meaning_ko'], 'quirk': c['quirk'],
                'founder_origin': c['founder_origin'], 'founder_check_level': c['founder_check_level'],
                'claims': c['claims'], 'evidence': evidence,
                'search_result_only': c['search_result_only'],
                'source_urls': [ev['url'] for ev in evidence if ev['read_status'] == 'original_read'],
                'original_read': bool(supported), 'read_source_orgs': sorted(read_orgs), 'cited_source_orgs': sorted(cited_orgs),
                'single_source_unverified': single and bool(supported),
                'duplicate_check': {
                    'verdict': 'duplicate' if c.get('duplicate_of') else ('prior_candidate' if c.get('prior_candidate_of') else 'new'),
                    'duplicate_of': c.get('duplicate_of'), 'prior_candidate_of': c.get('prior_candidate_of'),
                    'related_existing_ids': c.get('related_existing_ids', []),
                    'related_prior_candidates': c.get('related_prior_candidates', []),
                },
                'status': status, 'status_label': STATUSES[status],
                'confidence': c['confidence'], 'uncertainty': c['uncertainty'],
                'review': {'decision': 'pending', 'reviewer': None},
                'application': {'applied': False},
            })
        if country.get('limits'):
            records_limits.append({'country': country['country'], 'country_ko': country['country_ko'], 'limits': country['limits']})
    out = {
        '_note': '신규 후보는 독립 검수·반영 승인 전 단계다. 서비스 데이터에 반영되지 않았다.',
        'batch_id': BATCH.name, 'researched_at': '2026-10-12', 'owner': 'Claude Code (Opus 5.5)',
        'statuses': STATUSES, 'officiality_labels': OFFICIALITY,
        'country_limits': records_limits, 'records': records,
    }
    (BATCH / 'records.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    from collections import Counter
    print(len(records), Counter(r['status'] for r in records), Counter(r['country'] for r in records))


records_limits = []
if __name__ == '__main__':
    main()
