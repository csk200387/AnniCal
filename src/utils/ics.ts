// iCalendar(.ics) 생성기 — 클라이언트 다운로드와 서버리스 구독 피드(api/calendar.ts)가
// 함께 쓰는 isomorphic 모듈. Vite(@/ alias)와 Vercel 함수(esbuild) 양쪽에서 번들되도록
// 런타임 import 는 상대경로만 사용하고, 타입은 import type 으로만 들여온다.
import dayjs from 'dayjs'
// Node ESM(서버리스 함수)과 Vite 양쪽에서 동작하도록 상대경로 + .js 확장자 사용.
import { resolveOccurrence, tabulatedYearRange } from './dateUtils.js'
import type { Anniversary } from '../types/anniversary.js'

const DOW_TO_ICS: Record<string, string> = {
  SUN: 'SU', MON: 'MO', TUE: 'TU', WED: 'WE', THU: 'TH', FRI: 'FR', SAT: 'SA',
}

/** 반복 일정을 몇 년치까지 펼칠지. RDATE 로 나열하는 타입에 적용된다. */
const RDATE_YEARS = 10

/**
 * RFC 5545 텍스트 값 이스케이프 (역슬래시·세미콜론·콤마·개행).
 *
 * 개행은 CRLF·CR·LF 세 형태를 모두 처리한다. 단독 CR 을 흘려보내면 그 지점에서
 * 논리 줄이 끊겨 `ATTENDEE:` 나 `BEGIN:VALARM` 같은 속성을 데이터로 주입할 수 있다.
 */
function esc(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r\n|\r|\n/g, '\\n')
    // 남은 제어문자는 값에 쓸 수 없다(RFC 5545 CONTROL). 조용히 제거한다.
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
}

/**
 * 이스케이프가 통하지 않는 자리(UID·URL·RRULE 조각)에 쓰는 값 정리.
 * 개행과 제어문자를 아예 없애 속성/이벤트 주입을 원천 차단한다.
 */
function stripControl(s: string): string {
  return s.replace(/[\x00-\x1f\x7f-\x9f]/g, '')
}

/** UID 로 안전한 형태인지 — 데이터 오염이 캘린더 구조를 못 건드리게. */
const SAFE_ID_RE = /^[A-Za-z0-9._-]+$/

/**
 * 75 옥텟 줄 접기(line folding). 한글은 UTF-8 3바이트라 글자수가 아닌 바이트 기준으로
 * 접고, 멀티바이트 문자 중간을 자르지 않도록 코드포인트 단위로 누적한다.
 * 이어지는 줄은 공백 한 칸으로 시작한다.
 *
 * 예전에는 줄마다 TextEncoder 를 만들고 글자마다 encode() 로 배열을 할당했다.
 * UTF-8 길이는 코드포인트 값만 보면 알 수 있어서 그 할당이 통째로 불필요하다.
 * 이 한 가지로 전체 ICS 생성이 약 184ms 에서 17ms 로 줄었다.
 */
function foldLine(line: string): string {
  const MAX = 73 // CRLF + 선두 공백 여유를 둬 75 이하 보장
  // 흔한 경우(ASCII 이면서 짧은 줄)는 인코딩 없이 즉시 반환한다.
  if (line.length <= MAX && !/[^\x20-\x7e]/.test(line)) return line

  const out: string[] = []
  let cur = ''
  let bytes = 0
  for (const ch of line) {
    // 코드포인트 1개의 UTF-8 길이는 코드값으로 바로 알 수 있다 — encode() 호출 불필요.
    const cp = ch.codePointAt(0) ?? 0
    const b = cp < 0x80 ? 1 : cp < 0x800 ? 2 : cp < 0x10000 ? 3 : 4
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

/** Date → "YYYYMMDDTHHMMSSZ" (DTSTAMP용). */
function fmtStamp(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  )
}

/**
 * 출처 URL 검증 — HTTPS, 자격증명 없음, 제어문자 없음인 것만 통과.
 * 통과한 값은 `new URL()` 이 정규화한 문자열이라 원본 문자열을 그대로 쓰지 않는다.
 */
function safeSourceUrl(raw: string | null | undefined): string | null {
  if (!raw) return null
  const cleaned = stripControl(raw)
  if (cleaned !== raw) return null
  let u: URL
  try {
    u = new URL(cleaned)
  } catch {
    return null
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
  if (u.username || u.password) return null
  return u.toString()
}

/**
 * dateType 에 맞는 RRULE 문자열. 반복을 규칙으로 못 적는 타입은 null 을 돌려주고,
 * 호출부가 RDATE 로 날짜를 나열한다.
 */
function rruleFor(anv: Anniversary): string | null {
  switch (anv.dateType) {
    case 'annual-fixed':
      // 매년 같은 월·일 — DTSTART 의 월·일이 그대로 반복된다.
      return 'FREQ=YEARLY'
    case 'annual-nth-weekday': {
      const [mm, nStr, dowStr] = anv.date.split('-')
      const ics = DOW_TO_ICS[(dowStr ?? '').toUpperCase()]
      const month = Number(mm)
      if (!ics || !Number.isInteger(month) || month < 1 || month > 12) return null
      const ord = nStr?.toUpperCase() === 'L' ? '-1' : nStr
      // 서수는 1~5 또는 -1 만 허용. 그 밖의 값이면 규칙을 만들지 않는다.
      if (!/^(?:[1-5]|-1)$/.test(ord ?? '')) return null
      return `FREQ=YEARLY;BYMONTH=${month};BYDAY=${ord}${ics}`
    }
    default:
      // annual-relative-to-holiday: 기준일이 'N번째 요일'이라 offset 을 더하면
      //   매년 월·일이 달라진다. FREQ=YEARLY 로 적으면 첫해만 맞고 이듬해부터 틀린다.
      //   (블랙프라이데이 2026-11-27 → RRULE 이면 2027-11-27, 실제는 2027-11-26)
      // annual-tabulated: 음력·절기라 규칙 자체가 없다.
      // 둘 다 아래에서 연도별 RDATE 로 나열한다.
      // annual-floating, one-time 은 단일 발생이라 반복이 없다.
      return null
  }
}

/** 연도별 실제 발생일을 RDATE 후보로 모은다. 계산 실패한 연도는 건너뛴다. */
function occurrenceDates(anv: Anniversary, fromYear: number, toYear: number): string[] {
  const out: string[] = []
  for (let y = fromYear; y <= toYear; y += 1) {
    try {
      const d = resolveOccurrence(anv, y)
      if (!Number.isNaN(d.getTime())) out.push(fmtDate(d))
    } catch {
      break // 표 범위를 벗어났거나 anchor 가 깨졌다 — 여기까지만 낸다.
    }
  }
  return out
}

export interface EventBuildResult {
  lines: string[] | null
  /** 건너뛴 이유. 호출부가 조용한 누락을 감지할 수 있게 남긴다. */
  skipped?: string
}

/** 기념일 1건 → VEVENT 라인 배열. */
function eventLines(anv: Anniversary, year: number, stamp: string): EventBuildResult {
  const uid = stripControl(anv.id)
  if (!SAFE_ID_RE.test(uid)) {
    return { lines: null, skipped: `id '${anv.id}' 가 UID 로 쓸 수 없는 형태` }
  }

  let start: Date
  try {
    start = resolveOccurrence(anv, year)
  } catch (e) {
    return { lines: null, skipped: e instanceof Error ? e.message : String(e) }
  }
  if (Number.isNaN(start.getTime())) {
    return { lines: null, skipped: `date '${anv.date}' 를 해석할 수 없음` }
  }

  // 규칙으로 표현할 수 없는 반복은 이후 연도의 실제 날짜를 RDATE 로 나열한다.
  // 이렇게 하지 않으면 구독 캘린더에 올해치 하나만 뜨거나(설날), 매년 하루씩
  // 어긋난 날짜가 뜬다(블랙프라이데이).
  const rrule = rruleFor(anv)
  let rdates: string[] = []
  if (!rrule && anv.dateType !== 'annual-floating' && anv.dateType !== 'one-time') {
    const limit =
      anv.dateType === 'annual-tabulated'
        ? Math.min(year + RDATE_YEARS, tabulatedYearRange().max)
        : year + RDATE_YEARS
    rdates = occurrenceDates(anv, year + 1, limit)
  }

  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${uid}@annical.vercel.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${fmtDate(start)}`,
    ...(rdates.length ? [`RDATE;VALUE=DATE:${rdates.join(',')}`] : []),
    `DTEND;VALUE=DATE:${fmtDate(dayjs(start).add(1, 'day').toDate())}`,
  ]

  if (rrule) lines.push(`RRULE:${rrule}`)

  lines.push(`SUMMARY:${esc(anv.name)}`)

  const descParts: string[] = []
  if (anv.storytelling?.origin?.trim()) descParts.push(anv.storytelling.origin.trim())
  if (anv.storytelling?.anecdote?.trim()) descParts.push(anv.storytelling.anecdote.trim())
  const source = safeSourceUrl(anv.sourceUrl)
  if (source) descParts.push(`출처: ${source}`)
  if (descParts.length) lines.push(`DESCRIPTION:${esc(descParts.join('\n\n'))}`)

  if (source) lines.push(`URL:${source}`)
  if (anv.category) lines.push(`CATEGORIES:${esc(anv.category)}`)
  lines.push('TRANSP:TRANSPARENT')
  lines.push('END:VEVENT')
  return { lines }
}

export interface BuildCalendarOptions {
  /** 캘린더 표시 이름 (X-WR-CALNAME / NAME). */
  calName?: string
  /**
   * 모든 이벤트의 DTSTAMP. 데이터 버전(배포 커밋 시각 등)을 넣으면 같은 데이터가
   * 항상 같은 바이트를 내므로 ETag 와 조건부 요청이 실제로 동작한다.
   * 생략하면 현재 시각을 쓴다.
   */
  stamp?: Date
  /** 기준 연도. 생략하면 현재 연도. */
  year?: number
}

export interface CalendarResult {
  ics: string
  /** VEVENT 로 만들어진 건수. */
  count: number
  /** 건너뛴 항목 — 조용한 누락을 감지하려면 호출부가 확인해야 한다. */
  skipped: Array<{ id: string; reason: string }>
}

/**
 * 기념일 목록 → 전체 VCALENDAR 문자열과 생성 리포트.
 * 주의: annual-relative-to-holiday 해석을 위해 호출 전에 registerAnchors(전체목록) 가
 * 선행되어야 한다(스토어 load 또는 서버 핸들러에서 처리).
 */
export function buildCalendarDetailed(
  items: Anniversary[],
  opts: BuildCalendarOptions = {},
): CalendarResult {
  const calName = opts.calName ?? '기념일 만물상'
  const year = opts.year ?? new Date().getFullYear()
  const stamp = fmtStamp(opts.stamp ?? new Date())

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

  const skipped: Array<{ id: string; reason: string }> = []
  let count = 0
  for (const anv of items) {
    const { lines: ev, skipped: reason } = eventLines(anv, year, stamp)
    if (ev) {
      lines.push(...ev)
      count += 1
    } else {
      skipped.push({ id: anv.id, reason: reason ?? 'unknown' })
    }
  }

  lines.push('END:VCALENDAR')
  return { ics: lines.map(foldLine).join('\r\n') + '\r\n', count, skipped }
}

/** 문자열만 필요한 호출부용 얇은 래퍼. */
export function buildCalendar(
  items: Anniversary[],
  opts: BuildCalendarOptions = {},
): string {
  return buildCalendarDetailed(items, opts).ics
}
