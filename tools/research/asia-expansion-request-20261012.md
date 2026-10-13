# 아시아 추가 조사 및 지금까지의 통합 보고서

## 사용자 요청
아시아권 나라 기념일을 최대한 많이 추가 조사하고, 지금까지 이 대화에서 요청한 조사 결과를 하나의 report로 정리한다. 검색은 기존 요청대로 Claude Code를 사용한다.

## 대상과 목표
동아시아: 일본(일본어), 중국(간체 중국어), 대만(번체 중국어), 홍콩(번체 중국어), 몽골(몽골어).
동남아시아: 베트남(베트남어), 태국(태국어), 인도네시아(인도네시아어), 말레이시아(말레이어), 필리핀(필리핀어; 정부·주최 영어 자료 병용 허용), 싱가포르(영어·중국어; 말레이·타밀어 선택).
남아시아: 인도(힌디어 우선; 지역어·영어 병용), 네팔(네팔어), 방글라데시(벵골어), 스리랑카(싱할라어·타밀어).
총 15개 국가·지역. 나라별 고유 신규 후보 4~8건, 총 60~100건을 초기 목표로 삼되 숫자 채우기 금지. 기존 1,756건 및 이전 후보와 중복되면 별도 기록하고 신규로 세지 않는다. 시간이 모자라면 국가 범위를 먼저 고르게 탐색하고 깊은 검증이 덜 된 항목을 명시한다. 국가 간 동일 축제를 번역명만 바꾸어 새 기념일로 세지 않는다.

## 조사 기준
- 정확한 현지어 query, country, language, 실행 도구와 결과 URL을 검색 직후 search-log.json에 저장.
- 공식 기념일, 지역 전통, 민속·종교 축제, 직업·문화·관계, 비공식 이색 기념일을 함께 찾는다. 일반 음식과 독립기념일만으로 채우지 않는다.
- 음력·불교력·힌두력·이슬람력·부활절 연동도 조사 대상으로 유지한다. 앱 규칙 미지원은 날짜 반영 제약이지 조사 제외 사유가 아니다.
- 날짜 원문, 연간 반복 여부, 범위, 유래 확인 수준을 분리한다. 특정 해 날짜를 고정 날짜로 바꾸지 않는다.
- 현지 원문 보관 + 짧은 literal quote + 별도 한국어 번역. 원문을 못 읽었으면 search_result_only/blocked. 단일 목록 출처는 미검증으로 표시. 제정자를 지어내거나 전설을 역사로 단정하지 않는다.
- records.json은 native-languages 배치와 같은 형태의 핵심 필드 사용: candidate_key/country/country_ko/search_language/name_original/name_ko/aliases/date_type/date_rule/date_note/scope/kind/officiality/officiality_label/meaning_ko/quirk/founder_origin/founder_check_level/claims/evidence/source_urls/original_read/duplicate_check/status/status_label/confidence/uncertainty/review/application. 필요 필드 추가는 허용. 앱 미지원 날짜에는 null 규칙과 정확한 민속 날짜 설명을 남긴다.
- 5~10개 기록마다 즉시 저장하고 progress.md에 완료 국가와 남은 작업을 갱신한다. 이용 한도나 턴 제한이 오면 그 시점 자료를 보존하고 가능한 범위의 통합 report를 먼저 생성한다.

## 기존 조사 전체 포함
1. tools/research/workflow/batches/contact-expansion-20261012/records.json 및 report.md
2. tools/research/workflow/batches/quirky-discovery-20261012/records.json 및 report.md
3. tools/research/workflow/batches/native-languages-20261012/records.json 및 report.md
4. 이번 tools/research/workflow/batches/asia-expansion-20261012/records.json 및 report.md

기존 native-languages 배치는 Claude quota로 중단됐고 부모 검증에서 76개 인용 중 75개 연결/일치, pl-dzien-wagarowicza.secondary_note는 ox-pl-witaj-wiosno evidence 연결 누락. 기존 기록을 덮어쓰기보다 corrections.json에 원문 검토와 정정 제안을 남긴다. 기존 report의 숫자를 합산하지 말고 각 records를 파싱해 중복을 판정한 뒤 집계한다. 원래 조사 기록 수/기존 서비스 중복/이전 조사 중복/유효 고유 후보/날짜·출처 보류 수를 구분한다.

## 최종 통합 산출물
- tools/research/reports/annical-research-consolidated-20261012.md
- tools/research/reports/annical-research-consolidated-20261012.json (정규화 목록, 원본 배치·candidate_key 추적)
- tools/research/reports/annical-research-consolidated-20261012.csv (UTF-8 BOM, 전체 목록)

보고서 구성: 조사 전체 개요, 배치별 실적, 국가별·종류별·확인수준별 집계, 아시아 국가별 목록, 이전 전체 조사 목록, 중복 제외 목록, 날짜 상충/출처 부족/제정 미확인/앱 날짜 미지원 목록, 원문 출처 링크, 우선 검토 후보, 미완료 작업. 모든 후보를 목록에 포함해 몇 개 예시만 제공하는 요약으로 대체하지 않는다. 기존 후보의 상세 근거는 원본 링크/경로로 연결하되 사실 검수가 완료됐다고 승격하지 않는다. 공식 기념일과 비공식은 섞어 approved처럼 표시하지 않는다. 국가별 요약은 한국어로 읽기 쉽게 쓰고 원명을 병기한다.

## 검증 및 안전
후보키 유일성, 원문 SHA256, 인용 문자 일치, 현지어 검색 수행 국가, 원본 및 통합 총수 일치, 별칭·범위·날짜를 포함한 의미적 중복 판정, 날짜 표현 가능 항목의 resolver 검사. Vite는 configFile:false/optimizeDeps noDiscovery/server middlewareMode watch:null hmr:false/finally close. 기술 검사와 사실 검수는 구분한다. 서비스 파일·footer·기존 배치 변경 금지; commit/push/배포 금지. 이번 신규 조사와 reports 폴더 안에서만 산출물을 작성한다. 초기 서비스 해시를 저장하고 작업 종료 후 불변을 확인한다.
