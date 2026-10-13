"""중국·홍콩·일본 현지 날짜 3키(2020~2069)를 src/data/observances.json 에 더한다.

    pip install -r tools/observances/requirements.txt
    python3 tools/observances/generate_regional.py            # 계산·검증만
    python3 tools/observances/generate_regional.py --write    # 검증 통과 시 3키만 기록

기존 38키(generate_observances.py, 한국 KST 기준 2020~2050)는 읽기만 하고 바꾸지 않는다.
한국 표를 남의 나라 날짜로 빌려 쓰면 시간대·역법 차이로 하루씩 어긋나는 해가 생긴다
(2041 중국 추분은 09-22인데 한국 chubun 은 09-23, 2040 홍콩 음력 8/14 는 09-19인데
한국 chuseok-1 은 09-20). 그래서 현지 공식 자료로 키를 따로 둔다.

  chubun-cn       중국 추분(UTC+8). 홍콩천문대(HKO) 공력·농력 대조표의 'Autumnal Equinox' 행.
  lunar-08-14-hk  홍콩 음력 8월 14일(UTC+8). HKO 대조표에서 그해 첫 '8th Lunar Month' 행부터
                  센 14일. 윤달은 같은 이름이 한 번 더 나오므로 첫 번째가 본달이다.
  yama-no-hi-jp   일본 산의 날. 祝日法 제2조 '八月十一日', 2020·2021만 도쿄올림픽 특별조치법으로
                  08-10·08-08(내각부). 2021-08-09 는 대체휴일이지 산의 날이 아니다.

HKO 표는 HKO 가 천문 계산으로 낸 공식표이고 미래 연도는 예측값이다. 일본 2028년 이후는
현행법 규칙의 투영이다 — 법이 바뀌거나 정부가 특례를 두면 달라진다.
verify() 는 ephem 으로 UTC+8 추분·삭(朔)을 독립 계산해 50년 전부 대조하고, 일본은 내각부
syukujitsu.csv(공표된 실제 날짜)와 대조한다. 하나라도 어긋나면 기록하지 않는다.
"""
from __future__ import annotations

import datetime as dt
import json
import re
import sys
from pathlib import Path
from typing import Iterator, NamedTuple

import ephem

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
sys.path.insert(0, str(Path(__file__).resolve().parent))
from toolkit import atomic_write_text  # noqa: E402
from generate_observances import sun_lon  # noqa: E402  겉보기 황경(그해 춘분점 기준)

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "src/data/observances.json"
_BATCHES = ROOT / "tools/research/workflow/batches"
HKO_DIRS = [
    _BATCHES / "priority-editorial-20261012/evidence/_shared-hko-calendar",   # 2020~2050
    _BATCHES / "held-resolution-20261013/evidence/_hko-calendar-2051-2069",
]
CAO_CSV = _BATCHES / "held-resolution-20261013/evidence/jp-yama-no-hi/cao-syukujitsu-csv.cp932-decoded.txt"

Y0, Y1 = 2020, 2069
CST = dt.timezone(dt.timedelta(hours=8))
KEYS = ("chubun-cn", "lunar-08-14-hk", "yama-no-hi-jp")
JP_RULE = (8, 11)
JP_EXCEPTIONS = {2020: (8, 10), 2021: (8, 8)}

_ROW = re.compile(
    r"^(\d{4})/(\d{1,2})/(\d{1,2}) (?:(\d+)(?:st|nd|rd|th) Lunar Month|(\d+)) "
    r"(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day(?: (.+))?$"
)


class Row(NamedTuple):
    date: dt.date
    month: int | None   # 'Nth Lunar Month' 행이면 N (그날이 초하루)
    day: int | None     # 그 밖의 날은 음력 일
    term: str | None
    line: str


def _rows(text: str) -> Iterator[Row]:
    """HKO 표의 날짜 행. 원 응답의 고정폭 공백과 수집기의 축약 공백을 둘 다 받는다."""
    for raw in text.splitlines():
        line = " ".join(raw.split())
        m = _ROW.match(line)
        if m:
            y, mo, d, month, day, term = m.groups()
            yield Row(dt.date(int(y), int(mo), int(d)),
                      int(month) if month else None, int(day) if day else None, term, line)


def hko_text(year: int) -> str:
    for d in HKO_DIRS:
        p = d / f"hko-T{year}e.txt"
        if p.exists():
            return p.read_text(encoding="utf-8")
    raise FileNotFoundError(f"HKO {year} 표 사본이 없습니다")


def hko_autumn_equinox(text: str) -> tuple[dt.date, str]:
    for r in _rows(text):
        if r.term == "Autumnal Equinox":
            return r.date, r.line
    raise ValueError("Autumnal Equinox 행이 없습니다")


def hko_lunar_8_14(text: str) -> tuple[dt.date, str]:
    rows = list(_rows(text))
    for i, r in enumerate(rows):
        if r.month == 8:                       # 첫 번째가 본달, 반복되면 윤8월
            for r2 in rows[i + 1:]:
                if r2.month is not None:
                    break
                if r2.day == 14:
                    return r2.date, r2.line
            break
    raise ValueError("음력 8월 14일 행이 없습니다")


def jp_mountain_day(year: int) -> dt.date:
    return dt.date(year, *JP_EXCEPTIONS.get(year, JP_RULE))


def cao_mountain_days() -> dict[int, dt.date]:
    """내각부 syukujitsu.csv 에 공표된 산의 날 (2016~ 공표 연도까지)."""
    out = {}
    for line in CAO_CSV.read_text(encoding="utf-8").splitlines():
        ymd, _, name = line.partition(",")
        if name.strip() == "山の日":
            y, m, d = map(int, ymd.split("/"))
            out[y] = dt.date(y, m, d)
    return out


def _cst(d: ephem.Date) -> dt.datetime:
    return d.datetime().replace(tzinfo=dt.timezone.utc).astimezone(CST)


def ephem_autumn_equinox(year: int) -> dt.date:
    return _cst(ephem.next_equinox(f"{year}/8/1")).date()


def _utc_midnight_cst(d: dt.date) -> dt.datetime:
    return dt.datetime(d.year, d.month, d.day) - dt.timedelta(hours=8)


def _has_zhongqi(start: dt.date, end: dt.date) -> bool:
    """[start, end) 사이(UTC+8 날짜 경계)에 태양 황경이 30도 배수를 지나는가."""
    a, b = (int(sun_lon(_utc_midnight_cst(x)) // 30) for x in (start, end))
    return a != b


def ephem_lunar_8_14(year: int) -> dt.date:
    """GB/T 33661-2017 규칙으로 독립 계산한 음력 8월 14일(UTC+8).

    동지가 든 달이 11월. 전년 동지월~올해 동지월 사이가 13개월이면 그중 첫 번째
    무중기월이 윤달. '추분이 든 달=8월'로 줄이면 2033년처럼 틀린다.
    """
    def solstice(y: int) -> dt.date:
        return _cst(ephem.next_solstice(f"{y}/11/1")).date()

    starts, t = [], ephem.Date(f"{year - 1}/10/1")
    while not starts or starts[-1] < dt.date(year + 1, 2, 1):
        t = ephem.next_new_moon(t)
        starts.append(_cst(t).date())
    m11a = max(s for s in starts if s <= solstice(year - 1))
    m11b = max(s for s in starts if s <= solstice(year))
    i0, i1 = starts.index(m11a), starts.index(m11b)
    leap = i1 - i0 == 13
    number = 11
    for i in range(i0 + 1, i1):
        if leap and not _has_zhongqi(starts[i], starts[i + 1]):
            leap = False      # 첫 무중기월만 윤달, 번호를 올리지 않는다
            continue
        number = number % 12 + 1
        if number == 8:
            return starts[i] + dt.timedelta(days=13)
    raise ValueError(f"{year}: 8월을 찾지 못했습니다")


def build() -> dict[str, dict[str, str]]:
    table: dict[str, dict[str, str]] = {k: {} for k in KEYS}
    for y in range(Y0, Y1 + 1):
        text = hko_text(y)
        for key, d in (("chubun-cn", hko_autumn_equinox(text)[0]),
                       ("lunar-08-14-hk", hko_lunar_8_14(text)[0]),
                       ("yama-no-hi-jp", jp_mountain_day(y))):
            if d.year != y:
                raise ValueError(f"{key} {y}: 다른 해 날짜 {d}")
            table[key][str(y)] = d.strftime("%m-%d")
    return table


def verify(table: dict[str, dict[str, str]]) -> list[str]:
    bad = []
    for y in range(Y0, Y1 + 1):
        for key, ref in (("chubun-cn", ephem_autumn_equinox(y)), ("lunar-08-14-hk", ephem_lunar_8_14(y))):
            if table[key].get(str(y)) != ref.strftime("%m-%d"):
                bad.append(f"{key} {y}: HKO={table[key].get(str(y))} ephem={ref:%m-%d}")
    for y, d in cao_mountain_days().items():
        if Y0 <= y <= Y1 and table["yama-no-hi-jp"].get(str(y)) != d.strftime("%m-%d"):
            bad.append(f"yama-no-hi-jp {y}: 표={table['yama-no-hi-jp'].get(str(y))} 내각부={d:%m-%d}")
    for key, row in table.items():
        if list(row) != [str(y) for y in range(Y0, Y1 + 1)]:
            bad.append(f"{key}: 연도 범위가 {Y0}~{Y1} 가 아닙니다")
    return bad


def dumps(table: dict) -> str:
    """현재 파일과 같은 표기. 키 순서는 보존한다 — rare-disease-day 가 정렬 밖 끝에 있다."""
    return json.dumps(table, ensure_ascii=False, indent=1) + "\n"


def merge(current: dict, new: dict) -> dict:
    """새 3키만 끝에 더하거나 제자리에서 갈아끼운다. 그 밖의 키를 건드리려 하면 거부."""
    stray = set(new) - set(KEYS)
    if stray:
        raise ValueError(f"이 생성기가 관리하지 않는 키: {sorted(stray)}")
    return {**current, **new}


def main(argv: list[str]) -> int:
    table = build()
    bad = verify(table)
    for b in bad:
        print("  !", b)
    print(f"검증: 불일치 {len(bad)}건 ({len(KEYS)}키 × {Y1 - Y0 + 1}년, ephem·내각부 대조)")
    if bad:
        print("검증 실패 — 기록하지 않았습니다.")
        return 1
    if "--write" not in argv:
        return 0
    before = OUT.read_text(encoding="utf-8")
    current = json.loads(before)
    if dumps(current) != before:
        print("observances.json 표기가 생성기와 달라 다시 쓰면 기존 키가 흔들립니다 — 중단.")
        return 1
    atomic_write_text(OUT, dumps(merge(current, table)))
    print(f"기록: {', '.join(KEYS)} → {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
