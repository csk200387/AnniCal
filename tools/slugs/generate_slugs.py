"""기념일 → 영문 URL 슬러그 매핑 생성기.

URL 구조: /day/{MM-DD}/{slug}   예) /day/03-22/world-water-day
        /day/{MM-DD}           날짜 허브

슬러그 추출 우선순위:
  1) overrides.json 의 수동 매핑 (gov-* 한국 기념일 등)
  2) id 필드에 박힌 영문 슬러그 — `anv-fixed-03-22-world-water-day-global`
  3) name 괄호 안 영문       — `세계 백업의 날 (World Backup Day)`
  4) sourceUrl 마지막 경로   — `.../national-buffet-day-january-2/`

출력: src/data/routes.json  ({ id: { slug, urlDate } })
     urlDate 는 URL 에 박히는 고정 MM-DD.
     annual-fixed 는 date 그대로, 비고정(N번째 요일/기준일 상대)은
     REFERENCE_YEAR 기준 발생일로 고정해 URL 이 매년 흔들리지 않게 한다.
실행: python3 tools/slugs/generate_slugs.py [--check]
      --check 는 파일을 쓰지 않고 검증만 (CI/빌드 전 확인용)
"""

from __future__ import annotations

import calendar
import json
import re
import sys
from datetime import date, timedelta
from collections import defaultdict
from pathlib import Path
from urllib.parse import unquote, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_text  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "src" / "data" / "anniversaries"
OVERRIDES = Path(__file__).parent / "overrides.json"
OBSERVANCES = ROOT / "src" / "data" / "observances.json"
OUT = ROOT / "src" / "data" / "routes.json"

# URL 의 MM-DD 를 고정하는 기준 연도. 바꾸면 비고정 기념일 URL 이 전부 바뀌므로 건드리지 말 것.
REFERENCE_YEAR = 2026

MONTHS = ("january|february|march|april|may|june|july|august|september|"
          "october|november|december")
# id 접두사: anv-fixed-03-22- / anv-nth-11-4-thu- / anv-rel-... / anv-2026-05-24-
# annual-tabulated 는 날짜가 아니라 표의 키를 쓰므로 anv-term- / anv-lunar- 형태다.
ID_PREFIX = re.compile(
    r"^anv-(?:fixed|nth|rel|floating|onetime)?-?"
    r"(?:\d{4}-)?\d{1,2}-(?:\d{1,2}|l)-(?:sun|mon|tue|wed|thu|fri|sat)-|"
    r"^anv-(?:fixed|rel|floating|onetime)?-?(?:\d{4}-)?\d{2}-\d{2}-|"
    r"^anv-(?:term|lunar)-"
)
# 뒤에 붙는 국가/범위 코드
ID_SUFFIX = re.compile(r"-(?:global|intl|world|kr|us|uk|jp|cn|fr|de|it|es|ru|in|ca|au)$")


# 최종 슬러그가 반드시 만족해야 하는 형태. override 로 손으로 넣은 값도 예외가 아니다.
# 이 값은 파일 경로(dist/day/MM-DD/<slug>/index.html)와 HTML 속성에 그대로 들어가므로,
# 여기서 막지 않으면 '../..' 로 outDir 을 벗어나거나 따옴표로 속성을 깨뜨릴 수 있다.
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SLUG_MAX_LEN = 80


def slugify(s: str) -> str:
    s = s.lower().strip()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-{2,}", "-", s).strip("-")


def is_valid_slug(s: str) -> bool:
    return bool(s) and len(s) <= SLUG_MAX_LEN and SLUG_RE.fullmatch(s) is not None


def is_valid_url_date(s: str) -> bool:
    """URL 날짜가 달력에 실제로 있는 MM-DD 인지. 2월 29일은 유효."""
    if not re.fullmatch(r"\d{2}-\d{2}", s or ""):
        return False
    try:
        date(2024, int(s[:2]), int(s[3:]))  # 2024 = 윤년
        return True
    except ValueError:
        return False


def from_id(a: dict) -> str | None:
    raw = a["id"].lower()
    stripped = ID_PREFIX.sub("", raw, count=1)
    if stripped == raw:          # 접두사 패턴이 안 맞으면 포기
        return None
    stripped = ID_SUFFIX.sub("", stripped)
    s = slugify(stripped)
    return s if len(re.sub(r"[^a-z]", "", s)) >= 3 else None


def from_paren(a: dict) -> str | None:
    m = re.search(r"\(([^)]*[A-Za-z]{3}[^)]*)\)", a["name"])
    if not m:
        return None
    s = slugify(re.sub(r"^national-", "", slugify(m.group(1))))
    return s or None


def from_source_url(a: dict) -> str | None:
    u = a.get("sourceUrl")
    if not u:
        return None
    path = unquote(urlparse(u).path).strip("/")
    if not path:
        return None
    seg = re.sub(r"\.(html?|php|aspx)$", "", path.split("/")[-1])
    if len(re.sub(r"[^A-Za-z]", "", seg)) < 5:
        return None
    seg = re.sub(rf"-(?:{MONTHS})-\d+$", "", seg.lower())   # 날짜 꼬리 제거
    seg = re.sub(r"^national-", "", seg)                    # 미국 기준 접두사 제거
    return slugify(seg) or None


DOW = {"SUN": 6, "MON": 0, "TUE": 1, "WED": 2, "THU": 3, "FRI": 4, "SAT": 5}


def _nth_weekday(year: int, spec: str) -> date:
    """"MM-N-DOW" → 해당 연도의 실제 날짜. N 은 1~5 또는 L(마지막)."""
    mm, n, dow = spec.split("-")
    month, target = int(mm), DOW[dow.upper()]
    if n.upper() == "L":
        last = date(year, month, calendar.monthrange(year, month)[1])
        return last - timedelta(days=(last.weekday() - target) % 7)
    first = date(year, month, 1)
    first_occ = 1 + (target - first.weekday()) % 7
    return date(year, month, first_occ + (int(n) - 1) * 7)


def resolve_url_date(a: dict, by_id: dict[str, dict], depth: int = 0) -> str:
    """URL 에 쓸 고정 MM-DD 를 계산."""
    if depth > 5:
        raise ValueError(f"anchor 순환 참조: {a['id']}")
    dt, raw = a["dateType"], a["date"]
    if dt == "annual-fixed":
        return raw
    if dt == "annual-nth-weekday":
        return _nth_weekday(REFERENCE_YEAR, raw).strftime("%m-%d")
    if dt == "annual-tabulated":
        # 설날·추석·24절기 — 날짜를 계산하지 않고 표에서 찾는다.
        table = json.loads(OBSERVANCES.read_text(encoding="utf-8"))
        row = table.get(raw)
        if row is None:
            raise ValueError(f"{a['id']}: observances.json 에 없는 키 {raw!r}")
        md = row.get(str(REFERENCE_YEAR))
        if md is None:
            raise ValueError(f"{a['id']}: {raw!r} 에 {REFERENCE_YEAR}년 값이 없습니다")
        return md
    if dt == "annual-relative-to-holiday":
        anchor_id, _, offset = raw.rpartition(":")
        anchor = by_id.get(anchor_id)
        if anchor is None:
            raise ValueError(f"{a['id']}: 알 수 없는 anchor {anchor_id!r}")
        base = resolve_url_date(anchor, by_id, depth + 1)
        mm, dd = map(int, base.split("-"))
        return (date(REFERENCE_YEAR, mm, dd) + timedelta(days=int(offset))).strftime("%m-%d")
    # annual-floating / one-time — 저장된 YYYY-MM-DD
    return raw[-5:]


def load_anniversaries() -> list[dict]:
    out: list[dict] = []
    for f in sorted(DATA_DIR.glob("*.json")):
        out.extend(json.loads(f.read_text(encoding="utf-8")))
    return out


def main() -> int:
    check_only = "--check" in sys.argv
    anns = load_anniversaries()
    overrides = {k: v for k, v in
                 json.loads(OVERRIDES.read_text(encoding="utf-8")).items()
                 if not k.startswith("_")}

    slugs: dict[str, str] = {}
    unresolved: list[dict] = []
    source_count: defaultdict[str, int] = defaultdict(int)

    for a in anns:
        for label, fn in (("override", lambda x: overrides.get(x["id"])),
                          ("id", from_id),
                          ("paren", from_paren),
                          ("sourceUrl", from_source_url)):
            s = fn(a)
            if s:
                slugs[a["id"]] = s
                source_count[label] += 1
                break
        else:
            unresolved.append(a)

    # 검증 1: id 중복
    dup_ids = [a["id"] for a in anns if sum(1 for x in anns if x["id"] == a["id"]) > 1]
    # URL 날짜 확정 (비고정은 REFERENCE_YEAR 기준으로 고정)
    by_id = {a["id"]: a for a in anns}
    url_dates: dict[str, str] = {}
    for a in anns:
        try:
            url_dates[a["id"]] = resolve_url_date(a, by_id)
        except ValueError as e:
            print(f"    ! 날짜 해석 실패: {e}")

    # 검증 2: (urlDate, slug) 충돌 — URL 이 겹치는지
    url_key: defaultdict[tuple[str, str], list[str]] = defaultdict(list)
    for a in anns:
        if a["id"] in slugs and a["id"] in url_dates:
            url_key[(url_dates[a["id"]], slugs[a["id"]])].append(a["name"])
    collisions = {k: v for k, v in url_key.items() if len(v) > 1}

    # 검증 3: 최종 슬러그·URL 날짜 형태. override 를 포함한 "나가는 값"을 본다.
    bad_slugs = [(i, s) for i, s in sorted(slugs.items()) if not is_valid_slug(s)]
    bad_dates = [(i, d) for i, d in sorted(url_dates.items()) if not is_valid_url_date(d)]

    print(f"기념일 {len(anns)}건 → 슬러그 {len(slugs)}건")
    for k in ("override", "id", "paren", "sourceUrl"):
        print(f"  {k:>10}: {source_count[k]}")
    print(f"미해결: {len(unresolved)}")
    for a in unresolved:
        print(f"    ! {a['id']}  {a['date']}  {a['name']}")
    print(f"중복 id: {len(set(dup_ids))}  {sorted(set(dup_ids))}")
    print(f"URL 충돌: {len(collisions)}")
    for (d, s), names in collisions.items():
        print(f"    ! /day/{d}/{s}  ←  {' | '.join(names)}")
    print(f"슬러그 형식 위반: {len(bad_slugs)}")
    for i, s in bad_slugs:
        print(f"    ! {i}  →  {s!r}")
    print(f"URL 날짜 오류: {len(bad_dates)}")
    for i, d in bad_dates:
        print(f"    ! {i}  →  {d!r}")

    ok = (not unresolved and not collisions and not dup_ids
          and not bad_slugs and not bad_dates
          and len(url_dates) == len(anns))
    if check_only:
        print("\n검증 " + ("통과" if ok else "실패"))
        return 0 if ok else 1

    # 깨진 값이 routes.json 에 들어가면 빌드가 그걸 그대로 파일 경로와 HTML 로 쓴다.
    # 여기서 멈추는 편이 dist 밖에 파일이 써진 뒤 알아차리는 것보다 낫다.
    if bad_slugs or bad_dates:
        print("\n형식 위반이 있어 routes.json 을 쓰지 않았습니다.")
        return 1

    routes = {
        i: {"slug": slugs[i], "urlDate": url_dates[i]}
        for i in sorted(slugs)
        if i in url_dates
    }
    atomic_write_text(OUT, json.dumps(routes, ensure_ascii=False, indent=2) + "\n")
    print(f"\n기록: {OUT.relative_to(ROOT)}")
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())
