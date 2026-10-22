import { type FormEvent, useState } from 'react'

import { CornerMark, Logo } from './Logo'

const QUICK_LINKS = [
  { label: 'About Us', href: '#about' },
  { label: 'Our Team', href: '#practice' },
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Contact', href: '#contact' },
]

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  { label: 'X.com', href: 'https://x.com/' },
  { label: 'Facebook', href: 'https://www.facebook.com/' },
]

export function Footer() {
  const [email, setEmail] = useState('')

  // No backend yet — hand the address to the user's mail client instead.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!email) return
    window.location.href = `mailto:consult@parkwoodmossane.com?subject=${encodeURIComponent(
      'Please reach out',
    )}&body=${encodeURIComponent(`Please contact me at ${email}`)}`
  }

  return (
    <footer className="section screen footer" id="contact" data-nav="light" data-tone="light" role="contentinfo">
      <div className="container footer__content">
        <h2 className="footer__title">Here to Help You</h2>

        <form className="footer__form" onSubmit={handleSubmit}>
          <label htmlFor="footer-email" className="visually-hidden">Email address</label>
          <input
            id="footer-email"
            type="email"
            required
            placeholder="Enter your email and we will reach out"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" className="footer__submit">Enter</button>
        </form>

        <div className="footer__grid">
          <div className="footer__brand">
            <Logo variant="dark" className="logo--large" />
            <p className="footer__email">
              Send an email anytime!{' '}
              <a href="mailto:consult@parkwoodmossane.com">consult@parkwoodmossane.com</a>
            </p>
          </div>

          <nav className="footer__links" aria-label="Quick links">
            <p className="footer__label">Quick links</p>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <address className="footer__contact">
            <p className="footer__label">Reach out to us</p>
            <p>No.7 Adjah Adjonton, near Trinity Theological Seminary, East Legon</p>
            <a href="tel:+233551600011">+233 55 160 0011</a>
          </address>
        </div>

        <picture>
          <source media="(max-width: 760px)" srcSet="/assets/footer/dashed-line-mobile.svg" />
          <img className="footer__rule" src="/assets/footer/dashed-line.svg" alt="" width="1166" height="1" />
        </picture>

        <div className="footer__bottom">
          <p>
            <span className="muted">Copyright</span> 2026 Parkwood &amp; Mossane
          </p>
          <p className="footer__social">
            <span className="muted">Connect with us</span>
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </p>
        </div>
      </div>
      <CornerMark />
    </footer>
  )
}
