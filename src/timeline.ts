import { clamp01 } from './hooks/useScrollFrame'

// The whole page is one pinned stage of stacked screens ("layers"), driven by a
// single scroll timeline:
//   reveal  1 → 2  the hero frame grows to reveal screen 2 (REVEAL_SCREENS long)
//   flow    after  plain scrolling: each screen follows the last, 1:1 with scroll
// Lengths are in screen heights. A screen taller than the browser scrolls
// through its overflow before the next one follows.
export const REVEAL_SCREENS = 0.5

type Arrival = 'reveal' | 'flow'
type Segment = { kind: Arrival | 'scroll'; layer: number; start: number; length: number }

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

  const segments: Segment[] = []
  let cursor = 0
  const add = (kind: Segment['kind'], layer: number, length: number) => {
    segments.push({ kind, layer, start: cursor, length })
    cursor += length
  }
  layers.forEach((layer, index) => {
    if (arrivalOf(index) === 'reveal') add('reveal', 0, REVEAL_SCREENS * screen)
    else add('flow', index, screen)
    add('scroll', index, Math.max(0, layer.offsetHeight - screen))
  })

  const scrolled = Math.min(cursor, Math.max(0, -track.getBoundingClientRect().top))
  return { track, layers, screen, total: cursor, segments, scrolled }
}

// How a layer arrives: the first is revealed, the rest scroll in normally.
export const arrivalOf = (layer: number): Arrival => (layer === 0 ? 'reveal' : 'flow')

const segmentOf = (timeline: Timeline, kind: Segment['kind'], layer: number) =>
  timeline.segments.find((segment) => segment.kind === kind && segment.layer === layer)

// Progress (0–1) through one segment, at the current scroll position or at
// `scrollY` (a document scroll position).
export function progress(timeline: Timeline, kind: Segment['kind'], layer: number, scrollY?: number) {
  const segment = segmentOf(timeline, kind, layer)
  if (!segment) return 0
  const scrolled = scrollY === undefined ? timeline.scrolled : scrollY - timeline.track.offsetTop
  if (segment.length === 0) return scrolled >= segment.start ? 1 : 0
  return clamp01((scrolled - segment.start) / segment.length)
}

// Document scroll position where a layer has fully arrived (for in-page links).
export function arrivalOffset(timeline: Timeline, layer: number) {
  const segment = segmentOf(timeline, arrivalOf(layer), layer)!
  return timeline.track.offsetTop + segment.start + segment.length
}
