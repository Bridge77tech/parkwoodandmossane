import { CornerMark } from './Logo'
import { Picture } from './Picture'

export function Hero() {
  return (
    <section className="section hero" id="home" data-nav="hero" data-tone="dark">
      <Picture
        name="hero/hero-sky"
        mobile="hero/hero-sky-mobile"
        sizes="2000px"
        className="hero__sky"
        priority
      />
      <div className="hero__statue">
        <Picture
          name="hero/scales-of-justice"
          sizes="(min-width: 1441px) 24vw, 352px"
          alt="Bronze statue of Lady Justice holding scales"
          priority
        />
      </div>
      {/* The white frame around the statue, running off the bottom edge. */}
      <div className="hero__frame" aria-hidden />

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
  )
}
