"""1회용 마이그레이션: 단일 anniversaries.json → 월별 12파일(src/data/anniversaries/) 분할.

실행:
    python tools/inspector/split_data.py

분할/검증 후 구 파일은 별도로 삭제한다(이 스크립트는 삭제하지 않음).
"""

from __future__ import annotations

import json
from collections import Counter

import data_io

OLD_FILE = data_io.ROOT / "src" / "data" / "anniversaries.json"


def main() -> None:
    items = json.loads(OLD_FILE.read_text(encoding="utf-8"))
    data_io.save_anniversaries(items)

    reloaded = data_io.load_anniversaries()
    assert len(items) == len(reloaded), (
        f"건수 불일치: 원본 {len(items)} != 재로드 {len(reloaded)}"
    )
    assert sorted(a["id"] for a in items) == sorted(a["id"] for a in reloaded), (
        "id 집합 불일치"
    )

    by_id = {a["id"]: a for a in items}
    dist = Counter(data_io.month_of(a, by_id) for a in items)
    print(f"✅ {len(items)}건 → {data_io.DATA_DIR.relative_to(data_io.ROOT)}")
    for m in range(1, 13):
        print(f"   {m:02d}.json: {dist.get(m, 0):>4}건")


if __name__ == "__main__":
    main()
