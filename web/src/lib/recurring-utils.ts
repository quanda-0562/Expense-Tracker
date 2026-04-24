/**
 * Utilities for calculating and managing recurring transaction dates
 */

export type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'

/**
 * Calculate the next occurrence date for a recurring transaction
 */
export function getNextOccurrenceDate(currentDate: Date, pattern: RecurringPattern): Date {
  const next = new Date(currentDate)

  switch (pattern) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      break
    case 'weekly':
      next.setDate(next.getDate() + 7)
      break
    case 'biweekly':
      next.setDate(next.getDate() + 14)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      break
    case 'quarterly':
      next.setMonth(next.getMonth() + 3)
      break
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1)
      break
  }

  return next
}

/**
 * Check if a recurring transaction should generate a new transaction today
 * Returns true if:
 * - It's active
 * - Today is >= start_date
 * - Today is <= end_date (if set)
 * - The pattern suggests it should generate today
 * - It hasn't been generated today already
 */
export function shouldGenerateToday(
  lastGeneratedDate: string | null,
  startDate: string,
  endDate: string | null,
  pattern: RecurringPattern,
  today: Date = new Date()
): boolean {
  const todayStr = formatDate(today)
  
  // Haven't generated yet
  if (!lastGeneratedDate) {
    // Can only generate if today >= start_date
    if (todayStr < startDate) return false
    // Check if end_date has passed
    if (endDate && todayStr > endDate) return false
    return true
  }

  // Already generated today
  if (lastGeneratedDate === todayStr) return false

  // Check if end_date has passed
  if (endDate && todayStr > endDate) return false

  // Check if it's time to generate based on pattern
  const lastGenDate = new Date(lastGeneratedDate)
  const nextGenDate = getNextOccurrenceDate(lastGenDate, pattern)

  return today >= nextGenDate
}

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get all dates between startDate and endDate (inclusive) for a pattern
 * Used for backfill/catch-up scenarios
 */
export function getDatesBetween(startDate: Date, endDate: Date, pattern: RecurringPattern): Date[] {
  const dates: Date[] = []
  let current = new Date(startDate)

  while (current <= endDate) {
    dates.push(new Date(current))
    current = getNextOccurrenceDate(current, pattern)
  }

  return dates
}
