# contact-expansion-20261012 진행 기록

작업자: Claude Code (Opus 5.5) · 시작 2026-10-12 (KST) · 서비스 JSON 수정/승인/배포/commit 없음

## 1. 읽은 기준 문서
- CLAUDE.md, README.md, src/types/anniversary.ts, src/data/categories.json
- .claude/skills/anniversary-enrichment/SKILL.md, docs/plans/data-research-workflow.md
- 기존 배치: 2026-10-11-sparse-birthdays (records 31건, 그룹 a/b/c/leap), 2026-10-11-history-expansion (기존 항목 본문 보강, 신규 후보 없음)
- 과거 발견 자료: tools/research/jp-*.md, tools/namuwiki/output/final_result.json (발견용 행, 검증 후보 아님)

## 2. 빈약 날짜 진단 (scripts/diagnose.mjs → diagnosis.json)
- 서비스 기념일 1,756건 (1,734 기준 아님). Vite read-only probe(configFile:false, noDiscovery, middlewareMode, watch:null, hmr:false) 후 close 확인.
- 집계 함수: 실제 `occursOnBirthday`(생일 탭과 같은 정책) + `resolveOccurrenceSafe`.
- 결과 2개 이하 날짜: 2026년 49일, 2027년 55일(1개 1일: 07-19), 2028년 52일(1개 1일: 11-26).
- 3개 연도 모두 음식 항목만 있는 날짜: 02-23, 07-13, 08-24, 08-31, 12-19 (+07-19는 2027년 1건).
- 일부 연도 음식만: 01-06·07-16(2026·2027). 2026·2028 결과 2개: 09-24. 2027·2028 결과 2개: 10-27.

## 3. 후보 조사 순서 (실시간 기록)
1. 02-23 후지산의 날 — 시즈오카현 공식 조례 원문 확보. 야마나시현 PDF 404(blocked 근거로 기록).
2. 02-23 로터리 세계 이해와 평화의 날 — rotary.org 원문 미확보, 로터리 지구 2곳 + 1984 미네소타 선포문 PDF 확보.
3. 08-31 국제 약물 과다복용 인식의 날 — Penington Institute·IOAD 공식 페이지 확보.
4. 08-31 국제 아프리카계 사람들의 날 — UN 관측일 페이지 + 결의 A/RES/75/170 PDF 확보(digitallibrary 202 응답은 blocked 기록).
5. 08-24 우크라이나 독립기념일 — zakon.rada.gov.ua SSL 종료로 접근 실패(blocked 기록, 우회 안 함). Espreso·ENRS·MSU 원문으로 대체.
6. 07-13 몬테네그로 국가성립일 — 몬테네그로 정부 gov.me 2건 확보.
7. 07-16 세계 뱀의 날 — 동물원(우크라이나 미콜라이우)·인도 공영 AIR 기사 확보. Little Rock Zoo 404.
8. 07-19 미얀마 순국자의 날 — Al Jazeera 2013, AP(2024, News4JAX 게재본) 확보.
9. 09-24 세계 고릴라의 날 — Dian Fossey Gorilla Fund 2건 확보.
10. 10-27 한국 영화의 날 — 국가기록원·전북일보·주간경향·서울신문 확보. 제정 연도/주체 미확인.
11. 11-26 인도 헌법의 날 — 주말리 인도대사관·Bar & Bench 확보. dsel.education.gov.in 빈 본문.
12. 12-19 고아 해방의 날 — 고아 주정부 보도자료 3건 + 2026 공휴일 목록 기사(2차) 확보.
13. 08-24 명왕성 강등의 날 — IAU 2006 보도자료(ESO 보관본)·SYFY·National Today 확보. timeanddate 403, iau.org 404, nationaldaycalendar 404.
14. 07-13 세계 록의 날(브라질) — Band·O Imparcial(동일 배포문) 확보, Exame 본문 미포함, preparaenem 타임아웃 → review.
15. 12-19 일본인 첫 비행의 날 — zatsuneta만 확보, 제정 주체 없음 → blocked.

## 4. 이후 단계
- scripts/build_records.py → records.json (주장별 근거·인용·판정)
- scripts/verify.mjs → verification.json (인용 원문 일치, 중복 대조, 2026·2027·2028 발생일, 카테고리, 상태 집계)
- proposed-anniversaries.json, review-request.md

## 5. 완료 (2026-10-12)
- build_records.py 실행: records 15건 / proposed 14건, 인용 불일치 0.
- 초안 재대조 후 수정: 근거 없는 표현 제거(고릴라 "평생을 바친"), 원문에 없는 원어·별칭 표기(몬테네그로·미얀마·우크라이나 원어, Samvidhan Divas, Mt. Fuji Day) 삭제, 로터리 "2월 한가운데" 오기 수정, 근거 인용 2건 보강.
- verify.mjs 실행: ok=true, 인용 101/101 일치, 원본 sha256 일치, 상태 evidenced 13 · review 1 · blocked 1 · rejected 0, 2026·2027·2028 발생일 전부 기대값, Vite 서버 close 확인, 서비스 파일 쓰기 없음.
- 중복: 서비스 1,756건·기존 research 31건과 원명·날짜 일치 없음. 유사 주제는 distinct_from_similar_reason 에 기록.
- search-log.json(검색 32회, 발견용), review-request.md 작성.
