import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap'
import { fileURLToPath, URL } from 'node:url'
import { prerender } from './tools/prerender/plugin'
import { buildSitemapMeta, buildTargets } from './tools/prerender/routes'

// 기념일 상세 + 날짜 허브. 프리렌더와 사이트맵이 같은 목록을 공유한다.
const targets = buildTargets()
const { lastmod, priority, changefreq } = buildSitemapMeta(targets)

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    Sitemap({
      hostname: 'https://annical.vercel.app',
      dynamicRoutes: ['/calendar', '/export', ...targets.map((t) => t.path)],
      // 라우트별로 다르게 준다. 특히 lastmod 를 빌드 시각으로 통일하면
      // 재배포마다 전 URL 이 "수정됨"이 되어 검색엔진이 값을 무시한다.
      lastmod,
      priority,
      changefreq,
    }),
    prerender(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
