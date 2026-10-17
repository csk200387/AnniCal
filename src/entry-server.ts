// 빌드 때 페이지를 Vue 로 직접 렌더한다(tools/prerender). 브라우저는 이 HTML 을 갈아끼우지
// 않고 이어받으므로(main.ts 의 createSSRApp) 새로고침 때 화면이 바뀌어 보이지 않는다.
import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { createMemoryHistory } from 'vue-router'
import { renderToString, type SSRContext } from 'vue/server-renderer'
import App from './App.vue'
import { createAppRouter } from './router'
import { useAnniversariesStore } from './stores/anniversaries'
import { initialMonths } from './utils/months'
import { todayInSiteZone } from './utils/clock'

export interface Rendered {
  html: string
  /** 이 페이지가 쓴 소스 모듈 — ssr-manifest 로 CSS·JS 파일을 찾는다. */
  modules: string[]
}

export async function render(url: string): Promise<Rendered> {
  const app = createSSRApp(App)
  const pinia = createPinia()
  app.use(pinia)
  const router = createAppRouter(createMemoryHistory())
  app.use(router)
  // 브라우저가 hydrate 전에 받는 것과 같은 달만 채운다 — 더 넣으면 어긋난다.
  const months = initialMonths(new URL(url, 'https://x').pathname, todayInSiteZone())
  if (months.length) await useAnniversariesStore(pinia).ensureMonths(months)
  await router.push(url)
  await router.isReady()
  const ctx: SSRContext = {}
  const html = await renderToString(app, ctx)
  return { html, modules: [...((ctx.modules as Set<string> | undefined) ?? [])] }
}
