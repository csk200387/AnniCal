"""routes.json 에 새 5건만 더한다. generate_slugs.py 를 그대로 돌리면 기존 항목
(separated-families-day 09-24 → 09-23)이 바뀌므로 전체 재생성하지 않는다.

    python3 -I scripts/add_routes.py [--write]
슬러그·urlDate 는 generate_slugs.py 의 함수로 계산해 손으로 정하지 않는다.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[6]
sys.path.insert(0, str(ROOT / 'tools'))
sys.path.insert(0, str(ROOT / 'tools/slugs'))
import generate_slugs as gs  # noqa: E402
from toolkit import atomic_write_text  # noqa: E402

NEW = ['anv-fixed-03-21-marzanna-pl', 'anv-term-chubun-cn-farmers-harvest-festival',
       'anv-rel-chuseok-minus1-tai-hang-fire-dragon-hk', 'anv-fixed-08-11-mountain-day-jp',
       'anv-rel-ipchun-minus1-setsubun-jp']


def main(argv):
    anns = gs.load_anniversaries()
    by_id = {a['id']: a for a in anns}
    overrides = json.loads(gs.OVERRIDES.read_text(encoding='utf-8'))
    before = gs.OUT.read_text(encoding='utf-8')
    routes = json.loads(before)
    assert json.dumps(routes, ensure_ascii=False, indent=2) + '\n' == before, 'routes.json 표기 불일치'
    add = {}
    for i in NEW:
        assert i not in routes, f'이미 있음 {i}'
        a = by_id[i]
        slug = overrides.get(i) or gs.from_id(a) or gs.from_paren(a) or gs.from_source_url(a)
        url_date = gs.resolve_url_date(a, by_id)
        assert gs.is_valid_slug(slug) and gs.is_valid_url_date(url_date), (i, slug, url_date)
        add[i] = {'slug': slug, 'urlDate': url_date}
    taken = {(v['urlDate'], v['slug']) for v in routes.values()}
    clash = [i for i, v in add.items() if (v['urlDate'], v['slug']) in taken]
    assert not clash, f'URL 충돌 {clash}'
    for i, v in add.items():
        print(f'  /day/{v["urlDate"]}/{v["slug"]}  ← {i}')
    merged = dict(sorted({**routes, **add}.items()))
    assert list(merged) == sorted(merged) and list(routes) == sorted(routes)
    assert all(merged[k] == v for k, v in routes.items())
    if '--write' in argv:
        atomic_write_text(gs.OUT, json.dumps(merged, ensure_ascii=False, indent=2) + '\n')
        print(f'routes.json {len(routes)} → {len(merged)}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
