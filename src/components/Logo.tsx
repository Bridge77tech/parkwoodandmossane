type LogoProps = {
  variant: 'light' | 'dark' | 'gray'
  className?: string
}

// The Parkwood & Mossane mark: two pillar halves plus a two-line wordmark,
// positioned with the insets from the Figma logo frame.
export function Logo({ variant, className }: LogoProps) {
  const base = `/assets/logo/${variant}`
  return (
    <span className={`logo ${className ?? ''}`} role="img" aria-label="Parkwood & Mossane">
      <img className="logo__wordmark-top" src={`${base}-wordmark-top.svg`} alt="" />
      <img className="logo__wordmark-bottom" src={`${base}-wordmark-bottom.svg`} alt="" />
      <img className="logo__pillar-left" src={`${base}-pillar-left.svg`} alt="" />
      <img className="logo__pillar-right" src={`${base}-pillar-right.svg`} alt="" />
    </span>
  )
}

// Small "PARKWOOD & MOSSANE" wordmark pinned to the bottom-right of every section.
export function CornerMark() {
  return (
    <div className="corner-mark" aria-hidden>
      <img className="corner-mark__top" src="/assets/logo/corner-mark-top.svg" alt="" width="68.3604" height="7.09096" />
      <img className="corner-mark__bottom" src="/assets/logo/corner-mark-bottom.svg" alt="" width="46.92" height="6.89063" />
    </div>
  )
}
