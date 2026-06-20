// Shared fixtures for the D.1 default-temple regression gate.
// The golden-capture script and the regression test BOTH import this list so the
// captured baseline and the re-render under test use byte-identical URLs.
//
// These are DEFAULT-temple renders: NO `variant` param. After every Atlanta step
// (1-7) the live render of these URLs must be pixel-identical to the captured golden.

export interface VisualFixture {
  /** stable file-safe key -> tests/baseline/<key>.png */
  key: string
  /** query params for /api/og/tablet (no leading ?) */
  params: Record<string, string>
}

const TYPES = [
  'longevity',
  'karmic-creditors',
  'ancestors',
  'deceased',
  'aborted-spirits',
  'land-deity',
] as const

// One Chinese and one English honoree per type, default 'bw' style.
// Plus longevity in 'color' to cover getBackgroundColor's isLongevity branch.
export const FIXTURES: VisualFixture[] = [
  ...TYPES.flatMap((type): VisualFixture[] => [
    { key: `${type}-cn`, params: { type, name: '王大明', applicant: '陳美玲', style: 'bw' } },
    { key: `${type}-en`, params: { type, name: 'John Smith', applicant: 'Mary Chen', style: 'bw' } },
  ]),
  { key: 'longevity-color', params: { type: 'longevity', name: '王大明', style: 'color' } },
]

export function fixtureUrl(base: string, f: VisualFixture): string {
  const u = new URL('/api/og/tablet', base)
  for (const [k, v] of Object.entries(f.params)) u.searchParams.set(k, v)
  return u.toString()
}
