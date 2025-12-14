/**
 * Theme Helpers
 * 
 * Utility functions to convert theme config values to Tailwind classes.
 * Used by components that need temple-specific styling.
 */

import type { TempleThemeConfig } from '@/lib/types/temple'

/** Map theme config background values to Tailwind classes */
const BG_CLASS_MAP: Record<NonNullable<TempleThemeConfig['banner_bg']>, string> = {
  'primary': 'bg-primary',
  'card': 'bg-card',
  'white': 'bg-white',
  'muted': 'bg-muted'
}

/** Map theme config text color values to Tailwind classes */
const TEXT_CLASS_MAP: Record<NonNullable<TempleThemeConfig['banner_text']>, string> = {
  'primary-foreground': 'text-primary-foreground',
  'foreground': 'text-foreground',
  'primary': 'text-primary'
}

/** Default theme values when not specified */
const DEFAULT_BANNER_BG: NonNullable<TempleThemeConfig['banner_bg']> = 'card'
const DEFAULT_BANNER_TEXT: NonNullable<TempleThemeConfig['banner_text']> = 'foreground'

/**
 * Get Tailwind classes for the temple banner based on theme config
 * 
 * @param themeConfig - Theme configuration from the temples table
 * @returns Object with bgClass and textClass for the banner
 * 
 * @example
 * const { bgClass, textClass } = getBannerClasses(temple?.theme_config)
 * // bgClass: 'bg-primary', textClass: 'text-primary-foreground'
 */
export function getBannerClasses(themeConfig?: TempleThemeConfig | null): {
  bgClass: string
  textClass: string
} {
  const bgKey = themeConfig?.banner_bg ?? DEFAULT_BANNER_BG
  const textKey = themeConfig?.banner_text ?? DEFAULT_BANNER_TEXT
  
  return {
    bgClass: BG_CLASS_MAP[bgKey],
    textClass: TEXT_CLASS_MAP[textKey]
  }
}

/**
 * Get the avatar image path for a user
 * 
 * @param avatar - Avatar filename from admin_user_temple table
 * @returns Full path to the avatar image
 * 
 * @example
 * const avatarSrc = getAvatarPath('pearl.png')
 * // Returns: '/avatars/pearl.png'
 */
export function getAvatarPath(avatar?: string | null): string {
  const avatarFile = avatar || 'lotus.png'
  return `/avatars/${avatarFile}`
}

