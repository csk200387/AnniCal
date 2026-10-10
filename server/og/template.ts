// JSX 없이 satori 요소를 만드는 순수 함수. 렌더 시 외부 리소스를 가져오지 않는다.
import type { OgCard } from './query.js'

export interface Element { type: string; props: { style?: Record<string, unknown>; children?: string | Element[]; [key: string]: unknown } }
const el = (style: Record<string, unknown>, children?: string | Element[]): Element => ({ type: 'div', props: { style: { display: 'flex', ...style }, children } })

/** 글자 폭을 보수적으로 계산해 두 줄 안에 제한한다(한글/라틴 혼합도 동일). */
export function titleLines(title: string): { lines: string[]; size: number } {
  const chars = Array.from(title)
  const size = chars.length <= 10 ? 76 : chars.length <= 18 ? Math.min(64, Math.floor(870 / chars.length)) : chars.length <= 28 ? 60 : chars.length <= 42 ? 54 : 46
  const capacity = Math.floor(870 / size)
  const lines: string[] = []
  let remaining = title.trim()
  for (let row = 0; row < 2 && remaining; row++) {
    const parts = Array.from(remaining)
    if (parts.length <= capacity) { lines.push(remaining); break }
    if (row === 1) { lines.push(parts.slice(0, capacity - 1).join('').trimEnd() + '…'); break }
    let cut = capacity
    const space = parts.slice(0, capacity + 1).lastIndexOf(' ')
    if (space >= Math.floor(capacity / 2)) cut = space
    lines.push(parts.slice(0, cut).join('').trimEnd())
    remaining = parts.slice(cut).join('').trimStart()
  }
  return { lines, size }
}
export function ogTemplate(card: OgCard): Element {
  const { lines, size } = titleLines(card.title)
  const ink = '#1f1d1a', accent = '#8b2c2c', paper = '#f3ede0'
  const ring = (diameter: number, opacity: number) => el({ position: 'absolute', width: diameter, height: diameter, right: -diameter / 3, bottom: -diameter / 2, borderRadius: '50%', border: `2px solid rgba(139,44,44,${opacity})` })
  const holes = Array.from({ length: 8 }, (_, i) => el({ position: 'absolute', top: 10 + i * 22, left: -5, width: 10, height: 10, borderRadius: '50%', background: paper }))
  return el({ width: 1200, height: 630, background: paper, color: ink, fontFamily: 'Noto Sans KR', position: 'relative', overflow: 'hidden' }, [
    ring(490, .15), ring(650, .09), ring(830, .05),
    el({ position: 'absolute', top: 47, right: 54, width: 170, height: 186, background: '#fdfcf9', padding: 14, transform: 'rotate(-5deg)' }, [
      ...holes, el({ border: '1px solid #c5a8a0', flexDirection: 'column', width: '100%', alignItems: 'center', justifyContent: 'center', color: accent }, [
        el({ fontSize: 16, letterSpacing: 3 }, 'ANNICAL'),
        el({ fontFamily: 'Noto Serif KR', fontSize: 42, marginTop: 18, fontWeight: 700 }, card.kind === 'together' ? '우리' : '하루'),
        el({ fontSize: 15, marginTop: 12 }, '기념일 도감'),
      ]),
    ]),
    el({ position: 'relative', width: '100%', padding: '48px 64px 40px', flexDirection: 'column' }, [
      el({ fontSize: 18, color: accent, letterSpacing: 4, fontWeight: 700 }, 'ANNICAL'),
      el({ fontSize: 27, marginTop: 10, fontWeight: 700 }, card.header),
      el({ flexDirection: 'column', marginTop: 45, width: 910 }, [
        el({ fontSize: 25, color: accent, fontWeight: 500, height: 38 }, card.lead),
        el({ flexDirection: 'column', fontFamily: 'Noto Serif KR', fontWeight: 700, fontSize: size, lineHeight: 1.28, marginTop: 10, height: 195 }, lines.map(line => el({}, line))),
        el({ gap: 20, alignItems: 'center', marginTop: 15 }, [
          el({ fontSize: 32, fontWeight: 700 }, card.date), el({ fontSize: 22, color: '#625c52' }, card.label),
        ]),
      ]),
      el({ marginTop: 'auto', borderTop: '1px solid #d5ccbc', paddingTop: 20, justifyContent: 'space-between', fontSize: 19, color: '#625c52' }, [
        el({}, 'annical.me'), el({}, '평범한 하루에, 기념할 이유 하나.'),
      ]),
    ]),
  ])
}
