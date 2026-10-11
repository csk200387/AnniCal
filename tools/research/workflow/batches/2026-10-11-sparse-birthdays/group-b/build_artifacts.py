# -*- coding: utf-8 -*-
import json, pathlib, subprocess, re, html, collections
OUT=pathlib.Path(__file__).parent
REPO=OUT.parents[6]
S=pathlib.Path('/Users/csk200387/.hermes/skills/research/grounded-citations/scripts/sources.py')
LEDGER=OUT/'citations-ledger.json'
fetch=json.loads((OUT/'fetch-log.json').read_text())
for f in fetch:
    if f['key']=='racial':
        f['access_status']='empty_body'; f['error']='HTTP 응답은 수신했으나 읽을 본문이 없는 JS 셸. 근거로 사용하지 않음.'
(OUT/'fetch-log.json').write_text(json.dumps(fetch,ensure_ascii=False,indent=2))
bykey={f['key']:f for f in fetch}
def cli(*args):
    r=subprocess.run(['python3',str(S),'--ledger',str(LEDGER),*args],text=True,capture_output=True)
    if r.returncode:raise RuntimeError(r.stdout+r.stderr)
    return r.stdout.strip()
# Retrieval URLs are registered before report prose; never touches global ledger.
ids={}
for f in fetch:
    res=cli('add',f['url'],'--title',html.unescape(f.get('title',f['key'])))
    ids[f['key']]=int(re.search(r'\[(\d+)\]',res).group(1))
for entry in json.loads((OUT/'search-log.json').read_text()):
    for s in entry['outcome'].get('data',{}).get('web',[]):cli('add',s['url'],'--title',s['title'])
def ev(key,publisher,quote):
    f=bykey[key]; text=pathlib.Path(f['local_evidence_path']).read_text()
    assert quote in text,(key,quote)
    cli('quote',str(ids[key]),'--text',quote,'--from',f['local_evidence_path'])
    return {k:f[k] for k in ('url','accessed_at','local_evidence_path','access_status')} | {'publisher':publisher,'title':html.unescape(f['title']),'quote_original':quote,'citation_id':ids[key]}
def record(key,ko,original,date,scope,officiality,category,dup,origin,anecdote,evidence,unverified,notes):
    return dict(candidate_key=key,name_ko=ko,name_original=original,date=date,dateType='annual-fixed',scope=scope,officiality=officiality,category=category,status='evidenced',duplicate_of=None,duplicate_check_notes=dup,origin=origin,anecdote=anecdote,sourceUrl=evidence[0]['url'],evidence=evidence,unverified_fields=unverified,notes=notes)
records=[]
records.append(record('07-09-world-misophonia-awareness-day','세계 미소포니아 인식의 날','World Misophonia Awareness Day','07-09','국제 시민사회 캠페인; soQuiet와 여러 나라 연구·옹호 단체 참여','민간 단체가 선언한 인식 개선일; UN·국가 법정기념일로 확인한 것은 아님','campaign','전역 1,734건의 이름·id에서 misophonia/소포니/소리혐오 일치 없음. 기존 음식 기념일과 대상·주최·범위가 다름.','매년 7월 9일 미소포니아에 대한 이해와 지원을 넓히기 위한 국제 캠페인이다. soQuiet와 관련 단체들이 공동으로 알리고 있다.','캠페인 운영 사이트는 2024년 11월에 이 날을 선언했고 2025년 7월 처음 기념했다고 설명한다. 선언 시점과 첫 행사 연도는 서로 구분해야 한다.',[
ev('misophonia','soQuiet','World Misophonia Awareness Day will be observed annually on July 9th.'),
ev('misophonia','soQuiet','Organizations dedicated to misophonia, a condition marked by intense emotional and physical reactions to certain sounds, have come together internationally to establish July 9th as World Misophonia Awareness Day.'),
ev('misophonia-site','World Misophonia Awareness Day / soQuiet','World Misophonia Awareness Day was declared in November of 2024 by soQuiet, a nonprofit misophonia advocacy and support organization, with the support of the Del Valle family. In July of 2025, the Day was first observed in partnership with the organizations and entities below.')],['국제기구 또는 각국의 법적 지정 여부'],'보건·추모 소재. 유래에 사망 사례가 있으므로 생일용 유머·밈 없이 존중하는 편집 필요.'))
records.append(record('07-09-argentina-independence-day','아르헨티나 독립기념일','Día de la Independencia de la República Argentina','07-09','아르헨티나','아르헨티나 고정 공휴일; 국립대학 자료에서 Feriado inamovible 확인','history','Argentina/아르헨티나 독립일에 해당하는 이름·id 없음. 기존 미국 독립기념일(07-04)은 국가·기념 사건·날짜가 다름.','아르헨티나는 매년 7월 9일 독립기념일을 기념한다. 날짜를 옮기지 않는 공휴일로 안내되며 1816년 독립 선언을 기린다.','정부 자료는 1816년 7월 9일 투쿠만 의회가 독립을 선언했다고 설명한다. 1816년은 기념 대상 사건의 연도이지 공휴일 제정 연도로 확인된 것은 아니다.',[
ev('argentina-unc','Universidad Nacional de Córdoba','El Día de la Independencia de la República Argentina se celebra todos los 9 de julio de cada año'),
ev('argentina-unc','Universidad Nacional de Córdoba','Feriado inamovible: Día de la Independencia'),
ev('argentina','Casa Rosada / 아르헨티나 대통령실','On 9 July 1816, after nine hours of intense debate, the Congress of Tucumán declared Independence.')],['독립기념일 최초 제정 연도·제정 법령'],'1816년을 기념일 창설 연도로 쓰지 않음.'))
records.append(record('07-21-belgian-national-day','벨기에 국경일','Belgian National Day','07-21','벨기에','벨기에 국가 공휴일; 브뤼셀 시·미 육군 베네룩스 자료 확인','history','Belgian/Belgium/벨기에 이름·id 일치 없음. 아르헨티나·미국 독립일과 국가 및 기념 사건이 다름.','7월 21일은 벨기에 국경일이다. 브뤼셀 시는 이 날을 Belgian National Holiday로 안내한다.','이 날은 1831년 7월 21일 레오폴드가 헌법에 충성을 맹세하고 벨기에의 첫 국왕이 된 사건을 기린다. 사건 연도와 국경일 제정 연도를 혼동하지 않는다.',[
ev('belgium','City of Brussels','July 21st is the Belgian National Holiday.'),
ev('belgium-history','U.S. Army Garrison Benelux','Belgian National Day commemorates an event that occurred July 21, 1831. On that day, Leopold of Saxe-Cobourg swore allegiance to the new Belgian Constitution and became the first King of the Belgians.'),
ev('belgium-history','U.S. Army Garrison Benelux','July 21 is a day of national pride for Belgians, who celebrate this public holiday with concerts, parties, fireworks and other festive events.')],['국경일 제정 연도·최초 법령','프랑스어·네덜란드어 공식 명칭 원문 검증'],'원명은 실제 읽은 영어 자료의 명칭 사용. 1831년을 국경일 제정 연도로 단정하지 않음.'))
records.append(record('07-21-singapore-racial-harmony-day','싱가포르 인종 화합의 날','Racial Harmony Day','07-21','싱가포르; 학교 교육 중심','교육부가 매년 기념하는 교육 기념일; 공휴일 여부는 이 조사에서 확인하지 않음','culture','Racial Harmony/인종 화합/민족 화합에 해당하는 이름·id 없음. 다른 인종·문화 관련 캠페인의 번역명 대체가 아니라 싱가포르 학교 중심 기념일.','싱가포르 학교들은 매년 7월 21일 인종 화합의 날을 기념하며 학생들이 인종 간 화합과 사회적 결속을 이해하도록 돕는다.','2025년 교육부 자료에는 학생과 교직원의 기념 활동이 7월 18일 열렸다고 나온다. 실제 행사일이 앞당겨졌더라도 같은 자료는 기념일 자체가 7월 21일이며 매년 기념한다고 명시한다.',[
ev('racial-moe','Singapore Ministry of Education','Racial Harmony Day (RHD), which falls on 21 July, is commemorated annually by schools to enable students to gain a deeper appreciation of racial harmony and social cohesion.'),
ev('racial-moe','Singapore Ministry of Education','joined students and staff at Mayflower Secondary School to commemorate RHD on 18 July.'),
ev('racial-annual','SG101 / Singapore government','Every year on 21 July, we commemorate Racial Harmony Day to remind ourselves that everyone has a role to play to build a harmonious society, and that our diversity can be a source of strength for the common good.')],['최초 제정 연도·제정 배경','법정공휴일 여부'],'NLB 검색 결과의 1997년·1964년 설명은 본문이 빈 JS 셸이라 근거 제외.'))
records.append(record('08-17-black-cat-appreciation-day','검은 고양이 감사의 날','Black Cat Appreciation Day','08-17','미국 동물보호단체·입양 캠페인에서 확인; FOUR PAWS 미국 사이트 참여','민간 동물보호 캠페인; 법정기념일로 확인하지 않음','animal','black cat/검은 고양이/흑묘 이름·id 일치 없음. 세계 고양이의 날(08-08), 한국 고양이의 날(09-09), 미국 고양이의 날(10-29), 길고양이의 날(10-16)과 대상·캠페인 날짜가 다름.','검은 고양이에 대한 편견을 줄이고 보호소 고양이의 입양을 권하는 민간 기념일이다. FOUR PAWS 미국 사이트는 매년 8월 17일 기념하도록 안내한다.','ASPCA는 2017년 이 기념일에 맞춰 8월 17일 검은 고양이 입양 캠페인을 안내했다. 할인 조건은 그 해 행사 내용이며 매년 반복되는 기념일의 일반 규칙으로 쓰지 않는다.',[
ev('black-cat','FOUR PAWS USA','Here at\u00a0FOUR PAWS\u00a0we\u00a0invite\u00a0everyone\u00a0to celebrate\u00a0the\u00a017th\u00a0of\u00a0August\u00a0this year\u00a0and every year.'),
ev('black-cat','FOUR PAWS USA','This special day of the year is now used to remind us all of the value of black cats, to dispel prejudices and to encourage people to give a new home to black cats left behind at animal shelters.'),
ev('black-cat-aspca','ASPCA','Celebrate Black Cat Appreciation Day on August 17!')],['창설자의 이름·창설 경위 독립 확인','법적 지정 여부'],'FOUR PAWS 본문 첫 문장의 August1은 각주 번호 결합으로 보임. 정확한 날짜 근거는 별도 문장 사용. 고양이 색깔에 따른 입양률 일반화는 본문에 넣지 않음.'))
records.append(record('08-17-national-nonprofit-day-us','미국 비영리단체의 날','National Nonprofit Day','08-17','미국 비영리단체·자선단체 캠페인','민간 감사·인식 개선 기념일; 국가 법정기념일로 확인한 것은 아님','career','nonprofit day/비영리단체의 날 이름·id 일치 없음. 국제 자선의 날(09-05), 기부의 날(12월 둘째 월요일)은 대상·운영 범위·날짜가 다름.','미국에서 매년 8월 17일 비영리단체와 자선단체가 지역사회와 세계에 기여하는 노력을 기리는 민간 기념일이다.','Paws for Purple Hearts는 Sherita J. Herring이 사람들의 참여를 교육·격려하고 삶을 개선하는 활동을 인정하기 위해 이 날을 만들었다고 설명한다.',[
ev('nonprofit-org','Paws for Purple Hearts','Did you know that every year, August 17th is a day dedicated to recognize the tremendous effort nonprofits and charities put into making an impact in their communities and across the globe?'),
ev('nonprofit-org','Paws for Purple Hearts','Sherita J. Herring, a renowned speaker, best-selling author and business strategist, founded National Nonprofit Day with the intent to educate, enlighten, and empower others to make a difference, while also acknowledging those that are working to impact and improve lives every day.')],['최초 제정 연도','8월 17일 선택 이유의 법률사적 정확성','국가 법정 지정 여부'],'National Day Calendar 403으로 대체 기관 본문 사용. 1894년 법안 날짜 주장은 독립 법령 원문 검증 전 편집에서 제외.'))
audit=json.loads((OUT/'duplicate-audit.json').read_text())
for old in audit['existing_on_target_dates']:
    records.append(dict(candidate_key=old['id']+'-duplicate-lead',name_ko=old['name'].split(' (')[0],name_original=old['name'],date=old['date'],dateType=old['dateType'],scope='미국; 기존 데이터의 범위',officiality='재검증하지 않음',category=old['category'],status='rejected_duplicate',duplicate_of=old['id'],duplicate_check_notes='같은 날짜·이름·기념 대상의 기존 항목이 있어 신규 후보에서 제외.',origin='',anecdote='',sourceUrl=old.get('sourceUrl'),evidence=[],unverified_fields=['외부 원문 사실은 이 중복 판정에서 재검증하지 않음'],notes='검색 시 나타나는 기존 기념일; 전역 서비스 데이터의 동일 항목과 직접 대조.'))
assert len(records)==9
assert len({r['candidate_key'] for r in records})==9
(OUT/'records.json').write_text(json.dumps({'records':records},ensure_ascii=False,indent=2))
counts=collections.Counter(r['status'] for r in records)
report=['# 희소 생일 날짜 신규 기념일 조사 — group-b','','## 결과','',f'- 전역 서비스 데이터 {audit["baseline_count"]:,}건과 대조. 신규 근거 확보 6건(각 날짜 2건), 중복 제외 3건, 후보 blocked 0건.','- 서비스 데이터 수정·통합·배포 없음. 이 자료는 후보 근거이며 승인 또는 법적 지정의 포괄 검증을 뜻하지 않는다.','- 한국어 검색 후 국제·해외 자료로 범위를 넓혔다. 한국 신규 기념일을 억지로 채우지 않았다.','','## 신규 후보','']
for r in records:
    if r['status']!='evidenced':continue
    citations=''.join(f'[{n}]' for n in dict.fromkeys(e['citation_id'] for e in r['evidence']))
    report += [f'### {r["date"]} — {r["name_ko"]}',f'- 원명: {r["name_original"]}',f'- 범위·공식성: {r["scope"]}; {r["officiality"]}.{citations}',f'- 유래: {r["origin"]}{citations}',f'- 이야기: {r["anecdote"]}{citations}',f'- 중복 판정: {r["duplicate_check_notes"]}',f'- 미확인: {"; ".join(r["unverified_fields"])}',f'- 검수 메모: {r["notes"]}','']
report += ['## 중복·접근 문제','','- 슈가쿠키의 날(07-09), 정크푸드의 날(07-21), 중고 상점의 날(08-17)은 기존 id를 records.json에 남기고 신규에서 제외했다.','- National Day Calendar 비영리단체 페이지는 HTTP 403. 읽을 수 있는 Paws for Purple Hearts 원문으로 핵심 날짜·존재를 확인했다.','- 싱가포르 국립도서관 페이지는 응답을 받았지만 읽을 본문이 없는 JS 셸. 검색 요약의 제정 연도·역사 설명은 사용하지 않고 교육부 및 SG101 본문으로 대체했다.','- 검색 요약과 원문 읽기를 구분했다. 원문 HTML·읽기용 TXT, 접근 시각, 짧은 직접 인용은 evidence 및 records.json에 보관했다.','- 독립 검수와 사용자 승인이 남아 있다. dateType은 여섯 후보 모두 annual-fixed이나 연도별 resolver 검증 결과는 별도 validation.json을 참조한다.','','## 산출물','','- records.json: 후보 9건 및 주장별 근거','- report.md: 한국어 조사 요약','- search-log.json: 날짜별 검색어 및 원 검색 결과','- citations-ledger.json: 이 그룹만의 인용 번호 원장','- duplicate-audit.json: 전역 이름·id 대조와 기존 대상 날짜 항목','- fetch-log.json, evidence/: 본문 조회·접근 실패 및 원문','- validation.json: 실제 resolver 및 필드·인용 검증 결과','']
(OUT/'report.md').write_text('\n'.join(report))
print(cli('render','--style','evidence','--replace-in',str(OUT/'report.md')))
print(cli('verify',str(OUT/'report.md'),'--evidence'))
print(json.dumps(dict(counts),ensure_ascii=False))
