"""국가 완료 체크포인트: progress-state 갱신 → build_records → consolidate(진행중).

    python3 -I scripts/mark_done.py CN
"""
import json
import subprocess
import sys
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
p = BATCH / 'data/progress-state.json'
st = json.loads(p.read_text())
for cc in sys.argv[1:]:
    if cc not in st['done']:
        st['done'].append(cc)
    st['remaining'] = [c for c in st['remaining'] if c != cc]
    doc = json.loads((BATCH / f'data/{cc}.json').read_text())
    st['country_summaries'][cc] = doc.get('summary_ko', '') + (f" 한계: {doc['limits']}" if doc.get('limits') else '')
st['note'] = f"이전 3개 배치 83건 검증·통합 완료. 아시아 조사 진행 중 — 완료 {', '.join(st['done'])}."
p.write_text(json.dumps(st, ensure_ascii=False, indent=1) + '\n')
subprocess.run([sys.executable, '-I', str(BATCH / 'scripts/build_records.py')], check=True)
out = subprocess.run([sys.executable, '-I', str(BATCH / 'scripts/consolidate.py')], check=True, capture_output=True, text=True).stdout
s = json.loads(out)
print('raw', s['raw_total'], 'dedup', s['dedup'], 'quotes', s['quotes'], 'hashes', s['raw_hashes'], 'search', s['asia_search_by_country'])
