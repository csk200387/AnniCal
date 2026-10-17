"""기념일별 처음 실린 날·마지막으로 바뀐 날 생성기.

사이트맵 lastmod 와 Article JSON-LD(datePublished·dateModified)가 쓴다.
빌드 때 git 으로 직접 구하지 않는 이유: Vercel 은 얕은 클론이라 파일별 이력이
없어, 전 URL 이 같은 날짜로 수렴한다. 그래서 전체 이력이 있는 로컬에서 미리
계산해 커밋한다.

방법: 데이터 파일을 건드린 커밋을 오래된 순으로 훑으며 항목별 내용 해시가
바뀐 커밋 날짜(KST)를 기록한다. 해시는 키 정렬 JSON 이라 서식만 바꾼 커밋은
날짜를 움직이지 않는다. 아직 커밋하지 않은 변경은 오늘 날짜로 잡는다.

출력: src/data/lastmod.json  ({ id: { published, modified, hash } })
실행: python3 tools/lastmod/generate_lastmod.py [--check]
      --check 는 파일을 쓰지 않고, 현재 데이터와 어긋난 항목이 있으면 실패한다.
데이터를 고친 커밋 뒤에 한 번 돌려 함께 커밋할 것.
"""

from __future__ import annotations

import hashlib
import json
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = 'src/data/anniversaries'
# 2026-06-24 이전에는 한 파일이었다.
LEGACY_FILE = 'src/data/anniversaries.json'
OUT = ROOT / 'src/data/lastmod.json'
KST = timezone(timedelta(hours=9))


def git(*args: str) -> str:
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True, stderr=subprocess.DEVNULL)


def items_of(text: str) -> list[dict]:
    data = json.loads(text)
    if isinstance(data, dict):
        data = data.get('anniversaries') or data.get('items') or []
    return [a for a in data if isinstance(a, dict) and a.get('id')]


def digest(item: dict) -> str:
    canon = json.dumps(item, sort_keys=True, ensure_ascii=False, separators=(',', ':'))
    return hashlib.sha1(canon.encode('utf-8')).hexdigest()[:12]


def kst_day(iso: str) -> str:
    return datetime.fromisoformat(iso).astimezone(KST).date().isoformat()


def is_data_file(path: str) -> bool:
    return path == LEGACY_FILE or (path.startswith(DATA_DIR + '/') and path.endswith('.json'))


def build() -> dict[str, dict]:
    if (ROOT / '.git' / 'shallow').exists():
        raise SystemExit('얕은 클론에서는 이력이 잘려 날짜가 틀린다. 전체 이력이 있는 곳에서 실행할 것.')
    state: dict[str, dict] = {}
    log = git('log', '--reverse', '--format=%H %cI', '--', LEGACY_FILE, DATA_DIR)
    for line in log.splitlines():
        sha, iso = line.split(' ', 1)
        day = kst_day(iso)
        changed = git('show', '--name-only', '--format=', sha, '--', LEGACY_FILE, DATA_DIR)
        for path in filter(is_data_file, changed.split()):
            try:
                text = git('show', f'{sha}:{path}')
            except subprocess.CalledProcessError:
                continue  # 이 커밋에서 지워진 파일
            for a in items_of(text):
                h = digest(a)
                prev = state.get(a['id'])
                if prev is None:
                    state[a['id']] = {'published': day, 'modified': day, 'hash': h}
                elif prev['hash'] != h:
                    prev.update(modified=day, hash=h)

    today = datetime.now(KST).date().isoformat()
    current: dict[str, dict] = {}
    for f in sorted((ROOT / DATA_DIR).glob('*.json')):
        for a in items_of(f.read_text('utf-8')):
            h = digest(a)
            prev = state.get(a['id'])
            if prev is None:
                current[a['id']] = {'published': today, 'modified': today, 'hash': h}
            elif prev['hash'] != h:
                current[a['id']] = {**prev, 'modified': today, 'hash': h}
            else:
                current[a['id']] = prev
    return dict(sorted(current.items()))


def main() -> None:
    result = build()
    text = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
    if '--check' in sys.argv:
        old = json.loads(OUT.read_text('utf-8')) if OUT.exists() else {}
        stale = [i for i, v in result.items() if old.get(i, {}).get('hash') != v['hash']]
        stale += [i for i in old if i not in result]
        if stale:
            raise SystemExit(f'lastmod.json 이 데이터와 {len(stale)}건 어긋남 (예: {stale[0]}). 다시 생성할 것.')
        print(f'lastmod.json OK ({len(result)}건)')
        return
    OUT.write_text(text, 'utf-8')
    days = sorted({v['modified'] for v in result.values()})
    print(f'{OUT.relative_to(ROOT)}: {len(result)}건, 수정일 {days[0]} ~ {days[-1]} ({len(days)}가지)')


if __name__ == '__main__':
    main()
