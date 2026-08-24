"""review 26건에 대한 수기 판단을 반영해 최종 분류를 확정한다 (1회성, 원본 미수정)."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
d = json.load(open(ROOT / "tools/namuwiki/output/match_result.json", encoding="utf-8"))

# (date, text 접두어) -> ("dup"|"new"|"review", 근거)
DECISIONS = [
    ("05-03", "미국 국가 초콜릿 커스타드의 날", "dup", None),
    ("08-12", "국제 청년의 날", "dup", None),
    ("10-17", "국제 빈곤 퇴치의 날", "dup", None),
    ("11-18", "미국 미키 마우스의 날", "dup", None),
    ("01-16", "미국 국가 아무것도 없는 날", "dup", None),
    ("02-27", "세계 북극곰의 날", "dup", None),
    ("05-03", "미국 국가 라즈베리 팝오버의 날", "dup", None),
    ("09-17", "미국의 제헌절", "dup", None),
    ("12-02", "국제 노예제 철폐의 날", "dup", None),
    ("10-15", "세계 흰지팡이의 날", "dup", None),
    ("11-17", "미국 국가 하이킹의 날", "dup", None),
    ("01-21", "다람쥐 존중의 날", "dup", None),
    ("02-19", "미국 국가 민트 초콜릿의 날", "dup", None),
    ("05-20", "세계 벌의 날", "dup", None),
    (
        "03-14",
        "미국 국가 파이의 날",
        "dup",
        None,
    ),  # 나무위키 원문 각주(스크래핑 시 제거됨): "원주율 파이(π)를 의미하며 ... MIT 합격자 발표일" — 원본 HTML 대조로 확인한 확실한 중복(π의 날)
    (
        "06-10",
        "6.10 민주 항쟁 기념일",
        "review",
        "나무위키 항목이 서로 다른 두 역사적 기념일(1987년 6·10 민주항쟁 + 1926년 6·10 만세운동)을 한 줄에 합쳐 기재함. DB에는 '6·10만세운동 기념일'(gov-34)만 있고 '6·10 민주항쟁 기념일'은 없음 — 후자만 신규로 추가할지 검토 필요.",
    ),
    ("05-20", "세계 임상시험의 날", "new", None),
    ("10-16", "세계 척추의 날", "new", None),
    ("05-28", "세계 놀이의 날", "new", None),
    ("11-19", "세계 남성의 날", "new", None),
    ("11-20", "세계 철학의 날", "new", None),
    ("08-13", "세계 늑대", "new", None),
    ("08-28", "시죠 리오나", "new", None),
    ("08-28", "칸자키 리오", "new", None),
    ("09-16", "말레이시아의 날", "new", None),
    ("09-30", "국제 번역의 날", "new", None),
]

applied = 0
for row in d["rows"]:
    if row["status"] != "review":
        continue
    for date_key, prefix, new_status, reason in DECISIONS:
        if row["date"] == date_key and row["text"].startswith(prefix):
            row["status"] = new_status
            if reason:
                row["review_reason"] = reason
            applied += 1
            break

remaining_review = [r for r in d["rows"] if r["status"] == "review"]
print("적용된 수기 판단:", applied, "/ 26")
print("최종 남은 review:", len(remaining_review))
for r in remaining_review:
    print(" -", r["date"], r["name"])

counts = {"total": len(d["rows"])}
for s in ("dup", "review", "new"):
    counts[s] = sum(1 for r in d["rows"] if r["status"] == s)
print(counts)
assert counts["dup"] + counts["review"] + counts["new"] == counts["total"]

d["counts"] = counts
out_path = ROOT / "tools/namuwiki/output/final_result.json"
out_path.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding="utf-8")
print("저장:", out_path)
