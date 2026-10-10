import { describe, expect, it } from 'vitest'
import config from '../vercel.json'
import { PREVIEW_BOT_PATTERN, isPreviewBot } from '../src/seo/previewBots'
import { allAnniversaries } from '../src/data/anniversaries/all'
import { PAGE_META } from '../src/seo/pages'
import { shareMeta, shareMetaHtml, escapeHtml } from '../server/shareMeta'
import handler from '../api/share-meta'

const today = new Date(2026, 9, 11)
const pizza = allAnniversaries.find(a => a.date === '10-11' && a.name.includes('소시지'))!
const meta = (s: string) => shareMeta(new URLSearchParams(s), today)
function call(method: string, url: string, headers: Record<string, string> = {}) {
  const reply = { status: 0, headers: {} as Record<string, string>, body: '' }
  handler({ method, url, headers } as never, {
    set statusCode(n: number) { reply.status = n }, setHeader(k: string, v: string) { reply.headers[k.toLowerCase()] = String(v) }, end(body?: string) { reply.body = body ?? '' },
  } as never)
  return reply
}

describe('공유 미리보기 봇 allowlist', () => {
  it('Vercel rewrite와 원본이 같고 검색 크롤러는 대상에서 제외한다', () => {
    for (const page of ['birthday', 'together']) {
      const rule = config.rewrites.find(r => r.source === `/${page}`)!
      expect(rule.has?.[0]).toEqual({ type: 'header', key: 'user-agent', value: PREVIEW_BOT_PATTERN })
      expect(rule.destination).toBe(`/api/share-meta?page=${page}`)
    }
    for (const ua of ['Twitterbot/1.0', 'facebookexternalhit/1.1', 'Facebot', 'kakaotalk-scrap/1', 'Slackbot-LinkExpanding 1.0',
      'Discordbot/2.0', 'TelegramBot', 'LinkedInBot/1.0', 'WhatsApp/2', 'Line/13', 'Pinterest/0.2', 'redditbot',
      'Bluesky Cardyb', 'Mastodon/4', 'Iframely/1', 'Embedly', 'SkypeUriPreview', 'Applebot/0.1']) {
      expect(isPreviewBot(ua), ua).toBe(true)
      expect(isPreviewBot(ua.toLowerCase()), ua).toBe(true)
      expect(isPreviewBot(ua.toUpperCase()), ua).toBe(true)
    }
    for (const ua of ['Googlebot/2.1', 'Googlebot-Image/1.0', 'Yeti/1.1', 'Bingbot/2', 'Mozilla/5.0 Chrome/130 Safari/537.36', 'DuckDuckBot', '']) expect(isPreviewBot(ua), ua).toBe(false)
  })
})
describe('공유 결과 메타', () => {
  it('이미 공유된 연도 생략 생일 링크도 결과를 낸다', () => {
    const result = meta(`page=birthday&date=10-11&pick=${pizza.id}`)
    expect(result.title).toBe('내 생일 10월 11일은 소시지 피자의 날')
    expect(result.image).toContain('kind=birthday'); expect(result.image).toContain('year=2026')
    expect(result.description.length).toBeLessThanOrEqual(150)
    const html = shareMetaHtml(result)
    expect(html).toContain('rel="canonical" href="https://www.annical.me/birthday"')
    expect(html).toContain('name="robots" content="noindex"'); expect(html).toContain('twitter:image:alt')
    expect(html).toContain('<h1>'); expect(html).toContain('date=10-11&amp;pick=')
  })
  it('함께 링크는 시작일로부터 실제 마일스톤 날짜를 계산한다', () => {
    const result = meta('page=together&start=2026-03-14&m=d100')
    expect(result.title).toContain('우리 100일 6월 21일')
    expect(result.image).toContain('date=2026-06-21')
    expect(shareMetaHtml(result)).toContain('rel="canonical" href="https://www.annical.me/together"')
  })
  it('공유 제목에서도 중첩 원어 괄호를 제거한다', () => {
    const anv = allAnniversaries.find(a => a.name.includes('National Bundt (Pan) Day'))!
    expect(meta(`page=birthday&date=11-15&pick=${anv.id}`).title).toBe('내 생일 11월 15일은 번트팬의 날')
    expect(meta(`page=together&start=2025-11-15&m=y1&pick=${anv.id}`).title).toBe('우리 1주년 11월 15일은 번트팬의 날')
  })
  it('잘못된 값·pick·추가 키·중복·긴 입력은 일반 페이지로 폴백', () => {
    for (const query of ['page=birthday', 'page=birthday&date=02-31', 'page=birthday&date=10-11&year=9999',
      `page=birthday&date=10-12&pick=${pizza.id}`, 'page=birthday&date=10-11&name=<script>',
      'page=birthday&page=together&date=10-11', 'page=birthday&date=10-11&date=10-12',
      `page=birthday&date=${'x'.repeat(600)}`]) expect(meta(query).title).toBe(PAGE_META.birthday.title)
    for (const query of ['page=together&start=2026-10-12&m=d100', 'page=together&start=1949-12-31&m=y1',
      'page=together&start=2024-02-29&m=y51', 'page=together&start=2025-02-29&m=d100']) expect(meta(query).title).toBe(PAGE_META.together.title)
  })
  it('HTML의 모든 값에 따옴표·script·속성 탈출을 이스케이프한다', () => {
    const attack = '<script>alert("x")</script>&\' onerror="x'
    expect(escapeHtml(attack)).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;&amp;&#39; onerror=&quot;x')
    const html = shareMetaHtml({ page: 'birthday', title: attack, description: attack, image: attack, path: attack })
    expect(html).not.toContain('<script>'); expect(html).not.toContain('onerror="x'); expect(html).toContain('&lt;script&gt;')
    expect(meta('page=birthday&date=<svg onload=alert(1)>').title).toBe(PAGE_META.birthday.title)
  })
})
it('share-meta: GET/HEAD/ETag/405와 긴 입력 폴백', () => {
  const url = `/api/share-meta?page=birthday&date=10-11&year=2026&pick=${pizza.id}`
  const get = call('GET', url)
  expect(get.status).toBe(200); expect(get.headers['content-type']).toContain('text/html')
  expect(get.headers.vary).toBe('User-Agent')
  expect(call('HEAD', url).body).toBe('')
  expect(call('GET', url, { 'if-none-match': get.headers.etag }).status).toBe(304)
  expect(call('POST', url).status).toBe(405)
  const long = call('GET', `/api/share-meta?page=together&start=${'x'.repeat(600)}`)
  expect(long.status).toBe(200); expect(long.body).toContain(PAGE_META.together.title)
})
