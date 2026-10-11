# 희소 생일 날짜 추가 조사 — group-a

## 결과

서비스 데이터 1,734건의 전역 이름·별칭·본문과 해당 날짜의 실제 발생일을 대조했다. 신규 근거 확보 후보는 6건, 보류는 1건, 기존 중복 제외는 3건이다. 승인·서비스 반영·배포는 하지 않았다.

| 날짜 | 신규 후보 | 상태 |
|---|---|---|
| 02-24 | 에스토니아 독립기념일; 국제 SCN2A 인식의 날 | 2건 evidenced |
| 05-26 | 호주 국가 사과의 날; 미국 종이비행기의 날 | 2건 evidenced |
| 06-16 | 국제 가족 송금의 날; 아프리카 어린이의 날 | 2건 evidenced |

에스토니아 독립기념일은 매년 2월 24일이며, 1918년 탈린에서 독립선언서가 인쇄·배포된 날을 기념한다.[1]
국제 SCN2A 인식의 날은 FamilieSCN2A Foundation이 2017년 제정한 매년 2월 24일의 민간 인식 캠페인이다. 날짜는 유전자의 염색체 위치 2q24.3에서 따왔다는 재단 설명을 확보했다.[2]
호주 국가 사과의 날은 강제 가족 분리 피해를 기억하는 매년 5월 26일의 날이며, 첫 기념일은 1998년 5월 26일이었다. 개인적 실수를 가볍게 사과하는 이색 기념일로 설명해서는 안 된다.[3]
종이비행기의 날은 매년 5월 26일에 돌아오며, Space Center Houston은 집에서 해 볼 항공 체험 활동을 안내한다.[4] 미국 범위는 기념일 목록의 본문으로 보조 확인했고, 비공식 기념일 분류는 Wikipedia 본문으로 확인했다.[5][8]
국제 가족 송금의 날은 UN 총회가 채택한 매년 6월 16일의 기념일이다. 이주 노동자가 가족에게 보내는 송금이 가정과 공동체에 미치는 기여를 알리는 취지다.[6]
아프리카 어린이의 날은 AU와 회원국이 매년 6월 16일에 기념한다. 1991년 당시 OAU 정상회의가 제정했으며, 1976년 소웨토 학생 봉기와 아동의 권리를 기억한다.[7]

## 중복 및 날짜 검증

- 해당 날짜의 기존 항목: 토르티야 칩의 날, 블루베리 치즈케이크의 날, 퍼지의 날. 세 건을 rejected_duplicate로 남겼다.
- 전역 원명·한국어·별칭 검색에 신규 6건의 동일 대상은 없었다. 멕시코 관련 넓은 키워드의 음식·역사 언급은 실제 후보와 대상·날짜가 달라 중복이 아니었다.
- 기존 registerAnchors/resolveOccurrence로 2026·2027·2028을 계산했다. 2026/2027의 세 날짜는 각각 기존 음식 기념일 1건이다. 2028-06-16에는 선원의 날(gov-88)도 발생한다.
- 신규 후보 모두 annual-fixed. 별도 verify.mjs에서 동일 resolver로 세 연도의 발생일을 검증한다. 계산은 외부 기념일 존재의 근거가 아니다.

## 접근 제한과 검수 요청

- 멕시코 국기의 날은 gob.mx가 HTTP 200이지만 기사 대신 Challenge Validation만 반환했다. 대체 의회 박물관은 시간초과. 검색 요약만으로 승인하지 않고 blocked로 보존했다. CNDH PDF는 후속 조사 리드로만 남겼다.
- 호주 보건부 시간초과·의회 403은 Reconciliation Australia 본문으로 대체했다. National Day Calendar의 종이비행기 페이지 403은 Space Center Houston 본문으로 대체했다.
- 확인하지 못한 제정 연도·주체는 서술하지 않았다. 대상의 일반 역사를 기념일 제정 역사로 바꾸지 않았다.
- 한국 신규 기념일의 원문 근거는 이번 검색에서 확보하지 못했다. 음식 외 국제·타국 기념일을 정확한 범위로 제시했다.
- 독립 검수자는 각 직접 인용을 로컬 원문과 재대조하고, 지역·공식성·별칭·반복 규칙 및 한국어 초안을 확인해야 한다. evidenced는 승인 상태가 아니다.

## 산출물

- records.json: 신규·보류·중복 후보, 한국어 초안, 직접 인용과 원문 경로
- search-log.json: 날짜별 실제 검색어, 후보 판정, 접근 실패와 대체 경로
- duplicate-check.json: 중복 대조 방법과 넓은 키워드의 실제 일치 목록
- evidence/: 읽은 본문 텍스트와 실패 기록
- citation-ledger.json: 작업 전용 번호·URL·직접 인용 원장
- verify.mjs / verification.json: 필드·인용·resolver 검사

## Sources

[1] https://visitestonia.com/en/what-to-do/february-24-estonias-independence-day — February 24 — Estonia's Independence Day!February 24 — Estonia's Independence Day!
    > "It was then printed and distributed in Tallinn on February 24, 1918, the date now celebrated as Estonia's Independence Day."
    > "Each year, February 24th is marked by fireworks, concerts, a parade of the Defense Forces, and a presidential reception."
[2] https://www.scn2a.org/programs-events/events/scn2a-awareness-day — SCN2A Awareness Day – FamilieSCN2A Foundation
    > "In 2017, the FamilieSCN2A Foundation established International SCN2A Awareness Day, celebrated each year on February 24th — a date chosen because the SCN2A gene is located on the long (q) arm of chromosome 2 at position 24.3."
    > "Wear blue (autism), purple (epilepsy), or green (movement disorders)"
[3] https://www.reconciliation.org.au/national-sorry-day-2020 — National Sorry Day - Reconciliation Australia
    > "Every year on 26 May, National Sorry Day remembers and acknowledges the mistreatment of Aboriginal and Torres Strait Islander people who were forcibly removed from their families and communities, which we now know as ‘The Stolen Generations’."
    > "The first National Sorry Day was held on 26 May 1998,  one year after the Bringing Them Home report was tabled in Parliament."
[4] https://spacecenter.org/national-paper-airplane-day-2025 — Get Ready to Take Flight on National Paper Airplane Day! - Space Center Houston
    > "National Paper Airplane Day occurs annually on May 26."
    > "This year, we invite you to celebrate our friends in flight with hands-on aircraft activities."
[5] https://nationaltoday.com/national-paper-airplane-day — National Paper Airplane Day — May 26, 2027 | National Today
    > "Where:
 United States
 Date change rule:
 Every May 26"
[6] https://www.un.org/en/observances/remittances-day/background — International Day of Family Remittances - BACKGROUND | United Nations
    > "The International Day of Family Remittances (IDFR) is a universally-recognized observance adopted by the United Nations General Assembly and celebrated every year on 16 June."
    > "But behind the global numbers are individual remittances of US$200 or $300 that migrants send home regularly, so that their families can buy food, pay for housing, and meet necessary expenses."
[7] https://au.int/en/newsevents/20200616/day-african-child-2020 — Day of the African Child 2020 | African Union
    > "Like every year on 16 June, the African Union and its Member States observe the Day of the African Child (DAC) as a commemoration of the 16th June 1976 student uprising in Soweto, South Africa, where students who marched in protest against apartheid-inspired education, were brutally murdered."
    > "In 1991, the Assembly of Heads of State and Government of the then OAU instituted the Day of the African Child (DAC) in memory of the 16th June 1976 student uprising in Soweto, South Africa."
[8] https://en.wikipedia.org/wiki/National_Paper_Airplane_Day — National Paper Airplane Day - Wikipedia
    > "National Paper Airplane Day is an unofficial observance, celebrated on May 26 each year in the United States to commemorate the simple aeronautical toy."
