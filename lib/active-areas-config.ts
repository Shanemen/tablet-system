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
 * - Center Y + Height + fontSize: Same as Longevity (312, 300, 42px)
 * - Left: Same as Karmic Creditors (8, 350, 50, 320, fontSize 20)
 */
export const DECEASED_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'deceased',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,        // Same as Longevity & Ancestors
      y: 312,       // Same as Longevity (NOT 280!)
      width: 230,   // Same as Longevity & Ancestors
      height: 300,  // Same as Longevity (NOT 340!)
      purpose: 'honoree',
      fontSize: 42, // Same as Longevity (BASE_SIZE)
      lineHeight: 42,
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
      fontSize: 42,    // BASE_SIZE (Same as Longevity & Deceased for visual uniformity)
      lineHeight: 42,
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
 * - Center: Memorial text for the baby (可能很长，允许换行)
 *   例如："陈姓二位流产婴孩菩萨" 或 "故儿妙音"
 * - Left: Parents' names (父 + 母)
 *   格式："父 [父亲名字] 母 [母亲名字]"
 *   例如："父 陈明 母 李华"
 *   英文：John Smith & Amy Latter
 */
export const ABORTED_SPIRITS_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'aborted-spirits',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,        // Same as Deceased
      y: 312,       // Same as Deceased (unified standard)
      width: 230,
      height: 300,
      purpose: 'honoree',
      fontSize: 42, // Unified standard
      lineHeight: 42,
    },
    {
      id: 'left-petitioner',
      x: 8,         // Same as Deceased
      y: 350,       // Same as Deceased
      width: 50,
      height: 320,
      purpose: 'petitioner',
      fontSize: 20, // Unified standard
      lineHeight: 20,
    },
  ],
}

/**
 * Land Deity Tablet Configuration
 * 地基主配置
 * 
 * - 2 active areas (center + left)
 * - Center: Address + "之地基主" (需要自动换行)
 *   中文示例：中國福建省福州市蘭花區向陽橋路1009號之地基主
 *   英文示例：123 Main Street, Union City, UT 12345 U.S.
 * - Left: Applicant name only (无称谓)
 *   例如："陈明" 或 "John Smith"
 */
export const LAND_DEITY_TEMPLATE_CONFIG: TabletTemplateConfig = {
  templateId: 'land-deity',
  svgWidth: 320,
  svgHeight: 848,
  activeAreas: [
    {
      id: 'center',
      x: 45,        // Same as Deceased
      y: 312,       // Same as Deceased (unified standard)
      width: 230,
      height: 300,
      purpose: 'honoree',
      fontSize: 42, // Unified standard
      lineHeight: 42,
    },
    {
      id: 'left-petitioner',
      x: 8,         // Same as Deceased
      y: 350,       // Same as Deceased
      width: 50,
      height: 320,
      purpose: 'petitioner',
      fontSize: 20, // Unified standard
      lineHeight: 20,
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

  // 2. Try Multi-line (2 or 3 lines max - breakpoint thinking)
  const words = text.split(' ')
  
  // If only one word or empty, must use single line (even if small)
  if (words.length <= 1) {
    return { 
      fontSize: Math.max(singleLineFontSize, 12), // Ensure min 12px
      mode: 'single-line', 
      lines: [text] 
    }
  }

  // Breakpoint thinking: Only break if single-line font would be too small
  const MIN_READABLE_SIZE = 16 // Breakpoint: break into lines if font < 16px
  
  if (singleLineFontSize >= MIN_READABLE_SIZE) {
    // Single line is readable, no need to break
    return {
      fontSize: singleLineFontSize,
      mode: 'single-line',
      lines: [text]
    }
  }

  // Font too small, try 2 lines first, then 3 lines if needed
  let bestLines: string[] = [text]
  let bestFontSize = singleLineFontSize
  const maxLines = Math.min(3, words.length) // Max 3 lines

  for (let numLines = 2; numLines <= maxLines; numLines++) {
    // Try different ways to split into numLines
    const linesVariations = splitIntoLines(words, numLines)
    
    for (const lines of linesVariations) {
      // Calculate max font size that fits length for all lines
      const maxLen = Math.max(...lines.map(line => getTextLength(line, BASE_SIZE)))
      
      let fs = BASE_SIZE
      if (maxLen > availableLength) {
        fs = Math.floor(BASE_SIZE * (availableLength / maxLen))
      }
      
      // Check if stack height fits
      const stackHeight = numLines * fs * 1.1
      
      if (stackHeight <= availableStackHeight) {
        // It fits! Check if this is the best font size so far
        if (fs > bestFontSize) {
          bestFontSize = fs
          bestLines = lines
        }
      } else {
        // Constrained by stack height
        const heightConstrainedFs = Math.floor(availableStackHeight / (numLines * 1.1))
        if (heightConstrainedFs > bestFontSize) {
          // Check length constraint again with this fs
          const maxLenWithFs = Math.max(...lines.map(line => getTextLength(line, heightConstrainedFs)))
          if (maxLenWithFs <= availableLength) {
            bestFontSize = heightConstrainedFs
            bestLines = lines
          }
        }
      }
    }
    
    // Breakpoint: If we found a good 2-line solution (>= MIN_READABLE_SIZE), stop
    if (numLines === 2 && bestFontSize >= MIN_READABLE_SIZE) {
      break
    }
  }

  // Use multi-line if it's better than single line
  if (bestLines.length > 1 && bestFontSize > singleLineFontSize) {
    return {
      fontSize: Math.max(bestFontSize, 12), // Ensure min 12px
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
 * Split words into N lines, trying different balanced distributions
 */
function splitIntoLines(words: string[], numLines: number): string[][] {
  if (numLines === 1) return [[words.join(' ')]]
  if (numLines >= words.length) return words.map(w => [w])
  
  const results: string[][] = []
  
  // For 2 lines: try all split points
  if (numLines === 2) {
    for (let i = 1; i < words.length; i++) {
      results.push([
        words.slice(0, i).join(' '),
        words.slice(i).join(' ')
      ])
    }
    return results
  }
  
  // For 3 lines: try a few reasonable splits
  if (numLines === 3 && words.length >= 3) {
    const third = Math.floor(words.length / 3)
    // Try center-weighted split
    results.push([
      words.slice(0, third).join(' '),
      words.slice(third, third * 2).join(' '),
      words.slice(third * 2).join(' ')
    ])
    // Try even split
    for (let i = 1; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        results.push([
          words.slice(0, i).join(' '),
          words.slice(i, j).join(' '),
          words.slice(j).join(' ')
        ])
      }
    }
  }
  
  return results
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
/**
 * Result type for Chinese text calculation
 */
export type ChineseFontResult = {
  fontSize: number
  columns: string[] // Array of column texts (1 column = no split, 2-3 columns = split)
}

export function calculateFontSize(
  text: string,
  activeArea: ActiveArea,
  allowMultiColumn: boolean = false // Only enable for aborted-spirits and land-deity
): ChineseFontResult {
  const isEnglish = isEnglishText(text)
  
  if (isEnglish) {
    const result = calculateEnglishFont(text, activeArea)
    // For English, we don't use columns, just return as single column
    return { fontSize: result.fontSize, columns: [text] }
  }
  
  // For Chinese text: Use breakpoint strategy with optional multi-column support
  const BASE_SIZE = activeArea.fontSize // 42px for center areas, 20px for left areas
  const MIN_READABLE_SIZE = 20 // Breakpoint: split into columns if font < 20px
  
  // Calculate single-column font size
  const singleColumnSize = calculateSingleColumnSize(text, activeArea.height, BASE_SIZE)
  
  // If multi-column not allowed (longevity, deceased, ancestors), just return single column
  if (!allowMultiColumn) {
    return { fontSize: Math.floor(singleColumnSize), columns: [text] }
  }
  
  // Multi-column is allowed (aborted-spirits, land-deity)
  // Breakpoint thinking: Only split if single-column font would be too small
  if (singleColumnSize >= MIN_READABLE_SIZE) {
    // Single column is readable, no need to split
    return { fontSize: Math.floor(singleColumnSize), columns: [text] }
  }
  
  // Font too small, try 2 columns, then 3 columns if needed
  let bestFontSize = singleColumnSize
  let bestColumns = [text]
  const maxColumns = Math.min(3, text.length) // Max 3 columns
  
  for (let numCols = 2; numCols <= maxColumns; numCols++) {
    const charsPerCol = Math.ceil(text.length / numCols)
    const columns: string[] = []
    
    for (let i = 0; i < numCols; i++) {
      const start = i * charsPerCol
      const end = Math.min((i + 1) * charsPerCol, text.length)
      columns.push(text.substring(start, end))
    }
    
    // Find the tallest column (which determines the font size)
    const maxColSize = Math.max(...columns.map(col => 
      calculateSingleColumnSize(col, activeArea.height, BASE_SIZE)
    ))
    
    if (maxColSize > bestFontSize) {
      bestFontSize = maxColSize
      bestColumns = columns
    }
    
    // Breakpoint: If we found a good 2-column solution, stop
    if (numCols === 2 && bestFontSize >= MIN_READABLE_SIZE) {
      break
    }
  }
  
  return { 
    fontSize: Math.floor(Math.max(bestFontSize, 12)), // Ensure min 12px
    columns: bestColumns 
  }
}

/**
 * Calculate font size for a single column of Chinese text
 */
function calculateSingleColumnSize(text: string, availableHeight: number, baseSize: number): number {
  // Count characters, treating spaces specially
  let totalHeightUnits = 0
  
  for (const char of text) {
    if (char === ' ') {
      totalHeightUnits += 0.5 // Space takes half a unit
    } else {
      totalHeightUnits += 1.0 // Regular character takes one unit
    }
  }

  // If no text, return base size
  if (totalHeightUnits === 0) {
    return baseSize
  }
  
  // Calculate max font size that fits the available height
  const maxPossibleFontSize = availableHeight / totalHeightUnits
  
  // Use base size if it fits, otherwise scale down
  return Math.min(baseSize, maxPossibleFontSize)
}



