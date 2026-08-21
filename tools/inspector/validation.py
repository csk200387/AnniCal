"""기념일 레코드 검증 규칙 — 검수 패널과 저장 경로가 공유한다.

같은 규칙을 두 곳에 따로 쓰면 반드시 어긋난다. "검수 결과 ✅" 인데 저장은 거부되거나,
반대로 저장은 통과했는데 빌드가 깨지는 상황을 막으려고 한곳에 모았다.

여기서 잡는 것은 정규식으로는 안 걸리는 것들이다.

- `02-31`, `99-99` 처럼 형식은 맞지만 달력에 없는 날짜
- 데이터셋에 없는 anchor, 자기참조·순환 anchor
- ICS 속성 주입으로 이어지는 제어문자·개행 (src/utils/ics.ts 가 값을 그대로 붙인다)
- URL 자리에 든 슬러그 조각, http·자격증명이 박힌 URL
"""

from __future__ import annotations

import datetime
import re
from typing import Any
from urllib.parse import urlsplit

DATE_TYPES = [
    "annual-fixed",
    "annual-floating",
    "annual-nth-weekday",
    "annual-relative-to-holiday",
    "annual-tabulated",
    "one-time",
]

# annual-nth-weekday: "MM-N-DOW" (N=1~5 또는 L, DOW=SUN..SAT)
NTH_WEEKDAY_RE = r"\d{2}-(?:[1-5]|L)-(?:SUN|MON|TUE|WED|THU|FRI|SAT)"
# annual-relative-to-holiday: "{anchorId}:{offsetDays}" (offsetDays 는 +/- 정수)
RELATIVE_TO_HOLIDAY_RE = r"[a-zA-Z0-9_\-]+:-?\d+"
# id 는 URL·ICS UID·파일명에 그대로 쓰인다. ASCII 로 좁혀 둔다.
ID_RE = r"[a-zA-Z0-9_\-]+"

# 탭·개행을 포함한 모든 C0/C1 제어문자. ICS 는 CRLF 가 곧 속성 구분자다.
CONTROL_CHARS_RE = re.compile(r"[\x00-\x1f\x7f-\x9f]")
# JSON 문자열 안에서 </script> 를 닫아 버리는 시퀀스 (프리렌더 JSON-LD 방어와 짝).
SCRIPT_CLOSE_RE = re.compile(r"</\s*script", re.IGNORECASE)

# offsetDays 상한 — 이보다 크면 anchor 를 잘못 고른 것이다.
MAX_OFFSET_DAYS = 366


def is_real_month_day(mm: int, dd: int) -> bool:
    """윤년을 포함해 달력에 실제로 있는 (월, 일) 인지. 2월 29일은 유효로 본다."""
    try:
        datetime.date(2024, mm, dd)  # 2024 = 윤년
        return True
    except ValueError:
        return False


def is_real_date(yyyy: int, mm: int, dd: int) -> bool:
    try:
        datetime.date(yyyy, mm, dd)
        return True
    except ValueError:
        return False


def check_text(value: str | None, label: str) -> list[str]:
    """텍스트 필드의 제어문자·스크립트 종료 시퀀스 검사."""
    if not value:
        return []
    errors: list[str] = []
    m = CONTROL_CHARS_RE.search(value)
    if m:
        errors.append(f"{label}: 제어문자 U+{ord(m.group()):04X} 가 들어 있습니다.")
    if SCRIPT_CLOSE_RE.search(value):
        errors.append(f"{label}: '</script' 시퀀스는 쓸 수 없습니다.")
    return errors


def check_source_url(value: str | None) -> list[str]:
    """sourceUrl 검증 — 비었거나 정상 HTTPS URL 이어야 한다.

    데이터셋에는 URL 자리에 슬러그 조각("fathers-day-us")이 든 항목이 31건 남아 있다.
    렌더 단계(src/utils/sourceUrl.ts)가 걸러 깨진 링크가 노출되진 않지만, 저장할 때는
    막아서 고쳐 나가게 한다. 지우고 싶으면 빈 값으로 두면 된다.
    """
    if not value:
        return []
    if CONTROL_CHARS_RE.search(value):
        return ["sourceUrl: 제어문자가 들어 있습니다."]
    try:
        parts = urlsplit(value)
    except ValueError as e:
        return [f"sourceUrl: 파싱할 수 없는 URL ({e})."]
    if parts.scheme != "https":
        if parts.scheme == "http":
            return ["sourceUrl: http 대신 https 를 쓰세요."]
        return [f"sourceUrl: '{value}' 는 https:// URL 이 아닙니다 (비우려면 빈 값)."]
    if not parts.hostname:
        return ["sourceUrl: 호스트가 없습니다."]
    if parts.username or parts.password:
        return ["sourceUrl: 자격증명이 포함된 URL 은 쓸 수 없습니다."]
    return []


def check_date_field(
    entry: dict[str, Any],
    valid_ids: set[str],
    observances: dict[str, dict[str, str]],
    reference_year: str,
) -> list[str]:
    """dateType 별 date 형식 + 의미(실제 달력 날짜인지) 검증."""
    dt = entry.get("dateType")
    d = entry.get("date", "") or ""
    errors: list[str] = []

    if dt == "annual-fixed":
        if not re.fullmatch(r"\d{2}-\d{2}", d):
            return [f"'{d}' — annual-fixed 는 MM-DD 형식이어야 합니다."]
        mm, dd = int(d[:2]), int(d[3:])
        if not is_real_month_day(mm, dd):
            errors.append(f"'{d}' — 달력에 없는 날짜입니다.")

    elif dt == "annual-nth-weekday":
        if not re.fullmatch(NTH_WEEKDAY_RE, d):
            return [f"'{d}' — annual-nth-weekday 는 MM-N-DOW 형식이어야 합니다 (예: 05-2-SUN, 10-L-TUE)."]
        mm = int(d[:2])
        if not 1 <= mm <= 12:
            errors.append(f"'{d}' — 월 {mm} 이 1~12 범위를 벗어납니다.")
        if d.split("-")[1] == "5":
            errors.append(
                f"'{d}' — 다섯째 주는 없는 해가 있습니다. 마지막 주를 뜻한다면 'L' 을 쓰세요."
            )

    elif dt == "annual-relative-to-holiday":
        if not re.fullmatch(RELATIVE_TO_HOLIDAY_RE, d):
            return [f"'{d}' — annual-relative-to-holiday 는 anchorId:offsetDays 형식이어야 합니다."]
        anchor_id, offset_str = d.rsplit(":", 1)
        if anchor_id == entry.get("id"):
            errors.append(f"'{d}' — 자기 자신을 anchor 로 삼을 수 없습니다.")
        elif anchor_id not in valid_ids:
            errors.append(f"anchor id '{anchor_id}' 를 찾을 수 없습니다.")
        if abs(int(offset_str)) > MAX_OFFSET_DAYS:
            errors.append(f"'{d}' — offsetDays 가 ±{MAX_OFFSET_DAYS} 를 넘습니다.")

    elif dt == "annual-tabulated":
        row = observances.get(d)
        if row is None:
            return [f"'{d}' — observances.json 에 없는 키입니다."]
        if reference_year not in row:
            errors.append(f"'{d}' — observances.json 에 {reference_year}년 값이 없습니다.")

    elif dt in ("annual-floating", "one-time"):
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
            return [f"'{d}' — {dt} 는 YYYY-MM-DD 형식이어야 합니다."]
        if not is_real_date(int(d[:4]), int(d[5:7]), int(d[8:])):
            errors.append(f"'{d}' — 달력에 없는 날짜입니다.")

    elif dt:
        return [f"dateType '{dt}' 을 알 수 없습니다."]
    else:
        return ["dateType 이 비어 있습니다."]

    return errors


def find_anchor_cycles(items: list[dict[str, Any]]) -> list[str]:
    """anchor 참조 그래프가 DAG 인지. 순환하면 런타임이 스택 오버플로로 죽는다."""
    by_id = {a.get("id"): a for a in items}
    parent: dict[str, str] = {}
    for a in items:
        if a.get("dateType") == "annual-relative-to-holiday":
            aid = a.get("id")
            d = a.get("date", "") or ""
            if aid and ":" in d:
                parent[aid] = d.rsplit(":", 1)[0]

    cycles: list[str] = []
    reported: set[str] = set()
    for start in parent:
        if start in reported:
            continue
        path: list[str] = []
        node: str | None = start
        while node is not None and node in parent:
            if node in path:
                loop = path[path.index(node):] + [node]
                cycles.append(" → ".join(loop))
                reported.update(loop)
                break
            path.append(node)
            node = parent.get(node)
            if node is not None and node not in by_id:
                break  # dangling anchor 는 check_date_field 가 따로 보고한다
        else:
            reported.update(path)
    return cycles


def anchor_dependents(items: list[dict[str, Any]], target_id: str) -> list[str]:
    """`target_id` 를 anchor 로 참조하는 기념일 id 목록. 삭제 차단에 쓴다."""
    return [
        a.get("id", "")
        for a in items
        if a.get("dateType") == "annual-relative-to-holiday"
        and (a.get("date", "") or "").rsplit(":", 1)[0] == target_id
    ]
