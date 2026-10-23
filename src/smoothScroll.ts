import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

import { prefersReducedMotion, scrollEffectsEnabled } from './hooks/useScrollFrame'
import { arrivalOffset, getTimeline } from './timeline'

// Where an in-page link should land: the point in the scroll timeline where
// the target's screen has fully arrived (screens are stacked layers, so their
// document positions don't say where they appear).
function anchorTarget(target: HTMLElement): number | HTMLElement {
  const timeline = getTimeline()
  const layer = target.closest<HTMLElement>('.screen-layer')
  if (!timeline || !layer || !scrollEffectsEnabled()) return target
  if (target.closest('.hero')) return 0
  return arrivalOffset(timeline, timeline.layers.indexOf(layer))
}

// Smooths wheel/trackpad scrolling so scroll-driven animations glide rather
// than jump. Lenis drives the real window scroll, so existing scroll listeners
// keep working unchanged.
export function startSmoothScroll() {
  if (prefersReducedMotion()) return

  // Site-wide scroll feel: each wheel notch travels 80% of the browser default
  // and eases in over roughly half a second — calm, but not sluggish.
  const lenis = new Lenis({ lerp: 0.075, wheelMultiplier: 0.8 })

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
    lenis.scrollTo(anchorTarget(target), {
      duration: 1.8,
      easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
    })
    history.replaceState(null, '', `#${id}`)
  })
}
