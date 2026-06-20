import { describe, it, expect, beforeAll } from 'vitest'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'
import { FIXTURES, fixtureUrl, type VisualFixture } from '../visual/fixtures'

// D.1 — DEFAULT-temple regression gate.
//
// Proves that an Atlanta step did NOT change any other temple's output: for each
// fixture (rendered with NO `variant` param), the live render must be pixel-identical
// to the captured golden (tests/baseline/<key>.png).
//
// Requires a running dev server (the OG route fetches its SVG/font via request origin)
// and a captured baseline. Gated behind ATLANTA_VISUAL=1 so plain `npm test` stays fast:
//   1. npm run dev
//   2. node scripts/capture-golden.mjs   (once, on pristine code)
//   3. ATLANTA_VISUAL=1 npm test
//
// IMPORTANT (blueprint fix #5): the golden is only valid against the same shared
// assets (font/SVG). Re-capture whenever a shared asset legitimately changes (Step 8).

const BASE = process.env.OG_BASE || 'http://localhost:3000'
const BASELINE_DIR = path.resolve('tests/baseline')

async function decode(buf: Buffer): Promise<PNG> {
  return PNG.sync.read(buf)
}

describe('default-temple regression (D.1)', () => {
  beforeAll(async () => {
    // Fail fast with a clear message if the dev server isn't up.
    try {
      await fetch(BASE)
    } catch {
      throw new Error(`Dev server not reachable at ${BASE}. Run \`npm run dev\` first.`)
    }
  })

  it.each(FIXTURES)('$key is pixel-identical to golden', async (f: VisualFixture) => {
    const goldenPath = path.join(BASELINE_DIR, `${f.key}.png`)
    let goldenBuf: Buffer
    try {
      goldenBuf = await readFile(goldenPath)
    } catch {
      throw new Error(`Missing golden ${goldenPath}. Run \`node scripts/capture-golden.mjs\` on pristine code first.`)
    }

    const res = await fetch(fixtureUrl(BASE, f))
    expect(res.ok, `render failed: ${res.status}`).toBe(true)
    const liveBuf = Buffer.from(await res.arrayBuffer())

    const golden = await decode(goldenBuf)
    const live = await decode(liveBuf)
    expect(live.width).toBe(golden.width)
    expect(live.height).toBe(golden.height)

    const diff = pixelmatch(golden.data, live.data, undefined, golden.width, golden.height, { threshold: 0 })
    expect(diff, `${diff} pixels differ from golden`).toBe(0)
  })
})
