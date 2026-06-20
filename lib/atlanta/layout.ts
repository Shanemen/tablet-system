import { BAND, BAND_H, CENTER_X, FIXED_SIZE, FIXED_WEIGHT, DYNAMIC_WEIGHT, LEFT, isLatin } from './constants'
import { ATLANTA_CONFIG, LAND_DEITY_SUFFIX, type AtlantaTypeConfig } from './config'
import type { TabletTypeValue } from '@/lib/tablet-types-config'

// ============================================================================
// Atlanta layout engine — PURE functions, no JSX. Faithfully ports the 6
// prototypes/atlanta/*.html makeTablet() routines. The renderer (Step 5) turns
// the returned element IR into absolutely-positioned Satori JSX; D.2 unit tests
// assert on the IR directly. All coordinates are in the true 320x848 space.
// ============================================================================

/** A vertical run of characters, each cell `fontSize` tall, centered horizontally on centerX,
 *  the run starting at y=top. */
export interface VColEl {
  kind: 'vcol'
  chars: string[]
  centerX: number
  top: number
  fontSize: number
  weight: number
}
/** Horizontal lines stacked & centered on centerX, the block starting at y=top. */
export interface HLinesEl {
  kind: 'hlines'
  lines: string[]
  centerX: number
  top: number
  fontSize: number
  lineHeight: number
  weight: number
}
/** A rotated-90° latin single line centered at (centerX, centerY). */
export interface RotEl {
  kind: 'rot'
  text: string
  centerX: number
  centerY: number
  fontSize: number
  weight: number
}
export type AtlantaEl = VColEl | HLinesEl | RotEl

export interface AtlantaLayout {
  width: number
  height: number
  elements: AtlantaEl[]
}

export interface AtlantaInputs {
  name?: string // honoree / longevity name / aborted description
  family?: boolean // longevity 闔家
  title?: string // deceased 稱謂
  petTitle?: string // petitioner relationship (deceased)
  petName?: string // petitioner name (deceased)
  surname?: string // ancestors
  descendant?: string // ancestors descendant name (left)
  father?: string // aborted
  mother?: string // aborted
  address?: string // land-deity
  applicantName?: string // land-deity / ancestors / generic single petitioner
  applicant?: string // karmic petitioner
}

// ---------------------------------------------------------------------------
// Element constructors
// ---------------------------------------------------------------------------
function vcol(text: string, centerX: number, top: number, fontSize: number, weight = DYNAMIC_WEIGHT): VColEl {
  return { kind: 'vcol', chars: [...text], centerX, top, fontSize, weight }
}

/** Vertically center a single column at midY. */
function vcolCentered(text: string, centerX: number, midY: number, fontSize: number, weight = DYNAMIC_WEIGHT): VColEl {
  return vcol(text, centerX, midY - (text.length * fontSize) / 2, fontSize, weight)
}

/** Lay out N vertical columns as a centered block. columns[0] is RIGHTMOST (read first),
 *  matching the mockups' flex-direction:row-reverse. Each column is vertically centered at midY. */
function colsElements(columns: string[], fs: number, gap: number, midY: number): VColEl[] {
  const n = columns.length
  const totalW = n * fs + (n - 1) * gap
  const rightCenter = CENTER_X + totalW / 2 - fs / 2
  return columns.map((col, i) => vcolCentered(col, rightCenter - i * (fs + gap), midY, fs))
}

function hlines(lines: string[], fs: number, midY: number, lineHeight: number): HLinesEl {
  const blockH = lines.length * fs * lineHeight
  return { kind: 'hlines', lines, centerX: CENTER_X, top: midY - blockH / 2, fontSize: fs, lineHeight, weight: DYNAMIC_WEIGHT }
}

// ---------------------------------------------------------------------------
// Shared geometry (longevity / deceased / aborted / land-deity; ancestors passes its own fixedSize)
// ---------------------------------------------------------------------------
interface BandGeo {
  topY: number // fixed-top run start
  botY: number // fixed-bottom run start
  midY: number // center of the dynamic middle zone
  midH: number
  midW: number
}
function bandGeometry(fixedTop: string, fixedBottom: string, fixedSize: number, gap: number): BandGeo {
  const topH = fixedTop.length * fixedSize
  const botH = fixedBottom.length * fixedSize
  const midTopY = BAND.top + topH + gap
  const midBotY = BAND.bottom - botH - gap
  return {
    topY: BAND.top,
    botY: BAND.bottom - botH,
    midY: (midTopY + midBotY) / 2,
    midH: midBotY - midTopY,
    midW: BAND.width,
  }
}

function fixedElements(cfg: AtlantaTypeConfig, geo: BandGeo, fixedSize: number): VColEl[] {
  const els: VColEl[] = []
  if (cfg.fixedTop) els.push(vcol(cfg.fixedTop, CENTER_X, geo.topY, fixedSize, FIXED_WEIGHT))
  if (cfg.fixedBottom) els.push(vcol(cfg.fixedBottom, CENTER_X, geo.botY, fixedSize, FIXED_WEIGHT))
  return els
}

// ---------------------------------------------------------------------------
// Exported pure helpers (faithfully ported; asserted directly by D.2)
// ---------------------------------------------------------------------------

/** longevity: 闔家 always its own LAST (= leftmost after row-reverse) column; base splits into
 *  two columns when longer than threshold. */
export function chineseColumns(name: string, threshold = 6): string[] {
  let base = name
  let family: string | null = null
  if (name.endsWith('闔家')) {
    base = name.slice(0, -2)
    family = '闔家'
  }
  let cols: string[]
  if (base.length > threshold) {
    const mid = Math.ceil(base.length / 2)
    cols = [base.slice(0, mid), base.slice(mid)]
  } else {
    cols = [base]
  }
  if (family) cols.push(family)
  return cols
}

/** Latin name -> stacked lines (one word per line); trailing "and family"/"& family" normalized
 *  to a single compact "& family" line. */
export function latinLines(name: string): string[] {
  let s = name.trim()
  let tail: string | null = null
  const m = s.match(/\s*(?:and\s+family|&\s*family)\s*$/i)
  if (m) {
    tail = '& family'
    s = s.slice(0, m.index)
  }
  const lines = s.split(/\s+/).filter(Boolean)
  if (tail) lines.push(tail)
  return lines
}

/** aborted: fill each column to `max` chars, then overflow to the next column. */
export function descCols(text: string, max = 6): string[] {
  const cols: string[] = []
  for (let i = 0; i < text.length; i += max) cols.push(text.slice(i, i + max))
  return cols
}

/** ancestors: ONE uniform center size for top fixed + surname + bottom fixed, so the surname is
 *  never disproportionately small. Latin surname keeps full 32. */
export function ancestorsCenterSize(surname: string, fixedTopLen: number, fixedBottomLen: number): number {
  if (isLatin(surname)) return FIXED_SIZE
  return Math.max(14, Math.min(FIXED_SIZE, (BAND_H - 24) / (fixedTopLen + surname.length + fixedBottomLen)))
}

/** Approximate rendered width of a horizontal line (CJK=1em, space=0.3em, latin=0.56em). */
export function lineWidth(line: string, fs: number): number {
  let w = 0
  for (const ch of line) w += /[㐀-鿿]/.test(ch) ? fs : ch === ' ' ? fs * 0.3 : fs * 0.56
  return w
}

/** land-deity: wrap "[address]<suffix>" into centered horizontal lines, shrinking 32->12 until
 *  every line fits the band width AND the block fits the height. Keeps number+unit runs and the
 *  suffix (之地基主) unbroken (mirrors production shouldKeepTogether). */
export function addressLines(addr: string, suffix: string, midH: number, midW: number): { fs: number; lines: string[] } {
  const W = midW - 14
  const latin = isLatin(addr)
  const wrap = (fs: number): string[] => {
    const lines: string[] = []
    if (latin) {
      const words = addr.trim().split(/\s+/).concat([suffix])
      let cur = ''
      for (const word of words) {
        const test = cur ? cur + ' ' + word : word
        if (!cur || lineWidth(test, fs) <= W) cur = test
        else {
          lines.push(cur)
          cur = word
        }
      }
      if (cur) lines.push(cur)
    } else {
      const unit = /[號樓棟室層段區街路巷弄座幢]/
      const alnum = /[0-9０-９a-zA-Z]/
      const tokens: string[] = []
      let i = 0
      while (i < addr.length) {
        if (alnum.test(addr[i])) {
          let j = i
          while (j < addr.length && alnum.test(addr[j])) j++
          if (j < addr.length && unit.test(addr[j])) j++ // include trailing unit (號…)
          tokens.push(addr.slice(i, j))
          i = j
        } else {
          tokens.push(addr[i])
          i++
        }
      }
      tokens.push(suffix) // 之地基主 stays together
      const maxChars = Math.max(2, Math.floor(W / fs))
      let cur = ''
      for (const t of tokens) {
        if (!cur || cur.length + t.length <= maxChars) cur += t
        else {
          lines.push(cur)
          cur = t
        }
      }
      if (cur) lines.push(cur)
    }
    return lines
  }
  const fits = (lines: string[], fs: number): boolean =>
    lines.length * fs * 1.28 <= midH && Math.max(...lines.map((l) => lineWidth(l, fs))) <= W
  let fs = FIXED_SIZE
  let lines = wrap(fs)
  while (!fits(lines, fs) && fs > 12) {
    fs -= 1
    lines = wrap(fs)
  }
  return { fs, lines }
}

// ---------------------------------------------------------------------------
// Left petitioner margin (shared by deceased / ancestors / aborted / land-deity / karmic)
// ---------------------------------------------------------------------------
const ZONE_TOP = LEFT.yangTop + 2 * LEFT.size + LEFT.gap // 陽上 is 2 chars
const ZONE_BOTTOM = LEFT.jianTop - LEFT.gap
const ZONE_CENTER = (ZONE_TOP + ZONE_BOTTOM) / 2
const ZONE_SPAN = ZONE_BOTTOM - ZONE_TOP

function leftLabels(cfg: AtlantaTypeConfig): VColEl[] {
  const els: VColEl[] = []
  if (cfg.yang) els.push(vcol(cfg.yang, LEFT.x, LEFT.yangTop, LEFT.size))
  if (cfg.jian) els.push(vcol(cfg.jian, LEFT.x, LEFT.jianTop, LEFT.size))
  return els
}

/** Stack Chinese petitioner groups, centered as a block on ZONE_CENTER. */
function leftCNGroups(groups: string[], innerGap: number, shrinkToFit = false): VColEl[] {
  const valid = groups.filter(Boolean)
  if (valid.length === 0) return []
  let ls: number = LEFT.size
  if (shrinkToFit && valid.length === 1) {
    ls = Math.max(14, Math.min(LEFT.size, ZONE_SPAN / valid[0].length))
  }
  const heights = valid.map((g) => g.length * ls)
  const totalH = heights.reduce((a, b) => a + b, 0) + innerGap * (valid.length - 1)
  let top = ZONE_CENTER - totalH / 2
  const els: VColEl[] = []
  for (let k = 0; k < valid.length; k++) {
    els.push(vcol(valid[k], LEFT.x, top, ls))
    top += heights[k] + innerGap
  }
  return els
}

/** Single rotated-90° latin petitioner line, centered on ZONE_CENTER. */
function leftLatinSingle(text: string, charW = 0.55): RotEl {
  const fs = Math.max(8, Math.min(LEFT.size, ZONE_SPAN / (text.length * charW)))
  return { kind: 'rot', text, centerX: LEFT.x, centerY: ZONE_CENTER, fontSize: fs, weight: DYNAMIC_WEIGHT }
}

/** Two rotated latin lines (aborted parents) offset at 27% / 73% so they never overlap. */
function leftLatinTwo(line1: string, line2: string): RotEl[] {
  const maxLen = Math.max(line1.length, line2.length)
  const fs = Math.max(8, Math.min(LEFT.size, (ZONE_SPAN * 0.4) / (maxLen * 0.55)))
  return [
    { kind: 'rot', text: line1, centerX: LEFT.x, centerY: ZONE_TOP + ZONE_SPAN * 0.27, fontSize: fs, weight: DYNAMIC_WEIGHT },
    { kind: 'rot', text: line2, centerX: LEFT.x, centerY: ZONE_TOP + ZONE_SPAN * 0.73, fontSize: fs, weight: DYNAMIC_WEIGHT },
  ]
}

// ---------------------------------------------------------------------------
// Per-type assemblers
// ---------------------------------------------------------------------------
function centerCN(columns: string[], midH: number, midW: number, midY: number, colGap: number, midMin: number): VColEl[] {
  const maxColLen = Math.max(...columns.map((c) => c.length))
  const widthDivisor = columns.length + (columns.length - 1) * colGap
  const fs = Math.max(midMin, Math.min(FIXED_SIZE, midH / maxColLen, midW / widthDivisor))
  return colsElements(columns, fs, fs * colGap, midY)
}

function centerLatin(text: string, midH: number, midW: number, midY: number, midMin: number): HLinesEl {
  const lines = text.trim().split(/\s+/).filter(Boolean)
  const longest = Math.max(...lines.map((l) => l.length))
  const fs = Math.max(midMin, Math.min(FIXED_SIZE, midH / (lines.length * 1.15), (midW - 16) / (longest * 0.6)))
  return hlines(lines, fs, midY, 1.15)
}

/** Main entry: produce the full element IR for an Atlanta tablet of a given type. */
export function layoutAtlantaTablet(type: TabletTypeValue, inputs: AtlantaInputs): AtlantaLayout {
  const cfg = ATLANTA_CONFIG[type]
  const elements: AtlantaEl[] = []

  switch (cfg.layout) {
    case 'longevity': {
      const geo = bandGeometry(cfg.fixedTop, cfg.fixedBottom, FIXED_SIZE, cfg.gapFixedName)
      elements.push(...fixedElements(cfg, geo, FIXED_SIZE))
      let name = inputs.name || ''
      if (inputs.family) name = isLatin(name) ? `${name} & family` : `${name}闔家`
      if (isLatin(name)) {
        const lines = latinLines(name)
        const longest = Math.max(...lines.map((l) => l.length))
        const fs = Math.max(cfg.midMin, Math.min(FIXED_SIZE, geo.midH / (lines.length * 1.15), (geo.midW - 16) / (longest * 0.6)))
        elements.push(hlines(lines, fs, geo.midY, 1.15))
      } else {
        elements.push(...centerCN(chineseColumns(name, cfg.cnTwoColThreshold), geo.midH, geo.midW, geo.midY, cfg.colGap, cfg.midMin))
      }
      break
    }
    case 'deceased': {
      const geo = bandGeometry(cfg.fixedTop, cfg.fixedBottom, FIXED_SIZE, cfg.gapFixedName)
      elements.push(...fixedElements(cfg, geo, FIXED_SIZE))
      const title = inputs.title || ''
      const name = inputs.name || ''
      if (isLatin(title) || isLatin(name)) {
        elements.push(centerLatin(`${title} ${name}`, geo.midH, geo.midW, geo.midY, cfg.midMin))
      } else {
        elements.push(...centerCN([title, name], geo.midH, geo.midW, geo.midY, cfg.colGap, cfg.midMin))
      }
      elements.push(...leftLabels(cfg))
      const petT = inputs.petTitle || ''
      const petN = inputs.petName || ''
      if (isLatin(petT) || isLatin(petN)) elements.push(leftLatinSingle(`${petT} ${petN}`.trim()))
      else elements.push(...leftCNGroups([petT, petN], 6))
      break
    }
    case 'ancestors': {
      const surname = inputs.surname || ''
      const fixedSize = ancestorsCenterSize(surname, cfg.fixedTop.length, cfg.fixedBottom.length)
      const geo = bandGeometry(cfg.fixedTop, cfg.fixedBottom, fixedSize, cfg.gapFixedName)
      elements.push(...fixedElements(cfg, geo, fixedSize))
      if (isLatin(surname)) {
        const lines = surname.trim().split(/\s+/).filter(Boolean)
        const longest = Math.max(...lines.map((l) => l.length))
        const fs = Math.max(cfg.midMin, Math.min(FIXED_SIZE, geo.midH / (lines.length * 1.15), (geo.midW - 16) / (longest * 0.6)))
        elements.push(hlines(lines, fs, geo.midY, 1.15))
      } else {
        // surname ALWAYS one column, rendered at the uniform fixedSize
        elements.push(vcolCentered(surname, CENTER_X, geo.midY, fixedSize))
      }
      elements.push(...leftLabels(cfg))
      const descendant = inputs.descendant || ''
      if (isLatin(descendant)) elements.push(leftLatinSingle(descendant))
      else elements.push(...leftCNGroups([descendant], 6))
      break
    }
    case 'aborted': {
      const geo = bandGeometry(cfg.fixedTop, cfg.fixedBottom, FIXED_SIZE, cfg.gapFixedName)
      elements.push(...fixedElements(cfg, geo, FIXED_SIZE))
      const desc = inputs.name || ''
      if (isLatin(desc)) {
        elements.push(centerLatin(desc, geo.midH, geo.midW, geo.midY, cfg.midMin))
      } else {
        elements.push(...centerCN(descCols(desc, cfg.colMax), geo.midH, geo.midW, geo.midY, cfg.colGap, cfg.midMin))
      }
      elements.push(...leftLabels(cfg))
      const father = inputs.father || ''
      const mother = inputs.mother || ''
      if (isLatin(father) || isLatin(mother)) {
        elements.push(...leftLatinTwo(`Father ${father}`.trim(), `Mother ${mother}`.trim()))
      } else {
        const groups: string[] = []
        if (father) groups.push(`父${father}`)
        if (mother) groups.push(`母${mother}`)
        elements.push(...leftCNGroups(groups, 12))
      }
      break
    }
    case 'landDeity': {
      const geo = bandGeometry(cfg.fixedTop, cfg.fixedBottom, FIXED_SIZE, cfg.gapFixedName)
      elements.push(...fixedElements(cfg, geo, FIXED_SIZE))
      const address = inputs.address || ''
      const { fs, lines } = addressLines(address, LAND_DEITY_SUFFIX, geo.midH, geo.midW)
      elements.push(hlines(lines, fs, geo.midY, 1.28))
      elements.push(...leftLabels(cfg))
      const applicant = inputs.applicantName || ''
      if (isLatin(applicant)) elements.push(leftLatinSingle(applicant))
      else elements.push(...leftCNGroups([applicant], 0))
      break
    }
    case 'karmic': {
      // Center is a single fixed vertical column; NO 3-zone band. The whole column is fixed
      // text (no dynamic middle to balance), so size it to FILL the band (canopy ~198 -> above
      // lotus ~712), vertically centered & capped, making it read bigger and grander than the
      // unified 32 used elsewhere.
      const s = cfg.centerString || ''
      const top0 = 198
      const bottom0 = 712
      const maxSize = 38
      const size = Math.floor(Math.min(maxSize, (bottom0 - top0) / s.length))
      const startTop = top0 + ((bottom0 - top0) - s.length * size) / 2
      elements.push(vcol(s, CENTER_X, startTop, size, FIXED_WEIGHT))
      elements.push(...leftLabels(cfg))
      const applicant = inputs.applicant || ''
      if (isLatin(applicant)) elements.push(leftLatinSingle(applicant, 0.6))
      else elements.push(...leftCNGroups([applicant], 0, true))
      break
    }
  }

  return { width: 320, height: 848, elements }
}
