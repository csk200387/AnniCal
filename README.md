# [기념일 만물상](https://annical.vercel.app/)

세상의 다양하고 흥미로운 기념일을 매일 큐레이션 해주는 웹앱.
전 세계 1,572개 기념일을 13개 카테고리로 분류해 피드·달력·캘린더 연동으로 제공한다.

## 주요 기능

- **오늘의 기념일 피드** — 오늘 날짜의 기념일을 카드 형태로 점진 로딩
- **월간 달력** — 월별로 기념일을 달력에 표시 (모바일: 색상 점 표시), 이름·태그 검색 지원
- **캘린더 연동** — 카테고리 선택 후 `.ics` 다운로드 또는 구독 URL로 자동 업데이트
- **공유** — 기념일 카드를 이미지로 저장·공유
- **공개 통계** — 오늘·누적 익명 방문자와 전체 페이지뷰 표시
- **관심도 순위** — 기념일별 상세 조회수와 많이 읽힌 기념일 TOP 5

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
- **Upstash Redis** — 익명 방문자·페이지뷰·기념일 관심도 집계

## 시작하기

```bash
npm install
npm run dev         # 개발 서버
npm run type-check  # 타입 체크
npm run build       # 프로덕션 빌드
```

## URL 구조

배포 기준 기본 URL은 `https://annical.vercel.app`이다.

```text
https://annical.vercel.app
├── /                              # 오늘의 기념일 피드
├── /calendar                      # 월간 달력·검색
├── /export                        # .ics 다운로드·캘린더 구독
├── /day/:date                     # 날짜별 기념일 허브 (:date = MM-DD)
│   └── /:slug                     # 기념일 상세
├── /api
│   ├── /calendar                  # 캘린더 구독용 ICS 피드
│   └── /stats                     # 익명 방문·조회 통계
├── /sitemap.xml                   # 빌드 시 생성되는 사이트맵
├── /robots.txt                    # 크롤러 정책
└── 그 외 경로                     # noindex 404 페이지
```

| 경로 | 방식 | 설명 |
|---|---|---|
| `/` | 정적 진입점 + SPA | 오늘 날짜의 기념일과 관심도 순위를 표시한다. |
| `/calendar` | SPA rewrite | 월별 달력에서 이름·태그로 기념일을 찾는다. |
| `/export` | SPA rewrite | 선택한 카테고리·그룹으로 `.ics`를 만들거나 구독 URL을 발급한다. |
| `/day/:date` | 프리렌더 | `MM-DD` 형식의 유효한 날짜 366개를 날짜 허브로 생성한다. 예: `/day/03-14` |
| `/day/:date/:slug` | 프리렌더 | `routes.json`에 등록된 기념일 상세 페이지다. 예: `/day/03-14/pi-day` |
| `/api/calendar` | Vercel Function | `GET`·`HEAD` 요청에 `text/calendar` 형식으로 응답한다. |
| `/api/stats` | Vercel Function | `GET`으로 공개 통계를 조회하고 `POST`로 페이지뷰를 기록한다. |

상세 경로는 `src/data/routes.json`이 관리하며 `npm run check:slugs`로 데이터와의 일치 여부를 검사한다. `annual-nth-weekday`처럼 실제 날짜가 해마다 달라지는 기념일도 검색 색인을 유지하도록 URL의 `:date`는 기준 연도(2026년) 값으로 고정한다. 화면에 표시되는 날짜와 날짜 허브 소속은 현재 연도의 실제 발생일을 계산해 사용한다.

빌드 시 날짜 허브 366개와 기념일 상세 1,572개를 정적 HTML로 만들고 사이트맵에도 포함한다. `/calendar`와 `/export`만 `index.html`로 rewrite하며, 등록되지 않은 경로는 `404.html`로 응답한다.

## 디렉토리 구조

```text
.
├── api/                              # Vercel 서버리스 함수
│   ├── calendar.ts                   #   캘린더 구독 피드 (/api/calendar)
│   └── stats.ts                      #   공개 방문·조회 통계 (/api/stats)
├── public/                           # 그대로 배포되는 정적 파일
├── src/
│   ├── assets/                       # 글로벌 CSS
│   ├── components/                   # 도메인 공통 UI
│   │   ├── card/                     #   기념일 카드
│   │   ├── common/                   #   배지 등 원자 컴포넌트
│   │   ├── layout/                   #   AppShell, Header, Footer
│   │   └── share/                    #   공유 카드·모달
│   ├── composables/                  # 전역 재사용 Composition 함수
│   ├── data/                         # 정적 JSON 데이터베이스
│   │   ├── anniversaries/            #   01.json … 12.json (월별, 총 1,572건)
│   │   ├── categories.json           #   13개 카테고리
│   │   ├── groups.json               #   교차 선택 그룹
│   │   ├── observances.json          #   기념일 원본·보조 데이터
│   │   └── routes.json               #   기념일 id ↔ URL 날짜·slug 매핑
│   ├── features/                     # 도메인 기능 단위
│   │   ├── calendar/                 #   월간 달력·검색
│   │   ├── calendar-export/          #   .ics 다운로드·구독 URL
│   │   ├── day/                      #   날짜 허브·기념일 상세
│   │   ├── feed/                     #   오늘의 기념일 피드
│   │   ├── notfound/                 #   클라이언트 404 화면
│   │   └── stats/                    #   공개 통계 UI
│   ├── router/                       # vue-router 라우트 정의
│   ├── seo/                          # 메타 태그·canonical·JSON-LD
│   ├── services/                     # 데이터 접근 계층 (Repository 패턴)
│   ├── stores/                       # Pinia 전역 상태
│   ├── types/                        # TypeScript 타입
│   └── utils/                        # 날짜·URL·ICS 등 순수 유틸
├── tests/                            # Vitest 데이터·API·빌드 검증
├── tools/
│   ├── enrich/                       # 데이터 보강 파이프라인
│   ├── inspector/                    # 데이터 검수 도구
│   ├── namuwiki/                     # 나무위키 데이터 수집·대조
│   ├── observances/                  # observances 생성 도구
│   ├── prerender/                    # 상세·날짜 허브 정적 HTML 생성
│   ├── research/                     # 조사 자료
│   └── slugs/                        # slug·routes.json 생성 및 검증
├── index.html                        # Vite HTML 진입점
├── vite.config.ts                    # Vite·사이트맵·프리렌더 설정
└── vercel.json                       # rewrite·보안 헤더 설정
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
GET /api/calendar?groups=statutory
GET /api/calendar?categories=food&groups=statutory
HEAD /api/calendar
```

- 응답 형식: `text/calendar` (`.ics`)
- 전체 선택 시 쿼리 파라미터 생략 가능
- 허용 쿼리: `categories`, `groups` (둘을 함께 지정하면 OR 조건)
- CDN 캐시: 12시간 + 24시간 stale-while-revalidate

## 통계 API

```text
GET  /api/stats                       # 전체 공개 통계·관심도 TOP 5
GET  /api/stats?id=<anniversary-id>   # 전체 통계 + 해당 기념일 조회수·순위
POST /api/stats                       # 페이지뷰 기록
```

`POST` 본문은 `application/json` 형식의 `{ "eventId": "<UUID>", "anniversaryId": "<선택>" }`를 사용한다. `anniversaryId`를 생략하면 일반 페이지뷰만 기록한다.

## 공개 통계 설정

통계는 Upstash Redis가 연결되었을 때만 표시된다. 저장소가 없는 로컬 개발 환경에서는
본문은 정상 동작하고 통계 UI만 숨겨진다.

1. Vercel Marketplace에서 **Upstash for Redis**를 프로젝트에 연결한다.
2. `KV_REST_API_URL`, `KV_REST_API_TOKEN`이 프로젝트 환경 변수에 추가되었는지 확인한다.
3. 환경 변수를 적용하도록 다시 배포한다.

Upstash에서 직접 만든 데이터베이스라면 `UPSTASH_REDIS_REST_URL`,
`UPSTASH_REDIS_REST_TOKEN`도 사용할 수 있다. 로컬 키 이름은 `.env.example`을 참고한다.

- 방문자는 1년 동안 유지되는 무작위 HttpOnly 쿠키를 기준으로 근사 집계한다.
- Redis에는 쿠키 원문 목록이나 IP를 저장하지 않으며 HyperLogLog 카운터만 유지한다.
- `Do Not Track`이 켜진 브라우저는 집계하지 않고 공개 수치만 조회한다.
- 상세 조회수는 기념일 id별로 누적되며 홈의 관심도 TOP 5에 반영된다.

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
