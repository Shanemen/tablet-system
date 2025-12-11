/**
 * Ceremony Header Component
 * 
 * Two display modes:
 * - full: Shows all details (name, presiding monk, date, location, deadline)
 * - compact: Shows only name with decorative underline
 * 
 * Usage:
 * - First page (Applicant Info): full
 * - Middle pages (Type Selector, Entry Form): compact
 * - Summary Page: full
 */

'use client'

import { Calendar, MapPin, Clock, User } from 'lucide-react'

export interface CeremonyInfo {
  name_zh: string
  presiding_monk?: string | null
  start_at: string
  end_at?: string | null
  location?: string | null
  deadline_at: string
}

interface CeremonyHeaderProps {
  ceremony: CeremonyInfo
  variant?: 'full' | 'compact'
}

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CeremonyHeader({ ceremony, variant = 'full' }: CeremonyHeaderProps) {
  // Compact version - name + "牌位申請表" with smart wrapping
  // When wrapping occurs, separator is hidden and 牌位申請表 moves to next line
  if (variant === 'compact') {
    return (
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl flex flex-wrap items-baseline gap-x-2 gap-y-0">
          <span className="text-primary font-bold">{ceremony.name_zh}</span>
          <span className="text-muted-foreground font-normal whitespace-nowrap">
            <span className="hidden sm:inline">｜ </span>
            牌位申請表
          </span>
        </h1>
      </div>
    )
  }

  // Full version - all details in a div
  // Order: name, presiding monk, date/time, location, deadline
  return (
    <div className="p-4 sm:p-6 mb-6 bg-primary/5 border border-primary/20 rounded-lg">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4">
        {ceremony.name_zh}
      </h1>

      <div className="space-y-3 text-base">
        {/* Presiding Monk - 主法和尚 */}
        {ceremony.presiding_monk && (
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-muted-foreground">主法和尚：</span>
              <span className="text-foreground font-medium">{ceremony.presiding_monk}</span>
            </div>
          </div>
        )}

        {/* Date/Time - 法會日期 */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-muted-foreground">法會日期：</span>
            <span className="text-foreground font-medium">
              {formatDateTime(ceremony.start_at)}
              {ceremony.end_at && ceremony.end_at !== ceremony.start_at && (
                <> 至 {formatDateTime(ceremony.end_at)}</>
              )}
            </span>
          </div>
        </div>

        {/* Location - 地點 */}
        {ceremony.location && (
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-muted-foreground">地點：</span>
              <span className="text-foreground font-medium">{ceremony.location}</span>
            </div>
          </div>
        )}

        {/* Deadline - 申請截止 */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-muted-foreground">申請截止：</span>
            <span className="font-medium text-foreground">
              {formatDateTime(ceremony.deadline_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

