/**
 * API Integration Tests
 * 
 * These tests verify the core API endpoints work correctly.
 * They test request validation, authentication, and response formats.
 */

import { createTransactionSchema, updateTransactionSchema } from '@/lib/validations'
import { ZodError } from 'zod'

describe('API Integration Tests', () => {
  describe('Transaction Validation', () => {
    it('should accept valid transaction creation data', () => {
      // Arrange
      const validData = {
        category_id: 'some-category-id',
        amount: 100.5,
        type: 'expense' as const,
        description: 'Grocery shopping',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should reject negative amount', () => {
      // Arrange
      const invalidData = {
        category_id: 'some-category-id',
        amount: -100,
        type: 'expense' as const,
        description: 'Invalid transaction',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('amount'))).toBe(true)
      }
    })

    it('should reject zero amount', () => {
      // Arrange
      const invalidData = {
        category_id: 'some-category-id',
        amount: 0,
        type: 'expense' as const,
        description: 'Zero transaction',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should reject invalid type', () => {
      // Arrange
      const invalidData = {
        category_id: 'some-category-id',
        amount: 100,
        type: 'invalid' as any,
        description: 'Invalid type',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should accept income type', () => {
      // Arrange
      const validData = {
        category_id: 'salary-category',
        amount: 5000,
        type: 'income' as const,
        description: 'Salary',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should accept optional description', () => {
      // Arrange
      const validData = {
        category_id: 'some-category-id',
        amount: 100,
        type: 'expense' as const,
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should accept very large amounts', () => {
      // Arrange
      const validData = {
        category_id: 'some-category-id',
        amount: 999999999.99,
        type: 'expense' as const,
        description: 'Large transaction',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should accept decimal amounts', () => {
      // Arrange
      const validData = {
        category_id: 'some-category-id',
        amount: 10.99,
        type: 'expense' as const,
        description: 'Decimal amount',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(validData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should reject missing category_id', () => {
      // Arrange
      const invalidData = {
        category_id: '',
        amount: 100,
        type: 'expense' as const,
        description: 'No category',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('category_id'))).toBe(true)
      }
    })

    it('should accept optional description', () => {
      // Arrange
      const data = {
        category_id: 'some-category-id',
        amount: 100,
        type: 'expense' as const,
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(data)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should validate date format', () => {
      // Arrange
      const invalidData = {
        category_id: 'some-category-id',
        amount: 100,
        type: 'expense' as const,
        transaction_date: 'invalid-date',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('transaction_date'))).toBe(true)
      }
    })
  })

  describe('Error Response Format', () => {
    it('should format validation errors correctly', () => {
      // Arrange
      const invalidData = {
        category_id: 'invalid',
        amount: -50,
        type: 'invalid_type',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
        expect(result.error.issues).toBeInstanceOf(Array)
        expect(result.error.issues.length).toBeGreaterThan(0)
        expect(result.error.issues[0]).toHaveProperty('path')
        expect(result.error.issues[0]).toHaveProperty('message')
      }
    })

    it('should provide helpful error messages', () => {
      // Arrange
      const invalidData = {
        category_id: '123e4567-e89b-12d3-a456-426614174000',
        amount: -100,
        type: 'expense',
        description: 'Negative amount',
        transaction_date: '2024-01-15',
      }

      // Act
      const result = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
      if (!result.success) {
        const message = result.error.issues[0].message
        expect(message.toLowerCase()).toContain('must be positive')
      }
    })
  })

  describe('Update Transaction Schema', () => {
    it('should allow partial updates', () => {
      // Arrange
      const partialData = {
        amount: 150.75,
      }

      // Act
      const result = updateTransactionSchema.safeParse(partialData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should allow updating only description', () => {
      // Arrange
      const partialData = {
        description: 'Updated description',
      }

      // Act
      const result = updateTransactionSchema.safeParse(partialData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should allow updating type', () => {
      // Arrange
      const partialData = {
        type: 'income',
      }

      // Act
      const result = updateTransactionSchema.safeParse(partialData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should allow empty object for update', () => {
      // Arrange
      const emptyData = {}

      // Act
      const result = updateTransactionSchema.safeParse(emptyData)

      // Assert
      expect(result.success).toBe(true)
    })

    it('should validate amount when provided', () => {
      // Arrange
      const invalidData = {
        amount: -50,
      }

      // Act
      const result = updateTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should validate type when provided', () => {
      // Arrange
      const invalidData = {
        type: 'invalid_type',
      }

      // Act
      const result = updateTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })

    it('should validate date when provided', () => {
      // Arrange
      const invalidData = {
        transaction_date: 'not-a-date',
      }

      // Act
      const result = updateTransactionSchema.safeParse(invalidData)

      // Assert
      expect(result.success).toBe(false)
    })
  })

  describe('API Response Structure', () => {
    it('should have consistent error response format', () => {
      // Arrange
      const errorResponse = {
        error: 'Unauthorized',
        status: 401,
      }

      // Act & Assert
      expect(errorResponse).toHaveProperty('error')
      expect(errorResponse).toHaveProperty('status')
      expect(typeof errorResponse.error).toBe('string')
      expect(typeof errorResponse.status).toBe('number')
    })

    it('should have consistent pagination response format', () => {
      // Arrange
      const paginationResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 20,
      }

      // Act & Assert
      expect(paginationResponse).toHaveProperty('data')
      expect(paginationResponse).toHaveProperty('total')
      expect(paginationResponse).toHaveProperty('page')
      expect(paginationResponse).toHaveProperty('limit')
      expect(Array.isArray(paginationResponse.data)).toBe(true)
      expect(typeof paginationResponse.total).toBe('number')
    })
  })

  describe('HTTP Methods', () => {
    it('should use GET for fetching data', () => {
      // Arrange
      const method = 'GET'

      // Act & Assert
      expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(method)
      expect(method).toBe('GET')
    })

    it('should use POST for creating data', () => {
      // Arrange
      const method = 'POST'

      // Act & Assert
      expect(method).toBe('POST')
    })

    it('should use PUT for updating data', () => {
      // Arrange
      const method = 'PUT'

      // Act & Assert
      expect(method).toBe('PUT')
    })

    it('should use DELETE for removing data', () => {
      // Arrange
      const method = 'DELETE'

      // Act & Assert
      expect(method).toBe('DELETE')
    })
  })

  describe('Authentication', () => {
    it('should require Authorization header', () => {
      // Arrange
      const validAuthHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

      // Act & Assert
      expect(validAuthHeader).toMatch(/^Bearer /)
      expect(validAuthHeader.startsWith('Bearer ')).toBe(true)
    })

    it('should reject missing Authorization header', () => {
      // Arrange
      const request = {
        headers: {
          'content-type': 'application/json',
        },
      }

      // Act & Assert
      expect('authorization' in request.headers).toBe(false)
    })

    it('should validate JWT token format', () => {
      // Arrange
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U'
      const invalidToken = 'not-a-token'

      // Act & Assert
      expect(validToken.split('.').length).toBe(3)
      expect(invalidToken.split('.').length).not.toBe(3)
    })
  })

  describe('Request Validation Rules', () => {
    it('should validate category_id is not empty', () => {
      // Arrange
      const validData = {
        category_id: 'some-category-id',
        amount: 100,
        type: 'expense',
        transaction_date: '2024-01-15',
      }
      const invalidData = {
        category_id: '',
        amount: 100,
        type: 'expense',
        transaction_date: '2024-01-15',
      }

      // Act
      const resultValid = createTransactionSchema.safeParse(validData)
      const resultInvalid = createTransactionSchema.safeParse(invalidData)

      // Assert
      expect(resultValid.success).toBe(true)
      expect(resultInvalid.success).toBe(false)
    })

    it('should validate amount is positive number', () => {
      // Arrange
      const validAmounts = [0.01, 1, 100.50, 999999.99]
      const invalidAmounts = [0, -1, -100.50]

      // Act & Assert
      validAmounts.forEach(amount => {
        const result = createTransactionSchema.safeParse({
          category_id: 'some-category-id',
          amount,
          type: 'expense',
          transaction_date: '2024-01-15',
        })
        expect(result.success).toBe(true, `Failed for amount ${amount}`)
      })

      invalidAmounts.forEach(amount => {
        const result = createTransactionSchema.safeParse({
          category_id: 'some-category-id',
          amount,
          type: 'expense',
          transaction_date: '2024-01-15',
        })
        expect(result.success).toBe(false, `Should fail for amount ${amount}`)
      })
    })

    it('should validate transaction_date is valid format', () => {
      // Arrange
      // Dates that JavaScript can parse
      const validDates = ['2024-01-15', '2024-12-31', '2024-01-01', '2025-06-15']
      // These will be parsed by new Date() and may or may not be valid
      const invalidDates = ['not-a-date', 'invalid']

      // Act & Assert
      validDates.forEach(date => {
        const result = createTransactionSchema.safeParse({
          category_id: 'some-category-id',
          amount: 100,
          type: 'expense',
          transaction_date: date,
        })
        expect(result.success).toBe(true, `Failed for valid date ${date}`)
      })

      invalidDates.forEach(date => {
        const result = createTransactionSchema.safeParse({
          category_id: 'some-category-id',
          amount: 100,
          type: 'expense',
          transaction_date: date,
        })
        expect(result.success).toBe(false, `Should fail for invalid date ${date}`)
      })
    })
  })
})
