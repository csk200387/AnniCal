"""generate_regional.py 회귀 테스트 (표준 라이브러리 unittest, ephem 필요).

    tmp/obs-venv/bin/python -m unittest tools/observances/test_generate_regional.py
"""
from __future__ import annotations

import datetime as dt
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import generate_regional as g  # noqa: E402

D = dt.date


def hko(year: int) -> str:
    return g.hko_text(year)


class HkoParser(unittest.TestCase):
    def test_autumn_equinox_utc8(self):
        self.assertEqual(g.hko_autumn_equinox(hko(2041))[0], D(2041, 9, 22))  # 한국 chubun 은 09-23
        self.assertEqual(g.hko_autumn_equinox(hko(2026))[0], D(2026, 9, 23))
        self.assertEqual(g.hko_autumn_equinox(hko(2028))[0], D(2028, 9, 22))

    def test_lunar_8_14(self):
        self.assertEqual(g.hko_lunar_8_14(hko(2040))[0], D(2040, 9, 19))  # 한국 chuseok-1 은 09-20
        self.assertEqual(g.hko_lunar_8_14(hko(2026))[0], D(2026, 9, 24))
        self.assertEqual(g.hko_lunar_8_14(hko(2027))[0], D(2027, 9, 14))
        self.assertEqual(g.hko_lunar_8_14(hko(2028))[0], D(2028, 10, 2))

    def test_quoted_line_is_literal_source_line(self):
        _, line = g.hko_lunar_8_14(hko(2040))
        self.assertIn(line, hko(2040).splitlines())
        self.assertTrue(line.startswith("2040/9/19 14 "))
        _, line = g.hko_autumn_equinox(hko(2041))
        self.assertEqual(line, "2041/9/22 27 Sunday Autumnal Equinox")

    def test_leap_8th_month_uses_first_label(self):
        rows = ["2052/8/1 1 Thursday"]
        rows += ["2052/8/23 8th Lunar Month Friday"]
        rows += [f"2052/8/{d} {d - 22} Friday" for d in range(24, 32)]
        rows += [f"2052/9/{d} {d + 9} Friday" for d in range(1, 21)]
        rows += ["2052/9/21 8th Lunar Month Saturday"]  # 윤8월 — 같은 이름이 반복된다
        rows += [f"2052/9/{d} {d - 20} Saturday" for d in range(22, 31)]
        self.assertEqual(g.hko_lunar_8_14("\n".join(rows))[0], D(2052, 9, 5))

    def test_raw_fixed_width_and_collapsed_text_agree(self):
        raw = g.HKO_DIRS[0] / "hko-T2040e.html"   # 원 응답(로컬 전용, gitignored)
        if not raw.exists():
            self.skipTest("raw HKO copy not present")
        text = raw.read_text(encoding="utf-8")
        self.assertEqual(g.hko_lunar_8_14(text)[0], g.hko_lunar_8_14(hko(2040))[0])
        self.assertEqual(g.hko_autumn_equinox(text)[0], g.hko_autumn_equinox(hko(2040))[0])

    def test_missing_rows_raise(self):
        with self.assertRaises(ValueError):
            g.hko_autumn_equinox("2041/9/22 27 Sunday")
        with self.assertRaises(ValueError):
            g.hko_lunar_8_14("2041/9/22 27 Sunday")


class Japan(unittest.TestCase):
    def test_mountain_day_rule_and_olympic_exceptions(self):
        self.assertEqual(g.jp_mountain_day(2020), D(2020, 8, 10))
        self.assertEqual(g.jp_mountain_day(2021), D(2021, 8, 8))  # 8/9 는 대체휴일이지 산의 날이 아니다
        self.assertEqual(g.jp_mountain_day(2022), D(2022, 8, 11))
        self.assertEqual(g.jp_mountain_day(2069), D(2069, 8, 11))

    def test_cabinet_office_csv_matches_rule(self):
        actual = g.cao_mountain_days()
        self.assertEqual(actual[2020], D(2020, 8, 10))
        self.assertEqual(actual[2021], D(2021, 8, 8))
        for y, d in actual.items():
            self.assertEqual(g.jp_mountain_day(y), d, y)


class Ephem(unittest.TestCase):
    def test_independent_calculation_matches_known_regressions(self):
        self.assertEqual(g.ephem_autumn_equinox(2041), D(2041, 9, 22))
        self.assertEqual(g.ephem_lunar_8_14(2040), D(2040, 9, 19))

    def test_2033_problem_follows_winter_solstice_rule(self):
        # 2033년은 추분이 9월(본달 9월)에 들고 8월엔 중기가 없다. '추분이 든 달=8월'로
        # 세면 10-06 이 나오지만, 동지 기준 12개월 해라 윤달이 없고 8월은 08-25 시작이다.
        self.assertEqual(g.hko_lunar_8_14(hko(2033))[0], D(2033, 9, 7))
        self.assertEqual(g.ephem_lunar_8_14(2033), D(2033, 9, 7))


class Table(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.table = g.build()

    def test_three_keys_fifty_years(self):
        self.assertEqual(sorted(self.table), sorted(g.KEYS))
        years = [str(y) for y in range(2020, 2070)]
        for key, row in self.table.items():
            self.assertEqual(list(row), years, key)
            for y, md in row.items():
                dt.date(int(y), int(md[:2]), int(md[3:]))  # 실재하는 날짜

    def test_regressions(self):
        self.assertEqual(self.table["chubun-cn"]["2041"], "09-22")
        self.assertEqual(self.table["lunar-08-14-hk"]["2040"], "09-19")
        self.assertEqual(self.table["yama-no-hi-jp"]["2020"], "08-10")
        self.assertEqual(self.table["yama-no-hi-jp"]["2021"], "08-08")

    def test_verify_clean(self):
        self.assertEqual(g.verify(self.table), [])

    def test_merge_keeps_existing_keys_and_format(self):
        path = g.OUT
        before = path.read_text(encoding="utf-8")
        current = json.loads(before)
        merged = g.merge(current, self.table)
        for k, v in current.items():
            if k not in g.KEYS:
                self.assertEqual(merged[k], v, k)
        # 현재 파일을 다시 직렬화하면 바이트 단위로 같아야 한다(generate_observances 와 같은 표기).
        self.assertEqual(g.dumps(current), before)

    def test_merge_refuses_to_touch_other_keys(self):
        with self.assertRaises(ValueError):
            g.merge({"chubun": {"2026": "09-23"}}, {"chubun": {"2026": "09-22"}})


if __name__ == "__main__":
    unittest.main()
