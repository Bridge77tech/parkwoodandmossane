import { CornerMark } from './Logo'
import { ServiceCarousel } from './ServiceCarousel'

export function Services() {
  return (
    <section className="section screen services" id="about">
      <div className="container services__content">
        <h2 className="section-title services__title">
          Here to help <em>YOU</em> succeed
        </h2>
        <p className="services__copy">
          At Parkwood &amp; Mossane, we are committed to delivering legal services grounded in
          integrity, sincerity, and excellence. We recognise the value of our clients’ time and
          pursue every matter with diligence, efficiency, and a results-driven approach, ensuring
          that their interests are served with the utmost care and timeliness.
        </p>
        <a href="#contact" className="btn btn--black">Talk to us</a>

        <ServiceCarousel />
      </div>
      <CornerMark />
    </section>
  )
}
