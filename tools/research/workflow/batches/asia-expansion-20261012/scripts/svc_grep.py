"""서비스 1,756건(읽기 전용)에서 이름·id·본문 앞부분을 대소문자 무시로 찾는다. 중복 판정 보조용.

    python3 -I scripts/svc_grep.py 용어 [용어 ...]
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
items = [a for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')) for a in json.loads(f.read_text())]
for term in sys.argv[1:]:
    t = term.lower()
    hits = [a for a in items if t in (a['id'] + ' ' + a['name'] + ' ' + a['storytelling']['origin'][:300]).lower()]
    print(f'## {term}: {len(hits)}')
    for a in hits[:8]:
        print(f"   {a['date']} {a['dateType']} | {a['id']} | {a['name']}")
