"""quirky-discovery-20261012 후보 기록 생성기. 서비스 파일은 읽기만 한다.

    python3 -I scripts/build_records.py   → records.json, search-log.json

후보 사실은 아래 표에 손으로 적고, 근거 파일 경로·해시·접근 상태는 fetch-log.json 에서 가져온다.
인용(quote)은 evidence/*.txt 본문과 글자 단위로 일치해야 한다(scripts/verify.mjs 가 검사).
"""
import glob
import json
from pathlib import Path

BATCH = Path(__file__).resolve().parent.parent
ROOT = BATCH.parents[4]

KINDS = {'weird_behavior': '이상한 행동', 'pun_meme': '말장난·밈', 'relationship': '관계',
         'object_hobby': '물건·취미', 'superstition': '미신'}
# 발견 상태 — 승인 흐름(evidenced/approved/applied)과 섞지 않는다.
STATUSES = {
    'documented_unofficial': '비공식이지만 언론·단체·백과 원문 1곳 이상 또는 독립 원문 2곳에서 존재·날짜 확인',
    'discovered_unverified': '기념일 목록 사이트·약한 출처 원문만 읽음(단일 목록 출처 포함). 존재는 보이나 독립 확인 부족',
    'date_conflict': '존재는 확인했지만 출처끼리 날짜가 갈림',
    'blocked': '원문을 못 읽음(검색결과만 확인) 또는 날짜 미확정',
    'duplicate': '서비스 1,756건에 이미 있는 항목',
}
# 원문 접근이 200이어도 본문이 차단 안내문뿐인 경우(fetch.py 의 글자 수 기준을 통과한 오판)
OVERRIDE = {('world-introvert-day', 'theweek-2024'): 'blocked_access_denied_page',
            ('kokuhaku-day-jp', 'nissyoku'): 'read_no_relevant_text'}
SOURCE_TYPE = {
    'observer-reporter-2017': 'news', 'pearson-calendar': 'publisher_calendar', 'wnep': 'news',
    'timeanddate': 'listing', 'manualredeye': 'school_newspaper', 'checkiday': 'listing', 'ufl-recess-2001': 'university_radio',
    'nationaltoday': 'listing', 'christianpost': 'news', 'wikipedia': 'encyclopedia', 'leinsterleader': 'news',
    'daysoftheyear': 'listing', 'bossierpress': 'news', 'thenextweb-2010': 'news', 'nationaldaycalendar': 'listing',
    'cbsnews-2018': 'news', 'time': 'news', 'spotify-newsroom': 'company_newsroom', 'meme-com': 'meme_database',
    'disneyparksblog': 'company_blog', 'meaww': 'news', 'brusselstimes': 'news', 'ebsco': 'reference',
    'cfpublic-npr-2022': 'public_radio', 'wsvn': 'news', 'tauday': 'founder_site', 'sciam-blog': 'magazine_blog',
    'timeout-jp': 'magazine', 'pref-mie': 'government', 'bestcalendar': 'listing', 'zatsuneta-wacoal': 'listing',
    'zatsuneta': 'listing', 'seoul-2013': 'news', 'syu': 'university_column', 'kormedi': 'news_column',
    'mentalfloss': 'magazine', 'history-com': 'magazine', 'netlab-0509': 'listing', 'nissyoku': 'news',
    'tabi-mag': 'listing', 'theweek-2024': 'news', 'nevada-humane': 'organization', 'npr-2013': 'public_radio',
    'bellevue-library': 'library_blog', 'dictionary-com': 'reference', 'geocaching-blog-2011': 'organizer',
    'geocaching-blog-2012': 'organizer', 'awarenessdays': 'listing', 'whatsupnewp': 'news',
    'zatsuneta-0210': 'listing', 'bestcalendar-1010': 'listing', 'goodreads-artemis-crow': 'blog',
}


def C(key, kind, status, ko, orig, date_type, date_rule, date_note, scope, meaning, why, origin, origin_check,
      officiality, confidence, claims, search_only=(), caution=None, related=(), prior=(), aliases=(), dup=None, dup_note=None):
    return dict(candidate_key=key, kind=kind, discovery_status=status, name_ko=ko, name_original=orig,
                aliases=list(aliases), date_type=date_type, date_rule=date_rule, date_note=date_note, scope=scope,
                meaning=meaning, why_quirky=why, founder_origin=origin, founder_origin_check=origin_check,
                officiality=officiality, confidence=confidence, caution=caution, claims=claims,
                search_result_only=[dict(url=u, note=n) for u, n in search_only],
                related_existing_patterns=list(related), prior_research_mentions=list(prior), _dup=(dup, dup_note))


def cl(cid, claim, verdict, *ev):
    return dict(claim_id=cid, claim=claim, verdict=verdict,
                evidence=[dict(evidence_id=e, quote=q) for e, q in ev])


S = 'supported_by_original'
CANDIDATES = [
    # ── 이상한 행동 ──
    C('hoodie-hoo-day', 'weird_behavior', 'documented_unofficial', '후디 후 데이', 'Hoodie Hoo Day', 'annual-fixed', '02-20', None,
      '미국(펜실베이니아 등 지역 행사)', '정오에 밖에 나가 두 손을 흔들며 "후디 후!"라고 외쳐 겨울을 쫓는 날',
      '아무 근거 없는 주문 같은 외침으로 계절을 쫓는다는 설정 자체가 장난',
      '펜실베이니아 중부의 한 부부가 만든 날(신문), Wellcat.com 이 만든 날(출판사 달력). 두 설명은 같은 제작자로 보이나 부부 이름(Ruth·Thomas Roy)은 검색결과만 확인',
      'partial_original', '공식 지정 없음. 지역 상공회의소가 2014년부터 행사 개최', 'high', [
          cl('existence_date', '2월 20일, 요일과 무관하게 열리는 날', S,
             ('hoodie-hoo-day/observer-reporter-2017', 'The day is celebrated Feb. 20, regardless of the day of the week')),
          cl('fabricated', '신문이 "완전히 지어낸 기념일"이라고 표현', S,
             ('hoodie-hoo-day/observer-reporter-2017', 'A thoroughly fabricated holiday, the brainchild of a central Pennsylvania couple, Hoodie Hoo Day is designed to ward off winter and its many ills.')),
          cl('ritual', '정오에 밖에 나가 손을 흔들며 외친다', S,
             ('hoodie-hoo-day/pearson-calendar', 'The tradition involves going outside at noon on February 20th and waving your hands above your head while yelling')),
          cl('creator', 'Wellcat.com 이 만들었다', S,
             ('hoodie-hoo-day/pearson-calendar', 'National Hoodie-Hoo Day is a special day created by a company called Wellcat.com to help people get rid of the blues of winter in the northern hemisphere.')),
          cl('local_event', '몬밸리 지역 상공회의소가 2014년 행사 시작', S,
             ('hoodie-hoo-day/observer-reporter-2017', 'the Mon Valley Regional Chamber of Commerce started this wonderful silliness in 2014')),
      ], search_only=[('https://wnep.com/article/news/local/schuylkill-county/hoodie-hoo-day-spring-winter-schuylkill-county/523-d519641e-3f10-4743-bb47-00b5abfc22aa', '스퀼킬 카운티 전통 보도. 원문 403 → 검색결과만 확인')]),
    C('plan-your-epitaph-day', 'weird_behavior', 'date_conflict', '내 묘비명 미리 쓰는 날', 'Plan Your Epitaph Day', 'annual-fixed', '11-02',
      '11-02(Checkiday) vs 04-06·11-02 두 번(National Today). 단일 날짜 미확정',
      '미국 비공식', '살아 있을 때 자기 묘비에 남길 한 줄을 미리 써 보는 날', '죽음을 가볍게 연습해 보는 엉뚱한 과제',
      '제정자 Lance Hardie 설은 검색결과만 확인(원문 미확보). 2001년 대학 라디오는 "누군가 선포했다"고만 함', 'search_result_only',
      '공식 지정 없음', 'medium', [
          cl('date_nov2', '매년 11월 2일', S, ('plan-your-epitaph-day/checkiday', 'annually on November 2nd')),
          cl('date_apr6', '4월 6일과 11월 2일 두 번', 'conflicting', ('plan-your-epitaph-day/nationaltoday', 'Observed on April 6 and November 2 every year')),
          cl('existence_2001', '2001년 대학 라디오가 이 날을 소개', S,
             ('plan-your-epitaph-day/ufl-recess-2001', 'some provocative soul has proclaimed today Plan Your Epitaph Day')),
      ], search_only=[('https://thebluepaper.com/?p=28450', 'Lance Hardie·저서 언급(검색 요약). 원문 미수집')],
      caution='죽음 소재. 추모·상실 맥락과 섞지 말고 가벼운 글쓰기 놀이로만 소개'),
    C('tell-a-lie-day', 'weird_behavior', 'documented_unofficial', '거짓말하는 날', 'Tell a Lie Day', 'annual-fixed', '04-04', None,
      '미국 비공식', '해 없는 거짓말 하나쯤 해 보라는 날(만우절 사흘 뒤)', '정직의 날과 반대로 거짓말을 "기념"한다',
      '만든 사람이 밝혀진 적 없다(Christian Post)', 'unknown_stated_by_source', '공식 지정 없음', 'medium', [
          cl('existence_date_creator', '매년 4월 4일이며 만든 사람은 밝혀지지 않았다', S,
             ('tell-a-lie-day/christianpost', 'Tell A Lie Day, otherwise known as National Tell a Lie Day, is April 4 every year, but the unscrupulous creator of the holiday has never been found.')),
      ], search_only=[('https://www.timeanddate.com/holidays/fun/tell-a-lie-day', '원문 403 → 검색결과만 확인')],
      caution='거짓말 장려로 읽힐 수 있음. 사기·허위정보 연상 피하고 무해한 장난 범위로 한정'),
    C('ask-a-stupid-question-day', 'weird_behavior', 'date_conflict', '바보 같은 질문 하는 날', 'Ask a Stupid Question Day', 'annual-fixed', '09-28',
      '기본 09-28. 위키백과: 원래 9월 마지막 수업일, 1982년 제정 시 9월 30일. 9월 마지막 수업일 규칙은 현재 dateType 으로 표현 불가',
      '미국에서 시작, 영국·인도 보도', '"바보 같은" 질문도 마음껏 하자는 날', '질문 부끄러움을 깨려는 교실 장난에서 굳어진 날',
      '유래 상충: 1982년 플린트 저널 사서 David Larzelere 창안(위키백과) vs 1980년대 교사들(아일랜드 지역지)', 'conflicting',
      '공식 지정 없음', 'medium', [
          cl('date_default', '기본 날짜 9월 28일, 원래는 9월 마지막 수업일', S,
             ('ask-a-stupid-question-day/wikipedia', 'although its default date is September 28.')),
          cl('date_1982', '1982년 제정 당시 9월 30일', 'conflicting',
             ('ask-a-stupid-question-day/wikipedia', 'establishing the holiday on September 30.')),
          cl('origin_librarian', '1982년 사서 David Larzelere 창안', S,
             ('ask-a-stupid-question-day/wikipedia', 'In 1982, the holiday was created by librarian David Larzelere')),
          cl('origin_teachers', '교사들이 학생 질문을 독려하려 시작', 'conflicting',
             ('ask-a-stupid-question-day/leinsterleader', 'Its origin came from teachers who tried to encourage students to ask any type of question')),
          cl('date_928', '9월 28일', S, ('ask-a-stupid-question-day/leinsterleader', 'the 28 of September, is known as')),
      ]),
    C('no-socks-day', 'weird_behavior', 'discovered_unverified', '양말 안 신는 날', 'No Socks Day', 'annual-fixed', '05-08', None,
      '미국 비공식', '하루 양말을 벗고 맨발·샌들로 지내는 날', '양말을 "벗는 것"을 기념한다',
      'Ruth & Thomas Roy(Wellcat Holidays) — 목록 사이트 1곳의 표기', 'single_listing', '공식 지정 없음', 'low', [
          cl('date', '매년 5월 8일', S, ('no-socks-day/daysoftheyear', 'Every May 8th')),
          cl('founder', 'Ruth & Thomas Roy(Wellcat Holidays) 창안', S, ('no-socks-day/daysoftheyear', 'Ruth & Thomas Roy (Wellcat Holidays)')),
      ], search_only=[('https://bossierpress.com/at-the-library-this-week-will-knock-your-socks-off', '도서관 칼럼(검색 요약). 원문 404')],
      related=['잃어버린 양말']),
    C('yell-fudge-cobras-day', 'weird_behavior', 'blocked', '북미 코브라에게 "퍼지!"라고 외치는 날', 'Yell "Fudge" at the Cobras in North America Day', None, None,
      '날짜 미확정 — 원문을 못 읽었고 검색 요약도 날짜를 주지 않음. 조사자가 기억한 6월 2일은 근거 없음으로 기록하지 않음',
      '미국 비공식(추정)', '북미에 없는 코브라를 "퍼지"라고 외쳐 쫓는다는 부조리 설정', '존재하지 않는 위협을 엉뚱한 단어로 쫓는다',
      'Tom·Ruth Roy(Wellcat) 창안 — 검색결과만 확인', 'search_result_only', '공식 지정 없음', 'low', [
          cl('existence', 'Goodreads 블로그가 Daily Beast 기사를 인용해 소개(검색 요약)', 'search_result_only'),
      ], search_only=[('https://www.goodreads.com/author_blog_posts/22593455-for-the-love-of-what-by-artemis-crow', '1차 검색 0건, 2차 검색에서 발견. 원문 수집 타임아웃 → 재시도하지 않음')]),
    C('answer-your-cats-questions-day', 'weird_behavior', 'documented_unofficial', '고양이 질문에 답하는 날', "Answer Your Cat's Questions Day", 'annual-fixed', '01-22', None,
      '미국 비공식', '고양이가 던지는 "질문"을 상상해 답해 주는 날', '말 못 하는 고양이와 문답을 한다는 설정',
      'Ruth·Thomas Roy(wellcat.com) 창안설은 검색결과만 확인', 'search_result_only', '공식 지정 없음. 동물보호단체가 소개', 'medium', [
          cl('date', '1월 22일(2022년 기준 소개)', S, ('answer-your-cats-questions-day/nevada-humane', 'This year it is celebrated on January 22, 2022!')),
          cl('activity', '고양이와 시간을 보내며 질문을 상상해 본다', S,
             ('answer-your-cats-questions-day/nevada-humane', 'So sit down, spend some quality time with your cat, and get to wondering what questions they might be inquiring.')),
      ], search_only=[('https://www.timeanddate.com/holidays/fun/answer-your-cats-questions-day', '원문 403 → 검색결과만 확인')],
      related=['고양이']),
    # ── 말장난·밈 ──
    C('caps-lock-day', 'pun_meme', 'date_conflict', '캡스록의 날', 'International Caps Lock Day', 'annual-fixed', '10-22',
      '원래 10-22(2000년). 06-28 은 빌리 메이스 사망일을 기려 나중에 덧붙은 두 번째 날', '국제(인터넷)',
      '하루 종일 대문자로만 타이핑하는 날', '키보드 키 하나를 기념하는 인터넷 패러디',
      'Derek Arnold 가 2000년 패러디로 제안', 'original_read', '공식 지정 없음', 'high', [
          cl('origin_date', '2000년 Derek Arnold 가 10월 22일로 상상한 패러디 기념일', S,
             ('caps-lock-day/thenextweb-2010', 'International Caps Lock Day is a parodic holiday that was first imagined in 2000 by Derek Arnold, who deemed that on October 22, everyone across the world should type only in Caps Lock.')),
          cl('two_dates', '10월 22일과 6월 28일 두 번 기념', 'conflicting',
             ('caps-lock-day/nationaldaycalendar', 'we recognize this day twice a year; October 22nd and June 28th.')),
          cl('june28_reason', '6월 28일은 빌리 메이스 사망일', S,
             ('caps-lock-day/nationaldaycalendar', 'This June 28 day commemorates the day Billy Mays died on June 28, 2009.')),
      ]),
    C('mean-girls-day', 'pun_meme', 'documented_unofficial', '퀸카로 살아남는 법(Mean Girls)의 날', 'Mean Girls Day', 'annual-fixed', '10-03', None,
      '국제(팬덤·SNS)', '영화 속 "오늘은 10월 3일이야" 대사를 따라 분홍 옷과 짤을 나누는 날', '영화 대사 한 줄이 기념일이 됨',
      '2004년 영화 대사에서 유래, 팬들이 SNS로 기념(제정자 없음)', 'original_read', '공식 지정 없음', 'high', [
          cl('date', '10월 3일은 팬들에게 특별한 날', S, ('mean-girls-day/cbsnews-2018', 'October 3 is a special day for')),
          cl('origin', '남자 주인공이 날짜를 묻자 10월 3일이라고 답한 장면', S, ('mean-girls-day/time', 'He asked her what day it was, and she replied')),
          cl('unofficial', '비공식적으로 National Mean Girls Day 로 불림', S, ('mean-girls-day/time', 'unofficially known as National Mean Girls Day')),
      ], related=['남자친구']),
    C('its-gonna-be-may', 'pun_meme', 'documented_unofficial', '"잇츠 고나 비 메이" 데이', "It's Gonna Be May (Day)", 'annual-fixed', '04-30', None,
      '국제(인터넷 밈)', '엔싱크 "It\'s Gonna Be Me"의 "Me"가 "May"로 들리는 걸 4월 30일마다 올리는 밈', '잘못 들은 가사(몬더그린) 하나로 매년 반복되는 날',
      '2012년 텀블러 밈에서 시작(제정자 없음)', 'original_read', '공식 지정 없음', 'high', [
          cl('annual_spike', '2012년 밈 이후 매년 이날 스트리밍이 급증', S,
             ('its-gonna-be-may/spotify-newsroom', 'Thanks to a 2012 meme gone viral, on this day each year, the *NSYNC song')),
          cl('unofficial', '비공식 기념일', S, ('its-gonna-be-may/spotify-newsroom', 'seen the meme of this unofficial holiday')),
          cl('origin', '2012년 1월 텀블러에서 시작, 4월 30일 카운트다운으로 굳음', S,
             ('its-gonna-be-may/meme-com', 'Starting on Tumblr in January 2012, the misheard lyric turned into a yearly countdown to April 30th')),
      ]),
    C('revenge-of-the-sixth', 'pun_meme', 'duplicate', '시스의 복수 데이', 'Revenge of the Sixth / Revenge of the Fifth', 'annual-fixed', '05-06',
      '05-06(Sixth, 디즈니 스토어 2025) vs 05-05(Fifth, 팬 다수). 팬 사이에서도 갈림', '국제(스타워즈 팬덤)',
      '스타워즈 데이 다음 날, 악역(시스)을 기리는 날', '"Sith"와 "Sixth/Fifth" 발음 말장난',
      '팬 문화에서 생김. 디즈니 스토어는 2025년 "첫" Revenge of the Sixth Day 진행', 'original_read', '공식 기념일 아님(상업 행사 있음)', 'high', [
          cl('disney_may6', '디즈니 스토어가 5월 6일 첫 Revenge of the Sixth Day 진행', S,
             ('revenge-of-the-sixth/disneyparksblog', 'Disney Store is honoring the occasion by hosting its first ever Revenge of the Sixth Day; celebrate the day on Tuesday, May 6')),
          cl('fans_may5', '팬들은 5월 5일을 Revenge of the Fifth 로 기념', 'conflicting', ('revenge-of-the-sixth/meaww', 'fans celebrate May 5, as')),
          cl('debate', 'Fifth 냐 Sixth 냐 팬 논쟁', S,
             ('revenge-of-the-sixth/meaww', 'there has been a constant debate between fans on what works better: Revenge of the Fifth or Sixth, since the latter comes closer to Sith.')),
      ], related=['스타워즈'], prior=['tools/namuwiki/output/namuwiki_calendar.json: "시스 데이" 5월 5일(발견용 행)'], aliases=['Revenge of the Fifth', '시스 데이'],
      dup='anv-fixed-05-05-sith-day-global', dup_note='기존 "시스 데이"(05-05, culture)가 같은 팬 기념일의 Fifth 판. 05-06(Sixth)은 날짜 변형 — 신규 아님, 기존 항목 본문에 변형 언급 여부만 검토 대상'),
    C('blue-monday', 'pun_meme', 'documented_unofficial', '블루 먼데이(가장 우울한 날이라는 PR 공식)', 'Blue Monday', 'annual-nth-weekday', '01-3-MON',
      '1월 셋째 월요일(EBSCO). 해마다 날짜가 바뀜', '영국에서 시작, 국제 확산',
      '"1년 중 가장 우울한 날"이라고 주장하는 날 — 여행사 홍보용 사이비 공식에서 나옴', '과학처럼 포장된 근거 없는 날이라는 점 자체가 이야깃거리',
      '2005년 Cliff Arnall 이 Sky Travel 홍보 의뢰로 만든 공식', 'original_read', '공식 지정 없음. 의사과학으로 반박됨', 'medium', [
          cl('debunked', '1월 셋째 월요일이 가장 우울하다는 반박된 의사과학', S,
             ('blue-monday/ebsco', 'Blue Monday is a debunked pseudoscientific theory suggesting that the third Monday of January is the most depressing day of the year.')),
          cl('pr_origin', 'Sky Travel 의 홍보 의뢰에서 출발', S,
             ('blue-monday/ebsco', 'he was approached by a British television network called Sky Travel to participate in a unique public relations endeavor.')),
          cl('year', '2005년 공개', S, ('blue-monday/ebsco', 'who first went public with his supposed findings in 2005')),
      ], search_only=[('https://www.brusselstimes.com/1400713/blue-monday-why-today-is-not-the-most-depressing-day-of-the-year', '원문 수집 시 본문 19자(빈 페이지) → 미확인')],
      caution='정신건강 소재. "가장 우울한 날"을 사실처럼 쓰지 말고 반박된 PR 공식임을 먼저 밝힐 것'),
    C('earth-wind-fire-day', 'pun_meme', 'documented_unofficial', '어스 윈드 앤 파이어 데이(9월 21일 밈)', 'Earth, Wind & Fire Day', 'annual-fixed', '09-21', None,
      '국제(인터넷 밈), 미국 LA 시의회 선언', '"Do you remember the 21st night of September?" 가사 때문에 매년 9월 21일 노래를 트는 날',
      '작사가 본인은 "21일에 의미 없음, 그냥 발음이 좋아서"라고 함', '1978년 노래 가사에서 유래. 2019년 LA 시의회가 선언', 'original_read',
      'LA 시의회 선언(지역). 국가 공식 아님', 'high', [
          cl('meme_day', 'NPR 이 9월 21일을 Earth, Wind and Fire Day 로 소개', S, ('earth-wind-fire-day/cfpublic-npr-2022', 'Happy Earth, Wind and Fire Day.')),
          cl('no_meaning', '21일에는 의미가 없다(작사가)', S,
             ('earth-wind-fire-day/cfpublic-npr-2022', 'There is no significance beyond it just sang better than any of the other dates.')),
          cl('la_council', 'LA 시의회가 9월 21일을 선언', S, ('earth-wind-fire-day/wsvn', 'the City Council declared September 21')),
      ]),
    C('tau-day', 'pun_meme', 'documented_unofficial', '타우의 날', 'Tau Day', 'annual-fixed', '06-28', None,
      '국제(수학 애호가)', '원주율 π 대신 τ(=2π≈6.28)를 쓰자며 6/28을 기념하는 날', '파이의 날에 맞선 "안티 파이" 숫자 말장난',
      '2010년 Michael Hartl 이 Tau Manifesto 와 함께 창안', 'original_read', '공식 지정 없음', 'high', [
          cl('founding_date', '2010년 Hartl 의 Tau Manifesto 와 함께 시작, 매년 6월 28일', S,
             ('tau-day/tauday', 'Founded in 2010 with the publication of The Tau Manifesto by Michael Hartl, Tau Day takes place annually on June 28 (6/28 in the American calendar system).')),
          cl('independent', '사이언티픽 아메리칸 블로그가 2010년 선언문을 소개', S, ('tau-day/sciam-blog', 'In his popular 2010')),
      ], related=['파이(π)']),
    C('ninja-day-jp', 'pun_meme', 'documented_unofficial', '닌자의 날(일본)', '忍者の日', 'annual-fixed', '02-22', None,
      '일본', '2월 22일을 "닌닌닌"으로 읽어 닌자를 기리는 날', '숫자 2를 닌자 말버릇 "닌"으로 읽는 말장난',
      '일본닌자협의회(2015 발족)가 이날 행사. 일본기념일협회 인정 연도(2014/2015)는 검색결과에서 상충', 'partial_original',
      '민간·지자체 협의회 행사. 국가 공식 아님', 'high', [
          cl('pun_date', '2월 22일 "닌닌닌" 말장난', S, ('ninja-day-jp/timeout-jp', '2月22日「ニンニンニン」と語呂を合わせた忍者の日に')),
          cl('council', '전년 발족한 일본닌자협의회의 행사', S, ('ninja-day-jp/timeout-jp', '昨年発足した日本忍者協議会によるこの取り組みは')),
          cl('government_event', '미에현이 2월 22일 닌자의 날 행사 공지', S, ('ninja-day-jp/pref-mie', '2月22日「忍者の日」に合わせ')),
      ], related=['닌자']),
    C('cheonsa-day-kr', 'pun_meme', 'discovered_unverified', '천사데이', '천사데이(1004)', 'annual-fixed', '10-04', None,
      '한국', '10월 4일=1004=천사, 남을 돕는 날', '숫자 발음 말장난',
      '동두천 "희망지킴이 천사운동본부"가 2003년부터 행사(칼럼 1건). 날 자체의 최초 제정자는 미확인', 'single_news_column',
      '공식 지정 없음', 'low', [
          cl('pun', '1004 발음에서 따온 천사데이', S, ('cheonsa-day-kr/kormedi', '1004의 발음을 따온')),
          cl('event', '2003년부터 매년 행사', S, ('cheonsa-day-kr/kormedi', '2003년부터 매년 뜻깊은 행사를 펼치고 있습니다')),
      ], prior=['tools/namuwiki/output/namuwiki_calendar.json: 천사데이(발견용 행)', 'tools/research/jp-blog-raw.txt: 일본 10/4 천사의 날(별개)']),
    # ── 관계 ──
    C('apple-day-kr', 'relationship', 'documented_unofficial', '애플데이(사과데이)', '애플데이', 'annual-fixed', '10-24', None,
      '한국', '둘(2)이 사(4)과하고 화해하자며 사과를 건네는 날', '"사과(謝過)"와 "사과(沙果)" 동음 말장난',
      '2002년 학교폭력대책 국민협의회 마련(대학 기고문은 "~했다고 한다"로 전함)', 'secondary_hearsay', '공식 지정 없음', 'medium', [
          cl('date_pun', '10월 24일을 둘이 사과하고 화해하는 날로 정함', S, ('apple-day-kr/seoul-2013', '애플데이는 사과철인 10월의 24일을')),
          cl('year', '2002년 제정', S, ('apple-day-kr/seoul-2013', '2002년 제정됐다')),
          cl('body', '학교폭력대책 국민협의회가 마련(전언)', S,
             ('apple-day-kr/syu', '2002년에 학교폭력대책 국민협의회에서 사제 간과 친구 간에 애정과 화해가 담긴 사과(沙果)와 편지를 교환하여 따뜻한 학교를 만들자는 취지로 마련했다고 한다.')),
      ], prior=['tools/namuwiki/output/namuwiki_calendar.json: 사과데이(발견용 행)']),
    C('galentines-day', 'relationship', 'documented_unofficial', '갤런타인데이', "Galentine's Day", 'annual-fixed', '02-13', None,
      '미국에서 시작, 국제', '밸런타인데이 전날 여자 친구들끼리 우정을 챙기는 날', 'TV 시트콤 속 가짜 기념일이 현실로 넘어옴',
      '2010년 2월 11일 방영 "Parks and Recreation" 시즌2 16화에서 탄생', 'original_read', '공식 지정 없음', 'high', [
          cl('origin', '2010년 2월 11일 방영 시즌2 16화에서 탄생', S,
             ('galentines-day/mentalfloss', 'was conceived in the 16th episode of season 2 of Parks and Recreation, which aired on February 11, 2010.')),
          cl('date', '현실에서 매년 2월 13일 기념', S, ('galentines-day/history-com', 'Real women celebrate the once-fictional holiday every February 13.')),
      ]),
    C('national-boyfriend-day', 'relationship', 'documented_unofficial', '남자친구의 날', 'National Boyfriend Day', 'annual-fixed', '10-03', None,
      '국제(SNS)', '남자친구에게 고마움을 표하는 날', '출처 없이 SNS 해시태그로 커진 날',
      '2014년 10월 4일쯤 시작으로 추정, 2016년 3월 트윗 급증(위키백과). 제정자 없음', 'original_read_unknown_founder', '공식 지정 없음', 'medium', [
          cl('date', '매년 10월 3일 비공식 행사', S,
             ('national-boyfriend-day/wikipedia', 'National Boyfriend Day is an unofficial event celebrated annually on October 3 in many countries.')),
          cl('origin', '2014년경 시작 추정, 2016년 3월 확산', S,
             ('national-boyfriend-day/wikipedia', 'is thought to have originated around October 4, 2014, but it only gained widespread popularity in March 2016')),
      ], related=['여자친구']),
    C('kokuhaku-day-jp', 'relationship', 'discovered_unverified', '고백의 날(일본)', '告白の日', 'annual-fixed', '05-09', None,
      '일본', '5·9를 "고쿠(はく)"로 읽어 좋아하는 사람에게 고백하자는 날', '날짜 말장난 + 화장품 브랜드 기념일',
      '유니레버 재팬(AXE)이 제정 — 목록 사이트 1곳', 'single_listing', '기업 제정. 공식 지정 아님', 'low', [
          cl('founder_pun', 'AXE 유니레버 재팬이 こ(5)く(9)はく 말장난으로 제정', S,
             ('kokuhaku-day-jp/netlab-0509', '男性用化粧品AXEを手がけるユニリーバ・ジャパン株式会社が【こ(5)く(9)はく】の語呂合わせにちなんで5月9日に記念日を制定しております。')),
      ], search_only=[('https://bestcalendar.jp/dates/kinenbi/2273', '원문 503 → 검색결과만 확인'), ('https://tabi-mag.jp/day0509/', '원문 403 → 검색결과만 확인')],
      related=['고백데이']),
    C('ii-fufu-day-jp', 'relationship', 'discovered_unverified', '좋은 부부의 날(일본)', 'いい夫婦の日', 'annual-fixed', '11-22', None,
      '일본', '11·22를 "이이 후후(좋은 부부)"로 읽어 부부를 챙기는 날', '숫자 말장난',
      '1988년 여가개발센터(현 일본생산성본부) 제정 — 목록 사이트 1곳', 'single_listing', '민간 제정', 'medium', [
          cl('founder', '여가개발센터 제정', S, ('ii-fufu-day-jp/bestcalendar', '制定：余暇開発センター（現：日本生産性本部・余暇創研）')),
          cl('year', '1988년', S, ('ii-fufu-day-jp/bestcalendar', '1988年（昭和63年）')),
      ], related=['부부의 날'], prior=['tools/research/jp-anniversaries.md: 11/22 좋은 부부의 날(과거 발견 표)']),
    C('world-introvert-day', 'relationship', 'discovered_unverified', '세계 내향인의 날', 'World Introvert Day', 'annual-fixed', '01-02', None,
      '국제 비공식', '연말 모임에 지친 내향인이 쉬어 가는 날', '사교 피로를 이유로 만든 성격 유형 기념일',
      '심리학자 Felicitas Heyne 창안, 첫 기념 2011년 1월 2일(목록 사이트). 블로그 글 날짜는 검색결과에서 상충', 'single_listing',
      '공식 지정 없음', 'medium', [
          cl('first', '첫 세계 내향인의 날은 2011년 1월 2일', S, ('world-introvert-day/nationaldaycalendar', 'The first World Introvert Day was held on January 2, 2011.')),
          cl('founder', 'Felicitas Heyne 창안', S, ('world-introvert-day/nationaldaycalendar', 'The day was created by psychologist and author, Felicitas Heyne.')),
      ], search_only=[('https://www.theweek.in/leisure/society/2024/01/02/on-world-introvert-day-a-look-at-5-famous-introverts.amp.html', 'HTTP 200 이지만 Access Denied 안내문뿐 → 미확인')],
      caution='성격 유형을 놀림감으로 쓰지 말 것'),
    # ── 물건·취미 ──
    C('bubble-wrap-appreciation-day', 'object_hobby', 'documented_unofficial', '뽁뽁이 감사의 날', 'Bubble Wrap Appreciation Day', 'annual-nth-weekday', '01-L-MON', None,
      '미국 비공식', '포장용 에어캡(뽁뽁이)을 터뜨리며 감사하는 날', '포장재를 기념하는 날',
      '라디오 방송국이 생방송 중 마이크 포장을 뜯은 데서 시작했다는 설명은 도서관 블로그 1곳뿐(방송국명 없음)', 'single_source_unverified',
      '공식 지정 없음', 'high', [
          cl('npr_2013', 'NPR 이 2013년 1월 28일(1월 마지막 월요일) 이날을 언급', S,
             ('bubble-wrap-appreciation-day/npr-2013', 'on National Bubble Wrap Appreciation Day.'), ('bubble-wrap-appreciation-day/npr-2013', 'January 28, 2013')),
          cl('rule', '매년 1월 마지막 월요일', S, ('bubble-wrap-appreciation-day/bellevue-library', 'is always on the last Monday in January of every year.')),
          cl('radio_origin', '라디오 방송국 유래설', 'single_source_unverified',
             ('bubble-wrap-appreciation-day/bellevue-library', 'This unofficial holiday began when a radio station unwrapped microphones on the air and listeners loved it!')),
      ]),
    C('ugly-christmas-sweater-day', 'object_hobby', 'duplicate', '촌스러운 크리스마스 스웨터의 날', 'National Ugly Christmas Sweater Day', 'annual-nth-weekday', '12-3-FRI', None,
      '미국 비공식', '일부러 촌스러운 크리스마스 스웨터를 입는 날', '못생김을 경쟁하는 옷 기념일',
      '2011년 시작, 2012년 공식 사이트 개설(Dictionary.com). 밴쿠버 유래·시장 선언설은 검색결과만 확인', 'original_read',
      '공식 지정 없음', 'medium', [
          cl('rule', '매년 12월 셋째 금요일, 비공식', S,
             ('ugly-christmas-sweater-day/dictionary-com', 'The humorous, unofficial holiday of National Ugly Christmas Sweater Day falls on the third Friday of December every year.')),
          cl('start', '2011년 시작', S, ('ugly-christmas-sweater-day/dictionary-com', 'And so National Ugly Christmas Sweater Day was started in 2011.')),
      ], dup='anv-fixed-12-18-ugly-christmas-sweater-day-global',
      dup_note='기존 "못생긴 크리스마스 스웨터의 날"(culture)과 같은 날. 단 기존 항목은 annual-fixed 12-18 인데 원문 규칙은 12월 셋째 금요일 — 2027년 12-17·2028년 12-15 와 어긋남. 기존 항목 날짜 규칙 재검증 대상(이번 작업에서 수정 안 함)'),
    C('international-geocaching-day', 'object_hobby', 'documented_unofficial', '국제 지오캐싱의 날', 'International Geocaching Day', 'annual-nth-weekday', '08-3-SAT', None,
      '국제(취미 커뮤니티)', 'GPS로 숨겨진 상자를 찾는 지오캐싱 취미의 날', '전 세계 "보물찾기" 취미의 기념일',
      '2011년 Geocaching.com 운영사가 첫 개최', 'organizer_original', '운영 기업 제정. 공식 지정 아님', 'high', [
          cl('first', '2011년 8월 셋째 토요일이 첫 국제 지오캐싱의 날', S,
             ('international-geocaching-day/geocaching-blog-2011', 'This is the third Saturday of August, which will be the first International Geocaching Day!')),
          cl('rule', '매년 8월 셋째 토요일', S,
             ('international-geocaching-day/geocaching-blog-2012', 'Each year, Geocaching.com celebrates International Geocaching Day on the third Saturday in August')),
      ]),
    C('kushi-day-jp', 'object_hobby', 'discovered_unverified', '빗의 날(일본)', 'くしの日', 'annual-fixed', '09-04', None,
      '일본', '9·4를 "구시(빗)"로 읽어 빗을 아끼자는 날', '숫자 말장난',
      '1978년 미용 관계자 제정, 미용주간 실행위원회 실시(목록 사이트 2곳). "9·4=苦死" 연관은 원문에 없어 기록하지 않음', 'listing_sites_only',
      '민간 제정', 'low', [
          cl('founder_year', '1978년 미용 관계자 제정', S, ('kushi-day-jp/zatsuneta', '美容関係者らが1978年（昭和53年）に制定。')),
          cl('pun', 'く(9)し(4) 말장난', S, ('kushi-day-jp/zatsuneta', '日付は「く（9）し（4）」と読む語呂合わせと')),
          cl('year_2', '1978년(두 번째 목록)', S, ('kushi-day-jp/bestcalendar', '1978年（昭和53年）')),
      ]),
    C('pants-day-jp', 'object_hobby', 'discovered_unverified', '팬티의 날(일본)', 'パンツの日', 'annual-fixed', '08-02', None,
      '일본', '8·2를 "판츠"로 읽는 속옷의 날', '속옷을 기념하는 말장난 날',
      '제정자 여럿: 1984년 이소가이 포백공업(상품명 유래)·오구란(말장난), 2020년 와코루 등록(목록 사이트 2곳)', 'listing_sites_only',
      '기업 제정·일본기념일협회 등록(와코루). 공식 지정 아님', 'low', [
          cl('founder_1984', '1984년 이소가이 포백공업 제정, 상품명 유래', S,
             ('pants-day-jp/bestcalendar', '1984年（昭和59年）'), ('pants-day-jp/bestcalendar', 'ブランド「シルビー802」の商品名から')),
          cl('pun', 'パン(8)ツ(2) 말장난', S, ('pants-day-jp/bestcalendar', 'オグラン（語呂合わせ「パン8ツ2」）')),
          cl('wacoal', '2020년 와코루 기념일 등록', S,
             ('pants-day-jp/zatsuneta-wacoal', '記念日は2020年（令和2年）に一般社団法人・日本記念日協会により認定・登録された。')),
      ], related=['속옷의 날'], prior=['tools/research/jp-blog-raw.txt: 8/2 팬츠의 날(발견용)', 'tools/namuwiki/output/namuwiki_calendar.json: 팬티의 날(발견용)']),
    C('futon-day-jp', 'object_hobby', 'date_conflict', '이불의 날(일본)', 'ふとんの日', 'annual-fixed', '10-10',
      '1997년 02-10 으로 시작, 2010년 10-10 으로 변경(목록 사이트). 02-10 을 계속 쓰는 목록도 있음', '일본',
      '"후(2)톤(10)" 말장난으로 이불을 알리는 날', '10월 10일은 10이 두 개(후타츠)라서 "후톤"이라는 이중 말장난',
      '1997년 전일본침장구협회 제정(목록 사이트 2곳)', 'listing_sites_only', '업계 단체 제정', 'low', [
          cl('founding', '1997년 협회 제정, ふ(2)と(10)ん 말장난', S,
             ('futon-day-jp/zatsuneta-0210', '全日本寝装具協会が1997年（平成9年）に制定。'), ('futon-day-jp/zatsuneta-0210', '日付は「ふ（2）と（10）ん」と読む語呂合わせから。')),
          cl('changed', '2010년 10월 10일로 변경', 'conflicting',
             ('futon-day-jp/bestcalendar-1010', '10月10日（2010年に変更）'), ('futon-day-jp/bestcalendar-1010', '1997年（2月10日として）')),
      ], related=['이불']),
    # ── 미신 ──
    C('defy-superstition-day', 'superstition', 'documented_unofficial', '미신에 맞서는 날', 'Defy Superstition Day', 'annual-fixed', '09-13', None,
      '미국 비공식', '13이라는 불길한 숫자 등 미신을 일부러 깨 보는 날', '미신을 "기념"이 아니라 "반항"한다',
      '1987년경 델라웨어대 수학자 Tom Fernsler 창안설("some credit" — 원문도 단정 안 함)', 'hedged_by_source',
      '공식 지정 없음', 'medium', [
          cl('date', '9월 13일 기념', S, ('defy-superstition-day/whatsupnewp', 'The origins of the Sept. 13')),
          cl('origin', '1987년경 Tom Fernsler 창안설', S,
             ('defy-superstition-day/whatsupnewp', 'some credit its creation around 1987 to Tom Fernsler, a now-retired University of Delaware mathematician.')),
      ], search_only=[('https://www.awarenessdays.com/awareness-days-calendar/national-defy-superstition-day/', '원문 403 → 검색결과만 확인')],
      caution='사다리 밑 걷기 등 위험 행동을 권하지 말 것'),
    C('yurei-day-jp', 'superstition', 'discovered_unverified', '유령의 날(일본)', '幽霊の日', 'annual-fixed', '07-26', None,
      '일본', '괴담 가부키 "도카이도 요쓰야 괴담" 초연일(1825)을 유령의 날로 부름', '유령을 기념하는 날',
      '유래(1825년 초연일)는 목록 사이트 2곳 일치. 누가 정했는지는 원문에 없음("とされています")', 'listing_sites_only_no_founder',
      '제정자 미상', 'low', [
          cl('premiere', '1825년 이날 에도 나카무라좌에서 초연', S, ('yurei-day-jp/zatsuneta', '1825年（文政8年）のこの日、江戸の中村座で')),
          cl('naming', '초연일에 맞춰 유령의 날로 여겨짐', S, ('yurei-day-jp/bestcalendar', 'その初演日にちなみ、7月26日は「幽霊の日」とされています。')),
      ], prior=['tools/research/jp-blog-raw.txt: 7/26 유령의 날(발견용)', 'tools/namuwiki/output/namuwiki_calendar.json: 일본 유령의 날(발견용)']),
    C('put-a-pillow-on-your-fridge-day', 'superstition', 'discovered_unverified', '냉장고 위에 베개 올리는 날', 'Put a Pillow on Your Fridge Day', 'annual-fixed', '05-29', None,
      '미국·유럽 비공식(학생신문 표현)', '냉장고 위에 베개를 올려 두면 행운이 온다는 날', '근거 없는 행운 의식',
      '"1900년대 초 식료품 창고에 침실 천을 넣던 풍습" 설은 학생신문 1곳의 주장, 확인 안 됨. 같은 기사가 "왜 5월 29일인지 아무도 모른다"고 씀', 'single_source_unverified',
      '공식 지정 없음', 'low', [
          cl('ritual', '냉장고 위에 베개를 올리면 행운이 온다고 함', S,
             ('put-a-pillow-on-your-fridge-day/manualredeye', 'You put a pillow on top of your refrigerator, and it supposedly brings good luck.')),
          cl('date_unknown_reason', '왜 5월 29일인지 아무도 모름', S,
             ('put-a-pillow-on-your-fridge-day/manualredeye', 'No one has been able to discern why May 29 was chosen as put a pillow on your fridge day')),
          cl('folk_origin', '1900년대 초 풍습 유래설', 'single_source_unverified',
             ('put-a-pillow-on-your-fridge-day/manualredeye', 'This holiday can be traced back to the early 1900s where families believed that putting a piece of cloth from their bedroom')),
      ], search_only=[('https://www.timeanddate.com/holidays/fun/put-a-pillow-on-your-fridge-day', '"만들어진 기념일", 유래 미상(검색 요약). 원문 403')]),
]

# 처음 떠올렸지만 서비스에 이미 있는 유명 이색 기념일 — 신규 아님(이름 패턴으로 기존 id 를 찾는다)
EXISTING = [('잃어버린 양말 추모의 날', 'Lost Sock Memorial Day'), ('발가락 꼼지락거리는 날', 'Wiggle Your Toes Day'),
            ('몰래 주키니 선물하는 날', 'Sneak Some Zucchini onto Your Neighbor’s Porch Day'), ('페스티버스', 'Festivus'),
            ('레이프 에릭손의 날', 'Leif Erikson Day'), ('타월의 날', 'Towel Day'), ('호빗의 날', 'Hobbit Day'),
            ('검은 고양이 감사의 날', 'Black Cat Appreciation Day'), ('윤일 청혼의 날', 'Bachelor’s Day / Leap Day proposal'),
            ('셰익스피어처럼 말하는 날', 'Talk Like Shakespeare Day'), ('타임트래블러인 척하는 날', 'Pretend to Be a Time Traveler Day'),
            ('세계 해적처럼 말하기의 날', 'Talk Like a Pirate Day'), ('세계 닌자의 날', 'International Ninja Day')]

SEARCHES = [
    ('"Hoodie Hoo Day" February 20 yell winter', 'en', 'hoodie-hoo-day', '존재·2/20·Wellcat 확인'),
    ('"Yell Fudge at the Cobras in North America Day" June 2', 'en', 'yell-fudge-cobras-day', '관련 결과 0건'),
    ('"Yell Fudge" cobras holiday Wellcat June', 'en', 'yell-fudge-cobras-day', 'Goodreads 블로그 1건(날짜 없음)'),
    ('"Put a Pillow on Your Fridge Day" May 29', 'en', 'put-a-pillow-on-your-fridge-day', 'timeanddate·학생신문'),
    ('"Plan Your Epitaph Day" November 2', 'en', 'plan-your-epitaph-day', '11/2 vs 4/6'),
    ('"Answer Your Cat\'s Question Day" January 22', 'en', 'answer-your-cats-questions-day', '1/22'),
    ('"Ask a Stupid Question Day" September 28 origin teachers', 'en', 'ask-a-stupid-question-day', '유래 상충'),
    ('"Bubble Wrap Appreciation Day" last Monday January radio station', 'en', 'bubble-wrap-appreciation-day', 'NPR 2013'),
    ('"Caps Lock Day" October 22 Derek Arnold', 'en', 'caps-lock-day', '10/22·6/28'),
    ('"Mean Girls Day" October 3 "what day it was" fans celebrate', 'en', 'mean-girls-day', 'CBS·TIME'),
    ('"It\'s gonna be May" April 30 meme Justin Timberlake annual', 'en', 'its-gonna-be-may', 'Spotify newsroom'),
    ('"Revenge of the Sixth" May 6 Star Wars Sith day', 'en', 'revenge-of-the-sixth', '5/5 vs 5/6'),
    ('"Blue Monday" most depressing day formula Cliff Arnall Sky Travel pseudoscience', 'en', 'blue-monday', 'EBSCO'),
    ('"Galentine\'s Day" February 13 Parks and Recreation Leslie Knope origin', 'en', 'galentines-day', 'Mental Floss·History'),
    ('"Tell a Lie Day" April 4', 'en', 'tell-a-lie-day', 'Christian Post'),
    ('"National Boyfriend Day" October 3 origin', 'en', 'national-boyfriend-day', '위키백과'),
    ('Earth Wind Fire "September" 21st "do you remember" day meme annual', 'en', 'earth-wind-fire-day', 'NPR·LA 시의회'),
    ('10월 24일 사과데이 둘이 사과 화해하는 날', 'ko', 'apple-day-kr', '서울신문 2013'),
    ('10월 4일 천사데이 1004 이색 기념일', 'ko', 'cheonsa-day-kr', '코메디닷컴 칼럼'),
    ('2月22日 忍者の日 ニンニンニン 日本忍者協議会', 'ja', 'ninja-day-jp', 'Time Out·미에현'),
    ('7月26日 幽霊の日 東海道四谷怪談 初演', 'ja', 'yurei-day-jp', '목록 사이트'),
    ('8月2日 パンツの日 由来 記念日', 'ja', 'pants-day-jp', '목록 사이트'),
    ('9月4日 くしの日 苦死 美容週間振興協議会', 'ja', 'kushi-day-jp', '"苦死" 미발견'),
    ('5月9日 告白の日 由来 こくはく 語呂合わせ', 'ja', 'kokuhaku-day-jp', 'AXE'),
    ('11月22日 いい夫婦の日 1988年 余暇開発センター', 'ja', 'ii-fufu-day-jp', '1988'),
    ('"No Socks Day" May 8 origin', 'en', 'no-socks-day', '목록 사이트 위주'),
    ('"Tau Day" June 28 Michael Hartl Tau Manifesto', 'en', 'tau-day', 'tauday.com'),
    ('"World Introvert Day" January 2 Felicitas Heyne', 'en', 'world-introvert-day', '블로그 날짜 상충'),
    ('"National Ugly Christmas Sweater Day" third Friday December origin', 'en', 'ugly-christmas-sweater-day', 'Dictionary.com'),
    ('"International Geocaching Day" third Saturday August Geocaching HQ', 'en', 'international-geocaching-day', '운영사 블로그'),
    ('"Superstition Day" OR "National Superstition Day" date origin', 'en', 'defy-superstition-day', '"Superstition Day" 없음 → Defy Superstition Day 발견'),
    ('変な記念日 面白い記念日 一覧 語呂合わせ 意外', 'ja', None, '탐색용 — ふとんの日 단서'),
    ('황당한 이색 기념일 모음 말장난 날짜 한국 인터넷', 'ko', None, '탐색용 — 대부분 음식 마케팅, 신규 단서 적음'),
    ('2月10日 ふとんの日 全日本寝具寝装品協会 語呂合わせ', 'ja', 'futon-day-jp', '2/10→10/10 변경'),
]


def main():
    log = json.loads((BATCH / 'fetch-log.json').read_text())
    latest = {(e['candidate_key'], e['label']): e for e in log}
    items = [a for f in sorted(glob.glob(str(ROOT / 'src/data/anniversaries/[01]*.json'))) for a in json.load(open(f))]
    records = []
    for c in CANDIDATES:
        key = c['candidate_key']
        used = {ev['evidence_id'] for cl_ in c['claims'] for ev in cl_['evidence']}
        evidence = []
        for (k, label), e in sorted(latest.items()):
            if k != key:
                continue
            status = OVERRIDE.get((k, label), e['access_status'])
            evidence.append(dict(evidence_id=f'{k}/{label}', url=e['url'], source_type=SOURCE_TYPE.get(label, 'other'),
                                 read_status='original_read' if status == 'body_read_http_200' else 'not_read',
                                 access_status=status, http_status=e.get('status'), error=e.get('error'),
                                 accessed_at=e['accessed_at'], local_raw_path=e.get('raw_path'),
                                 local_text_path=e.get('text_path'), sha256=e.get('sha256'),
                                 cited=f'{k}/{label}' in used))
        dup, dup_note = c.pop('_dup')
        related = [dict(id=a['id'], name=a['name'], date=a['date'], category=a['category'])
                   for p in c.pop('related_existing_patterns') for a in items if p in a['name']]
        read = [e for e in evidence if e['read_status'] == 'original_read' and e['cited']]
        c.update(kind_label=KINDS[c['kind']], discovery_status_label=STATUSES[c['discovery_status']],
                 evidence=evidence, source_urls=[e['url'] for e in evidence] + [s['url'] for s in c['search_result_only']],
                 original_read=('yes' if read else 'no — 검색결과만 확인'),
                 single_listing_source=bool(read) and all(e['source_type'] == 'listing' for e in read) and len(read) == 1,
                 listing_sources_only=bool(read) and all(e['source_type'] == 'listing' for e in read),
                 duplicate_check=(dict(existing_id=dup, verdict='duplicate_of_existing', note=dup_note, related_existing=related) if dup
                                  else dict(existing_id=None, verdict='new_not_in_service_1756', related_existing=related)),
                 review=dict(decision='pending', reviewer=None), application=dict(applied=False, note='서비스 반영 미실행'))
        records.append(c)
    for ko, orig in EXISTING:
        hit = [a for a in items if ko in a['name']]
        assert len(hit) == 1, (ko, hit)
        a = hit[0]
        records.append(dict(candidate_key=f'existing:{a["id"]}', kind=None, kind_label='기존 항목', discovery_status='duplicate',
                            discovery_status_label=STATUSES['duplicate'], name_ko=a['name'], name_original=orig,
                            date_rule=a['date'], date_type=a['dateType'], claims=[], evidence=[], search_result_only=[],
                            duplicate_check=dict(existing_id=a['id'], existing_category=a['category'], verdict='duplicate_of_existing'),
                            note='검색 전에 후보로 떠올렸으나 서비스에 이미 있음 — 신규 후보에서 제외'
                                 + ('' if a['category'] == 'quirky' else f' (현재 카테고리 {a["category"]}, quirky 아님)')))
    out = dict(_note='발견 조사 기록. 승인·반영 상태가 아님. 서비스 파일 미수정.', batch_id=BATCH.name,
               researched_at='2026-10-12', owner='Claude Code (Opus 5.5)', kinds=KINDS, statuses=STATUSES, records=records)
    (BATCH / 'records.json').write_text(json.dumps(out, ensure_ascii=False, indent=1) + '\n')
    (BATCH / 'search-log.json').write_text(json.dumps(
        [dict(query=q, lang=l, candidate_key=k, tool='WebSearch(standard)', result='search_result_only', note=n) for q, l, k, n in SEARCHES],
        ensure_ascii=False, indent=1) + '\n')
    print(len(records), 'records', sum(r['discovery_status'] != 'duplicate' for r in records), 'candidates')


if __name__ == '__main__':
    main()
