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
  return s2t(text)
}

