// 화면·SEO·공유 문구가 함께 쓰는 표시 규칙.
//
// 같은 변환이 화면마다 따로 구현되면 결과가 어긋난다(피드는 "카레의 날 (カレーの日)",
// 공유 카드는 "카레의 날"이던 식). 그래서 한 곳에 모은다. 서버(server/)와 빌드 타임
// 프리렌더도 이 파일을 쓰므로 import 없이 둔다.

export const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const
export const MONTH_EN = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const
export const countFormat = new Intl.NumberFormat('ko-KR')

/** (5, 10) → "05-10". urlDate·발생일 색인의 키 형식이다. */
export function monthDayKey(month: number, day: number): string {
  return `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "05-10" → "5월 10일". 유효성 검사는 호출부가 한다(anniversaryRoutes 의 koreanUrlDate). */
export function koreanDate(mmdd: string): string {
  const [mm, dd] = mmdd.split('-').map(Number)
  return `${mm}월 ${dd}일`
}

/**
 * 목록·카드·제목에 쓸 이름. 원어 괄호가 붙은 전체 이름은 그 기념일 상세 페이지 제목에서만 보여 준다.
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
      const hanjaOnly = /^[一-鿿]+$/.test(inner)
      const hasKana = /[぀-ヿ]/.test(inner)
      return romanized || hanjaOnly || hasKana ? '' : whole
    })
    .trim()
}
