/**
 * Temple Banner Component
 * 
 * Fixed banner at the top of public pages showing temple logo/name
 * Uses existing design system (Tailwind classes matching Sidebar)
 */

'use client'

import Image from 'next/image'

interface TempleInfo {
  name_zh: string
  logo_url?: string | null
}

interface TempleBannerProps {
  temple?: TempleInfo | null
}

export function TempleBanner({ temple }: TempleBannerProps) {
  // Don't render if no temple info
  if (!temple) return null

  return (
    <div className="w-full bg-primary border-b border-border py-3 px-4 sm:px-6 mb-6">
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
          // Text fallback when no logo
          <p className="text-base font-medium text-primary">
            {temple.name_zh}
          </p>
        )}
      </div>
    </div>
  )
}

