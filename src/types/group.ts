/**
 * 그룹 — 카테고리와 교차하는 두 번째 분류축.
 *
 * `category` 는 한 항목에 하나만 붙는다(음식이면서 동시에 역사일 수 없다).
 * 그런데 "법정기념일"처럼 소재와 무관하게 가로지르는 묶음이 필요할 때가 있다.
 * 농업인의 날은 소재로는 '일반'이고 위안부 피해자 기림의 날은 '역사 & 추모'지만,
 * 둘 다 법령이 정한 기념일이라는 점에서 함께 묶여야 한다.
 *
 * 그래서 그룹은 `category` 를 건드리지 않고 `tags` 에 레이블을 덧붙이는 방식으로
 * 표현한다. `tags[0]` 은 여전히 카테고리 레이블이므로 배지 색(tagPalette)과
 * SEO articleSection 은 영향을 받지 않는다.
 *
 * URL 쿼리(`/api/calendar?groups=statutory`)에는 한글 레이블 대신 ASCII id 를 쓴다.
 */
export type GroupId = 'statutory'

export interface Group {
  id: GroupId
  /** 데이터의 `tags` 에 실제로 들어가는 문자열. id ↔ label 매핑의 기준이다. */
  label: string
  description: string
  emoji: string
}
