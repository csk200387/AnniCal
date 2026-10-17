---
name: anniversary-enrichment
description: Guide for writing and improving AnniCal anniversary `storytelling.origin`/`anecdote` fields — what the search snippet needs, length targets, sourcing and fact-checking, phrasing to avoid, current work priorities, and the apply/verify workflow. Use when writing, expanding, rewriting or fact-checking anniversary body text in src/data/anniversaries/*.json, or when asked to work on "기념일 본문 보강".
---

## 본문이 곧 검색 자산이다

기념일 1건 = 정적 페이지 1개(`/day/{MM-DD}/{slug}`)이고, `storytelling.origin` 과
`anecdote` 가 그 페이지 본문의 전부다. 빌드 때 HTML 에 박혀 나가므로 JS 를 실행하지
않는 크롤러(네이버 Yeti, AI 크롤러)도 이 글만 보고 페이지를 판단한다.

### `origin` 앞 150자가 검색결과에 그대로 나간다

`src/seo/meta.ts` 의 `anniversaryDescription()` 이 `origin`(비면 `anecdote`)을
150자에서 잘라 `<meta name="description">` 에 넣는다. 지금은 문장 중간에서도 자르고
`…` 을 붙인다.

→ **첫 문장만 읽어도 "언제, 누가, 왜 정한 무슨 날인지" 완결되게 쓴다.** AI 검색이
그대로 인용하기 좋은 형태이기도 하다.

```
나쁨: "매년 이맘때가 되면 많은 사람들이 기다리는 날이 있다. 바로…"
나쁨: "3월 22일의 미국 기념일이다."
좋음: "세계 물의 날은 1992년 UN 총회 결의로 정해져 1993년부터 매년 3월 22일에
      기리는 날로, 물 부족과 수질 오염에 관심을 모으려는 것이 목적이다."
```

## 공개 약속과 맞출 것

`/about`(`src/features/about/content.ts`)에 사이트의 편집 방침으로 올라가 있다.
본문이 이와 어긋나면 안 된다.

- 근거는 그 날을 정한 곳의 자료를 먼저 본다. 법정기념일은 국가법령정보센터 법령,
  국제기념일은 UN 등 지정 기관의 결의·공지.
- 유래가 여러 설로 갈리거나 확인되지 않으면 단정하지 않는다.
- 이색 기념일은 공식 지정이 아니라 업체·단체가 만들었거나 문화로 자리 잡은 날이다.
  공식 기념일처럼 엄숙하게 쓰지 말고 가볍게, 그러나 사실은 정확하게.

## 무엇을 쓰는가

"○○의 날"을 검색한 사람이 알고 싶은 순서대로 답한다.

1. **언제·누가·왜 정했나** (`origin`) — 연도, 주체, 목적. 날짜에 이유가 있으면
   반드시 넣는다.
   - 예: 다운증후군의 날이 3월 21일인 건 21번 염색체가 3개라서.
2. **한국에서는 어떤가** (`anecdote` 앞부분) — 법정기념일 여부, 국내 명칭·날짜가
   다른 사연, 관련 제도. 다른 사이트와 갈리는 지점이다.
3. **기억에 남을 사실 하나** (`anecdote` 뒷부분) — 통계, 뒷이야기.

## 쓰지 않는 것

- **이름을 되풀이하는 문장.** `"○○의 날은 ○○를 기념하는 날이다"`,
  `"○월 ○일의 미국 기념일이다."` 는 정보가 0이고, 메타 설명 첫머리에 그대로 나간다.
  같은 틀이 수백 건 반복되면 사이트 전체가 찍어낸 글로 읽힌다.
- **분량 맞추기용 문장.** 필드별 150자 하한을 넘기려고 덧붙인 문장은 티가 난다.
  할 말이 150자면 150자로 끝낸다.
- **확인 안 된 사실.** 연도·주체가 불확실하면 단정하지 않는다. 1,800여 페이지에
  틀린 사실이 퍼지면 되돌리기 어렵다.
- **없는 유래를 지어내는 것.** 미국 이색 기념일 상당수는 nationaldaycalendar.com
  등록이 유일한 출처라 "왜 그 날짜인지"가 없다. 그럴 때는 날짜의 유래 대신 **대상
  자체의 기원**(언제 어디서 누가 만들었나)과 한국 맥락을 쓴다.
  - 예: "블루베리 아이스바의 날"은 날짜에 이유가 없지만, 아이스바가 1905년 프랭크
    에퍼슨의 실수에서 나왔다는 사실은 쓸 수 있다.
- **"주관 부처: ○○부." 로 시작하는 행정 문구.** 그 자체로는 본문이 못 된다.

## 출처

- `sourceUrl` 은 전체 URL 1개 또는 `null`. 슬러그 조각·빈 문자열은 검수기가 거부한다.
- **nationaldaycalendar.com 은 1차 자료가 아니다.** 기업·단체가 비용을 내고 날을
  등록하는 민간 업체다. 출처의 절반 이상이 여기인데, 연도·인물·장소 같은 사실은
  가능하면 위키백과·공식 기관·당시 기사로 다시 확인한다.
- 국내 법정기념일은 law.go.kr, 한국 역사는 encykorea.aks.ac.kr 를 우선한다.

## 지금 할 일 — 양보다 질

필드별 150자 하한을 채우는 대량 보강은 끝났다(`python3 tools/enrich/worklist.py`
로 확인). 이제 우선순위는 이렇다.

1. **사실 확인.** nationaldaycalendar 만 출처이면서 연도가 든 항목을 원문과 대조한다.
   틀린 사실은 짧은 글보다 해롭다.
2. **인기 상위 기념일 깊게 쓰기.** `/popular` 상위권부터 `origin`+`anecdote` 합계
   600자 이상으로. 검색 수요가 있는 페이지라 분량이 순위로 이어진다.
3. **상투 문장 걷어내기.** 위 "쓰지 않는 것"의 틀로 시작하는 `origin` 첫 문장을
   위 "좋음" 예시 형태로 바꾼다.

## 작업 방식

1. 배치마다 `tools/enrich/content/<이름>.json` 에 `{ id: {origin, anecdote, sourceUrl?} }`
   로 쓴다. 한 번에 한 카테고리나 한 달 단위로 묶는다.
   - **파일 이름이 이미 커밋된 파일과 겹치지 않는지 먼저 확인한다**
     (`ls tools/enrich/content/`). 같은 이름으로 저장하면 이전 배치를 덮어쓴다.
2. `python3 tools/enrich/apply.py content/<이름>.json` 으로 데이터에 반영한다
   (경로는 `tools/enrich/` 기준). 없는 id 가 있으면 멈춘다.
3. `python3 tools/lastmod/generate_lastmod.py` 로 수정일을 갱신한다.
4. `npm run verify` 를 통과시킨다.
5. 커밋은 `data: …` 로, `lastmod.json` 을 같이 넣는다. 여러 번에 나누면
   `(3/n, 9~10월 31건)` 처럼 차수와 범위를 붙인다.

기념일을 **새로 추가**했다면 `python3 tools/slugs/generate_slugs.py` 로
`routes.json` 에 주소를 만든다. 이미 있는 기념일의 주소는 바꾸지 않는다.
