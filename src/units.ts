// Design pixels → rem, so inline sizes scale with the root size unit (--u).
export const rem = (px: number) => `${px / 16}rem`

// Current size of one design pixel in CSS pixels (1 up to 1440×800, larger beyond).
export const designPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) / 16
