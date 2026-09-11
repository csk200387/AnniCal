# 야간 보강 진행 기록

`tools/enrich/content/overnight-food-*.json` 배치의 진행 상황. 다음 세션은 여기서
이어받는다. 배치 파일명을 새로 지을 때는 **반드시 이 표와
`git ls-tree -r HEAD --name-only -- tools/enrich/content/` 를 먼저 대조**한다
(같은 이름을 다시 쓰면 이전 배치의 근거 기록이 덮어써진다).

최종 갱신: **2026-09-11 07:57 KST**

---

## 배치 이력

| 배치 파일 | 건수 | 카테고리 | 적용 전 평균 | 적용 후 평균 | 상태 |
|---|---:|---|---:|---:|---|
| `content/overnight-food-01.json` | 24 | 음식 & 디저트 | 103자 | 211자 | 적용 완료 (최소 200 / 최대 235) |
| `content/overnight-food-02.json` | 20 | 음식 & 디저트 | 103자 | 231자 | 적용 완료 (최소 205 / 최대 259) |

### overnight-food-01.json — 완료된 id 24건

| 날짜 | 이름 | id |
|---|---|---|
| 01-02 | 크림퍼프(슈크림)의 날 | `anv-fixed-01-02-cream-puff-day-us` |
| 01-12 | 마지팬의 날 | `anv-fixed-01-12-marzipan-day-us` |
| 02-09 | 베이글의 날 | `anv-fixed-02-09-bagel-day-us` |
| 04-11 | 치즈 퐁뒤의 날 | `anv-fixed-04-11-cheese-fondue-day-us` |
| 04-13 | 피치 코블러의 날 | `anv-fixed-04-13-peach-cobbler-day-us` |
| 04-16 | 에그 베네딕트의 날 | `anv-fixed-04-16-eggs-benedict-day-us` |
| 05-05 | 호기 샌드위치의 날 | `anv-fixed-05-05-hoagie-day-us` |
| 05-06 | 크레프 수제트의 날 | `anv-fixed-05-06-crepe-suzette-day-us` |
| 05-15 | 초콜릿칩의 날 | `anv-fixed-05-15-chocolate-chip-day-us` |
| 05-16 | 코키유 생자크의 날 | `anv-fixed-05-16-coquilles-saint-jacques-day-us` |
| 06-20 | 쿠인아망의 날 | `anv-fixed-06-20-kouign-amann-day-us` |
| 06-24 | 프랄린의 날 | `anv-fixed-06-24-pralines-day-us` |
| 07-27 | 크렘 브륄레의 날 | `anv-fixed-07-27-creme-brulee-day-us` |
| 09-03 | 웰시 래빗의 날 | `anv-fixed-09-03-welsh-rarebit-day-us` |
| 09-07 | 살라미의 날 | `anv-fixed-09-07-salami-day-us` |
| 09-24 | 체리 주빌레의 날 | `anv-fixed-09-24-cherries-jubilee-day-us` |
| 10-12 | 검보의 날 | `anv-fixed-10-12-gumbo-day-us` |
| 10-13 | 요크셔 푸딩의 날 | `anv-fixed-10-13-yorkshire-pudding-day-us` |
| 10-19 | 해산물 비스크의 날 | `anv-fixed-10-19-seafood-bisque-day-us` |
| 10-24 | 볼로냐 소시지의 날 | `anv-fixed-10-24-bologna-day-us` |
| 11-09 | 스크래플의 날 | `anv-fixed-11-09-scrapple-day-us` |
| 11-17 | 바클라바의 날 | `anv-fixed-11-17-baklava-day-us` |
| 12-05 | 자허토르테의 날 | `anv-fixed-12-05-sacher-torte-day-us` |
| 12-14 | 부야베스의 날 | `anv-fixed-12-14-bouillabaisse-day-us` |

**날짜 유래가 실제로 확인된 3건** — 피치 코블러(1950년대 조지아복숭아협의회의
통조림 판촉), 살라미(2006년 살라미 감상 협회), 베이글(피자의 날과 겹쳐 2019년
1월 15일로 이전). 나머지 21건은 그 날짜인 이유가 어디에도 없어, CLAUDE.md 지침대로
날짜 유래를 지어내지 않고 **대상 자체의 기원**으로 채웠다. 볼로냐·검보는
"기념일 제정 경위가 확인되지 않는다"고 본문에 명시했다.

---

### overnight-food-02.json — 완료된 id 20건

| 날짜 | 이름 | id |
|---|---|---|
| 02-20 | 체리파이의 날 | `anv-fixed-02-20-cherry-pie-day-us` |
| 04-03 | 초콜릿 무스의 날 | `anv-fixed-04-03-chocolate-mousse-day-us` |
| 04-20 | 리마빈 존중의 날 | `anv-fixed-04-20-lima-bean-respect-day-us` |
| 04-22 | 젤리빈의 날 | `anv-fixed-04-22-jelly-bean-day-us` |
| 04-29 | 쉬림프 스캠피의 날 | `anv-fixed-04-29-shrimp-scampi-day-us` |
| 05-31 | 마카롱의 날 | `anv-fixed-05-31-macaroon-day-us` |
| 06-19 | 마티니의 날 | `anv-fixed-06-19-martini-day-us` |
| 06-21 | 피치 앤 크림의 날 | `anv-fixed-06-21-peaches-n-cream-day-us` |
| 07-10 | 피나 콜라다의 날 | `anv-fixed-07-10-pina-colada-day-us` |
| 07-21 | 정크푸드의 날 | `anv-fixed-07-21-junk-food-day-us` |
| 07-3-WED | 핫도그의 날 | `anv-nth-07-3-wed-hot-dog-day-us` |
| 08-25 | 바나나 스플릿의 날 | `anv-fixed-08-25-banana-split-day-us` |
| 08-31 | 트레일 믹스의 날 | `anv-fixed-08-31-trail-mix-day-us` |
| 09-17 | 몬테크리스토 샌드위치의 날 | `anv-fixed-09-17-monte-cristo-day-us` |
| 09-19 | 세계 사과 먹는 날 | `anv-fixed-09-19-international-eat-an-apple-day-global` |
| 09-26 | 만두의 날 | `anv-fixed-09-26-dumpling-day-us` |
| 10-09 | 곰팡이 치즈의 날 | `anv-fixed-10-09-moldy-cheese-day-us` |
| 10-28 | 초콜릿의 날 | `anv-fixed-10-28-chocolate-day-us` |
| 11-12 | 앤초비 빼고 다 올린 피자의 날 | `anv-fixed-11-12-pizza-with-the-works-except-anchovies-day-us` |
| 12-30 | 베이킹소다의 날 | `anv-fixed-12-30-bicarbonate-of-soda-day-global` |

**날짜 유래가 실제로 확인된 것은 핫도그의 날 1건뿐이다** — 미국 핫도그·소시지
협회(NHDSC)가 1991년 의회 핫도그 오찬에 맞춰 7월 셋째 수요일로 정했다. 나머지
19건은 그 날짜인 이유가 어디에도 없어 대상 자체의 기원으로 채웠다. 초콜릿의
날·체리파이의 날은 "왜 그 날짜인지 기록이 없다"를 본문에 명시했다.

`nationaldaycalendar.com` 은 WebFetch 를 403 으로 막는다. 제정 경위는 그 사이트가
아니라 대상별 1차·2차 출처(위키백과, 브리태니커, 레이건 도서관, 힐턴 공식 기록,
농촌진흥청, 국가법령정보센터 등)로 확인했다.

**기존 서술의 오류를 바로잡은 건 2건**
- 체리파이의 날: "조지 워싱턴이 좋아했다는 일화"를 사실처럼 적고 있었다.
  벚나무 일화는 1806년 메이슨 로크 윔스가 위인전 5판에 써넣은 창작이다.
- 마카롱의 날: 이 기념일의 대상은 코코넛 마카룬이고, 한국에서 흔한 뚱카롱은
  프랑스식 마카롱 계열의 다른 과자라는 점을 명시했다.

**`sourceUrl` 1건 수정** — `anv-nth-07-3-wed-hot-dog-day-us` 의 sourceUrl 이
URL 이 아니라 슬러그 조각(`"hot-dog-day-us"`)이었다(CLAUDE.md 가 말한 31건 중 하나).
이 배치에서 편집하는 항목이라 nationaldaycalendar 정식 URL 로 채웠다.

---

## 현재 데이터 현황 (이 배치 적용 후)

전체 1,735건 · 200자 이상 1,158건(66.7%) · 100~200자 577건 · 100자 미만 0건.

100자 미만 구간은 비었으므로 `worklist.py` 의 A~D 등급표도 비어 있다. 남은 작업은
전부 **100~200자 구간**이다.

| 카테고리 | 100~200자 |
|---|---:|
| 음식 & 디저트 | 114 |
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

---

## 다음 목표

**`content/overnight-food-03.json`** — 음식 & 디저트 100~200자에서 20건 안팎.
어떤 `content/*.json` 에도 등장하지 않은 항목이 108건 남아 있다. 얇은 쪽부터
집으면 다음이 후보다.

`anv-fixed-01-15-strawberry-ice-cream-day-us` ·
`anv-fixed-05-03-raspberry-popover-day-us` ·
`anv-fixed-08-01-mead-day-global` ·
`anv-fixed-01-20-buttercrunch-day-us` ·
`anv-fixed-02-27-kahlua-day-us` ·
`anv-fixed-04-02-peanut-butter-jelly-day-us` ·
`anv-fixed-05-28-brisket-day-us` ·
`anv-fixed-06-05-moonshine-day-us` ·
`anv-fixed-08-08-sneak-zucchini-day-us` ·
`anv-fixed-10-17-pasta-day-us` ·
`anv-fixed-02-02-heavenly-hash-day-us` ·
`anv-fixed-02-14-cream-filled-chocolates-day-us` ·
`anv-fixed-10-25-greasy-food-day-us` ·
`anv-fixed-01-26-peanut-brittle-day-us` ·
`anv-fixed-12-27-fruitcake-day-us` ·
`anv-fixed-05-02-truffle-day-us` ·
`anv-fixed-11-03-sandwich-day-us` ·
`anv-fixed-04-04-chicken-cordon-bleu-day-us` ·
`anv-fixed-07-29-lasagna-day-us` ·
`anv-fixed-08-24-waffle-day-us` ·
`anv-fixed-01-14-hot-pastrami-sandwich-day-us`

이 중 **날짜 유래가 실제로 남아 있을 가능성이 높은 것**(다음 배치에서 먼저 확인할
것):
- 샌드위치의 날(11/3) — 샌드위치 백작 존 몬터규의 생일이 1718년 11월 3일이다.
- 와플의 날(8/24) — 코닐리어스 스워트아웃의 와플 굽는 틀 특허일(1869년 8월 24일)로
  알려져 있다. 특허 번호까지 확인할 것.
- 파스타의 날(10/17) — 1995년 로마 세계파스타총회에서 정한 World Pasta Day.
- 미드의 날(8/1) — 8월 첫째 토요일이라는 표기와 8/1 고정 표기가 섞여 있다.
  `date` 필드가 고정일이므로 URL 은 그대로 두고 본문에서만 정리할 것.

나머지는 대상의 기원과 한국 맥락으로 채운다. 한국 맥락이 특히 잘 붙는 것:
피넛 브리틀(땅콩강정), 파스타, 라자냐, 와플, 프루트케이크(크리스마스 케이크),
칼루아(커피 리큐어).

**손대지 않을 것** — 200자를 넘긴 1,158건, 그리고 음식 카테고리에 잘못 들어가
있는 3건(`anv-fixed-04-19-oklahoma-city-bombing-commemoration-day-us`,
`anv-fixed-10-15-latino-aids-awareness-day-us`,
`anv-fixed-03-30-manatee-appreciation-day-global`). 카테고리 정정은 본문 보강과
별개 작업이다.

---

## 배치 절차

```bash
# 1. 파일명 충돌 확인
git ls-tree -r HEAD --name-only -- tools/enrich/content/ | grep overnight
# 2. content/overnight-food-XX.json 작성 (origin ≤150자, origin+anecdote 200~300자)
python3 tools/enrich/apply.py content/overnight-food-XX.json
npm run verify
python3 tools/enrich/worklist.py --write
# 3. 이 문서의 배치 이력·다음 목표·타임스탬프 갱신
```

---

### overnight-food-03.json — 완료 (2026-09-11 07:49 KST)

- **파일:** `content/overnight-food-03.json` · **15건** · 적용 전 평균 109자 → 적용 후 평균 245자 (최소 206 / 최대 264); 트러플 항목은 초콜릿 트러플로 바로잡음
- **완료 ID:** `anv-fixed-01-15-strawberry-ice-cream-day-us`, `anv-fixed-01-26-peanut-brittle-day-us`, `anv-fixed-02-27-kahlua-day-us`, `anv-fixed-04-02-peanut-butter-jelly-day-us`, `anv-fixed-04-04-chicken-cordon-bleu-day-us`, `anv-fixed-05-02-truffle-day-us`, `anv-fixed-05-28-brisket-day-us`, `anv-fixed-07-29-lasagna-day-us`, `anv-fixed-08-01-mead-day-global`, `anv-fixed-08-08-sneak-zucchini-day-us`, `anv-fixed-08-24-waffle-day-us`, `anv-fixed-10-17-pasta-day-us`, `anv-fixed-10-25-greasy-food-day-us`, `anv-fixed-11-03-sandwich-day-us`, `anv-fixed-12-27-fruitcake-day-us`
- **검증:** JSON 유효성 검사, `npm run verify`(81 tests), `python3 tools/enrich/worklist.py --write` 통과.
- **다음 대상:** `overnight-food-04.json` — 음식 & 디저트 100~200자 미사용 항목에서 `anv-fixed-01-20-buttercrunch-day-us`, `anv-fixed-02-02-heavenly-hash-day-us`, `anv-fixed-02-14-cream-filled-chocolates-day-us`, `anv-fixed-05-03-raspberry-popover-day-us`, `anv-fixed-06-05-moonshine-day-us`부터 15~25건 조사.

현재 전체 1,735건 중 100~200자 항목은 **562건**이다.


### overnight-food-04.json — 완료 (2026-09-11 07:57 KST)

- **파일:** `content/overnight-food-04.json` · **15건** · 적용 전 평균 121자 → 적용 후 평균 257자 (최소 230 / 최대 276).
- **완료 ID:** `anv-fixed-01-02-buffet-day-us`, `anv-fixed-01-03-chocolate-covered-cherry-day-us`, `anv-fixed-01-03-fruitcake-toss-day-us`, `anv-fixed-01-13-peach-melba-day-us`, `anv-fixed-01-14-hot-pastrami-sandwich-day-us`, `anv-fixed-01-16-fig-newton-day-us`, `anv-fixed-01-20-buttercrunch-day-us`, `anv-fixed-01-21-granola-bar-day-us`, `anv-fixed-02-01-baked-alaska-day-us`, `anv-fixed-02-02-heavenly-hash-day-us`, `anv-fixed-02-12-plum-pudding-day-us`, `anv-fixed-02-14-cream-filled-chocolates-day-us`, `anv-fixed-02-22-margarita-day-us`, `anv-fixed-05-03-raspberry-popover-day-us`, `anv-fixed-06-05-moonshine-day-us`.
- **조사:** WebFetch로 토피·초콜릿 등 대상의 기원/제조 정보를 확인했다. 브라우저 탭 생성은 프록시 시간 초과로 실패해 사용하지 못했으며, 날짜 유래·제정 주체가 확인되지 않은 비공식 기념일에는 그 사실을 명시했다.
- **검증:** JSON 유효성 검사, `npm run verify`(81 tests), `python3 tools/enrich/worklist.py --write` 통과.
- **다음 대상:** `overnight-food-05.json` — 음식 & 디저트 100~200자 미사용 항목에서 `anv-fixed-01-18-peking-duck-day-global`, `anv-fixed-01-23-pie-day-us`, `anv-fixed-01-25-irish-coffee-day-global`, `anv-fixed-02-04-homemade-soup-day-us`, `anv-fixed-02-06-frozen-yogurt-day-us`부터 15~25건 조사.
