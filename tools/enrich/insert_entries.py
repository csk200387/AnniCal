"""신규 기념일을 월별 데이터 파일에 삽입한다.

content/*.json 의 { id: {date, dateType, name, category, tags, storytelling, memes, sourceUrl} }
를 읽어 src/data/anniversaries/{01..12}.json 의 알맞은 월 파일에 날짜 순서로 끼워 넣는다.

`tools/observances/add_entries.py` 가 annual-tabulated 전용인 것과 달리 이쪽은 일반
타입(annual-fixed / annual-nth-weekday / annual-relative-to-holiday)을 받는다.
월 결정 규칙은 tools/inspector/data_io.py 와 같다 — 상대일 타입은 anchor 가 속한
월을 재귀로 따라간다.

삽입 전에 다음을 막는다. 하나라도 걸리면 아무 파일도 쓰지 않는다.

  - id 중복 (기존 데이터·입력 파일 양쪽)
  - categories.json 에 없는 category, category 레이블과 어긋나는 tags
  - 필수 필드 누락, dateType 과 date 포맷 불일치
  - 데이터셋에 없는 anchor

    python3 tools/enrich/insert_entries.py content/gov-legal-new.json
"""
from __future__ import annotations

import json
import re
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_many, dumps  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/anniversaries"
CATEGORIES = ROOT / "src/data/categories.json"
OBSERVANCES = ROOT / "src/data/observances.json"

REFERENCE_YEAR = 2026  # generate_slugs.py 와 같은 기준연도
DOW = {"SUN": 6, "MON": 0, "TUE": 1, "WED": 2, "THU": 3, "FRI": 4, "SAT": 5}
REQUIRED = ("date", "dateType", "name", "category", "tags", "storytelling", "memes", "sourceUrl")


def month_of(entry: dict, by_id: dict[str, dict], depth: int = 0) -> int:
    """이 항목이 들어갈 월(1~12). 상대일 타입은 anchor 를 재귀로 따라간다."""
    if depth > 5:
        raise ValueError(f"anchor 순환: {entry.get('id')}")
    dt, raw = entry["dateType"], entry["date"]
    if dt in ("annual-fixed", "annual-nth-weekday"):
        return int(raw.split("-")[0])
    if dt == "annual-tabulated":
        table = json.loads(OBSERVANCES.read_text(encoding="utf-8"))
        return int(table[raw][str(REFERENCE_YEAR)].split("-")[0])
    if dt == "annual-relative-to-holiday":
        # anchor 발생일에 offset 을 더하면 달을 넘길 수 있다(추석 전날이 8월이 되는 해처럼).
        # anchor 의 월이 아니라 실제 발생일의 월을 따른다.
        return occurrence(entry, by_id, depth).month
    return int(raw[5:7])  # YYYY-MM-DD


def occurrence(entry: dict, by_id: dict[str, dict], depth: int = 0) -> date:
    """REFERENCE_YEAR 기준 발생일 — 파일 안에서의 삽입 위치를 정하는 데 쓴다."""
    if depth > 5:
        raise ValueError(f"anchor 순환: {entry.get('id')}")
    dt, raw = entry["dateType"], entry["date"]
    if dt == "annual-fixed":
        mm, dd = map(int, raw.split("-"))
        return date(REFERENCE_YEAR, mm, dd)
    if dt == "annual-nth-weekday":
        import calendar
        from datetime import timedelta
        mm, n, dow = raw.split("-")
        month, target = int(mm), DOW[dow.upper()]
        if n.upper() == "L":
            last = date(REFERENCE_YEAR, month, calendar.monthrange(REFERENCE_YEAR, month)[1])
            return last - timedelta(days=(last.weekday() - target) % 7)
        first = date(REFERENCE_YEAR, month, 1)
        return date(REFERENCE_YEAR, month, 1 + (target - first.weekday()) % 7 + (int(n) - 1) * 7)
    if dt == "annual-tabulated":
        table = json.loads(OBSERVANCES.read_text(encoding="utf-8"))
        mm, dd = map(int, table[raw][str(REFERENCE_YEAR)].split("-"))
        return date(REFERENCE_YEAR, mm, dd)
    if dt == "annual-relative-to-holiday":
        from datetime import timedelta
        anchor_id, _, offset = raw.rpartition(":")
        return occurrence(by_id[anchor_id], by_id, depth + 1) + timedelta(days=int(offset))
    y, m, d = map(int, raw.split("-"))
    return date(y, m, d)


def validate(eid: str, e: dict, labels: dict[str, str], by_id: dict[str, dict]) -> list[str]:
    errs = []
    for k in REQUIRED:
        if k not in e:
            errs.append(f"{eid}: 필수 필드 누락 '{k}'")
    if errs:
        return errs
    if eid in by_id:
        errs.append(f"{eid}: 이미 데이터에 있는 id")
    cat = e["category"]
    if cat not in labels:
        errs.append(f"{eid}: categories.json 에 없는 category '{cat}'")
    elif e["tags"] != [labels[cat]]:
        errs.append(f"{eid}: tags 는 [{labels[cat]!r}] 여야 하는데 {e['tags']!r}")
    dt, raw = e["dateType"], e["date"]
    ok = {
        "annual-fixed": lambda: bool(re.fullmatch(r"\d{2}-\d{2}", raw)),
        "annual-nth-weekday": lambda: bool(re.fullmatch(r"\d{2}-(?:[1-5]|L)-(?:SUN|MON|TUE|WED|THU|FRI|SAT)", raw)),
        "annual-relative-to-holiday": lambda: ":" in raw and raw.rpartition(":")[0] in by_id,
        "annual-tabulated": lambda: raw in json.loads(OBSERVANCES.read_text(encoding="utf-8")),
        "annual-floating": lambda: bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw)),
        "one-time": lambda: bool(re.fullmatch(r"\d{4}-\d{2}-\d{2}", raw)),
    }.get(dt)
    if ok is None:
        errs.append(f"{eid}: 알 수 없는 dateType '{dt}'")
    elif not ok():
        errs.append(f"{eid}: dateType '{dt}' 에 맞지 않는 date '{raw}'")
    st = e["storytelling"]
    if not st.get("origin"):
        errs.append(f"{eid}: storytelling.origin 이 비어 있다")
    if "anecdote" not in st:
        errs.append(f"{eid}: storytelling.anecdote 키가 없다 (없으면 null)")
    return errs


def main(argv: list[str]) -> int:
    if not argv:
        print("사용법: insert_entries.py <파일.json> [...]")
        return 1

    labels = {c["id"]: c["label"] for c in json.loads(CATEGORIES.read_text(encoding="utf-8"))}
    files = {f: json.loads(f.read_text(encoding="utf-8")) for f in sorted(DATA.glob("*.json"))}
    by_id = {a["id"]: a for arr in files.values() for a in arr}

    incoming: dict[str, dict] = {}
    for p in argv:
        f = Path(p) if Path(p).is_absolute() else Path(__file__).parent / p
        for k, v in json.loads(f.read_text(encoding="utf-8")).items():
            if k.startswith("_"):
                continue
            if k in incoming:
                print(f"입력 파일 안에서 중복된 id: {k}")
                return 1
            incoming[k] = v

    errs = [m for eid, e in incoming.items() for m in validate(eid, e, labels, by_id)]
    if errs:
        print(f"검증 실패 {len(errs)}건 — 아무것도 쓰지 않았다:")
        for m in errs:
            print("  -", m)
        return 1

    touched: set[Path] = set()
    for eid, e in incoming.items():
        record = {"id": eid, **{k: e[k] for k in REQUIRED}}
        m = month_of(record, {**by_id, eid: record})
        target = DATA / f"{m:02d}.json"
        arr = files[target]
        pos = len(arr)
        occ = occurrence(record, {**by_id, eid: record})
        for i, a in enumerate(arr):
            try:
                if occurrence(a, by_id) > occ:
                    pos = i
                    break
            except Exception:
                continue
        arr.insert(pos, record)
        by_id[eid] = record
        touched.add(target)
        print(f"  + {eid}  →  {target.name} [{pos}]  ({occ:%m-%d} 기준)")

    atomic_write_many({f: dumps(files[f]) for f in sorted(touched)})
    print(f"\n{len(incoming)}건 삽입 · 파일 {len(touched)}개 기록")
    print("이어서 실행: python3 tools/slugs/generate_slugs.py   (routes.json 갱신)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
