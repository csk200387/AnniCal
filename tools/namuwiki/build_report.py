"""final_result.json 을 바탕으로 NAMUWIKI_NEW_ANNIVERSARIES.md 를 생성한다 (1회성)."""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
d = json.load(open(ROOT / "tools/namuwiki/output/final_result.json", encoding="utf-8"))
rows = d["rows"]
counts = d["counts"]

new_rows = [r for r in rows if r["status"] == "new"]
review_rows = [r for r in rows if r["status"] == "review"]

by_date: dict[str, list] = defaultdict(list)
for r in new_rows:
    by_date[r["date"]].append(r)

MONTH_NAMES = {f"{m:02d}": f"{m}월" for m in range(1, 13)}

lines: list[str] = []
lines.append("# 나무위키 대조 신규 기념일 후보 보고서")
lines.append("")
lines.append(
    "나무위키의 날짜별 문서(`1월 1일` ~ `12월 31일`, 366개)에서 \"기념일 및 절기\" 절만 "
    "긁어 정리한 데이터(`tools/namuwiki/output/namuwiki_calendar.json`, 항목 1,346개)를 "
    "AnniCal 기존 데이터베이스(`src/data/anniversaries/01~12.json`, 1,470건)와 대조한 결과다. "
    "이 문서는 분석 결과물이며 원본 JSON과 기존 데이터베이스는 건드리지 않았다."
)
lines.append("")
lines.append("## 방법론")
lines.append("")
lines.append(
    "각 DB 레코드의 \"매칭 날짜\"는 기본적으로 `src/data/routes.json` 의 `urlDate`(2026년 기준 "
    "URL 고정일)를 쓴다. 단, 설날·정월대보름·단오·추석 등 음력 명절(`annual-tabulated`)은 "
    "나무위키가 \"1월 1일\" 문서의 \"음력\" 하위절에 \"설날(음력 1월 1일)\"을 싣는 방식 — 즉 "
    "실제 그해 양력 발생일이 아니라 음력 월/일 숫자를 그대로 양력 페이지 번호에 대응시키는 "
    "방식 — 을 쓰기 때문에, 그 숫자 대응(예: 설날→01-01, 추석→08-15)으로 매칭 날짜를 따로 "
    "잡았다. 24절기·삼복·한식은 연도별로 하루 정도 밀릴 수 있어 ±1일 오차를 허용했다.\n\n"
    "이름 비교는 공백·괄호·구두점을 정리한 뒤 완전/부분 일치, 그리고 \"~의 날\"/\"~기념일\" 같은 "
    "공통 접미사를 뗀 핵심어끼리의 유사도로 판정했다. 문자열만으로 판단하기 어려운 항목 "
    "— 자동 판정이 애매하게 나온 26건 — 은 나무위키 원문(각주 포함)과 대조 후보 DB 항목을 "
    "직접 대조해 사람이 확인했다. \"신정\"↔\"새해 첫날\", \"성탄절\"↔\"크리스마스\"처럼 표기는 "
    "달라도 명백히 같은 대상인 널리 알려진 동의어도 이 과정에서 중복으로 판정했다."
)
lines.append("")
lines.append("## 요약")
lines.append("")
lines.append("| 구분 | 건수 |")
lines.append("|---|---:|")
lines.append(f"| 나무위키에서 처리한 항목 | {counts['total']:,} |")
lines.append(f"| 신규 (DB에 없음) | {counts['new']:,} |")
lines.append(f"| 중복 (DB에 이미 있어 제외) | {counts['dup']:,} |")
lines.append(f"| 검토 필요 | {counts['review']:,} |")
lines.append("")
lines.append(
    "※ 나무위키 원본에는 이 1,346개 항목 외에 \"자세한 내용은 OO 문서를 참고하십시오\" 식으로 "
    "다른 문서를 가리키기만 하는 안내문 119건이 더 있다(예: \"1월 1일\" 문서의 \"음력\" 절이 "
    "\"설날 문서 참고\"만 담고 있는 경우). 그 자체로는 정리할 내용이 없어 이 대조 대상에서 처음부터 제외했다."
)
lines.append("")
lines.append("## 중복 제외 기준과 건수")
lines.append("")
lines.append(f"**{counts['dup']:,}건**을 아래 기준으로 중복 판단해 신규 목록에서 제외했다. "
             "개별 항목은 나열하지 않는다(요청에 따라 제외 목록은 싣지 않음).")
lines.append("")
lines.append("- 같은 날짜에서 DB 기념일명과 정규화 후 완전히 일치하거나, 한쪽 이름이 다른 쪽에 "
             "그대로 포함되는 경우(예: \"세계 나초의 날\" ⊂ 나무위키 \"세계 나초의 날: …\").")
lines.append("- \"~의 날\"/\"~기념일\" 등 공통 접미사를 뗀 핵심어가 일치하거나 매우 유사한 경우 "
             "(예: \"초콜릿 커스타드의 날\"↔\"초콜릿 커스터드의 날\" 표기 차이, \"국제 노예제 철폐의 날\"↔"
             "\"노예제 폐지를 위한 국제 기념일\" 어순 차이).")
lines.append("- 표기는 전혀 다르지만 같은 대상임이 명백한 널리 알려진 동의어(신정/새해 첫날, "
             "성탄절/크리스마스, 설날/구정, 추석/한가위, 삼일절/3.1절, 부처님오신날/석가탄신일, "
             "발렌타인데이/밸런타인데이, 노동절/근로자의 날 등 13개 동의어 그룹으로 처리).")
lines.append("- 나무위키 각주에 있던 부연 설명까지 원문 대조로 확인해 판정한 경우 1건 "
             "(3월 14일 \"미국 국가 파이의 날\" — 각주에 \"원주율 파이(π)를 의미\"라고 명시돼 있어 "
             "DB의 \"세계 파이(π)의 날\"과 동일 대상으로 판정).")
lines.append("")

lines.append("## 신규 기념일")
lines.append("")
lines.append(
    f"날짜순으로 정리한 {counts['new']:,}건. 나무위키 문서 하나에 여러 항목이 있으면 날짜 헤딩 "
    "아래 출처를 한 번만 적었다. 명칭은 나무위키 원문에서 \" - \" 구분자(또는 첫 문장 경계) 앞부분을 "
    "기계적으로 뽑은 것이라 부정확할 수 있다 — 정확한 명칭은 각 항목의 설명 전문을 확인할 것."
)
lines.append("")

current_month = None
for date_key in sorted(by_date.keys()):
    month = date_key[:2]
    if month != current_month:
        current_month = month
        lines.append(f"## {MONTH_NAMES[month]}")
        lines.append("")
    entry_rows = by_date[date_key]
    title = entry_rows[0]["title"]
    url = entry_rows[0]["url"]
    lines.append(f"### {date_key} (나무위키 \"{title}\" 문서)")
    lines.append("")
    lines.append(f"출처: <{url}>")
    lines.append("")
    for r in entry_rows:
        if r["name"] and r["desc"]:
            lines.append(f"- **{r['name']}** — {r['desc']}")
        elif r["name"]:
            lines.append(f"- **{r['name']}**")
        else:
            lines.append(f"- {r['text']}")
    lines.append("")

lines.append("## 검토 필요")
lines.append("")
lines.append(f"자동 판정도, 사람의 1차 판단도 확실한 결론을 내리지 못한 {counts['review']:,}건.")
lines.append("")
for r in review_rows:
    lines.append(f"### {r['date']} (나무위키 \"{r['title']}\" 문서)")
    lines.append("")
    lines.append(f"- 나무위키 원문: {r['text']}")
    bm = r["best_match"]
    if bm:
        lines.append(f"- 후보 DB 항목: `{bm['id']}` \"{bm['name']}\" (매칭 날짜 {bm['date']})")
    lines.append(f"- 출처: <{r['url']}>")
    lines.append(f"- 판단 근거: {r.get('review_reason', '(근거 미기재)')}")
    lines.append("")

out_path = ROOT / "NAMUWIKI_NEW_ANNIVERSARIES.md"
out_path.write_text("\n".join(lines), encoding="utf-8")
print("저장:", out_path)
print("라인 수:", len(lines))
