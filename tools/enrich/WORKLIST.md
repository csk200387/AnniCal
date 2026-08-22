# 보강 작업 목록

`python3 tools/enrich/worklist.py --write` 로 생성. 전체 1,470건 기준.

## 현황

| 구간 | 건수 | 비율 |
|---|---:|---:|
| ~100자 | 355 | 24.1% |
| 100~200자 | 584 | 39.7% |
| 200자~ (목표 달성) | 531 | 36.1% |

### 출처 그룹별

| 그룹 | 전체 | ~100자 | 평균 |
|---|---:|---:|---:|
| 미국 nationaldaycalendar | 1133 | 355 | 134자 |
| 위키백과 | 74 | 0 | 227자 |
| 일본 zatsuneta | 29 | 0 | 229자 |
| 기타 공식 출처 | 23 | 0 | 226자 |
| 출처 없음/비URL | 86 | 0 | 189자 |
| gov-* 한국 법정·정부 | 125 | 0 | 229자 |

## 유래 단서 상태 (~100자 355건)

| 등급 | 뜻 | 건수 |
|---|---|---:|
| A | 연도+주체 있음 — 확장만 | 0 |
| B | 단서 일부 — 나머지 조사 | 0 |
| C | 상투구만 — 유래 조사 필요 | 239 |
| D | 설명만 — 유래 조사 필요 | 116 |

> C·D 는 조사해도 **그 날짜의 유래가 없을 수 있다.** 미국 이색 기념일 상당수는
> nationaldaycalendar 등록이 유일한 출처다. 그럴 때는 날짜의 유래를 지어내지 말고
> 대상 자체의 기원(언제 어디서 만들어졌는지)과 한국 맥락으로 채운다.

## C. 상투구만 — 유래 조사 필요 — 239건

### 음식 & 디저트 (143건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 09-02 | 블루베리 아이스바의 날 | 62 | 새콤달콤한 블루베리맛 아이스바를 기념하는 날이다. | `anv-fixed-09-02-blueberry-popsicle-day-us` |
| 10-02 | 관자튀김의 날 | 63 | 부드러운 관자를 바삭하게 튀긴 관자튀김을 기념하는 날이다. | `anv-fixed-10-02-fried-scallops-day-us` |
| 05-27 | 포도 아이스바의 날 | 65 | 더운 날 즐기는 시원한 포도맛 아이스바를 기념하는 날이다. | `anv-fixed-05-27-grape-popsicle-day-us` |
| 10-20 | 브랜디 과일의 날 | 65 | 브랜디에 절인 과일을 기념하는 날이다. | `anv-fixed-10-20-brandied-fruit-day-us` |
| 08-26 | 체리 아이스바의 날 | 66 | 새콤달콤한 체리맛 아이스바를 기념하는 날이다. | `anv-fixed-08-26-cherry-popsicle-day-us` |
| 02-15 | 검드롭(젤리)의 날 | 69 | 설탕을 입힌 쫀득한 젤리 캔디 '검드롭'을 기념하는 날. | `anv-fixed-02-15-gumdrop-day-us` |
| 07-02 | 아니제트의 날 | 69 | 팔각 향이 나는 아니스 리큐어, 아니제트를 기념하는 날이다. | `anv-fixed-07-02-anisette-day-us` |
| 07-03 | 초콜릿 웨이퍼의 날 | 69 | 바삭한 웨이퍼에 초콜릿을 더한 과자를 기념하는 날이다. | `anv-fixed-07-03-chocolate-wafer-day-us` |
| 08-12 | 쥘리엔 프라이의 날 | 69 | 얇고 길게 채 썬 감자튀김, 쥘리엔 프라이를 기념하는 날이다. | `anv-fixed-08-12-julienne-fries-day-us` |
| 06-17 | 체리 타르트의 날 | 70 | 새콤달콤한 체리를 채운 타르트를 기념하는 날이다. | `anv-fixed-06-17-cherry-tart-day-us` |
| 07-11 | 블루베리 머핀의 날 | 70 | 톡톡 터지는 블루베리가 들어간 머핀을 기념하는 날이다. | `anv-fixed-07-11-blueberry-muffin-day-us` |
| 06-26 | 초콜릿 푸딩의 날 | 71 | 부드럽고 진한 초콜릿 푸딩을 기념하는 날이다. | `anv-fixed-06-26-chocolate-pudding-day-us` |
| 07-30 | 칠리도그의 날 (National Chili Dog Day) | 71 | 핫도그에 칠리 소스를 듬뿍 올린 칠리도그를 기념하는 날이다. | `anv-fixed-07-30-chili-dog-day-us` |
| 08-01 | 라즈베리 크림파이의 날 | 71 | 라즈베리와 부드러운 크림이 어우러진 파이를 기념하는 날이다. | `anv-fixed-08-01-raspberry-cream-pie-day-us` |
| 09-21 | 피칸 쿠키의 날 | 71 | 고소한 피칸이 들어간 바삭한 쿠키를 기념하는 날이다. | `anv-fixed-09-21-pecan-cookie-day-us` |
| 02-18 | 크랩 스터프드 플라운더의 날 | 72 | 가자미 살에 게살 속을 채워 굽는 미국식 해산물 요리를 기념하는 날. | `anv-fixed-02-18-crab-stuffed-flounder-day-us` |
| 05-09 | 모스카토의 날 | 72 | 달콤하고 향긋한 화이트 와인, 모스카토를 기념하는 날이다. | `anv-fixed-05-09-moscato-day-us` |
| 06-10 | 허브와 향신료의 날 | 72 | 요리에 풍미를 더해주는 허브와 향신료를 기념하는 날이다. | `anv-fixed-06-10-herbs-and-spices-day-us` |
| 07-31 | 라즈베리 케이크의 날 | 72 | 새콤달콤한 라즈베리를 넣어 구운 케이크를 기념하는 날이다. | `anv-fixed-07-31-raspberry-cake-day-us` |
| 04-19 | 아마레토의 날 | 73 | 아몬드 향이 나는 이탈리아 리큐어, 아마레토를 기념하는 날이다. | `anv-fixed-04-19-amaretto-day-us` |
| 11-20 | 피넛버터 퍼지의 날 | 73 | 땅콩버터의 고소함을 가득 담은 퍼지를 기념하는 날이다. | `anv-fixed-11-20-peanut-butter-fudge-day-us` |
| 11-27 | 바바리안 크림파이의 날 | 73 | 부드러운 바바리안 크림을 채운 파이를 기념하는 날이다. | `anv-fixed-11-27-bavarian-cream-pie-day-us` |
| 08-20 | 초콜릿 피칸파이의 날 | 74 | 고소한 피칸에 진한 초콜릿을 더한 피칸파이를 기념하는 날이다. | `anv-fixed-08-20-chocolate-pecan-pie-day-us` |
| 10-04 | 보드카의 날 (National Vodka Day) | 74 | 투명하고 깔끔한 맛의 증류주, 보드카를 기념하는 날이다. | `anv-fixed-10-04-vodka-day-us` |
| 11-04 | 캔디의 날 (National Candy Day) | 74 | 다채로운 색과 맛으로 즐기는 사탕을 기념하는 날이다. | `anv-fixed-11-04-candy-day-us` |
| 04-15 | 글레이즈드 스파이럴 햄의 날 | 75 | 나선형으로 썰어 달콤한 소스를 발라 구운 햄 요리를 기념하는 날이다. | `anv-fixed-04-15-glazed-spiral-ham-day-us` |
| 05-12 | 너티 퍼지의 날 | 75 | 견과류를 듬뿍 넣은 진한 퍼지(설탕 디저트)를 기념하는 날이다. | `anv-fixed-05-12-nutty-fudge-day-us` |
| 05-22 | 바닐라 푸딩의 날 | 75 | 부드럽고 고소한 바닐라 푸딩을 기념하는 날이다. | `anv-fixed-05-22-vanilla-pudding-day-us` |
| 10-26 | 호박의 날 (National Pumpkin Day) | 75 | 가을과 핼러윈을 대표하는 채소, 호박을 기념하는 날이다. | `anv-fixed-10-26-pumpkin-day-us` |
| 06-20 | 바닐라 밀크셰이크의 날 | 76 | 부드럽고 진한 바닐라 밀크셰이크를 기념하는 날이다. | `anv-fixed-06-20-vanilla-milkshake-day-us` |
| 07-16 | 콘 프리터의 날 | 76 | 옥수수 알을 반죽에 섞어 튀기거나 구운 콘 프리터를 기념하는 날이다. | `anv-fixed-07-16-corn-fritters-day-us` |
| 08-16 | 럼의 날 (National Rum Day) | 76 | 사탕수수로 만드는 카리브해 전통 증류주, 럼을 기념하는 날이다. | `anv-fixed-08-16-rum-day-us` |
| 08-24 | 피치파이의 날 | 76 | 잘 익은 복숭아를 듬뿍 채운 피치파이를 기념하는 날이다. | `anv-fixed-08-24-peach-pie-day-us` |
| 09-07 | 아콘 스쿼시의 날 | 76 | 도토리 모양을 닮은 호박 품종, 아콘 스쿼시를 기념하는 날이다. | `anv-fixed-09-07-acorn-squash-day-us` |
| 09-15 | 리니귀네의 날 (National Linguine Day) | 76 | 납작하고 길쭉한 모양의 파스타, 리니귀네를 기념하는 날이다. | `anv-fixed-09-15-linguine-day-us` |
| 12-19 | 하드캔디의 날 | 76 | 딱딱하게 굳혀 만드는 사탕, 하드캔디를 기념하는 날이다. | `anv-fixed-12-19-hard-candy-day-us` |
| 01-06 | 콩의 날 | 77 | 단백질과 식이섬유가 풍부한 콩류 작물을 기념하는 날. | `anv-fixed-01-06-bean-day-us` |
| 02-25 | 초콜릿 코팅 견과류의 날 | 77 | 아몬드·땅콩 등 견과류를 초콜릿으로 코팅한 간식을 기념하는 날. | `anv-fixed-02-25-chocolate-covered-nut-day-us` |
| 04-21 | 초콜릿 코팅 캐슈너트의 날 | 77 | 고소한 캐슈너트를 달콤한 초콜릿으로 감싼 간식을 기념하는 날이다. | `anv-fixed-04-21-chocolate-covered-cashews-day-us` |
| 05-03 | 초콜릿 커스터드의 날 | 77 | 부드럽고 진한 초콜릿 커스터드 크림을 기념하는 날이다. | `anv-fixed-05-03-chocolate-custard-day-us` |
| 06-09 | 딸기 루바브 파이의 날 | 77 | 딸기의 단맛과 루바브의 새콤함이 어우러지는 파이를 기념하는 날이다. | `anv-fixed-06-09-strawberry-rhubarb-pie-day-us` |
| 07-11 | 레이니어 체리의 날 | 77 | 달콤하고 과육이 단단한 노란빛 체리 품종, 레이니어 체리를 기념하는 날이다. | `anv-fixed-07-11-rainier-cherry-day-us` |
| 08-13 | 필레미뇽의 날 | 77 | 소 안심 부위로 만드는 부드러운 스테이크, 필레미뇽을 기념하는 날이다. | `anv-fixed-08-13-filet-mignon-day-us` |
| 09-28 | 딸기 크림파이의 날 | 77 | 신선한 딸기와 부드러운 크림을 채운 딸기 크림파이를 기념하는 날이다. | `anv-fixed-09-28-strawberry-cream-pie-day-us` |
| 10-07 | 프라페의 날 (National Frappe Day) | 77 | 얼음과 함께 갈아 시원하게 즐기는 음료, 프라페를 기념하는 날이다. | `anv-fixed-10-07-frappe-day-us` |
| 10-18 | 초콜릿 컵케이크의 날 | 77 | 한 손에 쥐기 좋은 크기의 진한 초콜릿 컵케이크를 기념하는 날이다. | `anv-fixed-10-18-chocolate-cupcake-day-us` |
| 06-22 | 어니언링의 날 (National Onion Rings Day) | 78 | 바삭하게 튀긴 양파, 어니언링을 기념하는 날이다. | `anv-fixed-06-22-onion-rings-day-us` |
| 07-07 | 딸기 선데이의 날 | 78 | 아이스크림에 딸기 시럽과 토핑을 올린 딸기 선데이를 기념하는 날이다. | `anv-fixed-07-07-strawberry-sundae-day-us` |
| 07-15 | 타피오카 푸딩의 날 | 78 | 쫀득한 타피오카 펄이 들어간 부드러운 푸딩을 기념하는 날이다. | `anv-fixed-07-15-tapioca-pudding-day-us` |
| 07-18 | 딸기 루바브 와인의 날 | 78 | 딸기와 루바브로 만드는 독특한 과일 와인을 기념하는 날이다. | `anv-fixed-07-18-strawberry-rhubarb-wine-day-us` |
| 08-07 | 라즈베리 앤 크림의 날 | 78 | 라즈베리에 생크림을 곁들인 클래식 디저트를 기념하는 날이다. | `anv-fixed-08-07-raspberries-n-cream-day-us` |
| 10-30 | 브레드스틱의 날 (National Breadstix Day) | 78 | 바삭하고 길쭉한 모양의 빵, 브레드스틱을 기념하는 날이다. | `anv-fixed-10-30-breadstix-day-us` |
| 11-07 | 비터스윗 초콜릿 아몬드의 날 | 78 | 씁쌀한 다크초콜릿과 고소한 아몬드의 조합을 기념하는 날이다. | `anv-fixed-11-07-bittersweet-chocolate-almonds-day-us` |
| 11-19 | 카페인 탄산음료의 날 | 78 | 카페인이 함유된 탄산음료를 기념하는 날이다. | `anv-fixed-11-19-caffeinated-soda-day-us` |
| 12-19 | 오트밀 머핀의 날 | 78 | 든든한 한 끼 대용으로도 좋은 오트밀 머핀을 기념하는 날이다. | `anv-fixed-12-19-oatmeal-muffin-day-us` |
| 05-06 | 음료의 날 (National Beverage Day) | 79 | 물부터 탄산음료, 주스까지 모든 종류의 음료를 폭넓게 기념하는 날이다. | `anv-fixed-05-06-beverage-day-us` |
| 11-16 | 패스트푸드의 날 (National Fast Food Day) | 79 | 빠르고 간편하게 즐길 수 있는 패스트푸드를 기념하는 날이다. | `anv-fixed-11-16-fast-food-day-us` |
| 12-02 | 프리터(튀김빵)의 날 | 79 | 과일이나 채소를 반죽에 섞어 튀긴 프리터를 기념하는 날이다. | `anv-fixed-12-02-fritters-day-us` |
| 05-01 | 초콜릿 파르페의 날 | 80 | 층층이 쌓아 올린 초콜릿 디저트, 파르페를 기념하는 날이다. | `anv-fixed-05-01-chocolate-parfait-day-us` |
| 05-08 | 코코넛 크림 파이의 날 | 80 | 코코넛 크림을 가득 채운 파이를 기념하는 날이다. | `anv-fixed-05-08-coconut-cream-pie-day-us` |
| 05-13 | 크루통의 날 (National Crouton Day) | 80 | 바삭하게 구운 빵 조각, 크루통을 기념하는 날이다. | `anv-fixed-05-13-crouton-day-us` |
| 08-11 | 라즈베리 봄베의 날 | 80 | 라즈베리 아이스크림을 돔 모양으로 얼려 만드는 디저트, 봄베를 기념하는 날이다. | `anv-fixed-08-11-raspberry-bombe-day-us` |
| 08-22 | 피칸 토르테의 날 | 80 | 곱게 다진 피칸을 넣어 만드는 진한 디저트, 피칸 토르테를 기념하는 날이다. | `anv-fixed-08-22-pecan-torte-day-us` |
| 06-25 | 폭탄 모양 아이스바의 날 | 81 | 빨강·파랑·하양 삼색의 로켓 모양 아이스바, 봄팝을 기념하는 날이다. | `anv-fixed-06-25-bomb-pop-day-us` |
| 07-12 | 피칸파이의 날 (National Pecan Pie Day) | 81 | 고소한 피칸을 듬뿍 올린 진한 단맛의 피칸파이를 기념하는 날이다. | `anv-fixed-07-12-pecan-pie-day-us` |
| 11-15 | 레이즌 브랜 시리얼의 날 | 81 | 건포도와 식이섬유가 풍부한 시리얼, 레이즌 브랜을 기념하는 날이다. | `anv-fixed-11-15-raisin-bran-cereal-day-us` |
| 11-30 | 무스의 날 (National Mousse Day) | 81 | 거품처럼 가볍고 부드러운 디저트, 무스를 기념하는 날이다. | `anv-fixed-11-30-mousse-day-us` |
| 08-18 | 아이스크림 파이의 날 | 82 | 파이 크러스트 안에 아이스크림을 채워 얼리는 아이스크림 파이를 기념하는 날이다. | `anv-fixed-08-18-ice-cream-pie-day-us` |
| 09-15 | 크렘 드 멍트의 날 | 82 | 민트향이 가득한 리큐어, 크렘 드 멍트를 기념하는 날이다. | `anv-fixed-09-15-creme-de-menthe-day-us` |
| 02-23 | 도그 비스킷의 날 | 83 | 반려견을 위한 간식 도그 비스킷을 기념하는 날. | `anv-fixed-02-23-dog-biscuit-day-us` |
| 05-29 | 코코뱅의 날 | 83 | 닭고기를 와인에 졸여 만드는 프랑스 전통 요리, 코코뱅을 기념하는 날이다. | `anv-fixed-05-29-coq-au-vin-day-us` |
| 07-17 | 복숭아 아이스크림의 날 | 83 | 잘 익은 복숭아의 향과 단맛을 담은 아이스크림을 기념하는 날이다. | `anv-fixed-07-17-peach-ice-cream-day-us` |
| 07-22 | 페누체 퍼지의 날 | 83 | 갈색설탕과 버터로 만드는 캐러멜 풍미의 퍼지, 페누체를 기념하는 날이다. | `anv-fixed-07-22-penuche-fudge-day-us` |
| 07-25 | 핫퍼지 선데이의 날 | 83 | 따뜻한 초콜릿 퍼지 소스를 아이스크림에 듬뿍 부은 핫퍼지 선데이를 기념하는 날이다. | `anv-fixed-07-25-hot-fudge-sundae-day-us` |
| 10-14 | 디저트의 날 (National Dessert Day) | 83 | 식사의 마지막을 달콤하게 마무리해주는 디저트를 기념하는 날이다. | `anv-fixed-10-14-dessert-day-us` |
| 08-30 | 구운 마시멜로의 날 | 84 | 불에 살짝 구워 겉은 바삭하고 속은 쫀득해진 마시멜로를 기념하는 날이다. | `anv-fixed-08-30-toasted-marshmallow-day-us` |
| 09-27 | 콘비프 해시의 날 | 84 | 잘게 썬 콘비프와 감자를 함께 구운 콘비프 해시를 기념하는 날이다. | `anv-fixed-09-27-corned-beef-hash-day-us` |
| 04-27 | 프라임 립의 날 | 85 | 두툼한 소갈비살을 통째로 구워내는 고급 요리, 프라임 립을 기념하는 날이다. | `anv-fixed-04-27-prime-rib-day-us` |
| 04-28 | 블루베리 파이의 날 | 85 | 달콤하면서도 약간의 산미가 있는 블루베리로 채운 파이를 기념하는 날이다. | `anv-fixed-04-28-blueberry-pie-day-us` |
| 05-17 | 체리 코블러의 날 | 85 | 체리를 듬뿍 넣고 비스킷 반죽을 얹어 구운 디저트, 체리 코블러를 기념하는 날이다. | `anv-fixed-05-17-cherry-cobbler-day-us` |
| 11-22 | 크랜베리 렐리시의 날 | 85 | 새콤달콤한 크랜베리를 다져 만드는 소스, 크랜베리 렐리시를 기념하는 날이다. | `anv-fixed-11-22-cranberry-relish-day-us` |
| 05-24 | 에스카르고의 날 | 86 | 버터와 마늘로 조리한 프랑스식 달팽이 요리, 에스카르고를 기념하는 날이다. | `anv-fixed-05-24-escargot-day-us` |
| 06-25 | 딸기 파르페의 날 | 86 | 딸기와 크림을 층층이 쌓아 만드는 디저트, 딸기 파르페를 기념하는 날이다. | `anv-fixed-06-25-strawberry-parfait-day-us` |
| 07-13 | 콩과 소시지의 날 | 86 | 콩과 소시지를 함께 조리하는 미국 가정식, 빈즈 앤 프랭크스를 기념하는 날이다. | `anv-fixed-07-13-beans-n-franks-day-us` |
| 07-25 | 요리사의 날 (National Culinarian's Day) | 86 | 맛있는 음식을 만드는 요리사들의 창의력과 노고를 기리는 날이다. | `anv-fixed-07-25-culinarians-day-us` |
| 11-10 | 바닐라 컵케이크의 날 | 86 | 단순하지만 변치 않는 인기를 누리는 바닐라 컵케이크를 기념하는 날이다. | `anv-fixed-11-10-vanilla-cupcake-day-us` |
| 05-25 | 브라운백 점심의 날 | 87 | 종이봉투에 도시락을 싸 와서 점심을 해결하는 절약형 식습관을 기념하는 날이다. | `anv-fixed-05-25-brown-bag-it-day-us` |
| 09-19 | 버터스카치 푸딩의 날 | 87 | 캐러멜라이즈된 버터와 설탕의 깊은 풍미를 가진 버터스카치 푸딩을 기념하는 날이다. | `anv-fixed-09-19-butterscotch-pudding-day-us` |
| 10-08 | 플러퍼너터의 날 | 87 | 땅콩버터와 마시멜로 크림을 빵 사이에 끼운 샌드위치, 플러퍼너터를 기념하는 날이다. | `anv-fixed-10-08-fluffernutter-day-us` |
| 10-15 | 케이크 데코레이션의 날 | 87 | 케이크를 화려하게 장식하는 케이크 데코레이션 기술을 기념하는 날이다. | `anv-fixed-10-15-cake-decorating-day-us` |
| 02-17 | 양배추의 날 | 88 | 영양가 높고 다양한 요리에 활용되는 채소 양배추를 기념하는 날. | `anv-fixed-02-17-cabbage-day-us` |
| 04-09 | 중국식 아몬드 쿠키의 날 | 88 | 위에 아몬드 한 알을 올려 굽는 중국식 아몬드 쿠키를 기념하는 날이다. | `anv-fixed-04-09-chinese-almond-cookie-day-us` |
| 05-14 | 버터밀크 비스킷의 날 | 88 | 버터밀크로 반죽해 폭신하게 구운 미국 남부식 비스킷을 기념하는 날이다. | `anv-fixed-05-14-buttermilk-biscuit-day-us` |
| 06-23 | 피칸 샌디스의 날 | 88 | 버터 풍미가 가득하고 피칸이 들어간 바삭한 쿠키, 피칸 샌디스를 기념하는 날이다. | `anv-fixed-06-23-pecan-sandies-day-us` |
| 08-20 | 레모네이드의 날 (National Lemonade Day) | 88 | 새콤달콤한 여름철 음료, 레모네이드를 기념하는 날이다. | `anv-fixed-08-20-lemonade-day-us` |
| 08-23 | 스펀지케이크의 날 | 88 | 폭신하고 가벼운 식감의 기본 케이크, 스펀지케이크를 기념하는 날이다. | `anv-fixed-08-23-sponge-cake-day-us` |
| 09-16 | 시나몬 레이즌 브레드의 날 | 88 | 계피향과 건포도가 어우러진 빵, 시나몬 레이즌 브레드를 기념하는 날이다. | `anv-fixed-09-16-cinnamon-raisin-bread-day-us` |
| 09-30 | 뜨거운 멀드 사이더의 날 | 88 | 사과주스에 향신료를 더해 따뜻하게 데운 음료, 멀드 사이더를 기념하는 날이다. | `anv-fixed-09-30-hot-mulled-cider-day-us` |
| 12-11 | 누들 링의 날 | 88 | 고리 모양으로 틀에 넣어 굽는 누들 캐서롤 요리를 기념하는 날이다. | `anv-fixed-12-11-noodle-ring-day-us` |
| 12-23 | 페퍼누스의 날 | 88 | 후추와 향신료가 들어간 독일식 쿠키, 페퍼누스를 기념하는 날이다. | `anv-fixed-12-23-pfeffernusse-day-us` |
| 08-09 | 라이스푸딩의 날 | 89 | 쌀과 우유, 설탕으로 만드는 부드러운 디저트, 라이스푸딩을 기념하는 날이다. | `anv-fixed-08-09-rice-pudding-day-us` |
| 08-28 | 체리 턴오버의 날 | 89 | 페이스트리에 체리 필링을 채워 삼각형으로 접어 구운 체리 턴오버를 기념하는 날이다. | `anv-fixed-08-28-cherry-turnovers-day-us` |
| 01-10 | 비터스윗 초콜릿의 날 | 90 | 카카오 함량이 높아 쌉쌀하면서도 단맛이 도는 비터스윗 초콜릿을 기념하는 날. | `anv-fixed-01-10-bittersweet-chocolate-day-us` |
| 02-10 | 크림치즈 브라우니의 날 | 90 | 초콜릿 브라우니 반죽에 크림치즈를 섞거나 층을 더한 디저트를 기념하는 날. | `anv-fixed-02-10-cream-cheese-brownie-day-us` |
| 04-23 | 체리 치즈케이크의 날 | 90 | 부드러운 크림치즈 위에 새콤달콤한 체리를 올린 체리 치즈케이크를 기념하는 날이다. | `anv-fixed-04-23-cherry-cheesecake-day-us` |
| 07-16 | 퍼스널 셰프의 날 | 90 | 개인이나 가정에 맞춤 요리를 제공하는 퍼스널 셰프들의 노고를 기리는 날이다. | `anv-fixed-07-16-personal-chefs-day-us` |
| 09-17 | 애플 덤플링의 날 | 90 | 통째로 또는 큼직하게 썬 사과를 반죽으로 감싸 구운 애플 덤플링을 기념하는 날이다. | `anv-fixed-09-17-apple-dumpling-day-us` |
| 01-22 | 블론드 브라우니의 날 | 91 | 코코아 대신 브라운슈가와 버터로 맛을 낸 '블론드 브라우니(블론디)'를 기념하는 날. | `anv-fixed-01-22-blonde-brownie-day-us` |
| 06-13 | 로제의 날 (National Rosé Day) | 91 | 은은한 핑크빛과 가벼운 풍미를 가진 로제 와인을 기념하는 날이다. | `anv-fixed-06-13-rose-day-us` |
| 06-22 | 초콜릿 에클레어의 날 | 91 | 길쭘한 페이스트리에 크림을 채우고 초콜릿을 입힌 프랑스식 디저트, 에클레어를 기념하는 날이다. | `anv-fixed-06-22-chocolate-eclair-day-us` |
| 05-04 | 오렌지 껍질 캔디의 날 | 92 | 버리기 쉬운 오렌지 껍질을 설탕에 졸여 만드는 캔디드 오렌지 필을 기념하는 날이다. | `anv-fixed-05-04-candied-orange-peel-day-us` |
| 07-14 | 그랑 마르니에의 날 | 92 | 코냑과 오렌지 리큐어를 블렌딩한 프랑스산 술, 그랑 마르니에를 기념하는 날이다. | `anv-fixed-07-14-grand-marnier-day-us` |
| 10-21 | 펌킨 치즈케이크의 날 | 92 | 가을 향 가득한 호박과 부드러운 치즈케이크가 만난 펌킨 치즈케이크를 기념하는 날이다. | `anv-fixed-10-21-pumpkin-cheesecake-day-us` |
| 11-25 | 파르페의 날 (National Parfait Day) | 92 | 과일, 크림, 그래놀라 등을 층층이 쌓아 만드는 디저트, 파르페를 기념하는 날이다. | `anv-fixed-11-25-parfait-day-us` |
| 06-02 | 로티세리 치킨의 날 | 93 | 꼬치에 꽂아 빙글빙글 돌리며 구워내는 로티세리 치킨을 기념하는 날이다. | `anv-fixed-06-02-rotisserie-chicken-day-us` |
| 08-01 | 자메이카 패티의 날 | 93 | 매콤한 속을 채운 황금빛 페이스트리, 자메이카 패티를 기념하는 날이다. | `anv-fixed-08-01-jamaican-patty-day-us` |
| 08-02 | 아이스크림 샌드위치의 날 | 93 | 두 장의 쿠키나 웨이퍼 사이에 아이스크림을 끼운 아이스크림 샌드위치를 기념하는 날이다. | `anv-fixed-08-02-ice-cream-sandwich-day-us` |
| 09-11 | 핫 크로스 번의 날 | 93 | 십자 모양 글레이즈를 올린 향신료 빵, 핫 크로스 번을 기념하는 날이다. | `anv-fixed-09-11-hot-cross-bun-day-us` |
| 02-11 | 페퍼민트 패티의 날 | 94 | 민트 크림을 초콜릿으로 감싼 캔디 '페퍼민트 패티'를 기념하는 날. | `anv-fixed-02-11-peppermint-patty-day-us` |
| 07-05 | 애플 턴오버의 날 | 94 | 페이스트리에 사과 필링을 채워 삼각형으로 접어 구운 애플 턴오버를 기념하는 날이다. | `anv-fixed-07-05-apple-turnover-day-us` |
| 08-27 | 포 드 크렘의 날 | 94 | 작은 도자기 그릇에 담아 굽는 프랑스식 진한 커스터드 디저트, 포 드 크렘을 기념하는 날이다. | `anv-fixed-08-27-pots-de-creme-day-us` |
| 10-05 | 애플 베티의 날 | 94 | 사과와 시나몬, 빵가루를 층층이 쌓아 구운 디저트, 애플 베티를 기념하는 날이다. | `anv-fixed-10-05-apple-betty-day-us` |
| 11-15 | 스파이시 허밋 쿠키의 날 | 95 | 향신료와 건과일을 듬뿍 넣은 묵직한 쿠키, 허밋 쿠키를 기념하는 날이다. | `anv-fixed-11-15-spicy-hermit-cookie-day-us` |
| 12-12 | 암브로시아의 날 | 95 | 과일과 마시멜로, 코코넛 등을 섞어 만드는 디저트 샐러드, 암브로시아를 기념하는 날이다. | `anv-fixed-12-12-ambrosia-day-us` |
| 02-28 | 초콜릿 수플레의 날 | 96 | 오븐에서 부풀어 오른 부드러운 초콜릿 디저트 '수플레'를 기념하는 날. | `anv-fixed-02-28-chocolate-souffle-day-us` |
| 04-23 | 피크닉의 날 (National Picnic Day) | 96 | 따뜻한 봄날, 야외에 돗자리를 펴고 즐기는 소박한 즐거움인 피크닉을 기념하는 날이다. | `anv-fixed-04-23-picnic-day-us` |
| 04-25 | 주키니 브레드의 날 | 96 | 다진 주키니 호박을 넣어 구운 달콤한 빵, 주키니 브레드를 기념하는 날이다. | `anv-fixed-04-25-zucchini-bread-day-us` |
| 05-18 | 치즈 수플레의 날 | 96 | 오븐 속에서 부풀어 오르는 폭신한 치즈 요리, 수플레를 기념하는 날이다. | `anv-fixed-05-18-cheese-souffle-day-us` |
| 06-10 | 블랙 카우의 날 | 96 | 콜라에 바닐라 아이스크림을 띄운 클래식 음료, 블랙 카우(루트비어 플로트류)를 기념하는 날이다. | `anv-fixed-06-10-black-cow-day-us` |
| 06-14 | 스트로베리 쇼트케이크의 날 | 96 | 스펀지케이크에 딸기와 생크림을 듬뿍 올린 스트로베리 쇼트케이크를 기념하는 날이다. | `anv-fixed-06-14-strawberry-shortcake-day-us` |
| 09-08 | 앤츠 온 어 로그의 날 | 96 | 셀러리에 땅콩버터를 바르고 건포도를 올린 간단한 간식, 앤츠 온 어 로그를 기념하는 날이다. | `anv-fixed-09-08-ants-on-a-log-day-us` |
| 09-23 | 아메리칸 팟파이의 날 | 96 | 고기와 채소를 크림소스에 버무려 파이 크러스트로 덮어 구운 팟파이를 기념하는 날이다. | `anv-fixed-09-23-great-american-pot-pie-day-us` |
| 11-13 | 인디언 푸딩의 날 | 96 | 옥수수가루와 향신료로 만드는 미국 전통 디저트, 인디언 푸딩을 기념하는 날이다. | `anv-fixed-11-13-indian-pudding-day-us` |
| 04-18 | 애니멀 크래커의 날 | 97 | 동물 모양으로 만들어진 어린이용 과자, 애니멀 크래커를 기념하는 날이다. | `anv-fixed-04-18-animal-crackers-day-us` |
| 04-24 | 피그 인 어 블랭킷의 날 | 97 | 소시지를 반죽으로 감싸 구운 간식, 피그 인 어 블랭킷을 기념하는 날이다. | `anv-fixed-04-24-pigs-in-a-blanket-day-us` |
| 05-07 | 양다리 구이의 날 | 97 | 허브와 향신료로 양념해 통째로 구워내는 양다리 요리를 기념하는 날이다. | `anv-fixed-05-07-roast-leg-of-lamb-day-us` |
| 05-09 | 버터스카치 브라우니의 날 | 97 | 캐러멜라이즈된 버터와 설탕의 풍미가 가득한 버터스카치 브라우니를 기념하는 날이다. | `anv-fixed-05-09-butterscotch-brownie-day-us` |
| 06-17 | 애플 스트루델의 날 | 97 | 얇은 페이스트리에 사과 필링을 말아 구운 오스트리아·독일식 디저트, 애플 스트루델을 기념하는 날이다. | `anv-fixed-06-17-apple-strudel-day-us` |
| 09-18 | 치즈버거의 날 (National Cheeseburger Day) | 97 | 패티 위에 치즈 한 장을 올린 클래식 치즈버거를 기념하는 날이다. | `anv-fixed-09-18-cheeseburger-day-us` |
| 10-26 | 민스미트의 날 | 98 | 다진 과일과 향신료를 섞어 만드는 파이 속재료, 민스미트를 기념하는 날이다. | `anv-fixed-10-26-mincemeat-day-us` |
| 10-27 | 아메리칸 비어의 날 (National American Beer Day) | 98 | 미국 양조 산업의 역사와 다양한 스타일의 미국식 맥주를 기념하는 날이다. | `anv-fixed-10-27-american-beer-day-us` |
| 06-07 | 초콜릿 아이스크림의 날 | 99 | 가장 클래식한 아이스크림 맛 중 하나인 초콜릿 아이스크림을 기념하는 날이다. | `anv-fixed-06-07-chocolate-ice-cream-day-us` |
| 07-23 | 바닐라 아이스크림의 날 | 99 | 가장 기본이지만 가장 사랑받는 아이스크림 맛, 바닐라를 기념하는 날이다. | `anv-fixed-07-23-vanilla-ice-cream-day-us` |

### 직업 & 감사 (23건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 11-01 | 작가의 날 (National Authors' Day) | 70 | 이야기를 짓는 작가들의 창작 활동을 기리는 날이다. | `anv-fixed-11-01-authors-day-us` |
| 07-30 | 장인·시아버지의 날 | 78 | 배우자의 아버지, 장인·시아버지와의 관계를 기리는 날이다. | `anv-fixed-07-30-father-in-law-day-us` |
| 11-08 | 부모 교사의 날 (National Parents as Teachers Day) | 80 | 아이의 첫 번째 선생님인 부모의 역할을 기리는 날이다. | `anv-fixed-11-08-parents-as-teachers-day-us` |
| 06-26 | 미용사의 날 (National Beautician's Day) | 81 | 고객의 아름다움을 가꿔주는 미용사들의 기술과 노고를 기리는 날이다. | `anv-fixed-06-26-beauticians-day-us` |
| 10-12 | 농부의 날 (National Farmers Day) | 84 | 땀과 노력으로 식량을 길러내는 농부들의 노고를 기리는 날이다. | `anv-fixed-10-12-farmers-day-us` |
| 11-03 | 주부의 날 (National Housewife's Day) | 85 | 가정을 꾸려가는 주부들의 노고와 헌신을 기리는 날이다. | `anv-fixed-11-03-housewifes-day-us` |
| 05-21 | 메모의 날 (National Memo Day) | 86 | 업무 소통의 기본 도구인 메모(공지문)의 중요성을 기념하는 날이다. | `anv-fixed-05-21-memo-day-us` |
| 05-21 | 서빙 직원의 날 | 87 | 식당에서 손님을 응대하고 서빙하는 직원들의 노고를 기리는 날이다. | `anv-fixed-05-21-waitstaff-day-us` |
| 12-06 | 전당업자의 날 | 88 | 오랜 역사를 가진 직업인 전당업자들을 기리는 날이다. | `anv-fixed-12-06-pawnbrokers-day-us` |
| 10-02 | 시설관리 노동자의 날 | 89 | 건물과 시설을 깨끗하게 관리하는 시설관리 노동자들의 노고를 기리는 날이다. | `anv-fixed-10-02-custodial-workers-day-us` |
| 10-20 | 약사 보조원의 날 (National Pharmacy Technician Day) | 89 | 약사를 보조하며 약국 운영의 핵심 역할을 하는 약사 보조원들의 노고를 기리는 날이다. | `anv-fixed-10-20-pharmacy-technician-day-us` |
| 04-22 | 걸스카우트 리더의 날 | 90 | 걸스카우트 단원들을 지도하고 이끄는 리더들의 헌신을 기리는 날이다. | `anv-fixed-04-22-girl-scout-leaders-day-us` |
| 07-01 | 우체국 직원의 날 | 90 | 비가 오나 눈이 오나 편지와 소포를 배달하는 우체국 직원들의 노고를 기리는 날이다. | `anv-fixed-07-01-postal-worker-day-us` |
| 10-30 | 약국 구매담당자의 날 | 90 | 약국에 필요한 의약품과 물품을 관리하는 구매담당자들의 역할을 기리는 날이다. | `anv-fixed-10-30-pharmacy-buyer-day-us` |
| 09-29 | 손주의 탄생을 함께하는 날 | 91 | 손주가 태어나는 순간을 함께하는 조부모들의 기쁨을 기념하는 날이다. | `anv-fixed-09-29-attend-your-grandchilds-birth-day-us` |
| 05-11 | 학교 보건교사의 날 | 93 | 학생들의 건강을 보살피는 학교 보건교사들의 헌신을 기리는 날이다. | `anv-fixed-05-11-school-nurse-day-us` |
| 05-11 | 리셉셔니스트의 날 | 95 | 회사나 병원의 첫인상을 책임지는 리셉셔니스트(안내 직원)들의 노고를 기리는 날이다. | `anv-fixed-05-11-receptionists-day-us` |
| 05-11 | 야간 근무자의 날 | 95 | 모두가 잠든 시간에 일하는 야간(3교대) 근무자들의 노고를 기리는 날이다. | `anv-fixed-05-11-third-shift-workers-day-us` |
| 09-04 | 신문 배달원의 날 | 95 | 이른 아침 집집마다 신문을 배달하는 신문 배달원들의 노고를 기리는 날이다. | `anv-fixed-09-04-newspaper-carrier-day-us` |
| 11-18 | 교육지원 전문가의 날 | 96 | 교사를 보조하고 학교 운영을 지원하는 교육지원 전문가들의 노고를 기리는 날이다. | `anv-fixed-11-18-educational-support-professionals-day-us` |
| 10-21 | 의료 보조원의 날 | 97 | 병원과 진료실에서 의사를 보조하며 환자를 돌보는 의료 보조원들의 노고를 기리는 날이다. | `anv-fixed-10-21-medical-assistants-day-global` |
| 04-12 | 도서관 직원의 날 | 98 | 지식과 정보의 관문인 도서관을 지키는 사서와 직원들의 노고를 기리는 날이다. | `anv-fixed-04-12-library-workers-day-us` |
| 09-08 | 소아 혈액·종양 간호사의 날 | 99 | 백혈병이나 소아암을 앓는 아이들을 돌보는 전문 간호사들의 헌신을 기리는 날이다. | `anv-fixed-09-08-pediatric-hem-onc-nurses-day-us` |

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

### 동물 & 자연 (9건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 06-27 | 오렌지 꽃의 날 | 70 | 향긋한 향을 내는 오렌지 나무의 꽃을 기념하는 날이다. | `anv-fixed-06-27-orange-blossom-day-us` |
| 09-26 | 수렵·낚시의 날 (National Hunting and Fishing Day) | 83 | 야외에서 자연과 함께하는 수렵과 낚시 문화를 기리는 날이다. | `anv-fixed-09-26-hunting-and-fishing-day-us` |
| 05-30 | 꽃에 물 주는 날 | 87 | 정원이나 화분의 꽃에 물을 주며 자연을 돌보는 작은 실천을 기념하는 날이다. | `anv-fixed-05-30-water-a-flower-day-us` |
| 02-28 | 플로럴 디자인의 날 | 92 | 꽃을 활용해 공간을 꾸미는 플로럴 디자인(꽃꽂이)을 기념하는 날. | `anv-fixed-02-28-floral-design-day-us` |
| 04-16 | 난초의 날 (National Orchid Day) | 93 | 화려하고 다양한 형태를 자랑하는 꽃, 난초의 아름다움을 기리는 날이다. | `anv-fixed-04-16-orchid-day-us` |
| 09-19 | 세계 해안 정화의 날 (International Coastal Cleanup Day) | 94 | 전 세계 해안가의 쓰레기를 함께 치우는 국제 환경 캠페인을 기념하는 날이다. | `anv-fixed-09-19-international-coastal-cleanup-day-global` |
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

## D. 설명만 — 유래 조사 필요 — 116건

### 이색 & 유머 (52건)

| 날짜 | 이름 | 자수 | 현재 origin | id |
|---|---|---:|---|---|
| 05-04 | 갱신의 날 (National Renewal Day) | 68 | 낡은 습관이나 관계, 목표를 새롭게 다잡아보자는 의미를 담은 날이다. | `anv-fixed-05-04-renewal-day-us` |
| 09-12 | 격려의 날 (National Day of Encouragement) | 76 | 주변 사람들에게 따뜻한 격려의 말을 전해보자는 취지의 날이다. | `anv-fixed-09-12-day-of-encouragement-us` |
| 04-09 | 스스로 이름 짓는 날 | 78 | 재미로 자신만의 별명이나 새 이름을 지어보자는 가벼운 기념일이다. | `anv-fixed-04-09-name-yourself-day-us` |
| 05-18 | 더러운 그릇 없는 날 | 78 | 쌓아둔 설거지를 모두 끝내고 깨끗한 부엌에서 하루를 시작해보자는 취지의 날이다. | `anv-fixed-05-18-no-dirty-dishes-day-us` |
| 09-22 | 다이어리 쓰는 날 (Dear Diary Day) | 78 | 하루의 생각과 감정을 일기로 기록해보자는 취지의 날이다. | `anv-fixed-09-22-dear-diary-day-global` |
| 08-15 | 휴식의 날 (National Relaxation Day) | 79 | 바쁜 일상에서 벗어나 의식적으로 휴식을 취하자는 취지의 날이다. | `anv-fixed-08-15-relaxation-day-us` |
| 04-23 | 도전해보는 날 (National Take a Chance Day) | 81 | 망설이던 일에 과감하게 도전해보자는 의미를 담은 동기부여성 기념일이다. | `anv-fixed-04-23-take-a-chance-day-us` |
| 08-23 | 바람과 함께 달리는 날 | 82 | 창문을 열고 바람을 맞으며 드라이브를 즐기자는 낭만적인 기념일이다. | `anv-fixed-08-23-ride-with-the-wind-day-us` |
| 09-08 | 다시 한번 바라보는 날 | 82 | 익숙한 것들을 새로운 시각으로 다시 바라보자는 취지의 날이다. | `anv-fixed-09-08-another-look-unlimited-day-us` |
| 04-15 | 무작정 찍어보는 날 | 83 | 정답을 모를 때 과감하게 추측해보자는 의미를 담은 유쾌한 기념일이다. | `anv-fixed-04-15-wild-guess-day-us` |
| 05-20 | 백만장자가 되는 날 | 83 | 꿈에서라도 백만장자가 된 기분을 만끽해보자는 가벼운 유머성 기념일이다. | `anv-fixed-05-20-be-a-millionaire-day-us` |
| 09-10 | 아이디어를 나누는 날 (National Swap Ideas Day) | 83 | 서로의 생각과 아이디어를 자유롭게 나눠보자는 취지의 날이다. | `anv-fixed-09-10-swap-ideas-day-us` |
| 10-05 | 좋은 일 하는 날 (National Do Something Nice Day) | 83 | 작은 선행 하나를 누군가에게 베풀어보자는 취지의 날이다. | `anv-fixed-10-05-do-something-nice-day-us` |
| 08-27 | 그냥 그런 날 (National Just Because Day) | 84 | 특별한 이유 없이 그냥 하고 싶은 일을 해보자는 자유로운 취지의 날이다. | `anv-fixed-08-27-just-because-day-us` |
| 05-18 | 친척 방문의 날 | 85 | 바쁜 일상 속에서 잊고 지내던 친척들을 찾아가 안부를 전하자는 취지의 날이다. | `anv-fixed-05-18-visit-your-relatives-day-us` |
| 11-15 | 냉장고 정리하는 날 | 85 | 냉장고 구석구석을 정리하며 유통기한 지난 음식을 점검해보자는 취지의 날이다. | `anv-fixed-11-15-clean-out-your-refrigerator-day-us` |
| 11-20 | 부조리의 날 (National Absurdity Day) | 85 | 말도 안 되는 일이나 엉뚱한 생각을 마음껏 즐겨보자는 유쾌한 기념일이다. | `anv-fixed-11-20-absurdity-day-us` |
| 07-11 | 외로운 이를 위로하는 날 | 86 | 혼자 시간을 보내는 이들에게 작은 안부와 위로를 전하자는 취지의 날이다. | `anv-fixed-07-11-cheer-up-the-lonely-day-us` |
| 10-12 | 박차고 일어나는 날 (National Kick Butt Day) | 86 | 미뤄둔 일이나 목표에 적극적으로 도전해보자는 동기부여성 기념일이다. | `anv-fixed-10-12-kick-butt-day-us` |
| 12-31 | 결정을 내리는 날 (Make Up Your Mind Day) | 87 | 한 해가 끝나기 전, 미뤄왔던 결정들을 마무리해보자는 가벼운 기념일이다. | `anv-fixed-12-31-make-up-your-mind-day-global` |
| 05-14 | 닭처럼 춤추는 날 | 88 | 닭처럼 우스꽝스러운 춤을 추며 하루의 스트레스를 날려보자는 유쾌한 기념일이다. | `anv-fixed-05-14-dance-like-a-chicken-day-us` |
| 06-04 | 올드 메이즈의 날 | 88 | 카드게임 '올드 메이드(존경 못 받는 외톨이 카드)'에서 이름을 따온 다소 독특한 기념일이다. | `anv-fixed-06-04-old-maids-day-us` |
| 10-17 | 엣지의 날 (National Edge Day) | 88 | 안전지대에서 벗어나 위험을 감수하고 도전해보자는 취지의 날이다. | `anv-fixed-10-17-edge-day-us` |
| 06-02 | 버바의 날 (National Bubba Day) | 89 | 미국 남부에서 친근하게 쓰이는 애칭 '버바(Bubba)'를 기념하는 유쾌한 날이다. | `anv-fixed-06-02-bubba-day-us` |
| 09-01 | 뜻도 이유도 없는 날 | 89 | 특별한 이유나 논리 없이 그냥 무언가를 해보자는 자유분방한 기념일이다. | `anv-fixed-09-01-no-rhyme-nor-reason-day-us` |
| 10-29 | 은둔자의 날 (National Hermit Day) | 89 | 세상과 잠시 거리를 두고 혼자만의 시간을 가져보자는 취지의 날이다. | `anv-fixed-10-29-hermit-day-us` |
| 04-08 | '모든 것이 우리 것' 의 날 | 90 | 긍정적인 마음가짐으로 가진 것에 감사하고 풍요로움을 느끼자는 취지의 기념일이다. | `anv-fixed-04-08-all-is-ours-day-us` |
| 04-20 | 닮은 사람의 날 | 90 | 서로 닮은 사람들을 찾아 짝지어보거나, 닮은꼴 친구·연예인을 떠올려보는 유쾌한 기념일이다. | `anv-fixed-04-20-look-alike-day-us` |
| 08-08 | 행복이 찾아오는 날 (National Happiness Happens Day) | 90 | 행복은 거창한 사건이 아니라 일상의 작은 순간에서 찾아온다는 메시지를 담은 날이다. | `anv-fixed-08-08-happiness-happens-day-us` |
| 10-15 | 그라우치의 날 (National Grouch Day) | 90 | 괜히 짜증나고 투덜거리고 싶은 날도 괜찮다고 말해주는 유쾌한 기념일이다. | `anv-fixed-10-15-grouch-day-us` |
| 05-03 | 울퉁불퉁 러그의 날 | 91 | 카펫이나 러그 아래 먼지나 잡동사니를 숨겨두는 습관을 유머스럽게 꼬집는 날이다. | `anv-fixed-05-03-lumpy-rug-day-us` |
| 09-04 | 게으른 엄마의 날 | 91 | 늘 분주한 엄마들에게 하루쯤 아무것도 안 해도 괜찮다고 말해주는 유쾌한 기념일이다. | `anv-fixed-09-04-lazy-moms-day-us` |
| 04-07 | 집안일 안 하는 날 | 92 | 하루만큼은 청소, 빨래 등 집안일을 내려놓고 쉬어보자는 취지의 유쾌한 기념일이다. | `anv-fixed-04-07-no-housework-day-us` |
| 05-31 | 완전한 문장으로 말하는 날 | 92 | 줄임말이나 단답형 대신 완전한 문장으로 또박또박 말해보자는 유쾌한 기념일이다. | `anv-fixed-05-31-speak-in-sentences-day-us` |
| 08-16 | 농담하는 날 (National Tell a Joke Day) | 92 | 재미있는 농담을 주변 사람들과 나누며 웃음을 전해보자는 취지의 날이다. | `anv-fixed-08-16-tell-a-joke-day-us` |
| 02-28 | 공공장소에서 낮잠 자는 날 | 93 | 장소를 가리지 않고 어디서든 편하게 낮잠을 자보자는 농담성 기념일. | `anv-fixed-02-28-public-sleeping-day-us` |
| 05-13 | 남 탓하는 날 | 93 | 13일의 금요일에 즈음해, 잘못된 일을 유쾌하게 남에게 돌려보자는 농담성 기념일이다. | `anv-fixed-05-13-blame-someone-else-day-us` |
| 06-18 | 과소비하는 날 (National Splurge Day) | 93 | 평소 아끼던 마음을 잠시 내려놓고 자신에게 작은 사치를 허락해보자는 취지의 날이다. | `anv-fixed-06-18-splurge-day-us` |
| 06-11 | 삶을 아름답게 만드는 날 | 94 | 작은 친절과 긍정적인 행동으로 주변의 삶을 조금 더 아름답게 만들어보자는 취지의 날이다. | `anv-fixed-06-11-making-life-beautiful-day-us` |
| 11-25 | 쿨한 무관심의 날 (Blase Day) | 94 | 모든 일에 "별일 아니야"라며 시크하게 반응해보자는 유쾌한 기념일이다. | `anv-fixed-11-25-blase-day-us` |
| 12-31 | 방해받지 않는 날 (No Interruptions Day) | 94 | 연말 정리에 집중할 수 있도록, 하루쯥은 방해받지 않고 조용히 보내보자는 날이다. | `anv-fixed-12-31-no-interruptions-day-global` |
| 07-15 | 무언가를 나눠주는 날 | 95 | 쓰지 않는 물건이나 작은 친절을 누군가에게 나눠주자는 취지의 날이다. | `anv-fixed-07-15-give-something-away-day-us` |
| 09-19 | 허풍쟁이의 날 (Big Whopper Liar Day) | 95 | 터무니없이 부풀려진 이야기와 허풍을 유쾌하게 즐겨보자는 날이다. | `anv-fixed-09-19-big-whopper-liar-day-us` |
| 10-14 | 대머리도 당당한 날 (Be Bald and Be Free Day) | 95 | 탈모나 대머리를 부끄러워하지 않고 당당하게 받아들이자는 취지의 날이다. | `anv-fixed-10-14-be-bald-and-be-free-day-us` |
| 11-25 | 쇼핑 리마인더 데이 | 95 | 다가오는 연말 쇼핑 시즌을 준비하며 선물 목록을 점검해보자는 취지의 날이다. | `anv-fixed-11-25-shopping-reminder-day-us` |
| 12-17 | 선물 재활용의 날 (National Re-Gifting Day) | 95 | 받았지만 쓰지 않는 선물을 다른 사람에게 다시 선물해보자는 가벼운 기념일이다. | `anv-fixed-12-17-re-gifting-day-us` |
| 10-02 | 내 차에 이름 지어주는 날 | 96 | 자신의 자동차에 애칭을 지어 더 특별한 존재로 만들어보자는 유쾌한 기념일이다. | `anv-fixed-10-02-name-your-car-day-us` |
| 02-16 | 무뚝뚝한 사람에게 친절 베푸는 날 | 99 | 괜히 까칠하거나 기분이 안 좋아 보이는 사람에게 먼저 작은 친절을 베풀어보자는 취지로 만들어진 날. | `anv-fixed-02-16-do-a-grouch-a-favor-day-us` |
| 07-07 | 아빠와 딸이 산책하는 날 | 99 | 아버지와 딸이 함께 산책하며 대화를 나누는 시간을 갖자는 취지의 날이다. | `anv-fixed-07-07-father-daughter-take-a-walk-day-us` |
| 07-31 | 엘리베이터에서 말 거는 날 | 99 | 보통은 침묵이 흐르는 엘리베이터 안에서 가볍게 인사나 대화를 나눠보자는 유쾌한 기념일이다. | `anv-fixed-07-31-talk-in-an-elevator-day-us` |
| 11-28 | 세계 아우라 인식의 날 (International Aura Awareness Day) | 99 | 사람마다 지닌 고유한 에너지, '아우라'에 대한 관심을 환기하는 날이다. | `anv-fixed-11-28-aura-awareness-day-global` |
| 12-08 | 타임트래블러인 척하는 날 | 99 | 마치 시간여행자인 척하며 하루를 보내보자는 장난스러운 기념일이다. | `anv-fixed-12-08-time-traveler-day-global` |

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

## 100~200자 584건

목표(200~300자)에 못 미치지만 얇지는 않다. ~100자를 끝낸 뒤에 본다.

| 카테고리 | 건수 |
|---|---:|
| 음식 & 디저트 | 152 |
| 국제 캠페인 & 보건 | 80 |
| 이색 & 유머 | 69 |
| 역사 & 추모 | 65 |
| 동물 & 자연 | 60 |
| 직업 & 감사 | 46 |
| 문화 & 예술 | 41 |
| 학술 & 기술 | 31 |
| 일반 | 30 |
| 스포츠 & 레저 | 7 |
| 연애 & 기념일 | 3 |

