# 계획서 — 링크 미리보기 이미지 전면 적용 + "우리 N주년은 무슨 날?"

작성 2026-10-11 · 대상 브랜치 `feat/og-previews-together` (main 4bb7eac 기준)

## 0. 배경과 목표

생일 탭 링크가 트위터에서 퍼지며 일 방문자가 900명까지 올랐다. 그런데 현재 사이트의
링크 미리보기는 **모든 페이지가 같은 `og-cover.png`** 이다.

| 페이지 | 현재 og:title | 현재 og:image | 문제 |
|---|---|---|---|
| `/birthday?date=..&pick=..` (공유 링크) | 생일 탭 공통 문구 | 공통 커버 | 결과(“내 생일은 ○○의 날”)가 타임라인에 안 보임 |
| `/day/MM-DD`, `/day/MM-DD/slug` (2,100여 개) | 페이지별 ✅ | 공통 커버 | 이미지가 전부 같음 |
| `/calendar` `/export` `/popular` | **홈 문구** (rewrite→index.html) | 공통 커버 | 제목조차 홈과 같음 |
| `/` `/birthday` | 페이지별 ✅ | 공통 커버 | — |

목표

1. **모든 공개 페이지가 그 페이지 전용 미리보기 이미지·제목·설명**을 갖는다.
2. **생일 공유 링크**(이미 퍼진 쿼리형 URL 포함)는 결과가 담긴 카드로 미리보기 된다.
3. 같은 구조(날짜 입력 → 나만의 결과 → 카드 공유)의 새 기능 **“우리 N주년은 무슨 날?” (`/together`)** 을 추가한다.
4. 사람 방문자의 경험·성능·SEO(색인 URL, canonical)는 바뀌지 않는다.

비목표: 자유 텍스트(이름 등) 입력, 로그인, 통계 대시보드 변경, 기념일 데이터 추가.

## 1. 아키텍처

```
                ┌───────────── 사람 ─────────────┐
/birthday?…  ──►│ 정적 dist/birthday/index.html (SPA) │  (변경 없음)
/together?…     └────────────────────────────────┘
                ┌──────── 링크 미리보기 봇 ────────┐
             ──►│ vercel.json rewrite (UA 조건)     │──► /api/share-meta  → 결과별 OG HTML
                └────────────────────────────────┘
/day/…, /calendar … 정적 프리렌더 HTML ── og:image ──► /api/og?…  (동적, CDN 캐시)
/, /calendar, /export, /popular, /birthday, /together ── og:image ──► /og/*.png (빌드 산출 정적 PNG)
```

### 1-1. 이미지 렌더러 (`server/og/`)
- `satori` + `@resvg/resvg-js` (이미 설치·로컬 스모크 테스트 통과: 1200×630, 약 1초).
  `@vercel/og` 1.0.3 은 Node ESM 에서 `Dynamic require of "fs"` 로 실패해 제외.
- 폰트: Noto Serif KR(제목, 700) + Noto Sans KR(라벨, 500/700). 가변 폰트는 satori 가
  못 읽으므로 **정적 인스턴스 → 서브셋**한 TTF 를 `server/og/fonts/` 에 커밋(OFL 사본 동봉).
  - 원본: `tools/og/fonts-src/*-VF.ttf` (gitignore), venv: `tools/og/.venv` (fonttools 설치됨, gitignore)
  - 생성기: `tools/og/build_fonts.py` — 서브셋 대상 = 모든 기념일 `displayName()` + 카테고리
    레이블 + 렌더러 고정 문구 + ASCII/숫자/기호. 결정적 출력.
  - `name` 의 원어 괄호(日本語 등) 중 일부 글자(温焼読銭)는 Noto KR 에 없다 →
    이미지에는 반드시 `displayName()` 을 쓴다(괄호 원어 제거).
  - **테스트가 글리프 누락을 잡는다**: 모든 displayName + 고정 문구의 글자가 서브셋 cmap 에
    있는지 검사, 실패 시 “`tools/og/build_fonts.py` 를 다시 실행” 안내.
- 템플릿(순수 함수, satori element 객체 반환 — JSX 미사용):
  `birthday` · `together` · `detail` · `hub` · `page`(정적 페이지용). 디자인은
  `ShareCard.vue` 의 종이색(paper-200 `#f3ede0`)·잉크(`#1f1d1a`)·액센트(`#8b2c2c`)·우표 모티프·
  링 장식을 1200×630 가로형으로 옮긴다. 제목 길이에 따라 폰트 크기 단계 조절, 2줄 초과 시 말줄임.
  하단에 `annical.me` 표기.

### 1-2. `/api/og` (Vercel Node 함수)
- 쿼리(allowlist, 그 외 키가 있으면 400):
  - `kind=detail&date=MM-DD&slug=…` → routes.json 으로 검증
  - `kind=hub&date=MM-DD`
  - `kind=birthday&date=MM-DD&pick=<id>[&year=YYYY]` → pick 이 그 해 그 날짜에 실제로 발생하는지 검증
  - `kind=together&m=d100|y1…&date=YYYY-MM-DD&pick=<id>` (date = 마일스톤 날짜)
  - `pick` 없거나 그날 기념일이 없으면 “이날의 이야기” 폴백 카드
- 검증 실패 → 404(본문 없음). GET/HEAD 외 405. 쿼리 길이 상한.
- 응답: `image/png`, `Cache-Control: public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800`,
  ETag. 정규화된 키별 `BoundedCache`(server/boundedCache.ts) 메모리 캐시.
- 폰트 로드: `new URL('../server/og/fonts/…', import.meta.url)` + vercel.json
  `functions.includeFiles` 로 번들 포함 보장.
- URL 생성은 공용 함수 `ogImageUrl(…)`(src/seo/og.ts) 하나로 — 프리렌더·SPA·share-meta 가 공유.
  `OG_VERSION` 상수를 쿼리 `v` 로 붙여 디자인 변경 시 캐시 무효화.

### 1-3. 정적 페이지 이미지 (`public/og/*.png`)
- `npm run og:static` → `home, calendar, export, popular, birthday, together` 6장을 렌더러로 생성해 커밋.
- 기존 `og-cover.png` 는 404 등 폴백으로 유지.

### 1-4. 프리렌더/메타 보강
- `tools/prerender/plugin.ts`
  - 상세/허브: `og:image` → 각 `/api/og` URL, `og:image:width/height/alt`, `twitter:image(:alt)` 추가.
  - **`/calendar`, `/export`, `/popular`, `/together` 도 `/birthday` 처럼 정적 HTML 로 프리렌더**
    (라우터 meta 의 title/description 을 단일 출처로 공유) → vercel.json 의 해당 rewrite 제거.
  - 홈 `index.html` 도 `/og/home.png` 로.
- `src/seo/head.ts` — SPA 내비게이션 시에도 같은 og:image 를 넣는다(라우트 meta 에 `ogImage`).
- 정적 페이지 메타 문구는 한 곳(`src/seo/pages.ts` 등)에 모아 라우터·프리렌더가 공유.

### 1-5. 공유 링크용 봇 메타 (`/api/share-meta`)
- vercel.json rewrite: `source: /birthday` 와 `/together`, `has: [{type: header, key: user-agent,
  value: <미리보기 봇 정규식>}]` → `/api/share-meta?page=birthday|together` (원 쿼리 유지).
  - 정규식 대상: Twitterbot, facebookexternalhit, Facebot, kakaotalk-scrap, Slackbot,
    Discordbot, TelegramBot, LinkedInBot, WhatsApp, Line, Pinterest, redditbot, Bluesky,
    Mastodon, Iframely, Embedly, SkypeUriPreview, Applebot. **Googlebot/Yeti 등 검색 크롤러는 제외**
    (검색엔진에는 사람과 같은 HTML). 대소문자 변형은 정규식에 명시.
  - 정규식은 `src/seo/previewBots.ts` 에 원본을 두고, 테스트가 vercel.json 값과 동일한지 확인 +
    샘플 UA 표로 매칭/비매칭 검증.
- 응답 HTML: title/description/og:*/twitter:* (결과별), `canonical` = `/birthday`·`/together`,
  `robots: noindex`, 본문에 h1·설명·SPA 링크. 모든 값 HTML 이스케이프. 잘못된 쿼리 → 해당 페이지의
  일반 메타로 폴백(200).
- 예: `og:title` “내 생일 10월 11일은 소시지 피자의 날 | 기념일 도감”,
  description = 그 기념일 origin 첫 문장 요약.
- 이미 퍼진 기존 쿼리형 생일 링크도 URL 변경 없이 혜택을 받는다.

## 2. “우리 N주년은 무슨 날?” (`/together`)

### 사용자 흐름
1. 시작한 날(YYYY-MM-DD) 입력 — “처음 만난 날·사귄 날·결혼한 날 무엇이든”.
2. 결과: **다가오는 마일스톤** 강조(D-n) + 이후 5개 + 최근 지난 2개.
   각 마일스톤 = 라벨(100일/1주년…) · 날짜(요일) · 그날의 기념일 목록.
3. 기념일 하나를 고르면 카드(ShareModal 재사용) + 공유 링크
   `/together?start=YYYY-MM-DD&m=d100&pick=<id>`.
4. “그날의 이야기 더 읽기 →” 상세 페이지 링크, “내 생일은?” 교차 CTA.

### 규칙 (순수 함수 `src/features/together/milestones.ts`, 테스트 필수)
- N일: **시작일을 1일로 센다** (100일 = 시작일 + 99일). 화면에 명시.
- 마일스톤 집합: 100·200·300·400·500·600·700·800·900·1000·1500·2000·2500·3000·4000·5000·…·10000일 + 1~50주년.
- N주년: 같은 월·일. 시작일이 2월 29일이면 평년의 주년은 2월 28일(명시).
- 시작일 허용 범위: 1950-01-01 ~ 오늘(KST, `todayInSiteZone`). 미래 날짜는 거부.
- 날짜별 기념일은 `store.onDate(year, m, d)` (생일 탭과 같은 해석, `isYearSupported` 밖의
  해는 고정일 기념일만).
- 같은 날짜에 두 마일스톤이 겹치면 한 항목으로 합쳐 라벨 병기.

### 화면/내비
- `src/features/together/views/TogetherView.vue` (+ `together.css`), 생일 탭과 같은 톤·컴포넌트 재사용.
- 헤더·하단 메뉴에 “우리의 날” 추가, 홈 피드와 생일 결과 하단에 교차 링크.
- `ShareCard.vue` / `share` store / `sharePost.ts` 에 together 컨텍스트 추가
  (헤더 “우리의 발견”, 리드 “우리 100일,”, 메시지 “우리 100일은 6월 21일, ○○의 날이래. …”).
- 사이트맵에 `/together` 추가, 프리렌더 정적 HTML.

## 3. 보안·운영 원칙
- 자유 텍스트를 이미지·HTML 에 넣지 않는다(브랜드 이미지 악용 방지). 모든 입력은 날짜·id allowlist.
- `/api/og` 키 공간은 데이터로 유한 → CDN 캐시로 비용 상한.
- 기존 URL·slug·canonical 불변(CLAUDE.md 원칙). CSP 변경 불필요(이미지는 크롤러가 직접 받음).
- 새 의존성: `satori`, `@resvg/resvg-js` 만.

## 4. 검증 기준 (완료 정의)
- `npm run verify` (slug 검사 + build + api 타입체크 + 테스트) 통과.
- 새 테스트: 마일스톤 계산(1일 기준, 윤일, 경계), og 쿼리 파싱/검증, share-meta 이스케이프·폴백,
  봇 정규식 ↔ vercel.json 일치, 글리프 커버리지, 렌더 스모크(PNG 시그니처·1200×630),
  프리렌더 결과물의 페이지별 og:image(상세·허브·정적 페이지).
- 로컬 `vercel dev` 에서: `curl -A Twitterbot '/birthday?date=10-11&pick=…'` → 결과별 메타,
  일반 UA → SPA 쉘, `/api/og?...` → PNG. 샘플 이미지 육안 검수(글자 깨짐·넘침 없음).
- 브랜치 push → Vercel 프리뷰에서 동일 확인. 확인 후 main 머지(=프로덕션 배포)는 사용자 승인 후.
- 작업 중 띄운 dev 서버·백그라운드 프로세스는 모두 종료.

## 5. 작업 순서 (Codex 위임 단위)
1. 폰트 생성기 + 렌더러 + `/api/og` + 정적 PNG + 테스트
2. 프리렌더/head 메타 보강 + 정적 페이지 프리렌더 + vercel.json
3. `/api/share-meta` + 봇 rewrite + 테스트
4. `/together` 기능 + 공유 카드 연동 + 내비/사이트맵 + 테스트
5. README 갱신, `npm run verify`


## 구현 메모

- Vercel은 rewrites보다 파일시스템을 먼저 확인하므로 생일·함께 HTML을 `dist/_pages/{birthday,together}.html`로 옮기고 봇 rewrite 뒤 일반 요청 폴백을 둔다(`/_pages/*`는 noindex·사이트맵 제외).
- 후속 폴리시에서 `/api/og`의 `v`는 `/^[0-9a-z]{1,8}$/` 형식만 검사한다(잘못된 형식은 400).
  구버전 HTML도 이미지를 받을 수 있고, 메모리 키·렌더는 현재 `OG_VERSION`으로 정규화한다.
  디자인·폰트 변경에 맞춰 버전을 2로 올렸다.
- 페이지 카드는 빈 날짜·라벨 행을 없애고 제목 아래 부제를 표시한다. 홈 부제는
  `세계 곳곳의 특이한 기념일, 매일 하나씩`으로 바꿔 푸터 문구를 반복하지 않는다.
  허브는 이름 최대 3개를 ` · `로 연결하고 `외 N개`를 보존해 두 줄로 제한한다.
  이야기 수는 날짜 행에 유지하고, 0개인 날짜는 `아직 이름 붙지 않은 하루`로 표시한다.
- OG 전용 `ogDisplayName()`은 중첩된 원어 괄호를 제거하되 한글 괄호는 남긴다.
  모든 이미지 제목·허브 이름·공유 메타 제목에 적용하며 SEO `displayName()`은 그대로다.
  정적 페이지를 포함해 생일·함께 카드의 우표는 각각 `생일`·`우리`, 그 외는 `하루`다.
- 폰트 서브셋은 새 문구·OG 이름·모든 태그를 포함해 재생성하고 정적 PNG 6장도 갱신한다.
  글리프 테스트에는 copy.json 전체와 실제 페이지·허브 목록·마일스톤 템플릿 출력을 포함한다.
  샘플 기본 경로는 gitignored `tmp/og-samples/`, 재정의는 `--out <dir>`이다.
  11월 11일의 4개 이상 허브와 홈을 추가해 샘플은 6장이다.
  TogetherView의 computed `window`는 동작 변경 없이 `timeline`으로 바꿨다.
  후속 검증은 `npm run verify` 전체 163개 테스트 통과, 정적 6장·샘플 6장 육안 검사 완료다.
  샘플은 `/Users/csk200387/.hermes/cache/scratch/og-samples/`에 생성했다.
  이번 폴리시는 파일만 편집했으며 서버·네트워크·커밋 작업은 실행하지 않았다.
- 상세·허브 OG 쿼리에 검증된 `year`를 추가했다(1950~2100).
  같은 URL에 1년 CDN 캐시를 걸면 새해의 비고정 기념일 이미지가 전년도 날짜를 유지하므로,
  공용 URL 생성기가 서울 기준 연도를 포함한다. 프리렌더 기준 연도도 서울 시계로 통일했다.
  기존 페이지 URL·slug·canonical은 그대로다.
- 마일스톤 순수 함수는 together OG 입력 검증이 먼저 필요해 1단계에서 작성했고,
  4단계에서 화면·공유 연동과 계산 테스트를 마쳤다.
- 초기 구현 당시 `.git`은 읽기 전용이라 `git add`/`git commit`이 `index.lock: Operation not permitted`로
  실패했다. 작업 파일과 정적 PNG는 생성했고, §5 순서의 변경을 scratch에 단계별 바이너리 패치로 보관했다.
  커밋·push·merge는 실행되지 않았다.
- 로컬 포트 바인딩도 샌드박스에서 거절되어 HTTP/브라우저·Vercel rewrite 실동작 확인은 보류했다.
  서버를 띄우지 않고 두 API 핸들러를 직접 테스트했고, 동적 샘플도 `/api/og` 핸들러 경로로 생성·육안 확인했다.
  Vercel 프리뷰 확인은 사용자의 push 금지 지시에 따라 실행하지 않았다.
