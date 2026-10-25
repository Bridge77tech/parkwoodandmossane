import { Children, useRef, type ReactNode } from 'react'

import { scrollEffectsEnabled, useScrollFrame } from '../hooks/useScrollFrame'
import { arrivalOf, getTimeline, progress } from '../timeline'

// Stacks each child as a full-screen layer in one pinned stage and moves the
// layers along the page's scroll timeline (see timeline.ts): after the hero
// reveal, each screen simply scrolls in beneath the previous one, which scrolls
// away with it, and then scrolls through any overflow of its own.
export function Screens({ children }: { children: ReactNode }) {
  const trackRef = useRef<HTMLElement>(null)

  useScrollFrame(() => {
    const track = trackRef.current
    const timeline = getTimeline()
    if (!track || !timeline) return

    if (!scrollEffectsEnabled()) {
      track.style.height = ''
      timeline.layers.forEach((layer) => layer.removeAttribute('style'))
      return
    }

    // The track's height is the scroll distance of the whole timeline.
    const height = `${timeline.screen + timeline.total}px`
    if (track.style.height !== height) track.style.height = height

    const last = timeline.layers.length - 1
    timeline.layers.forEach((layer, index) => {
      const overflow = Math.max(0, layer.offsetHeight - timeline.screen)
      const ownScroll = progress(timeline, 'scroll', index) * overflow
      const arrived = index === 0 ? 1 : progress(timeline, arrivalOf(index), index)
      // How far the next screen has scrolled in (pushing this one up with it).
      const next = index < last ? progress(timeline, arrivalOf(index + 1), index + 1) : 0

      const y = arrived < 1 ? timeline.screen * (1 - arrived) : -ownScroll - next * timeline.screen
      layer.style.transform = `translate3d(0, ${y}px, 0)`
      // Skip painting screens that are still below or already gone.
      layer.style.visibility = arrived === 0 || next === 1 ? 'hidden' : ''
    })
  })

  return (
    <main className="screens-track" ref={trackRef}>
      <div className="screens-stage">
        {Children.map(children, (child) => (
          <div className="screen-layer">{child}</div>
        ))}
      </div>
    </main>
  )
}
