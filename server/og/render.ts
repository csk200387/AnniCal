import { readFileSync } from 'node:fs'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'
import { ogTemplate } from './template.js'
import type { OgCard } from './query.js'

// import.meta.url 기준으로 배포 번들의 폰트도 찾는다. 모듈 초기화 때 한 번 읽는다.
const fontData = (file: string) => readFileSync(new URL(`./fonts/${file}`, import.meta.url))
const fonts = [
  { name: 'Noto Serif KR', data: fontData('NotoSerifKR-700.ttf'), weight: 700 as const, style: 'normal' as const },
  { name: 'Noto Sans KR', data: fontData('NotoSansKR-500.ttf'), weight: 500 as const, style: 'normal' as const },
  { name: 'Noto Sans KR', data: fontData('NotoSansKR-700.ttf'), weight: 700 as const, style: 'normal' as const },
]
export async function renderOg(card: OgCard): Promise<Buffer> {
  const svg = await satori(ogTemplate(card) as Parameters<typeof satori>[0], { width: 1200, height: 630, fonts })
  return Buffer.from(new Resvg(svg).render().asPng())
}
