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
  purpose: 'honoree' | 'petitioner' | 'main' | 'applicant' // Support both old and new terminology
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
      purpose: 'honoree',
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
 * - Format: "陽上 [申请人名字] 敬薦"
 * - Center text "佛力超薦 累劫冤親債主 往生蓮位" is fixed in template
 * 
 * Coordinates (user-measured with padding):
 * - X: 8 → 58 (width: 50px)
 * - Y: 350 → 670 (height: 320px)
 * - Font size: 20px (very small area)
 */
export const KARMIC_CREDITORS_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'karmic-creditors',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'left-applicant',
      x: 8,            // User-measured with padding
      y: 350,          // User-measured with padding
      width: 50,       // 58 - 8 = 50px (very narrow)
      height: 320,     // 670 - 350 = 320px
      purpose: 'applicant',
      fontSize: 20,    // User-specified (small font for narrow area)
      lineHeight: 20,  // Same as fontSize for tight spacing
    },
  ],
}

/**
 * Deceased Tablet Configuration
 * 往生莲位配置
 * 
 * - 2 active areas (center + left)
 * - Center: between "佛力超薦" and "往生蓮位" (往生者名字)
 * - Left: between "陽上" and "敬薦" (阳上孝属名字)
 * 
 * Configuration strategy:
 * - Center X + Width: Same as Ancestors (45, 230)
 * - Center Y + Height: Same as Longevity (280, 340)
 * - Left: Same as Karmic Creditors (8, 350, 50, 320, fontSize 20)
 */
export const DECEASED_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'deceased',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,        // Same as Ancestors
      y: 280,       // Same as Longevity
      width: 230,   // Same as Ancestors
      height: 340,  // Same as Longevity
      purpose: 'honoree',
      fontSize: 46,
      lineHeight: 44,
    },
    {
      id: 'left-petitioner',
      x: 8,         // Same as Karmic Creditors
      y: 350,       // Same as Karmic Creditors
      width: 50,    // Same as Karmic Creditors
      height: 320,  // Same as Karmic Creditors
      purpose: 'petitioner',
      fontSize: 20, // Same as Karmic Creditors
      lineHeight: 20,
    },
  ],
}

/**
 * Ancestors Tablet Configuration
 * 历代祖先配置
 * 
 * - 2 active areas (center + left)
 * - Center: for inserting surname in "佛力超薦[姓]氏歷代祖先往生蓮位"
 * - Left: for "陽上後裔 [名字] 叩薦"
 * 
 * Coordinates (user-measured with padding):
 * - Center: Between "佛力超薦" and "氏歷代祖先" (surname only)
 * - Left: Between "陽上後裔" and "叩薦" (full name)
 */
export const ANCESTORS_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'ancestors',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,           // Same as longevity template
      y: 312,          // User-measured with padding
      width: 230,      // Same as longevity template
      height: 178,     // 490 - 312 = 178px (shorter for surname only)
      purpose: 'honoree',
      fontSize: 46,    // Large font for surname
      lineHeight: 44,
    },
    {
      id: 'left-petitioner',
      x: 8,            // Same as karmic-creditors (NOT 15!)
      y: 370,          // User-specified (different from karmic-creditors' 350)
      width: 50,       // Same as karmic-creditors (NOT 60!)
      height: 300,     // 670 - 370 = 300px
      purpose: 'petitioner',
      fontSize: 20,    // Same as karmic-creditors
      lineHeight: 20,  // Same as karmic-creditors
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
  lines: string[]
}

/**
 * Calculate font size for English text
 * Supports single-line and multi-line (up to 2 lines) with dynamic scaling
 */
export function calculateEnglishFont(
  text: string,
  activeArea: ActiveArea
): EnglishFontResult {
  // In rotated mode:
  // - Text length is constrained by activeArea.height (300px)
  // - Text stack height is constrained by activeArea.width (230px)
  const availableLength = activeArea.height
  const availableStackHeight = activeArea.width
  
  const BASE_SIZE = activeArea.fontSize // 42px
  const avgCharWidthRatio = 0.6 // Conservative estimate for Noto Serif
  
  // Helper to estimate text length at a given font size
  const getTextLength = (str: string, fs: number) => str.length * fs * avgCharWidthRatio

  // 1. Try Single Line
  const singleLineLength = getTextLength(text, BASE_SIZE)
  let singleLineFontSize = BASE_SIZE
  
  if (singleLineLength > availableLength) {
    // Scale down to fit length
    const scale = availableLength / singleLineLength
    singleLineFontSize = Math.floor(BASE_SIZE * scale)
  }

  // If single line fits reasonably well (>= 60% of base size), prefer it
  if (singleLineFontSize >= BASE_SIZE * 0.6) {
    return { 
      fontSize: singleLineFontSize, 
      mode: 'single-line', 
      lines: [text] 
    }
  }

  // 2. Try Multi-line (2 lines)
  const words = text.split(' ')
  
  // If only one word or empty, must use single line (even if small)
  if (words.length <= 1) {
    return { 
      fontSize: Math.max(singleLineFontSize, 12), // Ensure min 12px
      mode: 'single-line', 
      lines: [text] 
    }
  }

  // Find best split for 2 lines
  let bestLines: string[] = [text]
  let bestFontSize = 0

  for (let i = 1; i < words.length; i++) {
    const line1 = words.slice(0, i).join(' ')
    const line2 = words.slice(i).join(' ')
    
    // Calculate max font size that fits length for both lines
    const len1 = getTextLength(line1, BASE_SIZE)
    const len2 = getTextLength(line2, BASE_SIZE)
    const maxLen = Math.max(len1, len2)
    
    let fs = BASE_SIZE
    if (maxLen > availableLength) {
      fs = Math.floor(BASE_SIZE * (availableLength / maxLen))
    }
    
    // Check if stack height fits
    // Stack height = 2 lines * fontSize * 1.1 (line height factor)
    const stackHeight = 2 * fs * 1.1
    
    if (stackHeight <= availableStackHeight) {
      // It fits! Check if this is the best font size so far
      if (fs > bestFontSize) {
        bestFontSize = fs
        bestLines = [line1, line2]
      }
    } else {
        // Constrained by stack height
        const heightConstrainedFs = Math.floor(availableStackHeight / (2 * 1.1))
        if (heightConstrainedFs > bestFontSize) {
             // But we must check length constraint again with this fs
             const len1_h = getTextLength(line1, heightConstrainedFs)
             const len2_h = getTextLength(line2, heightConstrainedFs)
             if (Math.max(len1_h, len2_h) <= availableLength) {
                 bestFontSize = heightConstrainedFs
                 bestLines = [line1, line2]
             }
        }
    }
  }

  // Compare single line vs multi-line
  // Prefer multi-line if it gives significantly larger font (e.g. > 1.2x single line)
  if (bestFontSize > singleLineFontSize * 1.2) {
    return {
      fontSize: bestFontSize,
      mode: 'multi-line',
      lines: bestLines
    }
  }

  // Default to single line (scaled as needed, with min size)
  return {
    fontSize: Math.max(singleLineFontSize, 12),
    mode: 'single-line',
    lines: [text]
  }
}

/**
 * Calculate font size and rendering mode for text
 * 
 * Strategy (Professional & Unified):
 * 1. Most names use BASE_SIZE (42px) - looks professional and unified
 * 2. Only extremely long names are scaled down
 * 3. Different whitespace around names is acceptable
 * 
 * Statistics (2024 Research):
 * - Chinese: 
 *   - 2-3 characters = 98% (陳小華, 王明, 李芳) → Use BASE_SIZE
 *   - 4-5 characters = 1% → Still use BASE_SIZE
 *   - 6+ characters = ~1% (上弘下唯法師, 迪麗熱巴·迪力木拉提) → Scale down
 * - English: 
 *   - 11-15 chars = 50% (Typical)
 *   - 16-20 chars = 30% (Common long)
 *   - 21-30 chars = 10% (Long - Breaks UI)
 *   - >30 chars = 1-2% (Very long - Requires scaling/wrapping)
 *   - <10 chars = 5-8% (Short)
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

