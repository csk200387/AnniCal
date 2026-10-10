"""정적 인스턴스 → 서브셋. 원본 VF와 venv는 커밋하지 않는다."""
import json
import subprocess
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

ROOT = Path(__file__).resolve().parents[2]
# 원어 괄호 제거 규칙은 복제하지 않고 실제 displayName()을 호출한다(Node 22.18+).
script = """
import { readFileSync, readdirSync } from 'node:fs';
import { displayName } from './src/seo/meta.ts';
const dir = 'src/data/anniversaries/';
console.log(JSON.stringify(readdirSync(dir).filter(f => f.endsWith('.json')).sort()
.flatMap(f => JSON.parse(readFileSync(dir + f, 'utf8')).map(a => displayName(a.name)))));
"""
names = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', script], cwd=ROOT))
copy = json.loads((ROOT / 'server/og/copy.json').read_text())
labels = [c['label'] for c in json.loads((ROOT / 'src/data/categories.json').read_text())]
text = ''.join(names + labels + copy['fixed'] + sum(copy['pages'].values(), []))
text += ''.join(chr(i) for i in range(32, 127))
chars = sorted(set(map(ord, text)))
for family, weight in [('NotoSerifKR', 700), ('NotoSansKR', 500), ('NotoSansKR', 700)]:
    font = TTFont(ROOT / f'tools/og/fonts-src/{family}-VF.ttf', recalcTimestamp=False)
    font = instantiateVariableFont(font, {'wght': weight}, inplace=True)
    missing = set(chars) - set(font.getBestCmap())
    if missing:
        raise SystemExit(f'{family}: 글리프 누락 {"".join(map(chr, sorted(missing)))}')
    options = subset.Options()
    options.recalc_timestamp = False
    sub = subset.Subsetter(options=options)
    sub.populate(unicodes=chars)
    sub.subset(font)
    font['head'].created = font['head'].modified = 2082844800  # 1970-01-01, 결정적 산출
    target = ROOT / f'server/og/fonts/{family}-{weight}.ttf'
    font.save(target)
    print(f'{target.relative_to(ROOT)} ({target.stat().st_size:,} bytes)')
