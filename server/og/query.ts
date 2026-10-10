// 요청값은 렌더러에 직접 전달하지 않는다. 등록된 날짜·id만 카드 데이터로 바꾼다.
import { allAnniversaries } from '../../src/data/anniversaries/all.js'
import routesJson from '../../src/data/routes.json' with { type: 'json' }
import { koreanDate } from '../../src/seo/meta.js'
import { ogDisplayName } from './text.js'
import { OG_VERSION, type OgQuery, type StaticPage } from '../../src/seo/og.js'
import { occursOn, isYearSupported, registerAnchors, resolveOccurrenceSafe } from '../../src/utils/dateUtils.js'
import { todayInSiteZone } from '../../src/utils/clock.js'
import { MILESTONE_IDS, milestoneLabel, parseIsoDate } from '../../src/features/together/milestones.js'
import copy from './copy.json' with { type: 'json' }

registerAnchors(allAnniversaries)
const byId = new Map(allAnniversaries.map(a => [a.id, a]))
const routes = routesJson as Record<string, { urlDate: string; slug: string }>
const byPath = new Map(Object.entries(routes).map(([id, r]) => [`${r.urlDate}/${r.slug}`, id]))
export const MAX_OG_QUERY_LENGTH = 512
export interface OgCard { kind: OgQuery['kind'] | 'page'; page?: StaticPage; header: string; lead: string; title: string; date: string; label: string }
export interface ParsedOg { query: OgQuery; key: string; card: OgCard; pick?: string }
export function validMonthDay(date: string): boolean { return !!parseIsoDate(`2024-${date}`) }
export function itemsOnDate(year: number, date: string, fixedOnlyOutside = false) {
  const [m, d] = date.split('-').map(Number)
  return allAnniversaries.filter(a => (!fixedOnlyOutside || isYearSupported(year) || a.dateType === 'annual-fixed') && occursOn(a, year, m, d))
}
export function pageCard(page: StaticPage): OgCard {
  const [header, title, lead] = copy.pages[page]
  return { kind: 'page', page, header, title: ogDisplayName(title), lead, date: '', label: '' }
}
/** 알 수 없는 키/중복/길이 초과는 400, 값 검증 실패는 404. */
export function parseOgQuery(params: URLSearchParams, currentYear = todayInSiteZone().getFullYear()): ParsedOg | 400 | 404 {
  if (params.toString().length > MAX_OG_QUERY_LENGTH) return 400
  const kind = params.get('kind')
  const allowed: Record<string, string[]> = {
    detail: ['kind', 'date', 'slug', 'year', 'v'], hub: ['kind', 'date', 'year', 'v'],
    birthday: ['kind', 'date', 'pick', 'year', 'v'], together: ['kind', 'date', 'pick', 'm', 'v'],
  }
  if (!kind || !allowed[kind]) return 404
  for (const key of params.keys()) if (!allowed[kind].includes(key) || params.getAll(key).length !== 1) return 400
  // 오래된 HTML의 버전도 받되, 렌더·메모리 캐시는 항상 현재 버전으로 정규화한다.
  if (params.has('v') && !/^[0-9a-z]{1,8}$/.test(params.get('v')!)) return 400
  const date = params.get('date') ?? ''
  const rawYear = params.get('year')
  const year = rawYear === null ? currentYear : /^\d{4}$/.test(rawYear) ? Number(rawYear) : NaN
  if (kind !== 'together' && (!Number.isInteger(year) || year < 1950 || year > 2100)) return 404
  let query: OgQuery, pick: string | undefined, title: string, label = '기념일', lead = '', shown = date
  let header = '기념일 도감'
  if (kind === 'detail') {
    if (!validMonthDay(date)) return 404
    const slug = params.get('slug') ?? ''
    const id = byPath.get(`${date}/${slug}`)
    const anv = id ? byId.get(id) : undefined
    if (!anv) return 404
    const occurrence = resolveOccurrenceSafe(anv, year)
    // 고정일의 윤일은 3월 1일로 밀지 않는다. 주소 날짜와 표시 날짜를 분리한다.
    if (anv.dateType !== 'annual-fixed' && occurrence) shown = `${String(occurrence.getMonth() + 1).padStart(2, '0')}-${String(occurrence.getDate()).padStart(2, '0')}`
    title = ogDisplayName(anv.name); label = anv.tags[0] ?? label
    query = { kind, date, slug, year }
  } else if (kind === 'hub') {
    if (!validMonthDay(date)) return 404
    title = `${koreanDate(date)}은 무슨 날?`
    const items = itemsOnDate(year, date)
    lead = items.length ? items.slice(0, 3).map(a => ogDisplayName(a.name)).join(' · ') + (items.length > 3 ? ` 외 ${items.length - 3}개` : '') : '아직 이름 붙지 않은 하루'
    label = `${items.length}개의 이야기`
    query = { kind, date, year }
  } else {
    let resultYear: number
    if (kind === 'birthday') {
      if (!validMonthDay(date)) return 404
      resultYear = year
      if (!isYearSupported(resultYear)) return 404
      header = '내 생일의 발견'; lead = '내 생일과 같은 날,'
      // 생략 연도도 키와 이미지 URL에 명시해 새해에 잘못된 캐시를 재사용하지 않는다.
      query = { kind, date, year }
    } else {
      const full = parseIsoDate(date), m = params.get('m') ?? ''
      if (!full || full.getFullYear() < 1950 || full.getFullYear() > currentYear + 50 || !MILESTONE_IDS.includes(m)) return 404
      resultYear = full.getFullYear(); shown = date.slice(5)
      header = '우리의 발견'; lead = `우리 ${milestoneLabel(m)},`
      query = { kind: 'together', date, m }
    }
    const id = params.get('pick')
    const anv = id ? itemsOnDate(resultYear, shown, kind === 'together').find(a => a.id === id && routes[a.id]) : undefined
    if (id !== null && !anv) return 404
    pick = anv?.id
    query = { ...query, ...(pick ? { pick } : {}) }
    title = anv ? ogDisplayName(anv.name) : '이날의 이야기'
    label = anv?.tags[0] ?? '평범한 하루에, 기념할 이유 하나.'
  }
  // 상세/허브는 현재 연도의 발생일을 렌더링하므로 메모리 키에도 연도를 넣는다.
  return { query, pick, key: JSON.stringify(query) + `:${currentYear}:${OG_VERSION}`,
    card: { kind: kind as OgQuery['kind'], header, lead, title: ogDisplayName(title), date: koreanDate(shown), label } }
}
