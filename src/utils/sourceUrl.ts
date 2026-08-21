// 출처 링크 정책 — 어떤 URL 을 밖으로 내보낼지 한곳에서 정한다.
//
// 데이터셋 일부(31건)는 sourceUrl 자리에 URL 이 아닌 슬러그 조각("fathers-day-us")이
// 들어가 있다. 원본 URL 을 추측해 채우면 잘못된 출처를 다는 셈이라, 렌더 단계에서
// 걸러낸다. (편집 도구는 이제 저장할 때 이런 값을 거부한다 — tools/inspector/validation.py)
//
// 정규식 `^https?://` 만으로는 부족하다. 자격증명이 박힌 URL, 제어문자가 든 URL,
// 이상한 포트는 통과시키면 안 된다. 실제 URL 파서에 통과시켜 판단한다.

/** 외부 링크에 항상 함께 쓰는 rel — 탭 탈취·referrer 유출·랭킹 전달을 모두 막는다. */
export const EXTERNAL_LINK_REL = 'noopener noreferrer nofollow'

function parse(v: string | null | undefined): URL | null {
  if (typeof v !== 'string' || !v) return null
  // 제어문자가 든 URL 은 헤더·속성 문맥에서 위험하다.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f\x7f-\x9f]/.test(v)) return null
  let u: URL
  try {
    u = new URL(v)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  if (u.username || u.password) return null
  if (!u.hostname) return null
  return u
}

/** 화면에 링크로 내보내도 되는 외부 URL 인지. */
export function isExternalUrl(v: string | null | undefined): v is string {
  return parse(v) !== null
}

/** 출처 링크에 표시할 도메인 ("ko.wikipedia.org"). URL 이 아니면 null. */
export function sourceHost(v: string | null | undefined): string | null {
  const u = parse(v)
  return u ? u.host.replace(/^www\./, '') : null
}
