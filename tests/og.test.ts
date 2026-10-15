import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { allAnniversaries } from '../src/data/anniversaries/all'
import categories from '../src/data/categories.json'
import routes from '../src/data/routes.json'
import copy from '../server/og/copy.json'
import { displayName } from '../src/utils/format'
import { OG_VERSION, ogImageUrl } from '../src/seo/og'
import { itemsOnDate, pageCard, parseOgQuery } from '../server/og/query'
import { hubLines, ogTemplate, titleLines, type Element } from '../server/og/template'
import { ogDisplayName } from '../server/og/text'
import { MILESTONE_IDS } from '../src/features/together/milestones'
import { samplesOutputDir } from '../tools/og/options'
import { renderOg } from '../server/og/render'
import handler from '../api/og'

const parse = (s: string) => parseOgQuery(new URLSearchParams(s), 2026)
const pizza = allAnniversaries.find((a) => a.date === '10-11' && a.name.includes('소시지'))!
async function call(method: string, query: string, headers: Record<string, string> = {}) {
  const reply = { status: 0, headers: {} as Record<string, string>, body: Buffer.alloc(0) }
  await handler(
    { method, url: `/api/og?${query}`, headers } as never,
    {
      set statusCode(n: number) {
        reply.status = n
      },
      setHeader(k: string, v: string) {
        reply.headers[k.toLowerCase()] = String(v)
      },
      end(body?: Buffer) {
        reply.body = body ?? Buffer.alloc(0)
      },
    } as never,
  )
  return reply
}

describe('OG 입력 allowlist', () => {
  it('등록된 상세 주소만 받는다', () => {
    const r = routes[pizza.id as keyof typeof routes]
    const out = parse(`kind=detail&date=${r.urlDate}&slug=${r.slug}`)
    expect(typeof out).toBe('object')
    expect(parse(`kind=detail&date=01-01&slug=${r.slug}`)).toBe(404)
    expect(parse('kind=detail&date=10-11&slug=../x')).toBe(404)
  })
  it('잘못된 날짜/연도/마일스톤을 거절한다', () => {
    for (const q of [
      'kind=hub&date=02-31',
      'kind=birthday&date=10-11&year=2051',
      'kind=birthday&date=10-11&year=abcd',
      'kind=together&date=2025-02-29&m=d100',
      'kind=together&date=2026-06-21&m=y51',
    ])
      expect(parse(q)).toBe(404)
    expect(parse('kind=hub&date=02-29')).not.toBe(404)
  })
  it('구버전도 현재 렌더·캐시 키로 정규화하고 잘못된 버전 형식은 400', () => {
    const query = 'kind=hub&date=10-11&year=2026'
    for (const version of ['0', '1', OG_VERSION, 'nope', '0abc123z']) {
      expect(parse(`${query}&v=${version}`)).toEqual(parse(query))
    }
    const parsed = parse(query)
    expect(typeof parsed !== 'number' && parsed.key.endsWith(`:${OG_VERSION}`)).toBe(true)
    for (const version of ['', '123456789', 'A', 'a-b', 'a.b', '한글', 'a b', 'a\n']) {
      expect(parse(`${query}&v=${encodeURIComponent(version)}`)).toBe(400)
    }
    expect(parse(`${query}&v=1&v=2`)).toBe(400)
  })
  it('임의 키·중복·긴 쿼리는 거절한다', () => {
    for (const q of [
      'kind=hub&date=10-11&nonce=x',
      'kind=hub&date=10-11&date=10-12',
      'kind=hub&date=10-11&pick=x',
      'x='.padEnd(600, 'x'),
    ])
      expect(parse(q)).toBe(400)
  })
  it('pick은 실제 해당 연도·날짜에 발생해야 한다', () => {
    expect(parse(`kind=birthday&date=10-11&pick=${pizza.id}`)).not.toBe(404)
    expect(parse(`kind=birthday&date=10-12&pick=${pizza.id}`)).toBe(404)
    const md = allAnniversaries.find(
      (a) => a.dateType === 'annual-nth-weekday' && a.date === '05-2-SUN',
    )!
    expect(
      parseOgQuery(new URLSearchParams(`kind=birthday&date=05-09&year=2027&pick=${md.id}`), 2027),
    ).not.toBe(404)
    expect(
      parseOgQuery(new URLSearchParams(`kind=birthday&date=05-10&year=2027&pick=${md.id}`), 2027),
    ).toBe(404)
  })
  it('비고정 상세 이미지의 표시 날짜와 CDN URL을 연도별로 분리한다', () => {
    const md = allAnniversaries.find(
      (a) => a.dateType === 'annual-nth-weekday' && a.date === '05-2-SUN',
    )!
    const r = routes[md.id as keyof typeof routes]
    const query = { kind: 'detail' as const, date: r.urlDate, slug: r.slug, year: 2027 }
    const out = parse(new URL(ogImageUrl(query)).search.slice(1))
    expect(out).toMatchObject({ card: { date: '5월 9일' } })
    expect(ogImageUrl(query)).not.toBe(ogImageUrl({ ...query, year: 2026 }))
    expect(parse('kind=hub&date=10-11&year=9999')).toBe(404)
  })
  it('함께 카드의 범위 밖 연도에는 고정일만 받는다', () => {
    const md = allAnniversaries.find(
      (a) => a.dateType === 'annual-nth-weekday' && a.date === '05-2-SUN',
    )!
    expect(parse(`kind=together&date=2051-05-14&m=y25&pick=${md.id}`)).toBe(404)
  })
  it('pick 생략은 폴백 카드이며 연도를 정규화한다', () => {
    const out = parse('kind=birthday&date=10-11')
    expect(out).toMatchObject({ query: { year: 2026 }, card: { title: '이날의 이야기' } })
    expect(out).toEqual(parse('date=10-11&kind=birthday&year=2026'))
  })
  it('URL 생성은 버전과 인코딩을 공유한다', () => {
    expect(ogImageUrl('birthday')).toContain(`/og/birthday.png?v=${OG_VERSION}`)
    expect(new URL(ogImageUrl({ kind: 'hub', date: '10-11' })).searchParams.get('v')).toBe(
      OG_VERSION,
    )
  })
})

function templateStrings(node: Element): string[] {
  const children = node.props.children
  return typeof children === 'string' ? [children] : (children?.flatMap(templateStrings) ?? [])
}
const cardFrom = (query: string) => {
  const result = parse(query)
  if (typeof result === 'number') throw new Error(`Invalid test card: ${query}`)
  return result.card
}
describe('OG 문구·레이아웃', () => {
  it('중첩 원어 괄호만 정리하고 SEO displayName은 그대로 둔다', () => {
    const nested = '번트팬의 날 (National Bundt (Pan) Day)'
    expect(ogDisplayName(nested)).toBe('번트팬의 날')
    expect(displayName(nested)).toBe(nested)
    expect(ogDisplayName('동지 (冬至)')).toBe('동지')
    expect(ogDisplayName('카레의 날 (カレーの日)')).toBe('카레의 날')
    for (const title of [
      '크리스마스 (기독교탄신일)',
      '우리의 날 (English (한글) Day)',
      '파이(π)의 날',
      '결승일 (2026)',
      '이름 (Unbalanced (Name)',
      '(Original Name)',
    ])
      expect(ogDisplayName(title)).toBe(title)
    const anv = allAnniversaries.find((a) => a.name === nested)!
    const r = routes[anv.id as keyof typeof routes]
    for (const query of [
      `kind=detail&date=${r.urlDate}&slug=${r.slug}`,
      `kind=birthday&date=11-15&pick=${anv.id}`,
      `kind=together&date=2026-11-15&m=y1&pick=${anv.id}`,
    ])
      expect(cardFrom(query).title).toBe('번트팬의 날')
    expect(templateStrings(ogTemplate({ ...pageCard('home'), title: nested }))).toContain(
      '번트팬의 날',
    )
  })
  it('페이지 부제는 제목 아래에 있고 빈 날짜·라벨 행과 홈 문구 반복이 없다', () => {
    for (const page of Object.keys(copy.pages) as (keyof typeof copy.pages)[]) {
      const card = pageCard(page)
      const strings = templateStrings(ogTemplate(card))
      expect(strings).not.toContain('')
      expect(strings.indexOf(card.lead)).toBeGreaterThan(strings.indexOf(card.title))
      expect(strings.filter((s) => s === '기념일 도감')).toHaveLength(1) // 우표만
    }
    const strings = templateStrings(ogTemplate(pageCard('home')))
    expect(strings.filter((s) => s === '평범한 하루에, 기념할 이유 하나.')).toHaveLength(1)
    expect(strings).toContain('세계 곳곳의 특이한 기념일, 매일 하나씩')
  })
  it('허브는 이름 3개와 나머지 개수, 날짜·이야기 수를 표시한다', () => {
    const items = itemsOnDate(2026, '11-11')
    expect(items.length).toBeGreaterThanOrEqual(4)
    const card = cardFrom('kind=hub&date=11-11')
    expect(card.lead).toBe(
      items
        .slice(0, 3)
        .map((a) => ogDisplayName(a.name))
        .join(' · ') + ` 외 ${items.length - 3}개`,
    )
    expect(card.label).toBe(`${items.length}개의 이야기`)
    const strings = templateStrings(ogTemplate(card))
    expect(strings.indexOf(hubLines(card.lead)[0])).toBeGreaterThan(strings.indexOf(card.title))
    expect(strings).toContain('11월 11일')
    expect(strings).toContain(card.label)
    const empty = cardFrom('kind=hub&date=02-29&year=2026')
    expect(empty).toMatchObject({ lead: '아직 이름 붙지 않은 하루', label: '0개의 이야기' })
  })
  it('긴 허브 목록도 두 줄 안에 넣고 외 N개를 보존한다', () => {
    for (const lead of [
      '짧은 이름 · 다른 이름',
      '가'.repeat(120) + ' 외 12개',
      '가나다 '.repeat(25) + '외 4개',
    ]) {
      const lines = hubLines(lead)
      expect(lines.length).toBeLessThanOrEqual(2)
      expect(lines.every((line) => Array.from(line).length <= 30)).toBe(true)
      const suffix = lead.match(/ 외 \d+개$/)?.[0]
      if (suffix) expect(lines.at(-1)).toMatch(new RegExp(`${suffix}$`))
    }
  })
  it('카드 종류에 맞는 우표 단어를 쓴다', () => {
    for (const [query, word] of [
      ['kind=birthday&date=10-11', '생일'],
      ['kind=together&date=2026-06-21&m=d100', '우리'],
      ['kind=hub&date=11-11', '하루'],
    ])
      expect(templateStrings(ogTemplate(cardFrom(query)))).toContain(word)
    expect(templateStrings(ogTemplate(pageCard('home')))).toContain('하루')
    expect(templateStrings(ogTemplate(pageCard('birthday')))).toContain('생일')
    expect(templateStrings(ogTemplate(pageCard('together')))).toContain('우리')
  })
})

it('샘플은 저장소 tmp가 기본이고 --out으로 경로를 재정의한다', () => {
  expect(samplesOutputDir([], '/repo')).toBe(resolve('/repo', 'tmp/og-samples'))
  expect(samplesOutputDir(['--out', '/scratch/samples'], '/repo')).toBe('/scratch/samples')
  expect(samplesOutputDir(['--out', 'review'], '/repo')).toBe('/repo/review')
  for (const args of [['--out'], ['--out', ''], ['--out', '--bad'], ['--bad'], ['--out', 'a', 'b']])
    expect(() => samplesOutputDir(args)).toThrow('Usage:')
})

// TTF cmap format 4/12를 직접 읽는다. 테스트에 별도 폰트/파이썬 의존성을 추가하지 않는다.
function fontCmap(font: Buffer): Set<number> {
  let offset = 0
  for (let i = 0; i < font.readUInt16BE(4); i++) {
    const at = 12 + i * 16
    if (font.toString('ascii', at, at + 4) === 'cmap') offset = font.readUInt32BE(at + 8)
  }
  const codes = new Set<number>()
  for (let i = 0; i < font.readUInt16BE(offset + 2); i++) {
    const at = offset + font.readUInt32BE(offset + 4 + i * 8 + 4)
    const format = font.readUInt16BE(at)
    if (format === 12) {
      for (let g = 0; g < font.readUInt32BE(at + 12); g++) {
        const pos = at + 16 + g * 12,
          start = font.readUInt32BE(pos),
          end = font.readUInt32BE(pos + 4),
          glyph = font.readUInt32BE(pos + 8)
        for (let c = start; c <= end; c++) if (glyph + c - start !== 0) codes.add(c)
      }
    } else if (format === 4) {
      const n = font.readUInt16BE(at + 6) / 2
      for (let g = 0; g < n; g++) {
        const end = font.readUInt16BE(at + 14 + g * 2),
          start = font.readUInt16BE(at + 16 + n * 2 + g * 2)
        const delta = font.readInt16BE(at + 16 + n * 4 + g * 2),
          rangeAt = at + 16 + n * 6 + g * 2,
          range = font.readUInt16BE(rangeAt)
        for (let c = start; c <= end && c !== 65535; c++) {
          const base = range ? font.readUInt16BE(rangeAt + range + (c - start) * 2) : c
          const glyph = range && base === 0 ? 0 : (base + delta) & 65535
          if (glyph !== 0) codes.add(c)
        }
      }
    }
  }
  return codes
}
describe('서브셋 글리프', () => {
  // 이름·모든 태그·문구 전체에 더해 실제 템플릿 출력도 검사한다. 허브 목록/말줄임,
  // 날짜, 모든 마일스톤, 우표/푸터를 누락하지 않는다(동적 숫자는 ASCII로 포함).
  const cards = (Object.keys(copy.pages) as (keyof typeof copy.pages)[]).map(pageCard)
  for (const m of MILESTONE_IDS) cards.push(cardFrom(`kind=together&date=2026-06-21&m=${m}`))
  cards.push(cardFrom('kind=birthday&date=10-11'))
  for (let day = 0; day < 366; day++) {
    const date = new Date(Date.UTC(2024, 0, 1 + day)).toISOString().slice(5, 10)
    cards.push(cardFrom(`kind=hub&date=${date}&year=2024`))
  }
  const text =
    allAnniversaries.flatMap((a) => [ogDisplayName(a.name), ...a.tags]).join('') +
    categories.map((c) => c.label).join('') +
    copy.fixed.join('') +
    Object.values(copy.pages).flat().join('') +
    cards.flatMap((card) => templateStrings(ogTemplate(card))).join('') +
    Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('')
  for (const file of ['NotoSerifKR-700.ttf', 'NotoSansKR-500.ttf', 'NotoSansKR-700.ttf'])
    it(`${file}: 모든 이름·문구를 포함한다`, () => {
      const cmap = fontCmap(readFileSync(`server/og/fonts/${file}`))
      const missing = [...new Set(Array.from(text))].filter((c) => !cmap.has(c.codePointAt(0)!))
      expect(missing, 'tools/og/build_fonts.py 를 다시 실행하세요').toEqual([])
    })
})

it('제목은 긴 이름도 2줄로 제한한다', () => {
  for (const a of allAnniversaries) {
    const { lines, size } = titleLines(ogDisplayName(a.name))
    expect(lines.length).toBeLessThanOrEqual(2)
    expect(lines.every((line) => Array.from(line).length * size <= 870)).toBe(true)
  }
  expect(titleLines('가'.repeat(100)).lines[1]).toContain('…')
})
it('렌더 스모크: PNG 시그니처와 1200×630', async () => {
  const png = await renderOg(pageCard('together'))
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})
it('GET/HEAD/ETag와 메서드·오류 응답', async () => {
  const query = `kind=birthday&date=10-11&year=2026&pick=${pizza.id}`
  const full = await call('GET', query)
  expect(full.status).toBe(200)
  expect(full.headers['content-type']).toBe('image/png')
  expect(full.headers['cache-control']).toContain('s-maxage=31536000')
  expect((await call('GET', query, { 'if-none-match': full.headers.etag })).status).toBe(304)
  const head = await call('HEAD', query)
  expect(head.body.length).toBe(0)
  expect(Number(head.headers['content-length'])).toBe(full.body.length)
  expect((await call('POST', query)).status).toBe(405)
  const old = await call('GET', `${query}&v=1`)
  expect(old.status).toBe(200)
  expect(old.headers.etag).toBe(full.headers.etag)
  expect(old.body).toEqual(full.body)
  expect((await call('HEAD', `${query}&v=old00001`)).headers.etag).toBe(full.headers.etag)
  expect((await call('GET', `${query}&v=BAD`)).status).toBe(400)
  expect((await call('GET', 'kind=hub&date=02-31')).body.length).toBe(0)
  expect((await call('GET', 'kind=hub&date=10-11&nonce=a')).status).toBe(400)
}, 15000)
