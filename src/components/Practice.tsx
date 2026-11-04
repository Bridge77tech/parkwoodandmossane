import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { CornerMark } from './Logo'
import { Picture } from './Picture'

// Reveal order for a line.
const line = (index: number) => ({ '--line': index }) as CSSProperties

export function Practice() {
  const sectionRef = useRef<HTMLElement>(null)
  const [revealed, setRevealed] = useState(false)

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
        <Picture name="practice/lawyers" mobile="practice/lawyers-mobile" sizes="103vw" />
      </div>
      <div className="practice__fade" aria-hidden />
      <CornerMark />

      <div className="container practice__content">
        <p className="reveal-line practice__tag" style={line(0)}>The Right People on Your Side</p>
        <h2 className="section-title practice__title">
          <span className="reveal-line" style={line(1)}>Trusted Counsel, Ready When You Are</span>
        </h2>
        <p className="reveal-line practice__copy" style={line(2)}>
          Skilled, approachable lawyers with one goal: getting you the right result. Our team
          brings the experience and care your matter deserves. Get in touch today.
        </p>
        <div className="reveal-line practice__cta-wrap" style={line(3)}>
          <a href="#contact" className="btn btn--brown practice__cta">Reach out to us</a>
        </div>
      </div>
    </section>
  )
}
