/**
 * RegisterForm Component Tests
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RegisterForm } from './RegisterForm'
import * as authContext from '@/context/AuthContext'

jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}))

describe('RegisterForm Component', () => {
  const mockRegister = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(authContext.useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
      error: null,
      loading: false,
    })
  })

  describe('Rendering', () => {
    it('should render register form with required fields', () => {
      // Arrange & Act
      render(<RegisterForm />)

      // Assert
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign up|register/i })).toBeInTheDocument()
    })

    it('should render login link', () => {
      // Arrange & Act
      render(<RegisterForm />)

      // Assert
      expect(screen.getByRole('link', { name: /sign in|login/i })).toBeInTheDocument()
    })

    it('should render optional display name field', () => {
      // Arrange & Act
      render(<RegisterForm />)

      // Assert
      expect(screen.getByLabelText(/display name|full name/i)).toBeInTheDocument()
    })
  })

  describe('Form Validation', () => {
    it('should show error if passwords do not match', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<RegisterForm />)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up|register/i })

      // Act
      await user.type(passwordInput, 'password123')
      await user.type(confirmInput, 'differentpass')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/password.*match|confirm/i)).toBeInTheDocument()
      })
    })

    it('should show error for invalid email', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<RegisterForm />)
      const emailInput = screen.getByLabelText(/email/i)
      const submitButton = screen.getByRole('button', { name: /sign up|register/i })

      // Act
      await user.type(emailInput, 'notanemail')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/invalid email|email address/i)).toBeInTheDocument()
      })
    })

    it('should show error if password is too short', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<RegisterForm />)
      const passwordInput = screen.getByLabelText(/^password/i)
      const submitButton = screen.getByRole('button', { name: /sign up|register/i })

      // Act
      await user.type(passwordInput, '123')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(screen.getByText(/at least 6 characters|password/i)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should call register with email, password, and display name on valid submission', async () => {
      // Arrange
      const user = userEvent.setup()
      render(<RegisterForm />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const displayNameInput = screen.getByLabelText(/display name|full name/i)
      const submitButton = screen.getByRole('button', { name: /sign up|register/i })

      // Act
      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmInput, 'password123')
      await user.type(displayNameInput, 'John Doe')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('newuser@example.com', 'password123', 'John Doe')
      })
    })

    it('should call onSuccess callback after successful registration', async () => {
      // Arrange
      const user = userEvent.setup()
      mockRegister.mockResolvedValueOnce(undefined)
      render(<RegisterForm onSuccess={mockOnSuccess} />)
      const emailInput = screen.getByLabelText(/email/i)
      const passwordInput = screen.getByLabelText(/^password/i)
      const confirmInput = screen.getByLabelText(/confirm password/i)
      const submitButton = screen.getByRole('button', { name: /sign up|register/i })

      // Act
      await user.type(emailInput, 'newuser@example.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmInput, 'password123')
      await user.click(submitButton)

      // Assert
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should show error message when registration fails', async () => {
      // Arrange
      const error = 'Email already exists'
      ;(authContext.useAuth as jest.Mock).mockReturnValue({
        register: mockRegister,
        error: error,
        loading: false,
      })

      // Act
      render(<RegisterForm />)

      // Assert
      expect(screen.getByText(error)).toBeInTheDocument()
    })

    it('should disable submit button while loading', () => {
      // Arrange
      ;(authContext.useAuth as jest.Mock).mockReturnValue({
        register: mockRegister,
        error: null,
        loading: true,
      })

      // Act
      render(<RegisterForm />)
      const submitButton = screen.getByRole('button', { name: /sign up|register/i })

      // Assert
      expect(submitButton).toBeDisabled()
    })
  })
})
