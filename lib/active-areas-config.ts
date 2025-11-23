/**
 * Active Area Configuration for Tablet Templates
 * 
 * Each template has one or more "active areas" where dynamic text will be inserted.
 * Active areas are defined by their position and size within the SVG template.
 */

export interface ActiveArea {
  /** Unique identifier for this active area */
  id: string
  /** X coordinate (left edge) */
  x: number
  /** Y coordinate (top edge) */
  y: number
  /** Width of the active area */
  width: number
  /** Height of the active area */
  height: number
  /** Purpose/content of this area */
  purpose: 'main' | 'applicant'
  /** Default font size (can be adjusted dynamically) */
  fontSize: number
  /** Line height for vertical text */
  lineHeight: number
}

export interface TabletTemplateConfig {
  /** Template identifier */
  templateId: string
  /** SVG template width */
  svgWidth: number
  /** SVG template height */
  svgHeight: number
  /** Number of active areas */
  activeAreas: ActiveArea[]
}

/**
 * Longevity Tablet Configuration
 * 长生禄位配置
 * 
 * Based on IMAGE_GENERATION_GUIDE.md and user-provided images:
 * - 1 active area (center)
 * - Between "佛光注照" (top) and "長生祿位" (bottom)
 * - SVG dimensions: 320 x 848
 */
export const LONGEVITY_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'longevity',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      // Horizontal: Flexbox auto-centering (based on container width)
      // Vertical: Measured boundary centering (based on fixed text positions in SVG)
      // 
      // Measured from Figma:
      // "佛光注照" bottom: Y=306, "長生祿位" top: Y=618
      // With symmetric 6px padding on top and bottom
      x: 45,           // Left boundary (for horizontal auto-centering)
      y: 312,          // Top boundary: 306 + 6px padding (for vertical measured centering)
      width: 230,      // Container width (for horizontal auto-centering)
      height: 300,     // Measured height: (618 - 6px) - (306 + 6px) = 300
      purpose: 'main',
      fontSize: 42,    // Base font size (most names use this)
      lineHeight: 42,  // Same as fontSize for consistent spacing
    },
  ],
}

/**
 * Karmic Creditors Tablet Configuration
 * 冤亲债主配置
 * 
 * - 1 active area (left side)
 * - Between "陽上" (top) and "敬薦" (bottom)
 * - Center text "累劫冤親債主" is fixed in template
 */
export const KARMIC_CREDITORS_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'karmic-creditors',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'left-applicant',
      x: 15,           // Left side
      y: 280,          // Below "陽上"
      width: 60,       // Narrower for applicant info
      height: 340,     // To "敬薦"
      purpose: 'applicant',
      fontSize: 32,    // Smaller font for applicant
      lineHeight: 30,
    },
  ],
}

/**
 * Deceased Tablet Configuration
 * 往生莲位配置
 * 
 * - 2 active areas (center + left)
 * - Center: between "佛力超薦" and "往生蓮位"
 * - Left: between "陽上" and "敬薦"
 */
export const DECEASED_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'deceased',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,
      y: 280,
      width: 230,
      height: 340,
      purpose: 'main',
      fontSize: 46,
      lineHeight: 44,
    },
    {
      id: 'left-applicant',
      x: 15,
      y: 280,
      width: 60,
      height: 340,
      purpose: 'applicant',
      fontSize: 32,
      lineHeight: 30,
    },
  ],
}

/**
 * Ancestors Tablet Configuration
 * 历代祖先配置
 * 
 * - 2 active areas (center + left)
 * - Center: for inserting surname before "氏"
 * - Left: between "陽上後裔" and "叩薦"
 */
export const ANCESTORS_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'ancestors',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,
      y: 280,
      width: 230,
      height: 340,
      purpose: 'main',
      fontSize: 46,
      lineHeight: 44,
    },
    {
      id: 'left-applicant',
      x: 15,
      y: 280,
      width: 60,
      height: 340,
      purpose: 'applicant',
      fontSize: 32,
      lineHeight: 30,
    },
  ],
}

/**
 * Aborted Spirits Tablet Configuration
 * 婴灵排位配置
 * 
 * - 2 active areas (center + left)
 * - Center: baby spirit info
 * - Left: parent info (father + mother)
 */
export const ABORTED_SPIRITS_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'aborted-spirits',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,
      y: 280,
      width: 230,
      height: 340,
      purpose: 'main',
      fontSize: 46,
      lineHeight: 44,
    },
    {
      id: 'left-applicant',
      x: 15,
      y: 280,
      width: 60,
      height: 340,
      purpose: 'applicant',
      fontSize: 32,
      lineHeight: 30,
    },
  ],
}

/**
 * Land Deity Tablet Configuration
 * 地基主配置
 * 
 * - 2 active areas (center + left)
 * - Center: address + "之地基主"
 * - Left: applicant name
 */
export const LAND_DEITY_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'land-deity',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,
      y: 280,
      width: 230,
      height: 340,
      purpose: 'main',
      fontSize: 46,
      lineHeight: 44,
    },
    {
      id: 'left-applicant',
      x: 15,
      y: 280,
      width: 60,
      height: 340,
      purpose: 'applicant',
      fontSize: 32,
      lineHeight: 30,
    },
  ],
}

/**
 * Get configuration for a specific template
 */
export function getTemplateConfig(templateId: string): TabletTemplateConfig {
  switch (templateId) {
    case 'longevity':
      return LONGEVITY_TEMPLATE_CONFIG
    case 'karmic-creditors':
      return KARMIC_CREDITORS_TEMPLATE_CONFIG
    case 'deceased':
      return DECEASED_TEMPLATE_CONFIG
    case 'ancestors':
      return ANCESTORS_TEMPLATE_CONFIG
    case 'aborted-spirits':
      return ABORTED_SPIRITS_TEMPLATE_CONFIG
    case 'land-deity':
      return LAND_DEITY_TEMPLATE_CONFIG
    default:
      throw new Error(`Unknown template: ${templateId}`)
  }
}

/**
 * Check if text contains English letters
 */
export function isEnglishText(text: string): boolean {
  return /[a-zA-Z]/.test(text)
}

/**
 * Rendering mode for English text
 */
export type EnglishRenderMode = 'single-line' | 'multi-line'

/**
 * Result from calculateFontSize for English text
 */
export interface EnglishFontResult {
  fontSize: number
  mode: EnglishRenderMode
}

/**
 * Calculate font size for English text (single-line mode only for now)
 * 
 * TODO: Multi-line support needs more research into Satori's rendering behavior
 * For now, all English names are rendered as single line with dynamic font scaling
 */
export function calculateEnglishFont(
  text: string,
  activeArea: ActiveArea
): EnglishFontResult {
  const availableHeight = activeArea.height
  const BASE_SIZE = activeArea.fontSize // 42px
  const avgCharWidthRatio = 0.7 // Conservative: 70% of fontSize per character
  
  // Calculate required height for single line
  const totalLength = text.length
  const singleLineWidth = totalLength * avgCharWidthRatio * BASE_SIZE
  const singleLineHeight = singleLineWidth
  
  if (singleLineHeight <= availableHeight) {
    // Fits at base size
    return { fontSize: BASE_SIZE, mode: 'single-line' }
  }
  
  // Scale down to fit
  const scaleFactor = availableHeight / singleLineHeight
  const minSize = BASE_SIZE * 0.5 // Don't go below 50%
  const newSize = Math.max(BASE_SIZE * scaleFactor, minSize)
  
  return { fontSize: Math.floor(newSize), mode: 'single-line' }
}

/**
 * Calculate font size and rendering mode for text
 * 
 * Strategy (Professional & Unified):
 * 1. Most names use BASE_SIZE (42px) - looks professional and unified
 * 2. Only extremely long names are scaled down
 * 3. Different whitespace around names is acceptable
 * 
 * Statistics:
 * - Chinese: 2-3 characters = 98%, 4-5 = 1%, 6+ = rare
 * - English: Short names (< 15 chars) = 90%, medium = 8%, long = 2%
 */
export function calculateFontSize(
  text: string,
  activeArea: ActiveArea,
  maxReductionPercent = 0.7
): number {
  const isEnglish = isEnglishText(text)
  
  if (isEnglish) {
    const result = calculateEnglishFont(text, activeArea)
    return result.fontSize
  }
  
  // For Chinese text: Use same unified strategy as English
  const BASE_SIZE = activeArea.fontSize // 42px
  const LINE_HEIGHT = activeArea.lineHeight // 42px
  const charCount = text.length
  
  // Try BASE_SIZE first (for 98% of names)
  const requiredHeight = charCount * LINE_HEIGHT
  
  if (requiredHeight <= activeArea.height) {
    // Fits at BASE_SIZE - use it! (2-6 character names)
    return BASE_SIZE
  }
  
  // Only scale down for extremely long names (7+ characters)
  const scaleFactor = activeArea.height / requiredHeight
  const minSize = BASE_SIZE * 0.5 // Don't go below 50%
  const newSize = Math.max(BASE_SIZE * scaleFactor, minSize)
  
  return Math.floor(newSize)
}

