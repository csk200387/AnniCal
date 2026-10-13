# 검수 요청 — priority-editorial-20261012 라운드2 (pending 27)

작성자 초안이다. 승인·반영이 아니다. 독립 검수 후 통과 항목만 로컬 반영해 주세요.

## 범위

- `integration-result.json` 의 `pending_uids` 27건만 다뤘다(전부 asia-expansion 출처). 1라운드 32건의 drafts/reviews/로컬 반영 31건/마르자나 보류 판정은 읽기만 했다.
- 서비스 파일(월별 JSON·routes·observances·폰트·seo·footer)과 1라운드 산출물·integration 파일은 수정하지 않았다. commit/push/배포 없음.

## 검수할 파일

| 파일 | 내용 |
|---|---|
| `proposed-records-round2.json` | `records`: 검수 요청 26건 Anniversary 객체 / `withheld`: 보류 1건 |
| `drafts-round2.json` | 27건 전체 초안(보류 포함), 상태·근거 claim·editorial notes·중복 판정·날짜 점검 |
| `evidence-map-round2.json` | 주장별 literal 인용과 원문 경로(repo 루트 상대). `origin_batch`=원본 배치 인용, `this_batch`=이번 인용 |
| `verification-round2.json` | 자체 검증 결과(아래) |
| `evidence/` | 이번에 새로 받은 원문(아래 키) |
| `fetch-log.json`, `search-log.json` | 기존 값 보존 + 이번 수집·검색 append |

## 상태별

- **ready_for_review 26**: cn-farmers-harvest, cn-police-day, cn-space-day, cn-arbor-day, hk-villain-hitting, hk-fire-dragon, id-batik-day, id-santri-day, in-hindi-diwas, in-science-day, jp-shichigosan, jp-keiro-no-hi, jp-yama-no-hi, jp-seijin-no-hi, mn-naadam, my-malaysia-day, my-kaamatan, my-gawai, ph-heroes-day, ph-simbang-gabi, sg-total-defence-day, th-songkran, tw-228-peace-day, tw-indigenous-day, tw-disaster-prevention-day, vn-doctors-day
- **date_support_unverified 1**: `asia:jp-setsubun`
- blocked / duplicate / shorter_evidenced: 0

## 꼭 봐 주실 판단

1. **해외 절기·음력 4건 — 앱 표가 아닌 현지 공식 연표로 확인**
   - 홍콩천문대(HKO, UTC+8) 공식 음양력 연표 2020~2050년 31개를 받아 앱 `observances.json` 과 대조했다(`evidence/_shared-hko-calendar/`).
   - 2026·2027·2028은 추분·경칩·음력 8/15 모두 일치.
   - **범위 안 불일치**: 음력 8/15 **2040년**(HKO 9/20, 앱 9/21) → 불용춤 영향. 추분 **2041년**(HKO 9/22, 앱 9/23) → 농민 풍수절 영향. 입춘 2050년(UTC+8 기준 2/3, 앱 2/4)은 일본이 UTC+9라 세쓰분과 무관. 반영하려면 이 한계를 수용하거나 별도 표 키가 필요하다.
   - 중국 농민 풍수절: HKO 는 홍콩특별행정구 기관이고 중국 본토(자금산천문대) 원문은 아니다. 2026년 개최(9/23 제9회)는 신화망으로 확인.
   - **세쓰분 보류**: 국립천문대 역요항 2026·2027년은 세쓰분 2/3로 확인했다. 2028년 역요항은 관례상 2027년 2월 발표라 아직 없다. 앱 계산값(2028-02-03)을 현지 근거로 쓰지 않았다. 재개 조건은 drafts-round2.json notes 참고.
2. **다이항 불용춤 날짜**: 다일 축제 첫날 원칙에 따라 큐의 `chuseok`(8/15) 대신 **첫날 8/14 = `anv-lunar-chuseok-kr:-1`** 로 제안했다. 중국 국가무형유산 원문이 행사를 음력 8/14~16로 명시한다. 2026 일정(9/24~26)은 HK01 안내로 확인했고 주최 측 공고는 확보하지 못했다. 중추절 당일을 대표일로 쓰려면 date 를 `chuseok` 으로 바꾸면 된다.
3. **다일 행사 첫날 저장**: 나담 07-11(11~13일, 2026 정부 휴무 7/10~19), 송끄란 04-13(13~15일 각 날 뜻), 심방가비 12-16(16~24일, 24일 자정 미사), 카아마탄 05-30(한 달 축제, 절정 30~31일). 모든 항목에서 전체 기간을 origin 에 적었다.
4. **새로 확보한 근거**(원본 배치의 미인용 주장 보강)
   - 중국 항천일 날짜 이유: 둥팡훙 1호 발사일 → 중국일보 2021, 신화사 2026. 관영 매체 2곳이라 정부 서술의 반복일 수 있다.
   - 송끄란 사흘 구성·관습: 태국 정부 홍보국, TAT(유네스코 성명 인용). 두 곳 모두 정부 계열이다.
   - 불용춤 의례·전승 단위: 중국 무형유산 사이트 ihchina.cn.
   - 나담 2026 휴무: iKon(몽골 정부 회의 보도).
5. **귀속·유보 표현**(1라운드 검수 교훈 반영)
   - 부정 단정은 쓰지 않았다(예: ‘UN 지정 아님’). 확인하지 못한 것은 ‘확인되지 않았다/자료에 없다’로 적었다.
   - 미래 행사는 예고로 썼다(2023 항천일 행사, 2024 대만 경보 훈련, 2016 차이잉원 사과 예정).
   - 전설은 전설로 썼다(후미노둔 신화, 1880 역병 전설, 백호 제사).
   - 전재 기사는 독립 근거로 세지 않았다(gov.cn 2건, 뉴스렌즈↔행정원, PRD↔TAT).
6. **카테고리**: 외국 국민 축일·공휴일(경로의 날·산의 날·성인의 날·나담·말레이시아의 날·영웅의 날·송끄란)은 기존 남아공·방글라데시·대만 행헌기념일과 같은 `holiday`로 했다. 추모·사건(228·총방위·산트리·원주민족일)은 `history`, 방재는 한국 방재의 날과 같은 `campaign`이다. 한국 법정기념일 그룹은 붙이지 않았다.
7. **분량**: 역사·국가 항목의 800~1,100자 목표는 근거 범위 안에서 멈춰 최대 614자(산트리)다. in-hindi-diwas origin 146자는 근거 부족으로 늘리지 않았다.

## 이 배치에서 받은 근거 키 (`evidence/`, 라운드1 진행 중 수집분 포함)

`_shared-hko-calendar/`(HKO 2020~2050), `cn-farmers-harvest/newscn-20260923`, `cn-space-day/{chinadaily-2021,newscn-2026,chinanews-2024}`, `hk-fire-dragon/{hk01-2026,ihchina-14936}`, `jp-setsubun/{nao-rekiyou-2026,nao-rekiyou-2027}`, `mn-naadam/{ikon-3ohf,gogo-d362qx}`, `th-songkran/{prd-239093,tatnews-2023}`. 리바르테메 관련 4개는 1라운드에서 받은 것이다.

## 재실행

```bash
node tools/research/workflow/batches/priority-editorial-20261012/scripts/verify-round2.mjs
python3 -I tools/research/workflow/batches/priority-editorial-20261012/scripts/add_drafts_round2.py --rebuild
```
