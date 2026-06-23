"""
네이버 검색 API — 뉴스 수집 클라이언트 (의존성 0, stdlib 만 사용).

기념일 데이터의 storytelling / sourceUrl 을 채우기 위한 뉴스 수집 도구.
- 단독 CLI 로도, app.py(Gradio) 에서 import 해서도 쓴다.

인증 (둘 중 하나):
1. 환경변수  NAVER_CLIENT_ID / NAVER_CLIENT_SECRET
2. tools/inspector/.env  (KEY=VALUE 줄 단위)

CLI 사용:
    python naver_news.py "스승의 날"
    python naver_news.py "한글날 유래" --display 5 --sort sim
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from pathlib import Path

NEWS_ENDPOINT = "https://openapi.naver.com/v1/search/news.json"
ENV_PATH = Path(__file__).resolve().parent / ".env"

_TAG_RE = re.compile(r"<[^>]+>")


class NaverAuthError(RuntimeError):
    """클라이언트 ID/Secret 누락 또는 인증 실패."""


class NaverApiError(RuntimeError):
    """API 호출 실패 (네트워크/HTTP/쿼터 등)."""


# ---------- 인증 ----------

def _load_dotenv(path: Path = ENV_PATH) -> dict[str, str]:
    """간단한 .env 파서 (KEY=VALUE, # 주석, 따옴표 제거). python-dotenv 불필요."""
    env: dict[str, str] = {}
    if not path.exists():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key:
            env[key] = val
    return env


def get_credentials() -> tuple[str, str]:
    """환경변수 우선, 없으면 .env 에서 Client ID/Secret 을 읽는다."""
    dotenv = _load_dotenv()
    client_id = os.environ.get("NAVER_CLIENT_ID") or dotenv.get("NAVER_CLIENT_ID")
    client_secret = os.environ.get("NAVER_CLIENT_SECRET") or dotenv.get("NAVER_CLIENT_SECRET")
    if not client_id or not client_secret:
        raise NaverAuthError(
            "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 누락. "
            "환경변수로 설정하거나 tools/inspector/.env 에 적으세요 "
            "(.env.example 참고)."
        )
    return client_id, client_secret


# ---------- 정제 ----------

def _clean(text: str) -> str:
    """<b> 등 태그 제거 + HTML 엔티티 디코드."""
    return html.unescape(_TAG_RE.sub("", text or "")).strip()


@dataclass
class NewsItem:
    title: str
    link: str          # 네이버 뉴스 링크 (없으면 originallink)
    originallink: str  # 원문 매체 링크
    description: str
    pub_date: str      # RFC1123 (예: "Mon, 22 Jun 2026 ...")

    @property
    def best_link(self) -> str:
        return self.link or self.originallink


# ---------- API ----------

def search_news(
    query: str,
    *,
    display: int = 10,
    start: int = 1,
    sort: str = "sim",   # "sim"(정확도) | "date"(최신)
    timeout: float = 10.0,
) -> list[NewsItem]:
    """
    네이버 뉴스 검색.
    - query: 검색어 (예: 기념일 이름)
    - display: 1~100
    - start: 1~1000
    - sort: "sim" 정확도순 | "date" 날짜순
    """
    query = (query or "").strip()
    if not query:
        return []

    client_id, client_secret = get_credentials()
    display = max(1, min(int(display), 100))
    start = max(1, min(int(start), 1000))
    if sort not in ("sim", "date"):
        sort = "sim"

    params = urllib.parse.urlencode(
        {"query": query, "display": display, "start": start, "sort": sort}
    )
    req = urllib.request.Request(
        f"{NEWS_ENDPOINT}?{params}",
        headers={
            "X-Naver-Client-Id": client_id,
            "X-Naver-Client-Secret": client_secret,
        },
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", "replace") if e.fp else ""
        if e.code in (401, 403):
            raise NaverAuthError(f"인증 실패 (HTTP {e.code}): {body}") from e
        raise NaverApiError(f"HTTP {e.code}: {body}") from e
    except urllib.error.URLError as e:
        raise NaverApiError(f"네트워크 오류: {e.reason}") from e

    return [
        NewsItem(
            title=_clean(it.get("title", "")),
            link=it.get("link", "") or "",
            originallink=it.get("originallink", "") or "",
            description=_clean(it.get("description", "")),
            pub_date=it.get("pubDate", "") or "",
        )
        for it in payload.get("items", [])
    ]


def search_news_dicts(query: str, **kw) -> list[dict]:
    """search_news 결과를 dict 리스트로 (Gradio/JSON 직렬화용)."""
    return [asdict(n) for n in search_news(query, **kw)]


# ---------- CLI ----------

def _main() -> int:
    ap = argparse.ArgumentParser(description="네이버 뉴스 검색")
    ap.add_argument("query", help="검색어")
    ap.add_argument("--display", type=int, default=10, help="결과 수 (1~100)")
    ap.add_argument("--start", type=int, default=1, help="시작 위치 (1~1000)")
    ap.add_argument("--sort", choices=["sim", "date"], default="sim", help="정렬")
    ap.add_argument("--json", action="store_true", help="JSON 출력")
    args = ap.parse_args()

    try:
        items = search_news(
            args.query, display=args.display, start=args.start, sort=args.sort
        )
    except (NaverAuthError, NaverApiError) as e:
        print(f"[오류] {e}")
        return 1

    if args.json:
        print(json.dumps([asdict(i) for i in items], ensure_ascii=False, indent=2))
        return 0

    if not items:
        print("검색 결과 없음.")
        return 0

    for i, n in enumerate(items, 1):
        print(f"{i:>2}. {n.title}")
        print(f"    {n.best_link}")
        if n.description:
            print(f"    {n.description}")
        if n.pub_date:
            print(f"    🕒 {n.pub_date}")
        print()
    return 0


if __name__ == "__main__":
    raise SystemExit(_main())
