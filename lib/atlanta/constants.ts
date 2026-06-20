// Atlanta tablet — shared layout constants.
// All values are in the TRUE 320x848 coordinate space (same as prototypes/atlanta/*.html).
// Sourced verbatim from the mockups' :root CSS variables. Only :root vars / makeTablet code
// are authoritative — NOT the stale comments inside the HTML.

/** Center band: x 80..240 (clear zone between the 卍 side rails), y 195..716 (canopy..lotus). */
export const BAND = { x: 80, width: 160, top: 195, bottom: 716 } as const
/** band height = 716 - 195 = 521 (ancestors uniform-size divisor uses 521 - 24). */
export const BAND_H = BAND.bottom - BAND.top

/** Unified fixed-text size across all 6 types (--fixed-size). */
export const FIXED_SIZE = 32
/** Fixed text weight (--fixed-weight); dynamic text renders at 400. */
export const FIXED_WEIGHT = 500
export const DYNAMIC_WEIGHT = 400
/** Ink color (--ink), near-black for b/w print. */
export const INK = '#2b2620'

/** Horizontal center of the whole tablet / center band. */
export const CENTER_X = BAND.x + BAND.width / 2 // 160

/** Left petitioner margin column (OUTSIDE the 卍 rail). */
export const LEFT = {
  x: 30,
  size: 20,
  yangTop: 215, // 陽上 anchored here
  jianTop: 676, // bottom label (敬薦/叩薦) anchored here = 716 - 2*20 (bottom-aligned to lotus)
  gap: 8,
} as const

/** Atlanta uses ANY latin letter to switch to horizontal/latin layout (mockup isLatin). */
export function isLatin(s: string): boolean {
  return /[A-Za-z]/.test(s)
}
