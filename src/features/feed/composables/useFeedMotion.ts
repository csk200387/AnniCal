import { onBeforeUnmount, onMounted, ref, type ObjectDirective } from 'vue'

/** Reveal new cards once; leave everything visible when motion or observers are unavailable. */
export function useFeedMotion() {
  const reducedMotion = ref(false)
  let observer: IntersectionObserver | undefined
  let preference: MediaQueryList | undefined
  const pending = new Set<HTMLElement>()

  function syncPreference() {
    reducedMotion.value = preference?.matches ?? false
    if (reducedMotion.value) {
      observer?.disconnect()
      pending.forEach((el) => el.classList.remove('reveal-pending'))
      pending.clear()
    }
  }

  const vReveal: ObjectDirective<HTMLElement> = {
    mounted(el) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
      pending.add(el)
      el.classList.add('reveal-pending')
      observer?.observe(el)
    },
    unmounted(el) {
      observer?.unobserve(el)
      pending.delete(el)
    },
  }

  onMounted(() => {
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    syncPreference()
    preference.addEventListener('change', syncPreference)
    if (!('IntersectionObserver' in window)) return
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.remove('reveal-pending')
        observer?.unobserve(entry.target)
        pending.delete(entry.target as HTMLElement)
      }
    }, { threshold: 0.08 })
    pending.forEach((el) => observer?.observe(el))
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    preference?.removeEventListener('change', syncPreference)
    pending.clear()
  })

  return { vReveal, reducedMotion }
}
