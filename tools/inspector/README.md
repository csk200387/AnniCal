# 기념일 데이터 검수기

`src/data/anniversaries.json` 을 검토·편집하기 위한 로컬 Gradio UI.

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
- **🗑️ 삭제 / ➕ 새로 작성 / 🔄 재로드**.
- **상단 검수 패널**:
  - 중복 id
  - `categories.json` 에 없는 카테고리
  - 필수 필드(`id`, `name`, `date`, `dateType`, `category`, `storytelling.origin/anecdote`, `tags`) 누락/빈 값
  - 날짜 포맷 오류 — `annual-fixed` ↔ `MM-DD`, `annual-floating`/`one-time` ↔ `YYYY-MM-DD`

## 데이터 형식

`src/types/anniversary.ts` 의 `Anniversary` 인터페이스를 따른다. 저장 시 동일 파일을 2-space indent, UTF-8 (`ensure_ascii=False`) 로 덮어쓴다.

`memes` 는 폼 안에 동적으로 표시되는 행 단위로 편집한다. **➕ 밈 추가** 버튼으로 행을 만들고, 행마다 `type` (text/image), `url` (image 일 때만 필수), `caption` 을 입력. 행 우측의 🗑️ 버튼으로 개별 삭제. 저장 시 `text` 타입의 url 은 자동으로 `null` 로 정규화된다.

## 주의

- 이 도구는 로컬 전용. Vue 앱 빌드 산출물에는 포함되지 않는다.
- 저장 시 파일을 즉시 덮어쓴다 — 작업 전 `git status` 로 변경 추적 권장.
