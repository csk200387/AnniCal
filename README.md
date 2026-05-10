# 엉뚱한 달력 (Anniversary)

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
├── features/                # 도메인 기능 단위 (기획서 4대 핵심 기능과 1:1)
│   ├── feed/                #   1. 큐레이션 피드
│   ├── calendar-export/     #   2. .ics Export
│   ├── share/               #   3. 소셜 공유 (TODO)
│   └── discovery/           #   4. 다가오는 엉뚱한 날 (TODO)
├── data/                    # 정적 JSON DB
├── services/                # 데이터/외부시스템 추상화 (Repository)
├── stores/                  # Pinia 전역 상태
├── composables/             # 도메인 무관 범용 훅
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

## 다음 작업 (TODO)

- [ ] `features/share` — html-to-image + Web Share API 로 카드 이미지 공유
- [ ] `features/calendar-export` — 카테고리 선택 → .ics 생성/다운로드
- [ ] `features/discovery` — 다가오는 엉뚱한 날 배너/푸시 알림
- [ ] 더미데이터 추가 수집 (월별 최소 5개 이상 목표)
```
