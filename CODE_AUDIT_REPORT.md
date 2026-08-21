# AnniCal 코드·보안·성능 감사 보고서

- 감사일: 2026-08-21 (Asia/Seoul)
- 기준 커밋: `34372dd` (`main`)
- 검토 범위: `src/`, `api/`, `tools/`, 빌드·배포 설정, Node/Python 의존성
- 제외 범위: PDF와 기념일 서술 내용의 사실 검증, 실제 Vercel 인프라 침투 테스트, 기존 미추적 자료 `tools/research/`

## 결론

현재 브라우저에서 즉시 원격 코드 실행으로 이어지는 악성 데이터나 비밀키 노출은 발견되지 않았다. 다만 운영 전에 바로 고쳐야 할 문제가 있다.

가장 위험한 결함은 데이터 검수기다. 현재 상태에서 Inspector로 아무 항목이나 저장하거나 삭제하면 `annual-tabulated` 37건이 모두 `01.json`으로 이동한다. 그 다음으로는 공개 캘린더 API의 비용 증폭·캐시 우회, 상대 날짜 기념일 8건의 잘못된 ICS 반복 규칙, 전 화면의 전체 데이터 로딩, 2026년 기준 URL 날짜를 실제 날짜처럼 사용하는 문제가 중요하다.

권장 조치 순서는 다음과 같다.

1. Inspector 저장 기능을 임시 중단하고 `annual-tabulated` 처리와 저장 전 invariant 검사를 고친다.
2. 캘린더 API를 GET/HEAD로 제한하고 쿼리를 allowlist·정규화한 뒤 결과를 사전 생성하거나 캐시한다.
3. `annual-relative-to-holiday`를 단순 yearly RRULE이 아닌 연도별 RDATE로 생성한다.
4. 날짜·anchor·route·ICS를 검증하는 자동 테스트와 API 전용 타입 검사를 CI에 추가한다.
5. 의존성을 갱신하고 사용하지 않는 npm `ics` 패키지를 제거한다.
6. 화면별 최소 데이터만 로드하고 프리렌더 HTML을 hydration하거나 로딩 중 보존한다.

## 위험도 요약

| ID | 우선순위 | 영역 | 상태 | 요약 |
|---|---|---|---|---|
| F-01 | P0 | 데이터 무결성 | 현재 재현 | Inspector 저장 한 번으로 tabulated 37건이 1월로 이동 |
| F-02 | P1 | 보안·성능 | 외부 악용 가능 | 공개 ICS API가 요청당 약 184ms/1.04MB이며 캐시 우회가 쉬움 |
| F-03 | P1 | 정확성 | 현재 재현 | 상대 기념일 8건의 ICS가 2027년부터 틀림 |
| F-04 | P1 | 성능·UX | 현재 재현 | 모든 화면이 월 데이터 12청크를 전부 받고 프리렌더 본문을 지움 |
| F-05 | P1 | 정확성·SEO | 2027년부터 확대 | 2026 고정 URL 날짜가 비고정 기념일 79건의 실제 날짜로 노출 |
| F-06 | P1 | 안정성 | 잠재·편집기로 재현 | anchor 삭제·순환참조를 저장할 수 있어 런타임 실패 |
| F-07 | P1 | 정확성 | 현재 재현 | 열린 탭이 자정을 지나도 오늘·D-day·달력이 갱신되지 않음 |
| F-08 | P2 | 공급망 보안 | 현재 확인 | npm audit high 4건, 운영 트리 high 2건 |
| F-09 | P2 | XSS | 잠재 | 프리렌더 JSON-LD의 `</script>` 저장형 XSS |
| F-10 | P2 | 캘린더 보안 | 잠재 | CR/LF를 통한 ICS 속성·이벤트 주입 |
| F-11 | P2 | 기능 정확성 | 현재 재현 | 카테고리 0개 선택 구독이 전체 1,343건 구독으로 바뀜 |
| F-12 | P2 | 입력 검증 | 잠재·일부 현재 재현 | 존재하지 않는 날짜, 잘못된 5번째 요일, 윤일 이웃 오류 |
| F-13 | P2 | 빌드 보안 | 잠재 | 검증되지 않은 slug로 프리렌더 경로 이탈·HTML 속성 삽입 가능 |
| F-14 | P2 | 품질 보증 | 현재 확인 | 테스트·API 타입 검사·route 양방향 invariant가 빌드에 없음 |
| F-15 | P2 | 오류 처리 | 현재 재현 가능 | 청크 실패 시 빈 상세/거짓 “등록 없음”, soft 404에서 이전 head 잔존 |
| F-16 | P2 | 데이터 무결성 | 잠재 | 12파일 순차 덮어쓰기와 세션 snapshot으로 부분 저장·lost update 가능 |
| F-17 | P2 | 번들·CPU | 현재 측정 | 공유 기능 eager 포함, ICS 생성이 메인 스레드를 약 0.2초 점유 |
| F-18 | P2 | 계산 성능 | 현재 측정 | 달력 월 이동마다 56,406회 날짜 검사 |
| F-19 | P2 | 장기 정확성 | 2051년부터 | 표 범위 밖 음력 날짜를 2050 값으로 조용히 조작 |
| F-20 | P2 | UI 상태 | 현재 재현 | 월 이동 후 선택 날짜가 이전 달에 남음 |
| F-21 | P3 | 보안 강화 | 현재 확인 | CSP·frame-ancestors·nosniff 등 응답 헤더 없음 |
| F-22 | P3 | 캐시 효율 | 현재 확인 | 요청 시각 DTSTAMP 때문에 동일 데이터도 매번 다른 ICS |
| F-23 | P3 | 빌드·운영 | 현재 확인 | Python 버전 미고정, 정적 산출 증가, 문서 수치 불일치 |

## 검증 및 측정 결과

| 검사 | 결과 |
|---|---|
| `npm run type-check` | 통과 |
| `npm run build` | 통과, 상세 1,343 + 날짜 허브 366 = HTML 1,709개 |
| `python3 tools/slugs/generate_slugs.py --check` | 1,343건, 미해결·중복 ID·URL 충돌 0 |
| `npx tsc -p api/tsconfig.json --noEmit` | 실패: alias 설정 없이 `../src/**/*.ts` 전체를 포함해 다수 TS2307 발생 |
| `npm audit --json` | high 4, critical 0 |
| `npm audit --omit=dev --json` | high 2 (`nanoid`, `postcss`) |
| 현재 데이터 보안 검사 | `</script>`·CR/LF 페이로드 0, 비밀키 0 |
| sourceUrl | 1,285개 중 HTTPS 1,254개, 비 URL legacy slug 31개, HTTP 0 |

성능 측정은 Node 26 로컬 환경의 warm 실행 기준이며 실제 서버리스·모바일 성능과는 다를 수 있다.

| 항목 | 측정값 |
|---|---:|
| 월 데이터 Vite 청크 12개 | 993,977B raw / 288,550B gzip |
| main JS | 180,987B raw / 67,624B gzip |
| route 매핑 청크 | 109,770B raw / 19,601B gzip |
| 정적 `dist` | 약 15MB, HTML 본문 합 10,338,415B |
| 전체 ICS 응답 | 1,039,415B raw / 264,691B gzip |
| 전체 ICS 생성 | 평균 약 184ms, 관측 범위 176~209ms |
| 서버리스 모사 번들 | 약 1.50~1.70MB raw / 321~331KB gzip |
| 달력 한 달 계산 | 42 × 1,343 = 56,406 검사, 중앙값 약 13.7ms |
| 오늘 + 30일 피드 계산 | 약 4.1ms |

## 상세 발견 사항

### F-01. Inspector가 tabulated 37건을 모두 1월 파일로 이동

우선순위: **P0 / 즉시 수정**

근거:

- `tools/inspector/app.py:31-37`의 `DATE_TYPES`에 `annual-tabulated`가 없다.
- `tools/inspector/app.py:128-149`는 이 유형을 “알 수 없음”으로 표시한다.
- `tools/inspector/data_io.py:29-51`의 `month_of()`는 이 유형을 처리하지 않고 1월로 폴백한다.
- `tools/inspector/data_io.py:72-84`는 저장할 때 전체 목록을 다시 12개 파일로 나눠 모두 덮어쓴다.
- 저장·삭제 경로는 `tools/inspector/app.py:329-337`, `360-369`다.

현재 데이터로 읽기 전용 시뮬레이션한 결과, `annual-tabulated` 37건 모두 `month_of(...) == 1`이었다. 따라서 일반 고정일의 설명 한 줄만 수정해도 2~12월의 음력 명절·24절기가 `01.json`으로 이동한다. 앱의 날짜 계산은 계속 맞을 수 있어 문제가 늦게 발견되고, 월별 지연 로딩·데이터 관리가 동시에 깨진다.

개선안:

- `DATE_TYPES`, validator, `month_of`에 `annual-tabulated`를 추가한다.
- `observances.json`의 기준연도 발생일로 월을 결정한다.
- 알 수 없는 유형은 1월 폴백이 아니라 저장 자체를 거부한다.
- 쓰기 전에 “총 건수, ID 집합, 월 분류, anchor 무결성”을 dry-run 검증한다.
- 임시 디렉터리에 12파일을 모두 쓴 뒤 검증하고 원자적으로 교체한다.
- 이 결함이 수정되기 전에는 Inspector 저장/삭제를 사용하지 않는 것이 안전하다.

### F-02. 공개 ICS API의 비용 증폭과 캐시 우회

우선순위: **P1 / 보안·비용**

`api/calendar.ts:14-36`은 모든 HTTP 메서드에서 전체 데이터를 import하고 anchor Map을 다시 만든 뒤 동기 ICS 생성을 수행한다. `categories`는 길이·개수·허용값 제한이 없고, `cats.includes`를 항목마다 호출해 O(N×C)다. POST도 200과 전체 본문을 받고, 쿼리 순서·중복·알 수 없는 키·nonce를 바꾸면 CDN 캐시 키를 계속 늘릴 수 있다.

실측 전체 요청은 약 184ms CPU와 1.04MB raw 응답을 만들었다. 즉 반복 POST 또는 고유 쿼리는 서버리스 호출·CPU·egress를 직접 증폭할 수 있다.

개선안:

- GET/HEAD만 허용하고 나머지는 405 + `Allow`로 종료한다. HEAD는 본문을 만들지 않는다.
- 허용 쿼리 키를 `categories` 하나로 제한하고 길이·개수 상한을 둔다.
- 13개 category ID allowlist, 중복 제거, 정렬, canonical redirect/key를 사용한다.
- 필터는 `Set`으로 바꾼다.
- anchor 등록은 모듈 초기화 시 한 번만 수행한다.
- 기본 전체 feed는 빌드 시 정적 파일로 만들고, 조합 결과는 bounded LRU나 category별 VEVENT 조각으로 캐시한다.
- 결정적 ETag/Last-Modified와 조건부 요청, 필요 시 Vercel Firewall/rate limit을 적용한다.

### F-03. 상대 날짜 기념일의 ICS 반복 규칙이 틀림

우선순위: **P1 / 핵심 기능 정확성**

`src/utils/ics.ts:68-83`은 `annual-relative-to-holiday`를 무조건 `RRULE:FREQ=YEARLY`로 만든다. `src/utils/ics.ts:112-123`은 현재 연도의 계산 날짜를 DTSTART로 한 뒤 그 월·일을 매년 반복한다.

실제 Black Friday 출력은 다음과 같았다.

```text
DTSTART;VALUE=DATE:20261127
RRULE:FREQ=YEARLY
```

하지만 계산 함수가 반환한 실제 날짜는 2026-11-27, 2027-11-26이다. 생성된 RRULE은 2027-11-27로 반복하므로 하루 틀린다. 현재 상대 날짜 항목 8건 모두 영향을 받는다.

개선안:

- anchor의 연도별 occurrence를 계산해 지원 범위만큼 `RDATE;VALUE=DATE`로 나열한다.
- 표현 가능한 anchor라면 anchor 규칙과 offset을 안전하게 변환하되, 단순 yearly RRULE은 사용하지 않는다.
- 2026/2027/2028 결과를 포함한 golden ICS 테스트를 추가한다.
- `src/utils/ics.ts:89-95`의 무조건 catch-and-skip도 오류 목록을 반환하거나 빌드/관리자 경로에서 fail-fast하도록 바꾼다.

### F-04. 월별 분할이 실질적 지연 로딩이 아니며 프리렌더 본문도 사라짐

우선순위: **P1 / 사용자 체감 성능**

`src/services/anniversaryRepository.ts:10-12,24-29`은 glob으로 분할했지만 `Promise.all(Object.values(monthFiles))`로 항상 12개를 동시에 모두 가져온다. 호출자는 홈, 달력, export, 상세, 날짜 허브 모두 동일한 `store.load()`를 쓴다.

영향:

- 상세 한 건만 보는 사용자도 12요청, 약 288.6KB gzip의 데이터 JS, 1,343개 객체를 모두 파싱·보관한다.
- 월 파일 하나가 바뀌면 import map을 포함한 상위 JS 해시도 바뀌어 앱 셸 캐시가 무효화된다.
- `tools/prerender/plugin.ts:149-154`는 유용한 정적 본문을 넣지만 `src/main.ts:9-14`는 hydration이 아닌 `createApp().mount()`를 사용해 기존 DOM을 지운다.
- 상세/허브는 데이터 로딩 상태를 렌더하지 않아 저속망에서 정적 본문이 사라졌다가 다시 나타나거나, “등록 없음”이 잠깐 보일 수 있다.

개선안:

- `findByMonth`, `findByIds`, `loadMonths(Set)`와 월별 Promise 캐시를 만든다.
- 홈은 오늘~30일에 필요한 월, 달력은 보이는 앞·현재·뒤 월, 상세/허브는 필요한 ID/월만, export만 전체를 로드한다.
- 경량 색인(이름·날짜·카테고리)과 storytelling 본문을 분리한다.
- 데이터는 `public` JSON으로 분리해 콘텐츠 변경이 앱 JS 해시에 전염되지 않게 한다.
- 장기적으로 동일 Vue 트리를 SSG/SSR하고 `createSSRApp`으로 hydrate하며 route별 최소 Pinia state를 주입한다.

### F-05. 2026 고정 URL 날짜가 향후 실제 날짜와 섞임

우선순위: **P1 / 정확성·SEO**

`src/utils/anniversaryRoutes.ts:1-6`은 URL 안정성을 위해 비고정 기념일의 날짜를 2026년 occurrence로 고정한다. URL 안정성 자체는 합리적이지만, 이후 코드가 이 값을 canonical 식별자만이 아니라 실제 발생일과 날짜 허브 membership으로 사용한다.

- 허브: `src/features/day/composables/useDayPages.ts:74-86`
- 프리렌더 그룹: `tools/prerender/routes.ts:45-57`
- 제목·description: `src/seo/meta.ts:55-75`
- 정적 본문: `tools/prerender/plugin.ts:55-58`

현재 비고정 항목은 79건이다. 예를 들어 Mother’s Day route는 2026 기준 `05-10`이지만 실제 2027 날짜는 `05-09`다. 2027년에도 `/day/05-10` 페이지가 “5월 10일에 있는 기념일”로 이를 노출한다. Black Friday도 route `11-27`과 2027 실제 `11-26`이 어긋난다.

개선안:

- canonical 상세 주소를 날짜에서 분리한 `/anniversary/:slug` 형태로 바꾸는 것이 가장 명확하다.
- 날짜 허브는 선택 연도 또는 현재 연도의 `resolveOccurrence`로 membership을 만든다.
- 고정 URL을 유지한다면 페이지 제목·본문은 “올해 실제 날짜”와 날짜 규칙을 우선 표시하고, 고정 URL 날짜를 허브 분류에 사용하지 않는다.
- 기존 URL에는 redirect/canonical migration 계획을 둔다.

### F-06. Anchor 삭제·순환참조를 저장할 수 있음

우선순위: **P1 / 데이터·런타임 안정성**

Inspector는 상대 날짜 저장 시 anchor의 존재만 확인한다(`tools/inspector/app.py:136-144,289-297`). 삭제는 역참조 확인 없이 먼저 기록한다(`360-369`). 자기참조나 A→B→A 순환도 막지 않는다.

런타임 `src/utils/dateUtils.ts:112-127`은 방문 집합이나 깊이 제한 없이 재귀한다. anchor가 없으면 `63-79`에서 throw한다. Thanksgiving anchor를 삭제하면 현재 상대 항목 8건이 dangling 상태가 되고, 순환이면 stack overflow가 발생해 feed/calendar computed 전체가 실패할 수 있다.

개선안:

- 저장 전 외래키와 DAG 검증을 수행한다.
- 참조 중인 anchor 삭제는 차단하거나 명시적 cascade 확인을 받는다.
- `resolveOccurrence`에도 visited/depth guard를 둔다.
- 데이터 빌드 단계에서 모든 연도 규칙을 순회 검증한다.

### F-07. 열린 탭이 자정을 지나도 “오늘”이 갱신되지 않음

우선순위: **P1 / 핵심 화면 정확성**

`src/features/feed/composables/useTodayFeed.ts:18-28`의 computed 내부 `new Date()`는 Vue 반응형 의존성이 아니어서 첫 계산 뒤 캐시된다. `src/features/feed/views/FeedView.vue:55-64`, `src/components/layout/AppHeader.vue:6-10`, `src/features/calendar/composables/useMonthCalendar.ts:20-22`, `src/components/share/ShareCard.vue:24,39`도 setup 시점 날짜에 고정된다.

23:59에 탭을 열어 자정을 넘기면 날짜 헤더, 오늘 피드, D-day, 달력 today highlight와 “Today” 이동이 전날 상태로 남는다. 브라우저 local timezone을 사용하면서 ICS에는 Asia/Seoul을 선언하므로 해외 사용자와 서버 사이의 기준도 일관되지 않다.

개선안:

- 다음 Asia/Seoul 자정에 갱신되는 공용 reactive clock을 만든다.
- 백그라운드 탭 타이머 지연을 고려해 `visibilitychange` 때도 즉시 보정한다.
- 날짜 함수에 동일한 `now`와 timezone 정책을 주입한다.
- 자정·연말·DST가 있는 사용자 timezone 회귀 테스트를 추가한다.

### F-08. 알려진 취약점이 잠금 의존성에 존재

우선순위: **P2 / 공급망 보안**

2026-08-21 기준 npm 감사 결과는 high 4건이다.

| 패키지 | 현재 버전 | 위치 | 최소 권장 |
|---|---:|---|---:|
| `vite` | 6.4.2 | `package-lock.json:2173` | 6.4.3 이상 |
| `postcss` | 8.5.14 | `package-lock.json:1996` | 8.5.23 이상; dry-run은 8.5.26 제안 |
| `nanoid` | 3.3.12 | `package-lock.json:1930` | 3.3.18 이상 |
| `brace-expansion` | 2.1.0 | `package-lock.json:1447` | 2.1.4 이상 |

관련 공지:

- Vite: [GHSA-v6wh-96g9-6wx3](https://github.com/advisories/GHSA-v6wh-96g9-6wx3), [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff)
- PostCSS: [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp), [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849)
- Nanoid: [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv), [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8)
- brace-expansion: [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp), [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg), [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895)

Vite·PostCSS·brace-expansion은 주로 개발/빌드 환경이고, Nanoid는 현재 코드가 직접 호출하지 않아 배포 브라우저의 실제 원격 노출은 감사 등급보다 낮다. 하지만 빌드 머신과 개발 서버 보호를 위해 갱신해야 한다.

`package.json:17`의 npm `ics` 패키지는 소스에서 사용되지 않고 자체 `src/utils/ics.ts`만 사용한다. 이 미사용 패키지가 취약 Nanoid 설치 경로를 추가하므로 제거하는 편이 낫다. 갱신 후 전체 감사와 `--omit=dev` 감사를 다시 실행한다.

### F-09. 프리렌더 JSON-LD 저장형 XSS

우선순위: **P2 / 현재 데이터에는 페이로드 없음**

`tools/prerender/plugin.ts:89-95`는 데이터 기반 JSON-LD를 단순 `JSON.stringify`하고, `:149`에서 HTML `<script type="application/ld+json">` 문자열 안에 직접 삽입한다. JSON 문자열의 `</script>`는 HTML-safe하지 않아서 script 요소를 닫고 새 script를 실행할 수 있다.

Vue 런타임 경로인 `src/seo/head.ts:60-68`은 `textContent`를 사용해 안전하지만 프리렌더 경로는 별도다. 현재 1,343건에는 페이로드가 없으나, 외부 뉴스 요약이나 보강 JSON을 저장한 뒤 배포하는 콘텐츠 파이프라인 때문에 신뢰 경계가 존재한다.

개선안:

- JSON 직렬화 후 `<`, `>`, `&`, U+2028, U+2029를 유니코드 escape한다.
- 검증된 safe JSON serializer와 악성 `</script>` 회귀 테스트를 사용한다.
- 데이터 길이·제어문자 스키마 검증과 CSP를 함께 적용한다.

### F-10. ICS 속성·이벤트 주입

우선순위: **P2 / 현재 데이터에는 페이로드 없음**

`src/utils/ics.ts:14-20`의 TEXT escape는 단독 CR을 처리하지 않는다. UID(`:114`), 일부 RRULE 조각(`:74-78`), URL(`:129-133`)은 데이터 값을 raw property에 붙인다. 데이터에 CR/LF가 들어가면 `ATTENDEE`, `VALARM`, 추가 `VEVENT` 같은 줄을 삽입할 수 있다.

개선안:

- ID를 제한된 ASCII 정규식으로 강제한다.
- 월·순번·요일을 enum과 범위로 각각 검증한다.
- URL은 `new URL()`로 파싱해 HTTPS, 무자격증명, 무제어문자 조건을 만족한 정규 URL만 사용한다.
- 모든 개행은 `\r\n|\r|\n`으로 처리하고 UID/URL에도 RFC 5545 문맥에 맞는 검증·escape를 적용한다.
- CRLF 공격 문자열로 생성된 논리 줄이 늘지 않는지 테스트한다.

### F-11. “카테고리 해제” 후 전체 캘린더를 구독

우선순위: **P2 / 현재 재현**

`src/features/calendar-export/composables/useCalendarExport.ts:91-97`은 전체 선택과 0개 선택 모두 빈 query를 반환한다. API `api/calendar.ts:19-27`은 파라미터가 없으면 전체 데이터를 반환한다. 다운로드 버튼은 비활성화되지만 `src/features/calendar-export/views/ExportView.vue:130-160`의 복사·Google·Apple 구독 액션은 계속 활성이다.

개선안:

- 0개 선택 시 구독 URL을 `null`로 만들고 모든 구독 액션을 비활성화한다.
- API가 명시적 empty feed를 지원한다면 별도 canonical 표현을 사용하되, “파라미터 없음 = 전체”와 혼동하지 않는다.
- 0/1/전체 선택에 대한 UI·API 통합 테스트를 추가한다.

### F-12. 날짜 의미 검증 부족과 2월 29일 이웃 오류

우선순위: **P2 / 데이터 품질·라우팅**

- Inspector의 `tools/inspector/app.py:128-149,281-300`은 정규식만 확인해 `99-99`, `02-31`을 저장할 수 있다.
- `MM-5-DOW`에 실제 5번째 요일이 없는 경우도 JS `Date`가 다음 달로 normalize한다.
- `src/utils/anniversaryRoutes.ts:57-60`은 `02-31`과 `04-31`을 유효한 URL로 본다.
- `src/features/day/views/DateHubView.vue:17-28`과 `tools/prerender/plugin.ts:72-79`은 비윤년 2026을 기준으로 이웃을 계산한다. `/day/02-29`가 내부적으로 03-01로 normalize되어 next가 03-02가 된다.

개선안:

- 파싱 후 연·월·일 round-trip으로 실제 날짜인지 확인한다.
- URL은 윤년 2024의 366개 `MM-DD` ordinal 집합으로 검증하고 이웃도 그 순환 배열에서 찾는다.
- 잘못된 5번째 요일의 정책을 명시적으로 reject하거나 “마지막 요일”과 구분한다.
- 데이터 스키마 검증을 저장 전과 빌드 전 모두 실행한다.

### F-13. Slug 검증 부재로 프리렌더 경로 이탈·HTML 삽입 가능

우선순위: **P2 / 빌드 입력 오염 전제**

`tools/slugs/generate_slugs.py:157-165`는 override 값을 `slugify`하지 않는다. `tools/prerender/routes.ts:45-53`은 route 값을 검증하지 않고, `tools/prerender/plugin.ts:152-154`는 이를 `join(outDir, path, 'index.html')`로 쓴다. `../../..`가 들어간 slug는 `dist` 밖으로 정규화되어 저장소 파일을 덮어쓸 수 있다. 따옴표가 든 값은 `plugin.ts:37,68,141,145`의 링크·canonical·OG 속성에도 삽입된다.

현재 `routes.json`은 모두 정상 패턴이지만 방어가 없다.

개선안:

- 최종 slug를 `^[a-z0-9]+(?:-[a-z0-9]+)*$`로 강제한다.
- 날짜도 실제 유효한 `MM-DD`인지 검사한다.
- 출력 경로를 `resolve`한 뒤 반드시 `resolve(outDir) + path.sep` 아래인지 확인한다.
- URL segment는 encode하고 HTML attribute는 문맥별 escape한다.
- 위반 시 빌드를 즉시 실패시킨다.

### F-14. 테스트·API 타입 검사·route invariant가 빌드에 없음

우선순위: **P2 / 회귀 방지**

`package.json:7-12`에는 test와 lint가 없다. root `tsconfig.json:1-6`은 app과 node 설정만 참조해 `api/calendar.ts`를 검사하지 않는다. 별도 `api/tsconfig.json:1-13`은 alias 없이 `../src/**/*.ts` 전체를 포함해 단독 검사도 실패한다.

`tools/prerender/routes.ts:45-65`는 “route에 있는데 dataset에 없는 ID”만 검사하고 반대 방향은 검사하지 않는다. 신규 기념일은 stale `routes.json` 상태에서도 build가 성공해 상세·프리렌더·사이트맵·공유 링크에서 조용히 누락될 수 있다.

개선안:

- API 전용으로 실제 통과하는 tsconfig와 `type-check:api`를 만든다.
- build/CI에서 dataset ID와 route ID 집합의 정확한 일치를 검사한다.
- `generate_slugs.py --check`를 build 전 단계에 연결한다.
- 날짜 규칙, anchor DAG, 자정/timezone, ICS golden, 악성 JSON-LD/CRLF, 프리렌더 경로 containment 테스트를 추가한다.

### F-15. 데이터 로드 실패와 404가 잘못 표현됨

우선순위: **P2 / 안정성·SEO**

월 청크 하나가 실패하면 store는 error만 설정하고 `isLoaded=false`로 남는다(`src/stores/anniversaries.ts:18-35`). 상세는 `isLoading/error`를 렌더하지 않아 프리렌더 본문을 지운 뒤 빈 화면이 될 수 있다(`useDayPages.ts:60-63`, `DayDetailView.vue:17,59-64`). 허브는 실패를 정상 빈 목록으로 오인해 “등록된 기념일이 아직 없어요”를 표시한다.

또한 router의 dynamic head는 무조건 자동 갱신을 건너뛴다(`src/router/index.ts:81-86`). 유효 상세에서 잘못된 slug/date로 SPA 이동하면 body는 오류지만 이전 title·canonical·OG·JSON-LD가 남는다. catch-all route가 없고 Vercel이 SPA로 rewrite해 soft 404 200을 만든다.

개선안:

- loading/error/empty/not-found 상태를 분리하고 retry UI를 제공한다.
- route load 실패 시 가능한 한 프리렌더 정적 본문을 보존한다.
- invalid route에서 head를 기본값 + `noindex`로 reset한다.
- catch-all NotFound route를 추가하고 SSR/배포 계층에서 실제 404 상태를 반환한다.

### F-16. 데이터 쓰기가 원자적이지 않고 동시 편집을 잃을 수 있음

우선순위: **P2 / 편집 도구**

`tools/inspector/data_io.py:72-84`는 12파일을 차례로 직접 덮어쓴다. 중간 실패나 프로세스 종료 시 일부 파일만 새 상태가 된다. Gradio는 `tools/inspector/app.py:445-462`에서 세션별 전체 snapshot을 State에 보관하므로, 두 탭/세션이 편집하면 나중 저장한 snapshot이 앞선 변경을 덮어쓴다.

개선안:

- 파일 lock과 mtime/hash 기반 optimistic concurrency를 사용한다.
- temp 파일/디렉터리에 쓴 뒤 전체 검증 후 atomic replace한다.
- 자동 backup과 실패 rollback을 제공한다.
- 보강·관측일 추가 도구도 같은 쓰기 유틸을 공유하게 한다.

### F-17. 공유 기능 eager 포함과 ICS 메인 스레드 점유

우선순위: **P2 / 번들·상호작용**

`src/components/layout/AppShell.vue:5,18`이 `ShareModal`을 정적 import하고, `src/components/share/ShareModal.vue:4,8`이 `html-to-image`와 `ShareCard`를 정적 import한다. 공유하지 않는 사용자도 이 코드가 포함된 main 67.6KB gzip을 받는다. 모달을 열기만 해도 `ShareModal.vue:112-124`에서 웹폰트 embedding을 warm-up한다.

`src/utils/ics.ts:27-45`는 줄마다 `TextEncoder`를 만들고 코드포인트마다 `encode(ch)` 배열을 할당한다. `:150-177`은 큰 lines 배열과 `map(foldLine)`, join으로 여러 문자열 복사본을 만든다. 전체 다운로드 클릭은 `useCalendarExport.ts:73-87`에서 동기 실행되어 로컬에서도 약 0.2초 메인 스레드를 막았다.

개선안:

- ShareModal 자체를 `defineAsyncComponent`로 만들고 열릴 때 mount한다.
- 최소한 `html-to-image`는 이미지 생성 함수 안에서 동적 import한다.
- 폰트 embedding은 이미지 버튼 intent 이후에만 수행하고 필요한 weight/subset만 자체 호스팅한다.
- TextEncoder를 hoist하고 전체 byte buffer 또는 `encodeInto` 기반으로 fold한다.
- 브라우저 ICS 생성은 Web Worker나 서버 다운로드로 옮기고 진행 상태를 표시한다.
- 긴 설명을 제한하고 상세 URL 중심의 더 작은 이벤트 payload를 검토한다.

### F-18. 달력과 상세가 반복 전수 스캔

우선순위: **P2 / 데이터 증가 대비**

`src/features/calendar/composables/useMonthCalendar.ts:28-56`은 42개 셀마다 1,343개 전체를 filter해 월당 56,406번 `occursOn`을 호출한다. 선택일도 다시 전수 검사한다. 피드(`useTodayFeed.ts:18-27`), 상세(`useDayPages.ts:39-57`), route 날짜 조회(`anniversaryRoutes.ts:46-50`)도 별도 전수 스캔을 반복한다. 데이터는 immutable에 가깝지만 `src/stores/anniversaries.ts:12-13`의 deep `ref`로 프록시된다.

현재 데스크톱 중앙값 약 13.7ms라 즉시 치명적이지는 않지만, 저사양 모바일이나 데이터 증가 시 월 전환이 한 프레임을 넘길 수 있다.

개선안:

- immutable 데이터는 `shallowRef`/`markRaw`로 보관한다.
- load 시 `byId`, `byCategory`, `byUrlDate`, `occurrencesByYearAndDate`를 만든다.
- 검색용 lowercase 문자열을 사전 계산하고 30건을 찾으면 조기 종료한다.
- 월/연도 인덱스는 데이터 버전 단위로 캐시한다.

### F-19. 2050년 이후 음력 날짜를 조용히 허위 생성

우선순위: **P2 / 장기 정확성**

`src/utils/dateUtils.ts:20-50`은 현재 `observances.json` 범위 2020~2050을 벗어나면 가장 가까운 연도로 clamp한 뒤, 그 MM-DD를 요청한 연도에 붙인다. 24절기는 하루 수준 근사일 수 있지만 음력 명절은 크게 달라진다. 달력은 연도 이동 제한이 없어 2051년 설날을 2050년 월·일로 표시한다.

개선안:

- tabulated 범위 밖은 `null`/명시 오류로 처리하고 UI 이동·export에 범위를 표시한다.
- 표를 주기적으로 확장한다.
- 전체 row의 연도 범위가 같은지 빌드 invariant로 확인한다. 현재처럼 첫 row 하나로 전역 범위를 추론하지 않는다.

### F-20. 월 이동 후 선택 날짜가 이전 달에 남음

우선순위: **P2 / UI 상태**

`src/features/calendar/composables/useMonthCalendar.ts:73-78`은 cursor만 바꾸고 `selectedDate`를 갱신하지 않는다. 새 달 grid에는 선택 셀이 없는데 아래 “Selected” 영역은 이전 달 날짜와 기념일을 계속 보여준다.

월 이동 시 선택일을 새 달의 같은 일(월말 clamp) 또는 1일로 함께 이동하고, 이를 UI 테스트로 고정한다.

## 낮은 우선순위 및 방어 강화

### F-21. 응답 보안 헤더와 외부 URL 정책

`vercel.json:1-5`에는 rewrite만 있고 CSP, `frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`가 없다. 이는 F-09의 영향과 클릭재킹·referrer 노출을 키운다.

처음에는 CSP Report-Only로 적용하고 Google Fonts·Vercel Analytics에 필요한 출처만 허용한 뒤 강제한다. 기본 방향은 `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`이다.

또한 `src/utils/sourceUrl.ts:5-16` 등은 `^https?://` 정규식만 확인한다. 공통 URL 파서에서 HTTPS, 무자격증명, 허용 포트 조건을 적용하고 외부 링크에는 `noopener noreferrer nofollow`를 일관되게 사용한다. 현재 데이터에는 HTTP URL이나 제어문자 URL이 없다.

Vercel Analytics(`src/App.vue:3,10`)는 실제 route path를, Google Fonts(`index.html:70-75`)는 외부 네트워크 요청을 만든다. 개인정보 처리 안내와 route path 수집 정책을 별도로 확인하고, 가능하면 폰트를 자체 호스팅한다.

### F-22. 요청 시각 DTSTAMP가 캐시 효율을 떨어뜨림

`src/utils/ics.ts:56-64,154-157`은 매 요청 시각을 모든 이벤트의 DTSTAMP에 넣는다. 데이터가 같아도 응답 byte와 ETag가 달라지고, 캘린더 클라이언트가 1,343개 이벤트를 갱신된 것으로 처리할 수 있다.

배포 커밋 또는 데이터 버전 시각을 결정적 DTSTAMP로 사용하고, 데이터가 바뀔 때만 ETag/Last-Modified가 바뀌게 한다.

### F-23. 빌드 규모·재현성·문서 드리프트

- 프리렌더는 1,709 HTML, 약 15MB를 만든다. 현재 빌드는 빠르지만 파일 수·배포 한도를 모니터링해야 한다.
- `vite.config.ts:10-11`, `tools/prerender/plugin.ts:105-110`, `tools/prerender/routes.ts:129-145`에서 같은 데이터를 여러 번 파싱한다. 데이터 컨텍스트 memoize로 줄일 수 있다.
- `tools/inspector/requirements.txt:1`의 `gradio>=4.44,<6`은 버전과 hash가 고정되지 않아 재현 가능한 Python 감사가 어렵다. lock 파일을 만들고 Python 버전도 고정한다.
- README는 1,291건을 설명하지만 현재는 1,343건이다.
- `src/stores/userPreferences.ts`는 현재 어디에서도 import되지 않는 dead code다.

## 긍정적으로 확인된 사항

- Vue 템플릿은 `v-html` 없이 interpolation을 사용해 일반 본문 출력은 안전하다.
- 런타임 JSON-LD는 `textContent`로 갱신한다.
- 현재 sourceUrl은 렌더되는 값이 모두 HTTPS이며 즉시 악성 제어문자는 없다.
- `tools/inspector/.env`는 `.gitignore`에 포함되어 있고 저장소에서 비밀키·토큰을 찾지 못했다.
- `package-lock.json`은 npm registry HTTPS URL과 integrity hash를 사용하며 git/file/non-registry 의존성이 없다.
- CDN cache 정책 자체는 존재하고, 타입 검사·빌드·현재 slug 검사는 통과한다.

## 권장 회귀 테스트

최소한 다음 테스트를 자동화하는 것이 좋다.

1. Inspector no-op save 전후 12개 파일의 ID→월 매핑이 동일하다.
2. 모든 dateType이 유효한 실제 날짜를 만들고 anchor graph는 DAG다.
3. dataset ID와 routes ID가 양방향으로 정확히 일치한다.
4. Black Friday 등 상대일의 2026~2028 ICS 날짜가 실제 계산 결과와 같다.
5. JSON-LD의 `</script>`와 ICS의 CR/LF 입력이 새 HTML/script/ICS 줄을 만들지 않는다.
6. 자정·연말·탭 복귀 시 오늘 피드와 달력이 갱신된다.
7. export 0/1/전체 선택이 각각 empty/subset/all feed와 일치한다.
8. 02-28/02-29/03-01 이웃 링크와 invalid 날짜 404가 정확하다.
9. 월 청크 실패 시 정적 본문 또는 명시적 오류·retry가 유지된다.
10. API가 GET/HEAD 외 메서드, 무효·과도한 쿼리를 거부한다.

## 감사 한계

이번 검토는 소스 정적 분석, 로컬 빌드·타입 검사·의존성 감사, 선택 경로의 실행 측정으로 수행했다. 실제 Vercel CDN의 캐시 키·압축·rate limit, 브라우저별 캘린더 import 동작, 실기기 Core Web Vitals는 배포 환경에서 추가 검증이 필요하다. Python 의존성은 잠금 파일과 재현 환경이 없어 CVE 감사를 확정하지 않았다.
