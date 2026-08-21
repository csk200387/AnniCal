// 프리렌더·사이트맵이 공유하는 라우트 목록 생성.
// vite.config.ts 에서 Node 컨텍스트로 실행되므로 브라우저 API 를 쓰면 안 된다.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Anniversary } from '../../src/types/anniversary'
import { registerAnchors, resolveOccurrenceSafe } from '../../src/utils/dateUtils'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const DATA_DIR = join(ROOT, 'src/data/anniversaries')

/** 최종 slug 가 반드시 만족해야 하는 형태 — generate_slugs.py 와 같은 규칙. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export interface RouteEntry {
  slug: string
  urlDate: string
}

// ── 빌드 데이터 memoize ──────────────────────────────────────────────
// vite.config.ts, 프리렌더 플러그인, 사이트맵 메타가 각각 같은 파일을 읽는다.
// 한 번만 파싱해 나눠 쓴다.
let anniversariesCache: Anniversary[] | null = null
let routesCache: Record<string, RouteEntry> | null = null

export function loadAnniversaries(): Anniversary[] {
  if (!anniversariesCache) {
    anniversariesCache = readdirSync(DATA_DIR)
      .filter((f) => f.endsWith('.json'))
      .sort()
      .flatMap((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as Anniversary[])
    // annual-relative-to-holiday 해석에 필요하다. 날짜를 묻기 전에 반드시 선행.
    registerAnchors(anniversariesCache)
  }
  return anniversariesCache
}

export function loadRoutes(): Record<string, RouteEntry> {
  if (!routesCache) {
    routesCache = JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8'))
  }
  return routesCache!
}

/**
 * 달력에 실재하는 366개 "MM-DD" — 윤년(2024) 기준이라 02-29 를 포함한다.
 * 허브 생성과 앞뒤 날짜 이동이 모두 이 배열 하나를 본다.
 */
export const ORDINAL_DATES: readonly string[] = (() => {
  const out: string[] = []
  for (let m = 1; m <= 12; m += 1) {
    const daysInMonth = new Date(2024, m, 0).getDate()
    for (let d = 1; d <= daysInMonth; d += 1) {
      out.push(`${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
  }
  return out
})()

const ORDINAL_INDEX = new Map(ORDINAL_DATES.map((d, i) => [d, i]))

/** 366일 고리를 따라 이동. 12-31 다음은 01-01. */
export function shiftUrlDate(urlDate: string, days: number): string | null {
  const i = ORDINAL_INDEX.get(urlDate)
  if (i === undefined) return null
  const n = ORDINAL_DATES.length
  return ORDINAL_DATES[(((i + days) % n) + n) % n]
}

/**
 * 프리렌더가 기준으로 삼는 연도.
 *
 * 페이지에 적히는 "언제인가"는 이 연도의 실제 발생일이다. URL 은 2026년으로
 * 고정돼 있지만(색인 유지), 본문·제목·허브 소속은 매 배포 시점의 실제 날짜를
 * 따라야 한다 — 그래야 2027년에 어머니의 날이 "5월 10일"로 남지 않는다.
 */
export const DISPLAY_YEAR = new Date().getFullYear()

/** 그 해 실제 발생일의 "MM-DD". 계산할 수 없으면 URL 날짜로 물러선다. */
export function displayDateFor(anv: Anniversary, fallback: string): string {
  const d = resolveOccurrenceSafe(anv, DISPLAY_YEAR)
  if (!d) return fallback
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export interface PrerenderTarget {
  path: string
  kind: 'detail' | 'hub'
  anniversary?: Anniversary
  items?: Anniversary[]
  /** URL 에 박힌 고정 날짜 (주소용). */
  urlDate: string
  /** 화면에 적을 실제 발생일 (상세 전용). */
  displayDate?: string
}

/**
 * 상세(routes.json 전건) + 날짜 허브 366개를 만든다.
 *
 * 허브 소속은 routes.json 의 고정 urlDate 가 아니라 DISPLAY_YEAR 의 실제
 * 발생일로 정한다. 고정 날짜로 묶으면 비고정 기념일 78건이 매년 엉뚱한
 * 날짜 허브에 남는다.
 */
export function buildTargets(): PrerenderTarget[] {
  const anns = loadAnniversaries()
  const routes = loadRoutes()
  const byId = new Map(anns.map((a) => [a.id, a]))

  // ── 빌드를 멈춰야 하는 조건들 ──────────────────────────────────
  // 여기서 통과시키면 깨진 값이 파일 경로와 HTML 속성으로 그대로 나간다.
  const orphanRoutes = Object.keys(routes).filter((id) => !byId.has(id))
  if (orphanRoutes.length) {
    throw new Error(
      `routes.json 에 데이터셋에 없는 id 가 ${orphanRoutes.length}건 있습니다 ` +
        `(${orphanRoutes.slice(0, 3).join(', ')}…). ` +
        'tools/slugs/generate_slugs.py 를 다시 실행하세요.',
    )
  }

  // 반대 방향 — 새 기념일을 추가하고 슬러그를 재생성하지 않으면 상세 페이지도,
  // 사이트맵도, 공유 링크도 조용히 빠진다. 예전에는 이 검사가 없었다.
  const missingRoutes = anns.filter((a) => !routes[a.id]).map((a) => a.id)
  if (missingRoutes.length) {
    throw new Error(
      `routes.json 에 매핑이 없는 기념일이 ${missingRoutes.length}건 있습니다 ` +
        `(${missingRoutes.slice(0, 3).join(', ')}…). ` +
        'tools/slugs/generate_slugs.py 를 실행해 routes.json 을 갱신하세요.',
    )
  }

  const malformed = Object.entries(routes)
    .filter(([, r]) => !SLUG_RE.test(r.slug) || !ORDINAL_INDEX.has(r.urlDate))
    .map(([id, r]) => `${id} → /day/${r.urlDate}/${r.slug}`)
  if (malformed.length) {
    throw new Error(
      `routes.json 에 형식이 잘못된 항목이 ${malformed.length}건 있습니다:\n  ` +
        malformed.slice(0, 5).join('\n  '),
    )
  }

  const targets: PrerenderTarget[] = []
  const byDate = new Map<string, Anniversary[]>()

  for (const [id, r] of Object.entries(routes)) {
    const anv = byId.get(id)!
    const displayDate = displayDateFor(anv, r.urlDate)
    targets.push({
      path: `/day/${r.urlDate}/${r.slug}`,
      kind: 'detail',
      anniversary: anv,
      urlDate: r.urlDate,
      displayDate,
    })
    // 허브 묶음은 실제 발생일 기준.
    const bucket = byDate.get(displayDate)
    if (bucket) bucket.push(anv)
    else byDate.set(displayDate, [anv])
  }

  for (const urlDate of ORDINAL_DATES) {
    targets.push({
      path: `/day/${urlDate}`,
      kind: 'hub',
      items: byDate.get(urlDate) ?? [],
      urlDate,
    })
  }

  return targets
}

// ─────────────────────────────────────────────────────────────
// 사이트맵 메타 — lastmod / priority / changefreq
// ─────────────────────────────────────────────────────────────

/**
 * 파일이 마지막으로 "실제로 바뀐" 시각.
 *
 * 빌드 시각을 쓰면 재배포할 때마다 1,700여 개 URL 이 전부 "방금 수정됨"이 되고,
 * 그러면 검색엔진은 lastmod 를 신뢰하지 않고 통째로 무시한다. git 커밋 시각을
 * 쓰면 데이터를 정말 고쳤을 때만 값이 움직인다.
 *
 * Vercel 은 기본적으로 얕은 클론(shallow clone)이라 파일별 이력이 없을 수 있는데,
 * 그때는 HEAD 커밋 시각으로 수렴한다 — 그래도 "커밋할 때만 바뀌는" 성질은 유지된다.
 * git 자체를 못 쓰면 파일 mtime, 그것도 실패하면 빌드 시각으로 내려간다.
 */
function lastChanged(relPath: string): Date {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
      cwd: ROOT,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (out) return new Date(out)
  } catch {
    /* git 없음 · 저장소 아님 — 아래로 폴백 */
  }
  try {
    return statSync(join(ROOT, relPath)).mtime
  } catch {
    return new Date()
  }
}

export interface SitemapMeta {
  lastmod: Record<string, Date>
  priority: Record<string, number>
  changefreq: Record<string, string>
}

/**
 * 라우트별 사이트맵 메타를 만든다.
 * priority 는 사이트 안에서의 상대적 비중이다. 홈(매일 바뀌는 피드)이 가장 높고,
 * 검색 유입의 본진인 기념일 상세, 그다음 날짜 허브, 도구성 페이지 순으로 둔다.
 */
export function buildSitemapMeta(targets: PrerenderTarget[]): SitemapMeta {
  const fileOf = new Map<string, string>() // id → 'src/data/anniversaries/MM.json'
  for (const f of readdirSync(DATA_DIR).filter((n) => n.endsWith('.json'))) {
    const rel = `src/data/anniversaries/${f}`
    for (const a of JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as Anniversary[]) {
      fileOf.set(a.id, rel)
    }
  }

  const dateCache = new Map<string, Date>()
  const changedAt = (rel: string): Date => {
    let d = dateCache.get(rel)
    if (!d) {
      d = lastChanged(rel)
      dateCache.set(rel, d)
    }
    return d
  }

  const lastmod: Record<string, Date> = {}
  const priority: Record<string, number> = {}
  const changefreq: Record<string, string> = {}

  for (const t of targets) {
    if (t.kind === 'detail' && t.anniversary) {
      const rel = fileOf.get(t.anniversary.id)
      lastmod[t.path] = rel ? changedAt(rel) : new Date()
      priority[t.path] = 0.7
      changefreq[t.path] = 'monthly'
    } else {
      // 허브는 그 날짜에 걸린 기념일들이 담긴 파일 중 가장 최근 것을 따른다.
      const files = [...new Set((t.items ?? []).map((a) => fileOf.get(a.id)).filter(Boolean))] as string[]
      const dates = files.map(changedAt)
      lastmod[t.path] = dates.length
        ? new Date(Math.max(...dates.map((d) => d.getTime())))
        : changedAt(`src/data/anniversaries/${t.urlDate.slice(0, 2)}.json`)
      priority[t.path] = 0.6
      changefreq[t.path] = 'monthly'
    }
  }

  // 정적 라우트. 홈은 '오늘의 기념일' 피드라 매일 내용이 바뀐다.
  lastmod['/'] = changedAt('src/data/anniversaries')
  priority['/'] = 1.0
  changefreq['/'] = 'daily'
  for (const p of ['/calendar', '/export']) {
    lastmod[p] = changedAt('src/data/anniversaries')
    priority[p] = 0.5
    changefreq[p] = 'weekly'
  }

  return { lastmod, priority, changefreq }
}
