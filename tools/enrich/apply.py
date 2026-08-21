"""storytelling 본문 보강 적용기.

content/*.json 의 { id: {origin, anecdote, sourceUrl?} } 를 읽어
src/data/anniversaries/*.json 의 해당 항목에 덮어쓴다.

- 대상 id 가 데이터에 없으면 즉시 중단한다(오타로 조용히 누락되는 걸 막는다).
- sourceUrl 키가 있을 때만 sourceUrl 을 건드린다.
- 적용 후 길이 통계를 출력한다.

실행: python3 tools/enrich/apply.py content/gov-03.json [...]
"""
from __future__ import annotations

import json
import statistics
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from toolkit import atomic_write_many, dumps  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src/data/anniversaries"


def main(argv: list[str]) -> int:
    if not argv:
        print("사용법: apply.py <보강파일.json> [...]")
        return 1

    patch: dict[str, dict] = {}
    for p in argv:
        f = Path(p) if Path(p).is_absolute() else Path(__file__).parent / p
        for k, v in json.loads(f.read_text(encoding="utf-8")).items():
            if k.startswith("_"):
                continue
            if k in patch:
                print(f"중복 id: {k}")
                return 1
            patch[k] = v

    files = {f: json.loads(f.read_text(encoding="utf-8")) for f in sorted(DATA.glob("*.json"))}
    index = {a["id"]: (f, a) for f, arr in files.items() for a in arr}

    missing = [k for k in patch if k not in index]
    if missing:
        print(f"데이터에 없는 id {len(missing)}건: {missing[:5]}")
        return 1

    before, after, touched = [], [], set()
    for k, v in patch.items():
        f, a = index[k]
        s = a["storytelling"]
        before.append(len(s.get("origin") or "") + len(s.get("anecdote") or ""))
        s["origin"] = v["origin"]
        s["anecdote"] = v["anecdote"]
        if "sourceUrl" in v:
            a["sourceUrl"] = v["sourceUrl"]
        after.append(len(s["origin"]) + len(s["anecdote"]))
        touched.add(f)

    # 여러 월 파일을 함께 바꾸므로 전부 아니면 전무로 — 중간에 죽어도 반만 적용되지 않는다.
    atomic_write_many({f: dumps(files[f]) for f in sorted(touched)})
    for f in sorted(touched):
        print(f"  기록: {f.relative_to(ROOT)}")

    short = [k for k, v in patch.items() if len(v["origin"]) + len(v["anecdote"]) < 200]
    long_desc = [k for k, v in patch.items() if len(v["origin"]) > 155]
    print(f"\n{len(patch)}건 적용 · 평균 {int(statistics.mean(before))}자 → {int(statistics.mean(after))}자")
    print(f"  최소 {min(after)} / 최대 {max(after)}")
    if short:
        print(f"  ! 200자 미만 {len(short)}건: {short}")
    if long_desc:
        print(f"  ! origin 155자 초과(검색 스니펫 잘림) {len(long_desc)}건: {long_desc}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
