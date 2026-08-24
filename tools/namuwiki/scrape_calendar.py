"""나무위키 날짜별 문서(1월 1일 ~ 12월 31일)의 "기념일 및 절기" 절을 긁어 JSON으로 정리한다.

의존성 0, stdlib 만 사용. 나무위키는 커스텀 엔진이라 MediaWiki API가 없고, 문서
HTML에서 직접 절을 찾아야 한다. 각 헤딩은 `<span id='제목' ...>제목</span>` 형태로
렌더링되어 id 속성이 곧 헤딩 텍스트라, 별도 HTML 파서 없이 정규식으로 헤딩 계층을
복원할 수 있다.

    python3 tools/namuwiki/scrape_calendar.py            # 366일 전체 수집
    python3 tools/namuwiki/scrape_calendar.py --dates 01-01,03-01  # 일부만
    python3 tools/namuwiki/scrape_calendar.py --from-cache         # 재수집 없이 캐시만 재파싱

원본 HTML은 tools/namuwiki/cache/{MM-DD}.html 에 캐싱한다 — 366회 네트워크 요청은
비싸므로, 파싱 로직에 버그가 있어도 다시 받지 않고 --from-cache 로 재파싱만 하면 된다.
결과는 tools/namuwiki/output/namuwiki_calendar.json 에 쓴다.
"""
from __future__ import annotations

import argparse
import json
import random
import re
import sys
import time
import urllib.error
import urllib.request
from html import unescape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
CACHE_DIR = ROOT / "cache"
OUTPUT_PATH = ROOT / "output" / "namuwiki_calendar.json"

DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]  # 윤일 포함 366일
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
)

HEADING_RE = re.compile(
    r"<h([2-6])[^>]*><a id='s-([\d.]+)'[^>]*>[\d.]*</a>\s*<span id='([^']+)'"
)
FOOTNOTE_RE = re.compile(r"<a class='oFg0lcE2'.*?</a>", re.S)
# <br>이나 블록 요소 경계는 지우면 글자가 그대로 붙어버린다("크리스마스)일단"처럼) — 공백으로 치환.
BREAK_RE = re.compile(r"</?(?:br|li|ul|div|p|tr|td)(?:\s[^>]*)?/?>", re.I)
TAG_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")
NOTE_RE = re.compile(r"<div class='GyVS7G6C'[^>]*>(.*?)</div>", re.S)
TOP_TAG_RE_CACHE: dict[str, re.Pattern] = {}


def all_dates() -> list[tuple[int, int]]:
    return [(m + 1, d + 1) for m in range(12) for d in range(DAYS_IN_MONTH[m])]


def title_for(month: int, day: int) -> str:
    return f"{month}월 {day}일"


def key_for(month: int, day: int) -> str:
    return f"{month:02d}-{day:02d}"


def fetch(title: str, attempts: int = 3) -> str:
    url = f"https://namu.wiki/w/{quote(title)}"
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "ko-KR,ko;q=0.9",
        },
    )
    last_err: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode("utf-8")
        except (urllib.error.URLError, TimeoutError) as e:
            last_err = e
            if attempt < attempts:
                time.sleep(2 * attempt)
    raise RuntimeError(f"fetch failed for {title!r}: {last_err}")


def top_level_spans(html: str, tag: str, start: int, end: int) -> list[tuple[int, int]]:
    pat = TOP_TAG_RE_CACHE.get(tag)
    if pat is None:
        pat = re.compile(rf"(<{tag}(?:\s[^>]*)?>)|(</{tag}>)")
        TOP_TAG_RE_CACHE[tag] = pat
    depth = 0
    block_start = None
    spans = []
    for m in pat.finditer(html, start, end):
        if m.group(1):
            if depth == 0:
                block_start = m.end()
            depth += 1
        else:
            depth -= 1
            if depth == 0 and block_start is not None:
                spans.append((block_start, m.start()))
                block_start = None
    return spans


def clean_text(fragment: str) -> str:
    fragment = FOOTNOTE_RE.sub("", fragment)
    fragment = BREAK_RE.sub(" ", fragment)
    fragment = TAG_RE.sub("", fragment)
    fragment = unescape(fragment)
    fragment = WS_RE.sub(" ", fragment).strip()
    return fragment


def find_calendar_section(html: str) -> tuple[int, int] | None:
    headings = [
        (m.start(), int(m.group(1)), m.group(3))
        for m in HEADING_RE.finditer(html)
    ]
    top = [i for i, (_, lvl, title) in enumerate(headings) if lvl == 2]
    match_top = [
        i for i in top if ("기념일" in headings[i][2] or "절기" in headings[i][2])
    ]
    if not match_top:
        return None
    start_i = match_top[0]
    # 인접한 상위(레벨2) 절이 계속 기념일/절기 계열이면 묶는다 (예: 기념일/절기가 별도 절인 경우)
    end_i = start_i
    top_pos = {i: pos for pos, i in enumerate(top)}
    while True:
        pos = top_pos[end_i]
        if pos + 1 < len(top) and top[pos + 1] in match_top:
            end_i = top[pos + 1]
        else:
            break
    section_start = headings[start_i][0]
    # 섹션 뒤 첫 레벨2 헤딩(그룹에 안 속한 것) 위치가 끝
    pos = top_pos[end_i]
    section_end = headings[top[pos + 1]][0] if pos + 1 < len(top) else len(html)
    return section_start, section_end


def parse_calendar_section(html: str) -> list[dict]:
    bounds = find_calendar_section(html)
    if bounds is None:
        return []
    section_start, section_end = bounds
    headings = [
        (m.start(), m.end(), int(m.group(1)), m.group(3))
        for m in HEADING_RE.finditer(html, section_start, section_end)
    ]
    sections: list[dict] = []
    root = None
    path_stack: list[tuple[int, str]] = []
    for idx, (h_start, h_end, level, title) in enumerate(headings):
        if level == 2:
            root = title
            path_stack = []
        else:
            while path_stack and path_stack[-1][0] >= level:
                path_stack.pop()
            path_stack.append((level, title))
        content_start = h_end
        content_end = headings[idx + 1][0] if idx + 1 < len(headings) else section_end
        li_spans = top_level_spans(html, "li", content_start, content_end)
        items = [clean_text(html[s:e]) for s, e in li_spans]
        items = [it for it in items if it]
        note = None
        if not items:
            m = NOTE_RE.search(html, content_start, content_end)
            if m:
                note = clean_text(m.group(1))
        if not items and not note:
            continue
        entry = {"root": root, "path": [t for _, t in path_stack], "items": items}
        if note:
            entry["note"] = note
        sections.append(entry)
    return sections


def load_or_fetch(month: int, day: int, use_cache_only: bool) -> str | None:
    key = key_for(month, day)
    cache_path = CACHE_DIR / f"{key}.html"
    if cache_path.exists():
        return cache_path.read_text(encoding="utf-8")
    if use_cache_only:
        return None
    title = title_for(month, day)
    html = fetch(title)
    cache_path.write_text(html, encoding="utf-8")
    return html


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dates", help="쉼표로 구분한 MM-DD 목록 (생략 시 366일 전체)")
    ap.add_argument("--from-cache", action="store_true", help="네트워크 요청 없이 캐시만 재파싱")
    ap.add_argument("--min-delay", type=float, default=1.2)
    ap.add_argument("--max-delay", type=float, default=2.4)
    args = ap.parse_args()

    targets = all_dates()
    if args.dates:
        wanted = set(args.dates.split(","))
        targets = [(m, d) for (m, d) in targets if key_for(m, d) in wanted]

    result: dict[str, dict] = {}
    failures: list[str] = []
    empties: list[str] = []

    for i, (month, day) in enumerate(targets):
        key = key_for(month, day)
        title = title_for(month, day)
        try:
            html = load_or_fetch(month, day, args.from_cache)
            if html is None:
                failures.append(key + " (캐시 없음)")
                continue
        except RuntimeError as e:
            print(f"[FAIL] {key} {title}: {e}", file=sys.stderr)
            failures.append(key)
            continue

        sections = parse_calendar_section(html)
        if not sections:
            empties.append(key)
        result[key] = {
            "title": title,
            "url": f"https://namu.wiki/w/{quote(title)}",
            "sections": sections,
        }
        print(f"[{i + 1}/{len(targets)}] {key} {title} -> {len(sections)}개 하위 절")

        if not args.from_cache and not (CACHE_DIR / f"{key}.html").exists():
            pass  # fetch() 내부에서 이미 캐싱함
        if not args.from_cache:
            time.sleep(random.uniform(args.min_delay, args.max_delay))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    tmp = OUTPUT_PATH.with_suffix(".json.tmp")
    tmp.write_text(
        json.dumps(result, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8"
    )
    tmp.replace(OUTPUT_PATH)

    print(f"\n완료: {len(result)}건 저장 -> {OUTPUT_PATH}")
    if empties:
        print(f"기념일/절기 절 없음 ({len(empties)}건): {', '.join(empties)}")
    if failures:
        print(f"실패 ({len(failures)}건): {', '.join(failures)}")


if __name__ == "__main__":
    main()
