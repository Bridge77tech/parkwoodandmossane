import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import { prefersReducedMotion } from './hooks/useScrollFrame'

// Smooths wheel/trackpad scrolling site-wide. Lenis drives the real window
// scroll, so scroll listeners (e.g. the nav) keep working unchanged.
export function startSmoothScroll() {
  if (prefersReducedMotion()) return

  // Each wheel notch travels the browser's normal distance and glides in over
  // about 0.4s: smooth, but not slow.
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 })

  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  document.addEventListener('click', (event) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]')
    const id = link?.getAttribute('href')?.slice(1)
    const target = id ? document.getElementById(id) : null
    if (!target) return
    event.preventDefault()
    lenis.scrollTo(target, {
      duration: 1.8,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    })
    history.replaceState(null, '', `#${id}`)
  })
}
