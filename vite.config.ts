import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { prerender } from './tools/prerender/plugin'

export default defineConfig({
  plugins: [vue(), tailwindcss(), prerender()],
  // 프리렌더가 페이지마다 쓴 화면의 CSS·JS 를 찾는 데 쓴다(dist/.vite 는 다 쓰고 지운다).
  build: { manifest: true },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
