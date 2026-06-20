import { describe, it, expect, beforeAll } from 'vitest'

// Guards against SILENT fallback: if dynamic subsetting throws at runtime (e.g. the harfbuzz
// wasm fails to resolve when bundled), the route degrades to the static subset and rare chars
// tofu again — while every pixel-regression test still passes (common chars look identical).
// The route flags the mode via the x-tablet-font header; here we assert it's 'dynamic'.
// Needs `npm run dev`. Gated behind ATLANTA_VISUAL=1.

const BASE = process.env.OG_BASE || 'http://localhost:3000'

async function fontSource(url: string): Promise<string | null> {
  const res = await fetch(url)
  expect(res.ok, `render failed: ${res.status}`).toBe(true)
  await res.arrayBuffer() // drain
  return res.headers.get('x-tablet-font')
}

describe('font source is dynamic, never silently fallback (D.2)', () => {
  beforeAll(async () => {
    try {
      await fetch(BASE)
    } catch {
      throw new Error(`Dev server not reachable at ${BASE}. Run \`npm run dev\` first.`)
    }
  })

  it('default path uses the dynamic subset', async () => {
    const src = await fontSource(`${BASE}/api/og/tablet?type=deceased&name=${encodeURIComponent('梁奧敏')}`)
    expect(src).toBe('dynamic')
  })

  it('atlanta path uses the dynamic subset', async () => {
    const url = `${BASE}/api/og/tablet?variant=atlanta&type=longevity&name=${encodeURIComponent('梁敏奧')}&family=1`
    expect(await fontSource(url)).toBe('dynamic')
  })
})
