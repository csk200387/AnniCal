"""원문 수집기. 받은 바이트를 그대로 evidence/<key>/<label>.<ext> 에 저장하고
같은 이름의 .txt 에 공백을 정리한 본문 텍스트를 만든다. 결과는 fetch-log.json 에 추가.

    python3 -I scripts/fetch.py <candidate_key> <label> <url>

받은 파일은 실행하지 않는다. 실패(HTTP 오류·차단·빈 본문)는 blocked 로 기록한다.
"""
import hashlib
import http.client
import html
import json
import re
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
LOG = BATCH / 'fetch-log.json'
UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129 Safari/537.36'


class Text(HTMLParser):
    SKIP = {'script', 'style', 'noscript', 'svg', 'template'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.parts, self.depth = [], 0

    def handle_starttag(self, tag, attrs):
        if tag in self.SKIP:
            self.depth += 1
        elif tag in {'p', 'br', 'div', 'li', 'h1', 'h2', 'h3', 'h4', 'tr', 'section', 'article', 'td', 'dd', 'dt'}:
            self.parts.append('\n')

    def handle_endtag(self, tag):
        if tag in self.SKIP and self.depth:
            self.depth -= 1

    def handle_data(self, data):
        if not self.depth:
            self.parts.append(data)


def to_text(raw: bytes, ctype: str, path: Path) -> str:
    if 'pdf' in ctype or raw[:5] == b'%PDF-':
        out = subprocess.run(['pdftotext', '-layout', '-enc', 'UTF-8', str(path), '-'], capture_output=True, check=True)
        text = out.stdout.decode('utf-8', 'replace')
    else:
        m = re.search(r'charset=([\w-]+)', ctype) or re.search(rb'<meta[^>]+charset=["\']?([\w-]+)', raw[:4000])
        enc = m.group(1) if m else 'utf-8'
        enc = enc.decode() if isinstance(enc, bytes) else enc
        try:
            s = raw.decode(enc, 'replace')
        except LookupError:
            s = raw.decode('utf-8', 'replace')
        p = Text()
        p.feed(s)
        text = html.unescape(''.join(p.parts))
    lines = [re.sub(r'[ \t 　]+', ' ', ln).strip() for ln in text.splitlines()]
    return '\n'.join(ln for ln in lines if ln) + '\n'


def main(key: str, label: str, url: str) -> None:
    out_dir = BATCH / 'evidence' / key
    out_dir.mkdir(parents=True, exist_ok=True)
    entry = {'candidate_key': key, 'label': label, 'url': url,
             'accessed_at': datetime.now(timezone.utc).isoformat(timespec='seconds')}
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept-Language': 'fr,de,es,pt,pl,tr,th,zh-TW;q=0.9,en;q=0.5'})
        with urllib.request.urlopen(req, timeout=25) as r:
            raw, ctype, status, final = r.read(), r.headers.get('Content-Type', ''), r.status, r.geturl()
        ext = 'pdf' if ('pdf' in ctype or raw[:5] == b'%PDF-') else 'html'
        raw_path = out_dir / f'{label}.{ext}'
        raw_path.write_bytes(raw)
        text = to_text(raw, ctype, raw_path)
        txt_path = out_dir / f'{label}.txt'
        txt_path.write_text(text, encoding='utf-8')
        entry.update(status=status, final_url=final, content_type=ctype, bytes=len(raw),
                     sha256=hashlib.sha256(raw).hexdigest(), text_chars=len(text),
                     raw_path=str(raw_path.relative_to(BATCH)), text_path=str(txt_path.relative_to(BATCH)),
                     access_status='body_read_http_200' if status == 200 and len(text) > 200 else 'blocked_empty_body')
    except (urllib.error.URLError, http.client.HTTPException, TimeoutError, OSError, subprocess.CalledProcessError) as e:
        entry.update(access_status='blocked', error=f'{type(e).__name__}: {getattr(e, "code", "")} {e}'.strip())
    log = json.loads(LOG.read_text()) if LOG.exists() else []
    log.append(entry)
    LOG.write_text(json.dumps(log, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({k: entry.get(k) for k in ('candidate_key', 'label', 'access_status', 'status', 'text_chars', 'error')}, ensure_ascii=False))


if __name__ == '__main__':
    main(*sys.argv[1:4])
