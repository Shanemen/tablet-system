/**
 * Temple Types and Theme Configuration
 * 
 * Defines types for temple data and theme customization.
 * Theme config is stored in the temples table as JSONB.
 */

/**
 * Theme configuration for temple-specific styling
 * Stored in temples.theme_config JSONB column
 */
export interface TempleThemeConfig {
  /** Background color for the apply page banner */
  banner_bg?: 'primary' | 'card' | 'white' | 'muted'
  /** Text color for the apply page banner */
  banner_text?: 'primary-foreground' | 'foreground' | 'primary'
  // Future extensibility:
  // sidebar_bg?: string
  // accent_color?: string
}

/**
 * Temple information from the temples table
 */
export interface TempleInfo {
  id: number
  name_zh: string
  name_en?: string | null
  logo_url?: string | null
  /** 'bw' for black & white (print on colored paper), 'color' for colored backgrounds */
  image_style: 'bw' | 'color'
  /** Theme configuration for UI customization */
  theme_config?: TempleThemeConfig | null
}

/**
 * Available avatar options (files in /public/avatars/)
 */
export type AvatarOption = 
  | 'boba.png'
  | 'cheesecake.png'
  | 'daffodil.png'
  | 'fairy-jar.png'
  | 'grapefruit.png'
  | 'hyacinth.png'
  | 'latte.png'
  | 'lotus.png'
  | 'pearl.png'
  | 'pinwheel.png'
  | 'tomato.png'

/** Default avatar when none is specified */
export const DEFAULT_AVATAR: AvatarOption = 'lotus.png'

