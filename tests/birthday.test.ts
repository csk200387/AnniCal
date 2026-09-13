import { describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { birthdayDays, birthdayPath, parseBirthday } from '@/features/birthday/birthday'
import { useShareStore } from '@/stores/share'
import { useAnniversariesStore } from '@/stores/anniversaries'

describe('생일 선택과 공유', () => {
  it('2월 29일을 허용하고 존재하지 않는 날짜는 거절한다', () => {
    expect(birthdayDays(2)).toBe(29)
    expect(birthdayDays(4)).toBe(30)
    expect(parseBirthday('02-29', undefined, 2026)).toEqual({ date: '02-29', year: 2026 })
    for (const date of ['02-30', '04-31', '13-01', '3-14', '', ['03-14']]) {
      expect(parseBirthday(date, undefined, 2026)).toBeNull()
    }
    expect(parseBirthday('03-14', 'not-a-year', 2026)).toBeNull()
    expect(parseBirthday('03-14', '1900', 2026)).toBeNull()
  })

  it('공유 링크에 날짜·기준 연도·선택한 기념일을 보존한다', () => {
    const context = { date: '05-10', year: 2026 }
    const url = new URL(birthdayPath(context, 'test&item'), 'https://annical.vercel.app')
    expect(parseBirthday(url.searchParams.get('date'), url.searchParams.get('year'), 2027)).toEqual(context)
    expect(url.searchParams.get('pick')).toBe('test&item')
  })

  it('연도별 이동 기념일과 윤일을 잘못된 날짜에 섞지 않는다', async () => {
    setActivePinia(createPinia())
    const store = useAnniversariesStore()
    await store.ensureAll()
    const mothersDay = store.items.find(a => a.dateType === 'annual-nth-weekday' && a.date === '05-2-SUN')!
    expect(mothersDay).toBeDefined()
    expect(store.onDate(2026, 5, 10)).toContain(mothersDay)
    expect(store.onDate(2027, 5, 10)).not.toContain(mothersDay)
    expect(store.onDate(2027, 5, 9)).toContain(mothersDay)
    const leapDay = { ...mothersDay, id: 'test-leap', date: '02-29', dateType: 'annual-fixed' as const }
    store.items = [...store.items, leapDay]
    expect(store.onDate(2026, 2, 29)).toContain(leapDay)
    expect(store.onDate(2026, 3, 1)).not.toContain(leapDay)
    const share = useShareStore()
    share.openBirthday(mothersDay, { date: '05-10', year: 2026 })
    expect(share.birthday?.date).toBe('05-10')
    share.close()
    expect(share.birthday).toBeNull()
    share.openBirthday(mothersDay, { date: '05-10', year: 2026 })
    share.open(mothersDay)
    expect(share.birthday).toBeNull()
  })
})
