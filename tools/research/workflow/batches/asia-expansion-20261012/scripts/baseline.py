"""작업 전후 보호 파일 해시(읽기 전용). 이 배치 폴더와 tools/research/reports/ 만 제외한다.

    python3 -I scripts/baseline.py            # baseline.json 생성(최초 1회)
    python3 -I scripts/baseline.py --check    # 지금 해시를 baseline 과 비교해 변경 목록 출력

대상: git 추적 + 미추적(.gitignore 제외) 파일 전부 — src·tests·tools·이전 배치·footer·미추적 파일 포함.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
ROOT = BATCH.parents[4]
EXCLUDE = [str(BATCH.relative_to(ROOT)) + '/', 'tools/research/reports/']


def hashes() -> dict:
    files = subprocess.run(['git', 'ls-files', '-co', '--exclude-standard', '-z'], cwd=ROOT,
                           capture_output=True, check=True).stdout.decode().split('\0')
    out = {}
    for f in sorted(x for x in files if x and not any(x.startswith(e) for e in EXCLUDE)):
        p = ROOT / f
        if p.is_file():
            out[f] = hashlib.sha256(p.read_bytes()).hexdigest()
    return out


if __name__ == '__main__':
    path = BATCH / 'baseline.json'
    now = hashes()
    if '--check' in sys.argv:
        base = json.loads(path.read_text())['protected_hashes']
        changed = sorted(k for k in base.keys() | now.keys() if base.get(k) != now.get(k))
        print(json.dumps({'checked': len(base), 'changed': changed}, ensure_ascii=False))
        sys.exit(1 if changed else 0)
    items = [a for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')) for a in json.loads(f.read_text())]
    path.write_text(json.dumps({'service_total': len(items), 'protected_file_count': len(now),
                                'excluded_prefixes': EXCLUDE, 'protected_hashes': now}, ensure_ascii=False, indent=1) + '\n')
    print('service', len(items), 'protected', len(now))
