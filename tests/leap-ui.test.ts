import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createPinia, setActivePinia } from 'pinia'
import type { Anniversary } from '@/types/anniversary'
import { useAnniversariesStore } from '@/stores/anniversaries'
import { useCalendarExport } from '@/features/calendar-export/composables/useCalendarExport'

const leap: Anniversary = {
  id: 'test-leap', date: '02-29', dateType: 'annual-fixed', name: '윤일 테스트',
  category: 'general', tags: [], memes: [], sourceUrl: null,
  storytelling: { origin: '', anecdote: '' },
}

describe('윤일 UI 소비자', () => {
  afterEach(() => vi.useRealTimers())
  it('내보내기 미리보기도 윤일을 날짜 미정으로 표시하지 않는다', async () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
    const pinia = createPinia(); setActivePinia(pinia)
    const store = useAnniversariesStore()
    await store.ensureAll()
    store.items = [leap]
    let result!: ReturnType<typeof useCalendarExport>
    const app = createSSRApp({ setup() { result = useCalendarExport(); return () => h('div') } })
    app.use(pinia)
    await renderToString(app)
    expect(result.previewItems.value).toEqual([{ id: leap.id, name: leap.name, dateLabel: '2월 29일 (윤년에만)' }])
  })
})
