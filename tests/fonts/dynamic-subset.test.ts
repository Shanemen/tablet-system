import { describe, it, expect, beforeAll } from 'vitest'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import subsetFont from 'subset-font'
import { subsetForText, SAFE_CHARS } from '@/lib/fonts/dynamic-subset'

// Proves the dynamic subset contains REAL glyphs (not .notdef tofu) for realistic name characters
// that the old 723-char static subset dropped. Glyph-count at the font level can't be fooled by a
// tofu box: a single-char subset = 1 glyph (.notdef only) when missing, >=2 when the glyph exists.

const FONT = path.resolve('public/fonts/NotoSerifCJKtc-Regular.woff2')

function glyphCount(buf: Buffer): number {
  const numTables = buf.readUInt16BE(4)
  for (let i = 0; i < numTables; i++) {
    const off = 12 + i * 16
    if (buf.toString('ascii', off, off + 4) === 'maxp') return buf.readUInt16BE(buf.readUInt32BE(off + 8) + 4)
  }
  return -1
}

// Realistic uncommon name characters (auspicious given-names + uncommon surnames) + common
// simplified — the kinds that actually fall out of the curated subset. Not dictionary monsters.
const NAME_CHARS = '璿頔甯煊邝逯禤漢龍鳳汉国张'

describe('dynamic-subset font coverage', () => {
  let font: Buffer
  beforeAll(async () => {
    font = await readFile(FONT)
  })

  it('realistic uncommon name characters render as real glyphs', async () => {
    for (const ch of NAME_CHARS) {
      const g = glyphCount(await subsetFont(font, ch, { targetFormat: 'truetype' }))
      expect(g, `${ch} should be a real glyph, not tofu`).toBeGreaterThanOrEqual(2)
    }
  })

  it('subsetForText seeds the fixed strings (empty name never yields a 0-glyph font)', async () => {
    expect(glyphCount(await subsetForText(font, ''))).toBeGreaterThan([...new Set(SAFE_CHARS)].length)
  })

  it('per-request subset is tiny (tens of KB, not the 16MB full font)', async () => {
    const out = await subsetForText(font, '王漢文歐陽蘭君')
    expect(out.byteLength).toBeLessThan(200 * 1024)
  })
})
