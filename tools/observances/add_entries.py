"""annual-tabulated 신규 항목을 월별 데이터 파일에 넣는다.

tools/enrich/content/observances-new.json 의 전체 레코드를 읽어,
observances.json 의 REFERENCE_YEAR 발생일이 속한 월 파일에 날짜 순서로 삽입한다.
기존 배열 순서는 건드리지 않는다.

    python3 tools/observances/add_entries.py
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/anniversaries"
SRC = ROOT / "tools/enrich/content/observances-new.json"
TABLE = ROOT / "src/data/observances.json"
REFERENCE_YEAR = "2026"   # generate_slugs.py 와 같은 기준. 바꾸면 URL 이 전부 바뀐다.

KEYS = ["id", "date", "dateType", "name", "category", "tags",
        "storytelling", "memes", "sourceUrl"]


def main() -> int:
    table = json.loads(TABLE.read_text(encoding="utf-8"))
    new = {k: v for k, v in json.loads(SRC.read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    cats = {c["id"]: c["label"]
            for c in json.loads((ROOT / "src/data/categories.json").read_text(encoding="utf-8"))}

    files = {f: json.loads(f.read_text(encoding="utf-8")) for f in sorted(DATA.glob("*.json"))}
    existing = {a["id"] for arr in files.values() for a in arr}

    placed: dict[Path, list[tuple[str, dict]]] = {}
    for key, rec in new.items():
        assert list(rec.keys()) == KEYS, f"{key}: 키 구성 불일치 {list(rec.keys())}"
        assert rec["dateType"] == "annual-tabulated", f"{key}: dateType 이 annual-tabulated 가 아님"
        assert rec["date"] == key, f"{key}: date 필드가 키와 다름 ({rec['date']})"
        assert key in table, f"{key}: observances.json 에 없는 키"
        assert rec["id"] not in existing, f"{key}: 이미 존재하는 id {rec['id']}"
        assert rec["category"] in cats, f"{key}: 알 수 없는 카테고리"
        assert rec["tags"] == [cats[rec["category"]]], f"{key}: tags 가 카테고리 레이블과 불일치"
        md = table[key][REFERENCE_YEAR]
        placed.setdefault(DATA / f"{md[:2]}.json", []).append((md, rec))

    for path, items in sorted(placed.items()):
        arr = files[path]
        before = len(arr)
        for md, rec in sorted(items, key=lambda t: t[0]):
            idx = next((i for i, x in enumerate(arr)
                        if x["dateType"] == "annual-fixed" and x["date"] > md), len(arr))
            arr.insert(idx, rec)
        path.write_text(json.dumps(arr, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  {path.name}: {before} → {len(arr)}건  (+{len(items)})")

    print(f"\n{len(new)}건 삽입 완료")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
