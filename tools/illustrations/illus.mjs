// 기념일 상세 히어로에 싣는 수채화 도판을 Codex 이미지 생성으로 만들고 등록한다.
//
//   npm run illus -- <기념일 id> <파일명> "<그릴 대상 (영어)>" "<alt (한국어)>"
//   npm run illus -- anv-fixed-10-08-world-octopus-day-global octopus-day \
//     "a common octopus with its eight tentacles curling loosely outward" "문어 수채화"
//
// 이미 만든 그림을 쓰려면 끝에 --from=<이미지 경로> 를 붙인다(생성을 건너뛴다).
// public/illustrations/<파일명>-{640,1200}.webp 를 쓰고 src/data/illustrations.json 에 넣는다.
//
// 화풍은 아래 STYLE 로 고정한다 — 그림마다 화풍이 다르면 도감이 뒤죽박죽이 된다.
// 사물·음식·동식물만 그린다. 실존 인물·특정 역사 장면은 그리지 않는다(지어낸 역사 그림이 실린다).

import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

// 2026-10 에 바꾼 화풍. 예전 'USDA 식물 도판' 문장은 정밀 묘사에 수채화 질감만 얹은
// 그림(필터를 씌운 사진 같은)이 나와, 붓 자국·번짐·남긴 종이를 직접 요구한다.
const STYLE =
  'A genuinely hand-painted traditional watercolor, painted with a real brush on cold-press watercolor paper by a skilled illustrator. ' +
  'Loose, confident brushstrokes; uneven transparent washes; pigment granulation and pooling; soft blooms and backruns where wet paint met; ' +
  'crisp hard edges where washes dried; areas of bare paper left unpainted for highlights; a few loose graphite pencil sketch lines visible under and beyond the paint. ' +
  'Simplified, slightly imperfect hand-drawn forms. NOT photorealistic, NOT a 3D render, NOT a photo with a watercolor filter, no digital airbrushing, no smooth gradients. ' +
  'Muted natural palette with deep burgundy (#8b2c2c) as an accent where it fits. Warm cream paper (close to #f3ede0) with visible texture. ' +
  'Single subject centered with generous empty margin, paint edges fading irregularly into the paper. ' +
  'No text, no letters, no logos, no signature, no border, no frame, no background scenery.'

const CREDIT = 'AI 생성 수채화 · 기념일 도감'
// 도판은 최대 420px 로 보이므로 960 이면 2배 화면까지 덮는다. 종이 결이 바이트를 먹어
// q80·1200 은 한 장 175KB 까지 갔다 — 상세 LCP 후보라 q70·960(최대 ~90KB)으로 줄였다.
const WIDTHS = [480, 960]

const args = process.argv.slice(2)
const from = args.find((a) => a.startsWith('--from='))?.slice('--from='.length)
const [id, name, subject, alt] = args.filter((a) => !a.startsWith('--'))
if (!id || !name || !subject || !alt) {
  console.error('사용법: npm run illus -- <기념일 id> <파일명> "<그릴 대상 (영어)>" "<alt>" [--from=<이미지>]')
  process.exit(1)
}

const root = fileURLToPath(new URL('../../', import.meta.url))
const routes = JSON.parse(readFileSync(join(root, 'src/data/routes.json'), 'utf-8'))
if (!routes[id]) throw new Error(`routes.json 에 없는 기념일 id: ${id}`)

const work = mkdtempSync(join(tmpdir(), 'illus-'))
try {
  let source = from
  if (!source) {
    source = join(work, `${name}.png`)
    execFileSync(
      'codex',
      [
        'exec', '--skip-git-repo-check', '-s', 'workspace-write', '-C', work,
        `Generate ONE image with your image generation tool and save it as ${source} (landscape, 1536x1024). ` +
          `Do not modify any other file. Prompt:\n${STYLE}\nSubject: ${subject}.`,
      ],
      // stdin 을 열어 두면 codex exec 가 추가 입력을 기다리며 멈춘다.
      { stdio: ['ignore', 'inherit', 'inherit'] },
    )
  }
  if (!existsSync(source)) throw new Error(`이미지가 없습니다: ${source}`)

  for (const w of WIDTHS) {
    const out = join(root, `public/illustrations/${name}-${w}.webp`)
    execFileSync('cwebp', ['-quiet', '-q', '70', '-resize', String(w), '0', source, '-o', out])
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}

const mapPath = join(root, 'src/data/illustrations.json')
const map = JSON.parse(readFileSync(mapPath, 'utf-8'))
map[id] = { file: name, alt, credit: CREDIT }
writeFileSync(mapPath, JSON.stringify(map, null, 2) + '\n')
console.log(`등록: ${id} → public/illustrations/${name}-{${WIDTHS.join(',')}}.webp`)
