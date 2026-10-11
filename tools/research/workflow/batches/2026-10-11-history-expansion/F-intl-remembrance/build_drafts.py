#!/usr/bin/env python3
"""Build drafts.json for group F-intl-remembrance (draft only; never touches src/)."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
EV = os.path.join(HERE, "evidence")
ACC = "2026-10-11"

SRC = {
    "un_holocaust_obs": ("https://www.un.org/en/holocaustremembrance/observance", "International Day of Commemoration in memory of the victims of the Holocaust", "United Nations"),
    "un_holocaust_prog": ("https://www.un.org/en/holocaustremembrance", "The Holocaust and the United Nations Outreach Programme", "United Nations"),
    "un_res_60_7": ("https://documents.un.org/api/symbol/access?s=A/RES/60/7&l=en&t=pdf", "A/RES/60/7 Holocaust remembrance", "UN General Assembly"),
    "ushmm_auschwitz": ("https://encyclopedia.ushmm.org/content/en/article/auschwitz", "Auschwitz", "United States Holocaust Memorial Museum"),
    "ushmm_intro": ("https://encyclopedia.ushmm.org/content/en/article/introduction-to-the-holocaust", "Introduction to the Holocaust", "United States Holocaust Memorial Museum"),
    "un_slavery_obs": ("https://www.un.org/en/observances/transatlantic-slave-trade", "International Day of Remembrance of the Victims of Slavery and the Transatlantic Slave Trade", "United Nations"),
    "un_res_62_122": ("https://documents.un.org/api/symbol/access?s=A/RES/62/122&l=en&t=pdf", "A/RES/62/122", "UN General Assembly"),
    "unesco_aug23": ("https://www.unesco.org/en/days/slave-trade-remembrance", "International Day for the Remembrance of the Slave Trade and its Abolition", "UNESCO"),
    "un_abolition_obs": ("https://www.un.org/en/observances/slavery-abolition-day", "International Day for the Abolition of Slavery", "United Nations"),
    "un_res_317_IV_": ("https://documents.un.org/api/symbol/access?s=A/RES/317(IV)&l=en&t=pdf", "A/RES/317(IV)", "UN General Assembly"),
    "un_hrday_obs": ("https://www.un.org/en/observances/human-rights-day", "Human Rights Day", "United Nations"),
    "un_udhr_history": ("https://www.un.org/en/about-us/udhr/history-of-the-declaration", "History of the Declaration", "United Nations"),
    "un_res_423V": ("https://documents.un.org/api/symbol/access?s=A/RES/423(V)&l=en&t=pdf", "A/RES/423(V) Human Rights Day", "UN General Assembly"),
    "un_chernobyl_obs": ("https://www.un.org/en/observances/chernobyl-remembrance-day", "International Chernobyl Disaster Remembrance Day", "United Nations"),
    "un_res_71_125": ("https://documents.un.org/api/symbol/access?s=A/RES/71/125&l=en&t=pdf", "A/RES/71/125 Persistent legacy of the Chernobyl disaster", "UN General Assembly"),
    "unscear_chernobyl": ("https://www.unscear.org/unscear/en/areas-of-work/chernobyl.html", "Assessments of the radiation effects from the Chernobyl nuclear reactor accident", "UNSCEAR"),
    "un_chemical_obs": ("https://www.un.org/en/observances/chemical-warfare-victims-day", "Day of Remembrance for all Victims of Chemical Warfare", "United Nations"),
    "opcw_2009_news": ("https://www.opcw.org/media-centre/news/2009/03/29-april-2009-day-remembrance-all-victims-chemical-warfare", "29 April 2009: Day of Remembrance for all Victims of Chemical Warfare", "OPCW"),
    "opcw_s2460_2025": ("https://www.opcw.org/sites/default/files/documents/2025/11/s-2460-2025(e).pdf", "S/2460/2025 Day of Remembrance for All Victims of Chemical Warfare", "OPCW Technical Secretariat"),
    "opcw_remembrance": ("https://www.opcw.org/remembrance", "Day of Remembrance for All Victims of Chemical Warfare Resources", "OPCW"),
    "opcw_about": ("https://www.opcw.org/about-us", "About Us", "OPCW"),
    "un_disappear_obs": ("https://www.un.org/en/observances/victims-enforced-disappearance", "International Day of the Victims of Enforced Disappearances", "United Nations"),
    "un_res_65_209": ("https://documents.un.org/api/symbol/access?s=A/RES/65/209&l=en&t=pdf", "A/RES/65/209", "UN General Assembly"),
    "encykorea_childday": ("https://encykorea.aks.ac.kr/Article/E0035938", "어린이날", "한국민족문화대백과사전(한국학중앙연구원)"),
    "encykorea_saekdong": ("https://encykorea.aks.ac.kr/Article/E0027479", "색동회", "한국민족문화대백과사전(한국학중앙연구원)"),
    "encykorea_bang": ("https://encykorea.aks.ac.kr/Article/E0021783", "방정환", "한국민족문화대백과사전(한국학중앙연구원)"),
    "law_child_welfare": ("https://www.law.go.kr/법령/아동복지법", "아동복지법 (현행, DRF XML)", "국가법령정보센터"),
    "law_holidays": ("https://www.law.go.kr/법령/관공서의공휴일에관한규정", "관공서의 공휴일에 관한 규정 (현행, DRF XML)", "국가법령정보센터"),
    "un_childrensday_bg": ("https://www.un.org/en/observances/world-childrens-day/background", "World Children's Day – Background", "United Nations"),
    "encykorea_yeogwon": ("https://encykorea.aks.ac.kr/Article/E0079698", "여권통문", "한국민족문화대백과사전(한국학중앙연구원)"),
    "encykorea_chanyang": ("https://encykorea.aks.ac.kr/Article/E0055228", "찬양회", "한국민족문화대백과사전(한국학중앙연구원)"),
    "encykorea_sunseong": ("https://encykorea.aks.ac.kr/Article/E0031901", "순성학교", "한국민족문화대백과사전(한국학중앙연구원)"),
    "law_gender_equality": ("https://www.law.go.kr/법령/양성평등기본법", "양성평등기본법 (현행, DRF XML)", "국가법령정보센터"),
    "yna_yeogwon_2019": ("https://www.yna.co.kr/view/AKR20191031185300005", "매년 9월 1일 '여권통문의 날' 제정", "연합뉴스"),
    "donga_sosa_2014": ("https://www.donga.com/news/Culture/article/all/20140225/61177767/1", "조선시대 기혼녀 호칭, 신분따라 달랐다", "동아일보"),
}


def _fix_quote(key, quote):
    import unicodedata
    body = open(os.path.join(EV, key + ".txt"), encoding="utf-8").read()
    if quote in body:
        return quote
    canon = lambda t: "".join(unicodedata.normalize("NFC", c) if 0xF900 <= ord(c) <= 0xFAFF else c for c in t)
    cb, cq = canon(body), canon(quote)
    i = cb.find(cq)
    return body[i:i + len(quote)] if i >= 0 else quote


def ev(claim, key, quote):
    quote = _fix_quote(key, quote)
    url, title, pub = SRC[key]
    return {"claim": claim, "url": url, "title": title, "publisher": pub, "accessed_at": ACC,
            "quote_original": quote, "local_evidence_path": f"evidence/{key}.txt"}


D = {}

# 1 ------------------------------------------------------------------
D["anv-fixed-01-27-international-holocaust-remembrance-day-global"] = {
    "origin": "매년 1월 27일은 유엔이 정한 국제 홀로코스트 희생자 추모의 날로, 나치 독일이 저지른 집단학살의 희생자를 기억하는 날이다. 홀로코스트는 1933년부터 1945년까지 나치 독일 정권과 그 동맹·협력자들이 국가 차원에서 체계적으로 유럽 유대인을 박해하고 살해한 사건을 말하며, 미국 홀로코스트기념관은 희생된 유대인을 600만 명으로 설명한다. 아우슈비츠는 그 가운데 가장 큰 나치 수용소였다. 나치 독일은 1940년 점령한 폴란드 땅에 이 수용소를 세웠고, 1942년부터는 유럽 각지의 유대인을 데려와 학살하는 시설까지 갖춘 거대한 수용소 단지로 키웠다. 1945년 1월 27일 소련군이 이곳에 남아 있던 수감자 약 7,000명을 해방했다. 이 날짜를 국제 추모일로 정한 것은 2005년 11월 1일 유엔 총회가 채택한 결의 60/7이다. 총회 결의는 유엔의 모든 회원국이 모이는 총회가 채택해 밝히는 공식 입장으로, 이 결의는 1월 27일을 해마다 기리는 날로 지정하는 동시에 홀로코스트를 역사적 사건으로서 전부 또는 일부라도 부정하는 시도를 거부한다고 밝혔다.",
    "anecdote": "왜 하필 1월 27일일까. 이날은 전쟁이 끝난 날이 아니라, 홀로코스트의 상징이 된 아우슈비츠에서 수감자들이 풀려난 날이다. 미국 홀로코스트기념관에 따르면 아우슈비츠에서만 약 110만 명이 목숨을 잃었고, 그중 약 100만 명이 유대인이었으며 폴란드인, 유럽의 소수민족인 로마인, 소련군 포로 등도 희생됐다. 결의 60/7은 홀로코스트가 유대 민족의 3분의 1을 살해했고 다른 소수자들도 수없이 희생됐다고 적으며, 이 사건이 증오와 편견, 인종주의의 위험을 알리는 영원한 경고가 될 것이라고 밝혔다. 그래서 이날은 애도에서 그치지 않고 교육으로 이어진다. 같은 결의는 각국에 홀로코스트의 교훈을 다음 세대에 가르칠 교육 프로그램을 만들라고 촉구했고, 유엔은 이 결의에 따라 '홀로코스트와 유엔 아웃리치 프로그램'을 세워 교육 자료와 전시, 토론회를 운영한다. 매년 이맘때 뉴욕 유엔 본부와 세계 곳곳의 유엔 사무소에서 추모식과 관련 행사가 열린다.",
    "sourceUrl": "https://www.un.org/en/holocaustremembrance/observance",
    "evidence": [
        ev("결의 60/7이 1월 27일을 연례 국제 추모일로 지정", "un_holocaust_obs", "United Nations General Assembly Resolution 60/7 that established the Holocaust and the United Nations Outreach Programme, also designated 27 January as an annual International Day of Commemoration in memory of the victims of the Holocaust"),
        ev("결의 60/7 채택일 2005년 11월 1일", "un_res_60_7", "Resolution adopted by the General Assembly on 1 November 2005"),
        ev("결의 60/7 지정 조항", "un_res_60_7", "1. Resolves that the United Nations will designate 27 January as an annual International Day of Commemoration in memory of the victims of the Holocaust;"),
        ev("홀로코스트 부정 거부(전부 또는 일부)", "un_res_60_7", "3. Rejects any denial of the Holocaust as an historical event, either in full or part;"),
        ev("유대 민족의 3분의 1 살해, 증오·편견·인종주의에 대한 경고", "un_res_60_7", "Reaffirming that the Holocaust, which resulted in the murder of one third of the Jewish people, along with countless members of other minorities, will forever be a warning to all people of the dangers of hatred, bigotry, racism and prejudice,"),
        ev("교육 프로그램 개발 촉구", "un_res_60_7", "2. Urges Member States to develop educational programmes that will inculcate future generations with the lessons of the Holocaust in order to help to prevent future acts of genocide,"),
        ev("홀로코스트 정의와 600만 명", "ushmm_intro", "The Holocaust was the systematic, state-sponsored persecution and murder of six million European Jews by the Nazi German regime and its allies and collaborators. The Holocaust was an evolving process that took place throughout Europe between 1933 and 1945."),
        ev("아우슈비츠 1940년 설립, 점령 폴란드", "ushmm_auschwitz", "The Nazis established the Auschwitz concentration camp in German-occupied Poland in 1940."),
        ev("1942년 3월부터 학살 시설 운영", "ushmm_auschwitz", "In March 1942, the SS began operating a killing center at Auschwitz-Birkenau. There, the Germans murdered Jewish people from all over Europe."),
        ev("가장 큰 나치 수용소", "ushmm_auschwitz", "Auschwitz was the largest Nazi concentration camp by number of SS staff, physical size and geographic sprawl of the camp, and number of prisoners."),
        ev("희생자 약 110만 명, 유대인 약 100만 명, 폴란드인·로마·소련군 포로", "ushmm_auschwitz", "At Auschwitz, the Germans killed about 1.1 million people from across Europe. The victims included approximately one million Jews; 70,000–75,000 Poles; about 21,000 Roma; more than 14,000 Soviet prisoners of war; and 10,000–15,000 other people."),
        ev("1945년 1월 27일 소련군이 약 7,000명 해방", "ushmm_auschwitz", "On January 27, 1945, Soviet troops liberated approximately 7,000 prisoners from Auschwitz, Auschwitz-Birkenau, and Monowitz. Today, this date is commemorated as International Holocaust Remembrance Day."),
        ev("아웃리치 프로그램과 교육 자료·전시·토론", "un_holocaust_prog", "The Programme has established a global network of partners and developed versatile initiatives including educational resources, professional development programmes, panel discussions and exhibitions."),
        ev("뉴욕 본부·세계 유엔 사무소 행사", "un_holocaust_obs", "observed with ceremonies and activities at United Nations Headquarters in New York and at United Nations offices around the world."),
    ],
    "corrections_to_existing": [
        "'104개국이 공동 발의국' 주장은 원문(UN 보도자료 GA/10413 접근 차단)으로 확인하지 못해 삭제.",
        "sourceUrl이 Wikipedia였음 → UN 공식 페이지로 교체 제안.",
        "'약 600만 명' 수치는 유지하되 미국 홀로코스트기념관(USHMM) 출처로 명시.",
    ],
    "notes": "결의 60/7은 '1/3 of the Jewish people'로 표현. 로마(Roma)는 비하 표현 '집시' 대신 '유럽의 소수민족인 로마인'으로 풀어씀.",
}

# 2 ------------------------------------------------------------------
D["anv-fixed-03-25-remembrance-victims-slavery-transatlantic-slave-trade-global"] = {
    "origin": "매년 3월 25일은 유엔이 정한 노예제 및 대서양 노예무역 희생자 국제 추모의 날이다. 대서양 노예무역은 아프리카 사람들을 강제로 붙잡아 대서양 건너 아메리카 대륙으로 실어 나르고 사고판 거래를 말한다. 유엔 총회 결의는 이 노예무역이 400년 동안 이어졌다고 적고 있으며, 유엔은 수백만 명의 남성과 여성, 어린이가 폭력적으로 집에서 끌려가 인간다움을 부정당하고 여러 세대에 걸쳐 착취를 견뎌야 했다고 설명한다. 날짜는 1807년 3월 25일 영국에서 노예무역 폐지법이 통과된 날에서 왔다. 유엔 총회는 2006년 결의 61/19로 2007년 3월 25일을 노예무역 폐지 200주년 기념일로 정했고, 이어 2007년 12월 17일 결의 62/122를 채택해 2008년부터 매년 3월 25일을 이 추모의 날로 삼았다. 총회 결의는 유엔의 모든 회원국이 모인 총회가 내놓는 공식 결정이다. 같은 결의는 카리브공동체 회원국들이 제안한 영구 기념물 건립을 환영하고, 노예무역의 원인과 결과, 교훈을 다음 세대에 가르칠 교육 프로그램을 만들도록 사무총장에게 요청했다.",
    "anecdote": "이날을 이해할 때 꼭 구분해야 할 점이 있다. 1807년 영국 법은 노예를 사고파는 '무역'을 금지했을 뿐, 노예제 자체를 없애지는 못했다. 유엔은 노예제가 그 뒤에도 수십 년 동안 이어졌다고 설명한다. 폐지가 누군가의 선의로만 이뤄진 것도 아니다. 유엔은 노예가 된 사람들의 끈질긴 저항, 특히 1804년 아이티 공화국 수립으로 이어진 아이티 혁명을 함께 강조한다. 비슷한 이름의 날도 있다. 유네스코는 1791년 8월 22일 밤부터 23일 사이 지금의 아이티에서 시작된 봉기를 기려 8월 23일을 '노예무역과 그 폐지를 기억하는 국제의 날'로 지키며, 유엔의 3월 25일은 이 날을 보완하는 기념일로 지정됐다. 2015년 3월 25일에는 뉴욕 유엔 본부에 영구 기념물 '귀환의 방주(Ark of Return)'가 공개됐다. 오늘날 이날에는 유엔 총회 기념 회의와 교육 행사가 열리고, 노예제를 정당화한 인종주의가 남긴 불평등을 함께 돌아본다.",
    "sourceUrl": "https://www.un.org/en/observances/transatlantic-slave-trade",
    "evidence": [
        ev("결의 61/19(2006)와 2007년 3월 25일 200주년 기념일, 결의 62/122로 2008년부터 연례 지정", "un_slavery_obs", "In 2006, the United Nations General Assembly, through resolution 61/19, recognized that “the slave trade and slavery are among the worst violations of human rights in the history of humanity, bearing in mind particularly their scale and duration” and designated 25 March 2007 as the International Day for the Commemoration of the Two-hundredth Anniversary of the Abolition of the Transatlantic Slave Trade. The following year, through resolution 62/122, it designated 25 March as an annual International Day of Remembrance of the Victims of Slavery and the Transatlantic Slave Trade, beginning in 2008."),
        ev("결의 62/122 채택일 2007년 12월 17일", "un_res_62_122", "Resolution adopted by the General Assembly on 17 December 2007"),
        ev("400년간 이어진 대서양 노예무역", "un_res_62_122", "Recognizing how little is known about the four-hundred-year-long transatlantic slave trade and its lasting consequences, felt throughout the world,"),
        ev("카리브공동체의 영구 기념물 건립 제안 환영", "un_res_62_122", "1. Welcomes the initiative of the States members of the Caribbean Community to erect in the halls of the United Nations a permanent memorial"),
        ev("유네스코 기념일 보완으로 지정", "un_res_62_122", "beginning in 2008, as a complement to the existing International Day for the Remembrance of the Slave Trade and its Abolition of the United Nations Educational, Scientific and Cultural Organization;"),
        ev("교육 프로그램 요청(원인·결과·교훈)", "un_res_62_122", "in order to inculcate future generations with the causes, consequences and lessons of the transatlantic slave trade and to communicate the dangers of racism and prejudice;"),
        ev("수백만 명이 폭력적으로 끌려가 착취", "un_slavery_obs", "Millions of men, women and children were violently taken from their homes, denied their humanity, and forced to endure generations of exploitation."),
        ev("1807년 3월 25일 영국 노예무역 폐지법", "un_slavery_obs", "The Abolition of the Slave Trade Act was passed in the United Kingdom on 25 March 1807."),
        ev("무역 폐지였지 노예제 폐지는 아님, 수십 년 지속", "un_slavery_obs", "However, while the act abolished the transatlantic trade in enslaved Africans, it did not abolish slavery, which still continued for decades."),
        ev("저항과 아이티 혁명, 1804년 아이티 공화국", "un_slavery_obs", "The abolition followed powerful and sustained acts of resistance by enslaved Africans, including the Haitian revolution, which led to the establishment in 1804 of the Republic of Haiti"),
        ev("유네스코 8월 23일 기념일과 1791년 봉기", "unesco_aug23", "On the night of 22 to 23 August 1791, in Saint Domingue, today the Republic of Haiti, saw the beginning of the uprising that would play a crucial role in the abolition of the transatlantic slave trade."),
        ev("유네스코 기념일 날짜 8월 23일", "unesco_aug23", "It is against this background that the International Day for the Remembrance of the Slave Trade and its Abolition is commemorated on 23 August each year."),
        ev("2015년 3월 25일 귀환의 방주 공개", "un_slavery_obs", "The Permanent Memorial was unveiled on 25 March 2015, which marks the International Day of Remembrance of the Victims of Slavery and the Transatlantic Slave Trade."),
        ev("총회 연례 기념 회의", "un_slavery_obs", "On Wednesday, 25 March 2026, the General Assembly convened its annual plenary meeting at 10:00 a.m. EDT to commemorate the International Day."),
        ev("인종주의 이념과 오늘날 불평등", "un_slavery_obs", "The racist ideologies that justified this crime became embedded in institutions and societies, shaping inequalities that continue today."),
    ],
    "corrections_to_existing": [
        "'강제 이주된 아프리카인 1,200만 명 이상' 수치는 이번에 읽은 UN/UNESCO 원문에서 확인하지 못해 삭제(UN은 'Millions'로만 표현).",
        "'400년 가까이' → 결의 62/122 표현('four-hundred-year-long')에 맞춰 '400년 동안'.",
        "결의 62/122의 정확한 채택일(2007-12-17)과 선행 결의 61/19(2006) 추가.",
    ],
    "notes": "'Routes of Enslaved Peoples'(구 Slave Route Project, 1994) 연계는 사실이나 분량상 생략.",
}

# 3 ------------------------------------------------------------------
D["anv-fixed-12-02-abolition-of-slavery-day-global"] = {
    "origin": "매년 12월 2일은 유엔이 정한 노예제 폐지를 위한 국제 기념일이다. 날짜는 1949년 12월 2일 유엔 총회가 결의 317(IV)로 '인신매매 및 타인의 성매매 착취 금지에 관한 협약'을 채택한 날에서 왔다. 협약은 여러 나라가 서명하고 비준해 지키기로 약속하는 국제 조약을 말한다. 이름에 '노예제 폐지'가 들어 있어 과거 노예 해방을 기념하는 날로 오해하기 쉽지만, 이날의 초점은 모습을 바꿔 지금도 남아 있는 노예제다. 유엔은 이날이 인신매매, 성적 착취, 최악의 형태의 아동노동, 강제결혼, 무력분쟁에 이용하기 위한 아동 강제 징집 같은 현대판 노예제를 뿌리 뽑는 데 초점을 둔다고 설명한다. '현대판 노예제'는 법률 용어가 아니라 강제노동, 빚을 빌미로 일을 강요하는 채무 노예, 강제결혼, 인신매매를 아우르는 표현이다. 핵심은 위협이나 폭력, 강압, 속임수, 권력 남용 때문에 거부하거나 빠져나올 수 없는 착취 상황이라는 점이다. 유엔은 또 일부 사회에서는 오래된 형태의 노예제가 전통적인 믿음과 관습에 뿌리를 둔 채 여전히 이어지고 있다고 지적한다.",
    "anecdote": "현대판 노예제는 먼 나라만의 이야기가 아니다. 유엔이 소개한 국제노동기구(ILO) 추정에 따르면 2021년 현대판 노예 상태에 놓인 사람은 약 5,000만 명으로, 이 가운데 약 2,800만 명이 강제노동, 약 2,200만 명이 강제결혼 상태였다. 2016년 추정보다 1,000만 명 늘어난 규모다. 강제노동의 86%는 국가가 아닌 민간 영역에서 벌어지고, 강제노동의 절반 이상(52%)이 중상위 소득 또는 고소득 국가에서 발견된다고 한다. 인신매매의 뜻도 알아 두면 좋다. 유엔 인신매매 의정서는 착취를 목적으로 위협이나 폭력 같은 강압을 써서 사람을 모집하거나 옮기고 숨겨 두는 행위를 인신매매로 본다. 피해자가 동의했는지는 따지지 않으며, 피해자가 아동이면 강제력이 없어도 범죄가 된다. 비슷한 날과 구별하는 것도 도움이 된다. 3월 25일 노예제 및 대서양 노예무역 희생자 국제 추모의 날이 과거의 비극을 기억하는 데 무게를 둔다면, 12월 2일은 지금 이 순간에도 벌어지는 착취를 끝내는 데 초점을 맞춘다.",
    "sourceUrl": "https://www.un.org/en/observances/slavery-abolition-day",
    "evidence": [
        ev("12월 2일 = 1949년 협약 채택일, 결의 317(IV)", "un_abolition_obs", "The International Day for the Abolition of Slavery, 2 December, marks the date of the adoption, by the General Assembly, of the United Nations Convention for the Suppression of the Traffic in Persons and of the Exploitation of the Prostitution of Others (resolution 317(IV) of 2 December 1949)."),
        ev("현대판 노예제 근절 초점", "un_abolition_obs", "The focus of this day is on eradicating contemporary forms of slavery, such as trafficking in persons, sexual exploitation, the worst forms of child labour, forced marriage, and the forced recruitment of children for use in armed conflict."),
        ev("현대판 노예제 정의(법률 용어 아님)", "un_abolition_obs", "Although modern slavery is not defined in law, it is used as an umbrella term covering practices such as forced labour, debt bondage, forced marriage, and human trafficking. Essentially, it refers to situations of exploitation that a person cannot refuse or leave because of threats, violence, coercion, deception, and/or abuse of power."),
        ev("전통·관습에 뿌리를 둔 옛 형태의 노예제 지속", "un_abolition_obs", "The UN human rights bodies have documented the persistence of old forms of slavery that are embedded in traditional beliefs and customs."),
        ev("ILO 2021 추정 5,000만, 2016 대비 1,000만 증가", "un_abolition_obs", "10 million more people were in modern slavery in 2021 compared to 2016 global estimates, bringing the total to 50 million worldwide."),
        ev("강제노동 2,800만, 강제결혼 2,200만", "un_abolition_obs", "An estimated 50 million people are in modern slavery, including 28 million in forced labour and 22 million in forced marriage."),
        ev("민간 영역 86%", "un_abolition_obs", "Most cases of forced labour (86 per cent) are found in the private sector."),
        ev("52%가 중상위·고소득 국가", "un_abolition_obs", "More than half (52 per cent) of all forced labour and a quarter of all forced marriages can be found in upper-middle income or high-income countries."),
        ev("인신매매 정의", "un_abolition_obs", "According to the Protocol to Prevent, Suppress and Punish Trafficking in Persons Especially Women and Children, trafficking in persons means the recruitment, transportation, transfer, harbouring or receipt of persons, by means of the threat or use of force or other forms of coercion for the purpose of exploitation."),
        ev("동의 무관, 아동은 강제력 없어도 범죄", "un_abolition_obs", "The consent of the person trafficked for exploitation is irrelevant and If the trafficked person is a child, it is a crime even without the use of force."),
        ev("결의 317(IV) 채택일 확인(원문 PDF)", "un_res_317_IV_", "2 December 1949."),
    ],
    "corrections_to_existing": [
        "'이 기념일은 1986년부터 UN 총회가 매년 조직해 왔다'는 주장은 UN 원문에서 확인하지 못해 삭제.",
        "협약 명칭 번역을 원문(Exploitation of the Prostitution of Others)에 맞춰 '인신매매 및 타인의 성매매 착취 금지에 관한 협약'으로 정정('매춘'→'타인의 성매매').",
        "'ILO 수천만 명' 막연한 표현을 UN 페이지의 ILO 2021 추정치(5,000만/2,800만/2,200만)로 구체화.",
        "sourceUrl Wikipedia → UN 공식 페이지.",
    ],
    "notes": "evidence의 un_res_317_IV_ 파일은 1949 결의 스캔 OCR이라 날짜 행만 인용.",
}
D["anv-fixed-12-02-abolition-of-slavery-day-global"]["evidence"][-1].update({"url": "https://documents.un.org/api/symbol/access?s=A/RES/317(IV)&l=en&t=pdf", "title": "A/RES/317(IV)", "publisher": "UN General Assembly"})

# 4 ------------------------------------------------------------------
D["anv-fixed-12-10-human-rights-day-global"] = {
    "origin": "매년 12월 10일은 세계 인권의 날로, 1948년 12월 10일 유엔 총회가 프랑스 파리에서 세계인권선언을 채택한 일을 기념한다. 세계인권선언은 인종, 피부색, 종교, 성별, 언어, 정치적 의견, 출신, 재산 등과 상관없이 모든 사람이 인간이기에 누려야 할 기본적 권리를 처음으로 정리해, 보편적으로 보호해야 할 기준으로 내놓은 문서다. 배경에는 제2차 세계대전이 있었다. 유엔은 전쟁이 끝나고 유엔이 만들어지면서 국제사회가 그 전쟁에서 벌어진 것 같은 참상을 다시는 허용하지 않겠다고 다짐했다고 설명한다. 초안 작업은 유엔 인권위원회가 맡았다. 프랭클린 루스벨트 전 미국 대통령의 부인 엘리너 루스벨트가 위원장으로 작업을 이끌었고, 프랑스의 르네 카생, 레바논의 찰스 말리크, 중국의 장펑춘, 캐나다의 존 험프리 등이 함께했다. 전체 문안은 2년이 채 안 되는 기간에 완성됐고, 총회 결의 217 A(III)로 채택될 때 반대 없이 8개국이 기권했다. 2년 뒤인 1950년 12월 4일 총회는 결의 423(V)로 모든 국가와 관련 단체에 매년 12월 10일을 인권의 날로 지키자고 권했다.",
    "anecdote": "세계인권선언은 스스로를 '모든 인민과 모든 국가가 달성해야 할 공통의 기준'이라고 소개한다. 유엔은 이 선언이 국제·국가·지역의 법과 정책을 만드는 세계적 청사진이자 2030 지속가능발전 의제의 토대라고 설명한다. 선언은 30개 조항으로 이뤄져 있으며, 577개 언어로 옮겨져 세계에서 가장 많이 번역된 문서로 꼽힌다. 만들어지는 과정도 순탄하지 않았다. 당시 세계는 동서 두 진영으로 갈라져 있었고, 유엔은 선언의 핵심에 무엇을 담을지 공통분모를 찾는 일이 엄청난 과제였다고 전한다. 문구 하나에 담긴 일화도 있다. 인도 대표 한사 메타는 제1조의 '모든 남성(men)은 자유롭고 평등하게 태어난다'를 '모든 인간(human beings)은'으로 바꾸는 데 기여한 인물로 널리 알려져 있다. 여성 대표들이 여성의 권리를 선언에 담는 데 중요한 역할을 했다는 점을 보여 주는 장면이다. 오늘날 인권의 날에는 유엔이 해마다 주제를 정해 캠페인과 행사를 열고, 인권이 먼 이념이 아니라 일상을 지탱하는 기본이라는 점을 강조한다.",
    "sourceUrl": "https://www.un.org/en/observances/human-rights-day",
    "evidence": [
        ev("1948년 12월 10일 파리 총회 선포, 보편적 보호 기본권 최초 제시", "un_hrday_obs", "The Declaration was proclaimed by the United Nations General Assembly in Paris on 10 December 1948 and sets out, for the first time, fundamental human rights to be universally protected."),
        ev("차별 없는 권리(인종·피부색·종교 등)", "un_hrday_obs", "This landmark document enshrines the inalienable rights that everyone is entitled to as a human being - regardless of race, colour, religion, sex, language, political or other opinion, national or social origin, property, birth or other status."),
        ev("제2차 세계대전 경험과 재발 방지 다짐", "un_udhr_history", "With the end of that war, and the creation of the United Nations, the international community vowed to never again allow atrocities like those of that conflict to happen again."),
        ev("엘리너 루스벨트 위원장, 카생·말리크·장펑춘·험프리", "un_udhr_history", "Eleanor Roosevelt, widow of American President Franklin D. Roosevelt, chaired the UDHR drafting committee. With her were René Cassin of France, who composed the first draft of the Declaration, the Committee Rapporteur Charles Malik of Lebanon, Vice-Chairman Peng Chung Chang of China, and John Humphrey of Canada, Director of the UN’s Human Rights Division, who prepared the Declaration’s blueprint."),
        ev("결의 217 A(III), 8개국 기권·반대 없음", "un_udhr_history", "By its resolution 217 A (III) of 10 December 1948, the General Assembly, meeting in Paris, adopted the Universal Declaration of Human Rights with eight nations abstaining from the vote but none dissenting."),
        ev("2년 미만에 작성, 동서 진영 분열", "un_udhr_history", "The entire text of the UDHR was composed in less than two years. At a time when the world was divided into Eastern and Western blocks, finding a common ground on what should make the essence of the document proved to be a colossal task."),
        ev("한사 메타의 제1조 문구 변경", "un_udhr_history", "Hansa Mehta of India (standing above Eleanor Roosevelt) is widely credited with changing the phrase \"All men are born free and equal\" to \"All human beings are born free and equal\" in Article 1 of the Universal Declaration of Human Rights."),
        ev("여성 대표들의 역할", "un_udhr_history", "Women delegates from various countries played a key role in getting women’s rights included in the Declaration."),
        ev("결의 423(V) 인권의 날 (1950년 12월 4일)", "un_res_423V", "4 December 1950."),
        ev("결의 423(V) 본문: 매년 12월 10일을 인권의 날로", "un_res_423V", "adopt 10 December of each year as Human Rights Day,"),
        ev("공통의 기준, 세계적 청사진, 2030 의제 토대", "un_hrday_obs", "As a “common standard of achievement for all peoples and all nations”, the UDHR is a global blueprint for international, national, and local laws and policies and a bedrock of the 2030 Agenda for sustainable development."),
        ev("577개 언어, 최다 번역 문서", "un_hrday_obs", "It is available in 577 languages, from Abkhaz to Zulu, making the UDHR the most translated document in the world."),
        ev("30개 조항", "un_hrday_obs", "The animation uses symbolic movements to bring to life the 30 Articles of the Universal Declaration of Human Rights."),
        ev("일상 속 인권 강조 캠페인", "un_hrday_obs", "Through this campaign, we aim to re-engage people with human rights by showing how they shape our daily lives, often in ways we may not always notice."),
    ],
    "corrections_to_existing": [
        "sourceUrl이 미국 상업 사이트(nationaldaycalendar.com, 'National Human Rights Day')였음 → UN 공식 페이지로 교체 제안.",
        "'인권위원회가 2년에 걸쳐 초안 작성' → UN 원문 'less than two years'에 맞춰 '2년이 채 안 되는 기간'.",
        "기념일 자체의 공식 근거(1950년 12월 4일 결의 423(V)) 누락 → 추가.",
        "'수많은 나라 헌법·법률 제정에 직접 영향' 같은 일반화는 UN 표현('global blueprint for ... laws and policies')으로 대체.",
    ],
    "notes": "Peng Chung Chang = 張彭春(장펑춘). 결의 423(V) PDF는 2단 OCR이라 한 줄 단위 인용만 사용. 선언의 '법적 구속력 없음'은 원문 근거를 저장하지 않아 서술하지 않음.",
}

# 5 ------------------------------------------------------------------
D["anv-fixed-04-26-international-chernobyl-disaster-remembrance-day-global"] = {
    "origin": "매년 4월 26일은 유엔이 정한 국제 체르노빌 참사 추모의 날로, 1986년 4월 26일 체르노빌 원자력발전소에서 일어난 사고를 기억한다. 발전소가 있던 곳은 지금의 우크라이나 땅이지만, 당시에는 소련에 속해 있었다. 유엔 원자방사선영향과학위원회(UNSCEAR)는 이 사고를 원자력 산업 역사상 가장 심각한 사고로 설명한다. 원자로가 파괴되면서 많은 양의 방사성 물질이 바깥으로 퍼졌고, 유엔에 따르면 방사능 구름이 오늘날의 벨라루스·우크라이나·러시아에 해당하는 소련의 넓은 지역을 뒤덮었다. 당국은 1986년 원전 주변에서 약 11만 5,000명을 대피시켰고, 그 뒤 세 나라에서 약 22만 명을 더 이주시켰다. 국제사회의 본격적인 지원은 소련 정부가 1990년에야 국제 원조가 필요하다고 인정하면서 시작됐고, 같은 해 유엔 총회는 국제 협력을 촉구하는 결의를 채택했다. 그리고 사고 30년 뒤인 2016년 12월 8일, 유엔 총회는 결의 71/125를 채택해 참사의 장기적 영향에 대한 인식을 높이기 위해 2017년부터 매년 4월 26일을 국제 추모의 날로 지키기로 했다.",
    "anecdote": "체르노빌을 '이미 끝난 사고'로 보기 어려운 이유는 결의문에 담겨 있다. 유엔 총회는 사고 30년이 지나서도 심각한 장기적 결과가 이어지고, 피해 지역 공동체의 필요도 계속되고 있다고 인정했다. UNSCEAR에 따르면 사고 뒤 몇 주 안에 작업자 30명이 숨졌고, 2005년까지 사고 당시 어린이·청소년이던 사람들 사이에서 갑상선암이 6,000건 넘게 보고됐다. 방사성 요오드가 많이 든 우유를 마신 것이 주요 원인으로 꼽힌다. 복구 과정은 국제 협력의 상징이 되기도 했다. 파괴된 원자로를 덮은 낡은 구조물 위에 새 안전 격납 구조물을 씌우는 작업이 2019년 마무리됐는데, 45개가 넘는 공여국이 유럽부흥개발은행이 관리하는 기금으로 22억 유로를 냈다. 참고로 유엔은 러시아어식 '체르노빌'과 우크라이나어식 '초르노빌' 표기를 모두 옳다고 보고 맥락에 따라 함께 쓴다. 이날은 원자력 안전과, 재난 뒤 오랫동안 이어지는 회복의 문제를 함께 생각하는 날이다.",
    "sourceUrl": "https://www.un.org/en/observances/chernobyl-remembrance-day",
    "evidence": [
        ev("사고 일자 1986년 4월 26일, 원자력 산업 최악의 사고", "unscear_chernobyl", "The accident at the Chernobyl nuclear reactor that occurred on 26 April 1986 was the most serious accident ever to occur in the nuclear power industry."),
        ev("원자로 파괴, 방사성 물질 방출, 작업자 30명 사망", "unscear_chernobyl", "The reactor was destroyed in the accident and considerable amounts of radioactive material were released to the environment. The accident caused the deaths, within a few weeks, of 30 workers and radiation injuries to over a hundred others."),
        ev("약 11만 5,000명 대피, 약 22만 명 이주", "unscear_chernobyl", "In response, the authorities evacuated, in 1986, about 115,000 people from areas surrounding the reactor and subsequently relocated, after 1986, about 220,000 people from Belarus, the Russian Federation and Ukraine."),
        ev("방사능 구름이 소련(현 벨라루스·우크라이나·러시아) 넓은 지역에", "un_chernobyl_obs", "An explosion at the Chernobyl Nuclear Power Plant in 1986 spread a radioactive cloud over large parts of the Soviet Union, now the territories of Belarus, Ukraine and the Russian Federation."),
        ev("1990년 소련 정부의 국제 지원 필요 인정, 결의 45/190", "un_chernobyl_obs", "The Soviet Government acknowledged the need for international assistance only in 1990. That same year the General Assembly adopted resolution 45/190, calling for “international cooperation to address and mitigate the consequences at the Chernobyl nuclear power plant.”"),
        ev("결의 71/125 채택일 2016년 12월 8일", "un_res_71_125", "Resolution adopted by the General Assembly on 8 December 2016"),
        ev("결의 71/125 지정 조항(2017년부터, 장기 영향 인식 제고)", "un_res_71_125", "9. Decides, in order to raise awareness of the long-term consequences of the Chernobyl disaster, to designate 26 April as International Chernobyl Disaster Remembrance Day, to be observed every year beginning in 2017,"),
        ev("30년 뒤에도 지속되는 장기적 결과", "un_res_71_125", "Recognizing, three decades after the Chernobyl disaster, the still-persistent serious long-term consequences thereof, as well as the continuing related needs of the affected communities and territories,"),
        ev("갑상선암 6,000건 이상(2005년까지)", "unscear_chernobyl", "By 2005, more than 6,000 thyroid cancer cases had been diagnosed in this group, and it is most likely that a large fraction of these thyroid cancers is attributable to radioiodine intake."),
        ev("방사성 요오드 우유 섭취", "unscear_chernobyl", "drank milk with high levels of radioactive iodine"),
        ev("새 안전 격납 구조물 2019년, 45개 이상 공여국, 22억 유로, EBRD", "un_chernobyl_obs", "The completion of the placement of the new safe confinement over the old shelter was a major milestone achieved in 2019, with €2.2 billion provided by over 45 donor nations through funds managed by the European Bank for Reconstruction and Development (EBRD)."),
        ev("우크라이나 정부에 인계(현 우크라이나 영토)", "un_chernobyl_obs", "The new safe confinement was handed over to the Government of Ukraine on 10 July 2019."),
        ev("체르노빌·초르노빌 두 표기 모두 정확", "un_chernobyl_obs", "*Both spellings—Chernobyl and Chornobyl—are considered correct and are used in official United Nations documentation and communication materials depending on context, linguistic conventions, and source references."),
    ],
    "corrections_to_existing": [
        "'30주기 특별 기념 회의가 열렸고 이 자리에서 결의안이 채택됐다'는 서술은 확인되지 않음: 결의 71/125는 2016-12-08 제57차 본회의에서 채택(원문 확인). 해당 서술 삭제.",
        "'우크라이나 체르노빌'은 사고 당시 소련(우크라이나 소비에트 공화국) 영토였음을 명시.",
        "'국제원자력사고등급 7단계', '반경 30km 출입제한구역', '한국 시민단체 토론회'는 이번 원문(IAEA/NEA 접근 403)으로 확인하지 못해 삭제.",
        "sourceUrl null → UN 공식 페이지 제안.",
    ],
    "notes": "INES 7·30km 구역은 사실일 가능성이 높으나 IAEA 원문 확보 실패로 제외. 필요시 IAEA 페이지를 별도 확보해 추가 가능.",
}

# 6 ------------------------------------------------------------------
D["anv-fixed-04-29-chemical-warfare-victims-day-global"] = {
    "origin": "국제 화학전쟁 희생자 추모의 날은 화학무기 공격으로 목숨을 잃거나 고통받은 모든 희생자를 기리는 날로, 화학무기금지협약의 당사국들이 정했다. 화학무기는 제1차 세계대전에서 대규모로 쓰였고, 유엔은 그 결과 10만 명이 넘는 사망자와 100만 명에 이르는 사상자가 나왔다고 설명한다. 제2차 세계대전 뒤 여러 나라는 화학무기를 갖고 있어 봐야 얻는 이익은 적고, 퍼져 나갈 때의 위험은 크다는 사실을 깨닫고 전면 금지를 추진했다. 그 결실이 1993년 채택돼 1997년 4월 29일 발효된 화학무기금지협약(CWC)이다. 발효란 조약이 실제로 법적 효력을 갖기 시작하는 것을 말한다. 협약 당사국들은 협약 이행과 검증을 맡을 화학무기금지기구(OPCW)를 세웠다. 이 추모일은 유엔 총회가 아니라 협약 당사국들이 모이는 당사국총회가 정했다. 2005년 제10차 당사국총회는 협약 발효일인 4월 29일을 추모의 날로 정했지만, 2015년 제20차 당사국총회는 결정 C-20/DEC.10을 통해 매년 11월 30일, 또는 적절한 경우 당사국총회 정기회기 첫날에 이날을 지키도록 바꿨다.",
    "anecdote": "이 기념일은 날짜를 둘러싼 혼동이 잦다. 4월 29일은 협약이 발효된 날로, 2015년 결정 이전에는 이날 추모 행사가 열렸다. 지금 유엔과 OPCW는 11월 30일을 기준 날짜로 안내하고, OPCW는 실제로 매년 11월 당사국총회 기간에 행사를 연다. 예를 들어 2025년에는 제30차 당사국총회가 열리던 11월 26일, 총회 의장이 주재하는 가운데 묵념으로 이날을 기렸다. 행사일이 기준 날짜와 꼭 같지 않다는 점을 알아 두면 자료를 읽을 때 헷갈림을 줄일 수 있다. 어느 날에 열리든 취지는 희생자를 기리고, 화학무기의 위협을 없애겠다는 다짐을 다시 확인하는 것이다. OPCW는 193개 회원국을 두고 있으며, 유엔에 따르면 회원국은 세계 인구와 국토의 약 98%를 차지한다. 2013년에는 화학무기를 없애기 위한 폭넓은 노력을 인정받아 노벨평화상을 받았다. 화학무기와 그 사용 위협이 없는 세상, 화학이 평화와 진보, 번영을 위해 쓰이는 세상이 OPCW가 밝힌 목표다.",
    "sourceUrl": "https://www.un.org/en/observances/chemical-warfare-victims-day",
    "evidence": [
        ev("현행 규칙: 제20차 당사국총회, 매년 11월 30일 또는 정기회기 첫날", "un_chemical_obs", "The Conference of the States Parties to the Chemical Weapons Convention, at its 20th Session, decided that a memorial Day of Remembrance for all Victims of Chemical Warfare would be observed on 30 November each year or, when appropriate, on the first day of the regular session of the Conference."),
        ev("결정 C-20/DEC.10 (2015-12-03)", "opcw_s2460_2025", "in accordance with its decision C-20/DEC.10 (dated 3 December 2015)."),
        ev("과거 규칙: 제10차 당사국총회(2005)가 4월 29일로 정함", "opcw_2009_news", "The Conference of the States Parties at its Tenth Session (paragraph 23.3 of C-10/5, dated 11 November 2005) decided that a memorial Day of Remembrance for all Victims of Chemical Warfare would be observed on 29 April each year––the date in 1997 on which the Chemical Weapons Convention entered into force."),
        ev("취지: 희생자 추모와 화학무기 위협 제거 약속", "un_chemical_obs", "This commemoration provides an opportunity to pay tribute to the victims of chemical warfare, as well as to reaffirm the commitment of the Organisation for the Prohibition of Chemical Weapons (OPCW) to the elimination of the threat of chemical weapons"),
        ev("제1차 세계대전 10만 명 이상 사망, 100만 사상", "un_chemical_obs", "Chemical weapons were used on a massive scale during World War I, resulting in more than 100,000 fatalities and a million casualties."),
        ev("2차대전 후 보유 가치 제한·확산 위협 → 전면 금지 필요", "un_chemical_obs", "Following World War II, and with the advent of the nuclear debate, several countries gradually came to the realisation that the marginal value of having chemical weapons in their arsenals was limited, while the threat posed by the availability and proliferation of such weapons made a comprehensive ban desirable."),
        ev("1993년 채택, 1997년 4월 29일 발효", "un_chemical_obs", "Adopted in 1993, the Chemical Weapons Convention entered into force on 29 April 1997."),
        ev("당사국들이 OPCW 설립", "un_chemical_obs", "The States Parties to this Convention established the Organisation for the Prohibition of Chemical Weapons"),
        ev("OPCW는 매년 11월 당사국총회 중 기념", "opcw_remembrance", "The OPCW observes the Day of Remembrance for All Victims of Chemical Warfare annually in November, during the Conference of the States Parties."),
        ev("2025년 11월 26일 제30차 총회 중 묵념, 의장 주재", "opcw_s2460_2025", "observed with a moment of silence during the Thirtieth Session of the Conference on"),
        ev("2025년 행사일", "opcw_s2460_2025", "26 November 2025 in the King Willem-Alexander Theater of the World Forum."),
        ev("의장 주재", "opcw_s2460_2025", "The Chairperson of the Conference will preside over the ceremony."),
        ev("193개 회원국", "opcw_about", "The OPCW, with its 193 Member States, oversees the global endeavour to permanently and verifiably eliminate chemical weapons."),
        ev("세계 인구·국토 98%, 2013 노벨평화상", "un_chemical_obs", "Today, the OPCW Member States represent about 98% of the global population and landmass, as well as 98% of the worldwide chemical industry. In 2013, the Nobel Peace Prize was awarded to the OPCW \"for its extensive efforts to eliminate chemical weapons\"."),
        ev("OPCW의 비전", "un_chemical_obs", "to achieve our vision of a world free of chemical weapons and the threat of their use, and in which chemistry is used for peace, progress, and prosperity."),
    ],
    "corrections_to_existing": [
        "DATE ISSUE (date 필드는 변경하지 않음): 현재 data의 04-29는 2005~2015년 규칙. 2015년 제20차 당사국총회 결정 C-20/DEC.10 이후 공식 기준일은 매년 11월 30일(또는 당사국총회 정기회기 첫날). UN·OPCW 모두 현재 11월 30일/11월로 안내. 날짜를 11-30으로 옮기는 별도 승인 필요(이 경우 id·route 영향 검토). 초안 본문은 날짜 이력과 혼동을 설명하는 형태로 작성해 어느 쪽 날짜에 두어도 사실과 충돌하지 않게 함.",
        "'UN 회원국들이 지정한 추모일' → 오류. 화학무기금지협약 당사국총회(OPCW 기구)가 지정.",
        "'협약 가입국 190개국을 넘어' → OPCW 원문 기준 193개 회원국.",
        "'신고된 화학무기 재고의 대부분이 폐기', '시리아·이라크 의혹 조사'는 이번 원문으로 확인하지 않아 삭제.",
        "anecdote가 origin의 OPCW 이행 감독 문장을 중복했음 → 중복 제거.",
        "sourceUrl null → UN 공식 페이지 제안.",
    ],
    "notes": "2009년 OPCW 뉴스 인용문의 '––'는 원문 문자 그대로. 2015년 이후 4월 29일은 Wikipedia(lead only)에 따르면 'OPCW 창설 기념일'로 분리됐다는 설명이 있으나 OPCW 원문을 확보하지 않아 본문에 쓰지 않음.",
}

# 7 ------------------------------------------------------------------
D["anv-fixed-08-30-international-day-of-the-victims-of-enforced-disappearances-global"] = {
    "origin": "매년 8월 30일은 유엔이 정한 강제실종 희생자를 위한 국제 기념일이다. 강제실종이란 정부 기관이나 정부의 지원·묵인을 받은 집단이 사람을 체포·구금·납치한 뒤 그 사람의 생사나 행방을 밝히지 않거나 붙잡아 간 사실 자체를 인정하지 않아, 결국 그를 법의 보호 바깥에 놓는 것을 말한다. 유엔 총회가 1992년 결의 47/133으로 선포한 '강제실종으로부터 모든 사람을 보호하기 위한 선언'이 이렇게 정의한다. 유엔은 강제실종이 한때 주로 군사독재의 산물이었지만, 이제는 내부 분쟁 같은 복잡한 상황에서 정치적 반대자를 억압하는 수단으로도 쓰인다고 설명한다. 국제사회는 2006년 12월 20일 결의 61/177로 '강제실종으로부터 모든 사람을 보호하기 위한 국제협약'을 채택했고, 이 협약은 2010년 12월 23일 발효됐다. 그리고 2010년 12월 21일 유엔 총회는 결의 65/209로 협약 채택을 환영하면서 8월 30일을 강제실종 희생자를 위한 국제 기념일로 선포하고 2011년부터 지키도록 했다. 총회 결의는 유엔의 모든 회원국이 모인 총회의 공식 결정이다.",
    "anecdote": "8월 30일은 유엔이 새로 고른 날짜가 아니다. 결의 65/209는 최근 몇 년 동안 이미 세계 여러 나라에서 8월 30일이 강제실종 희생자의 날로 지켜져 왔다는 사실을 환영하며 이를 공식화했다. 이날이 특히 가족의 고통에 주목하는 이유도 있다. 유엔은 실종자의 가족과 친구들이 그가 살아 있는지, 어디에 어떤 상태로 붙잡혀 있는지 모른 채 희망과 절망 사이를 오가며 때로는 몇 년씩 소식을 기다린다고 설명한다. 생계를 책임지던 사람이 사라지면 가족은 경제적 어려움까지 겪고, 사망증명서가 없어 연금 등을 받지 못하기도 한다. 이런 부담은 주로 여성이 지며, 진실을 찾는 싸움의 앞줄에 서는 것도 대개 여성이다. 국제형사재판소 로마규정과 이 협약은 민간인을 겨냥한 광범위하거나 체계적인 공격의 일부로 저지른 강제실종을 인도에 반한 죄로 보며, 공소시효도 적용되지 않는다고 본다. 2026년은 협약 채택 20주년으로, 유엔은 '피해자 먼저, 지금 행동을'이라는 구호 아래 진실·정의·배상을 요구할 피해자의 권리를 강조하고 있다.",
    "sourceUrl": "https://www.un.org/en/observances/victims-enforced-disappearance",
    "evidence": [
        ev("강제실종 정의(결의 47/133 선언)", "un_disappear_obs", "\"persons are arrested, detained or abducted against their will or otherwise deprived of their liberty by officials of different branches or levels of Government, or by organized groups or private individuals acting on behalf of, or with the support, direct or indirect, consent or acquiescence of the Government, followed by a refusal to disclose the fate or whereabouts of the persons concerned or a refusal to acknowledge the deprivation of their liberty, which places such persons outside the protection of the law.\""),
        ev("결의 47/133, 1992년 12월 18일", "un_disappear_obs", "According to the Declaration on the Protection of All Persons from Enforced Disappearance, proclaimed by the General Assembly in its resolution 47/133 of 18 December 1992 as a body of principles for all States, an enforced disappearance occurs when:"),
        ev("군사독재의 산물 → 내부 분쟁에서 정치적 억압 수단", "un_disappear_obs", "Once largely the product of military dictatorships, enforced disappearances can nowadays be perpetrated in complex situations of internal conflict, especially as a means of political repression of opponents."),
        ev("협약 채택: 결의 61/177, 2006년 12월 20일", "un_res_65_209", "Reaffirming its resolution 61/177 of 20 December 2006, by which it adopted and opened for signature, ratification and accession the International Convention for the Protection of All Persons from Enforced Disappearance,"),
        ev("협약 발효 2010년 12월 23일", "un_res_65_209", "enabling it to enter into force on 23 December 2010,"),
        ev("결의 65/209 채택일", "un_res_65_209", "Resolution adopted by the General Assembly on 21 December 2010"),
        ev("8월 30일 선포, 2011년부터", "un_res_65_209", "4. Decides to declare 30 August the International Day of the Victims of Enforced Disappearances, to be observed beginning in 2011,"),
        ev("이미 여러 나라에서 8월 30일을 기념", "un_res_65_209", "Welcoming the fact that, in recent years, 30 August has been observed in many countries around the world as the International Day of the Victims of Enforced Disappearances,"),
        ev("가족의 고통(생사·행방 모름, 희망과 절망)", "un_disappear_obs", "They alternate between hope and despair, wondering and waiting, sometimes for years, for news that may never come."),
        ev("가족의 고통: 생사·장소·건강 모름", "un_disappear_obs", "not knowing whether the victim is still alive and, if so, where he or she is being held, under what conditions, and in what state of health."),
        ev("사망증명서 부재로 연금 불가", "un_disappear_obs", "In some cases, national legislation may make it impossible to draw a pension or receive other means of support in the absence of a death certificate."),
        ev("부담은 주로 여성, 투쟁의 최전선", "un_disappear_obs", "The serious economic hardships which usually accompany a disappearance are most often borne by women, and it is women who are most often at the forefront of the struggle to resolve the disappearance of family members."),
        ev("로마규정·협약: 인도에 반한 죄, 공소시효 없음", "un_disappear_obs", "state that, when committed as part of a widespread or systematic attack directed at any civilian population, a \"forced disappearance\" qualifies as a crime against humanity and, thus, is not subject to a statute of limitations."),
        ev("2026년 협약 채택 20주년, 구호", "un_disappear_obs", "2026 marks the 20th anniversary of the adoption of the International Convention for the Protection of All Persons from Enforced Disappearances, the only universal treaty specifically dedicated to preventing and eradicating enforced disappearances. Under the slogan “Victims first. Actions now” , the anniversary puts victims and their rights to truth, justice and reparation at the centre,"),
    ],
    "corrections_to_existing": [
        "'같은 결의(65/209)에서 국제협약도 함께 채택' → 오류. 협약은 2006-12-20 결의 61/177로 채택, 2010-12-23 발효. 65/209는 협약 채택을 '환영'하고 기념일을 선포.",
        "'흰 스카프 = 아르헨티나 5월 광장 어머니회 상징'은 이번 원문으로 확인하지 않아 삭제.",
        "'라틴아메리카 군사독재 시기 실종 사건이 제정 배경' → UN 원문은 지역을 특정하지 않고 'military dictatorships'로만 서술. 지역 특정 삭제.",
        "협약의 인도에 반한 죄 조항: '조직적으로 자행할 경우' → 원문 'widespread or systematic attack directed at any civilian population'에 맞춰 정밀화.",
        "sourceUrl null → UN 공식 페이지 제안.",
    ],
    "notes": "name 필드는 '세계 강제실종 희생자의 날'이나 UN 공식 영문은 'International Day of the Victims of Enforced Disappearances'. name은 변경하지 않음(필요시 '국제 강제실종 희생자의 날'로 별도 검토). 2026 구호 문장은 해당 연도 한정 정보이므로 2027년 이후 갱신 필요.",
}

# 8 ------------------------------------------------------------------
D["gov-20"] = {
    "origin": "어린이날은 매년 5월 5일, 어린이를 한 사람의 인격체로 존중하고 건강하게 자라도록 마음을 모으는 날로, 일제강점기 소년운동에서 출발했다. 아동문학가 방정환은 1921년 천도교소년회를 조직해 본격적인 소년운동을 시작했고, 1922년 5월 1일 처음으로 '어린이의 날'을 정해 행사를 열었다. 이듬해인 1923년에는 방정환을 중심으로 일본 유학생들이 만든 아동문화 단체 색동회가 주축이 되어 5월 1일을 '어린이날'로 정하고 첫 기념행사를 열었다. 한국민족문화대백과사전은 이 움직임이 3·1운동을 계기로 어린이들에게 민족정신을 북돋우려는 뜻에서 시작됐다고 설명한다. 같은 해 방정환은 어린이를 위한 순수 아동잡지 『어린이』도 창간했다. 당시 어린이들은 엄격한 유교 도덕에 얽매여 있었는데, 방정환은 아이들이 어린이다운 감성을 누리도록 하는 데 힘쓴 인물로 평가된다. 어린이날은 1927년 5월 첫 일요일로 바뀌었다가 광복 이후 5월 5일로 자리 잡았다. 1973년 기념일로 지정됐고 1975년 공휴일이 됐으며, 현재는 아동복지법 제6조가 매년 5월 5일을 어린이날로, 5월 1일부터 7일까지를 어린이주간으로 정하고 있다.",
    "anecdote": "1923년 첫 어린이날 기념행사에서 배포된 '어른들에게 드리는 글'에는 '어린이에게 경어를 쓰시되 늘 부드럽게 하여 주시오'라는 당부가 담겼다. 어린이를 독립된 인격체로 존중해 달라는 부탁이었다. 방정환은 아이를 '어린이'라는 말로 불러 '늙은이', '젊은이'와 대등한 자리에 올려놓은 인물로도 평가받는다. 날짜가 5월 5일로 옮겨진 이유에 대해 한국민족문화대백과사전은 광복 뒤 다시 모인 색동회가 5월 1일 메이데이와 겹치는 것을 피하려 했다고 적고 있다. 흔히 유엔의 세계 어린이의 날과 헷갈리기도 한다. 유엔 총회는 1954년 각국에 어린이의 날을 정하도록 권고했고, 오늘날 기준일인 11월 20일은 1959년 아동권리선언과 1989년 아동권리협약이 채택된 날이다. 한국의 어린이날은 그보다 앞서 민간의 소년운동에서 출발했다는 점이 다르다. 지금은 어린이날이 토요일·일요일이나 다른 공휴일과 겹치면 그다음 첫 번째 비공휴일을 대체공휴일로 쉰다.",
    "sourceUrl": "https://encykorea.aks.ac.kr/Article/E0035938",
    "evidence": [
        ev("1921 천도교소년회 조직, 1922년 5월 1일 '어린이의 날'", "encykorea_bang", "1921년 천도교소년회를 조직하여 본격적으로 소년운동을 전개했다. 1922년 5월 1일 처음으로 ‘어린이의 날’을 제정하고, 1923년에는 최초의 아동잡지 『어린이』를 창간했다."),
        ev("1923년 색동회 주축 5월 1일 어린이날, 3·1운동 계기 민족정신 고취, 1927년 5월 첫 일요일로 변경", "encykorea_childday", "1919년의 3·1독립운동을 계기로 어린이들에게 민족정신을 고취하고자, 1923년 방정환(方定煥)을 포함한 일본유학생 모임인 ‘색동회’가 주축이 되어 5월 1일을 ‘어린이날’로 정하였다가 1927년 날짜를 5월 첫 일요일로 변경하였다."),
        ev("광복 이후 5월 5일, 1973 기념일, 1975 공휴일", "encykorea_childday", "1945년 광복 이후에는 5월 5일로 정하여 행사를 하여 왔으며, 1961년에 제정 · 공포된 「아동복지법」에서는 ‘어린이날’을 또한 5월 5일로 하였고, 1973년에 기념일로 지정하였다가 1975년에 공휴일로 제정하였다."),
        ev("'어른들에게 드리는 글' 경어 당부, 독립 인격체 존중", "encykorea_childday", "1923년 5월 1일 첫 번째 어린이날 기념행사에서 ‘어른들에게 드리는 글’이 배포되었는데 “어린이에게 경어를 쓰시되 늘 부드럽게 하여 주시오”라고 당부했다. 방정환은 독립된 인격체로서의 어린이에 대한 존중을 부탁한 것이다."),
        ev("유교 도덕에서 어린이 감성 해방", "encykorea_bang", "유교도덕에 얽매여 있던 어린이들을 어린이다운 감성으로 해방시키고자 노력한 인물이다."),
        ev("'어린이'를 늙은이·젊은이와 대등하게 격상", "encykorea_bang", "아동을 ‘어린이’라는 용어로 ‘늙은이’ · ‘젊은이’와 대등하게 격상시킨 일"),
        ev("1923년 3월 순수 아동잡지 『어린이』 창간", "encykorea_bang", "1923년 3월 우리나라 최초의 순수 아동잡지 『어린이』를 창간하였다."),
        ev("광복 후 메이데이와 중복 회피해 5월 5일", "encykorea_saekdong", "어린이날도 ‘메이데이’와의 중복을 피해 5월 5일로 변경하여 여러 가지 행사를 벌이면서"),
        ev("색동회 1923년 설립(방정환 중심)", "encykorea_saekdong", "방정환(方定煥)이 중심이 되어 1923년 3월 16일 발족하여 5월 1일 일본 동경에서 창립되었다."),
        ev("아동복지법 제6조(현행)", "law_child_welfare", "제6조(어린이날 및 어린이주간) 어린이에 대한 사랑과 보호의 정신을 높임으로써 이들을 옳고 아름답고 슬기로우며 씩씩하게 자라나도록 하기 위하여 매년 5월 5일을 어린이날로 하며, 5월 1일부터 5월 7일까지를 어린이주간으로 한다."),
        ev("공휴일 규정(현행)", "law_holidays", "7. 어린이날(5월 5일)"),
        ev("대체공휴일(토·일·다른 공휴일과 겹치면 다음 첫 비공휴일)", "law_holidays", "1. 제2조제2호, 제5호부터 제7호까지 또는 제10호의 공휴일이 토요일이나 일요일과 겹치는 경우"),
        ev("대체공휴일 본문", "law_holidays", "그 공휴일 다음의 첫 번째 비공휴일(제2조 각 호의 공휴일이 아닌 날을 말한다. 이하 같다)을 대체공휴일로 한다."),
        ev("UN 1954 결의 836(IX) 권고", "un_childrensday_bg", "By resolution 836(IX) of 14 December 1954, the General Assembly recommended that all countries institute a Universal Children's Day,"),
        ev("11월 20일 = 1959 선언, 1989 협약 채택일", "un_childrensday_bg", "The date 20 November marks the day on which the Assembly adopted the Declaration of the Rights of the Child, in 1959, and the Convention on the Rights of the Child, in 1989."),
    ],
    "corrections_to_existing": [
        "'1922년 방정환과 천도교소년회가 처음 만들었다'만 서술 → 1922년 천도교소년회 '어린이의 날'과 1923년 색동회 주축 '어린이날'을 모두 설명(백과사전 두 항목 기준).",
        "'1946년부터 5월 5일' → 원문은 '1945년 광복 이후'로만 서술, 연도 1946은 확인 못 해 '광복 이후'로 완화. 1927년 '5월 첫 일요일' 변경 사실 누락 → 추가.",
        "'노동절과 겹치는 문제 등으로' → 색동회 항목 원문('메이데이와의 중복을 피해')로 근거 확보, 유지.",
        "'아동 인권 운동으로 세계적으로 상당히 이른 시도로 평가' → 출처 없는 평가라 삭제. UN 비교는 1954년 결의·11월 20일 기준일 사실로 대체.",
        "'놀이공원 인파' 등 비사실 수사 삭제. sourceUrl ko.wikipedia → 한국민족문화대백과사전 제안.",
    ],
    "notes": "백과사전은 1961년 법률을 「아동복지법」으로 적었으나 당시 명칭은 「아동복리법」으로 알려져 있어 본문에서 1961년 법률 언급은 생략. 대체공휴일 시작 연도는 백과사전(2018)과 일반 인식(2014)이 달라 연도 없이 현행 규정만 서술. 대체공휴일 조항의 '제5호부터 제7호'에 제7호 어린이날 포함(현행 제2조 번호 기준, 2026 개정으로 노동절이 제6호에 추가됨).",
}

# 9 ------------------------------------------------------------------
D["gov-103"] = {
    "origin": "여권통문의 날은 매년 9월 1일로, 1898년 9월 1일 서울 북촌의 여성들이 발표한 '여권통문(女權通文)'을 기념하는 법정기념일이다. 통문은 여러 사람에게 돌려 알리는 글을 말하며, 원래 이름은 여학교를 세우자는 뜻의 '여학교 설시 통문(女學校設始通文)'이다. 배경에는 개항 이후의 변화가 있었다. 1876년 개항 뒤 조선 사회에 개화론이 등장하면서 나라가 개화하려면 여성도 개화해야 한다는 주장이 나왔고, 독립협회와 『독립신문』은 남녀평등을 이루는 구체적인 방법으로 여성교육을 강조했다. 이런 흐름 속에서 북촌의 양반 여성들이 찬동자 300명 정도를 모아 이소사·김소사의 이름으로 통문을 발표했다. 통문은 여성도 정치에 참여하고, 남성과 평등하게 직업을 갖고, 교육을 받을 권리가 있다고 주장했으며, 『황성신문』과 『독립신문』이 이를 보도했다. 2019년 10월 31일 국회는 매년 9월 1일을 여권통문의 날로 정하는 양성평등기본법 개정안을 통과시켰고, 현재 같은 법 제38조는 이날을 우리나라 최초의 여성인권선언문이 발표된 날로 규정하고 있다.",
    "anecdote": "발표자로 남은 '이소사', '김소사'의 소사(召史)는 이름이 아니다. 조선시대에는 기혼 여성을 이름 대신 신분에 따른 호칭으로 불렀는데, 양반층은 성 뒤에 '씨', 평민층은 '소사'를 붙였다. 통문은 선언에서 끝나지 않았다. 참여한 여성들은 같은 해 9월 12일 한국 최초의 여성운동단체로 꼽히는 찬양회를 조직했고, 나라에 관립 여학교를 세워 달라고 상소했다. 고종이 설립을 약속했지만 보수 유생층의 반대와 재정 부족으로 이뤄지지 않자, 이들은 스스로 순성학교를 세웠다. 한국 여성이 직접 세운 최초의 여학교로 평가되며, 개교 시점은 자료에 따라 1898년 12월, 1899년 2월 등으로 조금씩 다르게 기록돼 있다. 학교는 늘 운영비 부족에 시달리다 1900년대 초 자취를 감췄다. 여성가족부는 법 개정 당시 여권통문이 세계 여성의 날의 계기가 된 1908년 미국 여성 노동자 시위보다 10년 앞선 일이지만 그동안 잘 알려지지 않았다고 설명했다.",
    "sourceUrl": "https://encykorea.aks.ac.kr/Article/E0079698",
    "evidence": [
        ev("1898년 9월 1일 북촌 양반여성, 이소사·김소사, 여학교 설시 통문, 보도", "encykorea_yeogwon", "1898년 9월 1일 서울 북촌의 양반여성들이 이소사(李召史), 김소사(金召史)의 이름으로 ‘여학교 설시 통문(女學校設始通文)[여권통문(女權通文)]'을 발표하였다. 이 통문에는 여성의 평등한 교육권, 정치참여권, 경제 활동 참여권이 명시되었으며, 『황성신문』, 『독립신문』이 보도하였다."),
        ev("개항 후 개화론, 독립협회·독립신문의 여성교육 강조", "encykorea_yeogwon", "1876년 개항 이후 조선사회에 개화론(開化論)이 등장하였다. 나라가 개화하기 위해서는 여성도 개화해야 한다는 주장이 등장하였고, 이는 전통적인 여성관에 변화를 가져왔다."),
        ev("독립협회·독립신문 여성교육 강조", "encykorea_yeogwon", "당시 독립협회와 『독립신문』에서는 여성의 권리 찾기, 남녀평등 실현을 위한 구체적 방법으로 여성교육을 강조하였다."),
        ev("찬동자 300명", "encykorea_yeogwon", "이러한 변화를 기반으로 1898년 9월 1일 서울 북촌 양반여성들이 찬동자 300명 정도를 모아서 ‘여학교 설시 통문’을 발표하였다."),
        ev("세 가지 권리 주장", "encykorea_yeogwon", "첫째, 문명 개화정치를 수행함에 여성들도 참여할 권리가 있으며, 둘째, 여성들도 남성과 평등하게 직업을 가질 권리가 있고, 셋째, 여성도 교육을 받을 권리가 있음을 주장하였다."),
        ev("2019년 10월 31일 국회 통과", "yna_yeogwon_2019", "여성가족부는 매년 9월 1일을 여권통문(女權通文)의 날로 정하는 내용의 '양성평등기본법 일부개정법률안'이 31일 국회 본회의를 통과했다고 밝혔다."),
        ev("기사 송고일 2019-10-31", "yna_yeogwon_2019", "송고 2019년10월31일 18시52분"),
        ev("현행 양성평등기본법 제38조 ②", "law_gender_equality", "② 우리나라 최초의 여성인권선언문이 발표된 날을 기념하기 위하여 매년 9월 1일을 여권통문(女權通文)의 날로 한다."),
        ev("소사 = 평민층 기혼 여성 호칭, 양반은 씨", "donga_sosa_2014", "양반가를 중심으로 한 상류층 기혼 여성은 성 뒤에 ‘씨(氏)’라는 호칭을, 평민층은 ‘소사(召史)’, 향리와 중인을 위시한 중간층은 ‘성(姓)’이라는 호칭을 붙였다."),
        ev("찬양회 9월 12일 조직, 최초의 여성운동단체", "encykorea_chanyang", "통문 반포에 참여한 부인들이 모여, 같은 해 9월 12일 우리나라 최초의 여성운동단체인 찬양회를 조직하고 여학교설립운동과 함께 성인부인을 계발시키는 사업을 추진하였다."),
        ev("관립여학교 상소, 고종 약속·유생 반대·재정 부족", "encykorea_chanyang", "고종이 관립여학교 설립을 약속하였으나, 보수 유생층의 반대와 재정부족을 이유로 실현되지 못하였다."),
        ev("관립여학교 설립 상소", "encykorea_chanyang", "여학교설립추진운동으로는 관립여학교 설립의 상소를 하고"),
        ev("순성학교 1899년 2월 개교, 한국여성 최초 여학교, 1903년 소멸", "encykorea_yeogwon", "찬양회에서는 관립여학교 설립을 추진하였으나 이루지 못하고, 1899년 2월에 30명 정원의 순성학교(順成學校)를 개교하였다. 이는 한국여성에 의해 설립된 최초의 여학교로 초등학교에 해당하였다."),
        ev("순성학교 1898년 12월 설립(다른 항목)", "encykorea_sunseong", "1898년 12월 약 50여 명의 학생을 모집하여 승동에 순성학교를 설립하였다."),
        ev("순성학교 운영비 부족", "encykorea_sunseong", "찬양회 회원들의 회비를 모아 건립한 순성여학교는 늘상 운영비 부족으로 허덕여야 했다."),
        ev("1903년 소멸(여권통문 항목)", "encykorea_yeogwon", "그러나 1903년 김양현당이 죽자 재정 등 여러 가지 제약으로 소멸하였다."),
        ev("여가부 장관: 1908년 시위보다 10년 앞서, 잘 알려지지 않음", "yna_yeogwon_2019", "여권통문의 날은 세계여성의 날이 촉발된 미국 여성 노동자들의 시위(1908년)보다도 10년이나 앞선 역사적인 날로 한국 여성사에서 매우 중요한 날이지만 그동안 잘 알려지지 않았다"),
    ],
    "corrections_to_existing": [
        "'이듬해(1899) 순성여학교 개교' → 같은 백과사전 안에서도 1898년 12월(순성학교 항목)·1899년 2월(여권통문 항목)·1899년 4월(찬양회 항목)로 기록이 엇갈림. 단정 대신 '자료에 따라 다르다'로 서술.",
        "'소사는 기혼 여성을 부르던 호칭' → 보다 정확히는 조선시대 평민층 기혼 여성 호칭(양반층은 '씨'). 발표자가 북촌 양반 여성이었다는 점과의 관계는 근거 없어 해석하지 않음.",
        "'두 사람의 실제 이름은 지금까지 확인되지 않는다'는 원문 확인 못 해 삭제.",
        "'300여 명이 이름을 올렸다' → 원문 '찬동자 300명 정도'에 맞춤.",
        "법정기념일 지정: 2019-10-31 국회 통과(연합뉴스), 현행 근거는 양성평등기본법 제38조 제2항(현행 조문 번호; 기존 sourceUrl은 법령 전체 링크).",
    ],
    "notes": "국가법령 연혁상 2019-11-26 법률 제16623호(공포 즉시 시행)가 해당 개정으로 보이나 연혁본 원문(DRF eflaw) 조회 실패로 공포일은 본문에 쓰지 않음. sourceUrl은 법령 링크 대신 사건 설명이 있는 백과사전 항목 제안(법령 링크 유지도 무방).",
}

with open(os.path.join(HERE, "drafts.json"), "w", encoding="utf-8") as f:
    json.dump(D, f, ensure_ascii=False, indent=2)
print("wrote", len(D))
