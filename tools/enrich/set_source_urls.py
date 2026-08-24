"""sourceUrl 만 채우는 도구 — 본문(storytelling)은 건드리지 않는다.

apply.py 는 origin·anecdote 를 통째로 덮어쓰므로, 출처만 손보려고 쓰면 본문 전문을
그대로 다시 적어야 하고 그 과정에서 오타 하나가 1,400페이지 중 한 곳을 조용히 망가뜨린다.
그래서 출처 전용 경로를 따로 둔다.

입력: { "gov-1": "https://...", ... } 형태의 JSON. `_` 로 시작하는 키는 주석으로 보고 건넌다.

기본은 **비어 있는 sourceUrl 만** 채운다. 이미 값이 있는 항목을 바꾸려면 --overwrite 를 준다.
어느 쪽이든 검증을 먼저 통과해야 하고, 하나라도 걸리면 아무 파일도 쓰지 않는다.

    python3 tools/enrich/set_source_urls.py content/gov-source-urls.json
    python3 tools/enrich/set_source_urls.py content/gov-source-urls.json --overwrite gov-5,gov-6
"""
from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_many, dumps  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/anniversaries"


def bad_url(v: str) -> str | None:
    """src/utils/sourceUrl.ts 의 렌더 정책과 같은 기준으로 거른다."""
    if any(ord(c) < 0x20 or 0x7F <= ord(c) <= 0x9F for c in v):
        return "제어문자 포함"
    try:
        p = urlsplit(v)
    except ValueError as e:
        return f"파싱 불가 ({e})"
    if p.scheme != "https":
        return "https 가 아님"
    if not p.hostname:
        return "호스트 없음"
    if p.username or p.password:
        return "자격증명 포함"
    return None


def main(argv: list[str]) -> int:
    args = [a for a in argv if not a.startswith("--")]
    overwrite_arg = next((a for a in argv if a.startswith("--overwrite")), None)
    overwrite_all = overwrite_arg == "--overwrite"
    overwrite_ids: set[str] = set()
    if overwrite_arg and "=" in overwrite_arg:
        overwrite_ids = set(overwrite_arg.split("=", 1)[1].split(","))
    elif overwrite_arg and overwrite_arg != "--overwrite":
        overwrite_ids = set(overwrite_arg.removeprefix("--overwrite").lstrip(" ,").split(","))
    if not args:
        print("사용법: set_source_urls.py <파일.json> [--overwrite | --overwrite=id1,id2]")
        return 1

    patch: dict[str, str] = {}
    for p in args:
        f = Path(p) if Path(p).is_absolute() else Path(__file__).parent / p
        for k, v in json.loads(f.read_text(encoding="utf-8")).items():
            if k.startswith("_"):
                continue
            patch[k] = v

    files = {f: json.loads(f.read_text(encoding="utf-8")) for f in sorted(DATA.glob("*.json"))}
    index = {a["id"]: (f, a) for f, arr in files.items() for a in arr}

    errs = [f"{k}: 데이터에 없는 id" for k in patch if k not in index]
    errs += [f"{k}: {m} — {v!r}" for k, v in patch.items() if (m := bad_url(v))]
    if errs:
        print(f"검증 실패 {len(errs)}건 — 아무것도 쓰지 않았다:")
        for m in errs[:20]:
            print("  -", m)
        return 1

    filled, replaced, skipped, touched = 0, 0, [], set()
    for k, v in patch.items():
        f, a = index[k]
        cur = a.get("sourceUrl")
        if cur == v:
            continue
        if cur:
            if not (overwrite_all or k in overwrite_ids):
                skipped.append(k)
                continue
            replaced += 1
        else:
            filled += 1
        a["sourceUrl"] = v
        touched.add(f)

    if not touched:
        print("바뀐 항목 없음.")
        return 0

    atomic_write_many({f: dumps(files[f]) for f in sorted(touched)})
    for f in sorted(touched):
        print(f"  기록: {f.relative_to(ROOT)}")
    print(f"\n비어 있던 곳 채움 {filled}건 · 기존 값 교체 {replaced}건 · 파일 {len(touched)}개")
    if skipped:
        print(f"  이미 값이 있어 건너뜀 {len(skipped)}건 (바꾸려면 --overwrite): {skipped[:8]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
