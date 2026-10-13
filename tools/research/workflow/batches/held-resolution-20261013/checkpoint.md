# held-resolution-20261013 checkpoint

재개 시 이 파일 맨 아래 상태부터 이어간다. 각 단계 완료 시 갱신.

## 기준 (2026-10-13 작업 시작 시점)
- 데이터 1810건, observances 38키(2020~2050), routes 1810.
- baseline/ 에 observances.json·routes.json·anniversaries/*.json·og.ts 사본, sha256.txt 에 기준 해시.

## 단계 상태
- [x] 0. baseline 스냅샷
- [x] 1a. tmp/obs-venv (ephem 4.2.1, gitignored tmp/) 생성
- [x] 1b. HKO T2051e~T2069e 19개 수집 → evidence/_hko-calendar-2051-2069/, fetch-log.json (모두 HTTP 200)
- [x] 1c. 일본 공식 원문 수집: evidence/jp-yama-no-hi/ (e-Gov 법령 API 祝日法 "山の日 八月十一日", 내각부 syukujitsu.csv cp932→cp932-decoded.txt 2016~2027 실제일, 내각부 gaiyou 재수집=기존 사본과 공백 제외 동일)
- [x] 2a. TDD red: tools/observances/test_generate_regional.py (모듈 없음 ImportError) → testlogs/01-python-red.log
- [x] 2b. TDD red: tests/research-publication.test.ts 신규 describe 7개 중 5 실패 → testlogs/02-vitest-red.log
- [x] 3. tools/observances/generate_regional.py 구현. 2033 문제(추분이 9월에 듦)로 ephem 대조를 GB/T 33661 동지 기준 규칙으로 고침(red 로그 04, green 05, 15 tests OK).
      observances.json 은 sort_keys 순서가 아님(rare-disease-day 끝) → 키 순서 보존 직렬화. --write 완료(로그 06): 41키, 기존 38키 값·순서 동일, +156줄 순수 추가.
- [x] 4. dateUtils OutOfTableRangeError 를 키별 범위로 (red 07: [2020,2050]≠[2020,2069], green 08: 28 passed). 전역 tabulatedYearRange 는 교집합 2020~2050 유지.
- [x] 5. 현지어 WebSearch 6회(search-log.json) + 원문 수집(ORPEG·Radio Lublin·study.gov.pl·ourchinastory 15712·Marie Claire·NAO 2021). scripts/records.py → records-final.json, claims-ledger.json (인용 52개 전부 원문 일치)
- [x] 6. add_entries.py 로 5건 삽입(로그 09). 1815건, 기준 1810 객체 전부 동일, 월별 파일 순수 삽입(02/03/08/09 +110줄).
- [x] 7. overrides.json 2줄(tai-hang-fire-dragon-hk, setsubun) + scripts/add_routes.py 로 5 route 만 삽입(로그 10). routes 1810→1815, 삭제 0줄. check:slugs 통과.
- [x] 8a. OG: og.test 글리프 검사 통과(로그 12), build_fonts.py 재생성 결과 3종 바이트 동일(로그 13), og:static 6장 바이트 동일(로그 14). OG_VERSION 은 작업트리 '4'(HEAD/배포 '2', 미배포) → 다음 배포에서 이미 새 캐시키라 추가 상향 불필요.
- [x] 8b. npm run verify exit 0 (로그 15): check:slugs, build 프리렌더 1815+366, type-check:api, 23 files/198 tests.
- [x] 9. scripts/verify_prerender.py 5건×8항목 통과 + separated-families 09-24 존재(로그 16, prerender-check.json). scripts/verify_invariants.py ok=true(로그 17, invariants.json).
- [x] 10. date-provenance.json(150값 실패 0, 원 응답 해시 50/50, 로그 18), search-log.json, report.md, README.md, manifest.json
- [x] 11. priority integration-result.json(59/0/1815, round 3, 이전 스냅샷 보존)·integration-final-report.md·consolidated md/json 상태 갱신. 갱신 전 사본은 baseline/.
- [x] 12. 최종 재실행: python 15 OK(19), npm run verify 0 · 198 tests(20), prerender(21), invariants ok(22). baseline/sha256.txt 대조: 의도한 7개만 변경.

## 상태: 완료 (커밋·푸시·배포 없음)
