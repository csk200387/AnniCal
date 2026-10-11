import urllib.request, pathlib, json, concurrent.futures, datetime, re
from html.parser import HTMLParser
OUT=pathlib.Path(__file__).parent
class Text(HTMLParser):
    def __init__(self): super().__init__(); self.parts=[]; self.skip=0
    def handle_starttag(self,t,a):
        if t in ('script','style'): self.skip+=1
        if t in ('p','div','h1','h2','h3','li','br'): self.parts.append('\n')
    def handle_endtag(self,t):
        if t in ('script','style'): self.skip=max(0,self.skip-1)
        if t in ('p','div','h1','h2','h3','li'): self.parts.append('\n')
    def handle_data(self,s):
        if not self.skip:self.parts.append(s)
SOURCES=[
('misophonia','https://www.soquiet.org/blog/world-misophonia-awareness-day'),
('misophonia-site','https://www.misophoniaday.com/'),
('argentina','https://www.casarosada.gob.ar/international/latest-news/50572-9-july-argentine-independence-day'),
('argentina-annual','https://www.officeholidays.com/holidays/argentina/argentina-independence-day'),
('racial','https://www.nlb.gov.sg/main/article-detail?cmsuuid=d584f038-2d67-4a3b-b786-7d2116dbec3b'),
('racial-annual','https://www.sg101.gov.sg/resources/archives/racial-harmony-2026/'),
('belgium','https://www.brussels.be/national-day'),
('belgium-history','https://home.army.mil/benelux/my-fort/news/celebrating-belgiums-national-day-1'),
('nonprofit','https://nationaldaycalendar.com/celebrations/national-nonprofit-day-august-17'),
('nonprofit-org','https://www.pawsforpurplehearts.org/blog/national-nonprofit-day'),
('black-cat','https://www.fourpawsusa.org/campaigns-topics/topics/companion-animals/black-cat-appreciation-day'),
('black-cat-aspca','https://www.aspca.org/news/its-black-cat-appreciation-day')]
def fetch(pair):
    key,url=pair; d={'key':key,'url':url,'accessed_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
    try:
        res=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'}),timeout=40)
        html=res.read().decode('utf-8',errors='replace'); p=Text(); p.feed(html)
        text=re.sub(r'[ \t]+',' ',''.join(p.parts)); text=re.sub(r'\n\s*\n+','\n',text).strip()
        ev=OUT/'evidence'; ev.mkdir(exist_ok=True); (ev/(key+'.html')).write_text(html); (ev/(key+'.txt')).write_text(text)
        title=re.search(r'<title[^>]*>(.*?)</title>',html,re.S)
        d.update(access_status='read',title=title.group(1).strip() if title else key,local_evidence_path=str(ev/(key+'.txt')),final_url=res.url)
        print('\nSOURCE',key,'TITLE',d['title'])
        for line in text.splitlines():
            if re.search(r'July|August|annually|every year|1997|2017|2025|1890|1831|1964|2011|Sherita|Herring',line,re.I):print(line[:2200])
    except Exception as e:d.update(access_status='failed',error=str(e)); print('FAILED',key,str(e))
    return d
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: data=list(pool.map(fetch,SOURCES))
    (OUT/'fetch-log.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))
