"""annual-tabulated 신규 항목을 월별 데이터 파일에 넣는다.

지정한 JSON 의 전체 레코드를 읽어 월별 파일에 날짜 순서로 삽입한다.
annual-tabulated 는 observances.json 의 REFERENCE_YEAR 발생일을, annual-fixed 는
date 필드를 기준으로 월을 정한다. 기존 배열 순서는 건드리지 않는다.

    python3 tools/observances/add_entries.py [보강파일.json]
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_many, dumps  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/anniversaries"
SRC_DEFAULT = ROOT / "tools/enrich/content/observances-new.json"
TABLE = ROOT / "src/data/observances.json"
REFERENCE_YEAR = "2026"   # generate_slugs.py 와 같은 기준. 바꾸면 URL 이 전부 바뀐다.

KEYS = ["id", "date", "dateType", "name", "category", "tags",
        "storytelling", "memes", "sourceUrl"]


def main(argv: list[str]) -> int:
    src = Path(argv[0]) if argv else SRC_DEFAULT
    if not src.is_absolute():
        src = ROOT / src
    table = json.loads(TABLE.read_text(encoding="utf-8"))
    new = {k: v for k, v in json.loads(src.read_text(encoding="utf-8")).items()
           if not k.startswith("_")}
    cats = {c["id"]: c["label"]
            for c in json.loads((ROOT / "src/data/categories.json").read_text(encoding="utf-8"))}

    files = {f: json.loads(f.read_text(encoding="utf-8")) for f in sorted(DATA.glob("*.json"))}
    existing = {a["id"] for arr in files.values() for a in arr}

    placed: dict[Path, list[tuple[str, dict]]] = {}
    for key, rec in new.items():
        assert list(rec.keys()) == KEYS, f"{key}: 키 구성 불일치 {list(rec.keys())}"
        assert rec["id"] not in existing, f"{key}: 이미 존재하는 id {rec['id']}"
        assert rec["category"] in cats, f"{key}: 알 수 없는 카테고리"
        assert rec["tags"] == [cats[rec["category"]]], f"{key}: tags 가 카테고리 레이블과 불일치"
        if rec["dateType"] == "annual-tabulated":
            assert rec["date"] == key, f"{key}: date 필드가 키와 다름 ({rec['date']})"
            assert key in table, f"{key}: observances.json 에 없는 키"
            md = table[key][REFERENCE_YEAR]
        elif rec["dateType"] == "annual-fixed":
            md = rec["date"]
            assert len(md) == 5 and md[2] == "-", f"{key}: annual-fixed 날짜 형식 오류 ({md})"
        else:
            raise AssertionError(f"{key}: 지원하지 않는 dateType {rec['dateType']}")
        placed.setdefault(DATA / f"{md[:2]}.json", []).append((md, rec))

    counts: list[tuple[Path, int, int, int]] = []
    for path, items in sorted(placed.items()):
        arr = files[path]
        before = len(arr)
        for md, rec in sorted(items, key=lambda t: t[0]):
            idx = next((i for i, x in enumerate(arr)
                        if x["dateType"] == "annual-fixed" and x["date"] > md), len(arr))
            arr.insert(idx, rec)
        counts.append((path, before, len(arr), len(items)))

    atomic_write_many({path: dumps(files[path]) for path, *_ in counts})
    for path, before, after, added in counts:
        print(f"  {path.name}: {before} → {after}건  (+{added})")

    print(f"\n{len(new)}건 삽입 완료")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
