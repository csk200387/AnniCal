import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

// vite.config.ts 를 재사용하지 않는다 — 그쪽은 프리렌더 플러그인이 붙어 있어
// import 만으로 1,400건 데이터를 파싱하고 사이트맵 메타까지 만든다. 테스트에는
// 불필요한 비용이라 alias 만 맞춘 최소 설정을 따로 둔다.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
