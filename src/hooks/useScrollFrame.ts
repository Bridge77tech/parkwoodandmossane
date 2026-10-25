import { useEffect, useRef } from 'react'

export const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

// Smoothstep between edge0 and edge1.
export const ease = (value: number, edge0 = 0, edge1 = 1) => {
  const t = clamp01((value - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Runs `callback` at most once per animation frame while the page scrolls or
// resizes, plus once on mount. Write styles directly in the callback rather than
// setting state, so scroll-driven animation doesn't re-render React.
export function useScrollFrame(callback: () => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    let frame = 0
    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        callbackRef.current()
      })
    }
    callbackRef.current()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])
}
