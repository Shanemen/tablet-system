import subsetFont from 'subset-font'

// Per-request dynamic font subsetting (Option B). Replaces the static 723-char subset so ANY
// character a user types renders — no more fallout, no more manual subset maintenance.
//
// Flow: load the full Noto Serif CJK TC ONCE (module-scope cache, decompressed to sfnt so
// per-request subsetting skips woff2 brotli), then per request subset down to just the glyphs
// actually used (~16-34KB) and hand that to @vercel/og / satori.
//
// Hardening (from adversarial review):
//  - Load via fetch(origin) — the SAME mechanism the route already uses for the SVG on the
//    nodejs runtime. Do NOT read public/ via process.cwd()+fs: Vercel does not bundle public/
//    into the serverless lambda, so that throws in prod (silently falling back to tofu) while
//    passing every local test.
//  - SAFE_CHARS seeds every subset with all fixed strings, so fixed text never tofus even if a
//    caller's collected text misses one, and an empty name never yields a 0-glyph font.
//  - On any failure, fall back to the old static subset OTF so the route never hard-fails.

const FULL_FONT_PATH = '/fonts/NotoSerifCJKtc-Regular.woff2'
const FALLBACK_FONT_PATH = '/fonts/NotoSerifTC-Subset.otf'

// Every fixed string rendered across all templates (default fixed text lives in the SVG, but the
// atlanta path renders ALL text via the font). Belt-and-suspenders so fixed text never falls out.
export const SAFE_CHARS =
  '佛光注照佛力超薦長生祿位往生蓮位氏歷代祖先陽上敬薦叩父母闔家之地基主累劫冤親債主'

let fullFontPromise: Promise<Buffer> | null = null

/** Load + decompress the full font once per warm container (keyed by nothing — single deployment). */
function loadFullFont(origin: string): Promise<Buffer> {
  if (!fullFontPromise) {
    fullFontPromise = (async () => {
      const res = await fetch(`${origin}${FULL_FONT_PATH}`)
      if (!res.ok) throw new Error(`full font fetch failed: ${res.status} ${res.statusText}`)
      const woff2 = Buffer.from(await res.arrayBuffer())
      // Decompress woff2 -> sfnt ONCE so each request's subset call skips brotli decompression.
      const fontverter = await import('fontverter')
      return Buffer.from(await fontverter.convert(woff2, 'truetype'))
    })()
    // If the load fails, clear the cache so a later request can retry instead of caching the error.
    fullFontPromise.catch(() => {
      fullFontPromise = null
    })
  }
  return fullFontPromise
}

/** Pure: subset a full-font buffer down to the glyphs used by `text` (+ the fixed strings). */
export async function subsetForText(fullFont: Buffer, text: string): Promise<Buffer> {
  const distinct = [...new Set(SAFE_CHARS + text)].join('')
  return subsetFont(fullFont, distinct, { targetFormat: 'truetype' })
}

export interface SubsetResult {
  data: ArrayBuffer
  /** 'dynamic' = real per-request subset of the full font; 'fallback' = the old static subset
   *  (a degraded mode that still tofus rare chars — must NOT happen in normal operation). */
  source: 'dynamic' | 'fallback'
}

/** Runtime entry: returns a tiny per-request subset of the full font covering `text`.
 *  Falls back to the static subset OTF on any failure so the route never hard-fails. The
 *  `source` lets the route flag silent fallback (a header) so a test can catch it. */
export async function getSubsetFont(origin: string, text: string): Promise<SubsetResult> {
  try {
    const full = await loadFullFont(origin)
    const out = await subsetForText(full, text)
    return { data: out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength) as ArrayBuffer, source: 'dynamic' }
  } catch (e) {
    console.error('[dynamic-subset] falling back to static subset:', e)
    const res = await fetch(`${origin}${FALLBACK_FONT_PATH}`)
    return { data: await res.arrayBuffer(), source: 'fallback' }
  }
}
