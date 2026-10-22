import { clamp01 } from './hooks/useScrollFrame'

// The whole page is one pinned stage of stacked screens ("layers"), driven by a
// single scroll timeline. Lengths are in screen heights:
//   1 → 2  the hero frame grows to reveal screen 2           REVEAL_SCREENS
//   2 → 3  screen 3 rises over screen 2 (its cards part)      CARD_SPREAD_SCREENS
//   3 → 4  Practice rises over screen 3                       COVER_SCREENS
//   4 → 5  the footer rises over Practice                     COVER_SCREENS
// A screen taller than the browser scrolls through its overflow, at normal
// speed, before the next transition starts.
export const REVEAL_SCREENS = 2.5
export const COVER_SCREENS = 1.5
// Screen 2 → 3 gets longer on desktop, where the card spread crosses a wide row.
const CARD_SPREAD_SCREENS = { desktop: 2.25, mobile: COVER_SCREENS }
const MOBILE_QUERY = '(max-width: 760px)'

type Segment = { kind: 'reveal' | 'scroll' | 'cover'; layer: number; start: number; length: number }

export type Timeline = {
  track: HTMLElement
  layers: HTMLElement[]
  screen: number
  total: number
  segments: Segment[]
  scrolled: number
}

const TRACK = '.screens-track'
const LAYER = '.screen-layer'

// Reads the current layout and scroll position. Pure and cheap, so every
// scroll-driven component can call it on its own frame.
export function getTimeline(): Timeline | null {
  const track = document.querySelector<HTMLElement>(TRACK)
  if (!track) return null
  const layers = Array.from(track.querySelectorAll<HTMLElement>(LAYER))
  const screen = window.innerHeight
  const mobile = window.matchMedia(MOBILE_QUERY).matches
  const coverScreens = (layer: number) =>
    layer === 1 ? CARD_SPREAD_SCREENS[mobile ? 'mobile' : 'desktop'] : COVER_SCREENS

  const segments: Segment[] = []
  let cursor = 0
  const add = (kind: Segment['kind'], layer: number, length: number) => {
    segments.push({ kind, layer, start: cursor, length })
    cursor += length
  }
  layers.forEach((layer, index) => {
    if (index === 0) add('reveal', 0, REVEAL_SCREENS * screen)
    else add('cover', index, coverScreens(index) * screen)
    add('scroll', index, Math.max(0, layer.offsetHeight - screen))
  })

  const scrolled = Math.min(cursor, Math.max(0, -track.getBoundingClientRect().top))
  return { track, layers, screen, total: cursor, segments, scrolled }
}

const segmentOf = (timeline: Timeline, kind: Segment['kind'], layer: number) =>
  timeline.segments.find((segment) => segment.kind === kind && segment.layer === layer)

// Progress (0–1) through one segment.
export function progress(timeline: Timeline, kind: Segment['kind'], layer: number) {
  const segment = segmentOf(timeline, kind, layer)
  if (!segment) return 0
  if (segment.length === 0) return timeline.scrolled >= segment.start ? 1 : 0
  return clamp01((timeline.scrolled - segment.start) / segment.length)
}

// Document scroll position where a layer has fully arrived (for in-page links).
export function arrivalOffset(timeline: Timeline, layer: number) {
  const segment = segmentOf(timeline, layer === 0 ? 'reveal' : 'cover', layer)!
  return timeline.track.offsetTop + segment.start + segment.length
}
