/**
 * Transaction Form Component Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionForm } from './TransactionForm'

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('TransactionForm Component', () => {
  const mockCategories = [
    { id: 'cat1', name: 'Housing', is_default: true },
    { id: 'cat2', name: 'Living Expenses', is_default: true },
    { id: 'cat3', name: 'Entertainment', is_default: true },
  ]

  describe('Rendering', () => {
    it('should render transaction form with required fields', () => {
      // Arrange & Act
      render(<TransactionForm categories={mockCategories} />)

      // Assert
      expect(screen.getByLabelText(/type|income|expense/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('should render all categories in dropdown', () => {
      // Arrange & Act
      render(<TransactionForm categories={mockCategories} />)
      const categorySelect = screen.getByLabelText(/category/i)

      // Assert
      mockCategories.forEach((cat) => {
        expect(screen.getByText(cat.name)).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation', () => {
    it('should show error for invalid amount', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<TransactionForm categories={mockCategories} />)
      const amountInput = screen.getByLabelText(/amount/i)
      const submitButton = screen.getByRole('button', { name: /add|create/i })

      // Act
      await user.type(amountInput, '-100')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/positive|amount/i)).toBeInTheDocument()
      })
    })

    it('should show error if category is not selected', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<TransactionForm categories={mockCategories} />)
      const amountInput = screen.getByLabelText(/amount/i)
      const submitButton = screen.getByRole('button', { name: /add|create/i })

      // Act
      await user.type(amountInput, '100')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/select.*category|category/i)).toBeInTheDocument()
      })
    })

    it('should show error for invalid date', async () => {
      // Arrange & Act & Assert
      // TODO: Implement test
    })
  })

  describe('Form Submission', () => {
    it('should submit transaction with all required fields', async () => {
      // Arrange
      const user = userEvent.setup()
      const mockOnSuccess = jest.fn()
      render(<TransactionForm categories={mockCategories} onSuccess={mockOnSuccess} />)

      // Act & Assert
      // TODO: Implement test
    })
  })
})
