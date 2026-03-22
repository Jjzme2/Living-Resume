import { uiConfig } from '~/data/uiConfig'

/**
 * useScrollReveal
 * Observes elements with .reveal, .reveal-left, .reveal-right, and .stagger
 * and adds .visible when they enter the viewport.
 */
export function useScrollReveal() {
  let observer: IntersectionObserver | null = null

  const observe = () => {
    if (typeof window === 'undefined') return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            // Unobserve after triggering (animations play once)
            observer?.unobserve(entry.target)
          }
        })
      },
      {
        threshold: uiConfig.scrollReveal.threshold,
        rootMargin: uiConfig.scrollReveal.rootMargin,
      },
    )

    document
      .querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger')
      .forEach((el) => observer?.observe(el))
  }

  onMounted(() => {
    // Small delay so elements are in the DOM
    nextTick(observe)
  })

  onUnmounted(() => {
    observer?.disconnect()
  })

  return {
    /** Re-scan the DOM for new reveal elements (call after dynamic content) */
    refresh: () => {
      observer?.disconnect()
      observe()
    },
  }
}
