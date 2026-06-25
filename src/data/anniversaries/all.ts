// 12개 월별 데이터를 정적으로 합친 전체 목록.
// SPA 는 코드 분할을 위해 anniversaryRepository 의 import.meta.glob 을 쓰지만,
// 서버리스 함수(api/calendar.ts)는 glob 을 쓸 수 없으므로 이 정적 합본을 사용한다.
import m01 from './01.json'
import m02 from './02.json'
import m03 from './03.json'
import m04 from './04.json'
import m05 from './05.json'
import m06 from './06.json'
import m07 from './07.json'
import m08 from './08.json'
import m09 from './09.json'
import m10 from './10.json'
import m11 from './11.json'
import m12 from './12.json'
import type { Anniversary } from '@/types/anniversary'

export const allAnniversaries = [
  ...m01, ...m02, ...m03, ...m04, ...m05, ...m06,
  ...m07, ...m08, ...m09, ...m10, ...m11, ...m12,
] as Anniversary[]
