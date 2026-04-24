import {
  getNextOccurrenceDate,
  shouldGenerateToday,
  formatDate,
  getDatesBetween,
  RecurringPattern,
} from './recurring-utils'

describe('recurring-utils', () => {
  describe('formatDate', () => {
    it('should format date to YYYY-MM-DD', () => {
      // Arrange
      const date = new Date('2024-01-05')

      // Act
      const result = formatDate(date)

      // Assert
      expect(result).toBe('2024-01-05')
    })

    it('should pad month with leading zero', () => {
      // Arrange
      const date = new Date('2024-03-15')

      // Act
      const result = formatDate(date)

      // Assert
      expect(result).toBe('2024-03-15')
    })

    it('should pad day with leading zero', () => {
      // Arrange
      const date = new Date('2024-12-09')

      // Act
      const result = formatDate(date)

      // Assert
      expect(result).toBe('2024-12-09')
    })

    it('should handle end of year correctly', () => {
      // Arrange
      const date = new Date('2024-12-31')

      // Act
      const result = formatDate(date)

      // Assert
      expect(result).toBe('2024-12-31')
    })
  })

  describe('getNextOccurrenceDate', () => {
    it('should add 1 day for daily pattern', () => {
      // Arrange
      const current = new Date('2024-01-15')

      // Act
      const result = getNextOccurrenceDate(current, 'daily')

      // Assert
      expect(formatDate(result)).toBe('2024-01-16')
    })

    it('should add 7 days for weekly pattern', () => {
      // Arrange
      const current = new Date('2024-01-15')

      // Act
      const result = getNextOccurrenceDate(current, 'weekly')

      // Assert
      expect(formatDate(result)).toBe('2024-01-22')
    })

    it('should add 14 days for biweekly pattern', () => {
      // Arrange
      const current = new Date('2024-01-15')

      // Act
      const result = getNextOccurrenceDate(current, 'biweekly')

      // Assert
      expect(formatDate(result)).toBe('2024-01-29')
    })

    it('should add 1 month for monthly pattern', () => {
      // Arrange
      const current = new Date('2024-01-15')

      // Act
      const result = getNextOccurrenceDate(current, 'monthly')

      // Assert
      expect(formatDate(result)).toBe('2024-02-15')
    })

    it('should handle monthly pattern across year boundary', () => {
      // Arrange
      const current = new Date('2024-12-15')

      // Act
      const result = getNextOccurrenceDate(current, 'monthly')

      // Assert
      expect(formatDate(result)).toBe('2025-01-15')
    })

    it('should add 3 months for quarterly pattern', () => {
      // Arrange
      const current = new Date('2024-01-15')

      // Act
      const result = getNextOccurrenceDate(current, 'quarterly')

      // Assert
      expect(formatDate(result)).toBe('2024-04-15')
    })

    it('should handle quarterly pattern across year boundary', () => {
      // Arrange
      const current = new Date('2024-11-15')

      // Act
      const result = getNextOccurrenceDate(current, 'quarterly')

      // Assert
      expect(formatDate(result)).toBe('2025-02-15')
    })

    it('should add 1 year for yearly pattern', () => {
      // Arrange
      const current = new Date('2024-01-15')

      // Act
      const result = getNextOccurrenceDate(current, 'yearly')

      // Assert
      expect(formatDate(result)).toBe('2025-01-15')
    })

    it('should not modify original date', () => {
      // Arrange
      const current = new Date('2024-01-15')
      const originalTime = current.getTime()

      // Act
      getNextOccurrenceDate(current, 'daily')

      // Assert
      expect(current.getTime()).toBe(originalTime)
    })
  })

  describe('shouldGenerateToday', () => {
    describe('when lastGeneratedDate is null', () => {
      it('should generate if today >= startDate and no endDate', () => {
        // Arrange
        const today = new Date('2024-02-15')

        // Act
        const result = shouldGenerateToday(null, '2024-01-01', null, 'daily', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should not generate if today < startDate', () => {
        // Arrange
        const today = new Date('2024-01-01')

        // Act
        const result = shouldGenerateToday(null, '2024-02-01', null, 'daily', today)

        // Assert
        expect(result).toBe(false)
      })

      it('should not generate if today > endDate', () => {
        // Arrange
        const today = new Date('2024-03-01')

        // Act
        const result = shouldGenerateToday(null, '2024-01-01', '2024-02-28', 'daily', today)

        // Assert
        expect(result).toBe(false)
      })

      it('should generate if today is within range', () => {
        // Arrange
        const today = new Date('2024-02-15')

        // Act
        const result = shouldGenerateToday(null, '2024-01-01', '2024-03-31', 'daily', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should generate on exact startDate', () => {
        // Arrange
        const today = new Date('2024-02-01')

        // Act
        const result = shouldGenerateToday(null, '2024-02-01', null, 'daily', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should generate on exact endDate', () => {
        // Arrange
        const today = new Date('2024-02-28')

        // Act
        const result = shouldGenerateToday(null, '2024-01-01', '2024-02-28', 'daily', today)

        // Assert
        expect(result).toBe(true)
      })
    })

    describe('when lastGeneratedDate is set', () => {
      it('should not generate if already generated today', () => {
        // Arrange
        const today = new Date('2024-02-15')

        // Act
        const result = shouldGenerateToday('2024-02-15', '2024-01-01', null, 'daily', today)

        // Assert
        expect(result).toBe(false)
      })

      it('should generate for daily pattern if not generated today', () => {
        // Arrange
        const today = new Date('2024-02-16')

        // Act
        const result = shouldGenerateToday('2024-02-15', '2024-01-01', null, 'daily', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should not generate for daily pattern if scheduled date not reached', () => {
        // Arrange
        const today = new Date('2024-02-15')
        const nextGenDate = formatDate(getNextOccurrenceDate(new Date('2024-02-10'), 'weekly'))

        // Act
        const result = shouldGenerateToday('2024-02-10', '2024-01-01', null, 'weekly', today)

        // Assert
        expect(result).toBe(false)
      })

      it('should generate for weekly pattern when next date is reached', () => {
        // Arrange
        const today = new Date('2024-02-22')

        // Act
        const result = shouldGenerateToday('2024-02-15', '2024-01-01', null, 'weekly', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should not generate for monthly pattern before next month', () => {
        // Arrange
        const today = new Date('2024-02-14')

        // Act
        const result = shouldGenerateToday('2024-01-15', '2024-01-01', null, 'monthly', today)

        // Assert
        expect(result).toBe(false)
      })

      it('should generate for monthly pattern on next month same day', () => {
        // Arrange
        const today = new Date('2024-02-15')

        // Act
        const result = shouldGenerateToday('2024-01-15', '2024-01-01', null, 'monthly', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should not generate if endDate has passed', () => {
        // Arrange
        const today = new Date('2024-03-01')

        // Act
        const result = shouldGenerateToday('2024-02-15', '2024-01-01', '2024-02-28', 'daily', today)

        // Assert
        expect(result).toBe(false)
      })

      it('should generate for yearly pattern on anniversary', () => {
        // Arrange
        const today = new Date('2025-01-15')

        // Act
        const result = shouldGenerateToday('2024-01-15', '2024-01-01', null, 'yearly', today)

        // Assert
        expect(result).toBe(true)
      })

      it('should not generate for yearly pattern before anniversary', () => {
        // Arrange
        const today = new Date('2025-01-14')

        // Act
        const result = shouldGenerateToday('2024-01-15', '2024-01-01', null, 'yearly', today)

        // Assert
        expect(result).toBe(false)
      })
    })

    describe('using default today', () => {
      it('should use current date when today not provided', () => {
        // Arrange
        const startDate = '2020-01-01'

        // Act - This will use current date as default
        const result = shouldGenerateToday(null, startDate, null, 'daily')

        // Assert - Should return true since we're past 2020
        expect(result).toBe(true)
      })
    })
  })

  describe('getDatesBetween', () => {
    it('should return single date if start equals end', () => {
      // Arrange
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-15')

      // Act
      const result = getDatesBetween(start, end, 'daily')

      // Assert
      expect(result).toHaveLength(1)
      expect(formatDate(result[0])).toBe('2024-01-15')
    })

    it('should return multiple dates for daily pattern', () => {
      // Arrange
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-18')

      // Act
      const result = getDatesBetween(start, end, 'daily')

      // Assert
      expect(result).toHaveLength(4)
      expect(formatDate(result[0])).toBe('2024-01-15')
      expect(formatDate(result[1])).toBe('2024-01-16')
      expect(formatDate(result[2])).toBe('2024-01-17')
      expect(formatDate(result[3])).toBe('2024-01-18')
    })

    it('should return correct dates for weekly pattern', () => {
      // Arrange
      const start = new Date('2024-01-15')
      const end = new Date('2024-02-15')

      // Act
      const result = getDatesBetween(start, end, 'weekly')

      // Assert
      expect(result.length).toBe(5)
      expect(formatDate(result[0])).toBe('2024-01-15')
      expect(formatDate(result[1])).toBe('2024-01-22')
      expect(formatDate(result[2])).toBe('2024-01-29')
      expect(formatDate(result[3])).toBe('2024-02-05')
      expect(formatDate(result[4])).toBe('2024-02-12')
    })

    it('should return correct dates for monthly pattern', () => {
      // Arrange
      const start = new Date('2024-01-15')
      const end = new Date('2024-04-15')

      // Act
      const result = getDatesBetween(start, end, 'monthly')

      // Assert
      expect(result).toHaveLength(4)
      expect(formatDate(result[0])).toBe('2024-01-15')
      expect(formatDate(result[1])).toBe('2024-02-15')
      expect(formatDate(result[2])).toBe('2024-03-15')
      expect(formatDate(result[3])).toBe('2024-04-15')
    })

    it('should return correct dates for yearly pattern', () => {
      // Arrange
      const start = new Date('2024-01-15')
      const end = new Date('2027-01-15')

      // Act
      const result = getDatesBetween(start, end, 'yearly')

      // Assert
      expect(result).toHaveLength(4)
      expect(formatDate(result[0])).toBe('2024-01-15')
      expect(formatDate(result[1])).toBe('2025-01-15')
      expect(formatDate(result[2])).toBe('2026-01-15')
      expect(formatDate(result[3])).toBe('2027-01-15')
    })

    it('should not include dates beyond endDate', () => {
      // Arrange
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-20')

      // Act
      const result = getDatesBetween(start, end, 'weekly')

      // Assert
      expect(result).toHaveLength(1) // Only 2024-01-15
      expect(formatDate(result[0])).toBe('2024-01-15')
    })
  })
})
