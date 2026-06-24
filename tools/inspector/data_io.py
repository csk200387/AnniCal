"""기념일 데이터 IO — 월별 분할 파일(src/data/anniversaries/01..12.json) 읽기/쓰기.

- 런타임(프론트엔드)과 동일하게, 편집 도구는 항상 "전체 병합 리스트"를 다룬다.
- 저장 시 dateType 기준으로 월 버킷(1~12)에 분배해 12개 파일로 기록한다.
- annual-relative-to-holiday 는 anchor 가 속한 월을 따라간다(재귀) — 추수감사절류가
  한 파일(11월)에 함께 묶이도록.

app.py(Gradio UI)와 split_data.py(1회 마이그레이션)가 공유하는 단일 진실 원천(SSOT).
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "src" / "data" / "anniversaries"
CATEGORIES_PATH = ROOT / "src" / "data" / "categories.json"

MONTHS = [f"{m:02d}" for m in range(1, 13)]


def _month_file(month: int) -> Path:
    return DATA_DIR / f"{month:02d}.json"


def month_of(
    entry: dict[str, Any],
    by_id: dict[str, dict[str, Any]],
    _depth: int = 0,
) -> int:
    """기념일이 속할 월(1~12)을 dateType 기준으로 결정. 분류 실패 시 1 로 폴백."""
    dt = entry.get("dateType")
    d = entry.get("date", "") or ""
    if dt in ("annual-fixed", "annual-nth-weekday"):
        m = re.match(r"(\d{2})", d)
        return int(m.group(1)) if m else 1
    if dt in ("annual-floating", "one-time"):
        m = re.match(r"\d{4}-(\d{2})", d)
        return int(m.group(1)) if m else 1
    if dt == "annual-relative-to-holiday":
        if _depth > 10:  # anchor 순환 방지
            return 1
        anchor_id = d.rsplit(":", 1)[0]
        anchor = by_id.get(anchor_id)
        if anchor is None:
            return 1
        return month_of(anchor, by_id, _depth + 1)
    return 1


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


def save_anniversaries(items: list[dict[str, Any]]) -> None:
    """전체 리스트를 월 버킷으로 분배해 12개 파일에 기록(2-space, UTF-8)."""
    by_id = {a.get("id"): a for a in items}
    buckets: dict[int, list[dict[str, Any]]] = {m: [] for m in range(1, 13)}
    for a in items:
        buckets[month_of(a, by_id)].append(a)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    for m in range(1, 13):
        rows = sorted(buckets[m], key=_sort_key)
        _month_file(m).write_text(
            json.dumps(rows, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )


def load_categories() -> list[dict[str, Any]]:
    return json.loads(CATEGORIES_PATH.read_text(encoding="utf-8"))
