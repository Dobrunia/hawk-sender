const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 183

export function isWithinSixMonths(date: string | Date, now = Date.now()): boolean {
  const timestamp = new Date(date).getTime()

  if (Number.isNaN(timestamp)) {
    return false
  }

  return now - timestamp < SIX_MONTHS_MS
}
