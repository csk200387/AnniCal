"""음력 명절 + 24절기의 실제 발생일(KST)을 연도별로 계산해 src/data/observances.json 을 만든다.

    pip install ephem korean_lunar_calendar
    python3 tools/observances/generate_observances.py

빌드에 물려 있지 않다. 표는 한 번 만들어 커밋해 두고 연도 범위를 넓힐 때만 다시
돌린다. 값이 바뀌면 이미 색인된 페이지의 날짜가 달라지므로 함부로 재생성하지 말 것.

24절기는 태양의 '겉보기' 황경이 15도 간격의 특정 값에 닿는 순간으로 정의된다.
계산에서 두 가지를 빠뜨리기 쉬운데, 둘 다 자정 근처 절기의 날짜를 하루 밀어버린다.

  1. 황경은 그해 춘분점(epoch=관측시각) 기준이어야 한다. J2000 으로 재면 세차
     때문에 0.3도가량 어긋나 2026년 춘분(KST 3/20 23:45)이 3/21 로 밀린다.
  2. 광행차가 반영된 '겉보기' 적도좌표에서 변환해야 한다. 기하학적 위치를 쓰면
     태양광 도달 시간 8.3분만큼 이르게 나와 2025년 동지(KST 12/22 00:03)가
     12/21 로 밀린다.

ephem 내장 next_equinox/next_solstice 와 4대 절기 × 31년을 대조해 검증했다.
"""

from __future__ import annotations

import datetime
import json
from pathlib import Path

import ephem
from korean_lunar_calendar import KoreanLunarCalendar

KST = datetime.timezone(datetime.timedelta(hours=9))
Y0, Y1 = 2020, 2050
OUT = Path(__file__).resolve().parents[2] / "src/data/observances.json"

# (키, 한글명, 태양 황경)
TERMS = [
    ("sohan", "소한", 285), ("daehan", "대한", 300), ("ipchun", "입춘", 315),
    ("usu", "우수", 330), ("gyeongchip", "경칩", 345), ("chunbun", "춘분", 0),
    ("cheongmyeong", "청명", 15), ("gogu", "곡우", 30), ("ipha", "입하", 45),
    ("soman", "소만", 60), ("mangjong", "망종", 75), ("haji", "하지", 90),
    ("soseo", "소서", 105), ("daeseo", "대서", 120), ("ipchu", "입추", 135),
    ("cheoseo", "처서", 150), ("baengno", "백로", 165), ("chubun", "추분", 180),
    ("hallo", "한로", 195), ("sanggang", "상강", 210), ("ipdong", "입동", 225),
    ("soseol", "소설", 240), ("daeseol", "대설", 255), ("dongji", "동지", 270),
]

# 음력 명절 (키, 음력 월, 음력 일)
LUNAR = [("seollal", 1, 1), ("chuseok", 8, 15)]


def sun_lon(dt: datetime.datetime) -> float:
    """UTC 시각의 태양 겉보기 황경(도). 그해 춘분점 기준."""
    d = ephem.Date(dt)
    s = ephem.Sun(d)
    eq = ephem.Equatorial(s.ra, s.dec, epoch=d)
    return float(ephem.Ecliptic(eq, epoch=d).lon) * 180.0 / ephem.pi


def find_term(year: int, target: float) -> datetime.datetime:
    """해당 연도에 태양 황경이 target 도가 되는 UTC 시각을 이분법으로 찾는다."""
    approx = datetime.datetime(year, 1, 1) + datetime.timedelta(days=(target - 280) % 360)
    lo, hi = approx - datetime.timedelta(days=12), approx + datetime.timedelta(days=12)

    def diff(dt: datetime.datetime) -> float:
        return (sun_lon(dt) - target + 180) % 360 - 180

    if diff(lo) > 0:  # 구간이 이미 목표를 지났으면 앞으로 당긴다
        lo -= datetime.timedelta(days=25)
        hi -= datetime.timedelta(days=25)
    for _ in range(60):
        mid = lo + (hi - lo) / 2
        if diff(mid) < 0:
            lo = mid
        else:
            hi = mid
    return lo + (hi - lo) / 2


def verify(table: dict[str, dict[str, str]]) -> int:
    """ephem 내장 함수(독립 경로)와 4대 절기를 대조하고 절기 간격을 점검."""
    builtin = {
        "chunbun": (ephem.next_equinox, "/1/1"), "haji": (ephem.next_solstice, "/5/1"),
        "chubun": (ephem.next_equinox, "/8/1"), "dongji": (ephem.next_solstice, "/11/1"),
    }
    bad = 0
    for key, (fn, start) in builtin.items():
        for y in range(Y0, Y1 + 1):
            ref = (fn(f"{y}{start}").datetime()
                   .replace(tzinfo=datetime.timezone.utc).astimezone(KST).strftime("%m-%d"))
            if table[key].get(str(y)) != ref:
                print(f"  ! {key} {y}: 표={table[key].get(str(y))} 내장={ref}")
                bad += 1
    order = [k for k, _, _ in TERMS]
    for y in range(Y0, Y1 + 1):
        days = [datetime.date(y, *map(int, table[k][str(y)].split("-")))
                for k in order if str(y) in table[k]]
        for a, b in zip(days, days[1:]):
            if not 14 <= (b - a).days <= 16:
                print(f"  ! 절기 간격 이상 {y}: {(b - a).days}일")
                bad += 1
    return bad


def main() -> int:
    out: dict[str, dict[str, str]] = {}
    cal = KoreanLunarCalendar()
    for y in range(Y0, Y1 + 1):
        for key, _name, lon in TERMS:
            kst = find_term(y, lon).replace(tzinfo=datetime.timezone.utc).astimezone(KST)
            if kst.year == y:  # 소한이 연초로 밀리는 등 연도가 어긋나면 건너뛴다
                out.setdefault(key, {})[str(y)] = kst.strftime("%m-%d")
        for key, lm, ld in LUNAR:
            cal.setLunarDate(y, lm, ld, False)
            iso = cal.SolarIsoFormat()
            if iso.startswith(str(y)):
                out.setdefault(key, {})[str(y)] = iso[5:]

    bad = verify(out)
    print(f"검증: 불일치 {bad}건")
    if bad:
        print("검증 실패 — 기록하지 않았습니다.")
        return 1

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1, sort_keys=True) + "\n",
                   encoding="utf-8")
    print(f"생성 완료: {len(out)}항목 × {Y1 - Y0 + 1}년 → {OUT.relative_to(OUT.parents[2])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
