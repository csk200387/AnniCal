"""기념일 데이터 IO — 월별 분할 파일(src/data/anniversaries/01..12.json) 읽기/쓰기.

- 런타임(프론트엔드)과 동일하게, 편집 도구는 항상 "전체 병합 리스트"를 다룬다.
- 저장 시 dateType 기준으로 월 버킷(1~12)에 분배해 12개 파일로 기록한다.
- annual-relative-to-holiday 는 anchor 가 속한 월을 따라간다(재귀) — 추수감사절류가
  한 파일(11월)에 함께 묶이도록.
- annual-tabulated(음력 명절·24절기)는 observances.json 의 기준연도 발생일을 따른다.

app.py(Gradio UI)와 split_data.py(1회 마이그레이션)가 공유하는 단일 진실 원천(SSOT).

## 월 분류 실패는 폴백하지 않는다

이전 구현은 분류할 수 없는 항목을 조용히 1월로 보냈다. 그 결과 DATE_TYPES 에
없던 annual-tabulated 37건(설날·추석·24절기)이 저장 한 번에 전부 01.json 으로
쓸려 갔다 — 앱의 날짜 계산은 표를 보므로 화면은 멀쩡해서 한참 뒤에야 드러난다.
지금은 분류할 수 없으면 예외를 던져 저장 자체를 막는다.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_many, dumps, file_lock  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "src" / "data" / "anniversaries"
CATEGORIES_PATH = ROOT / "src" / "data" / "categories.json"
OBSERVANCES_PATH = ROOT / "src" / "data" / "observances.json"

MONTHS = [f"{m:02d}" for m in range(1, 13)]

# annual-tabulated 의 월을 정할 때 보는 연도. tools/slugs/generate_slugs.py 및
# tools/observances/add_entries.py 의 REFERENCE_YEAR 과 반드시 같아야 한다.
REFERENCE_YEAR = "2026"


class DataIntegrityError(Exception):
    """저장하면 데이터셋이 깨지는 상태 — 쓰기 전에 막는다."""


def _month_file(month: int) -> Path:
    return DATA_DIR / f"{month:02d}.json"


def load_observances() -> dict[str, dict[str, str]]:
    return json.loads(OBSERVANCES_PATH.read_text(encoding="utf-8"))


def month_of(
    entry: dict[str, Any],
    by_id: dict[str, dict[str, Any]],
    observances: dict[str, dict[str, str]] | None = None,
    _path: tuple[str, ...] = (),
) -> int:
    """기념일이 속할 월(1~12)을 dateType 기준으로 결정.

    분류할 수 없으면 DataIntegrityError 를 던진다 — 조용한 1월 폴백은 없다.
    """
    if observances is None:
        observances = load_observances()

    dt = entry.get("dateType")
    d = entry.get("date", "") or ""
    aid = entry.get("id") or "(no-id)"

    if dt in ("annual-fixed", "annual-nth-weekday"):
        m = re.match(r"(\d{2})", d)
        if not m:
            raise DataIntegrityError(f"{aid}: {dt} 의 date '{d}' 에서 월을 읽을 수 없습니다.")
        month = int(m.group(1))
    elif dt in ("annual-floating", "one-time"):
        m = re.match(r"\d{4}-(\d{2})", d)
        if not m:
            raise DataIntegrityError(f"{aid}: {dt} 의 date '{d}' 에서 월을 읽을 수 없습니다.")
        month = int(m.group(1))
    elif dt == "annual-tabulated":
        row = observances.get(d)
        if row is None:
            raise DataIntegrityError(
                f"{aid}: annual-tabulated 키 '{d}' 가 observances.json 에 없습니다."
            )
        md = row.get(REFERENCE_YEAR)
        if not md:
            raise DataIntegrityError(
                f"{aid}: observances.json 의 '{d}' 에 {REFERENCE_YEAR}년 값이 없습니다."
            )
        month = int(md[:2])
    elif dt == "annual-relative-to-holiday":
        anchor_id = d.rsplit(":", 1)[0]
        path = (*_path, aid)
        if anchor_id in path:
            loop = path[path.index(anchor_id):]
            raise DataIntegrityError(
                f"{aid}: anchor 참조가 순환합니다 ({' → '.join([*loop, anchor_id])})."
            )
        anchor = by_id.get(anchor_id)
        if anchor is None:
            raise DataIntegrityError(f"{aid}: anchor id '{anchor_id}' 가 데이터셋에 없습니다.")
        return month_of(anchor, by_id, observances, path)
    else:
        raise DataIntegrityError(f"{aid}: 알 수 없는 dateType '{dt}' — 저장할 수 없습니다.")

    if not 1 <= month <= 12:
        raise DataIntegrityError(f"{aid}: date '{d}' 의 월 {month} 이 1~12 범위를 벗어납니다.")
    return month


def _sort_key(a: dict[str, Any]) -> tuple[str, str]:
    """월 파일 내부 정렬 — annual-fixed(MM-DD)를 0000-MM-DD 로 정규화해 날짜순."""
    d = a.get("date", "") or ""
    if a.get("dateType") == "annual-fixed":
        return ("0000-" + d, a.get("name", "") or "")
    return (d, a.get("name", "") or "")


def load_anniversaries() -> list[dict[str, Any]]:
    """01..12.json 을 순서대로 읽어 하나의 리스트로 병합."""
    items: list[dict[str, Any]] = []
    for mm in MONTHS:
        p = DATA_DIR / f"{mm}.json"
        if p.exists():
            items.extend(json.loads(p.read_text(encoding="utf-8")))
    return items


def bucket_by_month(items: list[dict[str, Any]]) -> dict[int, list[dict[str, Any]]]:
    """전체 리스트를 월 버킷으로 분배. 분류 불가 항목이 있으면 예외."""
    by_id = {a.get("id"): a for a in items}
    observances = load_observances()
    buckets: dict[int, list[dict[str, Any]]] = {m: [] for m in range(1, 13)}
    for a in items:
        buckets[month_of(a, by_id, observances)].append(a)
    return buckets


def check_dataset(items: list[dict[str, Any]]) -> None:
    """쓰기 직전 불변조건 검사. 하나라도 어긋나면 DataIntegrityError."""
    ids = [a.get("id") for a in items]
    if any(not i for i in ids):
        raise DataIntegrityError("id 가 비어 있는 항목이 있습니다.")

    counts = Counter(ids)
    dups = sorted(i for i, n in counts.items() if n > 1)
    if dups:
        raise DataIntegrityError(f"중복 id {len(dups)}건: {dups[:5]}")

    # anchor 외래키 + 순환 검사는 월 분류가 겸한다(재귀하며 둘 다 확인).
    bucket_by_month(items)


def save_anniversaries(
    items: list[dict[str, Any]],
    expected_ids: set[str] | None = None,
) -> None:
    """전체 리스트를 월 버킷으로 분배해 12개 파일에 원자적으로 기록.

    `expected_ids` 를 주면 디스크의 현재 상태와 대조해, 이 프로세스가 들고 있는
    스냅샷이 낡았을 때(다른 탭·다른 프로세스가 그새 바꿨을 때) 저장을 거부한다.
    """
    check_dataset(items)

    with file_lock(DATA_DIR):
        if expected_ids is not None:
            on_disk = {a.get("id") for a in load_anniversaries()}
            if on_disk != expected_ids:
                added = sorted(on_disk - expected_ids)
                removed = sorted(expected_ids - on_disk)
                raise DataIntegrityError(
                    "다른 곳에서 데이터가 바뀌었습니다 — 덮어쓰면 그 변경이 사라집니다. "
                    f"디스크에만 있음 {len(added)}건 {added[:3]}, "
                    f"디스크에서 사라짐 {len(removed)}건 {removed[:3]}. "
                    "재로드 후 다시 시도하세요."
                )

        buckets = bucket_by_month(items)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        updates = {
            _month_file(m): dumps(sorted(buckets[m], key=_sort_key))
            for m in range(1, 13)
        }
        atomic_write_many(updates)


def load_categories() -> list[dict[str, Any]]:
    return json.loads(CATEGORIES_PATH.read_text(encoding="utf-8"))
