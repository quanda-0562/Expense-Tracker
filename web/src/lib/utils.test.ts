import {
  getPeriodDates,
  calculatePercentage,
  roundToTwo,
  truncate,
  generateId,
  formatCurrency,
  formatDate,
} from './utils'

describe('utils', () => {
  describe('getPeriodDates', () => {
    it('should return today start and end for period=today', () => {
      // Arrange
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      // Act
      const { start, end } = getPeriodDates('today')

      // Assert
      expect(start.getFullYear()).toBe(today.getFullYear())
      expect(start.getMonth()).toBe(today.getMonth())
      expect(start.getDate()).toBe(today.getDate())
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)

      expect(end.getFullYear()).toBe(today.getFullYear())
      expect(end.getMonth()).toBe(today.getMonth())
      expect(end.getDate()).toBe(today.getDate())
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
    })

    it('should return week start (Sunday) for period=week', () => {
      // Arrange & Act
      const { start, end } = getPeriodDates('week')

      // Assert - start should be Sunday (getDay() === 0)
      expect(start.getDay()).toBe(0)

      // End should be 6 days later
      const dayDiff = (end.getDate() - start.getDate() + 28) % 28
      expect(dayDiff).toBe(6)
    })

    it('should return first and last day of month for period=month', () => {
      // Arrange
      const now = new Date()

      // Act
      const { start, end } = getPeriodDates('month')

      // Assert
      expect(start.getDate()).toBe(1)
      expect(start.getMonth()).toBe(now.getMonth())
      expect(start.getFullYear()).toBe(now.getFullYear())

      expect(end.getMonth()).toBe(now.getMonth())
      expect(end.getFullYear()).toBe(now.getFullYear())
      // Next month's day 0 is last day of current month
      expect(new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate()).toBe(
        end.getDate()
      )
    })

    it('should return Jan 1 and Dec 31 for period=year', () => {
      // Arrange
      const now = new Date()

      // Act
      const { start, end } = getPeriodDates('year')

      // Assert
      expect(start.getMonth()).toBe(0) // January
      expect(start.getDate()).toBe(1)
      expect(start.getFullYear()).toBe(now.getFullYear())

      expect(end.getMonth()).toBe(11) // December
      expect(end.getDate()).toBe(31)
      expect(end.getFullYear()).toBe(now.getFullYear())
    })

    it('should set start time to midnight', () => {
      // Arrange & Act
      const { start } = getPeriodDates('month')

      // Assert
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)
      expect(start.getMilliseconds()).toBe(0)
    })

    it('should set end time to 23:59:59.999 for today', () => {
      // Arrange & Act
      const { end } = getPeriodDates('today')

      // Assert
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(end.getSeconds()).toBe(59)
      expect(end.getMilliseconds()).toBe(999)
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      // Arrange
      const value = 25
      const total = 100

      // Act
      const result = calculatePercentage(value, total)

      // Assert
      expect(result).toBe(25)
    })

    it('should round to nearest integer', () => {
      // Arrange
      const value = 1
      const total = 3 // 33.333...%

      // Act
      const result = calculatePercentage(value, total)

      // Assert
      expect(result).toBe(33)
    })

    it('should return 0 if total is 0', () => {
      // Arrange
      const value = 100
      const total = 0

      // Act
      const result = calculatePercentage(value, total)

      // Assert
      expect(result).toBe(0)
    })

    it('should return 100 for full value', () => {
      // Arrange
      const value = 100
      const total = 100

      // Act
      const result = calculatePercentage(value, total)

      // Assert
      expect(result).toBe(100)
    })

    it('should handle decimals correctly', () => {
      // Arrange
      const value = 50.5
      const total = 100

      // Act
      const result = calculatePercentage(value, total)

      // Assert
      expect(result).toBe(51) // Rounded up
    })

    it('should return 0 for 0 value', () => {
      // Arrange
      const value = 0
      const total = 100

      // Act
      const result = calculatePercentage(value, total)

      // Assert
      expect(result).toBe(0)
    })
  })

  describe('roundToTwo', () => {
    it('should round to 2 decimal places', () => {
      // Arrange
      const num = 3.14159

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(3.14)
    })

    it('should round up correctly', () => {
      // Arrange
      const num = 10.156

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(10.16)
    })

    it('should round down correctly', () => {
      // Arrange
      const num = 10.154

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(10.15)
    })

    it('should handle whole numbers', () => {
      // Arrange
      const num = 42

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(42)
    })

    it('should handle negative numbers', () => {
      // Arrange
      const num = -3.14159

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(-3.14)
    })

    it('should return exact value when less than 2 decimals', () => {
      // Arrange
      const num = 10.5

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(10.5)
    })

    it('should handle very small numbers', () => {
      // Arrange
      const num = 0.001

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(0)
    })

    it('should handle zero', () => {
      // Arrange
      const num = 0

      // Act
      const result = roundToTwo(num)

      // Assert
      expect(result).toBe(0)
    })
  })

  describe('truncate', () => {
    it('should truncate string longer than length', () => {
      // Arrange
      const str = 'Hello World'
      const length = 5

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toBe('Hello...')
    })

    it('should not truncate string shorter than length', () => {
      // Arrange
      const str = 'Hi'
      const length = 5

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toBe('Hi')
    })

    it('should not truncate string equal to length', () => {
      // Arrange
      const str = 'Hello'
      const length = 5

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toBe('Hello')
    })

    it('should add ellipsis after truncated text', () => {
      // Arrange
      const str = 'Hello World'
      const length = 6

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toContain('...')
      expect(result.startsWith('Hello ')).toBe(true)
    })

    it('should handle empty string', () => {
      // Arrange
      const str = ''
      const length = 5

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toBe('')
    })

    it('should handle length of 0', () => {
      // Arrange
      const str = 'Hello'
      const length = 0

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toBe('...')
    })

    it('should handle special characters', () => {
      // Arrange
      const str = 'Hello @#$% World'
      const length = 5

      // Act
      const result = truncate(str, length)

      // Assert
      expect(result).toBe('Hello...')
    })
  })

  describe('generateId', () => {
    it('should generate non-empty string', () => {
      // Arrange & Act
      const id = generateId()

      // Assert
      expect(typeof id).toBe('string')
      expect(id.length).toBeGreaterThan(0)
    })

    it('should generate unique IDs', () => {
      // Arrange & Act
      const id1 = generateId()
      const id2 = generateId()

      // Assert
      expect(id1).not.toBe(id2)
    })

    it('should include timestamp', () => {
      // Arrange
      const before = Date.now()

      // Act
      const id = generateId()

      const after = Date.now()

      // Assert
      const timestamp = parseInt(id.split('-')[0])
      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })

    it('should have expected format', () => {
      // Arrange & Act
      const id = generateId()

      // Assert
      expect(id).toMatch(/^\d+-[a-z0-9]+$/)
    })

    it('should generate multiple unique IDs', () => {
      // Arrange
      const ids = new Set()

      // Act
      for (let i = 0; i < 100; i++) {
        ids.add(generateId())
      }

      // Assert
      expect(ids.size).toBe(100)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency with dollar sign', () => {
      // Arrange
      const amount = 100

      // Act
      const result = formatCurrency(amount)

      // Assert
      expect(result).toContain('$')
      expect(result).toContain('100')
    })

    it('should format with 2 decimal places', () => {
      // Arrange
      const amount = 10.5

      // Act
      const result = formatCurrency(amount)

      // Assert
      expect(result).toMatch(/\d+\.\d{2}/)
    })

    it('should handle zero', () => {
      // Arrange
      const amount = 0

      // Act
      const result = formatCurrency(amount)

      // Assert
      expect(result).toContain('$')
      expect(result).toContain('0')
    })

    it('should handle large numbers with comma separators', () => {
      // Arrange
      const amount = 1000.50

      // Act
      const result = formatCurrency(amount)

      // Assert
      expect(result).toContain('1,000')
    })
  })

  describe('formatDate', () => {
    it('should format date to readable format', () => {
      // Arrange
      const date = new Date('2024-01-15')

      // Act
      const result = formatDate(date)

      // Assert
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should include month, day, and year', () => {
      // Arrange
      const date = new Date('2024-01-15')

      // Act
      const result = formatDate(date)

      // Assert
      expect(result).toMatch(/\d+/)
      expect(result.toLowerCase()).toMatch(/jan|january|01/)
    })

    it('should handle different months', () => {
      // Arrange
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-12-15')

      // Act
      const result1 = formatDate(date1)
      const result2 = formatDate(date2)

      // Assert
      expect(result1).not.toBe(result2)
    })

    it('should handle same day in different months', () => {
      // Arrange
      const date1 = new Date('2024-01-15')
      const date2 = new Date('2024-02-15')

      // Act
      const result1 = formatDate(date1)
      const result2 = formatDate(date2)

      // Assert
      expect(result1).not.toBe(result2)
    })
  })
})
