import { useLayoutEffect, useRef, useState } from 'react'

// Splits `text` into the lines it actually wraps to at the current width, so
// each line can be animated on its own. Render the words inside `measureRef`
// (one span per word, invisible) alongside the returned lines; it re-measures
// whenever the width changes.
export function useMeasuredLines(text: string) {
  const measureRef = useRef<HTMLSpanElement>(null)
  const [lines, setLines] = useState<string[]>([text])

  useLayoutEffect(() => {
    const measure = measureRef.current
    if (!measure) return

    const split = () => {
      const next: string[] = []
      let lastTop: number | null = null
      for (const word of Array.from(measure.children) as HTMLElement[]) {
        const text = (word.textContent ?? '').trim()
        if (word.offsetTop !== lastTop) {
          next.push(text)
          lastTop = word.offsetTop
        } else {
          next[next.length - 1] += ` ${text}`
        }
      }
      setLines((current) => (current.join('\n') === next.join('\n') ? current : next))
    }

    split()
    const observer = new ResizeObserver(split)
    observer.observe(measure)
    return () => observer.disconnect()
  }, [text])

  return { measureRef, lines, words: text.split(' ') }
}
