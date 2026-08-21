"""보강 대상 목록 생성기 — "유래를 얼마나 아는가" 기준으로 줄을 세운다.

storytelling 이 얇은 항목을 뽑되, 단순히 짧은 순서가 아니라 **유래 단서가 이미
있는지**로 나눈다. 이 순서가 중요한 이유는 비용과 확실성이 다르기 때문이다.

  A 연도+주체 있음 → 이미 사실이 박혀 있다. 살만 붙이면 되고 틀릴 위험이 낮다.
  B 단서 일부     → 연도나 주체 중 하나만 있다. 나머지를 찾으면 된다.
  C 상투구만      → "~를 기념하는 날"이 전부다. 유래를 처음부터 조사해야 한다.
  D 설명만        → 대상 설명은 있으나 날짜의 유래가 없다.

C·D 는 조사해도 "그 날"의 유래가 안 나오는 경우가 많다(미국 이색 기념일 상당수는
nationaldaycalendar 등록이 유일한 출처다). 그럴 때는 날짜의 유래 대신 대상의
기원·한국 맥락으로 채운다 — 없는 유래를 지어내지 않는다.

    python3 tools/enrich/worklist.py            # 요약만
    python3 tools/enrich/worklist.py --write    # tools/enrich/WORKLIST.md 갱신
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/anniversaries"
OUT = Path(__file__).parent / "WORKLIST.md"

# CLAUDE.md 의 목표 분량. 이 아래는 보강 대상이다.
TARGET_MIN = 200
THIN = 100

YEAR = re.compile(r"\d{3,4}\s*년|\d{1,2}세기")
ACTOR = re.compile(r"제정|창설|설립|발표|제안|지정|채택|공포|만든|개발|고안|발명|처음")
CLICHE = re.compile(r"기념하는 날|기리는 날|축하하는 날")

TIERS = {
    "A": "연도+주체 있음 — 확장만",
    "B": "단서 일부 — 나머지 조사",
    "C": "상투구만 — 유래 조사 필요",
    "D": "설명만 — 유래 조사 필요",
}


def load() -> tuple[list[dict], dict[str, str]]:
    items: list[dict] = []
    for f in sorted(DATA.glob("*.json")):
        items.extend(json.loads(f.read_text(encoding="utf-8")))
    cats = {
        c["id"]: c["label"]
        for c in json.loads((ROOT / "src/data/categories.json").read_text(encoding="utf-8"))
    }
    return items, cats


def length(a: dict) -> int:
    s = a.get("storytelling") or {}
    return len((s.get("origin") or "").strip()) + len((s.get("anecdote") or "").strip())


def tier(a: dict) -> str:
    o = (a.get("storytelling") or {}).get("origin", "").strip()
    y, act = bool(YEAR.search(o)), bool(ACTOR.search(o))
    if y and act:
        return "A"
    if y or act:
        return "B"
    return "C" if CLICHE.search(o) else "D"


def source_group(a: dict) -> str:
    u = a.get("sourceUrl") or ""
    host = urlparse(u).netloc if u.startswith("http") else ""
    if a["id"].startswith("gov-"):
        return "gov-* 한국 법정·정부"
    if host == "nationaldaycalendar.com":
        return "미국 nationaldaycalendar"
    if "wikipedia" in host:
        return "위키백과"
    if host == "zatsuneta.com":
        return "일본 zatsuneta"
    return "기타 공식 출처" if host else "출처 없음/비URL"


def main() -> int:
    items, cats = load()
    thin = [a for a in items if length(a) < THIN]
    mid = [a for a in items if THIN <= length(a) < TARGET_MIN]

    lines: list[str] = []
    w = lines.append
    w("# 보강 작업 목록")
    w("")
    w(f"`python3 tools/enrich/worklist.py --write` 로 생성. 전체 {len(items):,}건 기준.")
    w("")
    w("## 현황")
    w("")
    w("| 구간 | 건수 | 비율 |")
    w("|---|---:|---:|")
    for name, lo, hi in [("~100자", 0, 100), ("100~200자", 100, 200), ("200자~ (목표 달성)", 200, 10**9)]:
        n = sum(1 for a in items if lo <= length(a) < hi)
        w(f"| {name} | {n:,} | {n / len(items) * 100:.1f}% |")
    w("")
    w("### 출처 그룹별")
    w("")
    w("| 그룹 | 전체 | ~100자 | 평균 |")
    w("|---|---:|---:|---:|")
    g: dict[str, list[dict]] = defaultdict(list)
    for a in items:
        g[source_group(a)].append(a)
    for k in sorted(g, key=lambda k: -sum(1 for a in g[k] if length(a) < THIN)):
        arr = g[k]
        s = sum(1 for a in arr if length(a) < THIN)
        w(f"| {k} | {len(arr)} | {s} | {sum(length(a) for a in arr) // len(arr)}자 |")
    w("")

    w("## 유래 단서 상태 (~100자 " + str(len(thin)) + "건)")
    w("")
    w("| 등급 | 뜻 | 건수 |")
    w("|---|---|---:|")
    c = Counter(tier(a) for a in thin)
    for t in "ABCD":
        w(f"| {t} | {TIERS[t]} | {c.get(t, 0)} |")
    w("")
    w("> C·D 는 조사해도 **그 날짜의 유래가 없을 수 있다.** 미국 이색 기념일 상당수는")
    w("> nationaldaycalendar 등록이 유일한 출처다. 그럴 때는 날짜의 유래를 지어내지 말고")
    w("> 대상 자체의 기원(언제 어디서 만들어졌는지)과 한국 맥락으로 채운다.")
    w("")

    for t in "ABCD":
        group = sorted(
            (a for a in thin if tier(a) == t),
            key=lambda a: (a["category"], length(a)),
        )
        if not group:
            continue
        w(f"## {t}. {TIERS[t]} — {len(group)}건")
        w("")
        by_cat: dict[str, list[dict]] = defaultdict(list)
        for a in group:
            by_cat[a["category"]].append(a)
        for cat in sorted(by_cat, key=lambda k: -len(by_cat[k])):
            arr = by_cat[cat]
            w(f"### {cats.get(cat, cat)} ({len(arr)}건)")
            w("")
            w("| 날짜 | 이름 | 자수 | 현재 origin | id |")
            w("|---|---|---:|---|---|")
            for a in arr:
                o = (a["storytelling"]["origin"] or "").strip().replace("|", "\\|")
                w(f"| {a['date']} | {a['name']} | {length(a)} | {o} | `{a['id']}` |")
            w("")

    w(f"## 100~200자 {len(mid)}건")
    w("")
    w("목표(200~300자)에 못 미치지만 얇지는 않다. ~100자를 끝낸 뒤에 본다.")
    w("")
    cm = Counter(a["category"] for a in mid)
    w("| 카테고리 | 건수 |")
    w("|---|---:|")
    for k, v in cm.most_common():
        w(f"| {cats.get(k, k)} | {v} |")
    w("")

    text = "\n".join(lines) + "\n"
    if "--write" in sys.argv:
        atomic_write_text(OUT, text)
        print(f"기록: {OUT.relative_to(ROOT)}  ({len(text):,}자)")
    else:
        print(f"~100자 {len(thin)}건 · 100~200자 {len(mid)}건")
        for t in "ABCD":
            print(f"  {t}: {c.get(t, 0):>4}건  {TIERS[t]}")
        print("\n--write 로 WORKLIST.md 생성")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
