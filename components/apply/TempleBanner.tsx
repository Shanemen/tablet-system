/**
 * Temple Banner Component
 * 
 * Fixed banner at the top of public pages showing temple logo/name
 * Supports temple-specific theming via theme_config from database
 * 
 * Features:
 * - Logo on the left
 * - "牌位申請表" title and "法會詳情" toggle on the right
 * - Collapsible ceremony info toggle
 */

'use client'

import Image from 'next/image'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getBannerClasses } from '@/lib/utils/theme-helpers'
import type { TempleThemeConfig } from '@/lib/types/temple'

interface TempleInfo {
  name_zh: string
  logo_url?: string | null
  theme_config?: TempleThemeConfig | null
}

interface TempleBannerProps {
  temple?: TempleInfo | null
  /** Whether to show the ceremony toggle button */
  showCeremonyToggle?: boolean
  /** Current expanded state of ceremony info */
  isCeremonyExpanded?: boolean
  /** Callback when toggle is clicked */
  onCeremonyToggle?: () => void
}

export function TempleBanner({ 
  temple, 
  showCeremonyToggle = false,
  isCeremonyExpanded = false,
  onCeremonyToggle
}: TempleBannerProps) {
  // Don't render if no temple info
  if (!temple) return null

  // Get theme classes from database config (with defaults)
  const { bgClass, textClass } = getBannerClasses(temple.theme_config)

  return (
    <div className={`w-full ${bgClass} border-b border-border py-3 px-4 sm:px-6 mb-6`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {/* Logo - Left aligned */}
        <div className="flex-shrink-0">
          {temple.logo_url ? (
            <Image 
              src={temple.logo_url} 
              alt={temple.name_zh} 
              width={180} 
              height={45}
              className="object-contain"
            />
          ) : (
            <p className={`text-base font-medium ${textClass}`}>
              {temple.name_zh}
            </p>
          )}
        </div>

        {/* Right side - Title and Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* 牌位申請表 title */}
          <span className={`text-sm sm:text-base font-medium ${textClass}`}>
            牌位申請表
          </span>

          {/* Ceremony toggle button */}
          {showCeremonyToggle && (
            <button
              onClick={onCeremonyToggle}
              className={`flex items-center gap-1 text-sm sm:text-base font-medium ${textClass} hover:opacity-80 transition-opacity`}
            >
              {isCeremonyExpanded ? (
                <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="hidden sm:inline">法會詳情</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
