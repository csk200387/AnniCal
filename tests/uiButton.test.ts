import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import UiButton from '../src/components/ui/UiButton.vue'

async function renderButton(props: InstanceType<typeof UiButton>['$props']) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  const app = createSSRApp({ render: () => h(UiButton, props, () => '이야기 보기') })
  app.use(router)
  await router.push('/')
  await router.isReady()
  return renderToString(app)
}

describe('shared action button destinations', () => {
  it('preserves RouterLink hrefs in canonical home and shared tool buttons', async () => {
    expect(await renderButton({ to: '/calendar', canonical: true })).toContain('href="/calendar"')
    expect(await renderButton({ to: '/birthday?date=10-11&year=2026&pick=example' })).toContain('href="/birthday?date=10-11&amp;year=2026&amp;pick=example"')
  })
  it('preserves external anchor destinations', async () => {
    expect(await renderButton({ href: 'https://example.com/story' })).toContain('href="https://example.com/story"')
  })
  it('uses a disabled native submit button while loading', async () => {
    const html = await renderButton({ type: 'submit', loading: true })
    expect(html).toContain('<button')
    expect(html).toContain('type="submit"')
    expect(html).toContain('disabled')
    expect(html).toContain('aria-busy="true"')
  })
})
