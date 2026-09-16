"""Brave Search API 클라이언트 (의존성 0, stdlib 만 사용).

nationaldaycalendar 출처 기념일의 유래 조사용. WebSearch 툴은 세션당 호출
횟수 제한이 있어 483건 같은 대량 작업엔 안 맞는다 — 이건 사용자 API 키로
직접 호출하니 그 제한이 없다.

인증: tools/enrich/.env 에 BRAVE_API_KEY=... 한 줄 (naver_news.py 와 같은 패턴).

CLI 사용:
    python3 brave_search.py "National Chicken Boy's Day origin"
    python3 brave_search.py "..." --count 5
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ENDPOINT = "https://api.search.brave.com/res/v1/web/search"


def _load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip())


_load_env(Path(__file__).parent / ".env")


def search(query: str, count: int = 5) -> list[dict]:
    """검색 결과를 [{title, url, description}] 로 반환. 이미 스니펫이라 짧다."""
    api_key = os.environ.get("BRAVE_API_KEY")
    if not api_key:
        raise RuntimeError("BRAVE_API_KEY 가 없습니다. tools/enrich/.env 를 채우세요.")

    url = f"{ENDPOINT}?{urllib.parse.urlencode({'q': query, 'count': count})}"
    req = urllib.request.Request(
        url,
        headers={
            "Accept": "application/json",
            "X-Subscription-Token": api_key,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            data = json.load(res)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"Brave Search API 오류 {e.code}: {e.read().decode('utf-8', 'ignore')}") from e

    results = (data.get("web") or {}).get("results") or []
    return [
        {
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "description": r.get("description", ""),
        }
        for r in results
    ]


def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("query")
    p.add_argument("--count", type=int, default=5)
    args = p.parse_args()

    for r in search(args.query, args.count):
        print(f"- {r['title']}\n  {r['url']}\n  {r['description']}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
