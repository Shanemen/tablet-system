// Capture the D.1 regression-gate golden baseline.
//
// Usage:
//   1. start the dev server:  npm run dev
//   2. node scripts/capture-golden.mjs            (captures to tests/baseline/)
//
// Re-run this at the START of Step 8 (font/runtime swap) so that step's diff
// measures ONLY the runtime/subset change (per blueprint fix #5: per-step golden).
//
// This is a .mjs script (not a vitest test) so it never runs as part of `npm test`.
// It imports the SAME fixtures the regression test uses by reading the compiled list.

import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.OG_BASE || 'http://localhost:3000'
const OUT = path.resolve('tests/baseline')

// Inline the fixture list (kept in sync with tests/visual/fixtures.ts).
// Duplicated as plain data here to avoid a TS build step for the capture script.
const TYPES = ['longevity', 'karmic-creditors', 'ancestors', 'deceased', 'aborted-spirits', 'land-deity']
const FIXTURES = [
  ...TYPES.flatMap((type) => [
    { key: `${type}-cn`, params: { type, name: '王大明', applicant: '陳美玲', style: 'bw' } },
    { key: `${type}-en`, params: { type, name: 'John Smith', applicant: 'Mary Chen', style: 'bw' } },
  ]),
  { key: 'longevity-color', params: { type: 'longevity', name: '王大明', style: 'color' } },
]

function url(f) {
  const u = new URL('/api/og/tablet', BASE)
  for (const [k, v] of Object.entries(f.params)) u.searchParams.set(k, v)
  return u.toString()
}

await mkdir(OUT, { recursive: true })
let ok = 0
for (const f of FIXTURES) {
  const res = await fetch(url(f))
  if (!res.ok) {
    console.error(`FAIL ${f.key}: ${res.status} ${res.statusText}`)
    continue
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(path.join(OUT, `${f.key}.png`), buf)
  console.log(`ok   ${f.key}  (${buf.length} bytes)`)
  ok++
}
console.log(`\nCaptured ${ok}/${FIXTURES.length} golden images to ${OUT}`)
if (ok !== FIXTURES.length) process.exit(1)
