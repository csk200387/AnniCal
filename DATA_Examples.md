# 기념일 데이터 추가 규칙 (Authoring Guide)

`src/data/anniversaries.json` 에 새 기념일을 추가할 때 따라야 하는 규칙을 정의한다.
이 문서가 데이터 작성의 단일 기준이며, `README.md` "데이터 작성 규칙"의 상세 확장판이다.

- **데이터 파일**: `src/data/anniversaries.json`, `src/data/categories.json`
- **타입 정의**: `src/types/anniversary.ts`, `src/types/category.ts`
- **날짜 파서**: `src/utils/dateUtils.ts` (`resolveOccurrence` / `resolveNthWeekday`)
- **편집 도구**: [`tools/inspector/`](./tools/inspector/README.md) 의 Gradio UI 권장

---

## 0. 추가 전 빠른 체크리스트

- [ ] `id` 가 기존 항목과 중복되지 않는다 (전체에서 유일).
- [ ] `dateType` 과 `date` 포맷이 §2 표대로 짝이 맞는다.
- [ ] `category` 가 `categories.json` 에 존재하는 값이다 (§4).
- [ ] `tags` 3~6개 (§5).
- [ ] `storytelling.origin` 작성, `anecdote` 는 없으면 `null` (§6).
- [ ] `memes` 의 `text` 타입은 `url: null`, `image` 타입은 `url` 필수 (§7).
- [ ] 추가 후 `npm run type-check` 통과 (§10).

---

## 1. 필드 규칙 요약

| 필드 | 필수 | 타입 | 규칙 |
|---|---|---|---|
| `id` | ✅ | `string` | 전체 유일. 네이밍 컨벤션 §3 |
| `date` | ✅ | `string` | `dateType` 별 포맷 §2 |
| `dateType` | ✅ | `DateType` | `annual-fixed` \| `annual-floating` \| `annual-nth-weekday` \| `annual-relative-to-holiday` \| `one-time` |
| `name` | ✅ | `string` | 한국어 표기 우선. 표기 통일(§3 주의) |
| `category` | ✅ | `CategoryId` | `categories.json` 에 정의된 값만 §4 |
| `tags` | ✅ | `string[]` | 3~6개 §5 |
| `storytelling` | ✅ | `{ origin, anecdote }` | `origin` 필수, `anecdote` 는 `string \| null` §6 |
| `memes` | ✅ | `Meme[]` | 없으면 `[]` §7 |
| `sourceUrl` | ✅ | `string \| null` | 출처 없으면 `null` §8 |

타입 원본:

```ts
interface Anniversary {
  id: string
  date: string
  dateType: 'annual-fixed' | 'annual-floating' | 'annual-nth-weekday' | 'annual-relative-to-holiday' | 'one-time'
  name: string
  category: CategoryId
  tags: string[]
  storytelling: { origin: string; anecdote: string | null }
  memes: Meme[]
  sourceUrl: string | null
}

interface Meme {
  type: 'image' | 'text'
  url: string | null   // text 타입은 반드시 null
  caption: string
}
```

> ⚠️ 타입 정의(`src/types/anniversary.ts`)의 `Storytelling.anecdote` 가 현재 `string` 으로 선언돼 있으나, 실제 규칙은 `string | null` 이다. 타입 선언을 `string | null` 로 맞춰야 한다.

---

## 2. `date` / `dateType` 작성법 (핵심)

`date` 문자열 포맷은 `dateType` 에 **종속**된다. 짝을 틀리면 `dateUtils.ts` 가 날짜를 계산하지 못한다.

| `dateType` | `date` 포맷 | 예시 | 의미 |
|---|---|---|---|
| `annual-fixed` | `MM-DD` | `"03-14"` | 매년 같은 월/일 (파이의 날) |
| `annual-floating` | `YYYY-MM-DD` | `"2026-05-24"` | 매년 날짜가 바뀜 → **연도별로 엔트리를 따로 추가** (F1 모나코 GP) |
| `annual-nth-weekday` | `MM-N-DOW` | `"05-2-SUN"` | 매년 "N번째 X요일" 규칙 (미국 어머니의 날) |
| `annual-relative-to-holiday` | `anchorId:offsetDays` | `"anv-nth-11-4-thu-thanksgiving-day-us:1"` | 다른 기념일 기준 +N/-N일 (블랙프라이데이 = 추수감사절 +1일) |
| `one-time` | `YYYY-MM-DD` | `"1986-04-26"` | 특정 연도 1회성 (체르노빌 사고일) |

### `annual-nth-weekday` 상세

`MM-N-DOW` — 하이픈으로 세 토큰:

- `MM` — 월 `01`~`12`
- `N` — `1`~`5` 또는 `L`(그 달 마지막 주)
- `DOW` — `SUN` `MON` `TUE` `WED` `THU` `FRI` `SAT` (영문 3글자 대문자)

| 규칙 | `date` |
|---|---|
| 5월 둘째 일요일 | `"05-2-SUN"` |
| 6월 셋째 일요일 | `"06-3-SUN"` |
| 11월 넷째 목요일 | `"11-4-THU"` |
| 5월 마지막 월요일 | `"05-L-MON"` |
| 10월 마지막 화요일 | `"10-L-TUE"` |

> **금지**: `"03-W3-3"` 같은 `MM-Wn-D`(주차표기·숫자요일) 포맷은 쓰지 않는다. "N번째 X요일"은 반드시 `annual-nth-weekday` + `MM-N-DOW` 로 작성한다. (과거 `gov-*` 8건이 `annual-floating` + `MM-Wn-D` 로 잘못 작성돼 `Invalid Date` 를 유발했고, 현재는 모두 교정됨.)

### `annual-relative-to-holiday` 상세

다른 기념일(고정일이든 N번째 요일이든)을 기준으로 "+N일/-N일" 떨어진 날짜를 표현한다. 블랙프라이데이·사이버먼데이처럼 "추수감사절 다음/다다음 날"로만 정의되는 기념일에 쓴다.

`date` 포맷: `"{anchorId}:{offsetDays}"`

- `anchorId` — 기준이 되는 **다른 Anniversary 의 `id`**. 데이터셋에 실제로 존재해야 한다(없으면 `resolveOccurrence` 가 에러를 던진다).
- `offsetDays` — 기준일로부터 며칠 뒤(+)/전(-)인지. 정수.

| 기념일 | 기준(anchor) | `date` |
|---|---|---|
| 블랙프라이데이 (추수감사절 +1일) | `anv-nth-11-4-thu-thanksgiving-day-us` | `"anv-nth-11-4-thu-thanksgiving-day-us:1"` |
| 스몰 비즈니스 새터데이 (+2일) | 〃 | `"anv-nth-11-4-thu-thanksgiving-day-us:2"` |
| 사이버먼데이 (+4일) | 〃 | `"anv-nth-11-4-thu-thanksgiving-day-us:4"` |

`resolveOccurrence` 는 anchor 의 해당 연도 occurrence 를 먼저 계산한 뒤 `offsetDays` 를 더한다. anchor 가 `annual-nth-weekday` 든 다른 무엇이든 재귀적으로 해석되므로, 5번째 목요일이 있는 해(연 1/7)에도 항상 "추수감사절 다음날"이 정확히 계산된다 — `annual-nth-weekday` 로 근사하던 기존 방식의 오차가 사라진다.

> ⚠️ anchor 로 쓰는 기념일은 먼저 데이터셋에 존재해야 한다. 추가 순서가 꼬여 anchor 가 없으면 타입체크는 통과해도 런타임에서 `Invalid Date` 대신 명시적 에러가 발생한다(§10 권장: 추가 후 앱에서 실제 occurrence 확인).

### 매년/1회성 구분

- 매년 같은 양력 날짜 → `annual-fixed`.
- 매년 오지만 날짜가 매번 다름(스포츠 일정 등) → `annual-floating`, 연도마다 별도 엔트리.
- 매년 요일 규칙 → `annual-nth-weekday`.
- 다른 기념일 기준 +N/-N일로만 정의됨(블랙프라이데이 류) → `annual-relative-to-holiday`.
- 그 해 단 한 번(역사적 사건) → `one-time`.

---

## 3. `id` 네이밍 컨벤션

전체에서 **유일**해야 한다. 형식:

| 종류 | 패턴 | 예시 |
|---|---|---|
| 고정일 | `anv-fixed-{MM-DD}-{slug}` | `anv-fixed-03-14-pi-day` |
| N번째 요일 | `anv-nth-{MM-N-dow}-{slug}` | `anv-nth-05-2-sun-us-mothers-day` |
| 기념일 기준 상대일 | `anv-rel-{anchor-slug}-{offsetDays}-{slug}` | `anv-rel-thanksgiving-1-black-friday-global` |
| 플로팅/1회성 | `anv-{YYYY-MM-DD}-{slug}` | `anv-2026-05-24-monaco-gp` |
| 정부 법정기념일 | `gov-{순번}` | `gov-23` (레거시 — 신규는 위 `anv-*` 형식 권장) |

- `slug` 는 영문 소문자 + 하이픈.
- 같은 날 여러 기념일이면 `slug` 로 구분.
- 표기 통일: `name` 의 외래어 표기를 임의로 바꿔 같은 날을 중복 추가하지 말 것 ("발렌타인" vs "밸런타인" 류). 추가 전 같은 날짜에 동일 기념일이 있는지 확인한다.

---

## 4. `category` 규칙

`category` 값은 **반드시 `categories.json` 에 정의된 `id` 중 하나**여야 한다. 그래야 UI(`CategoryBadge.vue`)가 라벨·이모지·색상을 찾는다.

현재 `categories.json` + `CategoryId` 에 정식 정의된 값 (6개):

| id | label | emoji |
|---|---|---|
| `general` | 일반 | 📅 |
| `romance` | 연애 | 💌 |
| `holiday` | 공휴일 | 🇰🇷 |
| `motorsport` | 모터스포츠 | 🏁 |
| `extreme` | 익스트림 | 🧗 |
| `brand` | 브랜드 데이 | 🍔 |

> ⚠️ **정리 대상**: 기존 데이터에는 `categories.json` 에 없는 `anniversary` / `commemorative` / `international` / `quirky` 4개 값도 쓰이고 있다(주로 `gov-*` 와 일부 비공식 기념일). 신규 추가 시:
> - 위 6개 중 의미가 맞는 것을 우선 사용한다.
> - 부득이 새 카테고리가 필요하면 **먼저** `categories.json` + `src/types/category.ts` `CategoryId` 에 항목을 추가한 뒤 데이터에서 사용한다. 데이터에만 새 값을 넣으면 안 된다.

---

## 5. `tags` 규칙

- **3~6개**의 문자열 배열.
- 한국어 키워드 중심. 검색·필터·연관 노출에 쓰인다.
- 권장 구성: `[지역/주최]`(예: 대한민국, 글로벌, 미국) + `[성격]`(예: 법정공휴일, 비공식기념일, 축제) + `[소재]`(예: 초콜릿, 꿀벌, F1) 조합.
- 같은 의미의 태그 표기를 통일한다(예: "글로벌"/"전세계" 혼용 지양).

---

## 6. `storytelling` 규칙

```jsonc
"storytelling": {
  "origin": "유래/배경 — 언제 누가 왜 제정했는지. (필수)",
  "anecdote": "흥미로운 일화·곁가지 사실. 없으면 null."
}
```

- `origin` — **항상 작성**. 제정 연도·주체·목적 등 사실 위주.
- `anecdote` — 재미 요소(통계, 뒷이야기, 밈의 맥락). 없으면 빈 문자열이 아니라 `null`.

---

## 7. `memes` 규칙

`Meme[]`. 없으면 빈 배열 `[]`.

| `type` | `url` | `caption` |
|---|---|---|
| `"text"` | **반드시 `null`** | 짧은 드립/문구 |
| `"image"` | 이미지 URL (필수) | 이미지 설명·캡션 |

```jsonc
"memes": [
  { "type": "image", "url": "https://.../pi-day.jpg", "caption": "내 IQ는 3.14159265…" },
  { "type": "text",  "url": null, "caption": "파이를 외우는 자, 원을 지배하리라." }
]
```

> 기존 이미지 밈의 `https://example-cdn.com/...` 는 플레이스홀더다. 신규 추가 시 실제 접근 가능한 URL을 쓰거나, 확보 전이면 `text` 밈으로 대체한다.

---

## 8. `sourceUrl` 규칙

- 신뢰 출처(위키백과, 공식 사이트, 정부 부처 페이지) URL 1개.
- 출처가 없으면 `null`. 빈 문자열 금지.

---

## 9. 골든 템플릿 (복붙용)

```json
{
  "id": "anv-fixed-03-14-pi-day",
  "date": "03-14",
  "dateType": "annual-fixed",
  "name": "세계 파이(π)의 날",
  "category": "general",
  "tags": ["과학", "수학", "기념일", "디저트"],
  "storytelling": {
    "origin": "1988년 미국 물리학자 래리 쇼가 샌프란시스코 과학관에서 처음 제안. 3.14가 원주율 근삿값과 같다는 데서 착안했다.",
    "anecdote": "공교롭게도 같은 날은 아인슈타인의 생일이며, 2018년 스티븐 호킹이 별세한 날이기도 하다."
  },
  "memes": [
    { "type": "image", "url": "https://example-cdn.com/memes/pi-day-einstein.jpg", "caption": "내 IQ는 3.14159265…" },
    { "type": "text", "url": null, "caption": "파이를 외우는 자, 원을 지배하리라." }
  ],
  "sourceUrl": "https://en.wikipedia.org/wiki/Pi_Day"
}
```

뼈대만(출처/일화/밈 미확보) 추가할 때:

```json
{
  "id": "anv-fixed-04-07-health-day",
  "date": "04-07",
  "dateType": "annual-fixed",
  "name": "보건의 날",
  "category": "holiday",
  "tags": ["대한민국", "법정기념일", "보건"],
  "storytelling": {
    "origin": "국민보건 향상을 위한 각종 행사를 하는 법정기념일. 주관: 보건복지부.",
    "anecdote": null
  },
  "memes": [],
  "sourceUrl": null
}
```

---

## 10. 추가 후 검증

```bash
npm run type-check     # 타입 위반 0 확인
```

추가로 권장하는 수동 점검:

- `id` 중복 여부: 전체 `id` 개수 == 유일 `id` 개수.
- `dateType`/`date` 짝 검증: `resolveOccurrence(anv, year)` 결과가 `Invalid Date` 가 아닌지.
- 새 `category` 사용 시 `categories.json`·`CategoryId` 동기화 여부.

---

## 11. `folder/national_days.json` 소스 활용 규칙

미국 National Day Calendar 스타일 데이터(`folder/national_days.json`, 월→일→영문 기념일명 배열 구조)에서 항목을 가져와 추가할 때 적용하는 규칙.

### 포함/제외 기준

- **하루에 여러 개 추가 가능**. 1일 1개로 제한하지 않는다 — 원본에 같은 날 여러 항목이 있으면 전부 검토해 추가한다.
- **"National X Day" / "World X Day" 접두가 붙은 항목은 원칙적으로 전부 포함**한다. 사이트 타겟은 한국이지만, "내셔널"/"월드"가 붙은 소재는 다른 나라 사람도 접할 수 있는 보편적 기념일로 간주한다. 미국 역사·인물·군대 관련 소재라도 접두가 있으면 제외하지 않는다 (예: National Anthem Day, National K9 Veterans Day, National DNA Day, National Pet Day 등).
- **제외 대상은 오직**: 접두("National"/"World") 없이 등장하면서 한국에 전혀 적용되지 않는 항목 (예: "Return of Daylight Saving Time" — 한국은 서머타임 미시행). 단순히 "미국적인 소재"라는 이유만으로는 제외하지 않는다.
- 같은 날짜에 이미 한국 맥락 전용 엔트리(예: 블랙데이)나 법정기념일(`gov-*`)이 있어도, `name`이 다른 별개 기념일이면 중복 없이 함께 추가한다.

### `id` / `sourceUrl` 패턴

- 미국 기원 항목: `anv-fixed-{MM-DD}-{slug}-us`
- 전 세계적으로 통용되거나 UN·ILO 등 국제기구가 지정한 날: `anv-fixed-{MM-DD}-{slug}-global`
- `sourceUrl`: nationaldaycalendar.com 항목은 `https://nationaldaycalendar.com/national-{slug}-{month}-{day}/` 패턴 사용. 역사적 사건·인물처럼 더 큰 주제는 위키백과 URL을 우선한다.

### 카테고리 매핑 (비공식 4종 — §4 참고)

national_days.json 항목을 분류할 때는 §4에서 "정리 대상"으로 언급한 비공식 카테고리 4종(`anniversary`/`commemorative`/`international`/`quirky`)을 아래 기준으로 사용한다.

| 소재 성격 | `category` |
|---|---|
| 음식/일상 소품/동물 등 가벼운 소재 | `general` |
| 팝컬처·캐릭터·발명/탄생 기념 | `anniversary` |
| 보건·인식개선·국제 캠페인·평등 이슈 | `international` |
| 유머·말장난성 소재 | `quirky` |
| 역사적 사건·인물 추모·직업군 감사 | `commemorative` |
| 연애 관련 소재 | `romance` |

### 진행 현황

- 완료: 1·2·3·4·5·6·7·8·9·10·11·12월 (`folder/national_days.json` 기준 총 1209개 엔트리 추가, `npm run type-check` 통과 확인). 1~12월 전체 사이클 완료.

### 해결됨: "특정 공휴일 기준 상대 날짜" → `annual-relative-to-holiday`

블랙프라이데이·Small Business Saturday·사이버먼데이처럼 "추수감사절 다음/다다음/+4일"로 정의되는 날은 과거에는 dateType 4종 중 어느 것으로도 매년 정확히 표현할 수 없었다. `annual-nth-weekday`로 근사(예: `11-4-FRI`)하면 11월 1일이 금요일인 해(약 7년에 1번)에 실제보다 한참 빠르게 계산되는 오류가 있었다.

`annual-relative-to-holiday`(§2 상세) 도입으로 해결됨 — anchor 기념일(`anv-nth-11-4-thu-thanksgiving-day-us`)의 occurrence 에 offset 일을 더해 계산하므로 항상 정확하다. 적용된 항목(전부 `anv-rel-thanksgiving-{N}-*`): 블랙프라이데이·원주민 유산의 날·경청의 날·아무것도 사지 않는 날·플로싱의 날·유어 웰컴기빙 데이(+1일), 스몰 비즈니스 새터데이(+2일), 사이버먼데이(+4일).

### 출처가 "N번째 요일"을 고정 날짜로 표기한 경우 주의

`national_days.json`은 특정 연도 기준으로 날짜가 고정되어 있어, 실제로는 "매월 N번째 요일" 규칙인 기념일도 `MM-DD` 한 줄로만 등장한다 (예: 미국 어머니의 날, National Day of Prayer/Reason, Melanoma Monday, Armed Forces Day, Memorial Day). 이런 항목은 출처의 숫자 날짜를 그대로 `annual-fixed`로 옮기면 안 되고, 실제 요일 규칙을 찾아 §2의 `annual-nth-weekday` + `MM-N-DOW` 포맷으로 변환해서 추가한다. 이미 동일 기념일이 `annual-nth-weekday`로 등록되어 있다면(예: 미국 어머니의 날) 중복 추가하지 않는다.

---

## 부록: 알려진 데이터 불일치 (정리 대상)

규칙이 아니라, 기존 데이터에 남아 있어 **점진적으로 교정해야 할** 항목.

1. **중복 `id`** — `anv-fixed-02-14-valentines-day-global` 가 2개 엔트리에 중복("발렌타인데이"/"밸런타인데이"). 하나로 통합 필요.
2. **미정의 `category` 4종** — `anniversary` / `commemorative` / `international` / `quirky` 가 데이터엔 있으나 `categories.json`·`CategoryId` 에 없음. 6개로 매핑하거나 정식 등록 필요.
3. **`anecdote` 타입 선언** — `Storytelling.anecdote` 를 `string` → `string | null` 로 수정 필요.
4. **이름 중복(의도 추정)** — "스승의 날"·"현충일" 등이 `anv-*`(풍부)와 `gov-*`(뼈대)에 각각 존재. UI 중복 노출 가능 — 표시 정책 결정 필요.
5. **플레이스홀더 밈 URL** — `image` 밈의 `example-cdn.com` 경로는 실제 호스팅 아님. 실 URL 교체 필요.
