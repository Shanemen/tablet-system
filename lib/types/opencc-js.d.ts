/**
 * Type declarations for opencc-js module
 * opencc-js is a Chinese simplified/traditional converter
 */

declare module 'opencc-js' {
  type ConversionFrom = 'cn' | 'tw' | 'hk' | 'jp' | 't'
  type ConversionTo = 'cn' | 'tw' | 'hk' | 'jp' | 't'

  interface ConverterOptions {
    from: ConversionFrom
    to: ConversionTo
  }

  type ConverterFunction = (text: string) => string

  export function Converter(options: ConverterOptions): ConverterFunction
}
