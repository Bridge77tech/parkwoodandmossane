import type { CSSProperties } from 'react'

import images from '../images.generated.json'

const MOBILE_MEDIA = '(max-width: 760px)'
const FORMATS = [
  { ext: 'avif', type: 'image/avif' },
  { ext: 'webp', type: 'image/webp' },
] as const

type PictureProps = {
  // Image name from scripts/optimize_images.py, e.g. "services/service-1".
  name: keyof typeof images
  // How wide the image displays, for picking a size (the `sizes` attribute).
  sizes: string
  // A phone-only crop to use instead (also from the optimizer), e.g. "hero/hero-sky-mobile".
  mobile?: string
  alt?: string
  title?: string
  className?: string
  style?: CSSProperties
  // Above-the-fold images load immediately at high priority; the rest lazily.
  priority?: boolean
}

// An optimized image: AVIF where supported, else WebP, at the size that suits
// the screen — so nothing downloads more pixels than it can show.
export function Picture({ name, sizes, mobile, alt = '', title, className, style, priority = false }: PictureProps) {
  const widths = images[name]
  const srcSet = (ext: string) => widths.map((width) => `/assets/${name}-${width}.${ext} ${width}w`).join(', ')
  const largest = widths[widths.length - 1]

  return (
    <picture>
      {mobile &&
        FORMATS.map(({ ext, type }) => (
          <source key={`m-${ext}`} media={MOBILE_MEDIA} type={type} srcSet={`/assets/${mobile}.${ext}`} />
        ))}
      {FORMATS.map(({ ext, type }) => (
        <source key={ext} type={type} srcSet={srcSet(ext)} sizes={sizes} />
      ))}
      <img
        src={`/assets/${name}-${largest}.webp`}
        alt={alt}
        title={title}
        className={className}
        style={style}
        draggable={false}
        decoding="async"
        loading={priority ? 'eager' : 'lazy'}
        {...(priority ? { fetchpriority: 'high' } : {})}
      />
    </picture>
  )
}
