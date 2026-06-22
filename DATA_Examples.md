# `src/data/anniversaries.json` 데이터 구조 정리

대상 파일: `src/data/anniversaries.json` (152개 엔트리), `src/data/categories.json` (6개 엔트리)
타입 정의: `src/types/anniversary.ts`, `src/types/category.ts`
관련 유틸: `src/utils/dateUtils.ts`
공식 작성 규칙: `README.md` "데이터 작성 규칙" 섹션 (`date` 필드 작성법)

## 1. 최상위 스키마 (`Anniversary`)

```ts
interface Anniversary {
  id: string                 // 고유 식별자
  date: string                // dateType별 포맷 다름 (2번 참고)
  dateType: DateType          // 'annual-fixed' | 'annual-floating' | 'annual-nth-weekday' | 'one-time'
  name: string                 // 기념일 이름
  category: CategoryId         // 카테고리 (3번 참고)
  tags: string[]                // 3~6개
  storytelling: { origin: string; anecdote: string | null }
  memes: Meme[]                 // 0~2개, 빈 배열 가능
  sourceUrl: string | null
}

interface Meme {
  type: 'image' | 'text'
  url: string | null    // text 타입은 항상 null
  caption: string
}
```

예시 (가장 풍부한 형태):

```json
{
  "id": "anv-fixed-03-14-pi-day",
  "date": "03-14",
  "dateType": "annual-fixed",
  "name": "세계 파이(π)의 날",
  "category": "general",
  "tags": ["과학", "수학", "기념일", "디저트"],
  "storytelling": {
    "origin": "1988년 미국 물리학자 래리 쇼가 ...",
    "anecdote": "공교롭게도 같은 날은 아인슈타인의 생일이며 ..."
  },
  "memes": [
    { "type": "image", "url": "https://example-cdn.com/memes/pi-day-einstein.jpg", "caption": "내 IQ는 3.14159265…" },
    { "type": "text", "url": null, "caption": "파이를 외우는 자, 원을 지배하리라." }
  ],
  "sourceUrl": "https://en.wikipedia.org/wiki/Pi_Day"
}
```

`gov-*` 엔트리(정부 법정기념일 57개)는 `anecdote: null`, `memes: []`, `sourceUrl: null`인 경우가 대부분 — 정부 기념일은 스토리텔링/밈이 덜 채워진 "뼈대" 데이터.

## 2. `date` 포맷 — `dateType`별로 완전히 다름

`README.md` "데이터 작성 규칙"에 명시된 공식 스펙:

| `dateType` | `date` 포맷 | 예시 | 의미 |
|---|---|---|---|
| `annual-fixed` | `MM-DD` | `"03-14"` | 매년 같은 월/일 (예: 파이의 날) |
| `annual-floating` | `YYYY-MM-DD` | `"2026-05-24"` | 매년 반복되지만 날짜가 바뀜 — 연도별로 엔트리를 따로 추가 (예: F1 모나코 GP) |
| `annual-nth-weekday` | `MM-N-DOW` | `"05-2-SUN"` | "매년 N번째 X요일" 규칙 (예: 미국 어머니의 날). `N`=`1~5` 또는 `L`(마지막 주), `DOW`=`SUN/MON/TUE/WED/THU/FRI/SAT` |
| `one-time` | `YYYY-MM-DD` | `"1986-04-26"` | 특정 연도 1회성 (예: 체르노빌 사고일) |

실제 데이터 사용 현황: `annual-fixed` 92건, `annual-nth-weekday` 1건, `annual-floating` 8건. `one-time`은 스펙엔 있지만 데이터 0건.

### ⚠️ 데이터 버그: `gov-*` 8건이 스펙을 두 군데나 위반

`gov-*` 계열 7건(`anv-2026-*` F1 모나코 GP 1건만 스펙대로 `"YYYY-MM-DD"` 정상 사용)이 스펙에 없는 `"MM-Wn-D"`(주차-요일, 숫자 요일은 ISO 1=월~7=일) 또는 `"MM-L-D"`(마지막 주) 포맷을 쓰면서, `dateType`도 `annual-floating`으로 잘못 박아넣음:

  - `"03-W3-3"` = 3월 셋째 수요일 (상공의 날)
  - `"03-W4-5"` = 3월 넷째 금요일 (서해수호의 날)
  - `"04-W1-5"` = 4월 첫째 금요일 (예비군의 날)
  - `"04-W4-5"` = 4월 넷째 금요일 (순직의무군경의 날)
  - `"05-W3-1"` = 5월 셋째 월요일 (성년의 날)
  - `"07-W2-3"` = 7월 둘째 수요일 (정보보호의 날)
  - `"10-W3-6"` = 10월 셋째 토요일 (문화의 날)
  - `"10-L-2"` = 10월 마지막 화요일 (금융의 날)

본질은 전부 "N번째 X요일" 규칙 — 즉 `dateType: "annual-nth-weekday"`로 분류돼야 하고, `date`도 README 스펙대로 `MM-N-DOW`(영문 3글자 요일)로 써야 한다. 예: 상공의 날은 `"03-3-WED"`, 금융의 날(마지막 화요일)은 `"10-L-TUE"`가 맞는 표기. 지금처럼 `dateType: "annual-floating"` + `"MM-Wn-D"` 조합으로 들어가면 `dateUtils.ts`의 `resolveOccurrence()`가 `annual-floating` 분기를 타서 그냥 `dayjs(anv.date).toDate()`를 호출하고, `"03-W3-3"`은 유효한 날짜 문자열이 아니라서 `Invalid Date`가 됨 → 이 8개 `gov-*` 기념일은 캘린더 날짜 계산이 실제로 깨져 있을 가능성 높음. 수정 방향은 두 가지: (a) 데이터를 README 스펙(`annual-nth-weekday` + `MM-N-DOW`)에 맞게 고치거나, (b) `MM-Wn-D`/`MM-L-D`를 정식 포맷으로 인정하려면 README·타입 정의·`resolveNthWeekday` 파서 세 곳을 모두 갱신해야 함. **(a)가 기존 스펙·파서를 그대로 재사용할 수 있어 더 간단함.**

## 3. `category` — 코드 타입과 실데이터 불일치

`src/types/category.ts`의 `CategoryId`와 `categories.json`은 6개만 정의:
`general | romance | holiday | motorsport | extreme | brand`

그런데 실제 `anniversaries.json`에는 10개 값이 쓰임:
`general, romance, holiday, motorsport, extreme, brand` (정의됨) +
`anniversary, commemorative, international, quirky` (⚠️ 타입/categories.json에 없음)

→ `category` 필드가 타입 정의보다 넓게 쓰이고 있어, 이 4개 카테고리는 `CategoryBadge.vue` 등에서 라벨/이모지/색상을 못 찾을 수 있음. 데이터를 좁히거나(6개로 매핑) 타입+`categories.json`을 4개 추가해 맞춰야 함.

미사용 카테고리별 의미(데이터에서 추론):
- `anniversary`: 법정기념일(정부 주관) 다수 — gov-* 엔트리 기본값
- `commemorative`: 독도의 날, 소방의 날 등 추모/기림성 기념일
- `international`: 발렌타인데이, 할로윈, 만우절, 스타워즈데이 등 글로벌 비공식 기념일
- `quirky`: 한국 포틴데이류(로즈데이, 키스데이, 빼빼로데이, 삼겹살데이 등) 이색/기발한 기념일

## 4. `id` 네이밍 컨벤션

| prefix | 건수 | 패턴 |
|---|---|---|
| `anv-fixed-*` | 92 | `anv-fixed-{MM-DD}-{영문slug}` |
| `anv-nth-*` | 1 | `anv-nth-{MM-N-DOW}-{영문slug}` |
| `anv-2026-*` (floating) | 1 | `anv-{YYYY-MM-DD}-{영문slug}` |
| `gov-*` | 57 | `gov-{순번}` (의미 없는 순차 번호) |

타입 JSDoc은 `anv-{YYYY}-{MM-DD}-{slug}` 컨벤션을 권장하지만 실제로는 연도 없는 `anv-fixed-*`가 대다수 — 권장 컨벤션과 실제 데이터가 다름.

### ⚠️ 데이터 버그: 중복 id

`"anv-fixed-02-14-valentines-day-global"`이 **두 번** 등장 (id 151개인데 엔트리 152개). 내용도 다름 — 하나는 "발렌타인데이"(태그: 글로벌/기념일/연인/초콜릿/사랑), 다른 하나는 "밸런타인데이"(태그: 전세계/사랑/연인/초콜릿). 표기법 차이("발렌타인" vs "밸런타인")로 같은 날을 두 번 만든 것으로 보임. `id`를 key로 쓰는 곳(예: `Map`, Vue `:key`)이 있다면 충돌 위험.

### 이름 중복 (id는 다름)

`"스승의 날"`(anv-fixed-05-15-teachers-day-kr / gov-23), `"현충일"` 류처럼 같은 기념일이 `anv-*`(스토리텔링 풍부)와 `gov-*`(법정기념일 뼈대) 양쪽에 따로 존재 — 의도된 중복(관점이 다름: 대중문화용 vs 정부 공식용)으로 보이나 UI에서 같은 날 두 번 노출될 수 있음.

## 5. `storytelling`

```ts
{ origin: string; anecdote: string | null }
```
- `origin`: 유래/배경 설명. 항상 존재.
- `anecdote`: 흥미 일화. **null 가능** (152건 중 55건이 null — 대부분 `gov-*`). 타입 정의 JSDoc엔 `string`이라고만 돼 있어 실제로는 `string | null`이 맞음 (타입 선언 누락).

## 6. `memes`

- 빈 배열 56건, 1~2개 채워진 경우 다수.
- `type: "text"` → `url`은 항상 `null`.
- `type: "image"` → `url`에 CDN 경로 (`https://example-cdn.com/memes/...` — 플레이스홀더 도메인, 실제 호스팅 아님).

## 7. `categories.json` 구조 (참고)

```json
{
  "id": "general",
  "label": "일반",
  "description": "전 세계가 함께 챙기는 보편 기념일",
  "emoji": "📅",
  "colorToken": "neutral"
}
```
6개 항목 모두 `id/label/description/emoji/colorToken` 5개 키 고정. 3번에서 언급한 4개 카테고리(`anniversary/commemorative/international/quirky`)는 여기 없음.

## 요약: 데이터 정합성 이슈 체크리스트

1. **중복 id** — 발렌타인데이 엔트리 2개, 동일 `id` (`anv-fixed-02-14-valentines-day-global`).
2. **`gov-*` 8건의 `dateType`/`date` 이중 오기재** — 본질은 "N번째 X요일"(`annual-nth-weekday`)인데 `dateType: "annual-floating"` + `"MM-Wn-D"`/`"MM-L-D"` 포맷으로 들어가 README 스펙과도, `dateUtils.ts` 파서와도 안 맞음 → 날짜 계산 깨짐 추정. `annual-nth-weekday` + `MM-N-DOW`(예: `"03-3-WED"`, `"10-L-TUE"`)로 고치는 게 정석.
3. **카테고리 누락** — `anniversary/commemorative/international/quirky` 4개 카테고리가 실데이터엔 있지만 `CategoryId` 타입·`categories.json`엔 없음.
4. **`anecdote` 타입 선언 오류** — 실제로 `null`이 올 수 있는데 타입엔 `string`으로만 선언.
