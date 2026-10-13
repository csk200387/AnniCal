"""npm run build 후 dist 의 새 5건 상세·허브 프리렌더를 읽어 검증한다.

    python3 -I scripts/verify_prerender.py   → prerender-check.json
"""
import html
import json
import re
import sys
from pathlib import Path

BATCH = Path(__file__).resolve().parents[1]
ROOT = BATCH.parents[4]
RECORDS = {k: v for k, v in json.loads((BATCH / 'records-final.json').read_text()).items() if not k.startswith('_')}
ROUTES = json.loads((ROOT / 'src/data/routes.json').read_text())
# 빌드 연도(2026) 기준 화면 날짜 — resolveOccurrence 결과(observances 2026 값·고정일)
SHOWN = {'anv-fixed-03-21-marzanna-pl': '3월 21일', 'anv-term-chubun-cn-farmers-harvest-festival': '9월 23일',
         'anv-rel-chuseok-minus1-tai-hang-fire-dragon-hk': '9월 24일', 'anv-fixed-08-11-mountain-day-jp': '8월 11일',
         'anv-rel-ipchun-minus1-setsubun-jp': '2월 3일'}


def text_of(s: str) -> str:
    s = re.sub(r'<script.*?</script>|<style.*?</style>', '', s, flags=re.S)
    return html.unescape(re.sub(r'<[^>]+>', ' ', s))


def main() -> int:
    out, bad = [], []
    for uid, r in RECORDS.items():
        rt = ROUTES[r['id']]
        path = f"/day/{rt['urlDate']}/{rt['slug']}"
        page = (ROOT / 'dist' / path.lstrip('/') / 'index.html').read_text(encoding='utf-8')
        hub = (ROOT / 'dist/day' / rt['urlDate'] / 'index.html').read_text(encoding='utf-8')
        body = ' '.join(text_of(page).split())
        desc = html.unescape(re.search(r'<meta name="description" content="([^"]*)"', page).group(1))
        title = html.unescape(re.search(r'<title>(.*?)</title>', page).group(1))
        st = r['storytelling']
        checks = {
            'title_has_name_and_date': r['name'] in title and SHOWN[r['id']] in title,
            'origin_full_text': ' '.join(st['origin'].split()) in body,
            'anecdote_full_text': ' '.join(st['anecdote'].split()) in body,
            'meta_description_is_origin_prefix': desc.rstrip('…') == st['origin'][:len(desc.rstrip('…'))] and len(desc.rstrip('…')) >= 140,
            'shown_date': SHOWN[r['id']] in body,
            'source_url': r['sourceUrl'] in page,
            'canonical': f'https://www.annical.me{path}' in page,
            'hub_links_detail': f'href="{path}"' in hub,
        }
        out.append({'uid': uid, 'id': r['id'], 'path': path, 'title': title, 'meta_description': desc, **checks})
        bad += [f'{uid}: {k}' for k, v in checks.items() if not v]
    sep = (ROOT / 'dist/day/09-24/separated-families-day/index.html').exists()
    out.append({'separated_families_day_09_24_exists': sep})
    if not sep:
        bad.append('separated-families-day 09-24 사라짐')
    (BATCH / 'prerender-check.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('\n'.join(bad) or f'프리렌더 5건 × {len(checks)}항목 + separated-families 09-24 통과')
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
