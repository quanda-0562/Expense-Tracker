/**
 * LoginForm Component Tests
 * TDD: Write tests first, implement after
 */

import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from './LoginForm'
import * as authContext from '@/context/AuthContext'

// Mock useAuth hook
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

describe('LoginForm Component', () => {
  const mockLogin = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(authContext.useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: null,
      loading: false,
    })
  })

  describe('Rendering', () => {
    it('should render login form with email and password fields', () => {
      // Arrange & Act
      render(<LoginForm />)

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in|login/i })).toBeInTheDocument()
    })

    it('should render sign up link', () => {
      // Arrange & Act
      render(<LoginForm />)

      // Assert
      expect(screen.getByRole('link', { name: /sign up|register/i })).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      // Arrange & Act
      render(<LoginForm />)

      // Assert
      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show email validation error for invalid email', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<LoginForm />)
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })

      // Act
      await user.type(emailInput, 'notanemail')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email|valid email/i)).toBeInTheDocument()
      })
    })

    it('should show password error if password is too short', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<LoginForm />)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })

      // Act
      await user.type(passwordInput, '12345')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/at least 6 characters|password/i)).toBeInTheDocument()
      })
    })

    it('should not submit form with empty fields', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<LoginForm />)
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })

      // Act
      await user.click(submitButton)

      // Assert
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('Form Submission', () => {
    it('should call login with email and password on valid submission', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<LoginForm />)
      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })

      // Act
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
      })
    })

    it('should call onSuccess callback after successful login', async () => {
      // Arrange
      const user = userEvent.setup()
      mockLogin.mockResolvedValueOnce(undefined)
      render(<LoginForm onSuccess={mockOnSuccess} />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/password/i)
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })

      // Act
      await user.type(emailInput, 'test@example.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should show error message when login fails', async () => {
      // Arrange
      const error = 'Invalid credentials'
      ;(authContext.useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        error: error,
        loading: false,
      })
      const user = userEvent.setup()
      render(<LoginForm />)

      // Act
      // (Component already shows error from context)

      // Assert
      expect(screen.getByText(error)).toBeInTheDocument()
    })

    it('should disable submit button while loading', () => {
      // Arrange
      ;(authContext.useAuth as jest.Mock).mockReturnValue({
        login: mockLogin,
        error: null,
        loading: true,
      })

      // Act
      render(<LoginForm />)
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })

      // Assert
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      // Arrange & Act
      render(<LoginForm />)

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should have accessible submit button', () => {
      // Arrange & Act
      render(<LoginForm />)

      // Assert
      const submitButton = screen.getByRole('button', { name: /sign in|login/i })
      expect(submitButton).toHaveAttribute('type', 'submit')
    })
  })
})
