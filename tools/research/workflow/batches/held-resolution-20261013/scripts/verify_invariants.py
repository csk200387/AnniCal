"""기준 스냅샷(baseline/) 대비 불변 조건 검사. 부모 검수자가 독립 재실행할 수 있게 둔다.

    python3 -I scripts/verify_invariants.py   → invariants.json
"""
import glob
import hashlib
import json
import sys
from pathlib import Path

BATCH = Path(__file__).resolve().parents[1]
ROOT = BATCH.parents[4]
NEW_IDS = {'anv-fixed-03-21-marzanna-pl', 'anv-term-chubun-cn-farmers-harvest-festival',
           'anv-rel-chuseok-minus1-tai-hang-fire-dragon-hk', 'anv-fixed-08-11-mountain-day-jp',
           'anv-rel-ipchun-minus1-setsubun-jp'}
NEW_KEYS = ['chubun-cn', 'lunar-08-14-hk', 'yama-no-hi-jp']
DUP_TERMS = ['세쓰분', '節分', 'setsubun', '산의 날', '山の日', 'mountain', '마르자나', 'marzann', '풍수절', '丰收', 'harvest',
             '불용', '火龍', '火龙', 'fire-dragon', 'fire dragon']


def load(pattern):
    return [a for f in sorted(glob.glob(str(pattern))) for a in json.loads(Path(f).read_text(encoding='utf-8'))]


def main() -> int:
    base, now = load(BATCH / 'baseline/anniversaries/*.json'), load(ROOT / 'src/data/anniversaries/*.json')
    b_by, n_by = {a['id']: a for a in base}, {a['id']: a for a in now}
    b_routes = json.loads((BATCH / 'baseline/routes.json').read_text())
    n_routes = json.loads((ROOT / 'src/data/routes.json').read_text())
    b_obs = json.loads((BATCH / 'baseline/observances.json').read_text())
    n_obs = json.loads((ROOT / 'src/data/observances.json').read_text())
    url_pairs = [(v['urlDate'], v['slug']) for v in n_routes.values()]
    related = {i: sorted({a['id'] for a in base for t in DUP_TERMS
                          if t.lower() in (a['name'] + ' ' + a['id'] + ' ' + (a.get('sourceUrl') or '')).lower()
                          and t.lower() in (n_by[i]['name'] + ' ' + i + ' ' + (n_by[i].get('sourceUrl') or '')).lower()})
               for i in sorted(NEW_IDS)}
    r = {
        'baseline_total': len(base), 'after_total': len(now), 'unique_ids': len(n_by),
        'added_ids_exact': sorted(set(n_by) - set(b_by)) == sorted(NEW_IDS),
        'removed_ids': sorted(set(b_by) - set(n_by)),
        'baseline_objects_unchanged': all(n_by.get(i) == a for i, a in b_by.items()),
        'baseline_routes_unchanged': all(n_routes.get(i) == v for i, v in b_routes.items()),
        'routes_total': len(n_routes), 'routes_added': sorted(set(n_routes) - set(b_routes)),
        'url_unique': len(url_pairs) == len(set(url_pairs)),
        'separated_families_day': n_routes['anv-rel-chuseok-minus1-separated-families-day-kr'],
        'observances_existing_38_unchanged': all(n_obs.get(k) == v for k, v in b_obs.items()) and list(n_obs)[:38] == list(b_obs),
        'observances_keys': len(n_obs), 'observances_added': [k for k in n_obs if k not in b_obs],
        'regional_years': {k: [min(n_obs[k]), max(n_obs[k]), len(n_obs[k])] for k in NEW_KEYS},
        'baseline_sha256_observances': hashlib.sha256((BATCH / 'baseline/observances.json').read_bytes()).hexdigest(),
        'related_existing_by_keyword': related,
    }
    ok = (r['after_total'] == 1815 and r['unique_ids'] == 1815 and r['added_ids_exact'] and not r['removed_ids']
          and r['baseline_objects_unchanged'] and r['baseline_routes_unchanged'] and r['routes_total'] == 1815
          and r['url_unique'] and r['separated_families_day'] == {'slug': 'separated-families-day', 'urlDate': '09-24'}
          and r['observances_existing_38_unchanged'] and r['observances_added'] == NEW_KEYS
          and all(v == ['2020', '2069', 50] for v in r['regional_years'].values()))
    r['ok'] = ok
    (BATCH / 'invariants.json').write_text(json.dumps(r, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(r, ensure_ascii=False, indent=1))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
