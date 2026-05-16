#!/usr/bin/env node
// 기념일 데이터(anniversaries.json) 한 건 추가용 CLI.
// 사용: npm run data:add

import { readFile, writeFile } from 'node:fs/promises'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_PATH = resolve(__dirname, '../src/data/anniversaries.json')
const CATEGORIES_PATH = resolve(__dirname, '../src/data/categories.json')

const rl = createInterface({ input, output })

async function ask(prompt, { defaultValue = '', required = false, validate } = {}) {
  while (true) {
    const display = defaultValue ? `${prompt} [${defaultValue}]: ` : `${prompt}: `
    const raw = (await rl.question(display)).trim()
    const value = raw || defaultValue
    if (!value && required) {
      console.log('  ! 필수 입력입니다.')
      continue
    }
    if (validate && value) {
      const err = validate(value)
      if (err) {
        console.log(`  ! ${err}`)
        continue
      }
    }
    return value
  }
}

async function askChoice(prompt, choices) {
  console.log(prompt)
  choices.forEach((c, i) => console.log(`  ${i + 1}. ${c.label}`))
  while (true) {
    const raw = (await rl.question(`번호 선택 (1-${choices.length}): `)).trim()
    const idx = parseInt(raw, 10) - 1
    if (idx >= 0 && idx < choices.length) return choices[idx]
    console.log('  ! 올바른 번호를 선택하세요.')
  }
}

async function askBool(prompt, defaultValue = false) {
  const def = defaultValue ? 'Y/n' : 'y/N'
  const raw = (await rl.question(`${prompt} (${def}): `)).trim().toLowerCase()
  if (!raw) return defaultValue
  return raw === 'y' || raw === 'yes'
}

const validateDateFixed = (v) => (/^\d{2}-\d{2}$/.test(v) ? null : 'MM-DD 형식이어야 합니다.')
const validateDateFull = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v) ? null : 'YYYY-MM-DD 형식이어야 합니다.')
const validateSlug = (v) => (/^[a-z0-9-]+$/.test(v) ? null : '소문자/숫자/하이픈만 사용 가능합니다.')
const validateUrl = (v) => {
  try {
    new URL(v)
    return null
  } catch {
    return 'URL 형식이 올바르지 않습니다.'
  }
}

function buildId(dateType, date, slug) {
  if (dateType === 'annual-fixed') return `anv-fixed-${date}-${slug}`
  return `anv-${date}-${slug}`
}

async function main() {
  const [existingRaw, categoriesRaw] = await Promise.all([
    readFile(DATA_PATH, 'utf-8'),
    readFile(CATEGORIES_PATH, 'utf-8'),
  ])
  const existing = JSON.parse(existingRaw)
  const categories = JSON.parse(categoriesRaw)

  // 카테고리 목록: categories.json + 실제 데이터에 쓰인 ID 합집합
  const catMap = new Map()
  for (const c of categories) catMap.set(c.id, c.label)
  for (const a of existing) if (!catMap.has(a.category)) catMap.set(a.category, '(데이터에만 존재)')

  console.log('\n=== 기념일 추가 ===')
  console.log(`기존 항목: ${existing.length}개\n`)

  const dateType = (await askChoice('날짜 유형:', [
    { label: 'annual-fixed   매년 같은 MM-DD', value: 'annual-fixed' },
    { label: 'annual-floating  매년 반복, 날짜 변동', value: 'annual-floating' },
    { label: 'one-time       특정 연도 1회성', value: 'one-time' },
  ])).value

  const date = await ask(
    dateType === 'annual-fixed' ? '날짜 (MM-DD)' : '날짜 (YYYY-MM-DD)',
    {
      required: true,
      validate: dateType === 'annual-fixed' ? validateDateFixed : validateDateFull,
    },
  )

  const name = await ask('이름', { required: true })

  const catChoices = [...catMap.entries()].map(([id, label]) => ({
    label: `${id.padEnd(16)} ${label}`,
    value: id,
  }))
  catChoices.push({ label: '직접 입력...', value: '__custom__' })
  let category = (await askChoice('카테고리:', catChoices)).value
  if (category === '__custom__') {
    category = await ask('카테고리 ID', { required: true })
  }

  const tagsRaw = await ask('태그 (쉼표로 구분)', { required: true })
  const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)

  let id
  while (true) {
    const slug = await ask('슬러그 (예: world-bee-day)', {
      required: true,
      validate: validateSlug,
    })
    id = buildId(dateType, date, slug)
    if (existing.some((a) => a.id === id)) {
      console.log(`  ! 동일한 id가 이미 있습니다: ${id}`)
      continue
    }
    console.log(`  → id: ${id}`)
    break
  }

  const origin = await ask('유래/배경 (storytelling.origin)', { required: true })
  const anecdote = await ask('일화 (storytelling.anecdote)', { required: true })

  const memes = []
  while (true) {
    const promptText = memes.length === 0 ? '밈을 추가하시겠습니까?' : '밈을 더 추가하시겠습니까?'
    if (!(await askBool(promptText, memes.length === 0))) break
    const memeType = (await askChoice('밈 타입:', [
      { label: 'text  (캡션만)', value: 'text' },
      { label: 'image (이미지 URL + 캡션)', value: 'image' },
    ])).value
    let url = null
    if (memeType === 'image') {
      url = await ask('이미지 URL', { required: true, validate: validateUrl })
    }
    const caption = await ask('캡션', { required: true })
    memes.push({ type: memeType, url, caption })
  }

  const sourceUrlRaw = await ask('출처 URL (없으면 Enter)', { validate: validateUrl })
  const sourceUrl = sourceUrlRaw || null

  const entry = {
    id,
    date,
    dateType,
    name,
    category,
    tags,
    storytelling: { origin, anecdote },
    memes,
    sourceUrl,
  }

  console.log('\n=== 미리보기 ===')
  console.log(JSON.stringify(entry, null, 2))

  if (!(await askBool('\n위 내용으로 저장하시겠습니까?', true))) {
    console.log('취소되었습니다.')
    rl.close()
    return
  }

  existing.push(entry)
  // 기존 파일이 trailing newline 없이 ']'로 끝나는 형식이라 동일하게 유지
  await writeFile(DATA_PATH, JSON.stringify(existing, null, 2), 'utf-8')
  console.log(`\n✓ 저장 완료. 총 ${existing.length}개.`)
  console.log(`  파일: ${DATA_PATH}`)
  rl.close()
}

main().catch((err) => {
  console.error('오류:', err)
  rl.close()
  process.exit(1)
})
