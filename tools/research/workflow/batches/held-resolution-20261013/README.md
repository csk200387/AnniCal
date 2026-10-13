# held-resolution-20261013

우선검토 보류 5개를 사용자 승인 범위로 반영한 작업 자료. 결과는 `report.md`, 진행 기록은 `checkpoint.md`.

| 경로 | 내용 |
|---|---|
| `baseline/` | 작업 시작 시점 사본(observances·routes·월별 데이터·og.ts·갱신 전 보고서)과 `sha256.txt` |
| `evidence/_hko-calendar-2051-2069/` | HKO T2051e~T2069e 원문(.txt 커밋, 원 응답 .html 은 로컬 전용) |
| `evidence/jp-yama-no-hi/` | e-Gov 祝日法, 내각부 gaiyou·syukujitsu.csv(cp932 디코드본 포함) |
| `evidence/jp-setsubun/`, `pl-topienie-marzanny/`, `hk-fire-dragon/` | 본문 보강 원문 |
| `fetch-log.json` · `search-log.json` | 수집 URL·시각·HTTP·해시 / 현지어 WebSearch 기록 |
| `records-final.json` · `claims-ledger.json` | 반영한 5개 레코드 / 인용 52개와 원문 경로 |
| `date-provenance.json` | 지역 3키 150개 값별 원문 인용·해시·독립 대조 |
| `invariants.json` · `prerender-check.json` | 기준 대비 불변 검사 / 프리렌더 본문 검사 |
| `testlogs/` | 번호순 실행 로그(red → green, verify) |
| `scripts/` | 아래 재실행 스크립트 |

## 재실행 (저장소 루트에서)

```bash
python3 -m venv tmp/obs-venv && tmp/obs-venv/bin/pip install -r tools/observances/requirements.txt
tmp/obs-venv/bin/python -m unittest tools/observances/test_generate_regional.py
tmp/obs-venv/bin/python tools/observances/generate_regional.py          # 검증만 (--write 로 3키 기록)
B=tools/research/workflow/batches/held-resolution-20261013
python3 -I $B/scripts/records.py              # 인용 대조 → records-final.json
python3 -I $B/scripts/verify_invariants.py    # 기준 대비 불변
tmp/obs-venv/bin/python -I $B/scripts/build_provenance.py
npm run verify && python3 -I $B/scripts/verify_prerender.py
```

`scripts/add_routes.py --write` 와 `tools/observances/add_entries.py records-final.json` 는 이미 반영돼
다시 돌리면 "이미 있음"으로 멈춘다. `generate_slugs.py` 를 `--check` 없이 돌리면 기존
separated-families-day URL 이 09-23 으로 바뀌므로 쓰지 않는다.
