// 데이터셋 일부(annual-nth-weekday / annual-relative-to-holiday 계열 31건)는
// sourceUrl 자리에 URL 이 아닌 슬러그 조각("fathers-day-us")이 들어가 있다.
// 원본 URL 을 추측해 채우면 잘못된 출처를 다는 셈이라, 렌더 단계에서 걸러낸다.
// 데이터가 정리되면 이 가드는 그대로 둬도 무해하다.
export function isExternalUrl(v: string | null | undefined): v is string {
  return typeof v === 'string' && /^https?:\/\//i.test(v)
}

/** 출처 링크에 표시할 도메인 ("ko.wikipedia.org"). URL 이 아니면 null. */
export function sourceHost(v: string | null | undefined): string | null {
  if (!isExternalUrl(v)) return null
  try {
    return new URL(v).host.replace(/^www\./, '')
  } catch {
    return null
  }
}
