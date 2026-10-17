# AnniCal 작업 지침

기념일 큐레이션 웹앱. 모델·도구(Claude, Codex 등)가 달라도 이 문서 하나를 따른다.
스택·디렉토리 구조는 `README.md`, 데이터 스키마·필드 규칙은 `DATA_Examples.md`,
코드 서식·이름·구조 규칙은 `docs/CONVENTIONS.md` 를 보라. 이 문서는 **그 세 곳에
없는 판단 기준**만 담는다. 작업이 끝나면 `npm run verify` 를 통과시킬 것.

---

## 기념일 본문 보강 작업

`storytelling.origin`/`anecdote` 를 쓰거나 고칠 때는 `anniversary-enrichment`
스킬(`.agents/skills/anniversary-enrichment/SKILL.md`)을 먼저 읽을 것 — 검색 노출
이유, 분량, 출처·사실 확인, 쓰지 않을 것, 지금의 우선순위, 반영·검증 절차가
담겨 있다. 스킬은 도구 공용 위치인 `.agents/skills/` 에 두고 `.claude/skills/` 에서
심볼릭 링크로 가리킨다.

본문 원칙은 `/about`(`src/features/about/content.ts`)에 사이트의 공개 약속으로
올라가 있다 — 법정기념일은 법령, 국제기념일은 UN 등 지정 기관의 결의를 근거로
삼고, 확인되지 않은 유래는 단정하지 않으며, 이색 기념일은 공식 지정이 아닌
문화로 가볍게 다룬다. 본문이 이 약속과 어긋나게 쓰이지 않게 할 것.
출처의 절반 이상이 nationaldaycalendar.com 인데, 이곳은 기업·단체가 비용을 내고
등록하는 민간 업체다. 연도·주체 같은 사실은 가능하면 1차 자료로 확인한다.

---

## 알아둘 것

- **원어 괄호가 붙은 전체 이름은 그 기념일 상세 페이지 제목에서만 보여 준다.**
  피드·목록·달력·카드는 모두 `src/utils/format.ts` 의 `displayName()` 을 거친다.
  화면에 `anniversary.name` 을 그대로 찍는 곳을 새로 만들지 말 것.
- **음력 명절·24절기는 `annual-tabulated` 타입이다.** 설날·추석은 음력이라 양력과
  규칙적 관계가 없고, 24절기는 태양 황경으로 정의돼 천문 계산이 필요하다. 둘 다
  런타임에서 계산하지 않고 `src/data/observances.json` 의 연도별 표(2020~2050)를
  조회한다. `date` 필드에 날짜가 아니라 표의 키(`seollal`, `dongji`)가 들어간다.
  표는 `tools/observances/generate_observances.py` 가 만들며 빌드에 물려 있지 않다 —
  이미 색인된 페이지의 날짜가 달라지므로 함부로 재생성하지 말 것. 생성기는
  `verify()` 에서 ephem 내장 함수와 4대 절기 31년치, 그리고 알려진 삼복 날짜를
  대조해 하나라도 어긋나면 파일을 쓰지 않는다.
  ICS 는 이 타입을 RRULE 로 표현할 수 없어 `RDATE` 로 이후 10년치를 나열한다.
  새 항목은 `tools/observances/add_entries.py <파일.json>` 으로 넣는다.
- **URL 은 한 번 정해지면 바꾸지 않는다.** `/day/{MM-DD}/{slug}` 는 색인이 쌓이는
  자산이다. 슬러그를 바꾸면 그때까지의 색인이 날아간다. 날짜가 해마다 바뀌는
  기념일의 `urlDate` 를 2026년 발생일로 못박은 것도 같은 이유다 —
  `tools/slugs/generate_slugs.py` 의 `REFERENCE_YEAR` 는 건드리지 말 것.
  (날짜를 URL 에서 떼어내는 `/anniversary/{slug}` 안은 검토했다가 접었다. 슬러그가
  전역으로는 겹친다 — 한국판·미국판 현충일이 둘 다 `memorial-day` 인 식이다.)
- **`urlDate` 는 주소일 뿐 그 기념일이 실제로 일어나는 날이 아니다.** 어머니의 날
  주소는 영원히 `/day/05-10/...` 이지만 2027년 실제 날짜는 5월 9일이다. 화면에
  보이는 날짜·날짜 허브 소속·SEO 문구는 전부 `resolveOccurrence(anv, 연도)` 로
  그 해 실제 날짜를 구해서 쓴다. `urlDate` 를 표시에 그대로 쓰면 안 된다.
  프리렌더 HTML 은 빌드한 해의 날짜로 박히므로 매년 1월 1일
  `.github/workflows/yearly-rebuild.yml` 이 Vercel Deploy Hook 으로 다시 빌드한다.
- **기념일과 그 기준일은 `urlDate` 와 같은 달 파일에 둔다.** 상세 페이지는 첫
  화면에 그 달 파일 하나만 받고 mount 한다(`src/main.ts`). 다른 달 파일에 있으면
  mount 직후 정적 본문이 스켈레톤으로 바뀐다. `tests/prerender.test.ts` 가 지킨다.
- **기념일 데이터를 고쳤으면 `python3 tools/lastmod/generate_lastmod.py` 를 돌려
  `src/data/lastmod.json` 을 같이 커밋할 것.** 사이트맵 lastmod 와 Article
  `datePublished`·`dateModified` 가 여기서 나온다. Vercel 은 얕은 클론이라 빌드 때
  git 으로 항목별 날짜를 구할 수 없어 전체 이력이 있는 로컬에서 미리 계산한다.
  빠뜨리면 그 항목은 파일 단위 날짜로 물러서고, `--check` 가 어긋난 항목을 알려 준다.
- **새 공개 페이지를 만들면 네 곳에 함께 등록한다.** `src/seo/pages.ts` 의
  `PAGE_META`, 프리렌더 본문(`tools/prerender/plugin.ts`), 사이트맵
  (`tools/prerender/routes.ts` 의 `buildSitemap`), 정적 OG 이미지
  (`tools/og/generate.ts` → `npm run og:static`). 사이트맵은 프리렌더가 직접 쓰므로
  빠뜨리면 조용히 빠진다.

---

## 커밋 메시지

- 제목은 `<type>: <한국어 요약>`. 마침표 없이 한 줄로.
  - `feat` 기능 · `fix` 버그 · `perf` 성능 · `design` 화면 · `data` 기념일 데이터 ·
    `docs` 문서 · `test` 테스트 · `ci` 워크플로 · `chore` 그 밖의 정리
  - 여러 번에 나눠 하는 데이터 작업은 끝에 `(3/n, 9~10월 31건)` 처럼 차수와 범위.
- 본문은 **왜** 바꿨는지 먼저 쓰고, 무엇을 바꿨는지는 `-` 목록으로.
- `data` 커밋에는 `src/data/lastmod.json` 을 같이 넣는다.
- AI 도구가 만든 커밋은 그 도구의 `Co-Authored-By:` 줄을 끝에 단다.
