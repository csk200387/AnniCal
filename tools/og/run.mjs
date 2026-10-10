// Vite를 번들러로만 사용한다. 서버나 파일 감시 프로세스를 시작하지 않는다.
import { build } from 'vite'
import { writeFile, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const target = new URL(`../../server/og/.runner-${process.pid}.mjs`, import.meta.url)
try {
  const result = await build({ configFile: false, logLevel: 'error', build: {
    target: 'node22', ssr: fileURLToPath(new URL('./generate.ts', import.meta.url)), write: false,
    rollupOptions: { output: { format: 'es' } },
  } })
  await writeFile(target, result.output.find(item => item.type === 'chunk' && item.isEntry).code)
  await import(target.href)
} finally {
  await unlink(target).catch(() => {})
}
