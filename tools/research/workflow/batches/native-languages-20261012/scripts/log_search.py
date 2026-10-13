"""WebSearch 1회를 실행 직후 search-log.json 에 덧붙인다.

    python3 -I scripts/log_search.py <country> <language> <query> <note> [url ...]

query 는 실제 WebSearch 에 넣은 문자열 그대로, url 은 결과에 나온 URL 그대로 적는다.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

LOG = Path(__file__).resolve().parent.parent / 'search-log.json'

country, language, query, note, *urls = sys.argv[1:]
log = json.loads(LOG.read_text()) if LOG.exists() else []
log.append({'seq': len(log) + 1, 'country': country, 'language': language, 'query': query,
            'tool': 'WebSearch(standard)', 'executed_by': 'Claude Code',
            'logged_at': datetime.now(timezone.utc).isoformat(timespec='seconds'),
            'result_urls': urls, 'note': note})
LOG.write_text(json.dumps(log, ensure_ascii=False, indent=1) + '\n')
print(f'logged #{len(log)} {country}/{language}: {len(urls)} urls')
