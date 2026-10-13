# 보류 5개 반영 — 사용자 날짜 처리 승인

사용자 지시:
1. 마르자나: 3월21일로 표기, 실제로는 그 날짜가 흔한 관행이고 다른 날에도 열린다는 점을 본문에 밝힌다.
2. 중국 농민 풍수절: 50년 날짜 표를 미리 만들고 기존 선례를 활용한다.
3. 홍콩 다이항 불용춤: 2와 동일.
4. 일본 산의 날: 2와 동일. 2020·2021 예외 포함.
5. 세쓰분: 대표 날짜를 쓰되 그 시기에 열린다는 표현을 본문에 명확히 한다.

## 이미 확인한 선례
src/data/observances.json 38키는 각 2020~2050년 31년 MM-DD 값을 저장한다. 설날/추석/24절기 annual-tabulated, resolveOccurrence는 키와 year로 값을 조회한다. tools/observances/generate_observances.py가 기존 생성기이며 add_entries.py는 신규 table/fixed/nth 엔트리 삽입 도구. 한국 표 전체 재생성 금지.

## 승인 범위
- 5개 로컬 서비스 데이터 추가 및 본문 교정, 필요한 신규 날짜 표·생성/검증 도구·회귀 테스트, routes와OG폰트/이미지/OG버전 갱신, 보고서 상태 최신화.
- 50년 범위는 2020~2069(양끝 포함)로 선택. 과거 일본2020/2021 예외 포함해야 하므로 기존표 시작2020을 따른다.
- 중국 추분(UTC+8), 홍콩 음력8월14일(UTC+8), 일본 산의 날(08-11 일반/2020-08-10/2021-08-08) 각각 새 observances 키. 한국 chubun/chuseok 등 모든 기존 키·값 보존.
- 마르자나 annual-fixed03-21: 본문 첫150자 내 '대표 날짜'/'실제 행사는 다른 날에도' 등 핵심 날짜 유보 명시, 봄맞이 풍습으로 설명. sourceUrl 원문 오타 수정, 지역 조건/과거 시제 교정.
- 세쓰분 annual-fixed02-03: 달력은 대표 날짜로2월3일표시, 실제는 입춘전날이라2월초/해마다다름(확인된2025년2월2일). origin 첫150자 내 날짜 정확성 한계 명시. 실제행사 매년2/3이라는 허위서술금지. 사용자 승인 대표일 표기이며 실제 발생일 검증 완료로 기록하지 않는다.
- 미래 날짜 표는 현행법·공식천문/역법 자료를 기준으로 한 예측·규칙임을 출처 기록에 구분. 달력 검증과 향후 정부 특별일 이동은 별개다.

## 자료와 검수 기록
priority-editorial-20261012/drafts.json 및 drafts-round2.json에 전체 초안. reviews-2.json(마르자나), reviews-3.json(나머지4)에 보류 이유/교정사항. evidence-map.json 및 evidence-map-round2.json이 실제 원문 근거. priority-editorial/evidence/_shared-hko-calendar에2020~2050HKO본문31개와메타자료 있음. 추가 현지어검색은 Claude Code로 수행. 2069까지 홍콩천문대 공식 Gregorian-Lunar conversion table 또는 동등한 현지 공식/검증가능한 천문 계산 자료로 수집. 기존원문은재활용하고부족한19년만추가수집. 데이터 출처URL/접근일/지역시간대/정확인용/원문경로/해시/파싱검증을 보존, 수동가짜날짜 생성금지. 2040/2041 불일치 회귀검증 필수.

## 구현·검증
- 현재데이터1810개/우선검토54반영5보류. 모든 미커밋변경 보존하고5개기존ID유지; 네팔등새발굴범위밖. duplicates검사.
- 새로운 코드/파서/테스트 수정은 TDD: 회귀실패확인→최소구현→통과. 데이터는목표50년각3키의150날짜 검증, 모든연도순서키/정상월일/2040/2041/2020/2021/대표일본문정책 테스트.
- 날짜표 범위교집합(tabulatedYearRange)은 기존키가2050까지라전역범위는2020~2050유지. 기존 한국항목의 지원범위확대를 위해 전체표재생성하지 않는다. 새3키는직접resolver로2069까지가능함을 검증. '모든달력화면이2069까지지원'으로과장금지.
- add_entries.py는 KEY순서필수/쓰기즉시라는 점을 확인해 사용하거나 안전한삽입. 기존1810개객체그대로보존.
- routes 생성이 separated-families-day URL09-24→09-23을 바꾸는 기존문제 있음: 기존모든 id/slug/urlDate 매핑은완전히보존, 신규5개만추가. REFERENCE_YEAR2026유지.
- 새한글OG글리프검사, tools/og/.venv/bin/python tools/og/build_fonts.py, 필요한OG_VERSION상향 및 npm run og:static.
- npm run verify실제완료,기존ids·URL·tablevalues불변프로그램검사,추가5개프리렌더본문/날짜검증.
- 통합보고서 및 priority integration-result/finalreport의5보류해제/누적59반영/1815개결과를실제로검증한후갱신. 이전조사JSON의검수상태는역사스냅샷으로존중,최신반영상태를별도명시.
- 새작업자료 tools/research/workflow/batches/held-resolution-20261013/ checkpoint/report/manifest/testlogs/source evidence 및 scripts.
- commit/push/배포금지. 기준파일hash/초기snapshot보존해부모독립검수가능하게.
