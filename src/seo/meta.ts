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

/**
 * JSON 을 `<script>` 안에 넣어도 안전한 문자열로 직렬화.
 *
 * `JSON.stringify` 는 HTML 문맥을 모른다. 데이터에 `</script>` 가 들어 있으면
 * 그 자리에서 script 요소가 닫히고 뒤따르는 내용이 새 스크립트로 실행된다.
 * 이 사이트는 외부 뉴스 요약·보강 JSON 을 데이터에 넣는 파이프라인이 있어
 * "우리가 쓴 값만 들어간다"고 가정할 수 없다.
 *
 * U+2028/U+2029 도 함께 escape 한다. JSON 에서는 유효하지만 JavaScript 소스에서는
 * 줄바꿈으로 취급돼 파싱을 깨뜨린다.
 *
 * 브라우저 경로(src/seo/head.ts)는 textContent 를 써서 이미 안전하지만,
 * 프리렌더는 HTML 문자열을 직접 조립하므로 이 함수가 필요하다.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function isHttpUrl(v: string | null | undefined): v is string {
  return typeof v === 'string' && /^https?:\/\//i.test(v)
}

/**
 * 제목·헤드라인에 쓸 이름.
 *
 * 데이터의 name 에는 "블랙프라이데이 (Black Friday)" 처럼 원어가 괄호로 붙은 게
 * 많은데, 제목에 날짜 괄호까지 더하면 "블랙프라이데이 (Black Friday) (11월 27일)"
 * 처럼 괄호가 겹쳐 지저분해진다. 그래서 끝에 달린 원어 괄호만 떼어낸다.
 *
 * 떼는 조건은 세 가지 — 한글이 없으면서, (1) 로마자가 3자 이상이거나
 * (2) 한자로만 이뤄졌거나 (3) 일본어 가나가 섞인 경우.
 * 절기의 "동지 (冬至)" 가 (2), 일본 기념일의 "카레의 날 (カレーの日)" 이 (3)이다.
 * "크리스마스 (기독교탄신일)" 처럼 한글이 든 괄호, "파이(π)의 날" 처럼 이름
 * 중간의 괄호, "F1 모나코 그랑프리 결승일 (2026)" 처럼 연도만 든 괄호는 남긴다.
 */
export function displayName(name: string): string {
  return name
    .replace(/\s*\(([^)]+)\)$/, (whole, inner: string) => {
      if (/[가-힣]/.test(inner)) return whole
      const romanized = (inner.match(/[A-Za-z]/g) ?? []).length >= 3
      const hanjaOnly = /^[\u4E00-\u9FFF]+$/.test(inner)
      const hasKana = /[\u3040-\u30FF]/.test(inner)
      return romanized || hanjaOnly || hasKana ? '' : whole
    })
    .trim()
}

// ── urlDate 와 displayDate 를 구분하는 이유 ────────────────────────────
// urlDate 는 주소에 못박힌 MM-DD 라서 비고정 기념일은 실제 발생일과 다르다.
// (어머니의 날 주소는 영원히 05-10, 2027년 실제 날짜는 05-09)
// 제목·설명처럼 사람이 읽는 문구에는 그 해 실제 날짜(displayDate)를 쓰고,
// urlDate 는 canonical 주소를 만들 때만 쓴다. 넘기지 않으면 urlDate 로 폴백한다.

export function anniversaryTitle(
  anv: Anniversary,
  urlDate: string,
  displayDate: string = urlDate,
): string {
  return `${displayName(anv.name)} (${koreanDate(displayDate)}) 유래와 의미`
}

export function anniversaryDescription(
  anv: Anniversary,
  urlDate: string,
  displayDate: string = urlDate,
): string {
  const body =
    anv.storytelling.origin?.trim() || anv.storytelling.anecdote?.trim() || ''
  return truncate(body || `${koreanDate(displayDate)}은 ${anv.name}입니다.`)
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
  displayDate: string = urlDate,
): unknown {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: `${anv.name} — ${koreanDate(displayDate)}`,
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
            name: koreanDate(displayDate),
            item: `${SITE_URL}/day/${displayDate}`,
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
