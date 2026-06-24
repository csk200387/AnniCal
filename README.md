# [기념일 만물상 (Anniversary)](https://annical.vercel.app/)

세상의 다양하고 흥미로운 기념일을 매일 큐레이션 해주는 웹앱.

## 기술 스택

- **Vue 3** (Composition API + `<script setup>`)
- **TypeScript**
- **Vite 6**
- **Tailwind CSS v4** (Vite 플러그인 방식)
- **Pinia** — 전역 상태
- **vue-router 4**
- **dayjs** — 날짜 계산
- **ics** — 캘린더 .ics 파일 생성 (다음 단계)
- **html-to-image** — 카드 → 이미지 변환 (다음 단계)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 타입 체크
npm run type-check

# 프로덕션 빌드
npm run build
```

## 디렉토리 구조

```
src/
├── assets/                  # 글로벌 CSS, 정적 자원
├── components/              # 도메인 무관 공통 UI
│   ├── common/              #   원자 단위 (Badge 등)
│   ├── layout/              #   AppShell, Header, Footer
│   └── card/                #   AnniversaryCard
├── features/                # 도메인 기능 단위
│   ├── feed/                #   오늘의 기념일 큐레이션 피드
│   │   ├── composables/
│   │   └── views/
│   ├── calendar/            #   월간 달력 뷰
│   │   ├── composables/
│   │   └── views/
│   └── calendar-export/     #   .ics Export
│       └── views/
├── data/                    # 정적 JSON DB
├── services/                # 데이터/외부시스템 추상화 (Repository)
├── stores/                  # Pinia 전역 상태
├── router/
├── types/                   # TS 타입 정의
└── utils/                   # 순수 유틸 (날짜 계산 등)
```

## 데이터 레이어 흐름

```
data/*.json
   ↓
services/anniversaryRepository.ts   ← 데이터 소스 추상화 (추후 Supabase/API 교체 지점)
   ↓
stores/anniversaries.ts             ← Pinia 캐시
   ↓
features/<domain>/composables/*.ts  ← 도메인별 가공 훅
   ↓
features/<domain>/views/*.vue       ← 화면
```

이 구조 덕분에 추후 정적 JSON → 원격 DB 전환 시
`services/anniversaryRepository.ts` 한 곳만 갈아끼우면 된다.

## 데이터 작성 규칙

기념일 데이터는 `src/data/anniversaries/01.json … 12.json` (월별 12파일) 에 분할 저장된다. 앱은 이 파일들을 동적 import 로 코드 분할해 로드하고, 편집은 [`tools/inspector/`](./tools/inspector/README.md) 의 Gradio UI 를 권장한다(전체를 한 리스트로 다루고 저장 시 자동으로 월별 분할).

### `date` 필드 작성법

`dateType` 에 따라 `date` 문자열의 포맷이 달라진다.

| `dateType` | `date` 포맷 | 예시 | 의미 |
|---|---|---|---|
| `annual-fixed` | `MM-DD` | `"03-14"` | 매년 같은 월/일 (예: 파이의 날) |
| `annual-floating` | `YYYY-MM-DD` | `"2026-05-24"` | 매년 반복되지만 날짜가 바뀜 — 연도별로 엔트리를 따로 추가 (예: F1 모나코 GP) |
| `annual-nth-weekday` | `MM-N-DOW` | `"05-2-SUN"` | "매년 N번째 X요일" 규칙 (예: 미국 어머니의 날) |
| `one-time` | `YYYY-MM-DD` | `"1986-04-26"` | 특정 연도 1회성 (예: 체르노빌 사고일) |

#### `annual-nth-weekday` 상세

`MM-N-DOW` 세 토큰을 하이픈으로 잇는다.

- `MM` — 월 (`01` ~ `12`)
- `N` — `1` ~ `5` 또는 `L` (= 그 달의 마지막 주)
- `DOW` — `SUN` `MON` `TUE` `WED` `THU` `FRI` `SAT`

| 기념일 | 규칙 | `date` |
|---|---|---|
| 미국 어머니의 날 | 5월 **둘째** 일요일 | `"05-2-SUN"` |
| 미국 아버지의 날 | 6월 **셋째** 일요일 | `"06-3-SUN"` |
| 미국 추수감사절 | 11월 **넷째** 목요일 | `"11-4-THU"` |
| 미국 메모리얼 데이 | 5월 **마지막** 월요일 | `"05-L-MON"` |

## 다음 작업 (TODO)

- [ ] `features/share` — html-to-image + Web Share API 로 카드 이미지 공유
- [ ] `features/calendar-export` — 카테고리 선택 → .ics 생성/다운로드
- [ ] `features/discovery` — 다가오는 기념일 배너/푸시 알림
- [ ] 더미데이터 추가 수집 (월별 최소 5개 이상 목표)
