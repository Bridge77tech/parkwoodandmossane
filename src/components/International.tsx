import { useState } from 'react'

import { CornerMark } from './Logo'
import { REGIONS, RegionCarousel } from './RegionCarousel'

// The buttons sit Francophone-first in the design, so look slides up by id.
const REGION_BUTTONS = [
  { id: 'francophone', label: 'Francophone West Africa' },
  { id: 'anglophone', label: 'Anglophone West Africa' },
] as const

export function International() {
  const [active, setActive] = useState(0)

  return (
    <section className="section screen international" id="international" data-nav="hero" data-tone="dark">
      <div className="international__sky" aria-hidden>
        <img src="/assets/international/clouds-bg.jpg" alt="" />
      </div>

      <div className="container international__content">
        <h2 className="section-title international__title">We are international</h2>
        <p className="international__copy">
          Our reach extends across Africa, where we provide tailored legal and business solutions
          to multinational clients, navigating diverse legal frameworks and commercial environments
          across the continent.
        </p>

        <RegionCarousel active={active} onChange={setActive} />

        <div className="international__regions">
          {REGION_BUTTONS.map((button) => {
            const index = REGIONS.findIndex((region) => region.id === button.id)
            return (
              <button
                key={button.id}
                type="button"
                className="btn btn--glass"
                aria-pressed={index === active}
                onClick={() => setActive(index)}
              >
                {button.label}
              </button>
            )
          })}
        </div>
      </div>
      <CornerMark />
    </section>
  )
}
