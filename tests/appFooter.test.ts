import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppFooter from '../src/components/layout/AppFooter.vue'

describe('site footer contact', () => {
  it('renders the exact contact email as a mailto link at the bottom', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { render: () => h('div') } }],
    })
    await router.push('/')
    await router.isReady()
    const app = createSSRApp({ render: () => h(AppFooter) })
    app.use(router)
    const html = await renderToString(app)
    const bottom = html.slice(html.indexOf('class="footer-bottom"'))
    expect(bottom).toMatch(/Contact\s*<a[^>]*href="mailto:annical\.kr@gmail\.com"[^>]*>annical\.kr@gmail\.com<\/a>/)
  })
})
