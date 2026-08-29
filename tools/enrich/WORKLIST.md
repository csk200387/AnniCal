# 보강 작업 목록

`python3 tools/enrich/worklist.py --write` 로 생성. 전체 1,734건 기준.

## 현황

| 구간 | 건수 | 비율 |
|---|---:|---:|
| ~100자 | 72 | 4.2% |
| 100~200자 | 621 | 35.8% |
| 200자~ (목표 달성) | 1,041 | 60.0% |

### 출처 그룹별

| 그룹 | 전체 | ~100자 | 평균 |
|---|---:|---:|---:|
| 미국 nationaldaycalendar | 1133 | 72 | 168자 |
| 위키백과 | 123 | 0 | 226자 |
| 기타 공식 출처 | 94 | 0 | 227자 |
| 일본 zatsuneta | 29 | 0 | 229자 |
| 출처 없음/비URL | 231 | 0 | 206자 |
| gov-* 한국 법정·정부 | 124 | 0 | 222자 |

## 유래 단서 상태 (~100자 72건)

| 등급 | 뜻 | 건수 |
|---|---|---:|
| A | 연도+주체 있음 — 확장만 | 0 |
| B | 단서 일부 — 나머지 조사 | 0 |
| C | 상투구만 — 유래 조사 필요 | 72 |
| D | 설명만 — 유래 조사 필요 | 0 |

> C·D 는 조사해도 **그 날짜의 유래가 없을 수 있다.** 미국 이색 기념일 상당수는
> nationaldaycalendar 등록이 유일한 출처다. 그럴 때는 날짜의 유래를 지어내지 말고
> 대상 자체의 기원(언제 어디서 만들어졌는지)과 한국 맥락으로 채운다.

## C. 상투구만 — 유래 조사 필요 — 72건

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

