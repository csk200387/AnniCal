import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'feed',
      component: () => import('@/features/feed/views/FeedView.vue'),
      meta: { title: '오늘의 엉뚱한 날' },
    },
    {
      path: '/calendar',
      name: 'calendar',
      component: () => import('@/features/calendar/views/CalendarView.vue'),
      meta: { title: '달력' },
    },
    {
      path: '/export',
      name: 'export',
      component: () => import('@/features/calendar-export/views/ExportView.vue'),
      meta: { title: '캘린더 연동' },
    },
  ],
})

export default router
