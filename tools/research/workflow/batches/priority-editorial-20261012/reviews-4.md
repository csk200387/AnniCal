# 독립 원문 검수 — scope 4

배정 13건 전부 검수: 원문 검수 후 수용 13건 / 보류 0건.
수용은 독립 사실 검수의 추천이며 사용자 게시·배포 승인이 아니다. 서비스 1787건은 읽기만 했고 신규 검색·서비스 변경·커밋·배포는 하지 않았다.

## 검증
- 배정 UID 누락·중복 0. evidence-map 111개 인용 모두 저장 본문에 문자 그대로 존재. 원본 배치 records.json의 해당 후보와 불확실성도 대조.
- sourceUrl 본문, 존재·국가/지역·연례 규칙, folklore/역사·현재 구분 및 현재 1787건과 별칭/의미 중복을 점검.
- 실제 dateUtils.ts의 registerAnchors/resolveOccurrence를 메모리 내 transpile하여 2026·2027·2028년 39개 발생일 계산 성공. routes.urlDate는 사용하지 않음.
- 둘째 월요일 성인의 날: 2026-01-12 / 2027-01-11 / 2028-01-10. 마지막 월요일 영웅의 날: 2026-08-31 / 2027-08-30 / 2028-08-28. 나머지 11건은 저장 양력 월일 그대로 계산.
- Naadam 7/11~13, Songkran 4/13~15, Simbang Gabi 12/16~24, Kaamatan 한 달 행사 및 마지막 이틀 5/30~31을 최종 본문에 명시.
- 해당 범위에는 annual-tabulated 항목이 없어 HKO/KST 2040 추석·2041 추분 차이 영향 항목 없음. jp-setsubun은 배정 밖이며 기존 저자 보류를 변경하지 않음.
- JSON에 모든 수용 항목의 완전한 final_anniversary와 before/after 수정 내역을 보존. ID/date/dateType/category/tags 불변. 원문 숫자·제정 연도 미확인 주장은 늘리지 않음.

## 항목별 판단

### asia:jp-seijin-no-hi — 원문 검수 후 수용
- 성인의 날(일본): annual-nth-weekday `01-2-MON`
- 판단: 내각부 원문이 법정 목적·둘째 월요일 및 2026·2027 실제 일자를 뒷받침한다. 1946년 청년제는 고단샤 기고와 nippon.com 본문을 대조했다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: gov-27(한국 성년의 날, 05-3-MON)은 국가·법정 근거·날짜가 달라 별개. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: 1월 초 개최 비율과 18·20세 대상 혼재는 2024년 기고 설명이지 전국 최신 실태조사가 아니다. 기고 시점으로 귀속했다. 청년제의 특정 일자 11월 22일은 확정하지 않았다.
- 수정 필드: storytelling.origin, storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-keiro-no-hi/cao-gaiyou.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-seijin-no-hi/gendai.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/jp-seijin-no-hi/nippon-com.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:mn-naadam — 원문 검수 후 수용
- 나담(몽골): annual-fixed `07-11`
- 판단: UNESCO 본문이 매년 7월 11~13일 몽골 전역의 축제와 2010년 등재를 명시한다. iKon은 2026년 휴일 조정 결정을 보도한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: 원명·Naadam·Наадам과 날짜·몽골 범위를 대조해 현행 동의미 항목 없음. 07-11 인구 관련 기념일과 별개. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: UNESCO ICM 뉴스레터와 UNESCO 유산 페이지를 독립된 2개 증거로 세지 않았다. 법정 휴일 전체 기간을 확인한 것은 아니다. 2026년 7월 10~19일 휴무는 6월 24일 발표된 결정으로만 서술하며, 실제 실시를 추가 확인한 것은 아니다. UNESCO의 최근 훈련 체계 설명은 등재 소개문 시점의 표현으로 귀속한다.
- 수정 필드: storytelling.origin, storytelling.anecdote, memes[0].caption
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/mn-naadam/unesco-ich.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/mn-naadam/unescoicm.txt`
  - `tools/research/workflow/batches/priority-editorial-20261012/evidence/mn-naadam/ikon-3ohf.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:my-malaysia-day — 원문 검수 후 수용
- 말레이시아의 날: annual-fixed `09-16`
- 판단: Kosmo 본문이 1963년 9월 16일 출범과 2009년 발표·2010년 전국 공휴일화를 명시한다. Utusan Sarawak에서 네 구성 지역을 확인했다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: Hari Malaysia/Malaysia Day·09-16·연방 결성 의미로 대조해 중복 없음. 8월 31일 독립과 혼동하지 않는다. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: Utusan Sarawak의 연기 원인 설명이 자체적으로 반복·혼재한다. 특히 코볼드 보고 대기를 8월 31일→9월 16일 연기의 원인으로 옮긴 문장은 근거와 맞지 않아 제거했다. 초기 사바·사라왁 휴일 범위는 두 기사 설명이 달라 세부 단정을 제거했다. 2021년 헌법 개정은 당시 계획으로만 유지. 이후 통과 여부는 확인하지 않았다.
- 수정 필드: storytelling.origin, storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/my-malaysia-day/kosmo-2021.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/my-malaysia-day/utusansarawak-15930.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:my-kaamatan — 원문 검수 후 수용
- 카아마탄(말레이시아 사바): annual-fixed `05-30`
- 판단: 사바주립도서관은 5월 30~31일 연례 행사, 사바·라부안 범위, 어원·후미노둔 설화·운둑 응아다우를 명시한다. Malay Mail은 한 달 축제의 마지막 이틀을 설명한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: Pesta/Tadau Kaamatan·사바/라부안·05-30을 대조해 중복 없음. 사라왁 Gawai와 공동체·지역이 다르다. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: 2017년 전국 휴일 검토는 The Star를 재인용한 Malay Mail 보도. 검토 결과와 현재 라부안 공휴일 지위는 확인하지 않았다. 설화는 역사적 사건이 아닌 전승으로 표시했다. 05-30은 한 달 전체 축제의 최초 개막일이 아니라 마지막 이틀 행사의 시작일이다.
- 수정 필드: storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/my-kaamatan/malaymail-2017.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/my-kaamatan/sabah-library.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:my-gawai — 원문 검수 후 수용
- 가와이 다약(말레이시아 사라왁): annual-fixed `06-01`
- 판단: Utusan Sarawak 역사 기고가 매년 6월 1일·사라왁 지역 공휴일을 명시한다. Berita Harian은 2026년 6월 4일 대체휴일 지정을 발표 시점에서 보도한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: Gawai/Hari Gawai Dayak·사라왁·06-01로 동의미 항목 없음. 과거 명칭 Hari Sarawak을 현대 다른 사라왁 기념일과 합치지 않는다. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: 역사 기고의 1962-06-01 월요일 주장은 달력 계산(금요일)과 모순된다. 해당 요일과 첫 공휴일 연도 단정을 제거해 출처 오류를 확산하지 않았다. 정확한 개칭 연도 1964/1965 및 6월 1~2일 전체 휴일 범위는 미확인. 1964년 4월 논의와 이후 개칭을 기고에 귀속했다. 대체휴일은 당시 지정 발표이지 시행 사후 확인이 아니다.
- 수정 필드: storytelling.origin, storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/my-gawai/bharian-2026.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/my-gawai/utusansarawak.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:ph-heroes-day — 원문 검수 후 수용
- 영웅의 날(필리핀): annual-nth-weekday `08-L-MON`
- 판단: 법률 본문이 정규 공휴일 목록의 Last Monday of August를 명시한다. Negros Weekly 2025-08-26 기사가 전날 산카를로스 헌화식을 실제 보도한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: National Heroes Day/Araw ng mga Bayani·필리핀·08-L-MON으로 동의미 항목 없음. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: 법률 원문은 2007-07-25를 표기한다. 2026~2028 대통령의 연도별 포고는 미수집이며 계산 결과가 연도별 공고를 검증한 것은 아니다. 단일 시의 사례를 전국 지방정부 관행으로 확대하지 않았다. 법률의 수요일·일요일 이동 조문은 영웅의 날 고유 규칙이 아니므로 본문에서 제거했다.
- 수정 필드: storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/ph-heroes-day/lawphil-9492.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/ph-heroes-day/negrosnow.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:ph-simbang-gabi — 원문 검수 후 수용
- 심방가비(필리핀): annual-fixed `12-16`
- 판단: Philstar 본문은 12월 16~24일 9일 미사를 명시하며 LiCAS는 노베나·새벽 미사·민간 소원 믿음·음식을 설명한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: Simbang Gabi/Misa de Gallo/Misa de Aguinaldo·필리핀·12-16로 동의미 항목 없음. 기존 성탄절·이브와는 별개의 9일 전례. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: Philstar와 LiCAS의 기원 연대·장소 설명이 달라 1587 멕시코설 등 세부 연대는 제외했다. 세계에서 가장 긴 크리스마스 시즌이라는 최상급 및 12월 16일이 시즌의 최초 시작이라는 단정은 제거했다. 24일 새벽의 아홉 번째 미사와 별도의 성탄 자정 미사를 혼동하지 않도록 날짜 범위만 명시했다. 소원 성취는 믿음으로만 유지.
- 수정 필드: storytelling.origin
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/ph-simbang-gabi/licas.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/ph-simbang-gabi/philstar-2012.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:sg-total-defence-day — 원문 검수 후 수용
- 총방위의 날(싱가포르): annual-fixed `02-15`
- 판단: Concord 교육부 학교 페이지가 매년 2월 15일과 1942년 함락을 명시한다. SG101은 2023-09-15자 설명으로 경보 신호를 안내한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: 싱가포르 인종 화합의 날(anv-fixed-07-21-singapore-racial-harmony-day)은 날짜·주제·기념 계기가 달라 별개. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: SG101의 오후 6시 20분 및 SGSecure 20초를 2023년 설명에 명시적으로 귀속했다. 현재 또는 2026년 경보 시각을 재확인한 것은 아니다. 두 정부 계열 도메인을 독립 근거 2개로 세지 않았다. 최초 지정 연도는 미확인.
- 수정 필드: storytelling.origin, storytelling.anecdote, memes[0].caption
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/sg-total-defence-day/concordpri.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/sg-total-defence-day/sg101.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:th-songkran — 원문 검수 후 수용
- 송끄란(태국): annual-fixed `04-13`
- 판단: 정부 홍보국은 보통 4월 13~15일 사흘과 전통적 의미를 명시한다. 관광청은 공식 사흘 국가 공휴일과 유네스코 성명을 인용한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: Songkran/วันสงกรานต์·태국·04-13을 대조해 중복 없음. 다른 나라의 같은 시기 새해와 별개. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: 정부 홍보국과 TAT는 같은 정부 계열. TAT의 유네스코 성명 인용은 유네스코 원문 직접 열람이 아니다. Thairath 2569 목록은 다른 행의 날짜·요일 오류가 있어 최신 공휴일 전체표 검증 근거로 쓰지 않았다. 2026년 공휴일이었다는 사후 단정도 삭제. 2027·2028 내각 공휴일 공고는 미수집. 고정 기간의 반복 근거와 천문학적 양자리 진입일을 구분했고 지역 축제는 더 길어질 수 있다.
- 수정 필드: storytelling.origin, storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/th-songkran/prachachat.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/th-songkran/thairath-2899469.txt`
  - `tools/research/workflow/batches/priority-editorial-20261012/evidence/th-songkran/prd-239093.txt`
  - `tools/research/workflow/batches/priority-editorial-20261012/evidence/th-songkran/tatnews-2023.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:tw-228-peace-day — 원문 검수 후 수용
- 228 평화기념일(대만): annual-fixed `02-28`
- 판단: NOWnews 본문에서 기념일 역사·희생자 추모·사건 맥락을 확인했고 UDN은 2026년 2월 28일 국정 공휴일을 노동부 설명으로 보도한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: gov-1(대구의 1960년 2ㆍ28민주운동)은 국가·사건이 다른 별개. 같은 양력 날짜만으로 중복이 아니다. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: NOWnews의 첫 법정 국정 공휴일이라는 최상급은 독립 법령 대조가 없어 삭제했다. 해당 기사에는 1947년이 2차대전 후 1년 미만이라는 오류도 있으므로 그 표현을 전파하지 않았다. 조례 원문 및 기금회 원자료는 미수집. 법제 연혁·사건 설명을 매체에 귀속했다. 대체휴무는 모든 토요일에 자동 적용하는 규칙이 아니라 노동자의 약정 휴일과 겹칠 때 적용한다.
- 수정 필드: storytelling.origin, storytelling.anecdote, memes[0].caption
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-228-peace-day/nownews-6372410.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-228-peace-day/udn-9347148.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:tw-indigenous-day — 원문 검수 후 수용
- 원주민족일(대만): annual-fixed `08-01`
- 판단: 행정원 원문이 2016-07-29 명정 동의, 1994-08-01 정명 및 1997년 집단적 권리 표현을 설명한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: 국제 원주민의 날(08-09), 미국 원주민의 날·유산의 날은 날짜·제정 범위가 다른 별개. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: News Lens는 중앙사·행정원·원민회 자료를 재인용한다. 독립된 2개 근거로 세지 않았다. 2016년 사과는 보도 당시 예정으로만 유지하며 실제 행사 개최를 검증했다고 하지 않는다. 2005년 이전 경과 및 공휴일 범위는 미확인. 2016년 동의를 최초 제정으로 확대하지 않았다.
- 수정 필드: 없음 — 기존 매체 귀속·예정 표현 유지.
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-indigenous-day/ey-7df9.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-indigenous-day/newslens-45468.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:tw-disaster-prevention-day — 원문 검수 후 수용
- 국가방재일(대만): annual-fixed `09-21`
- 판단: 행정원 본문이 매년 9월 21일 방재일과 2024년 훈련 계획을 명시한다. CNA와 NOWnews의 본문도 대조했다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: 한국 방재의 날(05-25)·문화유산 방재의 날(02-10), 국제 자연재해 감소의 날(10-13)과 국가·날짜·계기가 다르다. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: CNA가 전한 2018년 소방국 수치 2455명과 NOWnews의 2415명은 상충한다. 사망·부상자 숫자를 삭제했다. 2000/2002 지정·개칭은 원 공고 미수집이고 기존 기록도 불확실성을 지적해 특정 연도 단정 대신 2000년대 초 매체 설명으로 축소했다. 2024년 경보와 TV 전환은 발표 시점 예정으로만 유지. 2026년 실시 완료라고 하지 않는다. 1935년 수치는 추가 일차자료 없이 비교 수치를 늘릴 필요가 없어 삭제했다.
- 수정 필드: storytelling.origin, storytelling.anecdote
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-disaster-prevention-day/cna-2018.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-disaster-prevention-day/ey-0d22.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/tw-disaster-prevention-day/nownews-6876428.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`

### asia:vn-doctors-day — 원문 검수 후 수용
- 의사의 날(베트남): annual-fixed `02-27`
- 판단: 문화일보 본문이 매년 2월 27일·1955년 편지·1985년 공식 결정을 설명한다. 국회 기관지는 2025년 2월 26일 70주년 기념식 참석을 실제 보도한다. 주장별 evidence-map 인용은 저장 본문과 모두 문자 그대로 일치한다. sourceUrl은 기념일 존재·날짜를 뒷받침하는 실제 읽은 본문에 대응한다. 현행 1787건의 이름·ID·sourceUrl와 원명·별칭·국가·기념 의미·날짜 규칙을 대조했다: 기존 의사의 날(anv-fixed-03-30-doctors-day-global)은 03-30·미국 유래로 베트남 02-27·호찌민 서한과 다르다. 치과의사·수의사의 날과도 직업 범위가 다르다. 현재 runtime 스키마·category/tags를 유지하고 ID·date·dateType을 바꾸지 않았다. 실제 resolveOccurrence로 2026·2027·2028년(윤년) 계산을 확인했다.
- 남은 불확실성: lương y phải như từ mẫu는 원 서한 직접 대조가 아니라 국회 기관지에 실린 문자열과 의미를 검토한 인용이다. 매체 귀속을 유지했다. 의료인 전통일과 1985년 공식 결정을 구별했다. 출처가 각각의 매체라고 해서 모든 역사 주장이 독립 검증됐다고 하지 않는다.
- 수정 필드: 없음 — 기존 매체 귀속·예정 표현 유지.
- 실제 확인 파일:
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/vn-doctors-day/baovanhoa-207161.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/evidence/vn-doctors-day/daibieunhandan.txt`
  - `tools/research/workflow/batches/asia-expansion-20261012/records.json`
