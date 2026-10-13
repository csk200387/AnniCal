"""작업 전 기준선(읽기 전용). 서비스·기존 연구 파일을 읽기만 하고 이 배치 폴더에만 쓴다.

    python3 -I tools/research/workflow/batches/native-languages-20261012/scripts/baseline.py [--out baseline.json]

- 월별 서비스 데이터 수(파일 기준)·카테고리·dateType 집계
- 보호 대상(src/ tests/ tools/ 중 이 배치 밖) 파일 SHA256 스냅샷 → 작업 후 verify 가 같은 함수로 다시 계산해 비교
- 이전 배치 후보 색인(prior-candidates.json): 이름/별명/원명/날짜/나라 대조용
"""
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
ROOT = BATCH.parents[4]
PROTECTED_DIRS = ['src', 'tests', 'tools']


def protected_hashes() -> dict:
    out = {}
    for d in PROTECTED_DIRS:
        for p in sorted((ROOT / d).rglob('*')):
            if not p.is_file() or BATCH in p.parents or 'node_modules' in p.parts or '__pycache__' in p.parts:
                continue
            out[str(p.relative_to(ROOT))] = hashlib.sha256(p.read_bytes()).hexdigest()
    return out


def service_items() -> list:
    items = []
    for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')):
        for a in json.loads(f.read_text()):
            items.append({**a, '_file': f.name})
    return items


def prior_candidates() -> list:
    rows = []
    for rec_file in sorted((BATCH.parent).glob('*/records.json')):
        if rec_file.parent == BATCH:
            continue
        data = json.loads(rec_file.read_text())
        recs = data['records'] if isinstance(data, dict) else data
        for r in recs:
            rows.append({
                'batch': rec_file.parent.name,
                'candidate_key': r.get('candidate_key'),
                'name_ko': r.get('name_ko'),
                'name_original': r.get('name_original'),
                'aliases': r.get('aliases') or [],
                'date_rule': r.get('date_rule'),
                'scope': r.get('scope') or r.get('scope_country_or_region'),
                'status': r.get('discovery_status') or r.get('status'),
            })
    return rows


if __name__ == '__main__':
    out_name = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else 'baseline.json'
    items = service_items()
    baseline = {
        'service_total': len(items),
        'monthly_file_counts': dict(sorted(Counter(a['_file'][:2] for a in items).items())),
        'date_type_counts': dict(Counter(a['dateType'] for a in items)),
        'category_counts': dict(Counter(a['category'] for a in items).most_common()),
        'protected_file_count': 0,
        'protected_hashes': protected_hashes(),
    }
    baseline['protected_file_count'] = len(baseline['protected_hashes'])
    (BATCH / out_name).write_text(json.dumps(baseline, ensure_ascii=False, indent=1) + '\n')
    prior = prior_candidates()
    (BATCH / 'prior-candidates.json').write_text(json.dumps(prior, ensure_ascii=False, indent=1) + '\n')
    print(json.dumps({k: v for k, v in baseline.items() if k != 'protected_hashes'}, ensure_ascii=False))
    print('prior candidates:', Counter(p['batch'] for p in prior))
