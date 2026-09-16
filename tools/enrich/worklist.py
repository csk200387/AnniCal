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

## 기준을 "합계 200자"에서 "필드별 150자"로 바꾼 이유

예전에는 origin+anecdote 합계만 봤는데, 그러면 origin 한 줄(50자) + anecdote
장문(200자)으로도 목표를 채운 것처럼 보인다. 실제로 그렇게 채워진 항목이
대부분이었다 — 합계 기준 68.5%가 200자를 넘겼지만, 필드별로 다시 보면 둘 다
150자를 넘긴 항목이 0건이다.

150자를 기준선으로 삼은 건 임의가 아니다 — `src/seo/meta.ts` 의
`anniversaryDescription()` 이 origin 앞 150자를 그대로 잘라
`<meta name="description">` 에 넣는다. origin 이 150자가 안 되면 검색결과
스니펫이 문장 중간에서 잘리거나 다른 항목보다 짧게 나온다. anecdote 도 같은
기준을 적용해 "유래 한 줄 + 이야깃거리 한 줄"로 총량만 채우는 걸 막는다.

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

# 필드 하나당 목표. origin 은 검색결과 스니펫 길이(anniversaryDescription)와
# 같은 값을 쓴다 — 이보다 짧으면 스니펫이 그 안에서 끊긴다.
FIELD_TARGET = 150

YEAR = re.compile(r"\d{3,4}\s*년|\d{1,2}세기")
ACTOR = re.compile(r"제정|창설|설립|발표|제안|지정|채택|공포|만든|개발|고안|발명|처음")
CLICHE = re.compile(r"기념하는 날|기리는 날|축하하는 날")

TIERS = {
    "A": "연도+주체 있음 — 확장만",
    "B": "단서 일부 — 나머지 조사",
    "C": "상투구만 — 유래 조사 필요",
    "D": "설명만 — 유래 조사 필요",
}

STATUS_LABEL = {
    "both": "둘 다 미달",
    "origin": "origin만 미달",
    "anecdote": "anecdote만 미달",
    "done": "목표 달성",
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


def olen(a: dict) -> int:
    return len(((a.get("storytelling") or {}).get("origin") or "").strip())


def alen(a: dict) -> int:
    return len(((a.get("storytelling") or {}).get("anecdote") or "").strip())


def status(a: dict) -> str:
    o_ok, a_ok = olen(a) >= FIELD_TARGET, alen(a) >= FIELD_TARGET
    if o_ok and a_ok:
        return "done"
    if o_ok:
        return "anecdote"
    if a_ok:
        return "origin"
    return "both"


def tier(a: dict) -> str:
    """origin 이 날짜의 유래를 얼마나 문서화하고 있는지. anecdote 부족 여부와는 별개 축이다."""
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
    n = len(items)
    by_status: dict[str, list[dict]] = defaultdict(list)
    for a in items:
        by_status[status(a)].append(a)

    lines: list[str] = []
    w = lines.append
    w("# 보강 작업 목록")
    w("")
    w(f"`python3 tools/enrich/worklist.py --write` 로 생성. 전체 {n:,}건 기준.")
    w("")
    w(f"기준: **origin·anecdote 각각 {FIELD_TARGET}자 이상.** 합계가 아니라 필드별이다 —")
    w("origin 앞 150자가 그대로 검색결과 설명으로 나가므로(seo/meta.ts), 한쪽만 길고")
    w("한쪽은 한 줄인 항목은 검색 노출도 부실하고 페이지도 부실하다.")
    w("")
    w("## 현황")
    w("")
    w("| 상태 | 건수 | 비율 |")
    w("|---|---:|---:|")
    for key in ("done", "origin", "anecdote", "both"):
        arr = by_status[key]
        w(f"| {STATUS_LABEL[key]} | {len(arr):,} | {len(arr) / n * 100:.1f}% |")
    w("")
    w("| | p10 | p25 | p50(중앙값) | p75 | p90 | 평균 |")
    w("|---|---:|---:|---:|---:|---:|---:|")
    for label, fn in [("origin 길이", olen), ("anecdote 길이", alen)]:
        vals = sorted(fn(a) for a in items)

        def pct(p: int) -> int:
            return vals[min(int(len(vals) * p / 100), len(vals) - 1)]

        avg = sum(vals) / len(vals)
        w(f"| {label} | {pct(10)} | {pct(25)} | {pct(50)} | {pct(75)} | {pct(90)} | {avg:.0f} |")
    w("")

    w("### 출처 그룹별 (미달 건수 = origin 또는 anecdote 가 150자 미만)")
    w("")
    w("| 그룹 | 전체 | 미달 | origin 평균 | anecdote 평균 |")
    w("|---|---:|---:|---:|---:|")
    g: dict[str, list[dict]] = defaultdict(list)
    for a in items:
        g[source_group(a)].append(a)
    for k in sorted(g, key=lambda k: -sum(1 for a in g[k] if status(a) != "done")):
        arr = g[k]
        miss = sum(1 for a in arr if status(a) != "done")
        w(
            f"| {k} | {len(arr)} | {miss} "
            f"| {sum(olen(a) for a in arr) // len(arr)}자 | {sum(alen(a) for a in arr) // len(arr)}자 |"
        )
    w("")

    incomplete = [a for a in items if status(a) != "done"]
    w("## origin 유래 단서 상태 (미달 " + f"{len(incomplete):,}건 기준)")
    w("")
    w("| 등급 | 뜻 | 건수 |")
    w("|---|---|---:|")
    c = Counter(tier(a) for a in incomplete)
    for t in "ABCD":
        w(f"| {t} | {TIERS[t]} | {c.get(t, 0)} |")
    w("")
    w("> C·D 는 조사해도 **그 날짜의 유래가 없을 수 있다.** 미국 이색 기념일 상당수는")
    w("> nationaldaycalendar 등록이 유일한 출처다. 그럴 때는 날짜의 유래를 지어내지 말고")
    w("> 대상 자체의 기원(언제 어디서 만들어졌는지)과 한국 맥락으로 채운다.")
    w("")

    # "both" 는 origin 등급(A~D)으로, "origin만"/"anecdote만"은 별도 절로 나눈다 —
    # 이미 한쪽이 목표를 채웠으므로 유래 조사 난이도보다 "나머지 한쪽만 늘리면 되는" 쉬운 작업이다.
    both = by_status["both"]
    for t in "ABCD":
        group = sorted(
            (a for a in both if tier(a) == t),
            key=lambda a: (a["category"], olen(a) + alen(a)),
        )
        if not group:
            continue
        w(f"## 둘 다 미달 · {t}. {TIERS[t]} — {len(group)}건")
        w("")
        by_cat: dict[str, list[dict]] = defaultdict(list)
        for a in group:
            by_cat[a["category"]].append(a)
        for cat in sorted(by_cat, key=lambda k: -len(by_cat[k])):
            arr = by_cat[cat]
            w(f"### {cats.get(cat, cat)} ({len(arr)}건)")
            w("")
            w("| 날짜 | 이름 | origin | anecdote | 현재 origin | 현재 anecdote | id |")
            w("|---|---|---:|---:|---|---|---|")
            for a in arr:
                o = (a["storytelling"]["origin"] or "").strip().replace("|", "\\|")
                an = (a["storytelling"]["anecdote"] or "").strip().replace("|", "\\|")
                w(f"| {a['date']} | {a['name']} | {olen(a)} | {alen(a)} | {o} | {an} | `{a['id']}` |")
            w("")

    for key, title in [("origin", "origin만 미달 — anecdote 는 이미 충분"), ("anecdote", "anecdote만 미달 — origin 은 이미 충분")]:
        group = sorted(by_status[key], key=lambda a: (a["category"], olen(a) + alen(a)))
        w(f"## {title} ({len(group)}건)")
        w("")
        if not group:
            w("(없음)")
            w("")
            continue
        w("| 날짜 | 이름 | origin | anecdote | 현재 origin | 현재 anecdote | id |")
        w("|---|---|---:|---:|---|---|---|")
        for a in group:
            o = (a["storytelling"]["origin"] or "").strip().replace("|", "\\|")
            an = (a["storytelling"]["anecdote"] or "").strip().replace("|", "\\|")
            w(f"| {a['date']} | {a['name']} | {olen(a)} | {alen(a)} | {o} | {an} | `{a['id']}` |")
        w("")

    text = "\n".join(lines) + "\n"
    if "--write" in sys.argv:
        atomic_write_text(OUT, text)
        print(f"기록: {OUT.relative_to(ROOT)}  ({len(text):,}자)")
    else:
        print(f"전체 {n:,}건 중 목표 달성(둘 다 {FIELD_TARGET}자+): {len(by_status['done'])}건")
        print(f"  둘 다 미달:      {len(by_status['both']):>5}건")
        print(f"  origin만 미달:   {len(by_status['origin']):>5}건")
        print(f"  anecdote만 미달: {len(by_status['anecdote']):>5}건")
        print()
        for t in "ABCD":
            cnt = sum(1 for a in by_status["both"] if tier(a) == t)
            print(f"  둘 다 미달 중 {t}: {cnt:>4}건  {TIERS[t]}")
        print("\n--write 로 WORKLIST.md 생성")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
