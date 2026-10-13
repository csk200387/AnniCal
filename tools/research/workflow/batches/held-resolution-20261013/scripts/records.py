"""held-resolution 5건의 최종 레코드와 근거 원장을 만든다(쓰기 전용, 데이터셋은 건드리지 않음).

    python3 -I scripts/records.py   → records-final.json, claims-ledger.json
모든 인용은 저장 원문(.txt)과 연속 문자열로 일치해야 하며, 하나라도 어긋나면 아무것도 쓰지 않는다.
"""
import json
import sys
from pathlib import Path

BATCH = Path(__file__).resolve().parents[1]
ROOT = BATCH.parents[4]
B = 'tools/research/workflow/batches'
NL = f'{B}/native-languages-20261012/evidence/pl-topienie-marzanny'
AE = f'{B}/asia-expansion-20261012/evidence'
PE = f'{B}/priority-editorial-20261012/evidence'
HR = f'{B}/held-resolution-20261013/evidence'
ESKA = 'https://www.eska.pl/wiadomosci/topienie-marzanny-kiedy-sie-odbywa-skad-wzial-sie-zwyczaj-i-co-oznacza-poznajcie-odpowiedzi-aa-8dQb-upUW-GRZW.html'

RECORDS = {
  'native:pl-topienie-marzanny': {
    'id': 'anv-fixed-03-21-marzanna-pl', 'date': '03-21', 'dateType': 'annual-fixed',
    'name': '마르자나 보내기(폴란드)', 'category': 'culture', 'tags': ['문화 & 예술'],
    'storytelling': {
      'origin': "폴란드의 봄맞이 풍습 ‘마르자나 보내기(Topienie Marzanny)’는 3월 21일이 대표 날짜지만, 실제 행사는 그 무렵 다른 날에도 열린다. "
                "겨울을 상징하는 짚 인형 ‘마르자나’를 강이나 연못에 던져 겨울을 떠나보내는 풍습으로, 달력상 봄의 첫날인 3월 21일에 가장 흔히 할 뿐 정해진 규칙은 아니다. "
                "마르자나는 옛 슬라브 신앙에서 겨울과 죽음의 여신으로 전해지며, 인형은 그 여신의 형상이다.",
      'anecdote': "오늘날에는 주로 학생들이 알록달록 꾸민 인형을 만들어 교사의 인솔로 강이나 연못에 가서 물에 던지며, 옛 의식이라기보다 놀이로 여겨진다. "
                  "옛날에는 짚으로 만든 인형을 천으로 감싸고 리본으로 꾸며 노래와 함께 마을 밖으로 내갔고, 여신의 형상을 없애면 겨울의 힘도 사라진다고 믿었다. "
                  "날짜도 원래는 지금과 달랐다. 폴란드 정부 해외교육센터(ORPEG)가 공개한 학교 행사 자료는 옛 농촌에서 사순절 넷째 주일, 곧 ‘죽음의 주일’로 불린 날에 인형을 마을 밖으로 내가 태우거나 물에 던졌다고 설명한다. "
                  "지역 차이도 크다. 체신 실레지아의 한 민속 사전에 따르면 이 지역에서는 베스키디 산지 마을 밖으로는 마르자나를 들고 다니는 풍습이 알려지지 않았고, 3월 21일에 인형을 물에 던지는 일은 20세기 후반 텔레비전이 퍼뜨리고 학교가 받아들인 ‘2차적’ 풍습이라고 한다."
    },
    'memes': [{'type': 'text', 'url': None, 'caption': '겨울아, 이제 그만 떠내려가렴'}],
    'sourceUrl': ESKA,
  },
  'asia:cn-farmers-harvest': {
    'id': 'anv-term-chubun-cn-farmers-harvest-festival', 'date': 'chubun-cn', 'dateType': 'annual-tabulated',
    'name': '중국 농민 풍수절', 'category': 'career', 'tags': ['직업 & 감사'],
    'storytelling': {
      'origin': "추분은 중국이 2018년부터 지키는 ‘중국 농민 풍수절(中国农民丰收节)’이다. 중국 공산당 중앙의 비준과 국무원의 비복을 거쳐 매년 추분을 농민의 명절로 정했고, 당시 농업농촌부 장관은 국가 차원에서 처음으로 농민만을 위해 만든 명절이라고 밝혔다. 2026년에는 9월 23일에 제9회 풍수절 행사가 각지에서 열렸다.",
      'anecdote': "한창푸 당시 농업농촌부 장관은 추분을 고른 이유로, 봄에 심고 가을에 거두는데 추분 무렵 열매가 가장 풍성해 수확을 잘 보여 주고 넓은 나라의 남북을 두루 아우를 수 있다는 점을 들었다. "
                  "2021년 제4회 때는 각지에서 공연과 농민 운동회, 서화전이 열렸고, 2026년 헤이룽장성 주행사장에서는 옥수수 껍질 벗기기 시합이 열렸다. "
                  "추분은 태양의 위치로 정해져 날짜가 해마다 조금씩 움직이고, 중국 표준시(UTC+8)로 따지면 한국과 날짜가 갈리는 해도 있다. 중국 표준시와 같은 시간대를 쓰는 홍콩천문대 연표로 2041년 추분은 9월 22일로, 한국 절기표의 9월 23일보다 하루 이르다."
    },
    'memes': [{'type': 'text', 'url': None, 'caption': '가을의 한가운데, 수확한 사람이 주인공인 날'}],
    'sourceUrl': 'https://www.gov.cn/zhengce/2018-06/22/content_5300368.htm',
  },
  'asia:hk-fire-dragon': {
    'id': 'anv-rel-chuseok-minus1-tai-hang-fire-dragon-hk', 'date': 'lunar-08-14-hk', 'dateType': 'annual-tabulated',
    'name': '다이항 불용춤(홍콩)', 'category': 'culture', 'tags': ['문화 & 예술'],
    'storytelling': {
      'origin': "음력 8월 14일, 중추절 전날 밤은 홍콩 코즈웨이베이 다이항(大坑)에서 향을 촘촘히 꽂은 거대한 용을 메고 마을을 도는 ‘다이항 불용춤(大坑舞火龍)’이 시작되는 날이다. "
                "중국 국가급 무형문화유산 소개에 따르면 이 행사는 중추절 앞뒤 사흘 밤, 곧 음력 8월 14일부터 16일까지 열린다. 14일 밤 관음을 모신 연화궁에서 새로 만든 용에 개광 의식을 한 뒤 사흘 밤 연이어 마을 거리를 돈다. 2026년 일정은 9월 24일부터 26일까지로 안내됐다.",
      'anecdote': "전설에 따르면 청나라 광서 6년(1880년) 객가 마을이던 다이항에 역병이 돌자 주민들이 불용을 엮어 마을을 돌고 폭죽을 터뜨려 역병을 쫓았고, 이것이 풍습으로 굳었다. "
                  "무형유산 소개는 마지막 16일 밤 용이 반대 방향으로 마을을 한 바퀴 돈 뒤 바다에 던져지며 이를 ‘용이 하늘로 돌아간다(龍歸天)’고 부른다고 적었는데, 근년에는 바다 오염을 피하려고 소각로로 보낸다는 보도도 있다. "
                  "다이항 주민복리회가 전승을 맡고 있으며 2011년 국가급 무형문화유산 제3차 목록에 올랐다. 2026년 행사 안내는 길이 67m 용에 장수 향 1만 2천 개를 꽂고 300여 명이 함께 춤춘다고 소개했다. "
                  "날짜는 홍콩 음력을 따르므로 한국 추석과 하루 어긋나는 해도 있다. 홍콩천문대 연표로 2040년 음력 8월 14일은 9월 19일인데, 한국 추석의 전날은 9월 20일이다."
    },
    'memes': [{'type': 'text', 'url': None, 'caption': '달이 차오르는 사흘, 향불 용이 골목을 지나간다'}],
    'sourceUrl': 'https://www.ihchina.cn/project_details/14936/',
  },
  'asia:jp-yama-no-hi': {
    'id': 'anv-fixed-08-11-mountain-day-jp', 'date': 'yama-no-hi-jp', 'dateType': 'annual-tabulated',
    'name': '산의 날(일본)', 'category': 'holiday', 'tags': ['공휴일'],
    'storytelling': {
      'origin': "8월 11일은 ‘산에 친숙해질 기회를 얻고 산의 은혜에 감사한다’는 취지의 일본 국민 축일 ‘산의 날(山の日)’이다. 2014년 국민 축일법 개정으로 정해져 2016년부터 시행됐다. "
                "일본 내각부에 따르면 2020년과 2021년에만 도쿄 올림픽·패럴림픽 일정에 맞춰 날짜가 옮겨져, 2020년은 8월 10일, 2021년은 8월 8일이 산의 날이었다. 2021년 8월 9일은 산의 날이 일요일과 겹쳐 생긴 대체휴일이다.",
      'anecdote': "산의 날은 산악계의 운동으로 생긴 축일이다. 2010년 4월 일본산악협회·일본산악회 등 산악 5개 단체가 중심이 돼 관계 부처와 지자체, 환경단체, 관광업계, 산장 관계자들에게 제정을 요청했고, 2013년 초당파 의원연맹과 전국 ‘산의 날’ 제정 협의회가 잇따라 생겼다. "
                  "산악 단체들은 원래 6월 첫째 일요일을 후보로 삼았지만, 기업과 학교에 영향이 적고 공휴일이 없는 달이라는 점 등에서 오봉 휴가 전인 11일로 정해졌다. "
                  "첫 산의 날인 2016년 나가노현 마쓰모토시에서 제1회 기념 전국대회가 열린 뒤 지역을 옮겨 가며 대회가 이어졌고, 축일이 시작된 지 10년이 지난 2026년 8월 11일에는 기후현 다카야마시에서 제10회 대회 식전이 열렸다."
    },
    'memes': [{'type': 'text', 'url': None, 'caption': '한여름 휴일, 산에게 고맙다고 말하는 날'}],
    'sourceUrl': 'https://www8.cao.go.jp/chosei/shukujitsu/gaiyou.html',
  },
  'asia:jp-setsubun': {
    'id': 'anv-rel-ipchun-minus1-setsubun-jp', 'date': '02-03', 'dateType': 'annual-fixed',
    'name': '세쓰분(일본)', 'category': 'culture', 'tags': ['문화 & 예술'],
    'storytelling': {
      'origin': "세쓰분(節分)의 정확한 날짜는 ‘입춘 전날’이고, 2월 3일은 그중 가장 흔한 날짜를 쓴 대표 날짜다. 입춘이 태양의 위치로 정해져 실제 세쓰분은 해마다 2월 초에서 조금씩 움직이며, 일본 국립천문대 역요항으로 2021년과 2025년에는 2월 2일이었다. "
                "일본에서는 이날 겨울이 봄으로 바뀌는 고비에 액을 쫓고 복을 부른다. 세쓰분은 원래 입춘·입하·입추·입동 각각의 전날을 뜻했지만, 예로부터 한 해의 시작으로 중시한 입춘의 전날만 널리 자리 잡았다.",
      'anecdote': "일본의 이십사절기는 국립천문대가 계산해 전년에 관보로 공표한다. 2025년 역요항은 입춘을 2월 3일 오후 11시 10분으로 계산했고, 입춘이 자정 직전이라 세쓰분이 하루 이른 2월 2일이 됐다. "
                  "2026년과 2027년 역요항의 세쓰분은 2월 3일이다. 니폰닷컴에 따르면 2021년부터 2057년까지는 4년마다 2월 2일이 세쓰분이 된다. "
                  "세쓰분 무렵이면 슈퍼와 편의점에 콩과 에호마키가 가득 쌓이고, 콩을 뿌리며 ‘복은 안으로(福は内)’를 외친다."
    },
    'memes': [{'type': 'text', 'url': None, 'caption': '2월 3일이라고 외웠다가 하루 당겨지는 해도 있다'}],
    'sourceUrl': 'https://www.nippon.com/ja/japan-topics/today02020/',
  },
}

# (uid, 주장, 원문 경로, 원문 연속 인용)
CLAIMS = [
  ('native:pl-topienie-marzanny', '3/21 가장 흔하나 규칙 아님', f'{NL}/eska.txt', 'Dziś najczęściej dzieci odprowadzające kukłę marzanny można spotkać w pierwszy dzień wiosny - 21. marca, ale nie jest to regułą.'),
  ('native:pl-topienie-marzanny', '현재: 학생·교사 인솔·강/연못·놀이', f'{NL}/eska.txt', 'Najczęściej biorą w nim udział dzieci szkolne, które przygotowują barwnie przystrojoną kukłę, by później, pod opieką nauczycieli, udać się nad rzekę lub staw, gdzie lalka jest wrzucana do wody. Obecnie jest to traktowane bardziej jako zabawa'),
  ('native:pl-topienie-marzanny', '겨울과 죽음의 여신', f'{NL}/eska.txt', 'starosłowiańskiej bogini zimy i śmierci'),
  ('native:pl-topienie-marzanny', '과거: 짚·천·리본, 노래와 함께 마을 밖으로', f'{NL}/eska.txt', 'Kukłę wykonywano ze słomy, owijano płótnem i dekorowano kolorowymi wstążkami. Rytuał mógł różnić się w zależności od regionu, ale zasadnicze elementy były takie same - marzannę wyprowadzano ze wsi przy wtórze pieśni.'),
  ('native:pl-topienie-marzanny', '형상 파괴=겨울의 힘 제거 믿음', f'{NL}/eska.txt', 'Zniszczenie podobizny bogini było jednoznaczne z odebraniem jej mocy i usunięciem wywołanych przez nią efektów, czyli zimy.'),
  ('native:pl-topienie-marzanny', '사순절 넷째 주일', f'{HR}/pl-topienie-marzanny/orpeg-topienie-marzanny.txt', 'W czwartą niedzielę postu wiosna'),
  ('native:pl-topienie-marzanny', '죽음의 주일·인형을 내가 태우거나 물에', f'{HR}/pl-topienie-marzanny/orpeg-topienie-marzanny.txt', 'zimy, nazywano w Polsce śmiertelną, czarną lub białą. Wynoszono\nwtedy ze wsi kukłę, która uosabiała ową zimę. Palono ją lub topiono,'),
  ('native:pl-topienie-marzanny', '체신: 베스키디 밖 미지, 3/21 2차적 풍습', f'{NL}/ox-pl-witaj-wiosno.txt', 'Poza Beskidami zwyczaj\nchodzenia z marzanną, kukłą symbolizującą zimę, martwotę, na ziemi cieszyńskiej nie był znany, a jej topienie\n21 marca, w dzień początku wiosny, jest zwyczajem wtórnym, nie autentycznym, upowszechnianym od 2 poł.\nXX wieku przez telewizję i podchwyconym przez szkoły'),
  ('native:pl-topienie-marzanny', '다른 날 실례: 2025-03-23 루블린 야외박물관 보도', f'{HR}/pl-topienie-marzanny/radio-lublin-2025.txt', '23 marca 2025 / 13:58'),
  ('native:pl-topienie-marzanny', '다른 날 실례: 루블린 재현 행사', f'{HR}/pl-topienie-marzanny/radio-lublin-2025.txt', 'W lubelskim skansenie przypomniano dawne tradycje związane z przyjściem wiosny i topieniem Marzanny.'),
  ('asia:cn-farmers-harvest', '2018 제정·당중앙 비준·국무원 비복·국가 차원 첫 농민 명절', f'{AE}/cn-farmers-harvest/gov-cn-5300368.txt', '经党中央批准、国务院批复，自2018年起，将每年农历秋分设立为‘中国农民丰收节’，这是第一个在国家层面专门为农民设立的节日。'),
  ('asia:cn-farmers-harvest', '추분 선택 이유·남북 아우름', f'{AE}/cn-farmers-harvest/gov-cn-5300368.txt', '春种秋收，春华秋实，秋分时节硕果累累，最能体现丰收。'),
  ('asia:cn-farmers-harvest', '남북 겸고', f'{AE}/cn-farmers-harvest/gov-cn-5300368.txt', '兼顾南北方'),
  ('asia:cn-farmers-harvest', '2021 제4회 활동', f'{AE}/cn-farmers-harvest/chinadaily-2021.txt', '全国各地组织艺术表演、农民运动会以及书画展等一系列活动庆祝第四个“中国农民丰收节”。'),
  ('asia:cn-farmers-harvest', '2026-09-23 제9회', f'{PE}/cn-farmers-harvest/newscn-20260923.txt', '9月23日是第九个中国农民丰收节'),
  ('asia:cn-farmers-harvest', '2026 헤이룽장 옥수수 껍질 벗기기', f'{PE}/cn-farmers-harvest/newscn-20260923.txt', '人们在2026年中国农民丰收节黑龙江省主场活动现场参加扒苞米比赛。'),
  ('asia:cn-farmers-harvest', 'HKO 2041 추분 9/22', f'{PE}/_shared-hko-calendar/hko-T2041e.txt', '2041/9/22 27 Sunday Autumnal Equinox'),
  ('asia:hk-fire-dragon', '광서6년 1880 역병 전설', f'{PE}/hk-fire-dragon/ihchina-14936.txt', '相传在光绪六年（1880），大坑发生瘟疫，村民扎做一条火龙巡游社区，燃放爆竹，驱除瘟疫，由此形成舞火龙习俗。'),
  ('asia:hk-fire-dragon', '중추절 앞뒤 사흘 밤', f'{PE}/hk-fire-dragon/ihchina-14936.txt', '活动在中秋节前后三个晚上举行。'),
  ('asia:hk-fire-dragon', '8/14 연화궁 개광, 사흘 순행', f'{PE}/hk-fire-dragon/ihchina-14936.txt', '农历八月十四晚上在供奉观音的莲花宫内为火龙进行开光仪式。之后连续三个晚上以顺时针方向巡游大坑的所有街道。'),
  ('asia:hk-fire-dragon', '8/16 역방향·바다·龙归天(전통 서술)', f'{PE}/hk-fire-dragon/ihchina-14936.txt', '八月十六晚上举行“游大运”仪式，火龙沿逆时针方向巡游社区一周，然后舞到海边，将之投入海中，称为“龙归天”。'),
  ('asia:hk-fire-dragon', '근년 소각로(2022 당대중국)', f'{AE}/hk-fire-dragon/ourchinastory-4023.txt', '近年為切合環保，以免污染海水，改為將火龍送往焚化爐'),
  ('asia:hk-fire-dragon', '근년 소각로(마리끌레르 대만)', f'{HR}/hk-fire-dragon/marieclaire-75190.txt', '如今為避免汙染環境，改送入焚化爐內'),
  ('asia:hk-fire-dragon', '2011 제3차·보호단위', f'{PE}/hk-fire-dragon/ihchina-14936.txt', '公布时间：2011(第三批)'),
  ('asia:hk-fire-dragon', '보호단위 대갱방중복리회', f'{PE}/hk-fire-dragon/ihchina-14936.txt', '保护单位：大坑坊众福利会'),
  ('asia:hk-fire-dragon', '2026 일정', f'{PE}/hk-fire-dragon/hk01-2026.txt', '日期：2026年9月24日至26日'),
  ('asia:hk-fire-dragon', '2026 규모', f'{PE}/hk-fire-dragon/hk01-2026.txt', '屆時將有300多位壯丁，舞動著一條全長67米、插滿12,000枝長壽線香的巨型火龍'),
  ('asia:hk-fire-dragon', 'HKO 2040 음력 8/14 = 9/19', f'{PE}/_shared-hko-calendar/hko-T2040e.txt', '2040/9/19 14 Wednesday'),
  ('asia:jp-yama-no-hi', '법 조문 山の日 八月十一日', f'{HR}/jp-yama-no-hi/egov-law-323AC1000000178.txt', '山の日\n八月十一日'),
  ('asia:jp-yama-no-hi', '취지', f'{HR}/jp-yama-no-hi/egov-law-323AC1000000178.txt', '山に親しむ機会を得て、山の恩恵に感謝する。'),
  ('asia:jp-yama-no-hi', '2014 개정·2016 시행', f'{AE}/jp-yama-no-hi/kumanichi.txt', '２０１４年、８月１１日を山の日と定めた改正祝日法が成立。１６年から施行された。'),
  ('asia:jp-yama-no-hi', '2020 8/10', f'{AE}/jp-keiro-no-hi/cao-gaiyou.txt', '山の日 ８月１０日'),
  ('asia:jp-yama-no-hi', '2021 8/8 및 8/9 대체휴일', f'{AE}/jp-keiro-no-hi/cao-gaiyou.txt', '山の日 ８月８日（※）\n（※）国民の祝日に関する法律（昭和23年法律第178号）第3条第2項の規定に基づき、8月9日は休日となりました。'),
  ('asia:jp-yama-no-hi', '올림픽·패럴림픽 맞춤 이동', f'{AE}/jp-keiro-no-hi/cao-gaiyou.txt', '令和２年(2020年)及び令和３年(2021年)に限り、東京オリンピック・パラリンピック競技大会の開催にあわせ、「海の日」、「スポーツの日」及び「山の日」が移動しました。'),
  ('asia:jp-yama-no-hi', '2010 산악 5단체', f'{AE}/jp-yama-no-hi/akahata-2016.txt', '２０１０年４月に山岳５団体（日本山岳協会、日本勤労者山岳連盟、日本山岳会、日本ガイド協会、日本ヒマラヤン・アドベンチャー・トラスト）が中心になって、関係省庁や地方自治体、環境団体、観光業者、山小屋関係者らに働きかけてきました。'),
  ('asia:jp-yama-no-hi', '2013 의원연맹·협의회', f'{AE}/jp-yama-no-hi/akahata-2016.txt', '同年１１月には同議連と山岳団体、自治体首長らによる全国「山の日」制定協議会ができました。'),
  ('asia:jp-yama-no-hi', '6월 첫 일요일 후보→오봉 전 11일', f'{AE}/jp-yama-no-hi/akahata-2016.txt', '山岳団体は、夏山シーズン前の６月第１日曜日を候補にしていました。'),
  ('asia:jp-yama-no-hi', '기업·학교 영향 적고 공휴일 없는 달, 오봉 전 11일', f'{AE}/jp-yama-no-hi/akahata-2016.txt', '企業や学校への影響が少なく祝日のない月ということなどから、お盆休み前の１１日に落ち着きました。'),
  ('asia:jp-yama-no-hi', '2016 마쓰모토 제1회', f'{AE}/jp-yama-no-hi/kumanichi.txt', '記念全国大会は同年、初めての山の日に合わせ、長野県松本市であった第１回大会を皮切りに、全国各地で開催されている。'),
  ('asia:jp-yama-no-hi', '10년·다카야마 제10회', f'{AE}/jp-yama-no-hi/kumanichi.txt', '祝日「山の日」が始まって１０年となり、岐阜県高山市で１１日、第１０回「山の日」記念全国大会の式典が開かれた。'),
  ('asia:jp-yama-no-hi', '기사 일시', f'{AE}/jp-yama-no-hi/kumanichi.txt', '2026年8月11日 11:37'),
  ('asia:jp-setsubun', '정의: 입춘 전날', f'{AE}/jp-setsubun/nippon-com.txt', '節分は「立春の前日」です。'),
  ('asia:jp-setsubun', '네 절기 전날 → 입춘 전날 정착', f'{AE}/jp-setsubun/nippon-com.txt', '本来は「二十四節気」の立春・立夏・立秋・立冬それぞれの前日を指すが、冬から春に移る立春は古来より1年の始まりとして重んじられていたため、特に立春の前日が「節分」として広く定着している。'),
  ('asia:jp-setsubun', '국립천문대 계산·전년 관보', f'{AE}/jp-setsubun/nippon-com.txt', '二十四節気は地球と太陽の位置関係を基に、国立天文台が割り出して前年に官報で公表する。'),
  ('asia:jp-setsubun', '2025 입춘 2/3 23:10 → 세쓰분 2/2', f'{AE}/jp-setsubun/nippon-com.txt', '立春は太陽と地球の位置関係で決まるもので、2025年は2月3日午後11時10分。つまり、節分は今日2月2日です！'),
  ('asia:jp-setsubun', 'NAO 2025 역요항 세쓰분 2/2', f'{AE}/jp-setsubun/nao-2025.txt', '節分\n2月02日'),
  ('asia:jp-setsubun', 'NAO 2021 역요항 세쓰분 2/2', f'{HR}/jp-setsubun/nao-rekiyou-2021.txt', '節分\n2月02日'),
  ('asia:jp-setsubun', 'NAO 2026 역요항 세쓰분 2/3', f'{PE}/jp-setsubun/nao-rekiyou-2026.txt', '節分\n2月03日'),
  ('asia:jp-setsubun', 'NAO 2027 역요항 세쓰분 2/3', f'{PE}/jp-setsubun/nao-rekiyou-2027.txt', '節分\n2月03日'),
  ('asia:jp-setsubun', '2021~2057 4년마다 2/2', f'{AE}/jp-setsubun/nippon-com.txt', '2021年から2057年までは4年ごとに2月2日が節分となり'),
  ('asia:jp-setsubun', '콩·에호마키', f'{AE}/jp-setsubun/nippon-com.txt', 'スーパーやコンビニにはまだお豆も恵方巻もたっぷりあるはず。'),
  ('asia:jp-setsubun', '福は内', f'{AE}/jp-setsubun/nippon-com.txt', '「福は内！」と言ってみよう。'),
]


def main() -> int:
    bad, ledger = [], []
    for uid, claim, path, quote in CLAIMS:
        text = (ROOT / path).read_text(encoding='utf-8')
        ok = quote in text
        if not ok:
            bad.append(f'{uid} {claim}: 인용 불일치 ({path})')
        ledger.append({'uid': uid, 'claim_ko': claim, 'path': path, 'quote': quote, 'literal_match': ok})
    for uid, r in RECORDS.items():
        o = r['storytelling']['origin']
        lens = (len(o), len(r['storytelling']['anecdote']))
        print(f'{uid:32} origin {lens[0]} / anecdote {lens[1]} / total {sum(lens)}')
    if bad:
        print('\n'.join(bad))
        return 1
    out = {'_note': 'held-resolution-20261013 최종 레코드. add_entries.py 입력 형식(키는 후보 uid).', **RECORDS}
    (BATCH / 'records-final.json').write_text(json.dumps(out, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (BATCH / 'claims-ledger.json').write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'인용 {len(ledger)}개 전부 원문 일치 → records-final.json, claims-ledger.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
