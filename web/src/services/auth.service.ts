/**
 * Authentication Service
 * Handles auth-related functions and utilities
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if password is strong enough
 * Requirements: at least 8 characters, 1 uppercase, 1 number, 1 special char
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false
  if (!/[A-Z]/.test(password)) return false
  if (!/[0-9]/.test(password)) return false
  if (!/[!@#$%^&*]/.test(password)) return false
  return true
}
