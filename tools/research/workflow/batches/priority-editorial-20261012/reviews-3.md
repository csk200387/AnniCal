# 독립 원문 검수 3 — 남은 초안 14건

**원문 검수 후 수용 10건 · 보류 4건 · 배정 누락 0건.** 수용은 독립 출처 검수 판정이며 사용자 출판 승인이나 서비스 반영 승인이 아니다. 검색·원문 재수집·서비스 수정·커밋·푸시·배포 없음.

## 판정

| UID | 한국어 명칭 | 판정 | 핵심 판단 |
|---|---|---|---|
| `asia:cn-farmers-harvest` | 중국 농민 풍수절 | 보류 | 2041 추분 현지 날짜 오류 |
| `asia:cn-police-day` | 중국 인민경찰절 | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:cn-space-day` | 중국 항천일 | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:cn-arbor-day` | 중국 식수절 | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:hk-villain-hitting` | 경칩 다샤오런(홍콩) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:hk-fire-dragon` | 다이항 불용춤(홍콩) | 보류 | 2040 음력 anchor 날짜 오류·현행 바다 투입 서술 불가 |
| `asia:id-batik-day` | 바틱의 날(인도네시아) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:id-santri-day` | 산트리의 날(인도네시아) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:in-hindi-diwas` | 힌디어의 날(인도) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:in-science-day` | 국가 과학의 날(인도) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:jp-shichigosan` | 시치고산(일본) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:jp-keiro-no-hi` | 경로의 날(일본) | 원문 검수 후 수용 | 저장 원문 지지; 필요한 삭제·귀속 반영 |
| `asia:jp-yama-no-hi` | 산의 날(일본) | 보류 | 2020·2021 특별 이동을 고정일로 표현하지 못함 |
| `asia:jp-setsubun` | 세쓰분(일본) | 보류 | 작가 보류 유지·일본 공식 날짜 지원 부족 |

## 검증 결과

- 배정 scope 14 UID와 결과 14 UID가 정확히 일치하며 UID 중복·누락 0.
- 모든 evidence_paths_checked 81개 고유 파일 존재 확인. 원본 records.json의 evidence 경로도 원본 배치 디렉터리에 상대적으로 해석해 text/raw 존재를 확인했다.
- 해당 14 UID의 evidence-map-round2 인용 138/138개가 실제 저장 본문의 **연속 문자열**과 엄격하게 일치했다. 공백 정규화가 없어도 모두 일치. 인용의 문자 일치는 사실성·해석·독립성·전체 날짜 지원을 자동 보증하지 않는다.
- 검수에 사용한 라운드2 수집 원문 38개 raw 파일의 SHA-256이 fetch-log와 일치했다. 이는 저장 파일의 무결성 검사이며 매체 내용 자체의 진실성을 보증하지 않는다.
- 현재 서비스 월별 JSON을 읽어 총 1,787건을 확인하고 이름·원명·별칭·대상·날짜·국가 의미를 대조했다. 같은 기념일 중복 없음. 국가별 별개 기념일·절기와 민속 의례·시치고산 관련 음식 기념일은 합치지 않았다.
- 수용 10건은 full final_anniversary를 보존했다. runtime 필드만 포함하며 ID·date·dateType·category·tags·name·sourceUrl·memes는 초안 그대로이다. 변경은 storytelling의 삭제·완화·귀속에 한정했다. 현행 categories.json과 tags[0]를 검증했다. 보류 4건은 final_anniversary=null로 반영 대상 객체를 내보내지 않았다.
- 기존 날짜 모듈을 Vite SSR(configFile:false, noDiscovery, middlewareMode, watch:null, hmr:false)로 읽어 registerAnchors/resolveOccurrence를 실제 실행했다. 14건 × 8개 연도(2020·2021·2026·2027·2028·2040·2041·2050) 모두 계산 성공; 서버 finally 종료 확인. **계산 성공과 현지 사실 일치를 구분했다.**

### HKO 표·시간대·범위

review-request-round2.md와 verification-round2.json 및 검사 스크립트의 UTC+8·2020~2050 범위 설명을 읽고, HKO 저장 본문 31개를 독립 재파싱했다. 표 파일의 원 URL은 fetch-log에서 hko.gov.hk 공식 자료로 확인했고 raw hash도 대조했다. 한국 observances의 날짜를 홍콩 현지 날짜로 무조건 간주하지 않았다.

| 항목 | 연도 | 앱 날짜 | HKO 현지 날짜 | 판단 |
|---|---:|---|---|---|
| 추분 chubun | 2041 | 09-23 | 09-22 | 풍수절 보류 |
| 음력 8/15 chuseok | 2040 | 09-21 | 09-20 | 불용춤 첫날(-1)도 하루 오류 |
| 입춘 ipchun | 2050 | 02-04 | 02-03 | UTC+8 HKO 차이. UTC+9 일본 세쓰분의 입증/반증 아님 |
| 경칩 gyeongchip | 2020~2050 | 31년 전체 | 31년 전체 동일 | 다샤오런 날짜 수용 조건 충족 |

불용춤: 2040년 앱 상대일은 09-20, HKO 음력 8/14는 09-19다. 한국 표를 수정하거나 shifted calendar를 조용히 빌리지 않았다. 별도 현지 날짜 모델 검토는 이 검수 범위 밖이다.

**추가 보류 — 산의 날:** 내각부 원문은 2020-08-10 및 2021-08-08로 명시하지만 annual-fixed 08-11은 resolver에서 두 해 모두 08-11을 반환한다. 사용자 지침의 알려진 잘못된 날짜를 수용하지 않는 원칙에 따라 2026~2028만 맞아도 보류했다. 본문에 예외를 적는 것으로 런타임 오류를 대신하지 않는다. 2021-08-09는 대체 휴일이며 산의 날 자체와 구별한다.

### 2026·2027·2028 실제 resolver 출력

| UID | 2026 | 2027 | 2028 |
|---|---|---|---|
| `asia:cn-farmers-harvest` | 2026-09-23 | 2027-09-23 | 2028-09-22 |
| `asia:cn-police-day` | 2026-01-10 | 2027-01-10 | 2028-01-10 |
| `asia:cn-space-day` | 2026-04-24 | 2027-04-24 | 2028-04-24 |
| `asia:cn-arbor-day` | 2026-03-12 | 2027-03-12 | 2028-03-12 |
| `asia:hk-villain-hitting` | 2026-03-05 | 2027-03-06 | 2028-03-05 |
| `asia:hk-fire-dragon` | 2026-09-24 | 2027-09-14 | 2028-10-02 |
| `asia:id-batik-day` | 2026-10-02 | 2027-10-02 | 2028-10-02 |
| `asia:id-santri-day` | 2026-10-22 | 2027-10-22 | 2028-10-22 |
| `asia:in-hindi-diwas` | 2026-09-14 | 2027-09-14 | 2028-09-14 |
| `asia:in-science-day` | 2026-02-28 | 2027-02-28 | 2028-02-28 |
| `asia:jp-shichigosan` | 2026-11-15 | 2027-11-15 | 2028-11-15 |
| `asia:jp-keiro-no-hi` | 2026-09-21 | 2027-09-20 | 2028-09-18 |
| `asia:jp-yama-no-hi` | 2026-08-11 | 2027-08-11 | 2028-08-11 |
| `asia:jp-setsubun` | 2026-02-03 | 2027-02-03 | 2028-02-03 |

## 항목별 원문 판정·수정

### 중국 농민 풍수절 — `asia:cn-farmers-harvest`

**보류**

- 존재·중국 전국 범위·2018년 제정·추분 반복은 gov.cn 본문으로 지지된다. sourceUrl은 기념일 자체와 날짜를 직접 설명한다.
- HKO 2020~2050 원문 연표를 재파싱했으며 2041년 추분은 09-22, 현재 chubun은 09-23이다. 해당 annual-tabulated 키를 유지한 채 승인할 수 없다. 날짜 모델 별도 수정 후 재검토한다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: anv-term-chubun-kr는 한국 절기; 같은 날이지만 중국 농민 국가 기념일은 대상·주체·국가가 다름.
- evidence-map-round2의 해당 UID 인용 11개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- 없음. 원문 지지 서술 유지 또는 날짜 문제로 객체 출력 보류.

주의:
- 2041 불일치를 한계 수용이라는 이유로 승인하지 않았다. 중국 표준시 UTC+8의 현지 날짜와 한국 키를 구분해야 한다.
- gov.cn 5300368은 人民日报, 5300385는 经济日报 전재로 표시되며 같은 부처 발표를 토대로 한다. 원본 기록의 신화사 전재·독립 출처 수 판단은 그대로 승계하지 않는다.
- 추분을 음력일로 잘못 풀이하지 않고 공휴일 여부도 단정하지 않는다.

확인한 파일:
- `src/data/categories.json`
- `src/data/observances.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-farmers-harvest/chinadaily-2021.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-farmers-harvest/gov-cn-5300368.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-farmers-harvest/gov-cn-5300385.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2020e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2021e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2022e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2023e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2024e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2025e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2026e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2027e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2028e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2029e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2030e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2031e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2032e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2033e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2034e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2035e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2036e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2037e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2038e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2039e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2040e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2041e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2042e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2043e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2044e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2045e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2046e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2047e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2048e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2049e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2050e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/cn-farmers-harvest/newscn-20260923.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/review-request-round2.md`
- `tools/research/workflow/batches/priority-editorial-20261012/scripts/verify-round2.mjs`
- `tools/research/workflow/batches/priority-editorial-20261012/verification-round2.json`

### 중국 인민경찰절 — `asia:cn-police-day`

**원문 검수 후 수용**

- 인민일보의 2021년 기사에 매년 01-10, 2021년 시작, 당 중앙 비준·국무원 승인과 최초 기념이 명시되어 있다. 중국일보는 2020-07-21 문서 공개를, 신화망은 2025년 제5회·300여 명 행사와 의식을 지지한다.
- 경찰기 수여는 2020-08-26 베이징 인민대회당 문맥에서 확인했다. 반복 의식 일반화만 2025년 사례로 제한했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: gov-47(한국 경찰의 날 10-21), gov-107(해양경찰의 날 09-10)과 국가·대상·날짜가 다름.
- evidence-map-round2의 해당 UID 인용 7개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 2025년 보도를 무기한·매년 동일 의식으로 일반화하지 않음.
  - 이전: 기념일에는 전국 공안기관이 경찰기 게양식을 열고 ‘중국 인민경찰 경가’를 부르며 입경 선서를 다시 새긴다.
  - 이후: 2025년 기념일에는 전국 공안기관이 경찰기 게양식을 열고 ‘중국 인민경찰 경가’를 부르며 입경 선서를 다시 새겼다.

주의:
- 정치기관의 자찬·성과 평가를 사실 서술로 옮기지 않았다. 신고번호 110 날짜 이유 및 휴무 여부 미확인.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-police-day/chinadaily-2023.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-police-day/news-cn-2025.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-police-day/people-2021.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 중국 항천일 — `asia:cn-space-day`

**원문 검수 후 수용**

- 2016 우주백서 전재본과 2023 CCTV 전재 기사는 2016년 지정·매년 04-24·목적·국무원 동의를 지지한다. sourceUrl 중국일보 본문과 2026 신화망 본문은 첫 위성 발사일과 기념일의 연결을 직접 설명한다.
- 2023년 허페이·주제·400건은 예정 발표로 유지했으며 2026년 제11회·선저우21호 영상·우주정거장 체류는 신화망 실제 본문에 있다. 매년 도시 교체라는 의무 규칙은 삭제했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: 한국 gov-28 및 미국 우주 관련 기념일과 중국 국가항천국의 위성 발사 기념일은 주체·범위·날짜가 다름.
- evidence-map-round2의 해당 UID 인용 10개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 여러 개최 사례는 확인되지만 해마다 도시를 반드시 바꾼다는 규칙은 원문에 없음.
  - 이전: 국가항천국은 해마다 주제를 정하고 주행사 도시를 바꿔 가며 행사를 연다.
  - 이후: 2023년 국가항천국은 항천일 주제와 행사 계획을 발표했다.
- `storytelling.anecdote`: 원문은 400项이지 400여 건이 아님. 예정 시제 유지.
  - 이전: 400여 건
  - 이후: 400건

주의:
- 중국일보 sourceUrl은 新海南客户端 전재, 중국신문망은 CCTV 전재, 저장온라인은 백서 전재다. 여러 독립 원자료가 동일 정부 발표를 반복한 것으로 세지 않는다.
- 2023년 기사 계획을 실제 개최 완료로 바꾸지 않았다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-space-day/chinanews-2023.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-space-day/zjol-whitepaper.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/cn-space-day/chinadaily-2021.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/cn-space-day/newscn-2026.txt`

### 중국 식수절 — `asia:cn-arbor-day`

**원문 검수 후 수용**

- 중국일보의 매년 03-12·1979년 결정·1981년 결의·2020년 삼림법 시행 서술을 확인했다. 1925년 쑨원 서거와 1928년 국민정부의 날짜 결정은 인민정협망 본문에서 별도로 지지된다.
- 781억은 원문의 781亿株（含折算）와 일치하며 1982~2021 기간·환산 포함·중국일보 귀속을 유지했다. 1915년 제안은 펑파이 기사로 오인하지 않도록 기관 게시물에 귀속했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: gov-9(한국 식목일 04-05) 및 National Arbor Day 기존 항목 04-29와 국가·일자가 다름. 타이완 항목은 생성하지 않음.
- evidence-map-round2의 해당 UID 인용 10개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 澎湃号·政务의 기관 게시물이며 펑파이 취재보도·신문 자체의 견해로 오인하지 않게 실제 작성기관에 귀속.
  - 이전: 쑨원의 제안으로 당시 베이양 정부가 매년 청명을 식수절로 정했다고 펑파이는 전한다.
  - 이후: 쑨원의 제안으로 당시 베이양 정부가 매년 청명을 식수절로 정했다고 펑파이 플랫폼의 핑딩현 부녀연합회 게시물은 전한다.

주의:
- 삼림법 전문은 미수집이며 법정 지위·결정은 보도 설명에 근거한다. 쑨원 제안 및 1928 경위는 언론·기관 게시물 수준이며 월 단위 충돌을 연도 단위로만 썼다.
- 781억은 실제 심은 나무만 센 수가 아니라 기타 의무 이행의 환산치를 포함한다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-arbor-day/chinadaily-2022.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-arbor-day/rmzxw-2020.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/cn-arbor-day/thepaper.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 경칩 다샤오런(홍콩) — `asia:hk-villain-hitting`

**원문 검수 후 수용**

- 홍콩대 자료의 鵝頸橋·연중 의례·경칩 전후 한 주 성수기와 신발로 小人紙를 때리는 절차를 읽었다. sourceUrl ourchinastory는 홍콩·마카오의 경칩 의례를 실제로 설명한다.
- HKO Insects Waken 2020~2050 총 31개 날짜가 현행 gyeongchip 전체 31개와 일치한다. 2026/2027/2028은 03-05/03-06/03-05이며 미래 한 해만 맞춰 빌린 키가 아니다.
- 백호·천둥 유래는 민간 전승으로 제한했다. 유래·광둥 분포 고증 곤란이라는 홍콩대의 경고와 심리 해석·타임 소개의 출처 귀속을 유지했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: anv-term-gyeongchip-kr는 절기, 본 건은 홍콩 경칩 민속 의례 성수일로 대상·범위가 다름.
- evidence-map-round2의 해당 UID 인용 15개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.origin`: 가장 붐비는 날의 정량 비교 없이 성수일로 완화.
  - 이전: 사람들이 가장 많이 몰리는 날이다.
  - 이후: 사람들이 몰리는 대표적인 날이다.
- `storytelling.origin`: 홍콩대 자료는 광둥 분포 전승에 문헌 근거가 없다고 명시. 확정된 광둥 기원 인상을 제거.
  - 이전: 광둥계 민간 풍습으로
  - 이후: 홍콩의 민간 풍습으로
- `storytelling.origin`: 비교 최상급을 원문의 성수기 관찰 수준으로 낮춤.
  - 이전: 경칩 앞뒤 한 주가 가장 붐빈다.
  - 이후: 경칩 앞뒤 한 주에 특히 붐빈다.
- `storytelling.anecdote`: 천둥·해충 설명을 과학적 사실 아닌 민속 믿음으로 분리.
  - 이전: 첫 천둥에 겨울잠 자던 벌레가 깨어난다는 경칩에
  - 이후: 민간에서는 경칩에 첫 천둥이 겨울잠 자던 벌레를 깨운다고 여겼다. 이 무렵

주의:
- 국가 지정 공휴일·단 하루 축제가 아니라 상시 의례의 성수일이다. 미신의 효험 및 정부 무형유산 등재는 확정하지 않았다.
- 2009년 타임 평가 원문은 저장되어 있지 않아 홍콩대 자료가 소개한 일로만 서술했다. 현지 표 일치는 2020~2050 범위에만 해당한다.

확인한 파일:
- `src/data/categories.json`
- `src/data/observances.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/hk-villain-hitting/hku-custom01.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/hk-villain-hitting/nownews-6375415.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/hk-villain-hitting/ourchinastory-1132.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2020e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2021e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2022e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2023e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2024e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2025e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2026e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2027e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2028e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2029e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2030e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2031e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2032e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2033e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2034e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2035e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2036e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2037e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2038e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2039e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2040e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2041e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2042e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2043e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2044e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2045e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2046e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2047e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2048e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2049e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2050e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/review-request-round2.md`
- `tools/research/workflow/batches/priority-editorial-20261012/scripts/verify-round2.mjs`
- `tools/research/workflow/batches/priority-editorial-20261012/verification-round2.json`

### 다이항 불용춤(홍콩) — `asia:hk-fire-dragon`

**보류**

- 국가급 무형유산 sourceUrl 원문은 음력 8/14~16 사흘 밤·14일 개광·1880 역병 전승·2011 제3차 목록·보호단체를 지지한다. 첫날을 쓰는 원칙 자체는 원문과 맞는다.
- 현재 anchor chuseok은 2040년 09-21이지만 HKO 음력 8/15는 09-20이다. 상대일 -1의 앱 결과는 2040-09-20, 홍콩 음력 8/14는 2040-09-19이므로 하루 틀린다. date·anchor·표는 수정하지 않고 hold한다.
- 바다 투입은 국가급 전통 의례 서술과 2022년 매체의 근년 소각로 전환 서술이 충돌하므로 현재 관행으로 확정하지 않는다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: anv-lunar-chuseok-kr의 한국 명절과 달리 다이항 지역 의례 축제이며 첫날도 하루 앞섬.
- evidence-map-round2의 해당 UID 인용 14개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 국가급 소개는 바다 투입을 서술하지만 2022년 ourchinastory는 근년 소각로로 바뀌었다고 명시. 현재 매년 바다 투입으로 쓰지 말 것; hold이므로 최종 runtime 객체 미출력.
  - 이전: 마지막 16일 밤에는 ... 바다에 넣어지는데
  - 이후: 전통 의례에서는 마지막 밤 용을 바다에 보내 용이 하늘로 돌아간다고 표현했다.

주의:
- 2026년 67m·12,000개 향·300여 명·9/24~26은 HK01 행사 안내의 해당 연도 수치이지 영구 규칙이 아니다. 주최자의 실제 2026 공고 원본과 2027/2028 개최 공고는 미확보.
- held final_anniversary=null: 잘못된 anchor를 가진 객체를 반영용으로 내보내지 않는다.

확인한 파일:
- `src/data/categories.json`
- `src/data/observances.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/hk-fire-dragon/cache-1126.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/hk-fire-dragon/ourchinastory-4023.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2020e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2021e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2022e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2023e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2024e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2025e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2026e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2027e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2028e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2029e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2030e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2031e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2032e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2033e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2034e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2035e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2036e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2037e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2038e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2039e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2040e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2041e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2042e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2043e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2044e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2045e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2046e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2047e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2048e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2049e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/_shared-hko-calendar/hko-T2050e.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/hk-fire-dragon/hk01-2026.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/hk-fire-dragon/ihchina-14936.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/review-request-round2.md`
- `tools/research/workflow/batches/priority-editorial-20261012/scripts/verify-round2.mjs`
- `tools/research/workflow/batches/priority-editorial-20261012/verification-round2.json`

### 바틱의 날(인도네시아) — `asia:id-batik-day`

**원문 검수 후 수용**

- 위키문헌에 저장된 대통령령 전문은 2009-33·10-02·2009-11-17 서명·대통령·공휴일 아님·보호와 발전 목적을 명시한다. sourceUrl은 이 전문 전재본이며 단순 기념일 목록이 아니다.
- NU 온라인은 2009-10-02 유네스코 등재 및 제정 경과를 지지한다. 신청일·착용 권고는 NU 전언으로, 왕궁 기원은 NU가 교육문화부 자료를 인용한 설명으로 제한했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: Hari Batik Nasional/National Batik Day/바틱의 날 원명·별칭 대응 서비스 항목 없음.
- evidence-map-round2의 해당 UID 인용 8개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 정부·UNESCO 신청 원본과 일률적 매년 실태 자료 없이 NU 보도에 귀속.
  - 이전: 인도네시아 정부는 2008년 9월 4일 바틱을 유네스코 무형문화유산으로 신청했다. 해마다 이날이면 관공서와 기업들이 직원들에게 바틱을 입으라고 권한다.
  - 이후: NU 온라인에 따르면 인도네시아 정부는 2008년 9월 4일 바틱을 유네스코 무형문화유산으로 신청했으며, 바틱의 날에는 관공서와 기업들이 직원들에게 바틱을 입으라고 권한다.

주의:
- 대통령령은 정부 관보가 아닌 위키문헌 전재본이다. 법령 내용은 NU의 제정 경과와 상호 일치하나 공식 원본 인증을 주장하지 않는다.
- 바틱 기원을 왕궁에서만 시작한 것으로 독립 확정하지 않고 NU의 교육문화부 자료 소개로 귀속한다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/id-batik-day/nu-batik.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/id-batik-day/wikisource-keppres.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 산트리의 날(인도네시아) — `asia:id-santri-day`

**원문 검수 후 수용**

- NU 본문에 매년 10-22·2015-22 대통령령·2015-10-15 서명·독립 투쟁 역할·결의의 1945-10-22 날짜가 직접 명시되어 있다. sourceUrl은 실제 역사·제정 설명이다.
- 하심 아샤리와 11월10일의 연결은 NU 관계자 설명으로 귀속했다. 데틱의 2014년 최초 제안은 NU 사이트 재인용으로 명시했고 지하드를 독립 직후 방어 호소로 맥락화했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: Hari Santri/Hari Santri Nasional/산트리의 날 대응 서비스 항목 없음.
- evidence-map-round2의 해당 UID 인용 9개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 최초 제안 경위는 NU 계보 보도이므로 독립 확인 역사로 단정하지 않음.
  - 이전: 산트리의 날은 2014년 6월 27일 말랑의 한 페산트렌 학생들이 당시 대선 후보이던 조코 위도도에게 처음 제안했다고 하며,
  - 이후: 데틱은 NU 공식 사이트를 인용해 2014년 6월 27일 말랑의 한 페산트렌 학생들이 당시 대선 후보이던 조코 위도도에게 산트리의 날을 처음 제안했다고 전하며,

주의:
- 데틱의 제안 경위는 NU 재인용으로 독립 원천이 아니다. 대통령령 전문과 공휴일 여부는 미수집.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/id-santri-day/detik-santri.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/id-santri-day/nu-sejarah.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 힌디어의 날(인도) — `asia:in-hindi-diwas`

**원문 검수 후 수용**

- 드리슈티·나브바라트 본문은 매년 09-14, 1949년 제헌의회 결정과 데바나가리 힌디어를 설명한다. 최초 1953년은 나브바라트 한 매체에 귀속했다. sourceUrl은 Hindi Diwas 자체와 날짜를 지지한다.
- 영어의 동시 채택이라는 법제사 압축은 삭제했다. 간디 발언은 나브바라트의 전언으로 유지했고 수상·학습 도구는 2022년 드리슈티 소개로 제한해 기관·개인 수상과 AI 기능의 과잉 단정을 제거했다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: 국제 모국어의 날 02-21·한글날과 언어·국가·날짜가 다른 힌디어 연방 공용어 채택 기념일.
- evidence-map-round2의 해당 UID 인용 7개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.origin`: 전국의 유일한 언어·국어 지정으로 오해하지 않게 연방 범위 명시.
  - 이전: 인도의 공용어(라즈바샤)
  - 이후: 인도 연방의 공용어(라즈바샤)
- `storytelling.origin`: 1953년 첫 기념을 실제 확인한 매체명에 귀속; 복수 출처로 부풀리지 않음.
  - 이전: 힌디어 매체들은 첫 힌디어의 날이
  - 이후: 힌디어 신문 나브바라트는 첫 힌디어의 날이
- `storytelling.anecdote`: 영어의 과도기 사용·공용어 제도의 법적 경과를 단순 동시 채택으로 압축한 보도는 헌법 원문 없이 유지하지 않음.
  - 이전: 같은 제헌의회는 힌디어와 함께 영어도 공용어로 받아들였다.
  - 이후: (삭제)
- `storytelling.anecdote`: 공용어국 직접 원문이 없으므로 2022년 드리슈티 소개로 귀속. 두 상 모두 개인 수상이라는 일반화와 인공지능 기능 주장을 제거.
  - 이전: 인도 정부 공용어국은 힌디어 발전에 기여한 사람에게 ‘라즈바샤 가우라브상’과 ‘라즈바샤 키르티상’을 주고, 인공지능을 활용해 인도 언어를 배우는 학습 앱 ‘릴라-라즈바샤’ 같은 도구도 내놓았다.
  - 이후: 시험 시사 해설 매체 드리슈티는 힌디어 발전을 위한 ‘라즈바샤 가우라브상’과 ‘라즈바샤 키르티상’, 자기주도 학습 도구 ‘릴라-라즈바샤’를 정부의 힌디어 진흥 사례로 소개한다.

주의:
- 언론·시험 해설 자료이며 정부 공용어국·헌법 원문은 없다. 첫 기념 주최자·네루 결정·세계 힌디어의 날과의 비교는 최종문에 추가하지 않았다.
- 확보된 사실로만 줄였으므로 origin/anecdote 150자 하한을 승인 조건으로 사용하지 않는다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/in-hindi-diwas/drishti-2022.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/in-hindi-diwas/navbharat-history.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 국가 과학의 날(인도) — `asia:in-science-day`

**원문 검수 후 수용**

- 드리슈티는 1986년 인도정부 지정·02-28·1930년 수상·비탄성 산란을, 프라바트 카바르는 1928년 라만 발견·매년 기념·2022년 주제를 지지한다. sourceUrl은 국가 과학의 날 및 2023년 주제를 실제 설명한다.
- 정부 제정 원문 미확보를 드리슈티 귀속으로 드러냈다. 단순 방향 꺾임으로 파장이 변한다는 설명을 삭제했다. 아시아 최초·1987 최초 기념·NCSTC 제안은 최종문에 넣지 않았다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: gov-14(한국 과학의 날 04-21) 및 세계 과학의 날 11-10과 국가·제정 목적·날짜가 다른 라만 발견 기념일.
- evidence-map-round2의 해당 UID 인용 8개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.origin`: 정부 제정 원문을 확보하지 않았으므로 시험 해설 매체에 명시적 귀속.
  - 이전: 인도 정부가 1986년 이날을 국가 과학의 날로 지정했다.
  - 이후: 드리슈티의 설명에 따르면 인도 정부는 1986년 이날을 국가 과학의 날로 지정했다.
- `storytelling.anecdote`: 단순 방향 변화만으로 파장 변화가 생긴다는 부정확한 설명을 제거; 비탄성 산란 정의만 유지.
  - 이전: , 쉽게 말해 빛이 분자에 부딪혀 방향이 꺾일 때 파장이 달라지는 것이다.
  - 이후: .

주의:
- 정부 과학기술부·노벨재단 원문은 미수집. secondary-source review이지 법령·노벨 원본 인증이 아니다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/in-science-day/drishti-2023.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/in-science-day/prabhatkhabar-2022.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 시치고산(일본) — `asia:jp-shichigosan`

**원문 검수 후 수용**

- JAL·ALSOK·잡학네타장은 11-15 연중행사·3/5/7세·신사 또는 절 참배·세 의식·현대 참배일 유연성을 지지한다. 11-15는 대표 날짜이지 모든 가족의 고정 방문일로 쓰지 않았다.
- 귀숙일·수확감사·도쿠마쓰는 복수 기원설로만 남겼다. 상충하는 생일 세부는 삭제했다. 지토세아메는 잡학네타장, 실로 만든 흰머리 의례는 ALSOK 설명에 대응한다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: 같은 11-15의 가마보코·다시마의 날 본문에 시치고산 연관 설명은 있어도 음식 기념일과 아동 성장 의례는 대상이 다름.
- evidence-map-round2의 해당 UID 인용 13개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.origin`: ALSOK는 현대 만 나이도 허용한다고 설명. 현재 대부분이 세는나이를 따른다는 실태 주장 제거.
  - 이전: 대개 남자아이는 세는나이로 3·5세, 여자아이는 3·7세에 참배하며,
  - 이후: 전통적으로 남자아이는 세는나이로 3·5세, 여자아이는 3·7세에 참배하며,
- `storytelling.anecdote`: 출처 오류 가능성이 큰 생일설을 재전파하지 않음. 도쿠마쓰 관련 여러 설 수준만 유지.
  - 이전: 도쿠마쓰 설은 출처마다 그의 생일이라거나 건강을 빌던 날이라고 엇갈린다.
  - 이후: (삭제)

주의:
- 기내지·기업 칼럼·목록 사이트 수준의 자료다. 귀숙일·역사 기원은 학술적으로 확정된 단일 원인으로 쓰지 않는다.
- 일부 가족은 만 나이로 기념하고 11-15 아닌 날 참배한다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-shichigosan/alsok.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-shichigosan/jal-shichigosan.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-shichigosan/zatsuneta.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 경로의 날(일본) — `asia:jp-keiro-no-hi`

**원문 검수 후 수용**

- 내각부 sourceUrl은 국민 축일·9월 셋째 월요일·목적·9월15~21일 범위를 직접 지지한다. 시즈오카시 본문은 1947 노마다니촌→1963 노인복지법→1966 축일→2003 해피먼데이 경과를 지지한다.
- 1948 마을 축일과 1950 효고현은 다카시마야에 귀속했다. resolver는 2026-09-21, 2027-09-20, 2028-09-18을 반환했고 법정 반복 규칙과 일치한다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: gov-41(한국 노인의 날 10-02)·미국 어르신 및 조부모 관련 기념일과 국가·규칙·주체가 다름.
- evidence-map-round2의 해당 UID 인용 8개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- 없음. 원문 지지 서술 유지 또는 날짜 문제로 객체 출력 보류.

주의:
- 1947 마을 행사와 1966 국가 축일 제정을 구분했다. 다카시마야는 상업 칼럼이고 별도 학술 검증 자료는 아니다.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-keiro-no-hi/cao-gaiyou.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-keiro-no-hi/shizuoka-city.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-keiro-no-hi/takashimaya.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 산의 날(일본) — `asia:jp-yama-no-hi`

**보류**

- 내각부는 일반 규칙 08-11뿐 아니라 2020년 08-10, 2021년 08-08 특별 이동을 명시한다. 그런데 현행 스키마 annual-fixed 08-11로 실제 resolver를 호출하면 두 해 모두 08-11이다.
- 본문의 예외 고지만으로 런타임의 알려진 잘못된 날짜가 해결되지 않는다. 역사 예외를 처리하는 날짜 모델이나 명시적 적용연도 제한이 별도 승인되기 전 hold한다. 날짜·스키마는 수정하지 않았다.
- 제정 경과·2010/2013 운동·2016 마쓰모토·2026 다카야마 제10회는 자료에 지지되지만 2026을 축일 10년째로 부르는 표현은 경과 10년으로 고쳐야 한다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: Mountain Day 별칭은 세계 산의 날 12-11에도 등장하나 일본 국민 축일과 국제 기념일은 국가·법정지위·날짜가 다름. 한국 산의 날은 10-18.
- evidence-map-round2의 해당 UID 인용 8개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- `storytelling.anecdote`: 2016→2026은 경과 10년. 10년째라는 서수와 제10회 대회 횟수를 혼동하지 않음; hold이므로 최종 runtime 객체 미출력.
  - 이전: 축일 10년째인 2026년
  - 이후: 축일이 시작된 지 10년이 지난 2026년

주의:
- 2026~2028 계산이 맞는다는 사실만으로 2020/2021의 알려진 오류를 승인하지 않는다. 내각부의 2021-08-09는 대체 휴일이며 산의 날 자체는 08-08이다.
- 아카하타는 일본공산당 기관지 사설이다. 운동 경과만 사용하며 의견 평가를 사실로 옮기지 않는다. held final_anniversary=null.

확인한 파일:
- `src/data/categories.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-keiro-no-hi/cao-gaiyou.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-yama-no-hi/akahata-2016.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-yama-no-hi/kumanichi.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### 세쓰분(일본) — `asia:jp-setsubun`

**보류**

- 일본 국립천문대의 2025 역요항은 입춘 02-03 23:10과 세쓰분 02-02, 2026·2027 역요항은 각각 세쓰분 02-03을 명시한다. 니폰닷컴은 입춘 전날 정의와 이전 네 절기의 전날이라는 유래를 지지한다.
- 작가의 date_support_unverified 보류를 유지한다. 2028 및 한국 ipchun 표의 나머지 범위를 일본 날짜로 지지할 공식 자료가 저장되어 있지 않다. UTC+9라는 사실이나 HKO UTC+8 2050년 입춘 차이만으로 일본 날짜를 증명하지 않았다.
- 현행 서비스 1,787건의 id·원명·별칭·한글명·대상·날짜·국가를 대조: anv-term-ipchun-kr(한국 입춘)과 달리 전날의 일본 민속 행사. 節分/せつぶん/豆まき 동일 관행의 추가 중복 항목 없음.
- evidence-map-round2의 해당 UID 인용 10개를 저장 본문과 엄격한 연속 문자열로 대조해 모두 일치했다. 문자열 일치와 사실 승인은 별도로 판단했다.

수정 또는 보류본 수정 요구:
- 없음. 원문 지지 서술 유지 또는 날짜 문제로 객체 출력 보류.

주의:
- 일본과 한국은 UTC+9이고 HKO는 UTC+8이다. HKO ipchun 2050 차이는 일본 세쓰분의 반증이나 입증으로 사용하지 않는다.
- NAO 2028 역요항 및 지원 전체 범위 자료 확보 후 재검토; 역요항 발표 시기의 추정을 날짜 근거로 쓰지 않는다. held final_anniversary=null.

확인한 파일:
- `src/data/categories.json`
- `src/data/observances.json`
- `src/types/anniversary.ts`
- `src/utils/dateUtils.ts`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-setsubun/nao-2025.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-setsubun/nippon-com.txt`
- `tools/research/workflow/batches/asia-expansion-20261012/records.json`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/jp-setsubun/nao-rekiyou-2026.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/evidence/jp-setsubun/nao-rekiyou-2027.txt`
- `tools/research/workflow/batches/priority-editorial-20261012/report-round2.md`

## 산출물 및 제한

- `reviews-3.json`: 14개 판정, 사유·확인 파일·수정·주의·수용 항목의 전체 final_anniversary.
- `reviews-3.md`: 이 독립 검수 보고서.
- 공식 원본 미수집·2차자료 한계는 각 판정에 명시했다. 새 검색은 수행하지 않았으며 문장 분량을 채우기 위한 사실 추가도 하지 않았다.
- 서비스·관측표·라우트·폰트·footer·이전 초안은 변경하지 않았다. 기존 미커밋 작업은 보존했다.
