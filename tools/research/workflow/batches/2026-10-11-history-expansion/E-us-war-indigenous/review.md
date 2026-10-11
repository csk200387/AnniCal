# Review — E-us-war-indigenous (2026-10-11 history expansion)

Draft only. No src/ data, code, routes or git touched. All evidence bodies saved under `evidence/` (fetched 2026-10-11; several via Wayback `id_` snapshots where the live site returned 403/timeout — noted per file header `RETRIEVED_VIA`).

## Validation (programmatic)
- 9/9 input ids covered; id/name/date/dateType/category untouched (not present in drafts).
- No control characters / newlines / `</script` in origin/anecdote.
- Every `quote_original` found in its `local_evidence_path` (exact or whitespace-normalized; each quote is one contiguous passage). `quote_match` field records which.
- All sourceUrl values are https URLs whose bodies were read and saved.

| name | id | old chars | origin | anecdote | total | evidence |
|---|---|---|---|---|---|---|
| 진주만 추모의 날 | `anv-fixed-12-07-pearl-harbor-remembrance-day-us` | 316 | 537 | 524 | 1061 | 14 |
| 대일전승기념일 (V-J Day) | `anv-fixed-08-15-vj-day-global` | 346 | 538 | 501 | 1039 | 16 |
| 미국 현충일 (National Memorial Day) | `anv-nth-05-l-mon-memorial-day-us` | 336 | 557 | 515 | 1072 | 15 |
| 패트리어트 데이 (9·11 추모의 날) | `anv-fixed-09-11-patriot-day-remembrance-us` | 329 | 544 | 505 | 1049 | 19 |
| 눈물의 길 추모일 (Trail of Tears Commemoration Day) | `anv-fixed-09-16-trail-of-tears-commemoration-day-us` | 328 | 549 | 516 | 1065 | 15 |
| 원주민의 날 (Native American Day) | `anv-nth-10-2-mon-native-american-day-us` | 346 | 531 | 515 | 1046 | 16 |
| 콜럼버스의 날 (Columbus Day) | `anv-nth-10-2-mon-columbus-day-us` | 330 | 565 | 493 | 1058 | 20 |
| 애도의 날 (National Day of Mourning) | `anv-nth-11-4-thu-day-of-mourning-us` | 344 | 542 | 482 | 1024 | 22 |
| 원주민 유산의 날 (National Native American Heritage Day) | `anv-rel-thanksgiving-1-native-american-heritage-day-us` | 316 | 525 | 506 | 1031 | 17 |

## Key corrections to existing text
### 진주만 추모의 날
- 기존 '1994년 미 의회 지정'은 맞음(1994-08-23, Pub. L. 103-308). '관공서에서 조기 게양'은 법이 연방 기관에 조기 게양을 '요청'하는 구조라 표현을 정밀화.
- 기존 출처 nationaldaycalendar.com → NPS 공식 페이지로 교체 제안.
### 대일전승기념일 (V-J Day)
- 기존 origin '항복 선언 자체가 있었던 8월 15일을 종전일로 더 널리 기억한다'는 미국 기준으로 부정확: 미국에서는 트루먼 발표(8/14 저녁 7시)로 8월 14일에 축하가 시작됐고, 미국의 공식 V-J Day는 트루먼이 선포한 9월 2일. 8월 15일은 일본 천황 방송일·영국 공식 V-J Day.
- 기존 '미국 일부 주에서는 지금도 이날을 공식 기념일로 유지'는 로드아일랜드 외 확인 불가 → 삭제. 로드아일랜드 'Victory Day'는 8월 15일이 아니라 8월 둘째 월요일임을 명시.
- sourceUrl Wikipedia → National WWII Museum으로 교체 제안.
### 미국 현충일 (National Memorial Day)
- 기존 '워털루가 1866년 5월 5일 처음 지역 행사를 연 것을 계기로' → VA 자료는 워털루의 '5월 30일' 100년 행사를 1966년에 인정했다고만 기록하며 1866-05-05 날짜는 확인 불가(5월 5일은 GAR 일반명령 제11호 발령일). 또 워털루는 공식 '발상지'로 인정됐을 뿐 '계기'로 단정할 수 없고 조지아주 콜럼버스 등 경쟁 주장이 있음.
- 기존 '여름 휴가철의 시작' 서술은 출처 미확인으로 삭제.
- sourceUrl 'memorial-day-us'(슬러그) → https://www.cem.va.gov/history/Memorial-Day-history.asp 제안.
- category가 'career'로 돼 있으나 지시에 따라 변경하지 않음(검토자 참고).
### 패트리어트 데이 (9·11 추모의 날)
- 기존 '조지 W. 부시 대통령이 이날을 국가 추모일로 처음 선포' → 패트리어트 데이는 의회 공동결의(H.J.Res.71, Pub.L.107-89)로 지정되어 2001-12-18 승인됨. 대통령은 법에 따라 매년 포고문을 내는 구조.
- 기존 '납치범을 제외한 2,977명' → 9/11 Memorial 집계 '90개국 출신 2,977명'으로 표현(납치범 제외 문구는 저장 원문에서 확인 못해 생략).
- 기존 '소방관·경찰 등 초동 구조 인력의 희생도 유난히 컸다' → 구조대원 사망자 수 원문 미확보로 '구조대원들이 건물 안으로 들어갔다'는 확인 사실로 대체.
- sourceUrl Wikipedia → govinfo Pub.L.107-89 제안.
### 눈물의 길 추모일 (Trail of Tears Commemoration Day)
- 기존 '체로키어로는 이 길을 "우리가 울며 걸은 길"이라 부른다' → 1차·공식 출처에서 확인 못해 삭제(민간 사이트에만 'Nunna daul Tsuny' 표기 존재).
- 기존 '9·11 테러 희생자 수보다 많은 것으로 추산될 만큼' → 출처 없는 부적절한 비교로 삭제, NPS의 '정확한 사망자 수는 알 수 없다·버틀러 추산 4,000명 이상'으로 대체.
- 기존 '원주민 공동체는 지금도 매년 이 날을 기리며' → 9월 16일을 지정·주관하는 원주민 공동체/기관 확인 불가. 기념일 성격을 '민간 기념일 달력 기반'으로 정정.
- 기존 '오클라호마까지 이어진 이주 경로는 국립 역사 탐방로' → 맞음(1987 지정, 9개 주) — 유지·구체화.
- daysofyear 등 민간 사이트의 '1838년 마지막 체로키 도착일' 설명은 NPS(1839-03-24)와 충돌.
### 원주민의 날 (Native American Day)
- 관할 명시: 10월 둘째 월요일 'Native Americans' Day'는 사우스다코타주 법정 공휴일(SDCL 1-5-1.2, SL 1990). 기존 '일부 주와 도시에서 콜럼버스의 날을 대체하거나 함께 기념'은 토착민의 날(IPD) 일반론과 섞여 있어 분리.
- 기존 '1990년 사우스다코타주가 처음 이날을 원주민의 날로 바꿨고'는 대체로 맞음. 공식 명칭은 'Native Americans' Day'.
- 기존 '2021년 바이든이 처음으로 "원주민의 날" 포고문' → 바이든이 낸 것은 'Indigenous Peoples' Day'(토착민의 날) 포고문이며 사우스다코타의 Native Americans' Day와 별개. 용어 구분.
- 기존 '570곳이 넘는다' → BIA 현재 표기 575곳.
- 캘리포니아 Native American Day(9월 넷째 금요일)와 혼동 주의 문구 추가.
- sourceUrl 'native-american-day-us'(슬러그) → SD 주법 URL 제안(사람이 읽는 페이지: https://sdlegislature.gov/Statutes/1-5-1.2).
### 콜럼버스의 날 (Columbus Day)
- 기존 '이탈리아계 가톨릭 친목단체 콜럼버스 기사단' → 의회도서관 표현은 '국제 로마 가톨릭 우애 공제회'로, 이탈리아계 단체가 아님.
- 기존 '1937년 루스벨트가 연방 공휴일로 공식 지정' → 1934년 의회법(대통령 포고 요청)+1937년부터 매년 포고(브리태니커·퓨). 연방 법정공휴일(5 USC 6103) 목록 편입은 1968년 Pub.L.90-363, 월요일 시행 1971년.
- 기존 '미국 17개 주가 이날을 원주민의 날로 대체하거나 병행' → 퓨 2025 기준 '17개 주+D.C.가 10월 둘째 월요일에 원주민을 기리는 휴일 보유'가 정확한 표현(이번 콜럼버스 항목에서는 30주/20주 수치로 대체, 17주 수치는 원주민의 날 항목에 배치).
- sourceUrl 'columbus-day-us'(슬러그) → LOC Today in History Oct 12 제안.
### 애도의 날 (National Day of Mourning)
- 기존 내용은 대체로 정확. '연설문을 검열당하자'는 UAINE 원문 기준 '주최 측이 사전 제출된 연설문을 이유로 연설 불허'로 정밀화.
- 기존 '참가자들은 ... 금식하며 연설을 듣는다' → 금식은 '많은 참가자'(Many of us)가 하는 것으로 한정.
- sourceUrl 'day-of-mourning'(슬러그) → https://www.uaine.org/background.htm 제안.
- 1997년 체포 사건은 UAINE 측 서술('peaceful protesters', 'frame-up charges')에 의존 — 본문은 중립적으로 '체포', '기소 취하·합의'만 기술.
### 원주민 유산의 날 (National Native American Heritage Day)
- 핵심 정정: 2008년 법(Pub.L.110-370, 2008-10-08 승인)은 2008년 11월 28일 하루만 지정. 매년 추수감사절 다음 금요일 지정은 2009년 법(Pub.L.111-33, 오바마 2009-06-26 서명).
- 기존 '1990년에는 이미 매년 11월 전체가 전미 인디언 유산의 달로 지정' → 1990년 결의는 1990년 11월만 지정. 매년 포고는 NARA 기준 1994년부터(BIA 연표상 1991년 법은 1991년 및 이후 11월 포고 요청).
- 기존 '조지 W. 부시 대통령이 서명' → 2008년 법 승인 시점 대통령은 부시가 맞으나, 원문(PL)은 'Approved October 8, 2008'만 표기 — 본문에서는 '승인'으로 표현.
- 블랙프라이데이 대비 '의미가 깊다' 류 평가 문구는 사실 서술로 대체.
- sourceUrl 'native-american-heritage-day'(슬러그) → https://www.bia.gov/NNAHM 제안.

## Gaps / reviewer attention
- **눈물의 길 추모일 (09-16)**: no government/tribal body designating Sept 16 found. Calendar sites' rationale ('last Cherokee arrived Oklahoma 1838') contradicts NPS (last detachments 1839-03-24). Draft says so explicitly; reviewer should decide whether to keep the date entry at all.
- **원주민의 날**: drafted as South Dakota's Native Americans' Day (SDCL 1-5-1.2) because date = 10-2-MON. California's Native American Day is 4th Friday of September (distinct). Translation choice: Indigenous Peoples' Day = '토착민의 날' to separate it from '원주민의 날'; check consistency with other app entries.
- **원주민 유산의 날**: 184-tribe figure rests on a reprint of Rep. Baca's press release (uctp.blogspot.com), not an official House page.
- **V-J Day**: Rhode Island statutes and several news/Senate pages were only reachable via Wayback snapshots. 'Only state' claim for RI not used.
- **진주만**: NPS gives both 2,403 and 2,390 — draft says '약 2,400명' and names both.
- **Memorial Day**: entry category is 'career' in input (likely mis-categorized) — not changed per rules. Waterloo '1866-05-05' date in old text unverifiable; removed.
- **Columbus Day**: LOC says FDR 'designated ... national holiday in 1934'; Britannica/Pew say 1937. Draft separates 1934 Act (proclamation request, 36 USC 107 source) from 1937 annual proclamation; 1968 Pub.L.90-363 made it a legal public holiday, Monday rule from 1971.
- Light general-knowledge statements without dedicated quotes: Pearl Harbor = Pacific Fleet base; Pilgrims arrived 1620 on Mayflower; Black Friday; comparison to Korean 현충일. Remove if strict quote coverage is required.
- Not fetched/blocked: cherokee.gov (timeout), congress.gov (403), Britannica direct (used Wayback), schumer.senate.gov, KTLA, WPRI, ProJo.
