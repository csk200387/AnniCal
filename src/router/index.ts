import { createRouter, createWebHistory } from 'vue-router'
import { applyRouteMeta } from '@/seo/head'

// 라우트 meta 의 SEO 필드 타입 보강.
declare module 'vue-router' {
  interface RouteMeta {
    title: string
    description?: string
    keywords?: string
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
          '오늘은 무슨 날? 전 세계 기념일을 매일 큐레이션. ' +
          '세계 ~의 날·음식·역사·이색 기념일과 D-day를 한눈에.',
        keywords:
          '오늘의 기념일,기념일 캘린더,세계 기념일,세계의 날,이색 기념일,음식 기념일,기념일 모음,기념일 만물상',
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
  ],
})

// SPA 내비게이션마다 페이지에 맞게 <head> 메타를 갱신한다.
router.afterEach((to) => {
  applyRouteMeta(to)
})

export default router
