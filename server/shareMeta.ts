// 봇 전용 결과 HTML. 임의 텍스트를 반영하지 않고 검증된 카드 문구만 사용한다.
import { allAnniversaries } from '../src/data/anniversaries/all.js'
import { SITE_NAME, SITE_URL, koreanDate, truncate } from '../src/seo/meta.js'
import { ogDisplayName } from './og/text.js'
import { ogImageUrl } from '../src/seo/og.js'
import { PAGE_META } from '../src/seo/pages.js'
import { milestoneDate, milestoneLabel, togetherPath, validStart } from '../src/features/together/milestones.js'
import { todayInSiteZone } from '../src/utils/clock.js'
import { parseOgQuery } from './og/query.js'

const byId = new Map(allAnniversaries.map(a => [a.id, a]))
export interface ShareMeta { page: 'birthday' | 'together'; title: string; description: string; image: string; path: string }
export const escapeHtml = (value: string): string => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
export function shareMeta(params: URLSearchParams, today = todayInSiteZone()): ShareMeta {
  const page = params.get('page') === 'together' ? 'together' : 'birthday'
  const fallback: ShareMeta = { page, title: ogDisplayName(PAGE_META[page].title), description: PAGE_META[page].description, image: ogImageUrl(page), path: `/${page}` }
  const allowed = page === 'birthday' ? ['page', 'date', 'year', 'pick'] : ['page', 'start', 'm', 'pick']
  if (params.toString().length > 512 || !['birthday', 'together'].includes(params.get('page') ?? '')) return fallback
  for (const key of params.keys()) if (!allowed.includes(key) || params.getAll(key).length !== 1) return fallback
  const og = new URLSearchParams({ kind: page })
  const pick = params.get('pick')
  if (pick !== null) og.set('pick', pick)
  let path: string, lead: string
  if (page === 'birthday') {
    const date = params.get('date') ?? ''
    og.set('date', date)
    if (params.has('year')) og.set('year', params.get('year')!)
    const query = new URLSearchParams(params); query.delete('page')
    path = `/birthday?${query}`
    lead = `내 생일 ${koreanDate(date)}`
  } else {
    const start = params.get('start'), m = params.get('m') ?? ''
    if (!validStart(start, today)) return fallback
    const date = milestoneDate(start, m)
    if (!date) return fallback
    og.set('date', date); og.set('m', m)
    path = togetherPath({ start, m, date }, pick ?? undefined)
    lead = `우리 ${milestoneLabel(m)} ${koreanDate(date.slice(5))}`
  }
  const parsed = parseOgQuery(og, today.getFullYear())
  if (typeof parsed === 'number') return fallback
  const anv = parsed.pick ? byId.get(parsed.pick) : undefined
  const title = `${lead}은 ${anv ? ogDisplayName(anv.name) : '어떤 날일까?'}`
  const origin = anv?.storytelling.origin?.trim()
  // 첫 문장이 너무 길어도 검색/공유 앱의 설명 길이를 넘기지 않는다.
  const description = origin ? truncate(origin.match(/^.*?[.!?。](?:\s|$)/)?.[0] ?? origin) : `${lead}에 담긴 이야기를 기념일 도감에서 만나보세요.`
  return { page, title, description, image: ogImageUrl(parsed.query), path }
}
export function shareMetaHtml(meta: ShareMeta): string {
  const title = `${meta.title} | ${SITE_NAME}`, canonical = `${SITE_URL}/${meta.page}`
  const esc = escapeHtml
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8" />
<title>${esc(title)}</title><meta name="description" content="${esc(meta.description)}" />
<link rel="canonical" href="${canonical}" /><meta name="robots" content="noindex" />
<meta property="og:type" content="website" /><meta property="og:site_name" content="${esc(SITE_NAME)}" />
<meta property="og:locale" content="ko_KR" /><meta property="og:url" content="${esc(SITE_URL + meta.path)}" />
<meta property="og:title" content="${esc(title)}" /><meta property="og:description" content="${esc(meta.description)}" />
<meta property="og:image" content="${esc(meta.image)}" /><meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" /><meta property="og:image:alt" content="${esc(meta.title)}" />
<meta name="twitter:card" content="summary_large_image" /><meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(meta.description)}" /><meta name="twitter:image" content="${esc(meta.image)}" />
<meta name="twitter:image:alt" content="${esc(meta.title)}" /></head><body>
<h1>${esc(meta.title)}</h1><p>${esc(meta.description)}</p><a href="${esc(meta.path)}">기념일 도감에서 결과 보기</a></body></html>`
}
