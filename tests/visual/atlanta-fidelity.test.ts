import { describe, it, expect, beforeAll } from 'vitest'
import { PNG } from 'pngjs'

// D.2 (integration) — Atlanta render path actually produces the structured layout, not just
// the right config. Renders via the live route (proves the URL params reach the renderer and
// glyphs are present). Gated behind ATLANTA_VISUAL=1; needs `npm run dev`.

const BASE = process.env.OG_BASE || 'http://localhost:3000'

async function render(params: Record<string, string>): Promise<PNG> {
  const u = new URL('/api/og/tablet', BASE)
  u.searchParams.set('variant', 'atlanta')
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v)
  const res = await fetch(u.toString())
  if (!res.ok) throw new Error(`render ${params.type} failed: ${res.status}`)
  return PNG.sync.read(Buffer.from(await res.arrayBuffer()))
}

/** Count distinct dark-column clusters in the center band (x 90..230) within a y-range. */
function centerColumnClusters(png: PNG, y0: number, y1: number): number {
  const { width, data } = png
  const darkPerX: boolean[] = []
  for (let x = 90; x < 230; x++) {
    let dark = 0
    for (let y = y0; y < y1; y++) {
      const i = (y * width + x) * 4
      if ((data[i] + data[i + 1] + data[i + 2]) / 3 < 128) dark++
    }
    darkPerX[x] = dark > 3 // column has meaningful ink
  }
  let clusters = 0
  let inCluster = false
  for (let x = 90; x < 230; x++) {
    if (darkPerX[x] && !inCluster) {
      clusters++
      inCluster = true
    } else if (!darkPerX[x]) {
      inCluster = false
    }
  }
  return clusters
}

describe('atlanta fidelity (D.2 integration)', () => {
  beforeAll(async () => {
    try {
      await fetch(BASE)
    } catch {
      throw new Error(`Dev server not reachable at ${BASE}. Run \`npm run dev\` first.`)
    }
  })

  it('all 6 types render a 320x848 PNG with real ink', async () => {
    const cases: Record<string, string>[] = [
      { type: 'longevity', name: '張三', family: '1' },
      { type: 'karmic-creditors', applicant: '王小二' },
      { type: 'deceased', name: '張三', title: '先父', pet_title: '孝子', pet_name: '張學峰' },
      { type: 'ancestors', surname: '龍', descendant: '龍承恩' },
      { type: 'aborted-spirits', name: '陳氏流產嬰孩', father: '王建國', mother: '李秀英' },
      { type: 'land-deity', address: '上海市南京東路100號', applicant_name: '王志明' },
    ]
    for (const c of cases) {
      const png = await render(c)
      expect(png.width).toBe(320)
      expect(png.height).toBe(848)
      let dark = 0
      for (let i = 0; i < png.data.length; i += 4) {
        if ((png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3 < 128) dark++
      }
      expect(dark, `${c.type} should have substantial ink`).toBeGreaterThan(2000)
    }
  })

  it('deceased center is TWO distinct columns (稱謂 + name rendered separately)', async () => {
    const png = await render({ type: 'deceased', name: '歐陽蘭君', title: '先父', pet_title: '孝子', pet_name: '張學峰' })
    // middle zone (between fixed top 佛力超薦 and bottom 往生蓮位)
    expect(centerColumnClusters(png, 360, 560)).toBe(2)
  })

  it('ancestors center is ONE column (surname only)', async () => {
    const png = await render({ type: 'ancestors', surname: '愛新覺羅', descendant: '愛新覺羅啟' })
    // the surname sits in the middle zone; one column
    expect(centerColumnClusters(png, 330, 440)).toBe(1)
  })
})
