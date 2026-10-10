import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { allAnniversaries } from '../src/data/anniversaries/all'
import { DAY_MILESTONES, MILESTONE_IDS, milestoneDate, milestones, mergeMilestones, milestoneWindow, parseIsoDate, validStart, togetherPath } from '../src/features/together/milestones'
import { todayInSiteZone } from '../src/utils/clock'
import { useShareStore } from '../src/stores/share'
import { shareMessageFor } from '../src/utils/sharePost'

const today = new Date(2026, 9, 11)
describe('우리의 날: 순수 날짜 계산', () => {
  it('시작일이 1일: 100일 = +99일, 월·연도 경계를 넘는다', () => {
    expect(milestoneDate('2026-03-14', 'd100')).toBe('2026-06-21')
    expect(milestoneDate('2025-12-31', 'd100')).toBe('2026-04-09')
    expect(milestoneDate('2024-01-01', 'd100')).toBe('2024-04-09')
  })
  it('윤일 시작의 평년 주년은 2/28, 윤년 주년은 2/29', () => {
    expect(milestoneDate('2024-02-29', 'y1')).toBe('2025-02-28')
    expect(milestoneDate('2024-02-29', 'y4')).toBe('2028-02-29')
    expect(milestoneDate('2024-02-29', 'y50')).toBe('2074-02-28')
    expect(milestoneDate('2000-02-29', 'y1')).toBe('2001-02-28')
  })
  it('연·월·일의 정규화 오류와 잘못된 마일스톤을 거절한다', () => {
    for (const date of ['2025-02-29', '2024-04-31', '2024-13-01', '2024-1-01', '', 'not-a-date']) expect(parseIsoDate(date), date).toBeNull()
    for (const m of ['d99', 'd10001', 'y0', 'y51', 'y01', 'free text']) expect(milestoneDate('2024-01-01', m)).toBeNull()
  })
  it('1950-01-01 ~ 서울 기준 오늘을 허용하고 미래는 거절', () => {
    expect(validStart('1950-01-01', today)).toBe(true)
    expect(validStart('1949-12-31', today)).toBe(false)
    expect(validStart('2026-10-11', today)).toBe(true)
    expect(validStart('2026-10-12', today)).toBe(false)
    const midnight = todayInSiteZone(new Date('2026-10-10T15:00:00Z'))
    expect(validStart('2026-10-11', midnight)).toBe(true)
    expect(validStart('2026-10-11', todayInSiteZone(new Date('2026-10-10T14:59:59Z')))).toBe(false)
  })
  it('준비한 마일스톤은 21개 일수 + 50개 주년이다', () => {
    expect(DAY_MILESTONES).toHaveLength(21); expect(MILESTONE_IDS).toHaveLength(71)
    const all = milestones('2026-01-01', today)
    expect(all.flatMap(row => row.ids)).toHaveLength(71)
    expect(all.every((row, i) => !i || row.date > all[i - 1].date)).toBe(true)
  })
  it('같은 날짜의 마일스톤은 합쳐 라벨을 병기한다', () => {
    const all = mergeMilestones([
      { id: 'd366', date: '2026-10-11' }, { id: 'y1', date: '2026-10-11' },
      { id: 'y2', date: '2027-10-11' },
    ], today)
    const overlap = all.find(row => row.ids.length > 1)
    expect(overlap).toBeDefined()
    expect(overlap!.labels.length).toBe(overlap!.ids.length)
    expect(all.filter(row => row.date === overlap!.date)).toHaveLength(1)
  })
  it('오늘은 D-0, 다음 하나·이후 다섯·최근 지난 둘을 분리한다', () => {
    const result = milestoneWindow('2026-07-04', today)
    expect(result.next).toMatchObject({ date: '2026-10-11', daysAway: 0, ids: ['d100'] })
    expect(result.later).toHaveLength(5)
    expect(result.later.every(row => row.daysAway > 0)).toBe(true)
    const older = milestoneWindow('2020-01-01', today)
    expect(older.past).toHaveLength(2)
    expect(older.past[0].date > older.past[1].date).toBe(true)
    expect(older.past.every(row => row.daysAway < 0)).toBe(true)
  })
  it('가장 오래된/오늘의 시작일, 만료된 마일스톤, 잘못된 입력을 처리한다', () => {
    const old = milestoneWindow('1950-01-01', today)
    expect(old.next).toBeNull(); expect(old.later).toEqual([]); expect(old.past).toHaveLength(2)
    expect(milestoneWindow('2026-10-11', today).past).toEqual([])
    expect(milestones('2026-10-12', today)).toEqual([])
    expect(milestones('bad', today)).toEqual([])
  })
})
describe('우리의 날 공유', () => {
  const anv = allAnniversaries.find(a => a.date === '06-21' && a.dateType === 'annual-fixed')!
  const context = { start: '2026-03-14', m: 'd100', date: '2026-06-21' }
  it('공유 링크는 시작일·마일스톤·pick을 보존한다', () => {
    const path = togetherPath(context, anv.id)
    const query = new URL(path, 'https://www.annical.me').searchParams
    expect(query.get('start')).toBe(context.start); expect(query.get('m')).toBe('d100'); expect(query.get('pick')).toBe(anv.id)
    expect(path).not.toContain('date=')
  })
  it('메시지는 마일스톤과 실제 날짜를 사용한다', () => {
    expect(shareMessageFor(anv, null, today, context)).toContain('우리 100일은 6월 21일,')
  })
  it('공유 스토어는 다른 컨텍스트나 닫기에 함께 상태를 비운다', () => {
    setActivePinia(createPinia())
    const store = useShareStore()
    store.openTogether(anv, context)
    expect(store.isOpen).toBe(true); expect(store.together).toEqual(context); expect(store.birthday).toBeNull()
    store.openBirthday(anv, { date: '06-21', year: 2026 })
    expect(store.together).toBeNull(); expect(store.birthday).not.toBeNull()
    store.openTogether(anv, context); store.open(anv)
    expect(store.together).toBeNull()
    store.openTogether(anv, context); store.close()
    expect(store.together).toBeNull(); expect(store.isOpen).toBe(false)
  })
})
