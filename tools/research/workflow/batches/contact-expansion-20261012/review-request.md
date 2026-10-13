# 검수 요청 — contact-expansion-20261012

- 조사·작성: Claude Code (Opus 5.5), 2026-10-12 (KST)
- 대상: 서비스 1,756건 기준, 실제 resolver로 진단한 2026·2027·2028 빈약 날짜의 **신규 후보**
- **승인·반영·배포하지 않았다.** `evidenced` 는 "존재·날짜를 뒷받침하는 원문을 저장하고 인용을 대조했다"는 뜻일 뿐이다. 독립 검수와 사람 승인이 남아 있다.
- 서비스 JSON, `routes.json`, footer, 기존 미추적 파일(.claude/.agents 등)은 건드리지 않았다.

## 1. 결과 요약

| 상태 | 건수 | 후보 |
|---|---:|---|
| evidenced | 13 | 후지산의 날 · 세계 이해와 평화의 날 · 몬테네그로 국가성립 기념일 · 세계 뱀의 날 · 미얀마 순국자의 날 · 우크라이나 독립기념일 · 명왕성 강등의 날 · 국제 약물 과다복용 인식의 날 · 국제 아프리카계 사람들의 날 · 세계 고릴라의 날 · 영화의 날(한국) · 인도 헌법의 날 · 고아 해방의 날 |
| review | 1 | 세계 록의 날 (브라질) |
| blocked | 1 | 일본인 첫 비행의 날 |
| rejected | 0 | — |

- 인용 101건 전부 저장 본문과 정확히 일치(프로그램 검증). 원문 수집 시도 52회 중 37회 성공, 15회 실패(403·404·SSL 종료·타임아웃·빈 본문)는 `fetch-log.json` 과 각 기록의 `failed_access_attempts` 에 남겼다.
- 음식 후보 0건. 분류: 역사 5 · 동물 3 · 캠페인 3 · 문화 2(록 포함) · 학술 1.
- 한국 맥락: 영화의 날(한국) 1건. 빈약 날짜(02-23·07-13·08-24·08-31·12-19)에 맞는 한국 기념일은 검색으로 찾지 못했다(`search-log.json`).

## 2. 후보별 판단 포인트

| 날짜 | 후보 (제안 id) | 분류 | 핵심 근거 | 확인 못 한 것 / 검수자 확인 요청 |
|---|---|---|---|---|
| 02-23 | 후지산의 날 (`anv-fixed-02-23-mount-fuji-day-jp`) | animal | 시즈오카현 조례 원문(2009-12-25 공포) | 날짜 말맞춤(ふ·じ·さん) 설은 공식 원문에 없어 본문에서 뺌. 야마나시현 조례 PDF 404. culture 분류도 가능 |
| 02-23 | 세계 이해와 평화의 날 (`…-rotary-world-understanding-peace-day`) | campaign | 로터리 지구 5340·7080, 1984 미네소타 주지사 선포문(OCR) | rotary.org 본부 원문 없음. 최초 제정 연도 미상(1984년 이전 가능) |
| 07-13 | 몬테네그로 국가성립 기념일 | history | 몬테네그로 정부 gov.me 2건 | 기념일 지정 법령·연도, 휴무일 여부 |
| 07-16 | 세계 뱀의 날 | animal | 미콜라이우 동물원, 인도 AIR(2023 델리 동물원) | 제정 주체·연도 미상(본문에 명시). 기존 "뱀의 날"(02-01)과 주제 중복 — 병존 여부 판단 필요 |
| 07-19 | 미얀마 순국자의 날 | history | AP(2024)·Al Jazeera(2013) | 지정 법령·공휴일 여부. 미얀마 정세 관련 문구는 사실만 남김 |
| 08-24 | 우크라이나 독립기념일 | history | Espreso(1992 결의 인용)·ENRS·MSU(선포법 번역) | zakon.rada.gov.ua SSL 종료로 법령 원문 직접 확인 못 함(우회 안 함) |
| 08-24 | 명왕성 강등의 날 | academic | IAU iau0603(ESO 보관본), SYFY, National Today | 비공식 기념일·제정 주체 미상. 존재 근거가 대중매체·상업 달력뿐 → 반영 여부 판단 필요 |
| 08-31 | 국제 약물 과다복용 인식의 날 | campaign | Penington Institute·IOAD 공식 페이지 | 창시 개인 이름(자료마다 다름), 8월 31일 선택 이유 |
| 08-31 | 국제 아프리카계 사람들의 날 | campaign | UN 결의 A/RES/75/170 PDF, UN 관측일 페이지 | 첫 기념 연도·주도국은 본문에 안 씀. 기존 노예무역 추모일 2건은 history 축 — 분류 통일 판단 |
| 09-24 | 세계 고릴라의 날 | animal | Dian Fossey Gorilla Fund 2건 | 1967년은 "2017년 9월 24일이 50년째" 문장에서 계산한 값. 나무위키 발견 행에도 있었으나 검증 후보는 아니었음 |
| 10-27 | 영화의 날 (한국) | culture | 국가기록원, 전북일보, 주간경향, 서울신문 | **제정 연도·주체 미상**(1963년설 근거 없음). 법정기념일로 확인 안 됨 → "법정기념일" 그룹 붙이지 말 것. 2024년 기념행사는 10월 30일 |
| 11-26 | 인도 헌법의 날 | history | 주말리 인도대사관(관보 번호 인용), Bar & Bench | 관보 원문 미확보. 힌디어 명칭은 원문에 없어 미사용. origin 126자(150자 지표 미달, 사실 부족으로 채우지 않음) |
| 12-19 | 고아 해방의 날 | history | 고아 주정부 보도자료 3건 | 주 공휴일 지정은 2차 기사(관보 인용)로만 확인 → 본문에서 공휴일 표현 뺌 |
| 07-13 | 세계 록의 날 (브라질) — **review** | culture | Band 기사(O Imparcial 과 같은 배포문) | 독립 출처 1건 이상 필요. 필 콜린스 발언·라디오 창시설 등 기원 설명이 매체마다 다름 |
| 12-19 | 일본인 첫 비행의 날 — **blocked** | — | zatsuneta 목록 사이트만 | 제정 주체·반복 기념 근거 없음. 재개 조건: 단체 등록·매년 행사 1차 근거 |

## 3. 날짜별 선택지 변화 — 미반영 시뮬레이션

실제 `occursOnBirthday` 로 센 현재 결과 수 + 이번 후보(evidenced만). 현재 사이트 결과는 바뀌지 않았다.

| 날짜 | 2026 | 2027 | 2028 | 현재 비음식 |
|---|---|---|---|---|
| 02-23 | 2→4 | 2→4 | 2→4 | 0 |
| 07-13 | 2→3 (+review 1) | 2→3 | 2→3 | 0 |
| 07-16 | 2→3 | 2→3 | 3→4 | 0 |
| 07-19 | 2→3 | 1→2 | 2→3 | 0 |
| 08-24 | 2→4 | 2→4 | 2→4 | 0 |
| 08-31 | 2→4 | 2→4 | 2→4 | 0 |
| 09-24 | 2→3 | 3→4 | 2→3 | 1 |
| 10-27 | 3→4 | 2→3 | 2→3 | 1~2 |
| 11-26 | 3→4 | 7→8 | 1→2 | 0~6 |
| 12-19 | 2→3 | 2→3 | 2→3 | 0 |

## 4. 검수자가 할 일

1. 각 기록의 `claims[].evidence[].quote` 를 `evidence/<후보>/<label>.txt`(또는 원본 `.html`/`.pdf`)에서 다시 읽고, 초안 문장이 인용 범위를 넘지 않는지 대조한다. AI 검증 통과는 사실 검수를 대신하지 않는다.
2. `verification.json.duplicate_audit` 의 유사 항목(특히 뱀의 날 02-01, 노예무역 추모일, 일본 영화의 날 12-01)과 병존 여부를 판단한다.
3. 분류(fuji: animal/culture, 아프리카계: campaign/history)를 정한다.
4. 판정을 `records.json` 의 `review` 에 기록한다. 승인은 사람만 한다.
5. 승인 후 반영은 워크플로 문서의 "승인된 배치의 반영 절차"를 따른다(신규 id → `generate_slugs.py` 실행, `npm run verify`, OG 글리프 검사). `proposed-anniversaries.json` 의 id 는 제안값이다.

## 5. 재현 명령 (읽기 전용)

```bash
python3 -I tools/research/workflow/batches/contact-expansion-20261012/scripts/build_records.py   # 인용 불일치 시 실패
node tools/research/workflow/batches/contact-expansion-20261012/scripts/verify.mjs               # verification.json 갱신
node tools/research/workflow/batches/contact-expansion-20261012/scripts/diagnose.mjs             # diagnosis.json 갱신
```

## 6. 파일

- `records.json` — 15건 조사 기록(주장별 판정·인용·근거 메타·실패 접근)
- `proposed-anniversaries.json` — evidenced 13 + review 1 의 서비스 형식 초안(미승인)
- `evidence/<후보>/` — 원본(.html/.pdf)과 추출 텍스트(.txt), `fetch-log.json` — 접근일·HTTP 상태·sha256
- `verification.json`, `diagnosis.json`, `search-log.json`, `progress.md`, `scripts/`
