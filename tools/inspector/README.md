# 기념일 데이터 검수기

`src/data/anniversaries/` (월별 `01.json … 12.json`) 을 검토·편집하기 위한 로컬 Gradio UI. 12개 파일을 하나의 리스트로 병합해 보여주고, 저장 시 `dateType` 기준으로 다시 월별 파일에 분배한다(`data_io.py`).

## 요구사항

- Python 3.10+
- (권장) 가상환경

## 설치

```bash
cd tools/inspector
python -m venv .venv
source .venv/bin/activate     # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 실행

```bash
python app.py
```

기본 주소: http://127.0.0.1:7860

## 기능

- **목록 (좌측)** — 날짜순으로 전체 항목 표시. 이름·태그·id·카테고리·날짜로 검색.
- **편집 폼 (우측)** — 행을 클릭하면 폼에 로드. 같은 id 로 저장하면 수정, 새 id 면 추가.
- **📰 네이버 뉴스 검색** — 편집 폼 안의 아코디언. 기념일 관련 뉴스를 수집해 `sourceUrl`·`anecdote` 채우기를 돕는다 (아래 참고).
- **🗑️ 삭제 / ➕ 새로 작성 / 🔄 재로드**.
- **상단 검수 패널**:
  - 중복 id
  - `categories.json` 에 없는 카테고리
  - 필수 필드(`id`, `name`, `date`, `dateType`, `category`, `storytelling.origin/anecdote`, `tags`) 누락/빈 값
  - 날짜 포맷 오류 — `annual-fixed` ↔ `MM-DD`, `annual-nth-weekday` ↔ `MM-N-DOW`(예: `05-2-SUN`, `10-L-TUE`), `annual-floating`/`one-time` ↔ `YYYY-MM-DD`

## 네이버 뉴스 검색 (선택)

기념일 데이터의 `storytelling`/`sourceUrl` 을 채울 때 [네이버 검색 API](https://developers.naver.com/docs/serviceapi/search/news/news.md) 로 관련 뉴스를 가져온다.

### 1. 자격증명 발급

[developers.naver.com/apps](https://developers.naver.com/apps/) 에서 애플리케이션 등록 → "검색" API 추가 → Client ID / Secret 발급.

### 2. 설정

`.env.example` 을 `.env` 로 복사하고 값을 채운다 (`.env` 는 git 에 커밋되지 않음):

```bash
cp .env.example .env
# .env 편집: NAVER_CLIENT_ID / NAVER_CLIENT_SECRET
```

환경변수로 직접 줘도 된다 (환경변수가 `.env` 보다 우선):

```bash
export NAVER_CLIENT_ID=...
export NAVER_CLIENT_SECRET=...
```

### 3. UI 사용

편집 폼의 **📰 네이버 뉴스 검색** 아코디언을 열고:
- 검색어 입력 (비우면 위 `name` 필드 값을 사용) → **🔎 검색**.
- 결과 행을 클릭 → 미리보기 표시.
- **→ sourceUrl 채우기**: 선택 뉴스 링크를 `sourceUrl` 에 넣음.
- **→ anecdote 에 추가**: 선택 뉴스 요약을 `anecdote` 끝에 덧붙임.

### CLI 단독 사용

`naver_news.py` 는 import 없이 단독 실행도 된다:

```bash
python naver_news.py "한글날 유래"
python naver_news.py "스승의 날" --display 5 --sort date --json
```

> 자격증명이 없으면 뉴스 검색만 비활성화되고, 검수기의 나머지 기능은 정상 동작한다.

## 데이터 형식

`src/types/anniversary.ts` 의 `Anniversary` 인터페이스를 따른다. 저장 시 전체 항목을 월(1~12) 버킷으로 나눠 `src/data/anniversaries/MM.json` 12파일을 2-space indent, UTF-8 (`ensure_ascii=False`) 로 덮어쓴다. `annual-relative-to-holiday` 는 anchor 가 속한 월을 따른다.

`memes` 는 폼 안에 동적으로 표시되는 행 단위로 편집한다. **➕ 밈 추가** 버튼으로 행을 만들고, 행마다 `type` (text/image), `url` (image 일 때만 필수), `caption` 을 입력. 행 우측의 🗑️ 버튼으로 개별 삭제. 저장 시 `text` 타입의 url 은 자동으로 `null` 로 정규화된다.

## 주의

- 이 도구는 로컬 전용. Vue 앱 빌드 산출물에는 포함되지 않는다.
- 저장 시 파일을 즉시 덮어쓴다 — 작업 전 `git status` 로 변경 추적 권장.
