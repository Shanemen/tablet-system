import type { TabletTypeValue } from '@/lib/tablet-types-config'

// Per-type Atlanta configuration. Differences between the 6 tablet types live here;
// shared geometry lives in constants.ts. Values sourced from prototypes/atlanta/*.html :root.

export type AtlantaLayoutKind =
  | 'longevity'
  | 'deceased'
  | 'ancestors'
  | 'aborted'
  | 'landDeity'
  | 'karmic'

export interface AtlantaTypeConfig {
  /** Top fixed string (e.g. 佛光注照). Empty for karmic (single fixed center column). */
  fixedTop: string
  /** Bottom fixed string (e.g. 長生祿位 / 氏歷代祖先往生蓮位). */
  fixedBottom: string
  /** --gap-fixed-name: breathing room between fixed text and the dynamic middle. */
  gapFixedName: number
  /** Minimum dynamic font size floor. */
  midMin: number
  /** Inter-column gap coefficient (gap = fs * colGap). 0 when single-column / horizontal. */
  colGap: number
  /** longevity: split a Chinese name into 2 columns when base length exceeds this. */
  cnTwoColThreshold?: number
  /** aborted: max chars per description column (fill-then-overflow). */
  colMax?: number
  /** Left margin top label. */
  yang?: string
  /** Left margin bottom label (敬薦 for most, 叩薦 for ancestors). */
  jian?: string
  /** karmic only: the full fixed center string rendered as one vertical column. */
  centerString?: string
  /** Which layout algorithm the renderer + layout dispatcher uses. */
  layout: AtlantaLayoutKind
}

export const ATLANTA_CONFIG: Record<TabletTypeValue, AtlantaTypeConfig> = {
  longevity: {
    fixedTop: '佛光注照',
    fixedBottom: '長生祿位',
    gapFixedName: 14,
    midMin: 18,
    colGap: 0.25,
    cnTwoColThreshold: 6,
    layout: 'longevity',
  },
  deceased: {
    fixedTop: '佛力超薦',
    fixedBottom: '往生蓮位',
    gapFixedName: 14,
    midMin: 16,
    colGap: 0.28,
    yang: '陽上',
    jian: '敬薦',
    layout: 'deceased',
  },
  ancestors: {
    fixedTop: '佛力超薦',
    fixedBottom: '氏歷代祖先往生蓮位', // 9 chars — used as the uniform-size divisor
    gapFixedName: 12, // note: 12, not 14
    midMin: 14,
    colGap: 0,
    yang: '陽上',
    jian: '叩薦', // descendants kowtow-recommend
    layout: 'ancestors',
  },
  'aborted-spirits': {
    fixedTop: '佛力超薦',
    fixedBottom: '往生蓮位',
    gapFixedName: 14,
    midMin: 16,
    colGap: 0.28,
    colMax: 6, // fill 6 chars per column, then overflow
    yang: '陽上',
    jian: '敬薦',
    layout: 'aborted',
  },
  'land-deity': {
    fixedTop: '佛力超薦',
    fixedBottom: '往生蓮位', // 之地基主 is owned by the horizontal address block, NOT here
    gapFixedName: 14,
    midMin: 12, // address shrinks to --addr-min 12
    colGap: 0,
    yang: '陽上',
    jian: '敬薦',
    layout: 'landDeity',
  },
  'karmic-creditors': {
    fixedTop: '',
    fixedBottom: '',
    gapFixedName: 0,
    midMin: 14,
    colGap: 0,
    yang: '陽上',
    jian: '敬薦',
    centerString: '佛力超薦累劫冤親債主往生蓮位', // single fixed vertical column, not a 3-zone band
    layout: 'karmic',
  },
}

/** The horizontal address suffix for land-deity, kept together as one trailing token. */
export const LAND_DEITY_SUFFIX = '之地基主'
