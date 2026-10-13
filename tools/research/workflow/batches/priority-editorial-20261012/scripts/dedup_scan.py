"""읽기 전용: queue 59건을 서비스 월별 JSON·다른 배치 기록과 의미 중복 대조할 단서를 뽑는다.
  python3 -I scripts/dedup_scan.py > /tmp/x"""
import json, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[6]
BATCH = pathlib.Path(__file__).resolve().parents[1]
q = json.loads((BATCH / 'queue.json').read_text())['entries']
items = [a for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')) for a in json.loads(f.read_text())]
print('service items', len(items))
# 키워드: 한국어 핵심어 + 원명 토큰
KW = {
 'rotary-peace-day': ['로터리', 'rotary', '이해와 평화'], 'world-snake-day': ['뱀', 'snake', 'serpent'],
 'myanmar-martyrs-day': ['미얀마', 'myanmar', '아웅산', '순국'], 'ukraine-independence-day': ['우크라이나', 'ukrain'],
 'pluto-demoted-day': ['명왕성', 'pluto'], 'overdose-awareness-day': ['과다복용', 'overdose', '마약', '약물'],
 'african-descent-day': ['아프리카', 'african'], 'korea-film-day': ['영화', 'film', 'movie', 'cinema'],
 'india-constitution-day': ['헌법', 'constitution', '인도'], 'goa-liberation-day': ['고아', 'goa'],
 'hoodie-hoo-day': ['후디', 'hoodie'], 'mean-girls-day': ['퀸카', 'mean-girls', 'mean girls'],
 'its-gonna-be-may': ['엔싱크', 'nsync', 'gonna', '고나'], 'earth-wind-fire-day': ['어스 윈드', 'earth-wind', 'september'],
 'tau-day': ['타우', 'tau', '파이'], 'ninja-day-jp': ['닌자', 'ninja', '忍者'], 'apple-day-kr': ['사과', 'apple'],
 'galentines-day': ['갤런타인', 'galentine', '우정'], 'bubble-wrap-appreciation-day': ['뽁뽁이', 'bubble', '에어캡'],
 'br-dia-do-saci': ['사치', 'saci', '브라질'], 'br-santo-antonio-casamenteiro': ['안토니', 'antonio', 'junina', '6월 축제'],
 'de-siebenschlaefertag': ['잠꾸러기', 'siebenschl', '일곱'], 'de-tag-des-deutschen-bieres': ['맥주', 'beer', 'bier'],
 'es-la-tomatina': ['토마티나', 'tomatina', '토마토'], 'es-ribarteme-ataudes': ['마르타', 'marta', '관'],
 'fr-catherinettes': ['카트린', 'catherin'], 'fr-fete-des-grands-meres': ['할머니', 'grand', '조부모'],
 'pl-dzien-chlopaka': ['소년', '남자친구', 'boyfriend', 'chlopak', '남성의 날'], 'pl-topienie-marzanny': ['마르자나', 'marzann'],
 'th-nai-khanom-tom': ['카놈', 'khanom', '무에타이', 'muay'], 'tr-hidirellez': ['흐드렐레즈', 'hidirellez', 'hıdırellez'],
 'tw-520': ['520', '사랑해'], 'cn-farmers-harvest': ['풍수', '농민', 'harvest', '추분'], 'cn-police-day': ['경찰', 'police'],
 'cn-space-day': ['항천', '우주', 'space', '인공위성'], 'cn-arbor-day': ['식수', '식목', 'arbor', '나무'],
 'hk-villain-hitting': ['소인', 'villain', '경칩'], 'hk-fire-dragon': ['불용', 'fire-dragon', '다이항'],
 'id-batik-day': ['바틱', 'batik'], 'id-santri-day': ['산트리', 'santri'], 'in-hindi-diwas': ['힌디', 'hindi'],
 'in-science-day': ['과학의 날', 'science', '라만'], 'jp-shichigosan': ['시치고산', 'shichigosan', '七五三'],
 'jp-keiro-no-hi': ['경로', 'keiro', '노인', '敬老'], 'jp-yama-no-hi': ['산의 날', 'mountain', 'yama'],
 'jp-setsubun': ['세쓰분', 'setsubun', '節分', '입춘'], 'jp-seijin-no-hi': ['성인의 날', '성년', 'seijin', 'coming-of-age'],
 'mn-naadam': ['나담', 'naadam', '몽골'], 'my-malaysia-day': ['말레이시아', 'malaysia'], 'my-kaamatan': ['카아마탄', 'kaamatan', '사바'],
 'my-gawai': ['가와이', 'gawai', '사라왁'], 'ph-heroes-day': ['영웅', 'heroes', '필리핀'], 'ph-simbang-gabi': ['심방', 'simbang', '필리핀'],
 'sg-total-defence-day': ['총방위', 'defence', '싱가포르'], 'th-songkran': ['송끄란', 'songkran', '태국'],
 'tw-228-peace-day': ['228', '2·28', '대만'], 'tw-indigenous-day': ['원주민', 'indigenous'], 'tw-disaster-prevention-day': ['방재', 'disaster', '지진'],
 'vn-doctors-day': ['의사', 'doctor', '베트남'],
}
others = []
for rp in (ROOT / 'tools/research/workflow/batches').glob('*/records.json'):
    if 'priority-editorial' in str(rp): continue
    for r in json.loads(rp.read_text()).get('records', []):
        others.append((rp.parent.name, r.get('candidate_key'), f"{r.get('name_ko','')} {r.get('name_original','')}", r.get('status') or r.get('discovery_status') or r.get('research_status')))
for e in q:
    k = e['candidate_key']; kws = [w.lower() for w in KW[k]]
    hay = lambda a: f"{a['name']} {a['id']}".lower()
    same = [f"{a['id']}|{a['name']}" for a in items if a['date'] == e['date_rule']]
    hits = [f"{a['id']}|{a['date']}|{a['name']}" for a in items if any(w in hay(a) for w in kws)]
    prior = [f"{b}:{ck}({st})" for b, ck, n, st in others if ck != k and any(w in n.lower() for w in kws)]
    print('=' * 60, e['uid'], e['date_rule'])
    print('  same-date:', same[:12])
    print('  name-hits:', hits[:14])
    print('  prior-batches:', prior[:10])
