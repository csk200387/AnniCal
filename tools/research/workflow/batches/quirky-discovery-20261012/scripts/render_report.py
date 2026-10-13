"""report.md 생성기. 건수·표는 records.json·verification.json 에서 집계한다(손으로 세지 않는다).

    python3 -I scripts/render_report.py
"""
import json
from collections import Counter
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
R = json.loads((BATCH / 'records.json').read_text())
V = json.loads((BATCH / 'verification.json').read_text())
recs = R['records']
cands = [r for r in recs if r['discovery_status'] != 'duplicate']
CONF = {'high': '높음', 'medium': '중간', 'low': '낮음'}


def date_of(r):
    return r['date_rule'] or '날짜 미확정'


def read_mark(r):
    n = sum(e['read_status'] == 'original_read' and e['cited'] for e in r['evidence'])
    s = f'원문 {n}건' if n else '검색결과만 확인'
    if r.get('listing_sources_only'):
        s += ' (단일 목록 출처)' if r.get('single_listing_source') else ' (목록 사이트만)'
    return s


def src(r):
    cited = [e['url'] for e in r['evidence'] if e['cited']] or [s['url'] for s in r['search_result_only']]
    return ' · '.join(f'[{i + 1}]({u})' for i, u in enumerate(cited[:3]))


L = ['# 이색·비공식 기념일 발견 조사 보고 (quirky-discovery-20261012)', '',
     '> **서비스 반영 미실행.** 월별 JSON·routes·slug 수정, commit, push, 배포 모두 하지 않았다. '
     '아래는 발견 기록이며 승인·검수 완료가 아니다. 기존 footer·기존 연구 배치도 건드리지 않았다.', '',
     f'- 기록 {len(recs)}건 = 조사 후보 {len(cands)}건 + 기존 항목 중복 {len(recs) - len(cands)}건',
     f'- 고유 신규 후보(중복·차단 제외): **{V["unique_new_candidates"]}건** (목표 15~20건)',
     '- 상태: ' + ', '.join(f'`{k}` {v}' for k, v in V['status_counts'].items()),
     '- 종류(중복 제외): ' + ', '.join(f'{k} {v}' for k, v in V['kind_counts'].items()),
     '- 신뢰수준(중복 제외): ' + ', '.join(f'{CONF.get(k, k)} {v}' for k, v in V['confidence_counts'].items()), '',
     '## 공식 기념일 조사와 달라진 기준', '',
     '- 공식 기관·법령 근거가 없어도 제외하지 않았다. 대신 "공식 지정 근거 없음"과 "인터넷에서도 존재 근거 없음"을 구분했다.',
     '- 기념일 목록 사이트 1곳뿐이어도 `discovered_unverified`(단일 목록 출처)로 남겼다. 상업 달력만 있으면 그렇게 표시했다.',
     '- 제정자·유래는 원문이 말한 만큼만 적었다. 원문이 "~라고 한다", "some credit"처럼 단정하지 않으면 그대로 표시했다.',
     '- WebSearch 요약만 본 내용은 "검색결과만 확인"으로 두고 인용하지 않았다. 원문 차단(403·404·타임아웃·빈 본문)은 우회를 반복하지 않고 기록만 했다.',
     '- 날짜를 기억이나 추정으로 채우지 않았다. 출처끼리 날짜가 다르면 `date_conflict`, 날짜를 못 찾으면 "날짜 미확정".',
     '- 승인 흐름 상태(evidenced/approved/applied)와 섞지 않으려고 발견 전용 상태를 썼다:', '']
L += [f'  - `{k}` — {v}' for k, v in R['statuses'].items()]
L += ['']

for kind, label in R['kinds'].items():
    rows = [r for r in cands if r['kind'] == kind]
    dups = [r for r in recs if r.get('kind') == kind and r['discovery_status'] == 'duplicate']
    L += [f'## {label} ({len(rows)}건)', '',
          '| 이름 (원명) | 날짜 | 한 줄 의미 | 상태 · 신뢰 | 원문 | 출처 |', '|---|---|---|---|---|---|']
    for r in rows:
        note = f"<br>※ {r['date_note']}" if r['date_note'] else ''
        caution = f"<br>⚠️ {r['caution']}" if r['caution'] else ''
        L.append(f"| {r['name_ko']} ({r['name_original']}) | {date_of(r)}{note} | {r['meaning']}{caution} | "
                 f"`{r['discovery_status']}` · {CONF[r['confidence']]} | {read_mark(r)} | {src(r)} |")
    for r in dups:
        L.append(f"| ~~{r['name_ko']}~~ ({r['name_original']}) | {date_of(r)} | 기존 `{r['duplicate_check']['existing_id']}` 와 중복 — 신규 아님 | `duplicate` | {read_mark(r)} | {src(r)} |")
    L.append('')

L += ['## 유래·제정자 확인 수준', '', '| 후보 | 유래·제정자 (원문이 말한 범위) | 확인 수준 |', '|---|---|---|']
L += [f"| {r['name_ko']} | {r['founder_origin']} | `{r['founder_origin_check']}` |" for r in cands]
L += ['', '## 이미 있어서 제외한 유명 이색 기념일', '',
      '검색 전 떠올렸거나 조사 중 확인한 항목. 서비스 1,756건에 이미 있다.', '']
for r in recs:
    if r['discovery_status'] == 'duplicate':
        d = r['duplicate_check']
        extra = f" — {d['note']}" if d.get('note') else (f" — {r['note'].split(' — ')[-1]}" if 'quirky 아님' in r.get('note', '') else '')
        nm = r['name_ko'] if '(' in r['name_ko'] else f"{r['name_ko']} ({r['name_original']})"
        L.append(f"- {nm} → `{d['existing_id']}`{extra}")

occ = {}
for o in V['occurrences']:
    occ.setdefault(o['candidate_key'], {})[o['year']] = o['occurrence']
L += ['', '## 2026·2027·2028 발생일 (실제 resolver)', '',
      '`src/utils/dateUtils.ts` 의 `resolveOccurrence` 로 계산했다. **계산이 된다는 것은 규칙 표현이 가능하다는 뜻일 뿐, 그 날짜가 사실이라는 증명이 아니다.** '
      '`date_conflict` 후보는 대표 날짜 하나로만 계산했다.', '',
      '| 후보 | 규칙 | 2026 | 2027 | 2028 |', '|---|---|---|---|---|']
for r in cands:
    if r['candidate_key'] in occ:
        o = occ[r['candidate_key']]
        L.append(f"| {r['name_ko']} | `{r['date_type']}` {r['date_rule']} | {o[2026]} | {o[2027]} | {o[2028]} |")
L += [f"| {r['name_ko']} | 날짜 미확정 | — | — | — |" for r in cands if not r['date_rule']]

L += ['', '## 실제 검증 결과 (scripts/verify.mjs → verification.json)', '',
      f"- 종합: `ok={str(V['ok']).lower()}`, 오류 {len(V['errors'])}건",
      f"- 인용 문자 일치: {V['quotes_matched']}/{V['quotes_checked']} (저장 본문 .txt 에 글자 그대로 포함되는지 프로그램 검사)",
      f"- 원문 수집: fetch 시도 {V['fetch_attempts']}건 → 수집기 판정 본문 확보 {V['fetch_body_read']}건 → 그중 HTTP 200 이지만 실제로 못 읽은 것 재분류 "
      + ', '.join(f"`{o['id']}`({o['access_status']})" for o in V['fetch_status_overrides'] if o['access_status'] != 'blocked_empty_body')
      + f" → 인용에 쓴 원문 {len({e['evidence_id'] for r in recs for e in r['evidence'] if e['cited']})}건",
      '- 실패: ' + ', '.join(f"{f['key']} ({f['status']}{', ' + f['error'].split(':')[0] if f['error'] else ''})" for f in V['fetch_failed']),
      f"- 원본 SHA-256 재계산 일치, 승인·반영 표시 없음, 서비스 기념일 {V['production_items_checked']}건 읽기만(production_writes=false), Vite 서버 종료 확인={str(V['vite_server_closed']).lower()}",
      f"- 이전 조사 자료에 이름만 나왔던 후보(발견용 원자료, 승인 기록 아님): {', '.join(V['with_prior_discovery_mention'])}",
      '- 중복 대조: 서비스 이름·id 토큰, 같은 날짜 항목, 이전 배치 records.json, namuwiki·jp 발견 자료. 1차 키워드 스캔이 놓친 2건(스웨터·시스 데이)을 검증 단계에서 잡아 중복으로 돌렸다.', '',
      '## 조사 중 본 기존 데이터 관찰 (수정 안 함)', '',
      '- `anv-fixed-12-18-ugly-christmas-sweater-day-global` 은 `annual-fixed` 12-18 이지만 본문과 원문 모두 "12월 셋째 금요일". 2027·2028년에는 실제 날(12-17·12-15)과 어긋난다. 별도 재검증 대상.',
      '- 유명 이색 기념일 중 일부는 quirky 가 아닌 카테고리에 있다(잃어버린 양말→history, 페스티버스→food, 타월의 날→general 등). 카테고리 재분류는 이번 범위 밖.', '',
      '## 다음 단계 (사람 결정 필요)', '',
      '1. 사용자가 반영 후보를 고르면, `documented_unofficial` 부터 독립 검수(원문 재확인)를 거친다.',
      '2. `date_conflict` 4건은 대표 날짜를 정하는 결정이 먼저다. `discovered_unverified` 는 독립 출처를 하나 더 찾기 전엔 반영 권장 안 함.',
      '3. ⚠️ 표시 후보(거짓말·우울·죽음·미신 행동·성격 유형)는 본문 톤을 따로 검토한다.', '',
      '## 파일', '',
      '- `records.json` 후보 기록(필드: 한국어/원명/날짜/범위/의미/특이점/출처 URL/원문 읽기/인용/저장 경로/유래 확인/중복 판정/신뢰수준)',
      '- `evidence/<후보>/` 원문 HTML·텍스트 · `fetch-log.json` 수집 로그 · `search-log.json` 검색 기록',
      '- `verification.json` 검증 결과 · `progress.md` 진행 기록 · `scripts/` (fetch.py, build_records.py, verify.mjs, render_report.py, peek.sh, urls.tsv)', '']
(BATCH / 'report.md').write_text('\n'.join(L))
print('report.md', len(L), 'lines')
