# 라운드2 보고 — priority-editorial-20261012 남은 27건

상태: **27/27 판정 완료, 미작성 0**. 검수 요청 26건(ready_for_review), 날짜 보류 1건(date_support_unverified: `asia:jp-setsubun`). 서비스 반영·커밋·배포 없음.

## 결과

| 상태 | 건수 | UID |
|---|---:|---|
| ready_for_review | 26 | 세쓰분을 뺀 아시아 26건 |
| date_support_unverified | 1 | asia:jp-setsubun — 일본 국립천문대 2028 역요항 미발표 |
| shorter_evidenced / blocked / duplicate | 0 | — |

- 본문 길이: origin 146~267자, anecdote 164~367자, 합계 평균 486자. 150자 미만 필드는 1개(in-hindi-diwas origin 146자, 근거 부족으로 늘리지 않음)다.
- 역사·국가 항목 최대 614자. 800~1,100자 목표는 근거가 없어 채우지 않았다.
- 중복: 현행 서비스 1,787건, 1라운드 초안, 다른 배치 기록과 대조했다. 같은 기념일은 0건이다. 유사 항목과 별개로 본 이유는 각 draft 의 `dedup` 에 적었다.
- id 27개 신규·고유. 서비스·1라운드와 충돌 0.

## 검증 (`scripts/verify-round2.mjs` → `verification-round2.json`)

- 통과: 오류 0, 경고 1(150자 미만 필드).
- pending 27 정확 커버, uid·id 유일, 서비스 1,787건과 id 중복 0.
- 본문에 쓴 claim 의 literal 인용 **248/248 문자 일치**(이번 배치 인용 147개 포함). 경로는 모두 repo 루트 상대. 이번 수집 원문의 sha256 일치.
- category/tags[0]=현행 레이블 1개, 그룹 레이블 없음, text meme 1개(url null), sourceUrl 은 모두 실제 수집 기록 URL.
- 실제 `registerAnchors`/`resolveOccurrence`(Vite SSR, configFile:false·noDiscovery·middlewareMode·watch:null·hmr:false, finally close → `vite_server_closed: true`)로 2026·2027·2028 27건 계산. 실패 0, 기대값 일치.
  - 농민 풍수절 09-23 / 09-23 / 09-22
  - 다샤오런 03-05 / 03-06 / 03-05
  - 불용춤 09-24 / 09-14 / 10-02
  - 세쓰분 02-03 ×3
  - 경로의 날 09-21 / 09-20 / 09-18
  - 성인의 날 01-12 / 01-11 / 01-10
  - 영웅의 날 08-31 / 08-30 / 08-28
- 계산 성공은 날짜 사실의 증명이 아니다. 해외 절기·음력은 현지 공식 연표(HKO, NAO)로 따로 확인했다.
- HKO 2020~2050 ↔ 앱 표 불일치: 추석 2040, 추분 2041, 입춘 2050(UTC+8 기준이라 일본 세쓰분과는 무관).

## 조사 기록

- 라운드2에서 검색 3회 추가(누적 9), 원문 수집 34회 추가(HKO 연표 28개 포함, 실패 0). 1라운드 중 이 배치에서 먼저 받아 둔 원문(HKO 2026~2028·세쓰분 역요항·나담·불용춤 HK01·풍수절 2026)도 근거로 썼다. 기존 로그 값은 보존했다.
- 원본 배치 원문 본문을 다시 읽어 claim 을 재대조했다. 원본 record 의 일부 설명은 원문과 달라 다르게 썼다.
  - 산의 날: 원본 ‘가미코치’ → 원문은 ‘마쓰모토시’.
  - 국가 과학의 날: ‘아시아 최초 노벨상’ 삭제.
  - 말레이시아의 날: ‘싱가포르 1965 분리’ 삭제(원문에 없음).
  - 총방위의 날: ‘영국군 항복 시각 6시 20분’ 삭제.
  - 송끄란: 원본 배치 원문에 없던 풍습 서술을 정부 원문으로 보강.

## 남은 판단 (검수자)

- 불용춤 엔트리 날짜를 첫날(8/14, `chuseok:-1`)로 둘지, 큐대로 중추절(8/15)로 둘지 정해야 한다.
- 2040·2041 표 불일치를 수용할지 정해야 한다.
- 세쓰분은 2027년 2월 NAO 2028 역요항 발표 뒤 재검토한다.
- 반영 시 신규 id 26개라 `generate_slugs.py` 실행이 필요하다. 새 한글 글리프로 OG 폰트 재생성이 필요한지도 확인해야 한다.

## 파일

`drafts-round2.json`, `proposed-records-round2.json`, `evidence-map-round2.json`, `verification-round2.json`, `review-request-round2.md`, `progress-round2.md`, `report-round2.md`, `scripts/add_drafts_round2.py`, `scripts/verify-round2.mjs`
