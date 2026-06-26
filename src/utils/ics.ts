// iCalendar(.ics) 생성기 — 클라이언트 다운로드와 서버리스 구독 피드(api/calendar.ts)가
// 함께 쓰는 isomorphic 모듈. Vite(@/ alias)와 Vercel 함수(esbuild) 양쪽에서 번들되도록
// 런타임 import 는 상대경로만 사용하고, 타입은 import type 으로만 들여온다.
import dayjs from 'dayjs'
// Node ESM(서버리스 함수)과 Vite 양쪽에서 동작하도록 상대경로 + .js 확장자 사용.
import { resolveOccurrence } from './dateUtils.js'
import type { Anniversary } from '../types/anniversary.js'

const DOW_TO_ICS: Record<string, string> = {
  SUN: 'SU', MON: 'MO', TUE: 'TU', WED: 'WE', THU: 'TH', FRI: 'FR', SAT: 'SA',
}

/** RFC 5545 텍스트 값 이스케이프 (역슬래시·세미콜론·콤마·개행). */
function esc(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

/**
 * 75 옥텟 줄 접기(line folding). 한글은 UTF-8 3바이트라 글자수가 아닌 바이트 기준으로
 * 접고, 멀티바이트 문자 중간을 자르지 않도록 코드포인트 단위로 누적한다.
 * 이어지는 줄은 공백 한 칸으로 시작한다.
 */
function foldLine(line: string): string {
  const enc = new TextEncoder()
  const MAX = 73 // CRLF + 선두 공백 여유를 둬 75 이하 보장
  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    const b = enc.encode(ch).length
    if (bytes + b > MAX) {
      out.push(cur)
      cur = ch
      bytes = b
    } else {
      cur += ch
      bytes += b
    }
  }
  out.push(cur)
  return out.join('\r\n ')
}

/** Date → "YYYYMMDD" (로컬 구성요소 기준, 종일 일정용 VALUE=DATE). */
function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}${m}${day}`
}

/** 현재 UTC 시각 → "YYYYMMDDTHHMMSSZ" (DTSTAMP용). */
function dtStamp(): string {
  const d = new Date()
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  )
}

/** dateType 에 맞는 RRULE 문자열. 1회성/연도지정형은 반복 없음(null). */
function rruleFor(anv: Anniversary): string | null {
  switch (anv.dateType) {
    case 'annual-fixed':
    case 'annual-relative-to-holiday':
      // 고정일·기준일 상대일은 매년 같은 날(상대일은 근사) 반복.
      return 'FREQ=YEARLY'
    case 'annual-nth-weekday': {
      const [mm, nStr, dowStr] = anv.date.split('-')
      const ics = DOW_TO_ICS[(dowStr ?? '').toUpperCase()]
      if (!ics) return 'FREQ=YEARLY'
      const ord = nStr?.toUpperCase() === 'L' ? '-1' : nStr
      return `FREQ=YEARLY;BYMONTH=${Number(mm)};BYDAY=${ord}${ics}`
    }
    default:
      // annual-floating, one-time → 단일 발생
      return null
  }
}

/** 기념일 1건 → VEVENT 라인 배열. 해석 불가한 항목은 null 로 건너뛴다. */
function eventLines(anv: Anniversary, year: number, stamp: string): string[] | null {
  let start: Date
  try {
    start = resolveOccurrence(anv, year)
  } catch {
    return null
  }
  if (Number.isNaN(start.getTime())) return null

  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${anv.id}@annical.vercel.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${fmtDate(start)}`,
    `DTEND;VALUE=DATE:${fmtDate(dayjs(start).add(1, 'day').toDate())}`,
  ]

  const rrule = rruleFor(anv)
  if (rrule) lines.push(`RRULE:${rrule}`)

  lines.push(`SUMMARY:${esc(anv.name)}`)

  const descParts: string[] = []
  if (anv.storytelling?.origin?.trim()) descParts.push(anv.storytelling.origin.trim())
  if (anv.storytelling?.anecdote?.trim()) descParts.push(anv.storytelling.anecdote.trim())
  const hasHttpSource = !!anv.sourceUrl && /^https?:\/\//.test(anv.sourceUrl)
  if (hasHttpSource) descParts.push(`출처: ${anv.sourceUrl}`)
  if (descParts.length) lines.push(`DESCRIPTION:${esc(descParts.join('\n\n'))}`)

  if (hasHttpSource) lines.push(`URL:${anv.sourceUrl}`)
  if (anv.category) lines.push(`CATEGORIES:${esc(anv.category)}`)
  lines.push('TRANSP:TRANSPARENT')
  lines.push('END:VEVENT')
  return lines
}

export interface BuildCalendarOptions {
  /** 캘린더 표시 이름 (X-WR-CALNAME / NAME). */
  calName?: string
}

/**
 * 기념일 목록 → 전체 VCALENDAR 문자열(CRLF 종결).
 * 주의: annual-relative-to-holiday 해석을 위해 호출 전에 registerAnchors(전체목록) 가
 * 선행되어야 한다(스토어 load 또는 서버 핸들러에서 처리).
 */
export function buildCalendar(
  items: Anniversary[],
  opts: BuildCalendarOptions = {},
): string {
  const calName = opts.calName ?? '기념일 만물상'
  const year = new Date().getFullYear()
  const stamp = dtStamp()

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anniversarium//기념일 만물상//KO',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(calName)}`,
    `NAME:${esc(calName)}`,
    'X-WR-TIMEZONE:Asia/Seoul',
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H',
  ]

  for (const anv of items) {
    const ev = eventLines(anv, year, stamp)
    if (ev) lines.push(...ev)
  }

  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}
