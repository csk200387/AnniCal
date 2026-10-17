import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import { initBotId } from 'botid/client/core'

import App from './App.vue'
import { createAppRouter } from './router'
import { initialMonths } from './utils/months'
import { todayInSiteZone } from './utils/clock'

// 웹폰트는 자체 호스팅한다. 예전 Google Fonts CSS 는 다른 도메인이라 첫 화면을
// 약 2초 막았다. 실제로 쓰는 것만 담는다: Inter 400·500·600(본문 라틴 글자 —
// 한글은 시스템 폰트로 떨어진다), Fraunces 는 워드마크 "AnniCal" 하나뿐이라 작은
// 크기에서 모양을 지키는 opsz 축만.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource-variable/fraunces/opsz.css'
import './assets/main.css'
import './assets/layout.css'
import './assets/ui.css'

// 통계 집계에서 봇을 빼기 위한 클라이언트 챌린지. AppShell 이 라우트마다 쏘는
// POST /api/stats 보다 먼저 떠 있어야 하므로 mount 전에 호출한다.
// 챌린지 스크립트는 vercel.json 리라이트를 거쳐 같은 출처에서 오므로 CSP
// script-src 'self' 를 건드리지 않는다.
initBotId({ protect: [{ path: '/api/stats', method: 'POST' }] })

const app = createSSRApp(App)
const router = createAppRouter()
const pinia = createPinia()

app.use(pinia)
app.use(router)

/**
 * 빌드 때 만든 HTML 을 이어받는(hydrate) mount.
 *
 * 프리렌더는 이 앱을 Vue 로 직접 렌더해 HTML 을 만든다(src/entry-server.ts). 브라우저는
 * 그 DOM 을 갈아끼우지 않고 이어받으므로 새로고침 때 화면이 바뀌어 보이지 않는다.
 * 단, 이어받는 순간의 데이터가 빌드 때와 같아야 한다 — 다르면 어긋난 부분을 다시
 * 그린다. 그래서 그 경로가 빌드 때 썼던 달(initialMonths)을 먼저 받고 mount 한다.
 *
 * 데이터가 끝내 안 오더라도 mount 는 반드시 한다 — 안 그러면 페이지가 영영
 * 죽은 HTML 로 남는다. 그 경우 화면은 컴포넌트의 오류·재시도 상태로 넘어간다.
 * 프리렌더가 없는 경로는 #app 이 비어 있어 Vue 가 처음부터 그린다.
 */
const PREFETCH_TIMEOUT_MS = 3000

async function warmInitialRoute(): Promise<void> {
  const months = initialMonths(router.currentRoute.value.path, todayInSiteZone())
  if (!months.length) return

  // 스토어는 메인 청크에 넣지 않는다 — 어차피 뷰 청크와 병렬로 받으므로 추가 지연은 없다.
  const { useAnniversariesStore } = await import('./stores/anniversaries')
  await Promise.race([
    useAnniversariesStore(pinia).ensureMonths(months),
    new Promise((resolve) => setTimeout(resolve, PREFETCH_TIMEOUT_MS)),
  ])
}

router
  .isReady()
  .then(warmInitialRoute)
  .catch(() => {
    /* 데이터를 못 받아도 앱은 떠야 한다 — 화면이 오류·재시도를 안내한다. */
  })
  .finally(() => app.mount('#app'))
