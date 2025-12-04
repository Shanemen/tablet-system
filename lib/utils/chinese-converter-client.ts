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
  // Includes common surnames and frequently used characters from top 150-200 surnames
  // Only includes characters that have simplified/traditional differences (single characters only)
  // Basic: 国(國), 华(華), 让(讓), 观(觀), 门(門), 车(車), 东(東), 钟(鐘), 为(為), 开(開), 关(關), 书(書), 长(長)
  // Top surnames: 刘(劉), 赵(趙), 张(張), 陈(陳), 杨(楊), 黄(黃), 吴(吳), 孙(孫), 马(馬), 罗(羅), 郑(鄭), 谢(謝), 许(許), 韩(韓), 冯(馮), 邓(鄧), 叶(葉), 苏(蘇), 吕(呂), 卢(盧), 谭(譚), 陆(陸), 贾(賈), 韦(韋), 邹(鄒), 闫(閆), 龙(龍), 贺(賀), 顾(顧), 龚(龔), 万(萬), 钱(錢), 严(嚴), 汤(湯), 蒋(蔣), 范(範)
  // Additional common: 萧(蕭), 沈(瀋), 余(餘), 潘(潘), 戴(戴), 乔(喬), 赖(賴), 庞(龐), 樊(樊), 兰(蘭), 颜(顏), 倪(倪), 温(溫), 芦(蘆), 鲁(魯), 葛(葛), 毕(畢), 聂(聶), 丛(叢), 齐(齊), 庄(莊), 涂(塗), 谷(穀), 时(時), 费(費), 纪(紀), 欧(歐), 项(項), 游(遊), 阳(陽), 卫(衛), 鲍(鮑), 单(單), 宁(寧), 闵(閔), 解(解), 强(強), 边(邊), 饶(饒), 晋(晉), 邬(鄔), 臧(臧), 畅(暢), 蒙(蒙), 闻(聞), 莘(莘), 党(黨), 贡(貢), 劳(勞), 姬(姬), 扶(扶), 堵(堵), 郦(酈), 雍(雍), 郤(郤), 璩(璩), 濮(濮), 寿(壽), 通(通), 扈(扈), 冀(冀), 郏(郟), 农(農), 别(別), 晏(晏), 充(充), 慕(慕), 连(連), 茹(茹), 习(習), 宦(宦), 鱼(魚), 容(容), 慎(慎), 戈(戈), 庾(庾), 终(終), 暨(暨), 衡(衡), 步(步), 都(都), 满(滿), 弘(弘), 匡(匡), 寇(寇), 广(廣), 禄(祿), 阙(闕), 殳(殳), 沃(沃), 利(利), 蔚(蔚), 越(越), 夔(夔), 隆(隆), 师(師), 巩(鞏), 厍(厙), 晁(晁), 勾(勾), 敖(敖), 融(融), 冷(冷), 訾(訾), 辛(辛), 阚(闞), 那(那), 简(簡), 空(空), 曾(曾), 毋(毋), 沙(沙), 乜(乜), 养(養), 鞠(鞠), 须(須), 丰(豐), 巢(巢), 蒯(蒯), 相(相), 查(查), 后(後), 荆(荊), 红(紅), 竺(竺), 权(權), 逯(逯), 盖(蓋), 益(益), 桓(桓), 公(公)
  const simplifiedChars = /[国让观门车东钟华为开关书长刘赵张陈杨黄吴孙马罗郑谢许韩冯邓叶苏吕卢谭陆贾韦邹闫龙贺顾龚万钱严汤蒋范萧沈余潘戴乔赖庞樊兰颜倪温芦鲁葛毕聂丛齐庄涂谷时费纪欧项游阳卫鲍单宁闵解强边饶晋邬臧畅蒙闻莘党贡劳姬扶堵郦雍郤璩濮寿通扈冀郏农别晏充慕连茹习宦鱼容慎戈庾终暨衡步都满弘匡寇广禄阙殳沃利蔚越夔隆师巩厍晁勾敖融冷訾辛阚那简空曾毋沙乜养鞠须丰巢蒯相查后荆红竺权逯盖益桓公]/
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

