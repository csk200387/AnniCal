# 우선검토 후보 59개 작업 결과

**상태(2026-10-13 갱신): 59개 전부 로컬 반영. 1·2차 54개 + 보류 해제 5개(held-resolution-20261013) = 59개, 보류 0개, 로컬 총 1,815개. 커밋·배포 미실행.**

> 아래 '보류 5개' 이유는 2026-10-13 00:33 시점 스냅샷으로 남겨 둔다. 해제 근거·날짜표·검증은 `tools/research/workflow/batches/held-resolution-20261013/report.md` 참조.

## 검증

- 1차 31개 + 2차 23개 = 추가 54개. 기존 1,756개 → 로컬 총 1,810개.
- 2차 시작 시점의 기존 1,787개 항목 객체와 상세 URL이 모두 보존됐다.
- 본문 근거 인용 총 508개 문자 일치 확인. 문자열 일치와 번역·사실 검수는 구별한다.
- 추가한 상세 프리렌더 54개 모두 이름·본문 확인.
- npm run verify 통과: 슬러그 검사, 앱 빌드, API 타입 검사, 23개 테스트 파일·191개 테스트. (3차 보류 해제 후 재실행: 23개 파일·198개 테스트 통과, 프리렌더 상세 1,815개)
- 3차(보류 해제 5개): 기존 1,810개 객체·routes 1,810개·observances 기존 38키 값 불변, 새 5개 프리렌더 이름·본문·표시 날짜·허브 링크 확인, 본문 근거 인용 52개 문자 일치.
- OG 폰트 3종 재생성, OG_VERSION=4, 정적 OG 6장 갱신.

## 보류 5개 (2026-10-13 00:33 스냅샷 — 이후 전부 해제)

- 마르자나: 3월 21일이 흔한 관행이지만 엄격한 고정일 규칙 아님.
- 중국 농민 풍수절: 한국 추분 표와 홍콩 공식 연표가 2041년 하루 차이.
- 홍콩 다이항 불용춤: 한국 추석 anchor와 홍콩 음력이 2040년 하루 차이.
- 일본 산의 날: 2020·2021년 공식 날짜 이동을 annual-fixed가 처리하지 못함.
- 일본 세쓰분: 한국 입춘 표를 일본 날짜로 사용하기 위한 공식 지원 범위 부족. 2028년 공식 자료 미확보.

이 날짜 모델 문제를 이번 본문 반영 작업에서 임의로 수정하지 않았다. 전용 표·역사 예외 처리 후 재검토한다.

## 보류 해제 5개 (2026-10-13, 사용자 승인)

- 마르자나: annual-fixed 03-21을 **대표 날짜**로 두고 본문 첫 150자에 '실제 행사는 그 무렵 다른 날에도 열린다'를 명시. sourceUrl을 수집 원문(aa-8dQb-upUW-GRZW)으로 교정, 체신 지역의 '베스키디 밖' 조건과 과거/현재 시제를 교정.
- 중국 농민 풍수절: 새 키 `chubun-cn`(HKO 추분, UTC+8, 2020~2069). 2041년 09-22.
- 홍콩 다이항 불용춤: 새 키 `lunar-08-14-hk`(HKO 음력 8/14, 2020~2069). 2040년 09-19. 바다 투입은 전통 서술로만, 근년 소각로 보도 병기.
- 일본 산의 날: 새 키 `yama-no-hi-jp`(祝日法 08-11, 2020 08-10·2021 08-08, 2020~2069). 2021-08-09는 대체휴일.
- 세쓰분: annual-fixed 02-03을 **대표 날짜**로 두고 origin 첫머리에 '정확한 날짜는 입춘 전날'과 2021·2025년 2월 2일을 명시. 실제 발생일 검증 완료로 기록하지 않음.
- 원래 후보 ID 5개를 그대로 유지했다(일부 ID 접두사 rel/fixed가 현재 dateType과 다르지만 URL·ID 안정성을 우선).

## 추가 전체 목록

| 이름 | 상세 경로 |
|---|---|
| 세계 이해와 평화의 날(로터리) | `/day/02-23/rotary-world-understanding-peace-day` |
| 세계 뱀의 날 | `/day/07-16/world-snake-day` |
| 순국자의 날(미얀마) | `/day/07-19/myanmar-martyrs-day` |
| 우크라이나 독립기념일 | `/day/08-24/ukraine-independence-day` |
| 명왕성 강등의 날 | `/day/08-24/pluto-demoted-day` |
| 국제 약물 과다복용 인식의 날 | `/day/08-31/international-overdose-awareness-day` |
| 국제 아프리카계 사람들의 날 | `/day/08-31/international-day-people-of-african-descent` |
| 영화의 날(한국) | `/day/10-27/film-day` |
| 인도 헌법의 날 | `/day/11-26/india-constitution-day` |
| 고아 해방의 날(인도) | `/day/12-19/goa-liberation-day` |
| 후디 후 데이 | `/day/02-20/hoodie-hoo-day` |
| 퀸카로 살아남는 법의 날 | `/day/10-03/mean-girls-day` |
| 잇츠 고나 비 메이 데이 | `/day/04-30/its-gonna-be-may-day` |
| 어스 윈드 앤 파이어 데이 | `/day/09-21/earth-wind-and-fire-day` |
| 타우의 날 | `/day/06-28/tau-day` |
| 닌자의 날(일본) | `/day/02-22/ninja-day` |
| 애플데이 | `/day/10-24/apple-day` |
| 갤런타인데이 | `/day/02-13/galentines-day` |
| 뽁뽁이 감사의 날 | `/day/01-26/bubble-wrap-appreciation-day` |
| 사치의 날(브라질) | `/day/10-31/dia-do-saci-br` |
| 산투 안토니우의 날(브라질) | `/day/06-13/santo-antonio-day-br` |
| 일곱 잠꾸러기의 날(독일) | `/day/06-27/siebenschlaefertag` |
| 독일 맥주의 날 | `/day/04-23/german-beer-day` |
| 라 토마티나(스페인) | `/day/08-26/la-tomatina` |
| 리바르테메 산타 마르타 순례(스페인) | `/day/07-29/ribarteme-santa-marta` |
| 생트카트린 축일(프랑스) | `/day/11-25/sainte-catherine` |
| 할머니의 날(프랑스) | `/day/03-01/grandmothers-day` |
| 소년·남자친구의 날(폴란드) | `/day/09-30/boys-day-pl` |
| 나이카놈똠의 날(태국) | `/day/03-17/nai-khanom-tom-day-th` |
| 흐드렐레즈(튀르키예) | `/day/05-06/hidirellez-tr` |
| 520 데이(대만) | `/day/05-20/520-day-tw` |
| 중국 인민경찰절 | `/day/01-10/chinese-peoples-police-day` |
| 중국 항천일 | `/day/04-24/china-space-day` |
| 중국 식수절 | `/day/03-12/tree-planting-day` |
| 경칩 다샤오런(홍콩) | `/day/03-05/gyeongchip-villain-hitting-hk` |
| 바틱의 날(인도네시아) | `/day/10-02/national-batik-day-id` |
| 산트리의 날(인도네시아) | `/day/10-22/national-santri-day-id` |
| 힌디어의 날(인도) | `/day/09-14/hindi-diwas` |
| 국가 과학의 날(인도) | `/day/02-28/national-science-day` |
| 시치고산(일본) | `/day/11-15/shichigosan` |
| 경로의 날(일본) | `/day/09-21/respect-for-the-aged-day` |
| 성인의 날(일본) | `/day/01-12/coming-of-age-day` |
| 나담(몽골) | `/day/07-11/naadam-mn` |
| 말레이시아의 날 | `/day/09-16/malaysia-day-my` |
| 카아마탄(말레이시아 사바) | `/day/05-30/kaamatan-my` |
| 가와이 다약(말레이시아 사라왁) | `/day/06-01/gawai-dayak-my` |
| 영웅의 날(필리핀) | `/day/08-31/national-heroes-day-ph` |
| 심방가비(필리핀) | `/day/12-16/simbang-gabi-ph` |
| 총방위의 날(싱가포르) | `/day/02-15/total-defence-day-sg` |
| 송끄란(태국) | `/day/04-13/songkran-th` |
| 228 평화기념일(대만) | `/day/02-28/peace-memorial-day-tw` |
| 원주민족일(대만) | `/day/08-01/indigenous-peoples-day-tw` |
| 국가방재일(대만) | `/day/09-21/national-disaster-prevention-day-tw` |
| 의사의 날(베트남) | `/day/02-27/vietnamese-doctors-day-vn` |
| 마르자나 보내기(폴란드) | `/day/03-21/marzanna-pl` |
| 중국 농민 풍수절 | `/day/09-23/chubun-cn-farmers-harvest-festival` |
| 다이항 불용춤(홍콩) | `/day/09-24/tai-hang-fire-dragon-hk` |
| 산의 날(일본) | `/day/08-11/mountain-day` |
| 세쓰분(일본) | `/day/02-03/setsubun` |

## 범위 밖 미완료 작업

아시아 추가 발굴의 네팔·방글라데시·스리랑카 조사는 이번 우선검토 59개 작업과 별개로 미완료다. 이번 완료는 해당 59개 후보의 본문 작성·검수 판정 및 로컬 반영을 뜻한다.
