import { createRouter, createWebHistory } from 'vue-router'
import { applyRouteMeta } from '@/seo/head'

// 라우트 meta 의 SEO 필드 타입 보강.
declare module 'vue-router' {
  interface RouteMeta {
    /** 정적 라우트의 제목. 동적 페이지(dynamicHead)는 뷰가 직접 채우므로 없다. */
    title?: string
    description?: string
    keywords?: string
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
      path: '/',
      name: 'feed',
      component: () => import('@/features/feed/views/FeedView.vue'),
      meta: {
        title: '오늘의 기념일 · 세계 기념일 캘린더',
        description:
          '오늘은 무슨 날? 세계 곳곳의 특이한 기념일과 이색 기념일을 ' +
          '월별로 모아 매일 큐레이션해요.',
        keywords:
          '오늘의 기념일,기념일 캘린더,세계 기념일,세계의 날,이색 기념일,특이한 기념일,월별 기념일,음식 기념일,기념일 모음,기념일 만물상',
      },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/features/calendar/views/CalendarView.vue'),
      meta: {
        title: '기념일 캘린더·검색',
        description:
          '월별 달력에서 모든 기념일을 한눈에. 이름·태그로 검색하고 날짜별 기념일을 확인하세요.',
        keywords:
          '기념일 캘린더,기념일 달력,기념일 검색,오늘의 기념일,월별 기념일,기념일 만물상',
      },
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('@/features/calendar-export/views/ExportView.vue'),
      meta: {
        title: '기념일 캘린더 구독·.ics 다운로드',
        description:
          '관심 기념일을 .ics로 내려받아 구글·애플 캘린더에 추가하거나, ' +
          '구독 링크로 새 기념일을 자동 업데이트 받으세요.',
        keywords:
          '기념일 캘린더 구독,기념일 ics,ics 다운로드,구글 캘린더 기념일,애플 캘린더,기념일 만물상',
      },
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
