# 계획서 — 전 페이지 디자인 일관성 리디자인 · 스타일 리팩토링

작성 2026-10-11 · 브랜치 `feat/design-consistency` (main 8524da97 기준)

## 0. 목표와 원칙

홈(`/`)은 SEED(당근 디자인 시스템, https://seed-design.io) 원칙을 참고해 이미 리디자인됐다.
나머지 페이지는 각자 다른 시기에 만들어져 히어로·제목·버튼·리스트·상태 표현이 제각각이다.
**홈을 기준(canon)으로 삼아 나머지 페이지를 같은 디자인 언어로 맞추고, 반복되는 스타일을
공용 컴포넌트·토큰으로 정리한다.**

- 홈의 시각적 결과는 바꾸지 않는다(리팩토링만). 비교 스크린샷으로 확인한다.
- URL·라우트·쿼리·공유 링크·프리렌더 메타는 바꾸지 않는다.
- 새 의존성 없음. Vue 3 + Tailwind v4 + 기존 CSS 체계 안에서 해결한다.
- 접근성 유지/개선: 터치 타깃 44px 이상, `:focus-visible`, `prefers-reduced-motion`, 의미 있는 ARIA.
- 문구는 SEED Writing 원칙(해요체, 쉬운 단어, 하나의 목적, 긍정·능동문). 브랜드 장치인
  제목 끝 강조 마침표/물음표(`.heading-dot`)는 유지한다.

참고 자료(로컬, 커밋 안 함): `tmp/seed/*.txt` (SEED 문서 발췌), `tmp/before/*.jpg` (현재 화면 캡처 — d-=1280px, m-=390px).

## 1. 현재 진단 (캡처 기준)

| 페이지 | 히어로 | 문제 |
|---|---|---|
| 홈 | 종이색(paper-200) 라운드 24 패널 · 좌 카피 / 우 아트 · 하단 정보줄 | 기준 |
| 달력 | 종이색 패널 + 하단 통계 | 홈과 거의 일치. 선택일 패널만 버건디 단색으로 튐 |
| 캘린더 연동 | 종이색 패널 | 카테고리 칩이 카드형 그리드라 무겁고, 하단 목록 밀도 높음 |
| **인기 순위** | **검정 패널** | 홈과 정반대 톤. 월별/누적 + 이번 달/지난달 + 월 선택이 3중 컨트롤. 20행 균일 리스트라 위계 없음 |
| **생일** | **패널 없음**(좌우 분할) | 히어로 형식 불일치. 모바일에서 결과 카드가 먼저 나오고 선택 목록이 아래라 다른 이야기로 바꾸려면 스크롤 왕복. 교차 링크가 테두리 박스 2개로 산만 |
| **우리의 날** | 패널 없음 | 생일과 같은 문제 + 타임라인 2열이 작은 글씨로 빽빽함, 다음 마일스톤 카드가 홈 카드와 다른 형식 |
| 상세 | 좁은 종이 카드 | 본문이 단일 좁은 열이라 데스크톱 여백 과다. 다른 기념일·비슷한 주제가 맨 아래 단순 목록 |
| 날짜 허브 | 좁은 종이 카드 | 기념일이 텍스트 목록뿐(홈은 카드). 이전/다음 날짜 이동이 하단에만 |
| 404 | — | 상태 표현 체계 없음 |

## 2. 디자인 기반 (SEED → AnniCal 매핑)

### 2-1. 토큰 — `src/assets/tokens.css` (신규, `@theme` 확장)
- **간격** 4px 그리드: `--space-1..16` (4,8,12,16,20,24,28,32,40,48,56,64). 시맨틱:
  `--gutter`(16 / md 24 / lg 32), `--section-gap`(56 / md 88), `--nav-to-title`(20), `--between-text`(6).
- **라운드**: `--radius-sm 8` · `--radius-md 12` · `--radius-lg 16`(카드) · `--radius-xl 24`(패널) · `--radius-full`.
- **타이포 스케일** (SEED t-scale 대응): `--text-t2 12/16` … `--text-t14 48/60` + 디스플레이
  `--text-display clamp(40px, 5vw, 72px)`. 굵기 3단(400/550/750).
- **색 역할**: 기존 팔레트를 역할 이름으로 별칭 — `--fg-neutral`(ink-700), `--fg-muted`(ink-500),
  `--fg-subtle`(ink-400), `--fg-brand`(accent-600), `--bg-page`(paper-100), `--bg-surface`(paper-50),
  `--bg-weak`(paper-200), `--bg-neutral-solid`(ink-700), `--bg-brand-solid`(accent-600), `--stroke-weak`(rule), `--stroke-strong`(rule-strong).
  **브랜드(버건디) 단색 배경은 화면당 1개의 핵심 액션/순간에만** (SEED Brand 원칙).
- **모션**: `--ease-out cubic-bezier(.22,1,.36,1)`, `--dur-fast 160ms`, `--dur-base 240ms`.
- **눌림 피드백** (SEED Feedback/Scale): 누르는 동안 2px 만큼 줄어든다.
  `basis = max(높이, 폭/4, 24)`, `scale = (basis-2)/basis` — 컴포넌트별 상수로 근사:
  버튼 S .945 · M .955 · L .962, 칩 .94, 카드 .985, 리스트 행은 **콘텐츠만** .985(Content Scale).
  reduced-motion 이면 축소 없이 배경색 변화만.

### 2-2. 공용 UI 컴포넌트 — `src/components/ui/` (신규)
각 컴포넌트는 props 로 변형만 받고, 스타일은 `src/assets/ui.css` 한 곳에 둔다(스코프 CSS 대신 BEM 유사 `ui-*` 클래스 — html-to-image·프리렌더와 충돌 없게).

| 컴포넌트 | 역할 (SEED 대응) | 주요 props |
|---|---|---|
| `PageHero` | 모든 페이지 상단 패널 (홈 hero 형식) | `kicker`, `meta`(우상단), `title`(slot, 강조 마침표), `description`, `variant: 'default'\|'compact'`, slots `aside`(우측 아트/폼), `actions`, `footer`(통계/정보줄) |
| `SectionHeader` | 섹션 제목 (홈 section-kicker+h2) | `kicker`, `title`, `description`, slot `action`, `level` |
| `UiButton` | Action Button | `variant: neutral\|brand\|weak\|outline\|ghost`, `size: s\|m\|l`, `to`/`href`/button, `icon: 'arrow'\|'down'\|...`, `block`, `loading` |
| `ListRow` / `ListGroup` | List / List Header | slots `prefix`, `title`, `detail`, `suffix`; `to`(RouterLink) 또는 `@click`; `selected`; `align: center\|top` |
| `SegmentedControl` | Segmented Control (2–4개, 화면당 1개) | `options`, `modelValue`, 인디케이터 슬라이드 |
| `ChipGroup` / `UiChip` | Chip (selection/filter, `scrollable`/`wrap`) | `variant: solid\|outline-weak`, `selected`, `count` |
| `FieldShell` | Field (Label·Helper·Error) | `label`, `helper`, `error`, `for`, slot 입력 |
| `ResultState` | Result Section (empty/error/loading/404) | `tone`, `title`, `description`, slot `actions`, `asset` |
| `SkeletonRows` | Skeleton 로딩 | `rows`, `variant: list\|card` |
| `PromoCard` | 홈 subscribe-banner 형식의 교차 유도 카드 | `kicker`, `title`, `description`, `to`, `cta` |

홈은 기존 마크업을 이 컴포넌트로 **치환해도 화면이 동일**해야 한다. 홈에서 차이가 생기면 홈이 아니라 컴포넌트를 홈에 맞춘다.

### 2-3. CSS 리팩토링
- `src/assets/home.css`(518줄)는 이름과 달리 전 페이지가 공유한다. 다음으로 분해:
  `tokens.css`(토큰) · `ui.css`(공용 컴포넌트) · `layout.css`(page shell/container/gutter) ·
  페이지별 `feed.css` `birthday.css` `together.css` `popular.css` `calendar.css` `export.css` `article.css`(상세·허브).
- 각 뷰는 자기 페이지 CSS 만 import. 안 쓰는 선택자는 삭제(사용처 grep 확인 후). `!important` 신규 금지.
- 하드코딩 색/간격은 토큰으로 치환(SVG 공유 카드의 리터럴 색은 html-to-image 제약으로 예외).

## 3. 페이지별 설계

### 공통 레이아웃
- 컨테이너: 도구형 페이지 max 1240px, 읽기형(상세·허브) max 1040px. 좌우 `--gutter`.
- 순서: `PageHero` → (컨트롤 바) → 섹션들(`SectionHeader` + 본문) → 교차 유도(`PromoCard` 1~2개) → 푸터.
- 섹션 간격 `--section-gap`. 모바일 하단 고정 탭바와 겹치지 않게 페이지 하단 여백 확보.

### 3-1. 생일 `/birthday` + 우리의 날 `/together` — 공용 "발견 도구" 템플릿
두 페이지는 같은 골격을 쓴다: `DiscoveryToolLayout`(slot: form, highlight, choices, feature, crossLinks).
- **히어로**: `PageHero`(default). 좌측 카피, 우측 aside 에 폼 카드(종이 카드 + `FieldShell`).
  생일 = 월/일 select 2개, 우리의 날 = date input. 주 버튼 `UiButton neutral l block`.
- **결과 헤더**: `SectionHeader`("10월 11일에 담긴 이야기." + 우측 pill "2026년 기준").
- **선택 + 상세** (데스크톱): 좌 feature 카드(카테고리, 제목, 유래 3줄, 액션 2개: **brand** "카드 만들기" + ghost "유래 더 읽기"), 우 `ListGroup` 선택 목록(라디오 의미: `role="radiogroup"`/`aria-checked`).
  **모바일(≤760)**: 선택지를 feature 카드 **위**에 가로 스크롤 `ChipGroup`(solid 선택)으로 — 바꾸기 위해 스크롤 왕복하지 않게.
- **우리의 날 하이라이트**: "다가오는 우리의 날" 카드 = 홈 Today 카드와 같은 형식(큰 라벨·날짜·요일, D-day pill). 타임라인은 단일 `ListGroup`("다가오는 날" 5개) + `SegmentedControl` 없이 "지난 날 보기" 토글 버튼으로 지난 2개 펼침. 각 행: prefix=D-day, title=라벨, detail=날짜·요일·그날 기념일 1~2개 + "외 N개".
- **교차 유도**: 하단 `PromoCard` 2개 나란히 — 생일: "친구 생일도 알아보기", "우리의 날 찾기" / 우리의 날: "내 생일은?", "기념일 달력".
- 빈 결과·오류·로딩은 `ResultState`/`SkeletonRows`.

### 3-2. 인기 순위 `/popular`
- 히어로: **검정 → 종이색** `PageHero`. footer 슬롯에 통계 2개(순위에 오른 이야기, 상위 읽음 합계).
- 컨트롤 바 1줄: `SegmentedControl [월별 | 누적]` + (월별일 때) 월 스테퍼 `‹ 2026년 10월 ›` + "이번 달" weak 버튼(현재 달이 아닐 때만). 기존 "이번 달/지난달 기록" 탭은 스테퍼와 중복이라 제거.
- 본문: **TOP 3 카드**(3열, 모바일 가로 스크롤 또는 1열) — 순위 숫자 크게, 카테고리 심볼, 제목, 날짜, 읽음 수. 4~20위는 `ListRow`(prefix=순위, title, detail=카테고리·날짜, suffix=읽음 수).
- 안내 문구(부분 집계, 기록 없음)는 `ResultState` 또는 리스트 위 한 줄 안내(Callout 스타일 weak 패널).

### 3-3. 달력 `/calendar`
- 히어로는 `PageHero`로 치환(현재 형식 유지). 검색은 `FieldShell` 스타일 입력.
- 선택일 패널: 버건디 단색 → `bg-surface` 카드 + 상단에 큰 날짜 숫자(accent 색)만. 버건디 단색은 오늘 날짜 셀 표시에만 남긴다.
- 범례를 `ChipGroup`(필터 겸용이면 연결, 아니면 정적 표시)으로. 모바일에서 선택일 패널을 달력 바로 아래에, 날짜 탭 시 패널로 스크롤.

### 3-4. 캘린더 연동 `/export`
- 히어로 `PageHero`. 카테고리 선택을 카드 그리드 → `ChipGroup wrap`(outline-weak, 선택 시 solid, 개수 표시). "전체 선택/모두 해제"는 ghost 버튼.
- 요약 바(선택 N건)는 모바일에서 하단 탭바 위에 sticky.
- 내려받기/구독 카드 2장은 유지하되 버튼을 `UiButton`으로. "담기는 기념일" 목록은 `ListRow` + 더보기.

### 3-5. 기념일 상세 `/day/:date/:slug`
- 히어로 `PageHero compact`(1040px): 카테고리 칩 · 날짜 · 제목 · 누적 읽음/관심도 순위.
- 데스크톱 2열(본문 2/3 + aside 1/3, aside sticky): 본문 = 유래/이야깃거리(SectionHeader small) + 인용(memes) + 출처. aside = 액션 카드(brand "공유하기", outline "정보 요청"), **"이 날이 생일이라면?" PromoCard → `/birthday?date=MM-DD`**, 같은 날 다른 기념일 `ListGroup`, 비슷한 주제 `ChipGroup`. 모바일 단일 열(본문 → 액션 → 나머지).
- 프리렌더 본문(`tools/prerender/plugin.ts`)은 SEO 용 정적 HTML 이라 구조 변경 불필요(텍스트 동일성 유지).

### 3-6. 날짜 허브 `/day/:date`
- 히어로 `PageHero compact` + 히어로 안에 이전/다음 날짜 스테퍼.
- 기념일을 홈 "오늘의 기념일" 카드 그리드(기존 `AnniversaryCard`/`TodayStoryCard` 재사용)로.
- 하단 `PromoCard` "이 날이 생일이라면?" → `/birthday?date=MM-DD`.

### 3-7. 404 · 공유 모달
- 404: `ResultState` large(아트 + "찾는 페이지가 없어요" + 홈/달력 버튼).
- 공유 모달: 모바일(≤760)에서 Bottom Sheet 형식(하단에서 올라옴, 핸들, 안전영역 패딩). 버튼을 `UiButton`으로.

## 4. 검증
- `npm run verify` 통과(기존 168 테스트 + 신규 순수 로직 테스트가 있다면 추가).
- 홈 회귀: 리팩토링 전후 1280/390 캡처 비교 — 차이 없어야 함.
- 전 페이지 1280/390 캡처: 가로 넘침 없음, 하단 탭바와 겹침 없음, 히어로·섹션 제목·버튼 형식 일관.
- 키보드 탐색: 생일·우리의 날 선택 목록, 세그먼트, 칩이 Tab/화살표/Enter 로 동작.
- 공유 카드 이미지(html-to-image) 정상 생성.

## 5. 작업 단계 (Codex 위임)
1. **기반**: tokens.css · ui.css · layout.css 분리, `src/components/ui/*` 작성, 홈을 공용 컴포넌트로 치환(시각 동일).
2. **발견 도구**: 생일·우리의 날 공용 템플릿 + 두 페이지 리디자인.
3. **인기 순위**.
4. **달력 · 캘린더 연동**.
5. **상세 · 허브 · 404 · 공유 모달**, 안 쓰는 CSS 정리, README 디자인 시스템 절 추가.

각 단계 후 Hermes 가 로컬 프리뷰 캡처로 검수하고 피드백을 반영한다.
