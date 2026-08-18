// 프리렌더·사이트맵이 공유하는 라우트 목록 생성.
// vite.config.ts 에서 Node 컨텍스트로 실행되므로 브라우저 API 를 쓰면 안 된다.
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Anniversary } from '../../src/types/anniversary'

const ROOT = fileURLToPath(new URL('../..', import.meta.url))
const DATA_DIR = join(ROOT, 'src/data/anniversaries')

export interface RouteEntry {
  slug: string
  urlDate: string
}

export function loadAnniversaries(): Anniversary[] {
  return readdirSync(DATA_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .flatMap((f) => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as Anniversary[])
}

export function loadRoutes(): Record<string, RouteEntry> {
  return JSON.parse(readFileSync(join(ROOT, 'src/data/routes.json'), 'utf-8'))
}

export interface PrerenderTarget {
  path: string
  kind: 'detail' | 'hub'
  anniversary?: Anniversary
  items?: Anniversary[]
  urlDate: string
}

/** 상세 1,289개 + 날짜 허브 366개(2월 29일 포함)를 만든다. */
export function buildTargets(): PrerenderTarget[] {
  const anns = loadAnniversaries()
  const routes = loadRoutes()
  const byId = new Map(anns.map((a) => [a.id, a]))

  const targets: PrerenderTarget[] = []
  const byDate = new Map<string, Anniversary[]>()

  for (const [id, r] of Object.entries(routes)) {
    const anv = byId.get(id)
    if (!anv) continue // routes.json 이 낡았을 때 — 조용히 건너뛰지 말고 아래에서 경고
    targets.push({
      path: `/day/${r.urlDate}/${r.slug}`,
      kind: 'detail',
      anniversary: anv,
      urlDate: r.urlDate,
    })
    const bucket = byDate.get(r.urlDate)
    if (bucket) bucket.push(anv)
    else byDate.set(r.urlDate, [anv])
  }

  const missing = Object.keys(routes).filter((id) => !byId.has(id))
  if (missing.length) {
    throw new Error(
      `routes.json 에 데이터셋에 없는 id 가 ${missing.length}건 있습니다 ` +
        `(${missing.slice(0, 3).join(', ')}…). ` +
        'tools/slugs/generate_slugs.py 를 다시 실행하세요.',
    )
  }

  // 윤년 2월 29일까지 366일 전부 생성 — 기념일이 없는 날도 "무슨 날?" 검색을 받는다.
  for (let m = 1; m <= 12; m += 1) {
    const daysInMonth = new Date(2024, m, 0).getDate() // 2024 = 윤년
    for (let d = 1; d <= daysInMonth; d += 1) {
      const urlDate = `${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      targets.push({
        path: `/day/${urlDate}`,
        kind: 'hub',
        items: byDate.get(urlDate) ?? [],
        urlDate,
      })
    }
  }

  return targets
}

// ─────────────────────────────────────────────────────────────
// 사이트맵 메타 — lastmod / priority / changefreq
// ─────────────────────────────────────────────────────────────

/**
 * 파일이 마지막으로 "실제로 바뀐" 시각.
 *
 * 빌드 시각을 쓰면 재배포할 때마다 1,600여 개 URL 이 전부 "방금 수정됨"이 되고,
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
