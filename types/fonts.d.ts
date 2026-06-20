// Ambient type declarations for untyped font deps used by the dynamic-subset font pipeline.

declare module 'subset-font' {
  /** Subset `font` down to the glyphs needed for `text`. Returns the subset font buffer. */
  function subsetFont(
    font: Buffer | Uint8Array,
    text: string,
    options?: { targetFormat?: 'truetype' | 'woff' | 'woff2' | 'sfnt' }
  ): Promise<Buffer>
  export default subsetFont
}

declare module 'fontverter' {
  /** Convert a font buffer between formats (e.g. 'woff2' -> 'truetype'). */
  export function convert(
    font: Buffer | Uint8Array,
    toFormat: 'truetype' | 'woff' | 'woff2' | 'sfnt',
    fromFormat?: string
  ): Promise<Buffer>
}
