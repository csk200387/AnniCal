import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

/**
 * 프리렌더된 본문이 깜빡이지 않게 하는 지연 mount.
 *
 * 기념일 상세와 날짜 허브는 빌드 때 본문이 HTML 에 박혀 나간다(네이버 크롤러가
 * JS 를 실행하지 않기 때문). 그런데 `mount()` 는 #app 안을 자기 렌더 결과로
 * 갈아끼우므로, 데이터가 도착하기 전에 mount 하면 멀쩡히 보이던 본문이 사라지고
 * "불러오는 중…"이 대신 뜬다. 저속망에서는 그 상태가 꽤 오래 간다.
 *
 * 그래서 그 페이지에 필요한 달이 도착할 때까지 기다렸다가 mount 한다. 기다리는
 * 동안 화면에는 정적 본문이 그대로 있고, mount 순간 같은 내용이 Vue 렌더로
 * 교체되므로 사용자 눈에는 아무 일도 일어나지 않는다.
 *
 * 데이터가 끝내 안 오더라도 mount 는 반드시 한다 — 안 그러면 페이지가 영영
 * 죽은 HTML 로 남는다. 그 경우 화면은 컴포넌트의 오류·재시도 상태로 넘어간다.
 */
const PREFETCH_TIMEOUT_MS = 3000

async function warmInitialRoute(): Promise<void> {
  const match = /^\/day\/(\d{2})-\d{2}(?:\/|$)/.exec(router.currentRoute.value.path)
  if (!match) return
  const month = Number(match[1])
  if (!Number.isInteger(month) || month < 1 || month > 12) return

  // 스토어·리포지토리를 정적 import 하면 메인 청크로 끌려 들어와, 홈만 보는
  // 사람도 그 코드를 받게 된다. 필요할 때 가져온다 — 어차피 뷰 청크와 병렬로
  // 받으므로 추가 지연은 없다.
  const [{ useAnniversariesStore }, { monthsCovering }] = await Promise.all([
    import('./stores/anniversaries'),
    import('./services/anniversaryRepository'),
  ])
  const store = useAnniversariesStore(pinia)
  await Promise.race([
    store.ensureMonths(monthsCovering(month)),
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
