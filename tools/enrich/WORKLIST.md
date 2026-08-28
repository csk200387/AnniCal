# 보강 작업 목록

`python3 tools/enrich/worklist.py --write` 로 생성. 전체 1,734건 기준.

## 현황

| 구간 | 건수 | 비율 |
|---|---:|---:|
| ~100자 | 139 | 8.0% |
| 100~200자 | 621 | 35.8% |
| 200자~ (목표 달성) | 974 | 56.2% |

### 출처 그룹별

| 그룹 | 전체 | ~100자 | 평균 |
|---|---:|---:|---:|
| 미국 nationaldaycalendar | 1133 | 139 | 160자 |
| 위키백과 | 123 | 0 | 226자 |
| 기타 공식 출처 | 94 | 0 | 227자 |
| 일본 zatsuneta | 29 | 0 | 229자 |
| 출처 없음/비URL | 231 | 0 | 206자 |
| gov-* 한국 법정·정부 | 124 | 0 | 222자 |

## 유래 단서 상태 (~100자 139건)

| 등급 | 뜻 | 건수 |
|---|---|---:|
| A | 연도+주체 있음 — 확장만 | 0 |
| B | 단서 일부 — 나머지 조사 | 0 |
| C | 상투구만 — 유래 조사 필요 | 75 |
| D | 설명만 — 유래 조사 필요 | 64 |

> C·D 는 조사해도 **그 날짜의 유래가 없을 수 있다.** 미국 이색 기념일 상당수는
> nationaldaycalendar 등록이 유일한 출처다. 그럴 때는 날짜의 유래를 지어내지 말고
> 대상 자체의 기원(언제 어디서 만들어졌는지)과 한국 맥락으로 채운다.

## C. 상투구만 — 유래 조사 필요 — 75건

### 문화 & 예술 (19건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 02-11 | 화이트 셔츠의 날 | 76 | 어떤 옷차림에도 잘 어울리는 기본 아이템, 화이트 셔츠를 기념하는 날. | `anv-fixed-02-11-white-shirt-day-us` |
| 04-25 | 동서양이 만나는 날 | 81 | 동양과 서양의 문화 교류와 융합을 기념하는 날이다. | `anv-fixed-04-25-east-meets-west-day-us` |
| 10-08 | 시의 날 (National Poetry Day) | 82 | 함축적인 언어로 감정과 사유를 담아내는 시를 기념하는 날이다. | `anv-fixed-10-08-poetry-day-us` |
| 08-02 | 컬러링북의 날 | 83 | 색연필이나 마커로 그림을 채워가는 컬러링북 취미를 기념하는 날이다. | `anv-fixed-08-02-coloring-book-day-us` |
| 09-25 | 만화책의 날 (National Comic Book Day) | 86 | 그림과 이야기로 상상력을 펼치는 만화책을 기념하는 날이다. | `anv-fixed-09-25-comic-book-day-us` |
| 12-05 | 세계 닌자의 날 (International Ninja Day) | 86 | 그림자처럼 움직이는 닌자의 문화적 매력을 기념하는 날이다. | `anv-fixed-12-05-ninja-day-global` |
| 07-04 | 컨트리 음악의 날 | 87 | 미국 남부에서 발전한 음악 장르, 컨트리 뮤직을 기념하는 날이다. | `anv-fixed-07-04-country-music-day-us` |
| 05-16 | 피어싱의 날 (National Piercing Day) | 88 | 신체의 일부에 장신구를 착용하는 피어싱 문화와 그 역사를 기념하는 날이다. | `anv-fixed-05-16-piercing-day-us` |
| 06-19 | 플립플롭의 날 (National Flip Flop Day) | 90 | 더운 날 가볍게 신는 슬리퍼형 신발, 플립플롭을 기념하는 날이다. | `anv-fixed-06-19-flip-flop-day-us` |
| 06-14 | 팝 고즈 더 위즐의 날 | 91 | 영미권 전통 동요 「Pop Goes the Weasel」을 기념하는 날이다. | `anv-fixed-06-14-pop-goes-the-weasel-day-us` |
| 06-27 | 선글라스의 날 (National Sunglasses Day) | 91 | 강한 자외선으로부터 눈을 보호해주는 선글라스를 기념하는 날이다. | `anv-fixed-06-27-sunglasses-day-us` |
| 08-05 | 속옷의 날 (National Underwear Day) | 92 | 겉으로 드러나지 않지만 매일 함께하는 속옷의 중요성을 기념하는 날이다. | `anv-fixed-08-05-underwear-day-us` |
| 10-23 | TV 토크쇼 진행자의 날 | 92 | 유쾌한 입담으로 게스트와 시청자를 사로잡는 토크쇼 진행자들을 기념하는 날이다. | `anv-fixed-10-23-tv-talk-show-host-day-us` |
| 06-25 | 악수의 날 (National Handshake Day) | 93 | 신뢰와 존중을 표현하는 가장 보편적인 인사법, 악수를 기념하는 날이다. | `anv-fixed-06-25-handshake-day-us` |
| 06-23 | 핑크의 날 (National Pink Day) | 94 | 사랑스럽고 발랄한 색, 핑크를 기념하는 날이다. | `anv-fixed-06-23-pink-day-us` |
| 12-13 | 바이올린의 날 | 94 | 오케스트라의 중심을 이루는 악기, 바이올린을 기념하는 날이다. | `anv-fixed-12-13-violin-day-global` |
| 01-20 | 디스크자키(DJ)의 날 | 99 | 라디오·클럽에서 음악을 선곡하고 트는 '디스크자키'를 기념하는 날. | `anv-fixed-01-20-disc-jockey-day-global` |
| 04-03 | 트위드의 날 (National Tweed Day) | 99 | 두껍고 거친 질감의 모직물 트위드의 멋과 전통을 기리는 날이다. | `anv-fixed-04-03-tweed-day-us` |
| 10-22 | 색의 날 (National Color Day) | 99 | 우리 삶을 풍부하게 만들어주는 색채의 아름다움을 기념하는 날이다. | `anv-fixed-10-22-color-day-us` |

### 일반 (15건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 07-25 | 회전목마의 날 (National Merry-Go-Round Day) | 73 | 놀이공원의 클래식 놀이기구, 회전목마를 기념하는 날이다. | `anv-fixed-07-25-merry-go-round-day-us` |
| 08-02 | 자매의 날 (National Sisters Day) | 79 | 함께 자라며 서로의 가장 가까운 동반자가 되어준 자매를 기념하는 날이다. | `anv-fixed-08-02-sisters-day-us` |
| 12-28 | 카드놀이의 날 | 82 | 트럼프 카드로 즐기는 다양한 카드놀이를 기념하는 날이다. | `anv-fixed-12-28-card-playing-day-us` |
| 06-06 | 요요의 날 (National Yo-Yo Day) | 85 | 줄 하나로 다양한 기술을 펼치는 클래식 장난감, 요요를 기념하는 날이다. | `anv-fixed-06-06-yo-yo-day-us` |
| 09-30 | 머드팩의 날 (National Mud Pack Day) | 88 | 피부 노폐물을 제거해주는 머드팩(진흙 마스크)을 기념하는 날이다. | `anv-fixed-09-30-mud-pack-day-us` |
| 12-21 | 크로스워드 퍼즐의 날 | 90 | 가로세로 낱말을 채워가는 크로스워드 퍼즐을 기념하는 날이다. | `anv-fixed-12-21-crossword-puzzle-day-global` |
| 05-07 | 스크랩북의 날 (National Scrapbook Day) | 91 | 사진과 메모, 소품을 모아 추억을 기록하는 스크랩북 취미를 기념하는 날이다. | `anv-fixed-05-07-scrapbook-day-us` |
| 10-10 | 체스의 날 (National Chess Day) | 91 | 수천 년의 역사를 가진 전략 보드게임, 체스를 기념하는 날이다. | `anv-fixed-10-10-chess-day-us` |
| 11-15 | 나눔의 날 (National Philanthropy Day) | 91 | 기부와 자선을 통해 사회에 긍정적인 변화를 만드는 이들을 기리는 날이다. | `anv-fixed-11-15-philanthropy-day-us` |
| 10-02 | 제조업의 날 (National Manufacturing Day) | 92 | 물건을 만들어내는 제조업의 가치와 그 안에서 일하는 사람들의 노고를 기리는 날이다. | `anv-fixed-10-02-manufacturing-day-us` |
| 12-04 | 주사위의 날 (National Dice Day) | 92 | 보드게임과 도박 게임에 빠지지 않는 도구, 주사위를 기념하는 날이다. | `anv-fixed-12-04-dice-day-us` |
| 12-26 | 캔디케인의 날 | 95 | 지팡이 모양의 빨갛고 하얀 줄무늬 사탕, 캔디케인을 기념하는 날이다. | `anv-fixed-12-26-candy-cane-day-us` |
| 09-11 | 이불 정리하는 날 (National Make Your Bed Day) | 96 | 하루를 시작하며 이불을 정리하는 작은 습관의 가치를 기념하는 날이다. | `anv-fixed-09-11-make-your-bed-day-us` |
| 09-22 | 백세인의 날 (National Centenarian's Day) | 96 | 100세 이상을 살아온 어르신들의 삶과 지혜를 기리는 날이다. | `anv-fixed-09-22-centenarians-day-us` |
| 07-18 | 우디 왜건의 날 | 99 | 나무 패널로 차체를 장식한 클래식 자동차, 우디 왜건을 기념하는 날이다. | `anv-fixed-07-18-woodie-wagon-day-us` |

### 이색 & 유머 (13건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 08-08 | 1달러의 날 (National Dollar Day) | 78 | 작은 단위의 화폐, 1달러 지폐의 가치와 역사를 기념하는 날이다. | `anv-fixed-08-08-dollar-day-us` |
| 06-15 | 미소의 힘의 날 (National Smile Power Day) | 80 | 미소가 가진 긍정적인 에너지와 전염성을 기념하는 날이다. | `anv-fixed-06-15-smile-power-day-us` |
| 11-19 | 모노폴리 하는 날 (National Play Monopoly Day) | 85 | 부동산을 사고팔며 재산을 불려나가는 보드게임, 모노폴리를 기념하는 날이다. | `anv-fixed-11-19-play-monopoly-day-us` |
| 05-24 | 보물찾기의 날 (National Scavenger Hunt Day) | 86 | 목록에 적힌 물건이나 단서를 찾아다니는 놀이, 스캐빈저 헌트를 기념하는 날이다. | `anv-fixed-05-24-scavenger-hunt-day-us` |
| 05-23 | 행운의 동전의 날 (National Lucky Penny Day) | 88 | 길에서 동전을 발견하면 행운이 따른다는 미신을 기념하는 날이다. | `anv-fixed-05-23-lucky-penny-day-us` |
| 06-01 | 펜팔의 날 (National Penpal Day) | 89 | 편지를 주고받으며 우정을 쌓는 펜팔 문화를 기념하는 날이다. | `anv-fixed-06-01-penpal-day-us` |
| 06-08 | 베스트 프렌드의 날 (National Best Friends Day) | 90 | 오랜 시간을 함께한 가장 친한 친구와의 우정을 기념하는 날이다. | `anv-fixed-06-08-best-friends-day-us` |
| 08-11 | 대통령 유머의 날 | 90 | 역대 대통령들의 재치 있는 유머와 농담을 가볍게 기념하는 날이다. | `anv-fixed-08-11-presidential-joke-day-us` |
| 07-24 | 사촌의 날 (National Cousins Day) | 92 | 어릴 적 명절이나 가족 모임에서 함께 자란 사촌과의 추억을 기념하는 날이다. | `anv-fixed-07-24-cousins-day-us` |
| 06-06 | 고등교육의 날 | 93 | 대학 등 고등교육 기관이 사회와 개인에게 주는 가치를 기리는 날이다. | `anv-fixed-06-06-higher-education-day-us` |
| 04-19 | 어울려 노는 날 | 94 | 특별한 계획 없이 친구나 가족과 그냥 함께 시간을 보내는 여유를 기념하는 날이다. | `anv-fixed-04-19-hanging-out-day-us` |
| 07-25 | 바늘에 실 꿰는 날 | 95 | 바느질의 첫 단계이자 가장 까다로운 작업, 바늘에 실 꿰기를 유쾌하게 기념하는 날이다. | `anv-fixed-07-25-threading-the-needle-day-us` |
| 10-31 | 똑똑 농담의 날 (National Knock-Knock Jokes Day) | 95 | "똑똑, 누구세요?"로 시작하는 클래식한 말장난 유머, 노크 조크를 기념하는 날이다. | `anv-fixed-10-31-knock-knock-jokes-day-us` |

### 동물 & 자연 (8건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 06-27 | 오렌지 꽃의 날 | 70 | 향긋한 향을 내는 오렌지 나무의 꽃을 기념하는 날이다. | `anv-fixed-06-27-orange-blossom-day-us` |
| 09-26 | 수렵·낚시의 날 (National Hunting and Fishing Day) | 83 | 야외에서 자연과 함께하는 수렵과 낚시 문화를 기리는 날이다. | `anv-fixed-09-26-hunting-and-fishing-day-us` |
| 05-30 | 꽃에 물 주는 날 | 87 | 정원이나 화분의 꽃에 물을 주며 자연을 돌보는 작은 실천을 기념하는 날이다. | `anv-fixed-05-30-water-a-flower-day-us` |
| 02-28 | 플로럴 디자인의 날 | 92 | 꽃을 활용해 공간을 꾸미는 플로럴 디자인(꽃꽂이)을 기념하는 날. | `anv-fixed-02-28-floral-design-day-us` |
| 04-16 | 난초의 날 (National Orchid Day) | 93 | 화려하고 다양한 형태를 자랑하는 꽃, 난초의 아름다움을 기리는 날이다. | `anv-fixed-04-16-orchid-day-us` |
| 09-13 | 반려동물 추모의 날 (National Pet Memorial Day) | 95 | 먼저 떠난 반려동물을 추모하고 그들과의 추억을 기리는 날이다. | `anv-fixed-09-13-pet-memorial-day-us` |
| 10-26 | 노새의 날 (National Mule Day) | 96 | 말과 당나귀의 교배종으로, 강인한 체력과 인내심을 가진 노새를 기념하는 날이다. | `anv-fixed-10-26-mule-day-us` |
| 07-15 | 말을 사랑하는 날 (National I Love Horses Day) | 98 | 인류의 역사와 오랫동안 함께해온 동물, 말에 대한 사랑을 기념하는 날이다. | `anv-fixed-07-15-i-love-horses-day-us` |

### 스포츠 & 레저 (7건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 06-18 | 낚시하는 날 (National Go Fishing Day) | 72 | 물가에 앉아 여유롭게 낚시를 즐기는 취미를 기념하는 날이다. | `anv-fixed-06-18-go-fishing-day-us` |
| 08-16 | 롤러코스터의 날 (National Roller Coaster Day) | 85 | 급강하와 회전을 즐기는 놀이기구, 롤러코스터를 기념하는 날이다. | `anv-fixed-08-16-roller-coaster-day-us` |
| 10-04 | 골프의 날 (National Golf Day) | 85 | 넓은 필드 위에서 정교한 스윙을 겨루는 스포츠, 골프를 기념하는 날이다. | `anv-fixed-10-04-golf-day-us` |
| 08-08 | 볼링의 날 (National Bowling Day) | 88 | 공을 굴려 핀을 쓰러뜨리는 스포츠, 볼링을 기념하는 날이다. | `anv-fixed-08-08-bowling-day-us` |
| 05-14 | 미니 골프의 날 (National Miniature Golf Day) | 89 | 가족이나 친구와 가볍게 즐길 수 있는 미니 골프(파크 골프류)를 기념하는 날이다. | `anv-fixed-05-14-miniature-golf-day-us` |
| 06-03 | 러닝의 날 (National Running Day) | 95 | 장비 없이도 누구나 시작할 수 있는 운동, 달리기를 기념하는 날이다. | `anv-fixed-06-03-running-day-us` |
| 04-21 | 하이파이브의 날 (National High Five Day) | 98 | 손바닥을 맞부딫혀 기쁨이나 응원을 표현하는 동작, 하이파이브를 기념하는 날이다. | `anv-fixed-04-21-high-five-day-us` |

### 학술 & 기술 (4건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 10-03 | 테키(기술 애호가)의 날 (National Techies Day) | 79 | 최신 기술과 기기에 열정을 가진 '테키'들을 기념하는 날이다. | `anv-fixed-10-03-techies-day-us` |
| 05-04 | 기상 관측자의 날 (National Weather Observers Day) | 83 | 매일 기상을 관측하고 기록하는 관측자들의 노력을 기리는 날이다. | `anv-fixed-05-04-weather-observers-day-us` |
| 12-22 | 손전등의 날 | 89 | 어둠을 밝혀주는 필수품, 손전등을 기념하는 날이다. | `anv-fixed-12-22-flashlight-day-us` |
| 07-24 | 열공학자의 날 | 99 | 냉난방, 발전 시스템 등 열에너지를 다루는 열공학자들의 역할을 기리는 날이다. | `anv-fixed-07-24-thermal-engineer-day-us` |

### 직업 & 감사 (3건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 10-21 | 의료 보조원의 날 | 97 | 병원과 진료실에서 의사를 보조하며 환자를 돌보는 의료 보조원들의 노고를 기리는 날이다. | `anv-fixed-10-21-medical-assistants-day-global` |
| 04-12 | 도서관 직원의 날 | 98 | 지식과 정보의 관문인 도서관을 지키는 사서와 직원들의 노고를 기리는 날이다. | `anv-fixed-04-12-library-workers-day-us` |
| 09-08 | 소아 혈액·종양 간호사의 날 | 99 | 백혈병이나 소아암을 앓는 아이들을 돌보는 전문 간호사들의 헌신을 기리는 날이다. | `anv-fixed-09-08-pediatric-hem-onc-nurses-day-us` |

### 역사 & 추모 (3건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 11-16 | 버튼의 날 (National Button Day) | 75 | 옷을 여미는 작은 도구, 버튼을 기념하는 날이다. | `anv-fixed-11-16-button-day-us` |
| 05-16 | 전기 작가의 날 | 88 | 누군가의 삶을 기록하고 알리는 전기(傳記) 작가들의 작업을 기리는 날이다. | `anv-fixed-05-16-biographers-day-us` |
| 05-20 | 국방 수송의 날 | 96 | 군수물자와 병력을 신속하게 운송하는 국방 수송 체계의 중요성을 기리는 날이다. | `anv-fixed-05-20-defense-transportation-day-us` |

### 국제 캠페인 & 보건 (2건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 11-21 | 입양의 날 (National Adoption Day) | 88 | 가정이 필요한 아이들과 새로운 가족을 이어주는 입양의 의미를 기리는 날이다. | `anv-fixed-11-21-adoption-day-us` |
| 04-28 | 브레이브하츠의 날 | 98 | 아동 학대 생존자들을 지원하는 단체 BraveHearts의 활동과 그들의 용기를 기리는 날이다. | `anv-fixed-04-28-bravehearts-day-us` |

### 연애 & 기념일 (1건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 06-12 | 빨간 장미의 날 (National Red Rose Day) | 84 | 사랑과 열정을 상징하는 빨간 장미를 기념하는 날이다. | `anv-fixed-06-12-red-rose-day-us` |

## D. 설명만 — 유래 조사 필요 — 64건

### 직업 & 감사 (13건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 04-16 | 잠옷 입고 출근하는 날 | 80 | 편안한 잠옷을 입고 출근하며 하루의 여유와 재미를 더해보자는 취지의 날이다. | `anv-fixed-04-16-pajamas-to-work-day-us` |
| 06-02 | 조퇴해도 되는 날 | 84 | 평소보다 일찍 퇴근해 자신만의 시간을 가져보자는 취지의 날이다. | `anv-fixed-06-02-leave-the-office-early-day-us` |
| 12-03 | 머리 위 지붕에 감사하는 날 | 84 | 추운 계절, 비바람을 막아주는 보금자리가 있다는 사실에 감사해보자는 날이다. | `anv-fixed-12-03-roof-over-your-head-day-us` |
| 04-25 | 배관공을 안아주는 날 | 85 | 막힌 배관과 새는 수도를 고쳐주는 배관공들의 노고에 감사를 전하는 날이다. | `anv-fixed-04-25-hug-a-plumber-day-us` |
| 08-11 | 아들·딸의 날 | 88 | 부모에게 더없이 소중한 존재인 아들과 딸에게 사랑을 전하는 날이다. | `anv-fixed-08-11-sons-and-daughters-day-us` |
| 05-07 | 베이비시터의 날 (National Babysitter's Day) | 89 | 부모를 대신해 아이를 돌봐주는 베이비시터들의 수고에 감사를 전하는 날이다. | `anv-fixed-05-07-babysitters-day-us` |
| 10-14 | 부모님과 점심 먹는 날 | 91 | 바쁜 일상 속에서 부모님과 여유롭게 점심 한 끼를 함께해보자는 취지의 날이다. | `anv-fixed-10-14-take-your-parents-to-lunch-day-us` |
| 09-14 | 상사·직원 역할 바꾸는 날 | 92 | 상사와 직원이 하루 동안 역할을 바꿔보며 서로의 입장을 이해해보자는 취지의 날이다. | `anv-fixed-09-14-boss-employee-exchange-day-us` |
| 09-04 | 상사를 안아주는 날 | 93 | 평소 어렵게만 느껴지던 상사에게 가벼운 친근함을 표현해보자는 유쾌한 기념일이다. | `anv-fixed-09-04-hug-your-boss-day-us` |
| 12-26 | 감사 카드의 날 (National Thank-you Note Day) | 94 | 크리스마스에 받은 선물과 마음에 감사 카드로 답례해보자는 취지의 날이다. | `anv-fixed-12-26-thank-you-note-day-global` |
| 09-22 | 여성 출장족의 날 | 95 | 비즈니스 출장으로 끊임없이 이동하는 여성 직장인들을 응원하는 날이다. | `anv-fixed-09-22-woman-road-warrior-day-us` |
| 10-11 | 성직자 감사의 날 | 96 | 신앙 공동체를 이끌고 신도들의 마음을 보살피는 성직자들의 헌신에 감사를 전하는 날이다. | `anv-fixed-10-11-clergy-appreciation-day-global` |
| 12-13 | 병리학자와 친구되는 날 | 99 | 현미경 너머에서 질병의 원인을 밝혀내는 병리학자들의 노고를 기리는 유쾌한 기념일이다. | `anv-fixed-12-13-pick-a-pathologist-pal-day-us` |

### 음식 & 디저트 (13건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 06-17 | 채소를 먹는 날 | 71 | 건강한 식습관을 위해 채소 섭취를 독려하는 날이다. | `anv-fixed-06-17-eat-your-vegetables-day-us` |
| 07-03 | 콩을 먹는 날 (National Eat Your Beans Day) | 73 | 단백질과 식이섬유가 풍부한 콩류 섭취를 독려하는 날이다. | `anv-fixed-07-03-eat-your-beans-day-us` |
| 07-23 | 리프레시먼트의 날 (National Refreshment Day) | 77 | 더운 날 시원한 음료로 활력을 되찾자는 취지의 날이다. | `anv-fixed-07-23-refreshment-day-us` |
| 05-20 | 딸기 따는 날 | 79 | 직접 농장을 찾아 딸기를 수확하는 체험을 즐기자는 취지의 날이다. | `anv-fixed-05-20-pick-strawberries-day-us` |
| 10-25 | 가장 신 음식의 날 (Sourest Day) | 83 | 새콤하고 시큼한 음식과 사탕을 도전적으로 즐겨보자는 유쾌한 기념일이다. | `anv-fixed-10-25-sourest-day-us` |
| 12-05 | 욕조 파티의 날 (Bathtub Party Day) | 83 | 거품 가득한 욕조에 몸을 담그고 여유를 즐겨보자는 가벼운 기념일이다. | `anv-fixed-12-05-bathtub-party-day-global` |
| 06-13 | 부엌 서투른 사람들의 날 | 87 | 요리할 때마다 작은 실수를 저지르는 사람들을 유쾌하게 위로하는 날이다. | `anv-fixed-06-13-kitchen-klutzes-day-us` |
| 09-13 | 아이가 주방을 차지하는 날 | 87 | 아이들이 직접 요리를 해보며 주방의 주인공이 되어보는 날이다. | `anv-fixed-09-13-kids-take-over-kitchen-day-us` |
| 11-23 | 크랜베리 먹는 날 | 88 | 새콤한 빨간 열매, 크랜베리를 그대로 즐겨보자는 취지의 날이다. | `anv-fixed-11-23-eat-a-cranberry-day-us` |
| 12-05 | 루바브 보드카의 날 | 89 | 새콤한 루바브로 향을 낸 보드카를 즐겨보자는 날이다. | `anv-fixed-12-05-rhubarb-vodka-day-us` |
| 07-01 | 창의적인 아이스크림 맛의 날 | 93 | 전통적인 맛을 벗어난 독창적인 아이스크림 맛을 시도해보자는 취지의 날이다. | `anv-fixed-07-01-creative-ice-cream-flavors-day-us` |
| 11-25 | 앞치마 두르는 날 (Tie One On Day) | 95 | 추수감사절을 앞두고 앞치마를 두르고 파이를 구워 이웃과 나눠 먹자는 취지의 날이다. | `anv-fixed-11-25-tie-one-on-day-us` |
| 12-16 | 초콜릿 코팅의 날 | 95 | 딸기든 과자든, 무엇이든 초콜릿으로 입혀 먹어보자는 즐거운 날이다. | `anv-fixed-12-16-chocolate-covered-anything-day-us` |

### 동물 & 자연 (12건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 08-06 | 상큼한 입냄새의 날 | 75 | 구강 건강과 상큼한 입냄새 관리의 중요성을 알리는 날이다. | `anv-fixed-08-06-fresh-breath-day-us` |
| 09-13 | 사냥개를 안아주는 날 | 78 | 충직한 사냥개와 그 견종들에게 사랑을 표현해보자는 날이다. | `anv-fixed-09-13-hug-your-hound-day-us` |
| 11-17 | 하이킹 가는 날 (National Take A Hike Day) | 81 | 산이나 트레일을 직접 걸으며 자연을 만끽해보자는 취지의 날이다. | `anv-fixed-11-17-take-a-hike-day-us` |
| 06-30 | 유성 관측의 날 (National Meteor Watch Day) | 84 | 밤하늘을 가로지르는 유성을 관측하며 우주의 신비를 느껴보는 날이다. | `anv-fixed-06-30-meteor-watch-day-us` |
| 10-17 | 대체 연료의 날 (Alternative Fuel Day) | 85 | 화석연료를 대체할 친환경 에너지원에 대한 관심을 높이기 위한 날이다. | `anv-fixed-10-17-alternative-fuel-day-global` |
| 09-27 | 캔 찌그러뜨리는 날 (National Crush a Can Day) | 86 | 다 마신 음료 캔을 찌그러뜨려 재활용 준비를 하자는 환경 캠페인성 기념일이다. | `anv-fixed-09-27-crush-a-can-day-us` |
| 06-21 | 일광 감사의 날 (National Daylight Appreciation Day) | 87 | 한 해 중 낮이 가장 긴 하지에 맞춰, 풍부한 햇빛과 일광의 가치를 감사하는 날이다. | `anv-fixed-06-21-daylight-appreciation-day-us` |
| 10-10 | 코스튬 교환의 날 | 91 | 핼러윈을 앞두고 안 입는 코스튬 의상을 서로 교환해보자는 친환경적인 기념일이다. | `anv-fixed-10-10-costume-swap-day-us` |
| 12-15 | 고양이 몰이꾼의 날 (Cat Herders Day) | 91 | 고양이처럼 제멋대로인 존재나 일을 다루는 어려움을 위로하는 유쾌한 기념일이다. | `anv-fixed-12-15-cat-herders-day-global` |
| 10-21 | 파충류 인식의 날 (National Reptile Awareness Day) | 95 | 거북이, 뱀, 도마뱀 등 파충류에 대한 편견을 줄이고 올바른 이해를 돕기 위한 날이다. | `anv-fixed-10-21-reptile-awareness-day-global` |
| 11-07 | 반려견 림프종 인식의 날 | 96 | 반려견에게 흔히 발생하는 암 중 하나인 림프종에 대한 인식을 높이기 위한 날이다. | `anv-fixed-11-07-canine-lymphoma-awareness-day-us` |
| 05-04 | 자전거 통학의 날 (National Bike To School Day) | 98 | 학생들이 자전거를 타고 등교하며 건강과 환경 의식을 동시에 기르도록 독려하는 날이다. | `anv-fixed-05-04-bike-to-school-day-us` |

### 국제 캠페인 & 보건 (7건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 04-25 | 희망의 키스 날 | 82 | 암 등 질병과 싸우는 이들에게 희망과 사랑을 전하자는 의미를 담은 날이다. | `anv-fixed-04-25-kiss-of-hope-day-us` |
| 10-13 | 두뇌를 훈련하는 날 (National Train Your Brain Day) | 88 | 퍼즐이나 새로운 학습으로 두뇌를 단련해보자는 취지의 날이다. | `anv-fixed-10-13-train-your-brain-day-us` |
| 10-14 | 테디베어와 함께하는 날 | 88 | 어릴 적 친구였던 테디베어를 학교나 직장에 데려가 보자는 유쾌한 기념일이다. | `anv-fixed-10-14-bring-your-teddy-bear-day-us` |
| 08-06 | 발가락 꼼지락거리는 날 | 92 | 신발을 벗고 발가락을 자유롭게 움직이며 작은 휴식을 가져보자는 유쾌한 기념일이다. | `anv-fixed-08-06-wiggle-your-toes-day-us` |
| 05-11 | 폼롤러의 날 (National Foam Rolling Day) | 93 | 근육 회복과 유연성 향상에 도움을 주는 폼롤러 사용을 독려하는 날이다. | `anv-fixed-05-11-foam-rolling-day-us` |
| 06-01 | 맨발로 걷는 날 | 94 | 신발을 벗고 맨발로 땅을 밟으며 자연과 교감해보자는 취지의 날이다. | `anv-fixed-06-01-go-barefoot-day-us` |
| 10-14 | 괴롭힘 근절의 날 (National Stop Bullying Day) | 94 | 학교와 사회에서 일어나는 괴롭힘 문제를 알리고 근절을 독려하기 위한 날이다. | `anv-fixed-10-14-stop-bullying-day-us` |

### 일반 (7건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 10-30 | 서비스를 위해 목소리 내는 날 | 89 | 받은 서비스에 대한 의견과 피드백을 적극적으로 표현해보자는 취지의 날이다. | `anv-fixed-10-30-speak-up-for-service-day-us` |
| 06-13 | 정원의 잡초 뽑는 날 | 90 | 정원이나 화단의 잡초를 정리하며 식물이 잘 자랄 수 있는 환경을 만들어주는 날이다. | `anv-fixed-06-13-weed-your-garden-day-us` |
| 12-01 | 나눔의 날 (National Day of Giving) | 93 | 연말을 맞아 어려운 이웃에게 작은 나눔을 실천해보자는 취지의 날이다. | `anv-fixed-12-01-day-of-giving-us` |
| 11-01 | 가족 문해력의 날 (National Family Literacy Day) | 94 | 가족이 함께 책을 읽고 문해력을 키워가는 문화를 독려하기 위한 날이다. | `anv-fixed-11-01-family-literacy-day-us` |
| 10-15 | 고객을 알아가는 날 | 95 | 단순한 거래를 넘어 고객과 진심으로 소통해보자는 취지의 비즈니스 기념일이다. | `anv-fixed-10-15-get-to-know-your-customers-day-us` |
| 09-25 | 차량 점검의 날 (National Tune-Up Day) | 96 | 본격적인 가을·겨울철을 앞두고 자동차 점검을 받아보자는 취지의 날이다. | `anv-fixed-09-25-tune-up-day-us` |
| 02-26 | 동화 들려주는 날 | 99 | 아이들에게 동화를 읽어주거나 들려주며 상상력과 교훈을 전하자는 취지로 만들어진 날. | `anv-fixed-02-26-tell-a-fairy-tale-day-global` |

### 문화 & 예술 (4건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 05-03 | 짝짝이 신발의 날 | 77 | 일부러 색이 다른 신발 두 짝을 신어보며 가볍게 일상에 재미를 더하는 날이다. | `anv-fixed-05-03-two-different-colored-shoes-day-us` |
| 05-22 | 악기를 사는 날 | 79 | 미뤄왔던 악기 구입을 결심하고 새로운 취미에 도전해보자는 취지의 날이다. | `anv-fixed-05-22-buy-a-musical-instrument-day-us` |
| 12-12 | 딩어링의 날 | 84 | 방울 소리처럼 경쾌한 것들을 기념하며 즐겁게 보내자는 가벼운 기념일이다. | `anv-fixed-12-12-ding-a-ling-day-us` |
| 04-28 | 주머니 속 시의 날 | 99 | 좋아하는 시 한 편을 주머니에 넣고 다니며 사람들과 나누는 캠페인성 기념일이다. | `anv-fixed-04-28-poem-in-your-pocket-day-us` |

### 학술 & 기술 (2건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 10-14 | 화석의 날 (National Fossil Day) | 90 | 수백만 년 전 생명체의 흔적을 간직한 화석의 과학적 가치를 알리기 위한 날이다. | `anv-fixed-10-14-fossil-day-us` |
| 10-19 | 바탕화면 정리하는 날 | 93 | 아이콘으로 가득 찬 컴퓨터 바탕화면을 깨끗하게 정리해보자는 취지의 날이다. | `anv-fixed-10-19-clean-virtual-desktop-day-us` |

### 역사 & 추모 (2건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 05-09 | 잃어버린 양말 추모의 날 | 84 | 세탁기 속에서 사라져 짝을 잃은 양말들을 유쾌하게 추모하는 날이다. | `anv-fixed-05-09-lost-sock-memorial-day-us` |
| 12-23 | 뿌리를 찾는 날 (National Roots Day) | 95 | 연말 가족이 모이는 시기, 자신의 가족사와 뿌리를 찾아보자는 취지의 날이다. | `anv-fixed-12-23-roots-day-us` |

### 연애 & 기념일 (2건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 09-20 | 아내에게 감사하는 날 | 87 | 가정을 함께 일구어가는 아내의 노고와 사랑에 감사를 전하는 날이다. | `anv-fixed-09-20-wife-appreciation-day-us` |
| 08-25 | 화해의 키스 날 | 92 | 다툰 연인이나 가족과 화해하고 관계를 회복하자는 취지의 날이다. | `anv-fixed-08-25-kiss-and-make-up-day-us` |

### 스포츠 & 레저 (2건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 07-22 | 해먹의 날 (National Hammock Day) | 94 | 나무 사이에 매달아 늘어지는 그물침대, 해먹에서 여유를 즐기자는 취지의 날이다. | `anv-fixed-07-22-hammock-day-us` |
| 12-18 | 언더독의 날 (Underdog Day) | 96 | 주목받지 못하지만 끝까지 최선을 다하는 약자, 언더독을 응원하는 날이다. | `anv-fixed-12-18-underdog-day-global` |

## 100~200자 621건

목표(200~300자)에 못 미치지만 얇지는 않다. ~100자를 끝낸 뒤에 본다.

| 카테고리 | 건수 |
|---|---:|
| 음식 & 디저트 | 158 |
| 국제 캠페인 & 보건 | 84 |
| 이색 & 유머 | 78 |
| 역사 & 추모 | 67 |
| 동물 & 자연 | 61 |
| 문화 & 예술 | 49 |
| 직업 & 감사 | 46 |
| 학술 & 기술 | 32 |
| 일반 | 31 |
| 스포츠 & 레저 | 7 |
| 연애 & 기념일 | 4 |
| 브랜드 데이 | 4 |

