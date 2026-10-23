import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { useMeasuredLines } from '../hooks/useMeasuredLines'
import { rem } from '../units'
import { CornerMark } from './Logo'
import { Picture } from './Picture'

type Client = {
  src: string
  cellWidth: number
  width: number
  height: number
  left: number
  top: number
  maskPosition: string
  maskSize: string
  blend?: boolean
}

const CLIENTS: Client[] = [
  { src: 'client-1.png', cellWidth: 94.118, width: 71.743, height: 38.324, left: 6.49, top: 6.85, maskPosition: '6.254px 5.212px', maskSize: '109.26px 51.079px' },
  { src: 'client-2.png', cellWidth: 94.118, width: 83.317, height: 40.254, left: 3.18, top: 5.89, maskPosition: '0px 0px', maskSize: '142.197px 68.432px' },
  { src: 'client-3.png', cellWidth: 94.118, width: 84.59, height: 34.089, left: 2.53, top: 8.22, maskPosition: '1.072px 2.146px', maskSize: '142.391px 49.365px' },
  { src: 'client-4.png', cellWidth: 94.118, width: 91.765, height: 37.059, left: 0.69, top: 5.88, maskPosition: '6px -6px', maskSize: '140px 80.31px' },
  { src: 'client-5.png', cellWidth: 94.118, width: 89.412, height: 33.529, left: 1.73, top: 8.3, maskPosition: '-2px 6.461px', maskSize: '154px 41.608px' },
  { src: 'client-6.png', cellWidth: 94.118, width: 99.412, height: 40.588, left: 0.35, top: 6.16, maskPosition: '6px 4.185px', maskSize: '146px 58.885px' },
  { src: 'client-7.png', cellWidth: 94.118, width: 55.882, height: 52.353, left: 11.42, top: 2.42, maskPosition: '14px 9px', maskSize: '65.264px 69.18px' },
  { src: 'client-8.png', cellWidth: 94.118, width: 72.353, height: 62.353, left: 7.96, top: 0.35, maskPosition: '10px 12px', maskSize: '94.711px 77px' },
  { src: 'client-9.png', cellWidth: 94.118, width: 57.143, height: 56.744, left: 11.95, top: 2.15, maskPosition: '7.473px 6.793px', maskSize: '76px 76.084px' },
  { src: 'client-10.png', cellWidth: 94.118, width: 51.607, height: 56.767, left: 12, top: 1.31, maskPosition: '-12.672px -7.798px', maskSize: '116px 116px' },
  { src: 'client-11.png', cellWidth: 193.529, width: 182.052, height: 57.834, left: 6.33, top: 1.34, maskPosition: '7.695px 11.114px', maskSize: '277px 72.67px' },
]

// The design repeats the client set twice (ready for a marquee); the second
// set's last logo uses its own asset with a colour blend.
const CLIENT_SETS: Client[][] = [
  CLIENTS,
  [...CLIENTS.slice(0, -1), { ...CLIENTS[CLIENTS.length - 1]!, src: 'client-12.png', blend: true }],
]

// The client strip is a Figma instance scaled from 160px to 94.118px cells; the
// export scaled the logo boxes but not their masks, so scale those to match.
const INSTANCE_SCALE = 94.118 / 160

const scalePx = (value: string) =>
  value.replace(/(-?[\d.]+)px/g, (_, n) => rem(+(Number(n) * INSTANCE_SCALE).toFixed(3)))

function ClientLogo({ client }: { client: Client }) {
  const maskPosition = scalePx(client.maskPosition)
  const maskSize = scalePx(client.maskSize)
  return (
    <li className="client" style={{ width: rem(client.cellWidth) }}>
      <span
        className="client__logo"
        style={
          {
            width: rem(client.width),
            height: rem(client.height),
            left: rem(client.left),
            top: rem(client.top),
            maskImage: `url("/assets/clients/${client.src}")`,
            WebkitMaskImage: `url("/assets/clients/${client.src}")`,
            maskPosition,
            WebkitMaskPosition: maskPosition,
            maskSize,
            WebkitMaskSize: maskSize,
            mixBlendMode: client.blend ? 'color' : undefined,
          } as CSSProperties
        }
      />
    </li>
  )
}

const QUOTE =
  '"To give real service, you must add something which cannot be bought or measured with money, and that is sincerity and integrity."'

// Reveal order for a line.
const line = (index: number) => ({ '--line': index }) as CSSProperties

export function Practice() {
  const sectionRef = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)
  // The quote reveals line by line as it actually wraps at this width.
  const quote = useMeasuredLines(QUOTE)
  const afterQuote = 2 + quote.lines.length

  // Wipe the copy in line by line once half the screen is showing; reset once it
  // has fully left so it plays again on the next visit.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.5) setRevealed(true)
        else if (!entry.isIntersecting) setRevealed(false)
      },
      { threshold: [0, 0.5] },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      className="section screen practice"
      id="practice"
      ref={sectionRef}
      data-nav="hero"
      data-tone="dark"
      data-revealed={revealed}
    >
      <div className="practice__photo" aria-hidden>
        <Picture name="services/service-1" mobile="services/practice-mobile" sizes="100vw" />
      </div>
      <div className="practice__shade" aria-hidden />
      <CornerMark />
      <div className="practice__fade" aria-hidden />


      <div className="container practice__content">
        <h2 className="section-title practice__title">
          <span className="reveal-line" style={line(0)}>Practice</span>
          <span className="reveal-line" style={line(1)}>Made Perfect</span>
        </h2>
        <blockquote className="practice__quote">
          <p className="measured-lines">
            <span className="measured-lines__measure" ref={quote.measureRef} aria-hidden>
              {quote.words.map((word, index) => (
                <span key={index}>{word} </span>
              ))}
            </span>
            {quote.lines.map((text, index) => (
              <span key={index} className="reveal-line" style={line(2 + index)}>
                {text}
              </span>
            ))}
          </p>
          <footer>
            <span className="reveal-line" style={line(afterQuote)}>— Douglas Adams.</span>
          </footer>
        </blockquote>
        <div className="reveal-line practice__cta-wrap" style={line(afterQuote + 1)}>
          <a href="#contact" className="btn btn--glass practice__cta">Visit Us</a>
        </div>
      </div>

      <p className="practice__clients-label">A few of our clients</p>
      <div className="clients" aria-label="A few of our clients">
        {CLIENT_SETS.map((set, setIndex) => (
          <ul key={setIndex} className="clients__set" aria-hidden={setIndex > 0}>
            {set.map((client) => (
              <ClientLogo key={client.src} client={client} />
            ))}
          </ul>
        ))}
      </div>
    </section>
  )
}
