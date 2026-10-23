import { useEffect, useRef, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'

import { ease, prefersReducedMotion, scrollEffectsEnabled, useScrollFrame } from '../hooks/useScrollFrame'
import { getTimeline, progress } from '../timeline'
import { designPx, rem } from '../units'
import type images from '../images.generated.json'
import { Picture } from './Picture'

type Service = {
  title: string
  image: keyof typeof images
  cardHeight: number
  imageWidth: number
  imageHeight: number
  tint?: boolean
}

// Card heights and image crops follow the staggered layout in the design.
const SERVICES: Service[] = [
  { title: 'Compliance & risk assessments', image: 'services/service-1', cardHeight: 205, imageWidth: 158, imageHeight: 225.714, tint: true },
  { title: 'Private wealth management', image: 'services/service-2', cardHeight: 210, imageWidth: 150.035, imageHeight: 225.109, tint: true },
  { title: 'International business law', image: 'services/service-3', cardHeight: 220, imageWidth: 169, imageHeight: 300, tint: true },
  { title: 'Corporate & commercial law', image: 'services/service-4', cardHeight: 230, imageWidth: 153.295, imageHeight: 230, tint: true },
  { title: 'Intellectual property rights', image: 'services/service-5', cardHeight: 220, imageWidth: 183.954, imageHeight: 276, tint: true },
  { title: 'Construction law', image: 'services/service-6', cardHeight: 210, imageWidth: 200, imageHeight: 300 },
  { title: 'Real property law', image: 'services/service-7', cardHeight: 205, imageWidth: 166.625, imageHeight: 250, tint: true },
]

// Three copies of the set: the middle one rests where the design places the
// cards, and the offset wraps by one set so the loop never shows an edge.
const COPIES = 3
// Auto-scroll speed, in design px per second.
const DRIFT_SPEED = 24
// How quickly a flick's momentum dies away (fraction of speed left after 1s).
const MOMENTUM_DECAY = 0.04

type Motion = {
  offset: number
  velocity: number
  glide: number
  dragging: boolean
  hovering: boolean
  lastX: number
  lastTime: number
  spread: number
}

// The services cards as an endless carousel: it drifts left on its own, and
// can be dragged or swiped, moved with a sideways trackpad gesture, or stepped
// with the arrow keys. While the next screen rises over this one it freezes and
// the cards part: those left of centre slide left, those right slide right,
// and the one nearest the centre sinks back into the page.
export function ServiceCarousel() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLUListElement>(null)
  const motion = useRef<Motion>({
    offset: Number.NaN,
    velocity: 0,
    glide: 0,
    dragging: false,
    hovering: false,
    lastX: 0,
    lastTime: 0,
    spread: 0,
  })

  // Animation loop: drift, momentum, keyboard glide and wrapping.
  useEffect(() => {
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const track = trackRef.current
      const state = motion.current
      if (!track) return
      // Nothing to animate while this screen is covered by the next one.
      if (track.closest<HTMLElement>('.screen-layer')?.style.visibility === 'hidden') return

      // One loop period: from a card to the same card in the next copy (gap included).
      const cards = track.children as HTMLCollectionOf<HTMLElement>
      const setWidth = cards[SERVICES.length]!.offsetLeft - cards[0]!.offsetLeft
      if (!setWidth) return
      if (Number.isNaN(state.offset)) state.offset = -setWidth

      if (state.spread === 0 && !state.dragging) {
        if (Math.abs(state.velocity) > 1) {
          state.offset += state.velocity * dt
          state.velocity *= MOMENTUM_DECAY ** dt
        } else {
          state.velocity = 0
        }
        if (Math.abs(state.glide) > 0.5) {
          const step = state.glide * Math.min(1, dt * 8)
          state.offset += step
          state.glide -= step
        } else {
          state.glide = 0
        }
        const idle = !state.hovering && state.velocity === 0 && state.glide === 0
        if (idle && !prefersReducedMotion()) state.offset -= DRIFT_SPEED * designPx() * dt
      }

      while (state.offset > -setWidth * 0.5) state.offset -= setWidth
      while (state.offset < -setWidth * 1.5) state.offset += setWidth
      track.style.transform = `translate3d(${state.offset}px, 0, 0)`
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Sideways trackpad gestures move the carousel instead of the page.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || motion.current.spread > 0) return
      event.preventDefault()
      motion.current.offset -= event.deltaX
      motion.current.velocity = 0
    }
    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [])

  // The card spread, driven by the page timeline (screen 3 is layer 1).
  useScrollFrame(() => {
    const track = trackRef.current
    const timeline = getTimeline()
    if (!track || !timeline) return
    const cards = Array.from(track.children) as HTMLElement[]
    const spread = scrollEffectsEnabled() ? ease(progress(timeline, 'cover', 1)) : 0
    motion.current.spread = spread

    if (spread === 0) {
      cards.forEach((card) => {
        card.style.transform = ''
        card.style.opacity = ''
      })
      return
    }

    // Classify cards by where they sit now (the carousel is frozen meanwhile).
    const trackLeft = track.getBoundingClientRect().left
    const centre = window.innerWidth / 2
    const offsets = cards.map((card) => trackLeft + card.offsetLeft + card.offsetWidth / 2 - centre)
    const middle = offsets.reduce((best, dx, index) => (Math.abs(dx) < Math.abs(offsets[best]!) ? index : best), 0)
    const distance = window.innerWidth / 2 + 100

    cards.forEach((card, index) => {
      if (index === middle) {
        card.style.transform = `perspective(1000px) translateZ(${-1200 * spread}px)`
        card.style.opacity = `${1 - 0.85 * spread}`
      } else {
        card.style.transform = `translateX(${Math.sign(offsets[index]!) * distance * spread}px)`
        card.style.opacity = ''
      }
    })
  })

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const state = motion.current
    if (state.spread > 0 || (event.pointerType === 'mouse' && event.button !== 0)) return
    state.dragging = true
    state.velocity = 0
    state.glide = 0
    state.lastX = event.clientX
    state.lastTime = event.timeStamp
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.dataset.dragging = 'true'
  }

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const state = motion.current
    if (!state.dragging) return
    const dx = event.clientX - state.lastX
    const dt = (event.timeStamp - state.lastTime) / 1000
    state.offset += dx
    if (dt > 0) state.velocity = 0.8 * (dx / dt) + 0.2 * state.velocity
    state.lastX = event.clientX
    state.lastTime = event.timeStamp
  }

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const state = motion.current
    if (!state.dragging) return
    state.dragging = false
    // A drag that stopped before release shouldn't fling.
    if (event.timeStamp - state.lastTime > 80) state.velocity = 0
    event.currentTarget.dataset.dragging = 'false'
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const card = trackRef.current?.firstElementChild as HTMLElement | null
    if (!card) return
    event.preventDefault()
    const step = card.offsetWidth + 20 * designPx()
    motion.current.velocity = 0
    motion.current.glide += event.key === 'ArrowLeft' ? step : -step
  }

  return (
    <div
      className="services__carousel"
      ref={viewportRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Our services"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(event) => event.pointerType === 'mouse' && (motion.current.hovering = true)}
      onPointerLeave={() => (motion.current.hovering = false)}
      onKeyDown={onKeyDown}
    >
      <ul className="services__cards" id="services" ref={trackRef}>
        {Array.from({ length: COPIES }, (_, copy) =>
          SERVICES.map((service) => (
            <li
              key={`${copy}-${service.title}`}
              className="service-card"
              aria-hidden={copy !== 1 || undefined}
              style={
                {
                  '--card-h': rem(service.cardHeight),
                  '--img-w': rem(service.imageWidth),
                  '--img-h': rem(service.imageHeight),
                } as CSSProperties
              }
            >
              <Picture
                name={service.image}
                sizes="(min-width: 1441px) 14vw, 200px"
                className="service-card__image"
              />
              {service.tint && <span className="service-card__tint" aria-hidden />}
              <span className="service-card__blur" aria-hidden />
              <span className="service-card__title">{service.title}</span>
            </li>
          )),
        )}
      </ul>
    </div>
  )
}
