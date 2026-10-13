# 이색·비공식 기념일 발견 조사 보고 (quirky-discovery-20261012)

> **서비스 반영 미실행.** 월별 JSON·routes·slug 수정, commit, push, 배포 모두 하지 않았다. 아래는 발견 기록이며 승인·검수 완료가 아니다. 기존 footer·기존 연구 배치도 건드리지 않았다.

- 기록 44건 = 조사 후보 29건 + 기존 항목 중복 15건
- 고유 신규 후보(중복·차단 제외): **28건** (목표 15~20건)
- 상태: `documented_unofficial` 15, `date_conflict` 4, `discovered_unverified` 9, `blocked` 1, `duplicate` 15
- 종류(중복 제외): 이상한 행동 7, 말장난·밈 8, 관계 6, 물건·취미 5, 미신 3
- 신뢰수준(중복 제외): 높음 10, 중간 10, 낮음 9

## 공식 기념일 조사와 달라진 기준

- 공식 기관·법령 근거가 없어도 제외하지 않았다. 대신 "공식 지정 근거 없음"과 "인터넷에서도 존재 근거 없음"을 구분했다.
- 기념일 목록 사이트 1곳뿐이어도 `discovered_unverified`(단일 목록 출처)로 남겼다. 상업 달력만 있으면 그렇게 표시했다.
- 제정자·유래는 원문이 말한 만큼만 적었다. 원문이 "~라고 한다", "some credit"처럼 단정하지 않으면 그대로 표시했다.
- WebSearch 요약만 본 내용은 "검색결과만 확인"으로 두고 인용하지 않았다. 원문 차단(403·404·타임아웃·빈 본문)은 우회를 반복하지 않고 기록만 했다.
- 날짜를 기억이나 추정으로 채우지 않았다. 출처끼리 날짜가 다르면 `date_conflict`, 날짜를 못 찾으면 "날짜 미확정".
- 승인 흐름 상태(evidenced/approved/applied)와 섞지 않으려고 발견 전용 상태를 썼다:

  - `documented_unofficial` — 비공식이지만 언론·단체·백과 원문 1곳 이상 또는 독립 원문 2곳에서 존재·날짜 확인
  - `discovered_unverified` — 기념일 목록 사이트·약한 출처 원문만 읽음(단일 목록 출처 포함). 존재는 보이나 독립 확인 부족
  - `date_conflict` — 존재는 확인했지만 출처끼리 날짜가 갈림
  - `blocked` — 원문을 못 읽음(검색결과만 확인) 또는 날짜 미확정
  - `duplicate` — 서비스 1,756건에 이미 있는 항목

## 이상한 행동 (7건)

| 이름 (원명) | 날짜 | 한 줄 의미 | 상태 · 신뢰 | 원문 | 출처 |
|---|---|---|---|---|---|
| 후디 후 데이 (Hoodie Hoo Day) | 02-20 | 정오에 밖에 나가 두 손을 흔들며 "후디 후!"라고 외쳐 겨울을 쫓는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://cs.observer-reporter.com/opinion/2017/feb/26/hoodie-hoo-a-fun-break-from-pennsylvania-winter/) · [2](https://www.pearsoncanadaschool.com/special-days-calendar/hoodie-hoo-day.html) |
| 내 묘비명 미리 쓰는 날 (Plan Your Epitaph Day) | 11-02<br>※ 11-02(Checkiday) vs 04-06·11-02 두 번(National Today). 단일 날짜 미확정 | 살아 있을 때 자기 묘비에 남길 한 줄을 미리 써 보는 날<br>⚠️ 죽음 소재. 추모·상실 맥락과 섞지 말고 가벼운 글쓰기 놀이로만 소개 | `date_conflict` · 중간 | 원문 3건 | [1](https://www.checkiday.com/3ce46e075a82cee8774f7e4215c8b786/plan-your-epitaph-day) · [2](https://nationaltoday.com/plan-your-epitaph-day/) · [3](https://recess.ufl.edu/holidays/2001/plan-your-epitaph-day) |
| 거짓말하는 날 (Tell a Lie Day) | 04-04 | 해 없는 거짓말 하나쯤 해 보라는 날(만우절 사흘 뒤)<br>⚠️ 거짓말 장려로 읽힐 수 있음. 사기·허위정보 연상 피하고 무해한 장난 범위로 한정 | `documented_unofficial` · 중간 | 원문 1건 | [1](https://www.christianpost.com/news/tell-a-lie-day-today-but-should-you-celebrate.html) |
| 바보 같은 질문 하는 날 (Ask a Stupid Question Day) | 09-28<br>※ 기본 09-28. 위키백과: 원래 9월 마지막 수업일, 1982년 제정 시 9월 30일. 9월 마지막 수업일 규칙은 현재 dateType 으로 표현 불가 | "바보 같은" 질문도 마음껏 하자는 날 | `date_conflict` · 중간 | 원문 2건 | [1](https://www.leinsterleader.ie/news/when-is-ask-a-stupid-question-day-7039097) · [2](https://en.wikipedia.org/wiki/Ask_a_Stupid_Question_Day) |
| 양말 안 신는 날 (No Socks Day) | 05-08 | 하루 양말을 벗고 맨발·샌들로 지내는 날 | `discovered_unverified` · 낮음 | 원문 1건 (단일 목록 출처) | [1](https://www.daysoftheyear.com/days/no-socks-day/) |
| 북미 코브라에게 "퍼지!"라고 외치는 날 (Yell "Fudge" at the Cobras in North America Day) | 날짜 미확정<br>※ 날짜 미확정 — 원문을 못 읽었고 검색 요약도 날짜를 주지 않음. 조사자가 기억한 6월 2일은 근거 없음으로 기록하지 않음 | 북미에 없는 코브라를 "퍼지"라고 외쳐 쫓는다는 부조리 설정 | `blocked` · 낮음 | 검색결과만 확인 | [1](https://www.goodreads.com/author_blog_posts/22593455-for-the-love-of-what-by-artemis-crow) |
| 고양이 질문에 답하는 날 (Answer Your Cat's Questions Day) | 01-22 | 고양이가 던지는 "질문"을 상상해 답해 주는 날 | `documented_unofficial` · 중간 | 원문 1건 | [1](https://nevadahumanesociety.org/insights/answer-your-cats-questions/) |

## 말장난·밈 (8건)

| 이름 (원명) | 날짜 | 한 줄 의미 | 상태 · 신뢰 | 원문 | 출처 |
|---|---|---|---|---|---|
| 캡스록의 날 (International Caps Lock Day) | 10-22<br>※ 원래 10-22(2000년). 06-28 은 빌리 메이스 사망일을 기려 나중에 덧붙은 두 번째 날 | 하루 종일 대문자로만 타이핑하는 날 | `date_conflict` · 높음 | 원문 2건 | [1](https://www.nationaldaycalendar.com/international/international-caps-lock-day-june-28-or-october-22) · [2](https://thenextweb.com/news/today-is-international-caps-lock-day-but-what-is-it) |
| 퀸카로 살아남는 법(Mean Girls)의 날 (Mean Girls Day) | 10-03 | 영화 속 "오늘은 10월 3일이야" 대사를 따라 분홍 옷과 짤을 나누는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://www.cbsnews.com/newyork/news/mean-girls-day-2018/) · [2](https://time.com/3457797/mean-girls-day-october-3/) |
| "잇츠 고나 비 메이" 데이 (It's Gonna Be May (Day)) | 04-30 | 엔싱크 "It's Gonna Be Me"의 "Me"가 "May"로 들리는 걸 4월 30일마다 올리는 밈 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://meme.com/memes/its-gonna-be-may) · [2](https://newsroom.spotify.com/tag/its-gonna-be-may) |
| 블루 먼데이(가장 우울한 날이라는 PR 공식) (Blue Monday) | 01-3-MON<br>※ 1월 셋째 월요일(EBSCO). 해마다 날짜가 바뀜 | "1년 중 가장 우울한 날"이라고 주장하는 날 — 여행사 홍보용 사이비 공식에서 나옴<br>⚠️ 정신건강 소재. "가장 우울한 날"을 사실처럼 쓰지 말고 반박된 PR 공식임을 먼저 밝힐 것 | `documented_unofficial` · 중간 | 원문 1건 | [1](https://www.ebsco.com/research-starters/science/blue-monday-pseudoscience) |
| 어스 윈드 앤 파이어 데이(9월 21일 밈) (Earth, Wind & Fire Day) | 09-21 | "Do you remember the 21st night of September?" 가사 때문에 매년 9월 21일 노래를 트는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://www.cfpublic.org/2022-09-21/do-you-remember-its-earth-wind-and-fire-day) · [2](https://wsvn.com/entertainment/los-angeles-declared-september-21-earth-wind-fire-day/) |
| 타우의 날 (Tau Day) | 06-28 | 원주율 π 대신 τ(=2π≈6.28)를 쓰자며 6/28을 기념하는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://www.scientificamerican.com/blog/observations/the-tao-of-tau/) · [2](https://tauday.com/) |
| 닌자의 날(일본) (忍者の日) | 02-22 | 2월 22일을 "닌닌닌"으로 읽어 닌자를 기리는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://www.pref.mie.lg.jp/TOPICS/m0031100533.htm) · [2](https://www.timeout.jp/tokyo/ja/blog/2%E6%9C%8822%E6%97%A5%E5%BF%8D%E8%80%85%E3%81%AE%E6%97%A5%E3%81%AB-%E5%BF%8D%E8%80%85%E5%85%83%E5%B9%B4%E5%AE%A3%E8%A8%80%E3%81%8C%E7%99%BA%E8%A1%A8-022216) |
| 천사데이 (천사데이(1004)) | 10-04 | 10월 4일=1004=천사, 남을 돕는 날 | `discovered_unverified` · 낮음 | 원문 1건 | [1](https://kormedi.com/200641/) |
| ~~시스의 복수 데이~~ (Revenge of the Sixth / Revenge of the Fifth) | 05-06 | 기존 `anv-fixed-05-05-sith-day-global` 와 중복 — 신규 아님 | `duplicate` | 원문 2건 | [1](https://disneyparksblog.com/products/celebrate-star-wars-revenge-of-the-sith/) · [2](https://meaww.com/revenge-of-the-fifth-star-wars-may-5-sixth-fans-argue-makes-more-sense-sith-episode-three-day) |

## 관계 (6건)

| 이름 (원명) | 날짜 | 한 줄 의미 | 상태 · 신뢰 | 원문 | 출처 |
|---|---|---|---|---|---|
| 애플데이(사과데이) (애플데이) | 10-24 | 둘(2)이 사(4)과하고 화해하자며 사과를 건네는 날 | `documented_unofficial` · 중간 | 원문 2건 | [1](https://m.go.seoul.co.kr/news/2013/10/25/20131025012024) · [2](https://www.syu.ac.kr/grad/?p=43747) |
| 갤런타인데이 (Galentine's Day) | 02-13 | 밸런타인데이 전날 여자 친구들끼리 우정을 챙기는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://www.history.com/articles/what-is-galentines-day) · [2](https://www.mentalfloss.com/holidays/the-unexpected-origins-of-galentines-day) |
| 남자친구의 날 (National Boyfriend Day) | 10-03 | 남자친구에게 고마움을 표하는 날 | `documented_unofficial` · 중간 | 원문 1건 | [1](https://en.wikipedia.org/wiki/National_Boyfriend_Day) |
| 고백의 날(일본) (告白の日) | 05-09 | 5·9를 "고쿠(はく)"로 읽어 좋아하는 사람에게 고백하자는 날 | `discovered_unverified` · 낮음 | 원문 1건 (단일 목록 출처) | [1](https://netlab.click/todayis/0509) |
| 좋은 부부의 날(일본) (いい夫婦の日) | 11-22 | 11·22를 "이이 후후(좋은 부부)"로 읽어 부부를 챙기는 날 | `discovered_unverified` · 중간 | 원문 1건 (단일 목록 출처) | [1](https://bestcalendar.jp/articles/4844) |
| 세계 내향인의 날 (World Introvert Day) | 01-02 | 연말 모임에 지친 내향인이 쉬어 가는 날<br>⚠️ 성격 유형을 놀림감으로 쓰지 말 것 | `discovered_unverified` · 중간 | 원문 1건 (단일 목록 출처) | [1](https://www.nationaldaycalendar.com/international/world-introvert-day-january-2) |

## 물건·취미 (5건)

| 이름 (원명) | 날짜 | 한 줄 의미 | 상태 · 신뢰 | 원문 | 출처 |
|---|---|---|---|---|---|
| 뽁뽁이 감사의 날 (Bubble Wrap Appreciation Day) | 01-L-MON | 포장용 에어캡(뽁뽁이)을 터뜨리며 감사하는 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://library.bellevue.edu/articles/tag/nationalbubblewrapappreciationday) · [2](https://www.npr.org/transcripts/170442218) |
| 국제 지오캐싱의 날 (International Geocaching Day) | 08-3-SAT | GPS로 숨겨진 상자를 찾는 지오캐싱 취미의 날 | `documented_unofficial` · 높음 | 원문 2건 | [1](https://www.geocaching.com/blog/?p=4841) · [2](https://www.geocaching.com/blog/?p=11388) |
| 빗의 날(일본) (くしの日) | 09-04 | 9·4를 "구시(빗)"로 읽어 빗을 아끼자는 날 | `discovered_unverified` · 낮음 | 원문 2건 (목록 사이트만) | [1](https://bestcalendar.jp/dates/kinenbi/3635) · [2](https://zatsuneta.com/archives/109042.html) |
| 팬티의 날(일본) (パンツの日) | 08-02 | 8·2를 "판츠"로 읽는 속옷의 날 | `discovered_unverified` · 낮음 | 원문 2건 (목록 사이트만) | [1](https://bestcalendar.jp/dates/kinenbi/3173) · [2](https://zatsuneta.com/archives/10802g7.html) |
| 이불의 날(일본) (ふとんの日) | 10-10<br>※ 1997년 02-10 으로 시작, 2010년 10-10 으로 변경(목록 사이트). 02-10 을 계속 쓰는 목록도 있음 | "후(2)톤(10)" 말장난으로 이불을 알리는 날 | `date_conflict` · 낮음 | 원문 2건 (목록 사이트만) | [1](https://bestcalendar.jp/articles/131623) · [2](https://zatsuneta.com/archives/102105.html) |
| ~~촌스러운 크리스마스 스웨터의 날~~ (National Ugly Christmas Sweater Day) | 12-3-FRI | 기존 `anv-fixed-12-18-ugly-christmas-sweater-day-global` 와 중복 — 신규 아님 | `duplicate` | 원문 1건 | [1](https://www.dictionary.com/e/pop-culture/national-ugly-christmas-sweater-day/) |

## 미신 (3건)

| 이름 (원명) | 날짜 | 한 줄 의미 | 상태 · 신뢰 | 원문 | 출처 |
|---|---|---|---|---|---|
| 미신에 맞서는 날 (Defy Superstition Day) | 09-13 | 13이라는 불길한 숫자 등 미신을 일부러 깨 보는 날<br>⚠️ 사다리 밑 걷기 등 위험 행동을 권하지 말 것 | `documented_unofficial` · 중간 | 원문 1건 | [1](https://whatsupnewp.com/?p=492135) |
| 유령의 날(일본) (幽霊の日) | 07-26 | 괴담 가부키 "도카이도 요쓰야 괴담" 초연일(1825)을 유령의 날로 부름 | `discovered_unverified` · 낮음 | 원문 2건 (목록 사이트만) | [1](https://bestcalendar.jp/dates/kinenbi/3100) · [2](https://zatsuneta.com/archives/107263.html) |
| 냉장고 위에 베개 올리는 날 (Put a Pillow on Your Fridge Day) | 05-29 | 냉장고 위에 베개를 올려 두면 행운이 온다는 날 | `discovered_unverified` · 낮음 | 원문 1건 | [1](https://manualredeye.com/83042/news/put-a-pillow-on-your-fridge-day) |

## 유래·제정자 확인 수준

| 후보 | 유래·제정자 (원문이 말한 범위) | 확인 수준 |
|---|---|---|
| 후디 후 데이 | 펜실베이니아 중부의 한 부부가 만든 날(신문), Wellcat.com 이 만든 날(출판사 달력). 두 설명은 같은 제작자로 보이나 부부 이름(Ruth·Thomas Roy)은 검색결과만 확인 | `partial_original` |
| 내 묘비명 미리 쓰는 날 | 제정자 Lance Hardie 설은 검색결과만 확인(원문 미확보). 2001년 대학 라디오는 "누군가 선포했다"고만 함 | `search_result_only` |
| 거짓말하는 날 | 만든 사람이 밝혀진 적 없다(Christian Post) | `unknown_stated_by_source` |
| 바보 같은 질문 하는 날 | 유래 상충: 1982년 플린트 저널 사서 David Larzelere 창안(위키백과) vs 1980년대 교사들(아일랜드 지역지) | `conflicting` |
| 양말 안 신는 날 | Ruth & Thomas Roy(Wellcat Holidays) — 목록 사이트 1곳의 표기 | `single_listing` |
| 북미 코브라에게 "퍼지!"라고 외치는 날 | Tom·Ruth Roy(Wellcat) 창안 — 검색결과만 확인 | `search_result_only` |
| 고양이 질문에 답하는 날 | Ruth·Thomas Roy(wellcat.com) 창안설은 검색결과만 확인 | `search_result_only` |
| 캡스록의 날 | Derek Arnold 가 2000년 패러디로 제안 | `original_read` |
| 퀸카로 살아남는 법(Mean Girls)의 날 | 2004년 영화 대사에서 유래, 팬들이 SNS로 기념(제정자 없음) | `original_read` |
| "잇츠 고나 비 메이" 데이 | 2012년 텀블러 밈에서 시작(제정자 없음) | `original_read` |
| 블루 먼데이(가장 우울한 날이라는 PR 공식) | 2005년 Cliff Arnall 이 Sky Travel 홍보 의뢰로 만든 공식 | `original_read` |
| 어스 윈드 앤 파이어 데이(9월 21일 밈) | 1978년 노래 가사에서 유래. 2019년 LA 시의회가 선언 | `original_read` |
| 타우의 날 | 2010년 Michael Hartl 이 Tau Manifesto 와 함께 창안 | `original_read` |
| 닌자의 날(일본) | 일본닌자협의회(2015 발족)가 이날 행사. 일본기념일협회 인정 연도(2014/2015)는 검색결과에서 상충 | `partial_original` |
| 천사데이 | 동두천 "희망지킴이 천사운동본부"가 2003년부터 행사(칼럼 1건). 날 자체의 최초 제정자는 미확인 | `single_news_column` |
| 애플데이(사과데이) | 2002년 학교폭력대책 국민협의회 마련(대학 기고문은 "~했다고 한다"로 전함) | `secondary_hearsay` |
| 갤런타인데이 | 2010년 2월 11일 방영 "Parks and Recreation" 시즌2 16화에서 탄생 | `original_read` |
| 남자친구의 날 | 2014년 10월 4일쯤 시작으로 추정, 2016년 3월 트윗 급증(위키백과). 제정자 없음 | `original_read_unknown_founder` |
| 고백의 날(일본) | 유니레버 재팬(AXE)이 제정 — 목록 사이트 1곳 | `single_listing` |
| 좋은 부부의 날(일본) | 1988년 여가개발센터(현 일본생산성본부) 제정 — 목록 사이트 1곳 | `single_listing` |
| 세계 내향인의 날 | 심리학자 Felicitas Heyne 창안, 첫 기념 2011년 1월 2일(목록 사이트). 블로그 글 날짜는 검색결과에서 상충 | `single_listing` |
| 뽁뽁이 감사의 날 | 라디오 방송국이 생방송 중 마이크 포장을 뜯은 데서 시작했다는 설명은 도서관 블로그 1곳뿐(방송국명 없음) | `single_source_unverified` |
| 국제 지오캐싱의 날 | 2011년 Geocaching.com 운영사가 첫 개최 | `organizer_original` |
| 빗의 날(일본) | 1978년 미용 관계자 제정, 미용주간 실행위원회 실시(목록 사이트 2곳). "9·4=苦死" 연관은 원문에 없어 기록하지 않음 | `listing_sites_only` |
| 팬티의 날(일본) | 제정자 여럿: 1984년 이소가이 포백공업(상품명 유래)·오구란(말장난), 2020년 와코루 등록(목록 사이트 2곳) | `listing_sites_only` |
| 이불의 날(일본) | 1997년 전일본침장구협회 제정(목록 사이트 2곳) | `listing_sites_only` |
| 미신에 맞서는 날 | 1987년경 델라웨어대 수학자 Tom Fernsler 창안설("some credit" — 원문도 단정 안 함) | `hedged_by_source` |
| 유령의 날(일본) | 유래(1825년 초연일)는 목록 사이트 2곳 일치. 누가 정했는지는 원문에 없음("とされています") | `listing_sites_only_no_founder` |
| 냉장고 위에 베개 올리는 날 | "1900년대 초 식료품 창고에 침실 천을 넣던 풍습" 설은 학생신문 1곳의 주장, 확인 안 됨. 같은 기사가 "왜 5월 29일인지 아무도 모른다"고 씀 | `single_source_unverified` |

## 이미 있어서 제외한 유명 이색 기념일

검색 전 떠올렸거나 조사 중 확인한 항목. 서비스 1,756건에 이미 있다.

- 시스의 복수 데이 (Revenge of the Sixth / Revenge of the Fifth) → `anv-fixed-05-05-sith-day-global` — 기존 "시스 데이"(05-05, culture)가 같은 팬 기념일의 Fifth 판. 05-06(Sixth)은 날짜 변형 — 신규 아님, 기존 항목 본문에 변형 언급 여부만 검토 대상
- 촌스러운 크리스마스 스웨터의 날 (National Ugly Christmas Sweater Day) → `anv-fixed-12-18-ugly-christmas-sweater-day-global` — 기존 "못생긴 크리스마스 스웨터의 날"(culture)과 같은 날. 단 기존 항목은 annual-fixed 12-18 인데 원문 규칙은 12월 셋째 금요일 — 2027년 12-17·2028년 12-15 와 어긋남. 기존 항목 날짜 규칙 재검증 대상(이번 작업에서 수정 안 함)
- 잃어버린 양말 추모의 날 (Lost Sock Memorial Day) → `anv-fixed-05-09-lost-sock-memorial-day-us` — 신규 후보에서 제외 (현재 카테고리 history, quirky 아님)
- 발가락 꼼지락거리는 날 (Wiggle Your Toes Day) → `anv-fixed-08-06-wiggle-your-toes-day-us` — 신규 후보에서 제외 (현재 카테고리 campaign, quirky 아님)
- 몰래 주키니 선물하는 날 (Sneak Some Zucchini onto Your Neighbor’s Porch Day) → `anv-fixed-08-08-sneak-zucchini-day-us` — 신규 후보에서 제외 (현재 카테고리 food, quirky 아님)
- 페스티버스 (Festivus) → `anv-fixed-12-23-festivus-us` — 신규 후보에서 제외 (현재 카테고리 food, quirky 아님)
- 레이프 에릭손의 날 (National Leif Erikson Day) → `anv-fixed-10-09-leif-erikson-day-us` — 신규 후보에서 제외 (현재 카테고리 history, quirky 아님)
- 타월의 날 (Towel Day) → `anv-fixed-05-25-towel-day` — 신규 후보에서 제외 (현재 카테고리 general, quirky 아님)
- 호빗의 날 (Hobbit Day) → `anv-fixed-09-22-hobbit-day-global` — 신규 후보에서 제외 (현재 카테고리 culture, quirky 아님)
- 검은 고양이 감사의 날 (Black Cat Appreciation Day) → `anv-fixed-08-17-black-cat-appreciation-day-us` — 신규 후보에서 제외 (현재 카테고리 animal, quirky 아님)
- 윤일 청혼의 날 (Bachelor’s Day) → `anv-fixed-02-29-bachelors-day-ie` — 신규 후보에서 제외 (현재 카테고리 romance, quirky 아님)
- 셰익스피어처럼 말하는 날 (Talk Like Shakespeare Day) → `anv-fixed-04-23-talk-like-shakespeare-day-us` — 신규 후보에서 제외 (현재 카테고리 culture, quirky 아님)
- 타임트래블러인 척하는 날 (Pretend to Be a Time Traveler Day) → `anv-fixed-12-08-time-traveler-day-global`
- 세계 해적처럼 말하기의 날 (Talk Like a Pirate Day) → `anv-fixed-09-19-talk-like-a-pirate-day-global`
- 세계 닌자의 날 (International Ninja Day) → `anv-fixed-12-05-ninja-day-global` — 신규 후보에서 제외 (현재 카테고리 culture, quirky 아님)

## 2026·2027·2028 발생일 (실제 resolver)

`src/utils/dateUtils.ts` 의 `resolveOccurrence` 로 계산했다. **계산이 된다는 것은 규칙 표현이 가능하다는 뜻일 뿐, 그 날짜가 사실이라는 증명이 아니다.** `date_conflict` 후보는 대표 날짜 하나로만 계산했다.

| 후보 | 규칙 | 2026 | 2027 | 2028 |
|---|---|---|---|---|
| 후디 후 데이 | `annual-fixed` 02-20 | 2026-02-20 | 2027-02-20 | 2028-02-20 |
| 내 묘비명 미리 쓰는 날 | `annual-fixed` 11-02 | 2026-11-02 | 2027-11-02 | 2028-11-02 |
| 거짓말하는 날 | `annual-fixed` 04-04 | 2026-04-04 | 2027-04-04 | 2028-04-04 |
| 바보 같은 질문 하는 날 | `annual-fixed` 09-28 | 2026-09-28 | 2027-09-28 | 2028-09-28 |
| 양말 안 신는 날 | `annual-fixed` 05-08 | 2026-05-08 | 2027-05-08 | 2028-05-08 |
| 고양이 질문에 답하는 날 | `annual-fixed` 01-22 | 2026-01-22 | 2027-01-22 | 2028-01-22 |
| 캡스록의 날 | `annual-fixed` 10-22 | 2026-10-22 | 2027-10-22 | 2028-10-22 |
| 퀸카로 살아남는 법(Mean Girls)의 날 | `annual-fixed` 10-03 | 2026-10-03 | 2027-10-03 | 2028-10-03 |
| "잇츠 고나 비 메이" 데이 | `annual-fixed` 04-30 | 2026-04-30 | 2027-04-30 | 2028-04-30 |
| 블루 먼데이(가장 우울한 날이라는 PR 공식) | `annual-nth-weekday` 01-3-MON | 2026-01-19 | 2027-01-18 | 2028-01-17 |
| 어스 윈드 앤 파이어 데이(9월 21일 밈) | `annual-fixed` 09-21 | 2026-09-21 | 2027-09-21 | 2028-09-21 |
| 타우의 날 | `annual-fixed` 06-28 | 2026-06-28 | 2027-06-28 | 2028-06-28 |
| 닌자의 날(일본) | `annual-fixed` 02-22 | 2026-02-22 | 2027-02-22 | 2028-02-22 |
| 천사데이 | `annual-fixed` 10-04 | 2026-10-04 | 2027-10-04 | 2028-10-04 |
| 애플데이(사과데이) | `annual-fixed` 10-24 | 2026-10-24 | 2027-10-24 | 2028-10-24 |
| 갤런타인데이 | `annual-fixed` 02-13 | 2026-02-13 | 2027-02-13 | 2028-02-13 |
| 남자친구의 날 | `annual-fixed` 10-03 | 2026-10-03 | 2027-10-03 | 2028-10-03 |
| 고백의 날(일본) | `annual-fixed` 05-09 | 2026-05-09 | 2027-05-09 | 2028-05-09 |
| 좋은 부부의 날(일본) | `annual-fixed` 11-22 | 2026-11-22 | 2027-11-22 | 2028-11-22 |
| 세계 내향인의 날 | `annual-fixed` 01-02 | 2026-01-02 | 2027-01-02 | 2028-01-02 |
| 뽁뽁이 감사의 날 | `annual-nth-weekday` 01-L-MON | 2026-01-26 | 2027-01-25 | 2028-01-31 |
| 국제 지오캐싱의 날 | `annual-nth-weekday` 08-3-SAT | 2026-08-15 | 2027-08-21 | 2028-08-19 |
| 빗의 날(일본) | `annual-fixed` 09-04 | 2026-09-04 | 2027-09-04 | 2028-09-04 |
| 팬티의 날(일본) | `annual-fixed` 08-02 | 2026-08-02 | 2027-08-02 | 2028-08-02 |
| 이불의 날(일본) | `annual-fixed` 10-10 | 2026-10-10 | 2027-10-10 | 2028-10-10 |
| 미신에 맞서는 날 | `annual-fixed` 09-13 | 2026-09-13 | 2027-09-13 | 2028-09-13 |
| 유령의 날(일본) | `annual-fixed` 07-26 | 2026-07-26 | 2027-07-26 | 2028-07-26 |
| 냉장고 위에 베개 올리는 날 | `annual-fixed` 05-29 | 2026-05-29 | 2027-05-29 | 2028-05-29 |
| 북미 코브라에게 "퍼지!"라고 외치는 날 | 날짜 미확정 | — | — | — |

## 실제 검증 결과 (scripts/verify.mjs → verification.json)

- 종합: `ok=true`, 오류 0건
- 인용 문자 일치: 81/81 (저장 본문 .txt 에 글자 그대로 포함되는지 프로그램 검사)
- 원문 수집: fetch 시도 61건 → 수집기 판정 본문 확보 51건 → 그중 HTTP 200 이지만 실제로 못 읽은 것 재분류 `kokuhaku-day-jp/nissyoku`(read_no_relevant_text), `world-introvert-day/theweek-2024`(blocked_access_denied_page) → 인용에 쓴 원문 49건
- 실패: hoodie-hoo-day (blocked, HTTPError), put-a-pillow-on-your-fridge-day (blocked, HTTPError), tell-a-lie-day (blocked, HTTPError), no-socks-day (blocked, HTTPError), blue-monday (blocked_empty_body), kokuhaku-day-jp (blocked, HTTPError), kokuhaku-day-jp (blocked, HTTPError), answer-your-cats-questions-day (blocked, HTTPError), defy-superstition-day (blocked, HTTPError), yell-fudge-cobras-day (blocked, TimeoutError)
- 원본 SHA-256 재계산 일치, 승인·반영 표시 없음, 서비스 기념일 1756건 읽기만(production_writes=false), Vite 서버 종료 확인=true
- 이전 조사 자료에 이름만 나왔던 후보(발견용 원자료, 승인 기록 아님): cheonsa-day-kr, apple-day-kr, ii-fufu-day-jp, pants-day-jp, yurei-day-jp
- 중복 대조: 서비스 이름·id 토큰, 같은 날짜 항목, 이전 배치 records.json, namuwiki·jp 발견 자료. 1차 키워드 스캔이 놓친 2건(스웨터·시스 데이)을 검증 단계에서 잡아 중복으로 돌렸다.

## 조사 중 본 기존 데이터 관찰 (수정 안 함)

- `anv-fixed-12-18-ugly-christmas-sweater-day-global` 은 `annual-fixed` 12-18 이지만 본문과 원문 모두 "12월 셋째 금요일". 2027·2028년에는 실제 날(12-17·12-15)과 어긋난다. 별도 재검증 대상.
- 유명 이색 기념일 중 일부는 quirky 가 아닌 카테고리에 있다(잃어버린 양말→history, 페스티버스→food, 타월의 날→general 등). 카테고리 재분류는 이번 범위 밖.

## 다음 단계 (사람 결정 필요)

1. 사용자가 반영 후보를 고르면, `documented_unofficial` 부터 독립 검수(원문 재확인)를 거친다.
2. `date_conflict` 4건은 대표 날짜를 정하는 결정이 먼저다. `discovered_unverified` 는 독립 출처를 하나 더 찾기 전엔 반영 권장 안 함.
3. ⚠️ 표시 후보(거짓말·우울·죽음·미신 행동·성격 유형)는 본문 톤을 따로 검토한다.

## 파일

- `records.json` 후보 기록(필드: 한국어/원명/날짜/범위/의미/특이점/출처 URL/원문 읽기/인용/저장 경로/유래 확인/중복 판정/신뢰수준)
- `evidence/<후보>/` 원문 HTML·텍스트 · `fetch-log.json` 수집 로그 · `search-log.json` 검색 기록
- `verification.json` 검증 결과 · `progress.md` 진행 기록 · `scripts/` (fetch.py, build_records.py, verify.mjs, render_report.py, peek.sh, urls.tsv)
