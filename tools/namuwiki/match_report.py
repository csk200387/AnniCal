"""나무위키 신규 기념일 후보 대조 스크립트 (1회성 분석용, 원본 데이터 수정 없음).

사용법: python3 tools/namuwiki/match_report.py
출력: tools/namuwiki/output/match_result.json (중간 산출물), 콘솔에 통계 요약.
이 스크립트 자체가 최종 산출물이 아니다 — 최종 산출물은 NAMUWIKI_NEW_ANNIVERSARIES.md.
"""
from __future__ import annotations

import datetime
import difflib
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

db = []
for m in range(1, 13):
    db.extend(json.load(open(ROOT / f"src/data/anniversaries/{m:02d}.json", encoding="utf-8")))

routes = json.load(open(ROOT / "src/data/routes.json", encoding="utf-8"))
namu = json.load(open(ROOT / "tools/namuwiki/output/namuwiki_calendar.json", encoding="utf-8"))

LUNAR_MAP = {
    "seollal": "01-01",
    "jeongwol-daeboreum": "01-15",
    "dano": "05-05",
    "yudu": "06-15",
    "chilseok": "07-07",
    "baekjung": "07-15",
    "chuseok": "08-15",
    "jungyangjeol": "09-09",
    "buddhas-birthday": "04-08",
}


def shift_date(mmdd: str, delta: int) -> str:
    m, d = map(int, mmdd.split("-"))
    dt = datetime.date(2028, m, d) + datetime.timedelta(days=delta)  # 2028=윤년, 경계 안전
    return f"{dt.month:02d}-{dt.day:02d}"


missing_route = 0
for rec in db:
    route = routes.get(rec["id"])
    url_date = route["urlDate"] if route else None
    if url_date is None:
        missing_route += 1
    match_date = url_date
    tolerant = False
    if rec["dateType"] == "annual-tabulated":
        key = rec["date"]
        if key in LUNAR_MAP:
            match_date = LUNAR_MAP[key]
        else:
            tolerant = True  # 24절기·삼복·한식류: 연도별 ±1일 흔들릴 수 있음
    rec["_match_date"] = match_date
    rec["_tolerant"] = tolerant

buckets: dict[str, list] = defaultdict(list)
for rec in db:
    md = rec["_match_date"]
    if md is None:
        continue
    buckets[md].append(rec)
    if rec["_tolerant"]:
        buckets[shift_date(md, -1)].append(rec)
        buckets[shift_date(md, 1)].append(rec)

PAREN_RE = re.compile(r"[\(（][^)）]*[\)）]")
WS_RE = re.compile(r"\s+")
PUNCT_RE = re.compile(r"[\s\-_·,./~!?'\"‘’“”:;]+")


def norm_loose(s: str) -> str:
    s = unicodedata.normalize("NFC", s)
    s = s.replace("（", "(").replace("）", ")")
    return WS_RE.sub(" ", s).strip()


def norm_tight(s: str) -> str:
    return PUNCT_RE.sub("", norm_loose(s)).lower()


def core_tight(s: str) -> str:
    """괄호 안 한자/영문 표기 등을 뗀 핵심 명칭."""
    s = norm_loose(s)
    s = PAREN_RE.sub("", s)
    return PUNCT_RE.sub("", s).lower()


SYNONYM_GROUPS = [
    {"신정", "새해첫날", "새해", "양력설", "원단"},
    {"성탄절", "크리스마스"},
    {"부활절", "이스터", "부활주일"},
    {"발렌타인데이", "밸런타인데이", "성발렌티노축일"},
    {"만우절", "에이프릴풀스데이", "4월바보의날"},
    {"할로윈", "할로윈데이", "핼러윈", "핼러윈데이"},
    {"노동절", "근로자의날", "메이데이", "세계노동절"},
    {"부처님오신날", "석가탄신일", "석가모니탄신일"},
    {"추석", "한가위"},
    {"설날", "구정", "음력설날"},
    {"삼일절", "3.1절", "31절", "삼일운동기념일", "3.1운동기념일"},
    {"지구의날", "세계지구의날", "어스데이"},
    {"세계여성의날", "국제여성의날"},
]
SYN_LOOKUP: dict[str, int] = {}
for gi, group in enumerate(SYNONYM_GROUPS):
    for name in group:
        SYN_LOOKUP[name] = gi


GENERIC_SUFFIXES = sorted(
    ["의날", "기념일", "데이", "day", "축제일", "축제", "주간", "월간", "국제일"],
    key=len,
    reverse=True,
)


def strip_generic(s: str) -> str:
    for suf in GENERIC_SUFFIXES:
        if s.endswith(suf) and len(s) > len(suf):
            return s[: -len(suf)]
    return s


def score_pair(item_name: str, item_full: str, db_name: str) -> float:
    a_tight, b_tight = norm_tight(item_name), norm_tight(db_name)
    a_core, b_core = core_tight(item_name), core_tight(db_name)
    if a_tight == b_tight or a_core == b_core:
        return 1.0
    if SYN_LOOKUP.get(a_core) is not None and SYN_LOOKUP.get(a_core) == SYN_LOOKUP.get(b_core):
        return 1.0
    if len(a_core) >= 2 and len(b_core) >= 2 and (a_core in b_core or b_core in a_core):
        return 0.85
    # "OO의 날" / "XX의 날" 처럼 공통 접미사만으로 유사도가 부풀려지지 않도록,
    # 핵심 단어(접미사 제거분)끼리 비교한다. 접미사를 떼고 나면 실제 내용어가 남는다.
    a_stem, b_stem = strip_generic(a_core), strip_generic(b_core)
    if len(a_stem) < 2 or len(b_stem) < 2:
        return 0.0
    if a_stem == b_stem:
        return 0.95
    if a_stem in b_stem or b_stem in a_stem:
        return 0.8
    ratio = difflib.SequenceMatcher(None, a_stem, b_stem).ratio()
    # 짧은 핵심어끼리는 우연히도 몇 글자가 겹칠 수 있어 과대평가 위험이 큼 — 둘 다 4자
    # 이상일 때만 순수 ratio 신호를 신뢰한다.
    if min(len(a_stem), len(b_stem)) < 4:
        ratio *= 0.5
    return ratio


DASH_RE = re.compile(r"\s-\s")


def split_name(text: str) -> tuple[str | None, str]:
    m = DASH_RE.search(text)
    if m:
        return text[: m.start()].strip(), text[m.end() :].strip()
    dot = text.find(".")
    if 0 < dot <= 30:
        return text[:dot].strip(), text[dot + 1 :].strip()
    return None, text


rows = []
for date_key, entry in namu.items():
    for sec in entry["sections"]:
        for item_text in sec["items"]:
            name, desc = split_name(item_text)
            rows.append(
                {
                    "date": date_key,
                    "title": entry["title"],
                    "url": entry["url"],
                    "root": sec["root"],
                    "path": sec["path"],
                    "text": item_text,
                    "name": name,
                    "desc": desc,
                }
            )

assert len(rows) == 1346, f"항목 수 불일치: {len(rows)}"

DUP_TH = 0.72
REVIEW_TH = 0.40

dup_count = 0
review_count = 0
new_count = 0
new_rows = []
review_rows = []

for row in rows:
    candidates = buckets.get(row["date"], [])
    probe_name = row["name"] or row["text"][:40]
    best = None
    best_score = 0.0
    for rec in candidates:
        s = score_pair(probe_name, row["text"], rec["name"])
        if s > best_score:
            best_score = s
            best = rec
    row["best_score"] = round(best_score, 3)
    row["best_match"] = (
        {"id": best["id"], "name": best["name"], "date": best["_match_date"]} if best else None
    )
    if best_score >= DUP_TH:
        dup_count += 1
        row["status"] = "dup"
    elif best_score >= REVIEW_TH and best is not None:
        review_count += 1
        row["status"] = "review"
        review_rows.append(row)
    else:
        new_count += 1
        row["status"] = "new"
        new_rows.append(row)

print("routes 누락:", missing_route)
print("전체 항목:", len(rows))
print("중복:", dup_count, "검토:", review_count, "신규:", new_count, "합계:", dup_count + review_count + new_count)

out = {
    "counts": {"total": len(rows), "dup": dup_count, "review": review_count, "new": new_count},
    "rows": rows,
}
out_path = ROOT / "tools/namuwiki/output/match_result.json"
out_path.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print("저장:", out_path)
