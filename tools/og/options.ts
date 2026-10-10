import { resolve } from 'node:path'

export function samplesOutputDir(args: string[], cwd = process.cwd()): string {
  if (!args.length) return resolve(cwd, 'tmp/og-samples')
  if (args.length === 2 && args[0] === '--out' && args[1].trim() && !args[1].startsWith('--')) return resolve(cwd, args[1])
  throw new Error('Usage: npm run og:samples -- [--out <dir>]')
}
