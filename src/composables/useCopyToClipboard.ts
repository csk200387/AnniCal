import { onBeforeUnmount, ref } from 'vue'

/** Only called by an explicit copy button. */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Older browsers / insecure local previews use a selected text fallback.
  }
  const value = text
  if (!value || typeof document === 'undefined') return false
  const ta = document.createElement('textarea')
  ta.value = value
  ta.setAttribute('readonly', '')
  ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
  document.body.appendChild(ta)
  ta.select()
  ta.setSelectionRange(0, value.length)
  try { return document.execCommand('copy') } catch { return false } finally { ta.remove() }
}

/**
 * 텍스트를 클립보드에 복사하고 잠깐 "복사됨" 상태를 유지한다.
 *
 * navigator.clipboard 는 HTTPS(또는 localhost)에서만 동작한다. 그 밖의 환경이나
 * 권한 거부 시를 대비해 execCommand('copy') 로 물러선다 — 사파리 구버전과
 * 카카오톡·인스타그램 인앱 브라우저에서 여전히 이 경로를 탄다.
 */
export function useCopyToClipboard(resetMs = 2000) {
  const copied = ref(false)
  const failed = ref(false)
  let timer: ReturnType<typeof setTimeout> | null = null

  function flag(ok: boolean) {
    copied.value = ok
    failed.value = !ok
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      copied.value = false
      failed.value = false
    }, resetMs)
  }

  async function copy(text: string): Promise<boolean> {
    if (!text) return false
    const ok = await writeClipboard(text)
    flag(ok)
    return ok
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { copied, failed, copy }
}
