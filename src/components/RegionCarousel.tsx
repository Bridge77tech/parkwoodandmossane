import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'

import { rem } from '../units'

type Flag = {
  country: string
  src: string
  // Visible flag size inside the glass chip, and its nudge from centre.
  width: number
  height: number
  dx: number
  dy: number
  // Crop of the source image within the visible box, in percent.
  crop: { w: number; h: number; left: number; top: number }
}

export type Region = {
  id: 'anglophone' | 'francophone'
  name: string
  chipHeight: number
  flagsWidth: number
  rowGap: number
  flags: Flag[]
}

const ANGLO_SIZE = { width: 23.111, height: 23.111, dx: -0.08, dy: 0 }
const FRANCO_SIZE = { width: 23, height: 23, dx: -0.25, dy: -0.22 }

export const REGIONS: Region[] = [
  {
    id: 'anglophone',
    name: 'Anglophone',
    chipHeight: 35.556,
    flagsWidth: 132.167,
    rowGap: 8.889,
    flags: [
      { country: 'Ghana', src: 'ghana.png', ...ANGLO_SIZE, crop: { w: 150, h: 150, left: -25, top: -25 } },
      { country: 'Nigeria', src: 'nigeria.png', ...ANGLO_SIZE, crop: { w: 229.39, h: 129.03, left: -66.31, top: -14.52 } },
      { country: 'Sierra Leone', src: 'sierra-leone.png', ...ANGLO_SIZE, crop: { w: 213.33, h: 133.33, left: -56.67, top: -16.67 } },
      { country: 'Liberia', src: 'liberia.png', ...ANGLO_SIZE, dx: -0.25, crop: { w: 215.87, h: 121.43, left: -57.94, top: -10.71 } },
      { country: 'The Gambia', src: 'gambia.png', ...ANGLO_SIZE, width: 22.222, dx: -0.25, crop: { w: 108.23, h: 105.26, left: -3.61, top: -2.63 } },
    ],
  },
  {
    id: 'francophone',
    name: 'Francophone',
    chipHeight: 36,
    flagsWidth: 158,
    rowGap: 9,
    flags: [
      { country: 'Burkina Faso', src: 'burkina-faso.png', ...FRANCO_SIZE, width: 22, dx: 0.31, dy: -0.5, crop: { w: 222.22, h: 146.16, left: -61.11, top: -29.93 } },
      { country: 'Mali', src: 'mali.png', ...FRANCO_SIZE, dx: 0.42, dy: -0.5, crop: { w: 228.83, h: 152.52, left: -64.42, top: -33.75 } },
      { country: 'Benin', src: 'benin.png', ...FRANCO_SIZE, dx: 0.03, dy: -0.5, crop: { w: 228.83, h: 152.69, left: -64.42, top: -33.91 } },
      { country: "Côte d'Ivoire", src: 'cote-d-ivoire.png', ...FRANCO_SIZE, crop: { w: 230.41, h: 152.34, left: -65.21, top: -33.49 } },
      { country: 'Senegal', src: 'senegal.png', ...FRANCO_SIZE, crop: { w: 231.48, h: 153.04, left: -65.74, top: -33.75 } },
      { country: 'Guinea', src: 'guinea.png', ...FRANCO_SIZE, crop: { w: 228.05, h: 128.28, left: -64.77, top: -14.71 } },
      { country: 'Cameroon', src: 'cameroon.png', ...FRANCO_SIZE, crop: { w: 231.48, h: 153.93, left: -65.74, top: -34.18 } },
    ],
  },
]

const SLIDE_INTERVAL_MS = 4500

// Gently cross-fades between the Anglophone and Francophone cards, forever.
// `active` is controlled so the region buttons below the card can drive it too.
export function RegionCarousel({
  active,
  onChange,
}: {
  active: number
  onChange: (index: number) => void
}) {
  const [paused, setPaused] = useState(false)
  const activeRef = useRef(active)
  activeRef.current = active

  const advance = useCallback(() => {
    onChange((activeRef.current + 1) % REGIONS.length)
  }, [onChange])

  useEffect(() => {
    if (paused) return
    // Restart the timer whenever the slide changes so a manual pick gets a full interval.
    const timer = window.setTimeout(advance, SLIDE_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [active, paused, advance])

  return (
    <div
      className="region-card"
      role="region"
      aria-roledescription="carousel"
      aria-label="Regions we cover"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {REGIONS.map((region, index) => (
        <div
          key={region.id}
          className="region-card__slide"
          data-active={index === active}
          aria-hidden={index !== active}
          aria-roledescription="slide"
          aria-label={`${region.name} West Africa`}
        >
          <h3 className="region-card__title">
            <span>{region.name}</span>
            <span>West Africa</span>
          </h3>
          <ul
            className="region-card__flags"
            style={{ width: rem(region.flagsWidth), rowGap: rem(region.rowGap) } as CSSProperties}
          >
            {region.flags.map((flag) => (
              <li key={flag.country} className="flag-chip" style={{ height: rem(region.chipHeight) }}>
                <span
                  className="flag-chip__flag"
                  style={{
                    width: rem(flag.width),
                    height: rem(flag.height),
                    left: `calc(50% + ${rem(flag.dx)})`,
                    top: `calc(50% + ${rem(flag.dy)})`,
                  }}
                >
                  <img
                    src={`/assets/flags/${flag.src}`}
                    alt={flag.country}
                    title={flag.country}
                    style={{
                      width: `${flag.crop.w}%`,
                      height: `${flag.crop.h}%`,
                      left: `${flag.crop.left}%`,
                      top: `${flag.crop.top}%`,
                    }}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="region-card__dots">
        {REGIONS.map((region, index) => (
          <button
            key={region.id}
            type="button"
            className="region-card__dot"
            data-active={index === active}
            aria-label={`Show ${region.name} West Africa`}
            aria-current={index === active}
            onClick={() => onChange(index)}
          />
        ))}
      </div>
    </div>
  )
}
