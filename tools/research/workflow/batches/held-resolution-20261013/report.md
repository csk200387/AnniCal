# 보류 5개 반영 결과 (held-resolution-20261013)

**상태: 5개 로컬 반영 완료. 1,810 → 1,815개. 커밋·푸시·배포 없음.**
요청서: `tools/research/held-resolution-request-20261013.md`. 사용자 승인 범위 안에서만 바꿨다.

## 반영 5개 (원래 후보 ID 유지)

| uid | id | dateType · date | 상세 경로 |
|---|---|---|---|
| native:pl-topienie-marzanny | anv-fixed-03-21-marzanna-pl | annual-fixed `03-21` (대표 날짜) | `/day/03-21/marzanna-pl` |
| asia:cn-farmers-harvest | anv-term-chubun-cn-farmers-harvest-festival | annual-tabulated `chubun-cn` | `/day/09-23/chubun-cn-farmers-harvest-festival` |
| asia:hk-fire-dragon | anv-rel-chuseok-minus1-tai-hang-fire-dragon-hk | annual-tabulated `lunar-08-14-hk` | `/day/09-24/tai-hang-fire-dragon-hk` |
| asia:jp-yama-no-hi | anv-fixed-08-11-mountain-day-jp | annual-tabulated `yama-no-hi-jp` | `/day/08-11/mountain-day` |
| asia:jp-setsubun | anv-rel-ipchun-minus1-setsubun-jp | annual-fixed `02-03` (대표 날짜) | `/day/02-03/setsubun` |

ID 접두사(rel/fixed)가 현재 dateType과 다른 3건은 지시대로 원래 ID를 유지했다. 슬러그는
`generate_slugs.py` 함수로 계산했고, ID에서 뽑을 수 없는 2건(불용춤·세쓰분)만 `overrides.json`에 넣었다.

## 날짜표 3키 (2020~2069, 각 50개 = 150개)

| 키 | 의미 | 원문 | 독립 대조 |
|---|---|---|---|
| `chubun-cn` | 중국 추분 UTC+8 | HKO 공력·농력 대조표 `Autumnal Equinox` 행 | ephem 추분 → UTC+8 날짜, 50/50 일치 |
| `lunar-08-14-hk` | 홍콩 음력 8월 14일 | HKO 표 첫 `8th Lunar Month` + 13일(음력일 14 확인) | GB/T 33661 규칙(동지월=11월, 13개월 해 첫 무중기월=윤달) ephem 계산, 50/50 일치 |
| `yama-no-hi-jp` | 일본 산의 날 | 祝日法 제2조 `山の日 八月十一日`(e-Gov), 내각부 특례 2020 `08-10`·2021 `08-08` | 내각부 syukujitsu.csv 2020~2027 공표값과 일치 |

- HKO 2020~2050 31개는 priority-editorial 기존 사본을 재사용, 2051~2069 19개만 새로 수집(전부 HTTP 200).
  원 응답 사본 50개 SHA-256이 fetch-log 값과 일치.
- **2033년 문제**: 2033년은 추분이 음력 9월에 든다. '추분이 든 달=8월'로 줄인 첫 대조식은 10-06을 내
  HKO(09-07)와 어긋났고, 동지 기준 표준 규칙으로 고친 뒤 일치했다. 회귀 테스트로 남겼다.
- 회귀 확인: 2041 `chubun-cn` 09-22(한국 chubun 09-23), 2040 `lunar-08-14-hk` 09-19(한국 chuseok-1 09-20),
  2020 `yama-no-hi-jp` 08-10, 2021 08-08(08-09 아님). 2020~2050 동안 한국 키와 다른 해는 이 두 해뿐이다.
- 성격 구분: HKO 표는 천문 계산 공식표이고 미래 연도는 예측값이다. 일본 2028년 이후는 현행법 규칙의
  투영이며, 법 개정·정부 특례 이동은 별개다(`date-provenance.json`의 `kind`).

## 대표일 본문 정책

- 마르자나: origin 첫 문장 "3월 21일이 대표 날짜지만, 실제 행사는 그 무렵 다른 날에도 열린다". ORPEG(사순절
  넷째 주일 '죽음의 주일'), ESKA('규칙 아님'), Radio Lublin(2025-03-23 재현 행사)으로 지지. 체신 자료의
  '베스키디 밖' 조건 복원, 현재(학생·교사 인솔·놀이)와 과거(짚·천·리본·노래)의 시제 분리, sourceUrl 교정.
- 세쓰분: origin 첫 문장 "정확한 날짜는 '입춘 전날'이고, 2월 3일은 … 대표 날짜". NAO 역요항 2021·2025(2/2),
  2026·2027(2/3). '매년 2월 3일' 서술 없음(테스트로 고정). 실제 발생일 검증 완료로 기록하지 않았다.

## 코드 변경 (TDD: 실패 확인 → 최소 구현 → 통과)

- `tools/observances/generate_regional.py` + `test_generate_regional.py`(unittest 15개). red 로그 01·04, green 05.
- `src/utils/dateUtils.ts`: 범위 밖 오류가 전역 교집합이 아니라 **그 키의 범위**를 알리도록 3줄. red 07, green 08.
  `tabulatedYearRange()`는 교집합 2020~2050 그대로다 — 달력·생일·우리의 날·ICS RDATE는 2050까지,
  새 3키는 resolver 직접 호출로만 2069까지 답한다. 모든 화면이 2069까지 지원하는 것은 아니다.
- `tests/research-publication.test.ts` 6개, `tests/dates.test.ts` 1개 추가. red 로그 02.
- `tools/slugs/overrides.json` 2줄.

## 검증

- `npm run verify` 종료코드 0: check:slugs, 빌드(상세 1,815 + 허브 366 프리렌더), type-check:api, 23 files / 198 tests (로그 15).
- 불변(`invariants.json`, ok=true): 기존 1,810 객체 동일, routes 기존 1,810 동일(삭제 0줄, 추가 20줄),
  separated-families-day `09-24` 유지, observances 기존 38키 값·순서 동일, URL 중복 없음.
- 프리렌더(`prerender-check.json`): 5개 × 제목·전체 origin·전체 anecdote·meta description·표시 날짜·sourceUrl·canonical·허브 링크.
- 근거 인용 52개 원문 연속 문자열 일치(`claims-ledger.json`). 날짜 150개 출처·해시·대조(`date-provenance.json`).
- OG: 글리프 테스트 통과, `build_fonts.py` 재생성 결과 3종 바이트 동일(새 글자 없음), `og:static` 6장 바이트 동일.
  `OG_VERSION`은 작업트리 '4'(HEAD·배포본 '2' 이후 미배포)라 다음 배포에서 이미 새 캐시키가 되므로 올리지 않았다.

## 남은 한계

- HKO 미래 표·일본 2028년 이후는 예측·규칙 투영. 공식 특례나 역법 기관 발표가 바뀌면 표를 다시 대조해야 한다.
- 표 값은 날짜일 뿐 행사 개최 확인이 아니다. 다이항 불용춤 2027년 이후 주최 공고, 2026년 주최 측 원본 공고는 없다.
- 세쓰분·마르자나는 대표일이라 달력·ICS가 2025년처럼 실제와 다른 해에도 2월 3일·3월 21일을 표시한다(본문으로 고지).
- 중국 추분은 중국 본토 자금산천문대가 아니라 홍콩천문대 표(같은 UTC+8)와 ephem 대조에 근거한다.
- `README.md`의 총 건수(1,734)와 `CLAUDE.md`의 "표 2020~2050" 설명은 이번 범위에서 고치지 않았다.
- 범위 밖: 네팔·방글라데시·스리랑카 발굴은 여전히 미완료.
