import { createRouter, createWebHistory } from 'vue-router'
import { applyRouteMeta } from '@/seo/head'
import { staticPageMeta } from '@/seo/pages'

// 라우트 meta 의 SEO 필드 타입 보강.
declare module 'vue-router' {
  interface RouteMeta {
    /** 정적 라우트의 제목. 동적 페이지(dynamicHead)는 뷰가 직접 채우므로 없다. */
    title?: string
    description?: string
    keywords?: string
    ogImage?: string
    /**
     * true 면 afterEach 의 정적 메타 주입을 건너뛴다.
     * 기념일 상세·날짜 허브는 데이터에서 title/description/JSON-LD 를 만들어
     * 뷰에서 직접 주입하는데, 여기서 한 번 덮어쓰면 프리렌더된 정확한 메타가
     * 일반 문구로 잠깐 바뀌었다가 되돌아온다. 크롤러가 그 순간을 볼 수 있다.
     */
    dynamicHead?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/together',
      name: 'together',
      component: () => import('@/features/together/views/TogetherView.vue'),
      meta: staticPageMeta('together'),
    },
    {
      path: '/birthday',
      name: 'birthday',
      component: () => import('@/features/birthday/views/BirthdayView.vue'),
      meta: staticPageMeta('birthday'),
    },
    {
      path: '/',
      name: 'feed',
      component: () => import('@/features/feed/views/FeedView.vue'),
      meta: staticPageMeta('home'),
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/features/calendar/views/CalendarView.vue'),
      meta: staticPageMeta('calendar'),
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('@/features/calendar-export/views/ExportView.vue'),
      meta: staticPageMeta('export'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/features/about/views/AboutView.vue'),
      meta: staticPageMeta('about'),
    },
    {
      path: '/popular',
      name: 'popular',
      component: () => import('@/features/stats/views/PopularView.vue'),
      meta: staticPageMeta('popular'),
    },
    {
      path: '/day/:date',
      name: 'date-hub',
      component: () => import('@/features/day/views/DateHubView.vue'),
      meta: { dynamicHead: true },
    },
    {
      path: '/day/:date/:slug',
      name: 'day-detail',
      component: () => import('@/features/day/views/DayDetailView.vue'),
      meta: { dynamicHead: true },
    },
    {
      // Vercel 이 모든 경로를 index.html 로 rewrite 하므로, 매칭되는 라우트가
      // 없으면 빈 화면이 됐다. 명시적 404 페이지로 받는다.
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/features/notfound/views/NotFoundView.vue'),
      meta: { dynamicHead: true },
    },
  ],
  // 상세 → 목록 이동 시 이전 스크롤 위치가 남지 않도록.
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
})

// SPA 내비게이션마다 페이지에 맞게 <head> 메타를 갱신한다.
// 동적 페이지는 뷰가 직접 주입하므로 건드리지 않는다.
router.afterEach((to) => {
  if (to.meta.dynamicHead) return
  applyRouteMeta(to)
})

export default router
