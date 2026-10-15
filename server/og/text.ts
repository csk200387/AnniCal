/** OG 이미지·공유 메타 전용: 중첩 괄호도 짝을 찾아 원어 접미사만 제거한다. */
export function ogDisplayName(name: string): string {
  const title = name.trim()
  if (!title.endsWith(')')) return title
  let balance = 0
  for (const char of title) {
    if (char === '(') balance++
    else if (char === ')' && --balance < 0) return title
  }
  if (balance !== 0) return title
  let depth = 0
  for (let i = title.length - 1; i >= 0; i--) {
    if (title[i] === ')') depth++
    else if (title[i] === '(' && --depth === 0) {
      const inner = title.slice(i + 1, -1)
      const base = title.slice(0, i).trimEnd()
      const originalName =
        (inner.match(/[A-Za-z]/g) ?? []).length >= 3 ||
        /^[\u4e00-\u9fff]+$/.test(inner) ||
        /[\u3040-\u30ff]/.test(inner)
      return base && originalName && !/[\u1100-\u11ff\u3130-\u318f\uac00-\ud7a3]/.test(inner)
        ? base
        : title
    }
  }
  return title
}
