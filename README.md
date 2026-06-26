# [기념일 만물상](https://annical.vercel.app/)

세상의 다양하고 흥미로운 기념일을 매일 큐레이션 해주는 웹앱.
전 세계 1,291개 기념일을 13개 카테고리로 분류해 피드·달력·캘린더 연동으로 제공한다.

## 주요 기능

- **오늘의 기념일 피드** — 오늘 날짜의 기념일을 카드 형태로 점진 로딩
- **월간 달력** — 월별로 기념일을 달력에 표시 (모바일: 색상 점 표시), 이름·태그 검색 지원
- **캘린더 연동** — 카테고리 선택 후 `.ics` 다운로드 또는 구독 URL로 자동 업데이트
- **공유** — 기념일 카드를 이미지로 저장·공유

## 기술 스택

- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript**
- **Vite 6**
- **Tailwind CSS v4** (Vite 플러그인 방식)
- **Pinia** — 전역 상태
- **vue-router 4**
- **dayjs** — 날짜 계산
- **ics** — `.ics` 캘린더 파일 생성
- **html-to-image** — 카드 → 이미지 변환
- **Vercel** — 정적 호스팅 + 서버리스 API (`/api/calendar`)

## 시작하기

```bash
npm install
npm run dev         # 개발 서버
npm run type-check  # 타입 체크
npm run build       # 프로덕션 빌드
```

## 디렉토리 구조

```
src/
├── assets/                  # 글로벌 CSS, 정적 자원
├── components/              # 도메인 무관 공통 UI
│   ├── common/              #   원자 단위 (CategoryBadge 등)
│   ├── layout/              #   AppShell, Header, Footer
│   ├── card/                #   AnniversaryCard
│   └── share/               #   ShareCard, ShareModal
├── features/                # 도메인 기능 단위
│   ├── feed/                #   오늘의 기념일 큐레이션 피드
│   ├── calendar/            #   월간 달력 + 검색
│   └── calendar-export/     #   .ics 다운로드 + 구독 URL
├── data/                    # 정적 JSON DB
│   ├── anniversaries/       #   01.json … 12.json (월별 분할, 총 1,291건)
│   └── categories.json      #   13개 카테고리 정의
├── services/                # 데이터 추상화 (Repository 패턴)
├── stores/                  # Pinia 전역 상태
├── router/
├── types/                   # TS 타입 정의
└── utils/                   # 순수 유틸 (날짜 계산, ics 생성 등)

api/
└── calendar.ts              # Vercel 서버리스 — 캘린더 구독 피드 (/api/calendar)
```

## 데이터 레이어 흐름

```
src/data/*.json
   ↓
services/anniversaryRepository.ts   ← 데이터 소스 추상화 (추후 DB 교체 지점)
   ↓
stores/anniversaries.ts             ← Pinia 캐시
   ↓
features/<domain>/composables/*.ts  ← 도메인별 가공 훅
   ↓
features/<domain>/views/*.vue       ← 화면
```

## 카테고리

| id | 레이블 | 설명 |
|---|---|---|
| `holiday` | 공휴일 | 법정 공휴일과 국경일 |
| `food` | 음식 & 디저트 | 음식, 디저트, 음료 등 먹거리 |
| `animal` | 동물 & 자연 | 반려동물, 야생동물, 환경 보호 |
| `campaign` | 국제 캠페인 & 보건 | UN 기념일, 보건, 인권, 인식개선 |
| `quirky` | 이색 & 유머 | 유머, 이색기념일, 말장난 |
| `culture` | 문화 & 예술 | 문학, 영화, 음악, 미술, 팝컬처 |
| `academic` | 학술 & 기술 | 과학, IT, 수학, 우주, 발명 |
| `career` | 직업 & 감사 | 직업군 감사·격려의 날 |
| `sports` | 스포츠 & 레저 | 글로벌 스포츠, 모터스포츠, 액티비티 |
| `history` | 역사 & 추모 | 역사적 사건, 인물 추모 |
| `romance` | 연애 & 기념일 | 연인·기념일·로맨틱한 날 |
| `brand` | 브랜드 데이 | 브랜드 관련 이벤트 |
| `general` | 일반 | 기타 분류하기 어려운 날 |

## 캘린더 API

```
GET /api/calendar
GET /api/calendar?categories=food,holiday,quirky
```

- 응답 형식: `text/calendar` (`.ics`)
- 전체 선택 시 쿼리 파라미터 생략 가능
- CDN 캐시: 12시간 + 24시간 stale-while-revalidate

## 데이터 작성 규칙

기념일 데이터는 `src/data/anniversaries/01.json … 12.json` (월별 12파일)에 분할 저장된다.

### `date` 필드 포맷

| `dateType` | `date` 포맷 | 예시 | 의미 |
|---|---|---|---|
| `annual-fixed` | `MM-DD` | `"03-14"` | 매년 같은 월/일 |
| `annual-floating` | `YYYY-MM-DD` | `"2026-05-24"` | 매년 반복되지만 날짜가 바뀜 — 연도별 엔트리 추가 |
| `annual-nth-weekday` | `MM-N-DOW` | `"05-2-SUN"` | 매년 N번째 X요일 |
| `one-time` | `YYYY-MM-DD` | `"1986-04-26"` | 특정 연도 1회성 |

#### `annual-nth-weekday` 예시

| 기념일 | 규칙 | `date` |
|---|---|---|
| 미국 어머니의 날 | 5월 둘째 일요일 | `"05-2-SUN"` |
| 미국 아버지의 날 | 6월 셋째 일요일 | `"06-3-SUN"` |
| 미국 추수감사절 | 11월 넷째 목요일 | `"11-4-THU"` |
| 미국 메모리얼 데이 | 5월 마지막 월요일 | `"05-L-MON"` |

- `N`: `1`~`5` 또는 `L` (마지막 주)
- `DOW`: `SUN` `MON` `TUE` `WED` `THU` `FRI` `SAT`
