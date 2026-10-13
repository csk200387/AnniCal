"""이전 세 배치 + 이번 아시아 배치의 records.json 을 파싱해 통합 목록을 만든다(읽기 전용 입력).

    python3 -I scripts/consolidate.py [--state 진행중|완료]

출력:
  tools/research/reports/annical-research-consolidated-20261012.{json,csv,md}
  <이 배치>/prior-verification.json  — 원본 해시·인용 재검사, 서비스·배치 간 중복 자동 스캔 결과

기존 report 의 숫자를 쓰지 않고 records 를 직접 센다. 사실 검수 승인 상태를 만들지 않는다(fact_review=pending 고정).
중복 판정: 자동 스캔은 힌트일 뿐이고, 최종 판정은 data/dedup-decisions.json(이전 후보) 과
각 신규 기록의 duplicate_check(이번 배치) 를 따른다.
"""
import csv
import hashlib
import json
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

BATCH = Path(__file__).resolve().parent.parent
BATCHES = BATCH.parent
ROOT = BATCHES.parents[3]
OUT = ROOT / 'tools/research/reports'
STEM = 'annical-research-consolidated-20261012'
PRIOR = ['contact-expansion-20261012', 'quirky-discovery-20261012', 'native-languages-20261012']
ALL_BATCHES = PRIOR + [BATCH.name]
SHORT = {'contact-expansion-20261012': 'contact', 'quirky-discovery-20261012': 'quirky',
         'native-languages-20261012': 'native', BATCH.name: 'asia'}
TARGET15 = ['JP', 'CN', 'TW', 'HK', 'MN', 'VN', 'TH', 'ID', 'MY', 'PH', 'SG', 'IN', 'NP', 'BD', 'LK']
COUNTRY_KO = {'JP': '일본', 'CN': '중국', 'TW': '대만', 'HK': '홍콩', 'MN': '몽골', 'VN': '베트남', 'TH': '태국',
              'ID': '인도네시아', 'MY': '말레이시아', 'PH': '필리핀', 'SG': '싱가포르', 'IN': '인도', 'NP': '네팔',
              'BD': '방글라데시', 'LK': '스리랑카', 'KR': '한국', 'MM': '미얀마', 'US': '미국', 'GB': '영국', 'IE': '아일랜드',
              'BR': '브라질', 'DE': '독일', 'ES': '스페인', 'FR': '프랑스', 'PL': '폴란드', 'TR': '튀르키예',
              'UA': '우크라이나', 'ME': '몬테네그로', 'INTL': '국제'}

# contact·quirky 기록에는 country 필드가 없어 후보 키·scope 를 읽고 손으로 정했다.
PRIOR_COUNTRY = {
    'fuji-day-jp': 'JP', 'rotary-peace-day': 'INTL', 'montenegro-statehood-day': 'ME', 'world-snake-day': 'INTL',
    'myanmar-martyrs-day': 'MM', 'ukraine-independence-day': 'UA', 'pluto-demoted-day': 'INTL',
    'overdose-awareness-day': 'INTL', 'african-descent-day': 'INTL', 'world-gorilla-day': 'INTL',
    'korea-film-day': 'KR', 'india-constitution-day': 'IN', 'goa-liberation-day': 'IN', 'world-rock-day-br': 'BR',
    'japan-first-flight-day': 'JP',
    'hoodie-hoo-day': 'US', 'plan-your-epitaph-day': 'US', 'tell-a-lie-day': 'US', 'ask-a-stupid-question-day': 'US',
    'no-socks-day': 'US', 'yell-fudge-cobras-day': 'US', 'answer-your-cats-questions-day': 'US',
    'caps-lock-day': 'INTL', 'mean-girls-day': 'INTL', 'its-gonna-be-may': 'INTL', 'revenge-of-the-sixth': 'INTL',
    'blue-monday': 'GB', 'earth-wind-fire-day': 'INTL', 'tau-day': 'INTL', 'ninja-day-jp': 'JP', 'cheonsa-day-kr': 'KR',
    'apple-day-kr': 'KR', 'galentines-day': 'US', 'national-boyfriend-day': 'INTL', 'kokuhaku-day-jp': 'JP',
    'ii-fufu-day-jp': 'JP', 'world-introvert-day': 'INTL', 'bubble-wrap-appreciation-day': 'US',
    'ugly-christmas-sweater-day': 'US', 'international-geocaching-day': 'INTL', 'kushi-day-jp': 'JP',
    'pants-day-jp': 'JP', 'futon-day-jp': 'JP', 'defy-superstition-day': 'US', 'yurei-day-jp': 'JP',
    'put-a-pillow-on-your-fridge-day': 'INTL',
    'existing:anv-fixed-05-09-lost-sock-memorial-day-us': 'US', 'existing:anv-fixed-08-06-wiggle-your-toes-day-us': 'US',
    'existing:anv-fixed-08-08-sneak-zucchini-day-us': 'US', 'existing:anv-fixed-12-23-festivus-us': 'US',
    'existing:anv-fixed-10-09-leif-erikson-day-us': 'US', 'existing:anv-fixed-05-25-towel-day': 'INTL',
    'existing:anv-fixed-09-22-hobbit-day-global': 'INTL', 'existing:anv-fixed-08-17-black-cat-appreciation-day-us': 'US',
    'existing:anv-fixed-02-29-bachelors-day-ie': 'IE', 'existing:anv-fixed-04-23-talk-like-shakespeare-day-us': 'US',
    'existing:anv-fixed-12-08-time-traveler-day-global': 'INTL',
    'existing:anv-fixed-09-19-talk-like-a-pirate-day-global': 'INTL',
    'existing:anv-fixed-12-05-ninja-day-global': 'INTL',
}
CONTACT_KIND = {
    'fuji-day-jp': 'regional_official', 'rotary-peace-day': 'international', 'montenegro-statehood-day': 'national_official',
    'world-snake-day': 'nature_animal', 'myanmar-martyrs-day': 'national_official',
    'ukraine-independence-day': 'national_official', 'pluto-demoted-day': 'quirky_unofficial',
    'overdose-awareness-day': 'international', 'african-descent-day': 'international', 'world-gorilla-day': 'nature_animal',
    'korea-film-day': 'occupation_culture', 'india-constitution-day': 'national_official',
    'goa-liberation-day': 'regional_official', 'world-rock-day-br': 'occupation_culture',
    'japan-first-flight-day': 'occupation_culture',
}
CONTACT_OFFICIALITY = {
    'fuji-day-jp': 'regional_official', 'rotary-peace-day': 'organization', 'montenegro-statehood-day': 'official',
    'world-snake-day': 'unofficial', 'myanmar-martyrs-day': 'official', 'ukraine-independence-day': 'official',
    'pluto-demoted-day': 'unofficial', 'overdose-awareness-day': 'organization', 'african-descent-day': 'international_org',
    'world-gorilla-day': 'organization', 'korea-film-day': 'industry', 'india-constitution-day': 'official',
    'goa-liberation-day': 'regional_official', 'world-rock-day-br': 'unofficial', 'japan-first-flight-day': 'unknown',
}
# contact 기록의 claims(establishing_body·establishment_year 등 판정)를 읽고 정했다.
CONTACT_FOUNDER = {
    'fuji-day-jp': 'confirmed', 'rotary-peace-day': 'partial', 'montenegro-statehood-day': 'partial',
    'world-snake-day': 'unverified', 'myanmar-martyrs-day': 'partial', 'ukraine-independence-day': 'confirmed',
    'pluto-demoted-day': 'unverified', 'overdose-awareness-day': 'confirmed', 'african-descent-day': 'confirmed',
    'world-gorilla-day': 'confirmed', 'korea-film-day': 'unverified', 'india-constitution-day': 'confirmed',
    'goa-liberation-day': 'partial', 'world-rock-day-br': 'partial', 'japan-first-flight-day': 'unverified',
}
KIND_GROUP_LABEL = {
    'national_official': '국가 공식 기념일·국경일', 'regional_official': '지방 공식(조례·주법)', 'international': '국제기구·국제 캠페인',
    'folk_religious': '민속·종교·전통 명절', 'festival_local': '지역 축제', 'occupation_culture': '직업·문화·업계',
    'relationship': '관계·가족·연인', 'quirky_unofficial': '이색·밈·비공식', 'nature_animal': '자연·동물',
}
OFFICIALITY_LABEL = {
    'official': '공식(국가)', 'regional_official': '공식(지방·주)', 'international_org': '국제기구 지정',
    'organization': '단체 지정(비정부)', 'industry': '업계 기념일', 'folk_tradition': '민속·종교 전통',
    'regional_festival': '지역 축제', 'commercial': '상업 기원', 'unofficial': '비공식', 'unknown': '미확인',
}
EVIDENCE_LABEL = {
    'original_multi': '원문 확인(독립 출처 2곳 이상)', 'original_single': '원문 확인(단일 출처)',
    'listing_only': '기념일 목록 사이트만', 'search_result_only': '검색결과만(원문 미확인)', 'blocked': '차단·근거 부족',
}
DEDUP_LABEL = {'new': '신규(중복 없음)', 'service_duplicate': '기존 서비스 중복', 'prior_duplicate': '이전 조사 후보와 중복'}
APP_LABEL = {'supported': '앱 규칙으로 표현 가능', 'supported_tabulated': '기존 observances 키로 표현 가능',
             'unsupported': '앱 날짜 규칙 미지원(음력·종교력·부활절 등 표 없음)', 'undetermined': '날짜 미확정'}
OFFICIALITY_NATIVE = {
    'official_state_law': 'regional_official', 'official_cabinet_resolution': 'official', 'official_national': 'official',
    'official_observance_not_holiday': 'official', 'regional_tradition': 'folk_tradition', 'regional_festival': 'regional_festival',
    'folk_tradition': 'folk_tradition', 'folk_tradition_unesco_listed': 'folk_tradition',
    'religious_feast_folk_custom': 'folk_tradition', 'folk_business_custom': 'folk_tradition', 'commercial': 'commercial',
    'industry': 'industry', 'industry_folk': 'industry', 'unofficial': 'unofficial', 'unverified': 'unknown',
}
FOUNDER_CHECK = {  # 원본 표기 → confirmed / partial / unverified / not_applicable
    'original_read': 'confirmed', 'organizer_original': 'confirmed', 'official_law_text_read': 'confirmed',
    'official_unesco_page_read': 'confirmed', 'original_read_history_portal': 'confirmed', 'original_read_news': 'confirmed',
    'original_read_multiple_versions': 'partial', 'original_read_secondary_site': 'partial',
    'original_read_news_official_page_blocked': 'partial', 'original_read_news_regulation_date_unverified': 'partial',
    'date_reason_read_founding_year_search_only': 'partial', 'partial_original': 'partial', 'hedged_by_source': 'partial',
    'secondary_hearsay': 'partial', 'single_news_column': 'partial', 'founder_unknown_single_outlet': 'unverified',
    'original_read_unknown_founder': 'unverified', 'unknown_stated_by_source': 'unverified',
    'single_listing': 'unverified', 'search_result_only': 'unverified', 'listing_sites_only': 'unverified',
    'listing_sites_only_no_founder': 'unverified', 'single_source_unverified': 'unverified', 'conflicting': 'unverified',
    'conflicting_sources': 'unverified', 'origin_period_conflicting_sources': 'unverified',
    'origin_unreliable_conflated': 'unverified', 'search_result_only_conflicting': 'unverified',
    'folklore_conflicting': 'not_applicable', 'folklore_not_history': 'not_applicable', 'origin_unknown_pun': 'not_applicable',
    'folk_custom_news': 'not_applicable', 'duplicate': 'not_applicable',
}
FOUNDER_LABEL = {'confirmed': '제정·기원 원문 확인', 'partial': '부분 확인', 'unverified': '제정 미확인',
                 'not_applicable': '해당 없음(민속·자연발생·중복)'}


def load(p):
    return json.loads(Path(p).read_text())


def domain(url):
    host = urlparse(url or '').netloc.lower()
    return host[4:] if host.startswith('www.') else host


def service_items():
    return [a for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')) for a in load(f)]


def app_support(date_type, date_rule, observance_keys):
    if date_type in ('annual-fixed', 'annual-nth-weekday') and date_rule:
        return 'supported'
    if date_type == 'annual-tabulated':
        return 'supported_tabulated' if date_rule in observance_keys else 'unsupported'
    if date_type == 'annual-relative-to-holiday' and date_rule:
        return 'supported'
    return None


def check_quotes(batch_dir, rec, text_key, ev_by_id_global):
    """claims 의 인용이 저장된 본문에 그대로 있는지. 다른 후보 폴더의 근거를 가리키면 batch 전체 근거에서 찾는다."""
    ev_by_id = {e['evidence_id']: e for e in rec.get('evidence', [])}
    total = matched = 0
    issues = []
    for c in rec.get('claims', []):
        for ref in c.get('evidence', []):
            total += 1
            e = ev_by_id.get(ref['evidence_id'])
            cross = None
            if e is None:
                cross = ev_by_id_global.get(ref['evidence_id'])
                issues.append({'claim': c['claim_id'], 'issue': 'missing_evidence_reference',
                               'evidence': ref['evidence_id'],
                               'found_in_batch_fetch_log': cross['text_path'] if cross else None})
                if not cross:
                    continue
                path = batch_dir / cross['text_path']
            else:
                rel = e.get(text_key) or e.get('local_text_path') or e.get('local_evidence_path')
                if not rel:
                    issues.append({'claim': c['claim_id'], 'issue': 'no_local_text', 'evidence': ref['evidence_id']})
                    continue
                path = batch_dir / rel
            body = path.read_text(encoding='utf-8')
            q = ref['quote']
            if q in body:
                if e is not None:
                    matched += 1
                else:
                    issues[-1]['quote_found_in_cross_reference'] = True
            elif re.sub(r'\s+', ' ', q) in re.sub(r'\s+', ' ', body):
                matched += 1
                issues.append({'claim': c['claim_id'], 'issue': 'quote_matches_only_after_whitespace_normalization',
                               'evidence': ref['evidence_id']})
            else:
                issues.append({'claim': c['claim_id'], 'issue': 'quote_not_found', 'evidence': ref['evidence_id']})
    return total, matched, issues


def check_hashes(batch_dir, rec):
    total = matched = 0
    issues = []
    for e in rec.get('evidence', []):
        if not e.get('sha256') or not e.get('local_raw_path'):
            continue
        total += 1
        got = hashlib.sha256((batch_dir / e['local_raw_path']).read_bytes()).hexdigest()
        if got == e['sha256']:
            matched += 1
        else:
            issues.append({'issue': 'raw_sha256_mismatch', 'evidence': e['evidence_id']})
    return total, matched, issues


def normalize_contact(r):
    supported = [c for c in r['claims'] if c['verdict'].startswith('supported')]
    cited = {ref['evidence_id'] for c in supported for ref in c['evidence']}
    pubs = {e['publisher'].split(' (')[0] for e in r['evidence'] if e['evidence_id'] in cited}
    if r['status'] == 'blocked':
        level = 'blocked'
    elif r['status'] == 'review' or len(pubs) < 2:
        level = 'original_single'
    else:
        level = 'original_multi'
    founder_check = CONTACT_FOUNDER[r['candidate_key']]
    draft = r.get('draft') or {}
    return dict(
        country=PRIOR_COUNTRY[r['candidate_key']], name_original=r['name_original'], name_ko=r['name_ko'],
        aliases=r['aliases'], date_type=r['date_type'], date_rule=r['date_rule'], date_note=None,
        scope=r['scope_country_or_region'], kind_original=None, kind_group=CONTACT_KIND[r['candidate_key']],
        officiality_original=r['officiality'], officiality_class=CONTACT_OFFICIALITY[r['candidate_key']],
        meaning_ko=(draft.get('origin') or '')[:260], founder_origin=None, founder_check=founder_check,
        original_status=r['status'], original_status_label={'evidenced': '근거 확보', 'review': '추가 검토 필요',
                                                             'blocked': '보류(근거 부족)'}[r['status']],
        evidence_level=level, date_status='ok' if r['date_rule'] else 'undetermined', confidence=None,
        read_urls=[e['url'] for e in r['evidence'] if e['access_status'] == 'body_read_http_200'],
        search_only_urls=[], failed_urls=[f['url'] for f in r.get('failed_access_attempts', [])],
        uncertainty='; '.join(r.get('unverified_fields') or []) or None,
        conflicting_claims=[c['claim_id'] for c in r['claims'] if c['verdict'] == 'conflicting'],
        dedup_hint=r.get('duplicate_of'),
    )


def normalize_quirky(r):
    st = r['discovery_status']
    ev = r.get('evidence', [])
    cited = {ref['evidence_id'] for c in r.get('claims', []) if c['verdict'] == 'supported_by_original'
             for ref in c['evidence']}
    doms = {domain(e['url']) for e in ev if e['evidence_id'] in cited and e.get('read_status') == 'original_read'}
    if st == 'duplicate':
        level = 'original_multi' if len(doms) >= 2 else ('original_single' if doms else 'search_result_only')
    elif st == 'blocked':
        level = 'search_result_only'
    elif st == 'discovered_unverified' or r.get('single_listing_source') or r.get('listing_sources_only'):
        level = 'listing_only'
    else:
        level = 'original_multi' if len(doms) >= 2 else 'original_single'
    kind = r.get('kind')
    dc = r.get('duplicate_check') or {}
    return dict(
        country=PRIOR_COUNTRY[r['candidate_key']], name_original=r['name_original'], name_ko=r['name_ko'],
        aliases=r.get('aliases') or [], date_type=r.get('date_type'), date_rule=r.get('date_rule'),
        date_note=r.get('date_note'), scope=r.get('scope'), kind_original=kind,
        kind_group='relationship' if kind == 'relationship' else 'quirky_unofficial',
        officiality_original=r.get('officiality'), officiality_class='unofficial',
        meaning_ko=r.get('meaning') or r.get('note'),
        founder_origin=r.get('founder_origin'),
        founder_check=FOUNDER_CHECK.get(r.get('founder_origin_check'), 'not_applicable'),
        original_status=st, original_status_label=r.get('discovery_status_label'),
        evidence_level=level,
        date_status='conflict' if st == 'date_conflict' else ('ok' if r.get('date_rule') else 'undetermined'),
        confidence=r.get('confidence'),
        read_urls=[e['url'] for e in ev if e.get('read_status') == 'original_read'],
        search_only_urls=[s['url'] for s in r.get('search_result_only', [])],
        failed_urls=[e['url'] for e in ev if e.get('read_status') != 'original_read'],
        uncertainty=r.get('caution'),
        conflicting_claims=[c['claim_id'] for c in r.get('claims', []) if c['verdict'] == 'conflicting'],
        dedup_hint=dc.get('existing_id') if dc.get('verdict') == 'duplicate_of_existing' else None,
    )


def normalize_native_like(r):
    """native-languages 와 이번 asia 배치(같은 형식)."""
    st = r['status']
    level = {'search_result_only': 'search_result_only', 'blocked': 'blocked',
             'new_candidate_single_source': 'original_single'}.get(st)
    if level is None:
        orgs = {o.split(' (')[0] for o in r.get('cited_source_orgs', [])}
        level = 'original_multi' if len(orgs) >= 2 else ('original_single' if r.get('original_read') else 'search_result_only')
    if r.get('listing_only'):
        level = 'listing_only'
    dc = r.get('duplicate_check') or {}
    return dict(
        country=r['country'], name_original=r['name_original'], name_ko=r['name_ko'], aliases=r.get('aliases') or [],
        date_type=r.get('date_type'), date_rule=r.get('date_rule'), date_note=r.get('date_note'), scope=r.get('scope'),
        kind_original=r.get('kind'), kind_group=r.get('kind_group') or NATIVE_KIND_GROUP.get(r['candidate_key']),
        officiality_original=r.get('officiality'),
        officiality_class=r.get('officiality_class') or OFFICIALITY_NATIVE.get(r.get('officiality'), 'unknown'),
        meaning_ko=r.get('meaning_ko'), founder_origin=r.get('founder_origin'),
        founder_check=r.get('founder_check') or FOUNDER_CHECK.get(r.get('founder_check_level'), 'unverified'),
        original_status=st, original_status_label=r.get('status_label'), evidence_level=level,
        date_status=r.get('date_status') or ('ok' if r.get('date_rule') or r.get('date_note') else 'undetermined'),
        confidence=r.get('confidence'),
        read_urls=[e['url'] for e in r.get('evidence', []) if e.get('read_status') == 'original_read'],
        search_only_urls=[s['url'] for s in r.get('search_result_only', [])],
        failed_urls=[e['url'] for e in r.get('evidence', []) if e.get('read_status') != 'original_read'],
        uncertainty=r.get('uncertainty'),
        conflicting_claims=[c['claim_id'] for c in r.get('claims', []) if c['verdict'] == 'conflicting'],
        dedup_hint=dc.get('duplicate_of'), prior_hint=dc.get('prior_candidate_of'),
        app_date_support_record=r.get('app_date_support'), date_rule_folk=r.get('date_rule_folk'),
    )


NATIVE_KIND_GROUP = {
    'br-dia-do-saci': 'folk_religious', 'br-santo-antonio-casamenteiro': 'relationship', 'br-dia-da-sogra': 'relationship',
    'de-weiberfastnacht': 'festival_local', 'de-siebenschlaefertag': 'folk_religious',
    'de-tag-des-deutschen-bieres': 'occupation_culture', 'es-la-tomatina': 'festival_local',
    'es-ribarteme-ataudes': 'festival_local', 'es-el-colacho': 'festival_local', 'es-santos-inocentes': 'quirky_unofficial',
    'fr-catherinettes': 'relationship', 'fr-fete-des-grands-meres': 'relationship', 'pl-dzien-wagarowicza': 'quirky_unofficial',
    'pl-andrzejki': 'folk_religious', 'pl-dzien-chlopaka': 'relationship', 'pl-topienie-marzanny': 'folk_religious',
    'th-wan-khru': 'occupation_culture', 'th-nai-khanom-tom': 'occupation_culture', 'tr-hidirellez': 'folk_religious',
    'tr-ogretmenler-gunu': 'occupation_culture', 'tr-turk-kahvesi-gunu': 'occupation_culture', 'tw-520': 'relationship',
    'tw-teachers-day-928': 'occupation_culture', 'tw-weiya': 'folk_religious',
}

STOP = set('day days national international world of the and a an in on at to for your you de do da des la le el '
           'dia día tag des der die das du dzien dzień gunu günü'.split())


def tokens(*names):
    out = set()
    for n in names:
        for t in re.findall(r'[a-z0-9]+', (n or '').lower()):
            if len(t) > 2 and t not in STOP:
                out.add(t)
    return out


def cjk_core(name):
    s = re.sub(r'[（(].*?[)）]', '', name or '')
    s = re.sub(r'の日$|日$|節$|节$|祭$|デー$', '', s)
    return s if re.search(r'[\u3040-\u9fff\uac00-\ud7af\u0e00-\u0e7f\u0900-\u0dff]', s) and len(s) >= 2 else None


def scan_service(entry, items):
    """같은 날짜 + 이름 토큰 1개 이상, 또는 날짜 무관 토큰 2개 이상, 또는 원어 핵심어 포함 → 힌트."""
    tk = tokens(entry['name_original'], *entry['aliases'])
    core = cjk_core(entry['name_original'])
    hints = []
    for a in items:
        hay = (a['id'] + ' ' + a['name']).lower()
        atk = tokens(a['id'].replace('-', ' '), a['name'])
        common = tk & atk
        same_date = entry['date_rule'] is not None and a['date'] == entry['date_rule']
        if (same_date and common) or len(common) >= 2 or (core and core.lower() in hay):
            hints.append({'id': a['id'], 'name': a['name'], 'date': a['date'], 'same_date': same_date,
                          'common_tokens': sorted(common)})
    return hints


def scan_prior(entry, others):
    tk = tokens(entry['name_original'], *entry['aliases'])
    core = cjk_core(entry['name_original'])
    hints = []
    for o in others:
        if o['uid'] == entry['uid']:
            continue
        otk = tokens(o['name_original'], *o['aliases'])
        common = tk & otk
        same_date = entry['date_rule'] and entry['date_rule'] == o['date_rule']
        ocore = cjk_core(o['name_original'])
        if (same_date and common) or len(common) >= 2 or (core and ocore and (core in ocore or ocore in core)):
            hints.append({'uid': o['uid'], 'name_original': o['name_original'], 'date_rule': o['date_rule'],
                          'common_tokens': sorted(common)})
    return hints


def main():
    state = sys.argv[sys.argv.index('--state') + 1] if '--state' in sys.argv else '진행중'
    items = service_items()
    service_ids = {a['id'] for a in items}
    obs_keys = set(load(ROOT / 'src/data/observances.json'))
    decisions = load(BATCH / 'data/dedup-decisions.json') if (BATCH / 'data/dedup-decisions.json').exists() else {}
    entries = []
    raw_counts = {}
    for b in ALL_BATCHES:
        p = BATCHES / b / 'records.json'
        if not p.exists():
            raw_counts[b] = 0
            continue
        recs = load(p)['records']
        raw_counts[b] = len(recs)
        bdir = BATCHES / b
        fl = load(bdir / 'fetch-log.json') if (bdir / 'fetch-log.json').exists() else []
        ev_global = {}
        for e in fl:
            if e.get('text_path'):
                ev_global.setdefault(e['label'], e)
                ev_global.setdefault(f"{e['candidate_key']}/{e['label']}", e)
        for r in recs:
            if b == 'contact-expansion-20261012':
                n = normalize_contact(r)
                qt, qm, qi = check_quotes(bdir, r, 'local_evidence_path', ev_global)
            elif b == 'quirky-discovery-20261012':
                n = normalize_quirky(r)
                qt, qm, qi = check_quotes(bdir, r, 'local_text_path', ev_global)
            else:
                n = normalize_native_like(r)
                qt, qm, qi = check_quotes(bdir, r, 'local_text_path', ev_global)
            ht, hm, hi = check_hashes(bdir, r)
            uid = f"{SHORT[b]}:{r['candidate_key']}"
            app = n.pop('app_date_support_record', None) or app_support(n['date_type'], n['date_rule'], obs_keys)
            if app is None:
                app = 'unsupported' if n['date_note'] and n['date_status'] != 'undetermined' else 'undetermined'
            entries.append({
                'uid': uid, 'source_batch': b, 'candidate_key': r['candidate_key'],
                'source_record_path': f'tools/research/workflow/batches/{b}/records.json',
                'source_report_path': f'tools/research/workflow/batches/{b}/report.md',
                'evidence_dir': f'tools/research/workflow/batches/{b}/evidence/{r["candidate_key"]}',
                **n, 'country_ko': COUNTRY_KO.get(n['country'], n['country']),
                'region': ('asia_target15' if n['country'] in TARGET15 else
                           'asia_other' if n['country'] in ('KR', 'MM') else
                           'international' if n['country'] == 'INTL' else 'non_asia'),
                'app_date_support': app,
                'checks': {'quotes_total': qt, 'quotes_matched': qm, 'raw_hashes_total': ht, 'raw_hashes_matched': hm,
                           'issues': qi + hi},
                'fact_review': 'pending',
            })
    by_uid = {e['uid']: e for e in entries}
    scan = []
    for e in entries:
        sh = scan_service(e, items)
        ph = scan_prior(e, [o for o in entries if ALL_BATCHES.index(o['source_batch']) <= ALL_BATCHES.index(e['source_batch'])])
        d = decisions.get(e['uid'])
        if e['source_batch'] == BATCH.name:
            verdict = ('service_duplicate' if e.get('dedup_hint') else 'prior_duplicate' if e.get('prior_hint') else 'new')
            ref = e.get('dedup_hint') or e.get('prior_hint')
            note = None
        elif d:
            verdict, ref, note = d['verdict'], d.get('ref'), d.get('note')
        else:
            verdict = 'service_duplicate' if e.get('dedup_hint') else 'new'
            ref, note = e.get('dedup_hint'), None
        if verdict == 'service_duplicate' and ref and ref not in service_ids:
            e['checks']['issues'].append({'issue': 'duplicate_ref_not_in_service', 'ref': ref})
        if verdict == 'prior_duplicate' and ref and ref not in by_uid:
            e['checks']['issues'].append({'issue': 'prior_ref_not_found', 'ref': ref})
        e['dedup'] = {'verdict': verdict, 'ref': ref, 'note': note, 'auto_service_hints': len(sh), 'auto_prior_hints': len(ph)}
        undecided = (sh or ph) and e['source_batch'] != BATCH.name and not d
        scan.append({'uid': e['uid'], 'service_hints': sh, 'prior_hints': ph, 'decision': d, 'undecided': bool(undecided)})
        for k in ('dedup_hint', 'prior_hint'):
            e.pop(k, None)

    for e in entries:  # 우선 검토 후보: 신규 + 원문 다중 + 날짜 확정 + 앱 표현 가능 + 인용·해시 문제 없음
        clean = not [i for i in e['checks']['issues'] if i['issue'] != 'quote_matches_only_after_whitespace_normalization']
        e['review_priority'] = (e['dedup']['verdict'] == 'new' and e['evidence_level'] == 'original_multi'
                                and e['date_status'] == 'ok' and e['app_date_support'] in ('supported', 'supported_tabulated')
                                and clean)
    write_outputs(entries, raw_counts, scan, state, items)


def write_outputs(entries, raw_counts, scan, state, items):
    OUT.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc).isoformat(timespec='seconds')
    asia_search = load(BATCH / 'search-log.json') if (BATCH / 'search-log.json').exists() else []
    progress = load(BATCH / 'data/progress-state.json') if (BATCH / 'data/progress-state.json').exists() else {}
    corrections = load(BATCH / 'corrections.json') if (BATCH / 'corrections.json').exists() else {'corrections': []}
    summary = summarize(entries, raw_counts)
    summary['asia_search_count'] = len(asia_search)
    summary['asia_search_by_country'] = dict(Counter(s['country'] for s in asia_search))
    (BATCH / 'prior-verification.json').write_text(json.dumps({
        'generated_at': now, 'note': '자동 스캔 힌트는 판정이 아니다. decision 이 최종 판정.',
        'quote_totals': {b: [sum(e['checks']['quotes_total'] for e in entries if e['source_batch'] == b),
                             sum(e['checks']['quotes_matched'] for e in entries if e['source_batch'] == b)] for b in ALL_BATCHES},
        'hash_totals': {b: [sum(e['checks']['raw_hashes_total'] for e in entries if e['source_batch'] == b),
                            sum(e['checks']['raw_hashes_matched'] for e in entries if e['source_batch'] == b)] for b in ALL_BATCHES},
        'issues': [{'uid': e['uid'], **i} for e in entries for i in e['checks']['issues']],
        'dedup_scan': scan,
    }, ensure_ascii=False, indent=1) + '\n')
    doc = {'title': 'AnniCal 기념일 조사 통합 목록 (2026-10-12)', 'state': state, 'generated_at': now,
           'note': '조사 후보 목록이다. 사실 검수·승인·서비스 반영 상태가 아니다(fact_review=pending).',
           'summary': summary, 'labels': {'kind_group': KIND_GROUP_LABEL, 'officiality_class': OFFICIALITY_LABEL,
                                          'evidence_level': EVIDENCE_LABEL, 'dedup': DEDUP_LABEL,
                                          'app_date_support': APP_LABEL, 'founder_check': FOUNDER_LABEL},
           'entries': entries}
    (OUT / f'{STEM}.json').write_text(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
    cols = ['uid', 'source_batch', 'candidate_key', 'country', 'country_ko', 'region', 'name_original', 'name_ko',
            'aliases', 'date_type', 'date_rule', 'date_note', 'date_status', 'app_date_support', 'scope', 'kind_group',
            'kind_original', 'officiality_class', 'officiality_original', 'evidence_level', 'founder_check',
            'original_status', 'dedup_verdict', 'dedup_ref', 'confidence', 'review_priority', 'fact_review',
            'quotes_matched', 'quotes_total', 'issues', 'read_urls', 'search_only_urls', 'failed_urls',
            'meaning_ko', 'uncertainty', 'source_record_path', 'evidence_dir']
    with (OUT / f'{STEM}.csv').open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(cols)
        for e in entries:
            row = {**e, 'dedup_verdict': e['dedup']['verdict'], 'dedup_ref': e['dedup']['ref'],
                   'quotes_matched': e['checks']['quotes_matched'], 'quotes_total': e['checks']['quotes_total'],
                   'issues': '; '.join(i['issue'] for i in e['checks']['issues'])}
            w.writerow([' | '.join(row[c]) if isinstance(row.get(c), list) else ('' if row.get(c) is None else row[c])
                        for c in cols])
    (OUT / f'{STEM}.md').write_text(render_md(entries, summary, state, now, progress, corrections, asia_search))
    asia = [e for e in entries if e['source_batch'] == BATCH.name]
    (BATCH / 'progress.md').write_text(
        f'# asia-expansion-20261012 진행 상황\n\n- 상태: {state} · 갱신 {now}\n'
        f"- 완료 국가: {', '.join(progress.get('done', [])) or '없음'}\n- 남은 국가: {', '.join(progress.get('remaining', [])) or '없음'}\n"
        f'- 이번 배치 기록 {len(asia)}건 · 현지어 검색 {len(asia_search)}회 · 상태별 {dict(Counter(e["original_status"] for e in asia))}\n'
        f"- 메모: {progress.get('note', '')}\n\n## 남은 작업\n" + ''.join(f'- {t}\n' for t in progress.get('todo', [])))
    print(json.dumps(summary, ensure_ascii=False, indent=1))


def summarize(entries, raw_counts):
    s = {'raw_record_counts': raw_counts, 'raw_total': sum(raw_counts.values()), 'consolidated_total': len(entries)}
    s['dedup'] = dict(Counter(e['dedup']['verdict'] for e in entries))
    uniq = [e for e in entries if e['dedup']['verdict'] == 'new']
    s['unique_candidates'] = len(uniq)
    s['unique_by_evidence'] = dict(Counter(e['evidence_level'] for e in uniq))
    s['unique_holds'] = {
        'date_conflict': sum(e['date_status'] == 'conflict' for e in uniq),
        'date_undetermined': sum(e['date_status'] == 'undetermined' for e in uniq),
        'app_date_unsupported': sum(e['app_date_support'] == 'unsupported' for e in uniq),
        'weak_source(listing/search/blocked/single)': sum(e['evidence_level'] != 'original_multi' for e in uniq),
        'founder_unverified': sum(e['founder_check'] == 'unverified' for e in uniq),
    }
    s['unique_review_priority'] = sum(e['review_priority'] for e in uniq)
    s['by_batch'] = {b: dict(Counter(e['dedup']['verdict'] for e in entries if e['source_batch'] == b)) for b in ALL_BATCHES}
    s['unique_by_country'] = dict(Counter(e['country'] for e in uniq).most_common())
    s['unique_by_kind_group'] = dict(Counter(e['kind_group'] for e in uniq).most_common())
    s['unique_by_officiality'] = dict(Counter(e['officiality_class'] for e in uniq).most_common())
    s['quotes'] = [sum(e['checks']['quotes_matched'] for e in entries), sum(e['checks']['quotes_total'] for e in entries)]
    s['raw_hashes'] = [sum(e['checks']['raw_hashes_matched'] for e in entries), sum(e['checks']['raw_hashes_total'] for e in entries)]
    s['entries_with_issues'] = sum(bool(e['checks']['issues']) for e in entries)
    return s


def md_cell(v):
    return ('' if v is None else str(v)).replace('|', '\\|').replace('\n', ' ')


def link_list(urls, n=3):
    urls = list(dict.fromkeys(urls))
    return ' '.join(f'[{i + 1}]({u})' for i, u in enumerate(urls[:n])) + (f' 외 {len(urls) - n}' if len(urls) > n else '')


def row(e, with_country=True):
    date = e['date_rule'] or ('규칙: ' + (e['date_note'] or '미확정'))[:70]
    cells = [f"`{e['uid']}`"] + ([e['country_ko']] if with_country else []) + [
        f"{e['name_ko']}<br>{e['name_original']}", date, KIND_GROUP_LABEL.get(e['kind_group'], e['kind_group']),
        OFFICIALITY_LABEL.get(e['officiality_class'], e['officiality_class']), EVIDENCE_LABEL[e['evidence_level']],
        DEDUP_LABEL[e['dedup']['verdict']] + (f" → `{e['dedup']['ref']}`" if e['dedup']['ref'] else ''),
        APP_LABEL[e['app_date_support']].split('(')[0], link_list(e['read_urls'] or e['search_only_urls'])]
    return '| ' + ' | '.join(md_cell(c) for c in cells) + ' |'


HEAD = '| uid | 국가 | 이름(원명) | 날짜 규칙 | 종류 | 공식성 | 확인 수준 | 중복 판정 | 앱 날짜 | 출처 |\n|---|---|---|---|---|---|---|---|---|---|'
HEAD_NC = '| uid | 이름(원명) | 날짜 규칙 | 종류 | 공식성 | 확인 수준 | 중복 판정 | 앱 날짜 | 출처 |\n|---|---|---|---|---|---|---|---|---|'


def table(rows, with_country=True):
    if not rows:
        return '_해당 없음_\n'
    return (HEAD if with_country else HEAD_NC) + '\n' + '\n'.join(row(e, with_country) for e in rows) + '\n'


def render_md(entries, s, state, now, progress, corrections, asia_search):
    L = []
    uniq = [e for e in entries if e['dedup']['verdict'] == 'new']
    asia_new = [e for e in entries if e['source_batch'] == BATCH.name]
    L.append('# AnniCal 기념일 조사 통합 보고서 (2026-10-12)\n')
    L.append(f'> **상태: {state}** · 생성 {now} · 생성기 `tools/research/workflow/batches/{BATCH.name}/scripts/consolidate.py`\n>\n'
             '> 이 문서는 조사 후보 목록이다. 어떤 항목도 사실 검수 승인·서비스 반영이 되지 않았다(fact_review=pending). '
             '공식 기념일과 비공식 기념일은 `공식성` 열로 구분하며 승인 표시와 무관하다.\n')
    if progress:
        L.append(f"**진행 상황**: 완료 국가 {', '.join(progress.get('done', [])) or '없음'} / "
                 f"남은 국가 {', '.join(progress.get('remaining', [])) or '없음'}\n")
        if progress.get('note'):
            L.append(progress['note'] + '\n')
    L.append('## 1. 조사 전체 개요\n')
    L.append(f"- 원본 기록 수(각 records.json 직접 파싱): **{s['raw_total']}건** — "
             + ', '.join(f'{SHORT[b]} {n}' for b, n in s['raw_record_counts'].items()))
    L.append(f"- 통합 목록 행 수: **{s['consolidated_total']}건** (원본 기록과 1:1, 누락 없음 검사 대상)")
    L.append(f"- 중복 판정: 신규 {s['dedup'].get('new', 0)} · 기존 서비스 중복 {s['dedup'].get('service_duplicate', 0)} · "
             f"이전 조사 후보 중복 {s['dedup'].get('prior_duplicate', 0)}")
    L.append(f"- 유효 고유 후보 {s['unique_candidates']}건의 확인 수준: "
             + ', '.join(f"{EVIDENCE_LABEL[k]} {v}" for k, v in sorted(s['unique_by_evidence'].items())))
    h = s['unique_holds']
    L.append(f"- 고유 후보 중 보류·주의(중복 집계): 날짜 상충 {h['date_conflict']} · 날짜 미확정 {h['date_undetermined']} · "
             f"앱 날짜 미지원 {h['app_date_unsupported']} · 출처 약함(독립 2곳 미만) {h['weak_source(listing/search/blocked/single)']} · "
             f"제정 미확인 {h['founder_unverified']}")
    L.append(f"- 우선 검토 후보(신규·독립 원문 2곳+·날짜 확정·앱 표현 가능·인용 문제 없음): {s['unique_review_priority']}건")
    L.append(f"- 인용 재검사: {s['quotes'][0]}/{s['quotes'][1]} 일치 · 원본 SHA256 재계산: {s['raw_hashes'][0]}/{s['raw_hashes'][1]} 일치 · "
             f"문제 표시 행 {s['entries_with_issues']}건 (§9·corrections.json)")
    L.append(f"- 이번 아시아 배치 현지어 WebSearch: {s['asia_search_count']}회 "
             + '(' + ', '.join(f'{c} {n}' for c, n in s['asia_search_by_country'].items()) + ')\n')
    L.append('기술 검사(해시·인용 문자열·스키마·중복 스캔·resolver)는 사실 검수가 아니다. '
             '원문을 읽고 인용을 남긴 것과, 독립 검수자가 주장을 재확인한 것은 다르다.\n')
    L.append('## 2. 배치별 실적\n')
    L.append('| 배치 | 원본 기록 | 신규 | 서비스 중복 | 이전 후보 중복 | 인용 일치 | 원본 해시 일치 | 기록 경로 |\n|---|---:|---:|---:|---:|---|---|---|')
    for b in ALL_BATCHES:
        bb = [e for e in entries if e['source_batch'] == b]
        c = Counter(e['dedup']['verdict'] for e in bb)
        L.append(f"| {SHORT[b]} | {len(bb)} | {c.get('new', 0)} | {c.get('service_duplicate', 0)} | {c.get('prior_duplicate', 0)} | "
                 f"{sum(e['checks']['quotes_matched'] for e in bb)}/{sum(e['checks']['quotes_total'] for e in bb)} | "
                 f"{sum(e['checks']['raw_hashes_matched'] for e in bb)}/{sum(e['checks']['raw_hashes_total'] for e in bb)} | "
                 f"`tools/research/workflow/batches/{b}/records.json` |")
    L.append('')
    L.append('## 3. 집계 (유효 고유 후보 기준)\n')
    L.append('### 국가별\n')
    L.append('| 국가 | 고유 후보 | 원문 다중 | 원문 단일 | 목록만 | 검색만/차단 | 앱 날짜 미지원 |\n|---|---:|---:|---:|---:|---:|---:|')
    for c, n in s['unique_by_country'].items():
        cc = [e for e in uniq if e['country'] == c]
        ev = Counter(e['evidence_level'] for e in cc)
        L.append(f"| {COUNTRY_KO.get(c, c)} ({c}) | {n} | {ev.get('original_multi', 0)} | {ev.get('original_single', 0)} | "
                 f"{ev.get('listing_only', 0)} | {ev.get('search_result_only', 0) + ev.get('blocked', 0)} | "
                 f"{sum(e['app_date_support'] == 'unsupported' for e in cc)} |")
    L.append('\n### 종류별\n')
    L.append('| 종류 | 고유 후보 |\n|---|---:|')
    for k, n in s['unique_by_kind_group'].items():
        L.append(f'| {KIND_GROUP_LABEL.get(k, k)} | {n} |')
    L.append('\n### 공식성별\n')
    L.append('| 공식성 | 고유 후보 |\n|---|---:|')
    for k, n in s['unique_by_officiality'].items():
        L.append(f'| {OFFICIALITY_LABEL.get(k, k)} | {n} |')
    L.append('\n### 확인 수준별\n')
    L.append('| 확인 수준 | 고유 후보 |\n|---|---:|')
    for k, n in sorted(s['unique_by_evidence'].items()):
        L.append(f'| {EVIDENCE_LABEL[k]} | {n} |')
    L.append('')
    L.append('## 4. 아시아 15개 국가·지역별 목록 (이번 배치 + 이전 배치의 아시아 항목)\n')
    for c in TARGET15:
        cc = [e for e in entries if e['country'] == c]
        sc = sum(1 for x in asia_search if x['country'] == c)
        L.append(f"### {COUNTRY_KO[c]} ({c}) — 기록 {len(cc)}건 (이번 배치 {sum(e['source_batch'] == BATCH.name for e in cc)}), 현지어 검색 {sc}회\n")
        if c in progress.get('country_summaries', {}):
            L.append(progress['country_summaries'][c] + '\n')
        L.append(table(cc, with_country=False))
    other_asia = [e for e in asia_new if e['country'] not in TARGET15]
    if other_asia:
        L.append('### 기타(이번 배치, 대상 15곳 외)\n')
        L.append(table(other_asia))
    L.append('## 5. 이전 전체 조사 목록 (contact·quirky·native, 원본 순서)\n')
    for b in PRIOR:
        bb = [e for e in entries if e['source_batch'] == b]
        L.append(f"### {SHORT[b]} — {b} ({len(bb)}건)\n")
        L.append(table(bb))
    L.append('## 6. 중복 제외 목록 (신규로 세지 않음)\n')
    dups = [e for e in entries if e['dedup']['verdict'] != 'new']
    L.append('| uid | 이름 | 판정 | 대상 | 근거·메모 |\n|---|---|---|---|---|')
    for e in dups:
        L.append(f"| `{e['uid']}` | {md_cell(e['name_ko'])} | {DEDUP_LABEL[e['dedup']['verdict']]} | `{e['dedup']['ref']}` | {md_cell(e['dedup']['note'])} |")
    L.append('')
    L.append('## 7. 보류·주의 목록 (유효 고유 후보 중)\n')
    sections = [
        ('7.1 날짜 상충', [e for e in uniq if e['date_status'] == 'conflict']),
        ('7.2 날짜 미확정', [e for e in uniq if e['date_status'] == 'undetermined']),
        ('7.3 출처 부족 (목록 사이트만·검색결과만·차단)', [e for e in uniq if e['evidence_level'] in ('listing_only', 'search_result_only', 'blocked')]),
        ('7.4 단일 출처 (원문은 읽었으나 독립 출처 1곳)', [e for e in uniq if e['evidence_level'] == 'original_single']),
        ('7.5 제정·기원 미확인', [e for e in uniq if e['founder_check'] == 'unverified']),
        ('7.6 앱 날짜 규칙 미지원 (조사 제외 사유 아님)', [e for e in uniq if e['app_date_support'] == 'unsupported']),
    ]
    for title, rows in sections:
        L.append(f'### {title} — {len(rows)}건\n')
        L.append('| uid | 이름(원명) | 날짜 규칙·설명 | 불확실성 |\n|---|---|---|---|')
        for e in rows:
            L.append(f"| `{e['uid']}` | {md_cell(e['name_ko'])}<br>{md_cell(e['name_original'])} | "
                     f"{md_cell(e['date_rule'] or '')} {md_cell(e['date_note'] or '')} | {md_cell((e['uncertainty'] or '')[:220])} |")
        L.append('')
    L.append('## 8. 우선 검토 후보\n')
    L.append('조건: 신규 · 독립 원문 2곳 이상 · 날짜 확정 · 앱 규칙으로 표현 가능 · 인용/해시 문제 없음. 승인 아님 — 독립 사실 검수 대기열이다.\n')
    L.append(table([e for e in uniq if e['review_priority']]))
    L.append('## 9. 기술 검사 문제와 정정 제안\n')
    iss = [(e['uid'], i) for e in entries for i in e['checks']['issues']]
    L.append(f'자동 검사 문제 {len(iss)}건:\n')
    for uid, i in iss:
        L.append(f"- `{uid}` — {i['issue']} " + md_cell({k: v for k, v in i.items() if k != 'issue'}))
    L.append('')
    corr = corrections.get('corrections', [])
    L.append(f'정정 제안 {len(corr)}건 (원본은 수정하지 않음 → `tools/research/workflow/batches/{BATCH.name}/corrections.json`):\n')
    for c in corr:
        L.append(f"- `{c['target']}` — {c['problem']} → 제안: {c['proposal']}")
    L.append('')
    L.append('## 10. 원문 출처 링크 (전체)\n')
    L.append('각 행의 링크는 원문을 실제로 읽은 URL. 원문을 못 읽은 경우 `검색결과만` URL 을 표시한다. 상세 근거(인용·해시·로컬 사본)는 원본 records.json 과 evidence 폴더에 있다.\n')
    for e in entries:
        urls = e['read_urls']
        so = e['search_only_urls']
        L.append(f"- `{e['uid']}` {md_cell(e['name_ko'])} — 원문: " + (' '.join(f'<{u}>' for u in dict.fromkeys(urls)) or '없음')
                 + (' · 검색결과만: ' + ' '.join(f'<{u}>' for u in dict.fromkeys(so)) if so else '')
                 + f" · 기록 `{e['source_record_path']}` · 근거 `{e['evidence_dir']}`")
    L.append('')
    L.append('## 11. 미완료 작업\n')
    for t in progress.get('todo', []):
        L.append(f'- {t}')
    L.append('- 모든 후보의 독립 사실 검수(원문 재대조) 미실시. 서비스 반영·slug 생성·배포 미실시.')
    L.append('')
    return '\n'.join(L) + '\n'


if __name__ == '__main__':
    main()
