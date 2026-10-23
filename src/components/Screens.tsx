import { Children, useRef, type ReactNode } from 'react'

import { scrollEffectsEnabled, useScrollFrame } from '../hooks/useScrollFrame'
import { getTimeline, progress } from '../timeline'

// How far a screen eases back while the next one rises over it.
const COVERED_SCALE = 0.95

// Stacks each child as a full-screen layer in one pinned stage and moves the
// layers along the page's scroll timeline (see timeline.ts): each new screen
// rises over the previous one, which eases back, then scrolls through any
// overflow of its own.
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
      const arrived = index === 0 ? 1 : progress(timeline, 'cover', index)
      const coveredBy = index < last ? progress(timeline, 'cover', index + 1) : 0

      const y = arrived < 1 ? timeline.screen * (1 - arrived) : -ownScroll
      const scale = 1 - (1 - COVERED_SCALE) * coveredBy
      layer.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`
      // Skip painting screens that are still below or fully covered.
      layer.style.visibility = arrived === 0 || coveredBy === 1 ? 'hidden' : ''
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
