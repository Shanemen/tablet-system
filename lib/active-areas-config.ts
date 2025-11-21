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
      // Center area coordinates (estimated from images)
      // Red dashed box is between fixed texts
      x: 45,           // Left padding from border
      y: 280,          // Below "佛光注照"
      width: 230,      // Width between borders
      height: 340,     // To "長生祿位"
      purpose: 'main',
      fontSize: 46,    // As per IMAGE_GENERATION_GUIDE.md
      lineHeight: 44,  // As per IMAGE_GENERATION_GUIDE.md
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
 * Calculate dynamic font size based on text length
 * If text is too long, reduce font size to fit within active area
 */
export function calculateFontSize(
  text: string,
  activeArea: ActiveArea,
  maxReductionPercent = 0.7 // Don't go below 70% of original size
): number {
  const charCount = text.length
  const availableHeight = activeArea.height
  const baseSize = activeArea.fontSize
  const lineHeight = activeArea.lineHeight
  
  // Calculate required height with base font size
  const requiredHeight = charCount * lineHeight
  
  // If it fits, use base size
  if (requiredHeight <= availableHeight) {
    return baseSize
  }
  
  // Calculate scale factor needed
  const scaleFactor = availableHeight / requiredHeight
  const newSize = Math.max(baseSize * scaleFactor, baseSize * maxReductionPercent)
  
  return Math.floor(newSize)
}

