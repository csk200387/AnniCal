import { onBeforeUnmount, ref } from 'vue'

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

  function legacyCopy(text: string): boolean {
    const ta = document.createElement('textarea')
    ta.value = text
    // 화면 밖에 두되 focus 가능해야 execCommand 가 동작한다.
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length) // iOS 사파리는 이게 있어야 선택된다
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch {
      ok = false
    }
    ta.remove()
    return ok
  }

  async function copy(text: string): Promise<boolean> {
    if (!text) return false
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        flag(true)
        return true
      }
    } catch {
      // 권한 거부·비보안 컨텍스트 — 아래로 물러선다
    }
    const ok = legacyCopy(text)
    flag(ok)
    return ok
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return { copied, failed, copy }
}
