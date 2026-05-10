import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages 배포 URL: https://csk200387.github.io/AnniCal/
// 빌드 시에만 서브패스를 적용하고, 로컬 dev 는 '/' 그대로.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/AnniCal/' : '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))
