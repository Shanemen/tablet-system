import { describe, it, expect } from 'vitest'
import {
  chineseColumns,
  latinLines,
  descCols,
  ancestorsCenterSize,
  addressLines,
  layoutAtlantaTablet,
  type AtlantaEl,
  type VColEl,
  type HLinesEl,
} from '@/lib/atlanta/layout'
import { FIXED_WEIGHT, FIXED_SIZE, CENTER_X, LEFT, BAND_H } from '@/lib/atlanta/constants'

// D.2 — Atlanta fidelity gate. Structural assertions on the pure layout IR, derived
// from the exact constants in prototypes/atlanta/*.html. No browser/server needed.

const vcols = (els: AtlantaEl[]) => els.filter((e): e is VColEl => e.kind === 'vcol')
const hlinesOf = (els: AtlantaEl[]) => els.filter((e): e is HLinesEl => e.kind === 'hlines')
const fixedVcols = (els: AtlantaEl[]) => vcols(els).filter((e) => e.weight === FIXED_WEIGHT)
const centerDynamicVcols = (els: AtlantaEl[]) => vcols(els).filter((e) => e.weight !== FIXED_WEIGHT && e.centerX > 60)
const leftVcols = (els: AtlantaEl[]) => vcols(els).filter((e) => e.centerX === LEFT.x)

describe('chineseColumns (longevity)', () => {
  it('闔家 is always its own last (=leftmost) column', () => {
    expect(chineseColumns('張三闔家')).toEqual(['張三', '闔家'])
    expect(chineseColumns('愛新覺羅波奇闔家')).toEqual(['愛新覺羅波奇', '闔家']) // base=6, not split
  })
  it('keeps <=6 as one column, splits >6 into two', () => {
    expect(chineseColumns('王小二')).toEqual(['王小二'])
    expect(chineseColumns('一二三四五六七')).toEqual(['一二三四', '五六七'])
  })
})

describe('latinLines (longevity)', () => {
  it('normalizes a family suffix to a single "& family" line', () => {
    expect(latinLines('John Smith and family')).toEqual(['John', 'Smith', '& family'])
    expect(latinLines('David Chen & family')).toEqual(['David', 'Chen', '& family'])
  })
  it('one word per line otherwise', () => {
    expect(latinLines('Taylor Smith')).toEqual(['Taylor', 'Smith'])
  })
})

describe('descCols (aborted-spirits)', () => {
  it('fills 6 then overflows', () => {
    expect(descCols('王氏二位嬰靈菩薩', 6)).toEqual(['王氏二位嬰靈', '菩薩'])
    expect(descCols('吾兒妙音', 6)).toEqual(['吾兒妙音'])
  })
})

describe('ancestorsCenterSize (uniform center, 9-char bottom divisor)', () => {
  // fixedTop 佛力超薦 = 4, fixedBottom 氏歷代祖先往生蓮位 = 9
  it('1-char surname stays 32', () => {
    expect(ancestorsCenterSize('龍', 4, 9)).toBe(32)
  })
  it('4-char 愛新覺羅 shrinks to ~29.24 (NOT 31.06 from a wrong 8-char divisor)', () => {
    expect(ancestorsCenterSize('愛新覺羅', 4, 9)).toBeCloseTo((BAND_H - 24) / (4 + 4 + 9), 5)
    expect(ancestorsCenterSize('愛新覺羅', 4, 9)).toBeLessThanOrEqual(32)
    expect(ancestorsCenterSize('愛新覺羅', 4, 9)).toBeLessThan(31)
  })
  it('latin surname keeps 32', () => {
    expect(ancestorsCenterSize('Wang', 4, 9)).toBe(32)
  })
})

describe('addressLines (land-deity)', () => {
  it('keeps number+unit and 之地基主 unbroken, suffix appears exactly once', () => {
    const { fs, lines } = addressLines('上海市南京東路100號', '之地基主', 237, 160)
    const joined = lines.join('')
    expect((joined.match(/之地基主/g) || []).length).toBe(1)
    expect(lines.some((l) => l.includes('100號'))).toBe(true) // digit+unit not split
    expect(lines.every((l) => !/100$/.test(l))).toBe(true) // no line ends with bare "100"
    expect(fs).toBeLessThanOrEqual(FIXED_SIZE)
  })
  it('long address shrinks below 32 and still keeps units intact', () => {
    const { fs, lines } = addressLines('中國廣東省深圳市南山區高新南一道128號創新大廈2008室', '之地基主', 237, 160)
    expect(fs).toBeLessThan(FIXED_SIZE) // shrink fired
    const joined = lines.join('')
    expect((joined.match(/之地基主/g) || []).length).toBe(1)
    expect(lines.some((l) => l.includes('128號'))).toBe(true)
    expect(lines.some((l) => l.includes('2008室'))).toBe(true)
  })
})

describe('layoutAtlantaTablet integration', () => {
  it('all tablets are 320x848 and fixed text is weight 500', () => {
    const l = layoutAtlantaTablet('deceased', { title: '先父', name: '張三', petTitle: '孝子', petName: '張學峰' })
    expect(l.width).toBe(320)
    expect(l.height).toBe(848)
    expect(fixedVcols(l.elements).length).toBeGreaterThan(0)
    fixedVcols(l.elements).forEach((e) => expect(e.fontSize).toBe(FIXED_SIZE))
  })

  it('deceased: center is exactly 2 columns and the name never splits', () => {
    const l = layoutAtlantaTablet('deceased', { title: '先父', name: '歐陽蘭君', petTitle: '孝子', petName: '張學峰' })
    const center = centerDynamicVcols(l.elements)
    expect(center.length).toBe(2)
    expect(center.some((c) => c.chars.join('') === '歐陽蘭君')).toBe(true) // intact, not split
    // left margin carries the petitioner relationship + name, label 敬薦
    expect(vcols(l.elements).some((e) => e.centerX === LEFT.x && e.chars.join('') === '敬薦')).toBe(true)
  })

  it('ancestors: surname is ONE column at the uniform size; bottom fixed is 9 chars; label 叩薦', () => {
    const l = layoutAtlantaTablet('ancestors', { surname: '愛新覺羅', descendant: '愛新覺羅啟' })
    const center = centerDynamicVcols(l.elements)
    expect(center.length).toBe(1)
    expect(center[0].chars.length).toBe(4)
    const expected = ancestorsCenterSize('愛新覺羅', 4, 9)
    expect(center[0].fontSize).toBeCloseTo(expected, 5)
    // whole center uniform: fixed text shares the same computed size
    fixedVcols(l.elements).forEach((e) => expect(e.fontSize).toBeCloseTo(expected, 5))
    expect(fixedVcols(l.elements).some((e) => e.chars.join('') === '氏歷代祖先往生蓮位')).toBe(true)
    expect(vcols(l.elements).some((e) => e.centerX === LEFT.x && e.chars.join('') === '叩薦')).toBe(true)
  })

  it('karmic: single fixed center column fills the band BIGGER than 32, weight 500, centered, no 3-zone band', () => {
    const l = layoutAtlantaTablet('karmic-creditors', { applicant: '王小二' })
    const center = vcols(l.elements).find((e) => e.chars.join('') === '佛力超薦累劫冤親債主往生蓮位')
    expect(center).toBeDefined()
    // grander than the unified 32, capped at 38, fits the band (clears canopy & lotus)
    expect(center!.fontSize).toBeGreaterThan(FIXED_SIZE)
    expect(center!.fontSize).toBeLessThanOrEqual(38)
    expect(center!.top).toBeGreaterThanOrEqual(198)
    expect(center!.top + center!.chars.length * center!.fontSize).toBeLessThanOrEqual(716) // clears lotus
    expect(center!.weight).toBe(FIXED_WEIGHT)
    expect(center!.centerX).toBe(CENTER_X)
  })

  it('land-deity: horizontal address with 之地基主 exactly once; left name has NO prefix', () => {
    const l = layoutAtlantaTablet('land-deity', { address: '上海市南京東路100號', applicantName: '王志明' })
    const center = hlinesOf(l.elements)
    expect(center.length).toBe(1)
    const joined = center[0].lines.join('')
    expect((joined.match(/之地基主/g) || []).length).toBe(1)
    // left petitioner = exactly the entered name, no 弟子/稱謂 prefix
    expect(leftVcols(l.elements).some((e) => e.chars.join('') === '王志明')).toBe(true)
  })

  it('longevity: no left margin; 闔家 is the leftmost column', () => {
    const l = layoutAtlantaTablet('longevity', { name: '張三', family: true })
    // no 陽上/敬薦 labels
    expect(vcols(l.elements).some((e) => e.centerX === LEFT.x)).toBe(false)
    const center = centerDynamicVcols(l.elements)
    expect(center.length).toBe(2)
    // leftmost column (smallest centerX) is 闔家
    const leftmost = center.reduce((a, b) => (a.centerX < b.centerX ? a : b))
    expect(leftmost.chars.join('')).toBe('闔家')
  })

  it('deceased column gap is fs*0.28; longevity column gap is fs*0.25', () => {
    const d = centerDynamicVcols(layoutAtlantaTablet('deceased', { title: '先父', name: '張三' }).elements)
    const dGap = Math.abs(d[0].centerX - d[1].centerX) - d[0].fontSize
    expect(dGap).toBeCloseTo(d[0].fontSize * 0.28, 5)

    const g = centerDynamicVcols(layoutAtlantaTablet('longevity', { name: '張三', family: true }).elements)
    const gGap = Math.abs(g[0].centerX - g[1].centerX) - g[0].fontSize
    expect(gGap).toBeCloseTo(g[0].fontSize * 0.25, 5)
  })
})
