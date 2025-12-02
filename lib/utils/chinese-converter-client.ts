/**
 * Client-side Chinese Converter with Smart Detection
 * 
 * Uses dual detection strategy:
 * 1. Text detection (core) - Detects simplified Chinese characters
 * 2. Browser locale detection (optimization) - Pre-loads for zh-CN users
 * 
 * Only loads opencc-js (300KB) when necessary, optimizing performance for
 * 50-70% of users who don't need conversion.
 */

// Lightweight simplified Chinese character detection (no dependencies, < 1ms)
function hasSimplifiedChars(text: string): boolean {
  // Common simplified characters with clear traditional equivalents
  // 国(國), 华(華), 让(讓), 观(觀), 门(門), 车(車), 东(東), 
  // 钟(鐘), 为(為), 开(開), 关(關), 书(書), 长(長), 刘(劉)
  const simplifiedChars = /[国让观门车东钟华为开关书长刘]/
  return simplifiedChars.test(text)
}

// Smart detection: text-first + locale fallback
function needsConversion(text: string): boolean {
  // 1. CORE LOGIC: Detect simplified characters (most reliable)
  // Regardless of user location/system, convert if simplified chars detected
  if (hasSimplifiedChars(text)) {
    return true // Simplified chars found, must convert
  }
  
  // 2. PERFORMANCE OPTIMIZATION: Simplified locale users
  // Even if text appears traditional, may have mixed usage, convert for safety
  const locale = navigator.language.toLowerCase()
  const isSimplifiedLocale = locale.startsWith('zh-cn') || locale === 'zh' || locale === 'zh-hans'
  if (isSimplifiedLocale) {
    return true
  }
  
  // 3. OTHER CASES: Traditional system + pure traditional text, or English users
  return false
}

// Lazy-load opencc-js converter (only downloads when needed)
let converterPromise: Promise<any> | null = null

/**
 * Convert simplified Chinese to traditional Chinese
 * 
 * Smart detection ensures conversion only happens when needed:
 * - zh-TW user typing "張偉" → NO conversion, 0KB download
 * - zh-TW user typing "刘德华" → YES conversion, 300KB download (edge case)
 * - zh-CN user → Always convert (safe default)
 * 
 * @param text Input text (may be simplified or traditional)
 * @returns Traditional Chinese text
 */
export async function convertToTraditional(text: string): Promise<string> {
  if (!text) return text
  
  // Smart detection: combine locale and text features
  if (!needsConversion(text)) {
    return text // No conversion needed, return as-is
  }
  
  // Conversion needed, lazy-load opencc-js (300KB, only once)
  if (!converterPromise) {
    converterPromise = import('opencc-js').then((module) => {
      const Converter = module.Converter
      return Converter({ from: 'cn', to: 'tw' })
    })
  }
  
  const converter = await converterPromise
  return converter(text)
}

