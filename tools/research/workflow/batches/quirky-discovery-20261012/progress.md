# quirky-discovery-20261012 진행 기록

작업자: Claude Code (Opus 5.5) · 시작 2026-10-12 · 범위: 비공식·장난·밈·말장난·관계·물건·취미·미신 기념일 **발견** 조사
금지 준수: 서비스 JSON 수정·commit·push·배포 없음. 기존 footer·기존 연구 배치 수정 없음.

## 1. 읽은 기준 문서
- CLAUDE.md, README.md, .claude/skills/anniversary-enrichment/SKILL.md, docs/plans/data-research-workflow.md
- src/types/anniversary.ts, src/data/categories.json, src/data/anniversaries/01~12.json (1,756건, quirky 168건)
- 기존 배치: 2026-10-11-sparse-birthdays, 2026-10-11-history-expansion, contact-expansion-20261012 (읽기만)
- scripts/fetch.py 는 contact-expansion 배치의 수집기를 복사해 이 배치 경로에 쓰도록 둔 것(원 배치 파일은 수정 안 함)

## 2. 1차 중복 스캔 (키워드, 서비스 데이터)
이미 있음 → 후보에서 제외: 잃어버린 양말(05-09), 발가락 꼼지락(08-06), 몰래 주키니(08-08), 페스티버스(12-23),
시어머니·장모님의 날, 스위티스트 데이, 여자친구들의 날, 14일 시리즈(다이어리~허그), 고백데이(09-17), 애인의 날(06-12),
윤일 청혼의 날(02-29), 타월·호빗·몰·검은 고양이·UFO·성촉절·파이·스타워즈·마리오·이모지·프로그래머·해먹·카주·요요·클립·
러버덕·세계 화장실·세계 닌자(12-05)·잠옷 출근·바탕화면 정리·셰익스피어처럼 말하기·귀의 날·한자의 날·이불 정리.

## 3. 검색 기록 (실시간)
- 영어·일본어·한국어 WebSearch 34회 (`search-log.json`). 결과는 모두 "검색결과만" 단계로 기록하고, 인용은 원문을 직접 받은 뒤에만 함.
- 1차 "Yell Fudge at the Cobras" 검색 0건 → 검색어 바꿔 2차에서 Goodreads 블로그 1건 발견(날짜 없음) → 원문 타임아웃, 재시도 안 함 → blocked.
- "National Superstition Day" 는 존재 근거 없음 → 대신 Defy Superstition Day(9/13) 발견.
- "くしの日 = 苦死" 연관은 검색·원문 어디에도 없어 기록하지 않음.

## 4. 원문 수집 (`scripts/urls.tsv` → `scripts/fetch.py`, 61회)
- 403: timeanddate 3건, wnep, tabi-mag, awarenessdays / 404: bossierpress / 503: bestcalendar(告白) / 타임아웃: goodreads / 빈 본문: brusselstimes
- HTTP 200 오판 2건 수동 재분류: theweek(Access Denied 안내문), nissyoku(告白の日 언급 없음)
- 告白の日 은 대체 원문(netlab)으로 1회 보강. 차단된 같은 URL 은 다시 요청하지 않음.

## 5. 기록·검증
- `scripts/build_records.py` → records.json (후보 29 + 기존 중복 15)
- `scripts/verify.mjs` 1회차: 인용 81/81 일치였으나 중복 대조에서 기존 `anv-fixed-12-18-ugly-christmas-sweater-day-global`,
  `anv-fixed-05-05-sith-day-global` 발견(1차 키워드 스캔 누락) → 두 후보를 duplicate 로 전환 후 재실행 ok=true.
- `scripts/render_report.py` → report.md (건수는 records·verification 에서 집계)

## 6. 완료 (2026-10-12)
서비스 JSON·routes·slug 미수정, commit·push·배포 없음. 승인·반영 단계 아님.
