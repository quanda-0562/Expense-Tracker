import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
    display_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  })

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

// Transaction schemas
export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive('Amount must be positive'),
  category_id: z.string().min(1, 'Please select a category'),
  description: z.string().optional(),
  transaction_date: z.string().refine((date) => {
    const d = new Date(date)
    return d instanceof Date && !isNaN(d.getTime())
  }, 'Invalid date'),
})

export const updateTransactionSchema = createTransactionSchema.partial()

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  icon: z.string().optional(),
})

// Type exports
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
