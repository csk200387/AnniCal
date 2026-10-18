"""수채화 도판 검수 화면.

    python3 tools/illustrations/review.py        → http://localhost:8765

등록된 도판을 모두 띄우고, 다시 그릴 그림을 고르고 이유를 적는다.
고른 내용은 tools/illustrations/.review-marks.json 에 바로 저장된다(커밋하지 않음).
에이전트는 이 파일을 읽어 다시 그린다.
"""

import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MARKS = ROOT / 'tools/illustrations/.review-marks.json'
PORT = 8765


def items():
    illus = json.loads((ROOT / 'src/data/illustrations.json').read_text())
    routes = json.loads((ROOT / 'src/data/routes.json').read_text())
    names = {}
    for f in sorted((ROOT / 'src/data/anniversaries').glob('*.json')):
        for a in json.loads(f.read_text()):
            names[a['id']] = a['name']
    out = [
        {'id': i, 'file': v['file'], 'alt': v['alt'], 'name': names.get(i, i),
         'date': routes[i]['urlDate'], 'slug': routes[i]['slug']}
        for i, v in illus.items() if i in routes
    ]
    return sorted(out, key=lambda x: (x['date'], x['name']))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT / 'public'), **k)

    def log_message(self, *a):
        pass

    def send_json(self, data):
        body = json.dumps(data, ensure_ascii=False).encode()
        self.send_response(200)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == '/':
            body = PAGE.encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        elif self.path == '/data':
            marks = json.loads(MARKS.read_text()) if MARKS.exists() else {}
            self.send_json({'items': items(), 'marks': marks})
        else:
            super().do_GET()  # /illustrations/*.webp

    def do_POST(self):
        if self.path != '/marks':
            self.send_error(404)
            return
        marks = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        # 고르지도 않고 이유도 없는 항목은 남기지 않는다.
        marks = {k: v for k, v in marks.items() if v.get('redo') or v.get('reason', '').strip()}
        MARKS.write_text(json.dumps(marks, ensure_ascii=False, indent=2) + '\n')
        self.send_json({'saved': len(marks)})


PAGE = r'''<!doctype html><html lang="ko"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>도판 검수</title>
<style>
:root{--paper:#fdfcf9;--card:#f3ede0;--ink:#1f1d1a;--sub:#756e62;--accent:#8b2c2c}
*{box-sizing:border-box}body{margin:0;font:14px/1.5 system-ui,sans-serif;background:var(--paper);color:var(--ink)}
header{position:sticky;top:0;z-index:2;background:var(--paper);border-bottom:1px solid #e3ddd1;padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
h1{font-size:18px;margin:0}.stat{color:var(--sub)}
input[type=search]{padding:6px 10px;border:1px solid #d8d0c0;border-radius:8px;min-width:200px}
label.f{display:flex;gap:4px;align-items:center;color:var(--sub)}
#saved{margin-left:auto;color:var(--sub);font-size:12px}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;padding:16px}
.c{background:var(--card);border-radius:12px;padding:8px;border:2px solid transparent}
.c.redo{border-color:var(--accent);background:#f6e3df}
.c img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:6px;display:block;cursor:zoom-in;background:#ebe4d4}
.c b{display:block;margin-top:6px}.c .m{font-size:12px;color:var(--sub)}
.c a{color:var(--sub)}
.c label{display:flex;gap:6px;align-items:center;margin-top:6px;font-weight:600;color:var(--accent);cursor:pointer}
.c textarea{width:100%;margin-top:4px;min-height:44px;border:1px solid #d8d0c0;border-radius:6px;padding:4px 6px;font:inherit;display:none}
.c.redo textarea,.c textarea:not(:placeholder-shown){display:block}
#zoom{position:fixed;inset:0;background:rgba(31,29,26,.85);display:none;align-items:center;justify-content:center;z-index:3;cursor:zoom-out}
#zoom img{max-width:94vw;max-height:90vh;border-radius:8px}
</style>
<header><h1>도판 검수</h1><span class="stat" id="stat"></span>
<input type="search" id="q" placeholder="이름·날짜·파일명 검색">
<label class="f"><input type="checkbox" id="only">재생성 고른 것만</label>
<span id="saved"></span></header>
<main id="grid"></main>
<div id="zoom"><img alt=""></div>
<script>
const PREVIEW='https://anniversary-git-feat-illustrations-csk200387-s-projects.vercel.app'
let items=[],marks={},timer
const $=s=>document.querySelector(s)
fetch('/data').then(r=>r.json()).then(d=>{items=d.items;marks=d.marks;render()})
function save(){clearTimeout(timer);$('#saved').textContent='저장 중…'
  timer=setTimeout(()=>fetch('/marks',{method:'POST',body:JSON.stringify(marks)}).then(r=>r.json())
    .then(r=>$('#saved').textContent=`저장됨 · 재생성 ${count()}장`),400)}
const count=()=>Object.values(marks).filter(m=>m.redo).length
function render(){
  const q=$('#q').value.trim().toLowerCase(),only=$('#only').checked
  const list=items.filter(it=>(!only||marks[it.id]?.redo)&&(!q||(it.name+it.date+it.file).toLowerCase().includes(q)))
  $('#stat').textContent=`${list.length} / ${items.length}장 · 재생성 ${count()}장`
  $('#grid').innerHTML=list.map(it=>{const m=marks[it.id]||{}
    return `<div class="c${m.redo?' redo':''}" data-id="${it.id}">
      <img loading="lazy" src="/illustrations/${it.file}-480.webp" data-big="/illustrations/${it.file}-960.webp" alt="${it.alt}">
      <b>${it.name}</b><div class="m">${it.date.replace('-','/')} · ${it.file} · <a href="${PREVIEW}/day/${it.date}/${it.slug}" target="_blank">페이지</a></div>
      <label><input type="checkbox"${m.redo?' checked':''}> 재생성</label>
      <textarea placeholder="이유 (예: 다른 대상이 그려짐, 너무 사실적임)">${(m.reason||'').replace(/</g,'&lt;')}</textarea></div>`}).join('')}
$('#grid').addEventListener('change',e=>{if(e.target.type!=='checkbox')return
  const c=e.target.closest('.c'),id=c.dataset.id;marks[id]={...marks[id],redo:e.target.checked}
  c.classList.toggle('redo',e.target.checked);if(e.target.checked)c.querySelector('textarea').focus();save();$('#stat').textContent=$('#stat').textContent.replace(/재생성 \d+장/,`재생성 ${count()}장`)})
$('#grid').addEventListener('input',e=>{if(e.target.tagName!=='TEXTAREA')return
  const id=e.target.closest('.c').dataset.id;marks[id]={...marks[id],reason:e.target.value};save()})
$('#grid').addEventListener('click',e=>{if(e.target.tagName!=='IMG')return
  $('#zoom img').src=e.target.dataset.big;$('#zoom').style.display='flex'})
$('#zoom').onclick=()=>$('#zoom').style.display='none'
$('#q').oninput=render;$('#only').onchange=render
</script></html>'''

if __name__ == '__main__':
    print(f'http://localhost:{PORT}  (검수 결과: {MARKS.relative_to(ROOT)})')
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()
