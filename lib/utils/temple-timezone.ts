// Hardcoded temple -> IANA timezone.
// We only have a handful of temples; add one line here when onboarding a new one.
const TEMPLE_TIMEZONES: Record<number, string> = {
  2: 'America/Los_Angeles', // 靈山美佛寺 (LA)
  1: 'America/New_York',    // 亞特蘭大大淨宗學會 (Atlanta)
}

const DEFAULT_TIMEZONE = 'America/Los_Angeles'

export function getTempleTimezone(templeId?: number | null): string {
  if (templeId != null && TEMPLE_TIMEZONES[templeId]) {
    return TEMPLE_TIMEZONES[templeId]
  }
  return DEFAULT_TIMEZONE
}

/**
 * Format a stored UTC timestamp as a short M/D/YY date in the temple's local
 * timezone (e.g. "5/29/26"). Conversion is display-only; the stored value stays UTC.
 * Returns '' when there is no usable timestamp.
 */
export function formatSubmissionDate(
  utcTimestamp?: string | null,
  templeId?: number | null
): string {
  if (!utcTimestamp) return ''
  const date = new Date(utcTimestamp)
  if (isNaN(date.getTime())) return ''
  return date.toLocaleDateString('en-US', {
    timeZone: getTempleTimezone(templeId),
    month: 'numeric',
    day: 'numeric',
    year: '2-digit',
  })
}
