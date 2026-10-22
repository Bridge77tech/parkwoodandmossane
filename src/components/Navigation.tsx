import { useEffect, useState } from 'react'

import { useScrollFrame } from '../hooks/useScrollFrame'
import { designPx } from '../units'
import { Logo } from './Logo'

const PRIMARY_LINKS = [
  { label: 'About Us', href: '#about' },
  { label: 'Our Team', href: '#practice' },
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
]

const SECONDARY_LINKS = [...PRIMARY_LINKS, { label: 'Contact', href: '#contact' }]

// Vertical centre of the fixed nav bars (top 35 + half of 65 design px), and of
// the mobile menu button (top 18 + half of 24).
const NAV_PROBE_Y = 67
const MENU_PROBE_Y = 30
const MOBILE_QUERY = '(max-width: 760px)'

// Two fixed nav bars in the same spot. Each screen declares which one it wants
// with `data-nav="hero" | "light"`, and whether its background is
// `data-tone="dark" | "light"` (for the mobile menu button's colour); the screen
// under the nav decides. Later screens win, since they slide over earlier, pinned ones.
export function Navigation() {
  const [theme, setTheme] = useState<'hero' | 'light'>('hero')
  const [tone, setTone] = useState<'dark' | 'light'>('dark')
  const [menuOpen, setMenuOpen] = useState(false)

  // Lock page scroll and allow Escape while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return
    const root = document.documentElement
    root.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      root.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Read on the following frame, after scroll animations (e.g. the hero reveal)
  // have updated their screens' `data-nav` for this scroll position.
  useScrollFrame(() => {
    requestAnimationFrame(() => {
      const mobile = window.matchMedia(MOBILE_QUERY).matches
      const probe = (mobile ? MENU_PROBE_Y : NAV_PROBE_Y) * designPx()
      let nextTheme: 'hero' | 'light' = 'light'
      let nextTone: 'dark' | 'light' = 'light'
      document.querySelectorAll<HTMLElement>('[data-nav]').forEach((screen) => {
        const rect = screen.getBoundingClientRect()
        if (rect.top <= probe && rect.bottom > probe) {
          nextTheme = screen.dataset.nav === 'hero' ? 'hero' : 'light'
          nextTone = screen.dataset.tone === 'dark' ? 'dark' : 'light'
        }
      })
      setTheme(nextTheme)
      setTone(nextTone)
    })
  })

  const pastHero = theme === 'light'

  return (
    <header>
      <nav className="nav nav--hero" data-visible={!pastHero} aria-hidden={pastHero} aria-label="Primary">
        <a href="#home" className="nav__brand" tabIndex={pastHero ? -1 : undefined}>
          <Logo variant="light" />
        </a>
        <ul className="nav__links">
          {PRIMARY_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} tabIndex={pastHero ? -1 : undefined}>{link.label}</a>
            </li>
          ))}
        </ul>
        <a href="#contact" className="btn btn--pill" tabIndex={pastHero ? -1 : undefined}>
          Visit Us
        </a>
      </nav>

      <nav className="nav nav--scrolled" data-visible={pastHero} aria-hidden={!pastHero} aria-label="Primary">
        <a href="#home" className="nav__brand" tabIndex={pastHero ? undefined : -1}>
          <Logo variant="gray" />
        </a>
        <ul className="nav__links">
          {SECONDARY_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} tabIndex={pastHero ? undefined : -1}>{link.label}</a>
            </li>
          ))}
        </ul>
        <a href="#contact" className="btn btn--pill" tabIndex={pastHero ? undefined : -1}>
          Visit Us
        </a>
      </nav>

      {/* Mobile: the logo and a menu button over every screen. The wordmark is
          white over dark screens and Gray 1 over light ones (cross-faded). */}
      <a href="#home" className="mobile-brand" data-tone={tone} aria-label="Parkwood & Mossane home">
        <Logo variant="light" className="mobile-brand__on-dark" />
        <Logo variant="gray" className="mobile-brand__on-light" />
      </a>

      <button
        type="button"
        className="menu-toggle"
        data-tone={tone}
        aria-label="Open menu"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => setMenuOpen(true)}
      >
        <span className="menu-toggle__icon" aria-hidden />
      </button>

      <div
        className="mobile-menu"
        id="mobile-menu"
        data-open={menuOpen}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="mobile-menu__bar">
          <a href="#home" tabIndex={menuOpen ? undefined : -1} onClick={() => setMenuOpen(false)}>
            <Logo variant="gray" />
          </a>
          <button
            type="button"
            className="mobile-menu__close"
            tabIndex={menuOpen ? undefined : -1}
            onClick={() => setMenuOpen(false)}
          >
            Close
          </button>
        </div>
        <ul className="mobile-menu__links">
          {SECONDARY_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} tabIndex={menuOpen ? undefined : -1} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#contact"
          className="btn btn--brown mobile-menu__cta"
          tabIndex={menuOpen ? undefined : -1}
          onClick={() => setMenuOpen(false)}
        >
          Visit Us
        </a>
      </div>
    </header>
  )
}
