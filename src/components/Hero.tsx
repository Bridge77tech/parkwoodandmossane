import { useRef, type ReactNode } from 'react'

import { ease, prefersReducedMotion, useScrollFrame } from '../hooks/useScrollFrame'
import { getTimeline, progress as timelineProgress } from '../timeline'
import { designPx } from '../units'
import { CornerMark } from './Logo'

// The frame's resting size, how far it hangs below the bottom edge and its
// horizontal offset from centre (desktop vs mobile designs), plus its border and
// corner radius — in design px, scaled by designPx() on large screens.
const FRAME = {
  desktop: { width: 420, height: 420, overhang: 116, offsetX: 10 },
  mobile: { width: 358, height: 420, overhang: 145, offsetX: 0 },
}
const FRAME_BORDER = 5
const FRAME_RADIUS = 12

// The hero and screen 2 share the first layer of the page timeline. During its
// reveal segment, the white frame around the statue grows to fill the screen,
// and screen 2 (`children`) is revealed inside it — so the frame becomes that
// screen rather than the next screen scrolling in.
export function Hero({ children }: { children: ReactNode }) {
  const layerRef = useRef<HTMLDivElement>(null)
  const revealRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)

  useScrollFrame(() => {
    const layer = layerRef.current
    const reveal = revealRef.current
    const frame = frameRef.current
    const timeline = getTimeline()
    if (!layer || !reveal || !frame || !timeline) return

    if (prefersReducedMotion()) {
      frame.removeAttribute('style')
      reveal.removeAttribute('style')
      reveal.dataset.nav = 'light'
      reveal.dataset.tone = 'light'
      return
    }

    const progress = timelineProgress(timeline, 'reveal', 0)
    const grow = ease(progress)

    // Start: the frame resting on the bottom edge of the screen. End: just past every edge.
    const unit = designPx()
    const rest = window.matchMedia('(max-width: 760px)').matches ? FRAME.mobile : FRAME.desktop
    const width = layer.clientWidth
    const height = window.innerHeight
    const lerp = (from: number, to: number) => from + (to - from) * grow
    const left = lerp(width / 2 - (rest.width / 2 - rest.offsetX) * unit, -10)
    const top = lerp(height - (rest.height - rest.overhang) * unit, -10)
    const frameWidth = lerp(rest.width * unit, width + 20)
    const frameHeight = lerp(rest.height * unit, height + 20)
    const radius = FRAME_RADIUS * unit * (1 - grow)

    frame.style.left = `${left}px`
    frame.style.top = `${top}px`
    frame.style.width = `${frameWidth}px`
    frame.style.height = `${frameHeight}px`
    frame.style.borderRadius = `${radius}px`
    // The white border melts away as the frame reaches the edges.
    frame.style.opacity = `${1 - ease(progress, 0.75, 1)}`

    // Clip the next screen to the inside of the frame (inside its 5px border).
    if (grow >= 1) {
      reveal.style.clipPath = 'none'
    } else {
      const inset = (value: number) => `${Math.max(0, value + FRAME_BORDER * unit)}px`
      const right = width - (left + frameWidth)
      const bottom = reveal.offsetHeight - (top + frameHeight)
      reveal.style.clipPath = `inset(${inset(top)} ${inset(right)} ${inset(bottom)} ${inset(left)} round ${radius}px)`
    }
    // Blend: the next screen fades in over the statue, settling from slightly small.
    reveal.style.opacity = `${ease(progress, 0.1, 0.8)}`
    reveal.style.setProperty('--reveal-scale', `${0.92 + 0.08 * grow}`)

    // Hand over to the light nav once the revealed screen is behind it.
    reveal.dataset.nav = grow < 0.72 ? 'hero' : 'light'
    reveal.dataset.tone = grow < 0.72 ? 'dark' : 'light'
  })

  return (
    <div className="hero-layer" ref={layerRef}>
      <section className="section hero" id="home" data-nav="hero" data-tone="dark">
        <img className="hero__sky" src="/assets/hero/hero-sky.png" alt="" />
        <div className="hero__statue">
          <img src="/assets/hero/scales-of-justice.png" alt="Bronze statue of Lady Justice holding scales" />
        </div>

        <div className="container hero__content">
          <h1 className="hero__title">Legal and Beyond</h1>
          <p className="hero__lede">
            Doing business in West Africa requires an experienced and diverse legal team who
            understands the unique cultural, political and commercial climate
          </p>
          <a href="#contact" className="btn btn--brown">Reach out to us</a>
        </div>

        <CornerMark />
      </section>

      <div className="hero-reveal" ref={revealRef} data-nav="hero" data-tone="dark">
        {children}
      </div>

      <div className="hero__frame" ref={frameRef} aria-hidden />
    </div>
  )
}
