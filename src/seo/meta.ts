// 페이지 메타 문구와 구조화 데이터(JSON-LD)를 만드는 순수 함수 모음.
//
// DOM 을 일절 건드리지 않는다. 브라우저(src/seo/head.ts)와 빌드 타임
// 프리렌더(tools/prerender/plugin.ts)가 이 파일을 공유해야, 정적 HTML 과
// SPA 가 서로 다른 제목·설명을 내는 사고가 구조적으로 불가능해진다.
//
// 타입은 alias 대신 상대경로로 가져온다 — Node 쪽 tsconfig 에는 "@/*" 가 없다.
import type { Anniversary } from '../types/anniversary'

export const SITE_NAME = '기념일 만물상'
export const SITE_URL = 'https://annical.vercel.app'
export const OG_IMAGE = `${SITE_URL}/og-cover.png`

/** description 최대 길이 — 검색결과 스니펫이 잘리지 않는 선. */
const DESC_MAX = 150

export function truncate(s: string, max = DESC_MAX): string {
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length <= max ? t : `${t.slice(0, max - 1).trimEnd()}…`
}

/** urlDate("03-22") → "3월 22일" */
export function koreanDate(urlDate: string): string {
  const [mm, dd] = urlDate.split('-').map(Number)
  return `${mm}월 ${dd}일`
}

export function isHttpUrl(v: string | null | undefined): v is string {
  return typeof v === 'string' && /^https?:\/\//i.test(v)
}

/**
 * 제목·헤드라인에 쓸 이름.
 * 데이터의 name 에는 "블랙프라이데이 (Black Friday)" 처럼 영문 원어가 괄호로
 * 붙은 게 571건 있는데, 제목에 날짜 괄호까지 더하면 괄호가 겹쳐 지저분해진다.
 * 끝에 달린 "순수 영문" 괄호만 떼어낸다 — "파이(π)의 날", "크리스마스 (기독교탄신일)"
 * 처럼 한글이나 기호가 섞인 괄호, 이름 중간의 괄호는 의미가 있으므로 남긴다.
 */
export function displayName(name: string): string {
  return name.replace(/\s*\(([^)]+)\)$/, (whole, inner: string) =>
    /[가-힣]/.test(inner) || (inner.match(/[A-Za-z]/g) ?? []).length < 3 ? whole : '',
  ).trim()
}

export function anniversaryTitle(anv: Anniversary, urlDate: string): string {
  return `${displayName(anv.name)} (${koreanDate(urlDate)}) 유래와 의미`
}

export function anniversaryDescription(anv: Anniversary, urlDate: string): string {
  const body =
    anv.storytelling.origin?.trim() || anv.storytelling.anecdote?.trim() || ''
  return truncate(body || `${koreanDate(urlDate)}은 ${anv.name}입니다.`)
}

export function dateHubTitle(urlDate: string): string {
  return `${koreanDate(urlDate)}은 무슨 날?`
}

export function dateHubDescription(urlDate: string, items: Anniversary[]): string {
  if (!items.length) return `${koreanDate(urlDate)}의 기념일을 확인해 보세요.`
  return truncate(
    `${koreanDate(urlDate)}의 기념일 ${items.length}개 — ${items
      .map((a) => a.name)
      .join(', ')}.`,
  )
}

const homeCrumb = { '@type': 'ListItem', position: 1, name: '홈', item: `${SITE_URL}/` }

export function anniversaryJsonLd(
  anv: Anniversary,
  urlDate: string,
  url: string,
  description: string,
): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${anv.name} — ${koreanDate(urlDate)}`,
        description,
        inLanguage: 'ko',
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        isPartOf: { '@id': `${SITE_URL}/#website` },
        publisher: { '@id': `${SITE_URL}/#org` },
        ...(anv.tags[0] ? { articleSection: anv.tags[0] } : {}),
        ...(isHttpUrl(anv.sourceUrl) ? { citation: anv.sourceUrl } : {}),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          homeCrumb,
          {
            '@type': 'ListItem',
            position: 2,
            name: koreanDate(urlDate),
            item: `${SITE_URL}/day/${urlDate}`,
          },
          { '@type': 'ListItem', position: 3, name: anv.name, item: url },
        ],
      },
    ],
  }
}

export function dateHubJsonLd(
  urlDate: string,
  url: string,
  description: string,
): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        name: dateHubTitle(urlDate),
        description,
        inLanguage: 'ko',
        '@id': url,
        isPartOf: { '@id': `${SITE_URL}/#website` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          homeCrumb,
          { '@type': 'ListItem', position: 2, name: koreanDate(urlDate), item: url },
        ],
      },
    ],
  }
}
