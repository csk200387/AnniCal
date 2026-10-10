# [기념일 도감](https://www.annical.me/)

[![AnniCal — 평범한 하루에, 기념할 이유 하나. 오늘의 발견·기념일 달력·생일 카드·월별 인기 순위](docs/images/annical-banner.png)](https://www.annical.me/)

기념일 도감은 세상의 다양하고 흥미로운 기념일을 날짜별로 기록하고 발견하는 웹앱.
전 세계 1,734개 기념일을 13개 카테고리로 분류해 피드·달력·캘린더 연동으로 제공한다.

## 주요 기능

- **오늘의 기념일 피드** — 오늘 날짜의 기념일을 카드 형태로 점진 로딩
- **월간 달력** — 월별로 기념일을 달력에 표시 (모바일: 색상 점 표시), 이름·태그 검색 지원
- **캘린더 연동** — 카테고리 선택 후 `.ics` 다운로드 또는 구독 URL로 자동 업데이트
- **공유** — 기념일 카드를 이미지로 저장·공유
- **공개 통계** — 오늘·누적 익명 방문자와 전체 페이지뷰 표시
- **내 생일의 발견** — 생일과 같은 날의 기념일을 찾아 카드 이미지·링크로 공유
- **우리의 날** — 시작한 날부터 100일·N주년을 계산하고 그날의 기념일을 카드·링크로 공유
- **링크 미리보기** — 모든 공개 페이지 전용 OG 이미지와 생일·우리의 날 공유 결과 카드
- **관심도 순위** — 월별 TOP 20·지난달 기록·전체 누적 순위 조회

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
- **satori + @resvg/resvg-js** — 서브셋 한글 폰트로 서버·빌드에서 OG PNG 생성
- **Vercel** — 프리렌더 정적 호스팅 + Node 서버리스 API
- **Upstash Redis** — 익명 방문자·페이지뷰·기념일 관심도 집계

## 시작하기

```bash
npm install
npm run dev         # 개발 서버
npm run type-check  # 타입 체크
npm run build       # 프로덕션 빌드
```

## URL 구조

배포 기준 기본 URL은 `https://www.annical.me`이다.

```text
https://www.annical.me
├── /                              # 오늘의 기념일 피드
├── /calendar                      # 월간 달력·검색
├── /export                        # .ics 다운로드·캘린더 구독
├── /popular                       # 월별 관심도 순위
├── /birthday                      # 내 생일의 발견 (?date=MM-DD&year=YYYY&pick=id)
├── /together                      # 우리의 날 (?start=YYYY-MM-DD&m=d100|y1…&pick=id)
├── /day/:date                     # 날짜별 기념일 허브 (:date = MM-DD)
│   └── /:slug                     # 기념일 상세
├── /api
│   ├── /calendar                  # 캘린더 구독용 ICS 피드
│   ├── /stats                     # 익명 방문·조회 통계
│   ├── /feedback                  # 피드백 접수
│   ├── /og                        # 검증된 날짜·기념일의 1200×630 PNG
│   └── /share-meta                # 미리보기 봇용 공유 결과 HTML
├── /sitemap.xml                   # 빌드 시 생성되는 사이트맵
├── /robots.txt                    # 크롤러 정책
└── 그 외 경로                     # noindex 404 페이지
```

| 경로 | 방식 | 설명 |
|---|---|---|
| `/` | 정적 진입점 + SPA | 오늘 날짜의 기념일과 관심도 순위를 표시한다. |
| `/calendar` | 프리렌더 + SPA | 월별 달력에서 이름·태그로 기념일을 찾는다. |
| `/export` | 프리렌더 + SPA | 선택한 카테고리·그룹으로 `.ics`를 만들거나 구독 URL을 발급한다. |
| `/popular` | 프리렌더 + SPA | 월별 관심도 순위와 지난 기록을 표시한다. |
| `/birthday` | 프리렌더 + SPA / 봇 rewrite | 생일 결과를 찾고 공유한다. 미리보기 봇은 결과 메타를 받는다. |
| `/together` | 프리렌더 + SPA / 봇 rewrite | 시작일에서 다가오는 마일스톤과 그날의 기념일을 찾는다. |
| `/day/:date` | 프리렌더 | `MM-DD` 형식의 유효한 날짜 366개를 날짜 허브로 생성한다. 예: `/day/03-14` |
| `/day/:date/:slug` | 프리렌더 | `routes.json`에 등록된 기념일 상세 페이지다. 예: `/day/03-14/pi-day` |
| `/api/calendar` | Vercel Function | `GET`·`HEAD` 요청에 `text/calendar` 형식으로 응답한다. |
| `/api/stats` | Vercel Function | `GET`으로 공개 통계를 조회하고 `POST`로 페이지뷰를 기록한다. |
| `/api/og` | Vercel Node Function | `GET`·`HEAD`, 날짜·기념일 allowlist로 검증한 PNG와 ETag를 반환한다. |
| `/api/share-meta` | Vercel Node Function | `GET`·`HEAD`, 결과별 OG/Twitter HTML. canonical은 쿼리 없는 페이지이며 noindex다. |

상세 경로는 `src/data/routes.json`이 관리하며 `npm run check:slugs`로 데이터와의 일치 여부를 검사한다. `annual-nth-weekday`처럼 실제 날짜가 해마다 달라지는 기념일도 검색 색인을 유지하도록 URL의 `:date`는 기준 연도(2026년) 값으로 고정한다. 화면에 표시되는 날짜와 날짜 허브 소속은 현재 연도의 실제 발생일을 계산해 사용한다.

빌드 시 날짜 허브 366개와 기념일 상세 1,734개를 정적 HTML로 만들고 사이트맵에도 포함한다. `/calendar`·`/export`·`/popular`·`/birthday`·`/together`도 전용 정적 HTML을 생성한다. 미리보기 봇의 생일·우리의 날 요청만 `/api/share-meta`로 rewrite하며, 등록되지 않은 경로는 `404.html`로 응답한다.

## OG 이미지·공유 메타 구조

`src/seo/pages.ts`의 정적 메타는 라우터·프리렌더·봇 폴백이 공유한다. 이미지 URL은
`src/seo/og.ts`의 `ogImageUrl()`만 생성하며 `OG_VERSION`을 `v` 쿼리로 붙인다.
상세·허브 이미지에는 기준 `year`도 넣어, 새해에 전년도 발생일 이미지가 CDN에 남지 않게 한다.
`/api/og`는 `v`가 영문 소문자·숫자 1~8자면 구버전도 받으며 렌더·메모리 캐시 키는
현재 `OG_VERSION`을 사용한다. 그 외 버전 형식은 400으로 거절한다.
canonical과 기존 상세 URL의 `urlDate`·slug는 바뀌지 않는다.

- `/`·`/calendar`·`/export`·`/popular`·`/birthday`·`/together`: `public/og/*.png` 6장.
- 상세·허브와 공유 결과: `/api/og?kind=detail|hub|birthday|together&…`의 1200×630 PNG.
  이미지·공유 메타 제목은 OG 전용 `ogDisplayName()`으로 중첩된 원어 괄호까지 제거하며,
  한글 괄호와 기존 SEO의 `displayName()`은 유지한다. 이미지 제목은 두 줄까지 표시한다.
  허브는 제목 아래 기념일 이름 최대 3개와 `외 N개`를 두 줄 안에 표시하고,
  날짜 행에 전체 이야기 수를 둔다. 빈 날짜에는 `아직 이름 붙지 않은 하루`를 표시한다.
  정적 페이지는 날짜 행 없이 제목 아래 부제를 둔다. 자유 텍스트는 받지 않는다.
- `/birthday?…`·`/together?…`: 사람·검색 크롤러는 프리렌더 SPA를 받는다.
  `src/seo/previewBots.ts`의 미리보기 봇만 Vercel UA 조건으로 `/api/share-meta`에 연결된다.
  공유 결과 HTML은 모든 값을 이스케이프하고 쿼리 없는 canonical·noindex를 사용한다.
  잘못된 입력은 일반 페이지 메타로 폴백한다.
- 동적 이미지: CDN 1년, 브라우저 1일, ETag, 인스턴스 LRU 최대 64개 / 16 MiB.
  공유 HTML: 서울 자정까지 최대 1시간, `Vary: User-Agent`, LRU 최대 128개 / 2 MiB.
  `vercel.json`의 `includeFiles`가 서버 폰트 포함을 보장한다.

이미지·폰트·문구를 바꾸면 `OG_VERSION`을 올리고 정적 PNG를 다시 생성한다.

```bash
npm run og:static   # public/og/*.png 생성 (저장소에 포함)
npm run og:samples  # tmp/og-samples/에 샘플 6장 (gitignored)
npm run og:samples -- --out /path/to/review  # 출력 폴더 지정
npm run verify     # slug 검사·빌드·API 타입 검사·전체 테스트
```

폰트는 Noto Serif KR 700과 Noto Sans KR 500/700의 정적 서브셋이다.
원본 가변 TTF를 `tools/og/fonts-src/NotoSerifKR-VF.ttf`와 `NotoSansKR-VF.ttf`에 두고,
fonttools가 설치된 `tools/og/.venv`에서 다음 명령으로 재생성한다(Node 22.18+ 필요).

```bash
tools/og/.venv/bin/python tools/og/build_fonts.py
npm run og:static
```

원본·venv는 gitignored이고, `server/og/fonts/`의 TTF 3장과 OFL 사본만 저장소에 포함한다.
생성기는 실제 `ogDisplayName()`·모든 태그·카테고리·`server/og/copy.json`·ASCII에서 글자 집합을 만들며
출력 타임스탬프를 고정한다. 테스트는 파이썬 없이 TTF cmap을 검사해 글리프 누락을 잡는다.
실제 페이지·허브 이름 목록·모든 마일스톤의 템플릿 출력도 글리프 검사에 포함한다.

`/together`는 시작일을 1일로 센다(100일 = +99일). 윤일 시작의 평년 주년은 2월 28일이다.
1950년 1월 1일부터 서울 기준 오늘까지 입력할 수 있고, 계산 자료 범위 밖 연도는 고정일
기념일만 표시한다. 다가오는 하나·이후 다섯·최근 지난 둘을 제공하며 같은 날짜는 합친다.

## 디렉토리 구조

```text
.
├── api/                              # Vercel 서버리스 함수
│   ├── calendar.ts                   #   캘린더 구독 피드 (/api/calendar)
│   ├── stats.ts                      #   공개 방문·조회 통계 (/api/stats)
│   ├── og.ts                         #   동적 PNG (/api/og)
│   └── share-meta.ts                 #   공유 결과 HTML (/api/share-meta)
├── server/
│   ├── og/                           # 검증·템플릿·렌더러·정적 서브셋 TTF·OFL
│   ├── shareMeta.ts                  # 공유 링크 검증·이스케이프 HTML
│   └── boundedCache.ts               # 개수·바이트 제한 LRU
├── public/                           # 정적 파일, og/에 페이지 PNG 6장
├── src/
│   ├── assets/                       # 글로벌 CSS
│   ├── components/                   # 도메인 공통 UI
│   │   ├── card/                     #   기념일 카드
│   │   ├── common/                   #   배지 등 원자 컴포넌트
│   │   ├── layout/                   #   AppShell, Header, Footer
│   │   └── share/                    #   공유 카드·모달
│   ├── composables/                  # 전역 재사용 Composition 함수
│   ├── data/                         # 정적 JSON 데이터베이스
│   │   ├── anniversaries/            #   01.json … 12.json (월별, 총 1,734건)
│   │   ├── categories.json           #   13개 카테고리
│   │   ├── groups.json               #   교차 선택 그룹
│   │   ├── observances.json          #   기념일 원본·보조 데이터
│   │   └── routes.json               #   기념일 id ↔ URL 날짜·slug 매핑
│   ├── features/                     # 도메인 기능 단위
│   │   ├── birthday/                 #   내 생일의 발견
│   │   ├── together/                 #   마일스톤 계산·우리의 날
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
│   ├── og/                           # 폰트 서브셋·정적 PNG·검토 샘플 생성
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

## 보안 및 운영 제한

- 통계 쓰기는 IPv4 주소 또는 IPv6 `/64`별 **60초에 120회**, 서비스 전체 **60초에 3,000회**까지 허용한다. 쿠키를 바꿔도 한도를 공유하며 초과하면 `429`와 `Retry-After`를 반환한다. 공유 IP 사용자가 많은 환경에서는 `api/stats.ts`의 상수를 실제 트래픽에 맞춰 조정한다.
- 요청 IP는 Vercel(`VERCEL=1`)에서 플랫폼이 덮어쓴 `X-Forwarded-For`만 신뢰하고, 다른 환경에서는 소켓 주소를 사용한다. 다른 리버스 프록시로 이전할 때는 신뢰할 프록시를 명시적으로 검증해야 한다. Redis에는 원문 IP 대신 서버 비밀값으로 HMAC 처리한 제한 키를 60초간 보관한다.
- 캘린더 인스턴스 캐시는 최대 **32개 / 문자열 보관 비용 8 MiB**로 제한한다. 초과하면 가장 오래 사용하지 않은 항목부터 퇴출하며, 응답 자체는 계속 제공한다.
- JSON 본문은 파싱 여부에 관계없이 바이트 수를 제한한다. 통계는 **1,024바이트**, 피드백은 한글 2,000자를 지원하도록 **8,000바이트**이며, 알 수 없는 필드도 거절한다.
- CSP는 강제 적용한다. 공유 이미지의 웹폰트 임베딩에 필요한 Google Fonts 및 `data:`/`blob:` 통신만 추가로 허용한다. Vercel Analytics 프로덕션 스크립트·수집 요청은 같은 출처를 사용한다. Preview Toolbar 등 새 외부 기능을 켜면 CSP 호환성을 별도로 확인한다.
- GitHub App 토큰은 지정한 피드백 저장소 한 개의 Issues 쓰기 권한으로 축소해 발급한다. App 설치 자체도 비공개 저장소 한 개에만 허용한다.
- 로컬 `.env` 파일은 `chmod 600`으로 보호하고 생성 전에 `umask 077`을 설정한다. `.gitignore`는 압축·복사·백업에 포함되는 비밀파일까지 막지 않는다.

GitHub Actions의 `Secret scan`은 Gitleaks 8.30.1로 전체 Git 이력을 검사한다. PR과 push에 실행되며 비밀값은 로그에서 마스킹한다. 로컬 커밋 전 검사도 사용하려면 `pre-commit` 설치 후 아래 명령을 실행한다.

```sh
pre-commit install
pre-commit run gitleaks --all-files
```

`gitleaks` 훅은 staged diff를 검사한다. 기존 이력까지 수동 검사하려면 Gitleaks 8.30.1을 설치한 뒤 `gitleaks git --redact --log-opts="--all" .`을 실행한다. GitHub 서버의 push protection과 브랜치 필수 검사 설정은 저장소 관리 화면에서 활성화해야 한다.

보안 수정 내역과 검증 범위는 [보안 조치 기록](docs/security/SECURITY_FIXES_2026-09-16.md)을 참고한다.

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
