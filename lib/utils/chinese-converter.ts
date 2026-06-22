import { Converter } from 'opencc-js'

// 创建简体转繁体转换器（台湾繁体）
const converter = Converter({ from: 'cn', to: 'tw' })
const s2t = converter

/**
 * 将简体中文转换为繁体中文（台湾标准）
 * 用于 OG Image 渲染，确保字体正确显示
 * @param text 输入文本（可能是简体或繁体）
 * @returns 繁体文本
 */
export function convertToTraditional(text: string): string {
  if (!text) return text
  return fixSurnameVariants(s2t(text))
}

// opencc cn->tw maps the surname 于 -> 於 (it prefers the preposition variant). Every value
// converted here is a name / address / liturgical string where 于 is the intended surname and
// 於 never appears legitimately, so restore 于. (于 is in the font subset; 於 would render the
// wrong surname.) Keep in sync with the client converter (lib/utils/chinese-converter-client.ts).
function fixSurnameVariants(s: string): string {
  return s.replace(/於/g, '于')
}

