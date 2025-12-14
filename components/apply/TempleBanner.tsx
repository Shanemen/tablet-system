/**
 * Temple Banner Component
 * 
 * Fixed banner at the top of public pages showing temple logo/name
 * Supports temple-specific theming via theme_config from database
 */

'use client'

import Image from 'next/image'
import { getBannerClasses } from '@/lib/utils/theme-helpers'
import type { TempleThemeConfig } from '@/lib/types/temple'

interface TempleInfo {
  name_zh: string
  logo_url?: string | null
  theme_config?: TempleThemeConfig | null
}

interface TempleBannerProps {
  temple?: TempleInfo | null
}

export function TempleBanner({ temple }: TempleBannerProps) {
  // Don't render if no temple info
  if (!temple) return null

  // Get theme classes from database config (with defaults)
  const { bgClass, textClass } = getBannerClasses(temple.theme_config)

  return (
    <div className={`w-full ${bgClass} border-b border-border py-3 px-4 sm:px-6 mb-6`}>
      <div className="max-w-3xl mx-auto">
        {temple.logo_url ? (
          // Logo image (already contains temple name)
          <Image 
            src={temple.logo_url} 
            alt={temple.name_zh} 
            width={180} 
            height={45}
            className="object-contain"
          />
        ) : (
          // Text fallback when no logo - uses theme text color
          <p className={`text-base font-medium ${textClass}`}>
            {temple.name_zh}
          </p>
        )}
      </div>
    </div>
  )
}
