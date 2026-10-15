# 코딩 컨벤션

여러 AI 모델(Claude·Codex 등)이 번갈아 작업해도 코드가 한 사람이 쓴 것처럼 보이게 하는 규칙.
**기계가 막는 것**은 `npm run verify` 가 실패시키고, 나머지는 리뷰에서 지킨다.

## 서식 — 기계가 막는다

- Prettier(`.prettierrc.json`)가 정한다. 손으로 맞추지 말고 `npm run format` 을 돌린다.
- `verify` 첫 단계가 `format:check` 다. 대상은 `src/**/*.{ts,vue}`·`api/`·`server/`·`tests/`·
  `tools/{og,prerender}`·`*.config.ts`. CSS 파일과 데이터 JSON 은 대상이 아니다
  (CSS 는 한 줄 규칙 스타일을 유지하고, JSON 은 생성기가 쓴다).
- **템플릿에서 인라인 요소 사이 공백이 필요하면 `{{ ' ' }}` 로 적는다.** Prettier 는 공백을
  줄바꿈으로 바꿀 수 있는데, Vue 는 줄바꿈이 든 요소 사이 공백을 지운다(`AppHeader.vue` 메뉴).

## 이름

| 대상 | 규칙 |
|---|---|
| 컴포넌트 | `PascalCase.vue`. `Ui` 접두사는 HTML 요소 이름과 겹칠 때만(`UiButton`, `UiChip`) |
| 컴포저블 | `useXxx.ts`, 파일명 = 함수명 |
| 스토어 인스턴스 변수 | `{이름}Store` (`shareStore`, `statsStore`) |
| 날짜 | `urlDate` = 주소의 MM-DD, `occurrence` = 그 해 실제 Date, `*Label` = 화면 문자열 |
| 비동기 상태 | `loading`·`error: string \| null`·`ready`. 화면 분기가 3개 이상이면 `PageState` |
| CSS 클래스 | 공용 `ui-*`, 페이지별 `{페이지}-*`. `home-*` 는 새로 만들지 않는다 |
| 주석 | 한국어, "무엇"보다 "왜" |

## 한 곳에만 두는 것

- **표시 문자열** — `src/utils/format.ts`: `displayName`(원어 괄호 떼기), `koreanDate`,
  `monthDayKey`, `WEEKDAY_KO`, `MONTH_EN`, `countFormat`. 같은 변환을 인라인으로 다시 쓰지 않는다.
  원어 괄호가 붙은 전체 이름은 기념일 상세 페이지 제목에서만 보여 준다.
- **카테고리 색** — 배정은 `categories.json` 의 `colorToken`, 색값은 `ui.css` 의 `[data-color]`.
  요소에 `class="category-dot" :data-color="..."` 를 달면 된다. 범례는 데이터에서 만든다.
- **데이터 로딩 상태** — `useMonths(필요한 달)` 이 `loading`·`error`·`retry` 를 준다. 스토어에
  전역 로딩 플래그를 다시 만들지 않는다(필요한 달을 이미 가진 화면까지 스켈레톤으로 돌아간다).
- **"지금"** — 컴포넌트에서는 `useNow()`, 그 밖에서는 `todayInSiteZone()`.
- **클립보드** — `useCopyToClipboard()` (인앱 브라우저용 대체 경로가 들어 있다).

## 의존 방향

`types → utils → services → stores → composables → components → features`

- 공용 계층(components·stores·utils·seo)은 features 를 import 하지 않는다. feature 끼리도
  import 하지 않는다 — 두 곳 이상에서 쓰면 UI 는 `components/`, 순수 로직은 `utils/` 로 올린다.
  (아직 정리 전인 예외: `CategorySymbol`·`TodayStoryCard`·stats 컴포넌트·`FeedbackModal`·
  `birthday.ts`·`milestones.ts` — 옮길 때 이 줄도 지운다)
- `api/`·`server/`·프리렌더가 import 하는 파일은 상대경로 + `.js` 확장자를 쓴다(Node ESM).

## 스타일

- 색·간격·모서리는 `tokens.css` 토큰만. 템플릿에 Tailwind 유틸 클래스를 새로 쓰지 않는다
  (예외: html-to-image 로 캡처하는 `ShareCard.vue`).
- 버튼은 `UiButton`. `home-button` 클래스를 직접 쓰지 않는다.
