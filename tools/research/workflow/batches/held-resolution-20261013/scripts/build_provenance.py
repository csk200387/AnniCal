"""observances.json 의 지역 3키 150개 값마다 출처·인용·해시·독립 대조를 남긴다.

    tmp/obs-venv/bin/python scripts/build_provenance.py   → date-provenance.json (ephem 필요)
표 값은 다시 계산하지 않고 src/data/observances.json 에 기록된 값을 원문과 대조한다.
"""
import hashlib
import json
import sys
from pathlib import Path

BATCH = Path(__file__).resolve().parents[1]
ROOT = BATCH.parents[4]
sys.path.insert(0, str(ROOT / 'tools/observances'))
import generate_regional as g  # noqa: E402

LOGS = [ROOT / 'tools/research/workflow/batches/priority-editorial-20261012/fetch-log.json', BATCH / 'fetch-log.json']


def sha(p: Path) -> str | None:
    return hashlib.sha256(p.read_bytes()).hexdigest() if p.exists() else None


def main() -> int:
    table = json.loads((ROOT / 'src/data/observances.json').read_text(encoding='utf-8'))
    fetch = {}
    for log in LOGS:
        for e in json.loads(log.read_text(encoding='utf-8')):
            fetch[e['label']] = (log.parent, e)
    cao = g.cao_mountain_days()
    bad, rows = [], {k: [] for k in g.KEYS}
    for y in range(g.Y0, g.Y1 + 1):
        label = f'hko-T{y}e'
        base, e = fetch[label]
        txt, raw = base / e['text_path'], base / e['raw_path']
        text = txt.read_text(encoding='utf-8')
        src = {'url': e['url'], 'accessed_at': e['accessed_at'], 'http_status': e['status'],
               'text_path': str(txt.relative_to(ROOT)), 'text_sha256': sha(txt),
               'raw_path': str(raw.relative_to(ROOT)), 'raw_sha256_fetch_log': e['sha256'],
               'raw_present_and_matches': sha(raw) == e['sha256'],
               'raw_reused_from_previous_batch': base != BATCH}
        for key, (d, line), ref in (('chubun-cn', g.hko_autumn_equinox(text), g.ephem_autumn_equinox(y)),
                                    ('lunar-08-14-hk', g.hko_lunar_8_14(text), g.ephem_lunar_8_14(y))):
            v = table[key][str(y)]
            ok = v == f'{d:%m-%d}' == f'{ref:%m-%d}' and line in text.splitlines()
            rows[key].append({'year': y, 'value': v, 'quote': line, **src,
                              'independent_ephem_utc8': f'{ref:%m-%d}', 'parse_and_crosscheck_ok': ok,
                              'kind': 'HKO 공식 대조표(천문 계산; 수집일 이후 연도는 예측값)'})
            if not ok:
                bad.append(f'{key} {y}')
        v = table['yama-no-hi-jp'][str(y)]
        exp = g.jp_mountain_day(y)
        if y in (2020, 2021):
            kind, quote, path = '내각부 공표 특례(도쿄올림픽 특별조치법)', {2020: '山の日 ８月１０日', 2021: '山の日 ８月８日（※）'}[y], \
                'tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-keiro-no-hi/cao-gaiyou.txt'
        elif y in cao:
            kind, quote, path = '내각부 syukujitsu.csv 공표값', f'{y}/8/11,山の日', str(g.CAO_CSV.relative_to(ROOT))
        else:
            kind, quote, path = '현행 祝日法 제2조 규칙 투영(법 개정·특례 시 달라짐)', '山の日\n八月十一日', \
                'tools/research/workflow/batches/held-resolution-20261013/evidence/jp-yama-no-hi/egov-law-323AC1000000178.txt'
        ok = v == f'{exp:%m-%d}' and (y not in cao or cao[y] == exp) and quote in (ROOT / path).read_text(encoding='utf-8')
        rows['yama-no-hi-jp'].append({'year': y, 'value': v, 'kind': kind, 'quote': quote, 'text_path': path,
                                      'text_sha256': sha(ROOT / path), 'cao_csv': f'{cao[y]:%m-%d}' if y in cao else None,
                                      'parse_and_crosscheck_ok': ok})
        if not ok:
            bad.append(f'yama-no-hi-jp {y}')
    korea = {'chubun-cn': ('chubun', 0), 'lunar-08-14-hk': ('chuseok', -1)}
    import datetime as dt
    diffs = {}
    for key, (kr, off) in korea.items():
        diffs[key] = []
        for y in range(2020, 2051):
            m, d = map(int, table[kr][str(y)].split('-'))
            kr_v = (dt.date(y, m, d) + dt.timedelta(days=off)).strftime('%m-%d')
            if kr_v != table[key][str(y)]:
                diffs[key].append({'year': y, 'local': table[key][str(y)], f'korean_{kr}{off or ""}': kr_v})
    out = {
        '_note': '지역 3키 날짜 출처. HKO 표는 UTC+8 공식 천문 계산표, 일본은 법·내각부 공표. 미래 연도는 예측·규칙 투영이며 정부의 향후 특례 이동은 별개다.',
        'keys': {
            'chubun-cn': {'meaning': '중국 추분(中国农民丰收节)', 'timezone': 'UTC+8', 'source': 'HKO Gregorian-Lunar Calendar Conversion Table T{YYYY}e.txt',
                          'crosscheck': 'ephem.next_equinox → UTC+8 날짜'},
            'lunar-08-14-hk': {'meaning': '홍콩 음력 8월 14일(大坑舞火龍 첫날)', 'timezone': 'UTC+8', 'source': 'HKO 표의 첫 "8th Lunar Month" 행 + 13일, 그날 음력일 14 확인',
                               'crosscheck': 'GB/T 33661-2017 규칙(동지월=11월, 13개월이면 첫 무중기월 윤달)으로 ephem 삭·중기 계산. 2033년은 추분이 9월에 들어 단순 규칙이 틀린다.'},
            'yama-no-hi-jp': {'meaning': '일본 산의 날', 'timezone': 'JST(날짜 규칙)', 'source': '祝日法 제2조(e-Gov API), 내각부 gaiyou·syukujitsu.csv',
                              'crosscheck': '내각부 csv 2020~2027 공표값과 규칙 일치'},
        },
        'korean_key_differences_2020_2050': diffs,
        'failures': bad,
        'values': rows,
    }
    (BATCH / 'date-provenance.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'값 {sum(len(v) for v in rows.values())}개, 실패 {len(bad)}', bad)
    print('한국 키와 다른 해:', {k: [x['year'] for x in v] for k, v in diffs.items()})
    print('원 응답 사본 해시 일치:', sum(r['raw_present_and_matches'] for r in rows['chubun-cn']), '/ 50')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
