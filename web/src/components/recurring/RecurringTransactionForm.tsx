'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Category } from '@/types'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { formatDateForInput } from '@/lib/utils'

interface RecurringTransactionFormProps {
  categories: Category[]
  onSuccess: () => void
  onCancel: () => void
}

const recurringTransactionSchema = z.object({
  category_id: z.string().uuid('Please select a category'),
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  pattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  description: z.string().min(1, 'Description required').max(255),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date').optional().or(z.literal('')),
})

type RecurringTransactionFormData = z.infer<typeof recurringTransactionSchema>

export function RecurringTransactionForm({
  categories,
  onSuccess,
  onCancel,
}: RecurringTransactionFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = formatDateForInput(new Date())

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RecurringTransactionFormData>({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      type: 'expense',
      pattern: 'monthly',
      start_date: today,
    },
  })

  const onSubmit = async (data: RecurringTransactionFormData) => {
    try {
      setError(null)
      setLoading(true)

      const payload = {
        ...data,
        end_date: data.end_date || undefined,
      }

      const response = await authenticatedFetch('/api/recurring-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create recurring transaction')
      }

      reset()
      onSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Create Recurring Transaction</h3>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Type Select */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            {...register('type')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
          {errors.type && (
            <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            {...register('category_id')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="text-sm text-red-600 mt-1">{errors.category_id.message}</p>
          )}
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <input
          type="text"
          {...register('description')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Monthly rent"
        />
        {errors.description && (
          <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Amount Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            {...register('amount', { valueAsNumber: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
          />
          {errors.amount && (
            <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Pattern Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
          <select
            {...register('pattern')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.pattern && (
            <p className="text-sm text-red-600 mt-1">{errors.pattern.message}</p>
          )}
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            {...register('start_date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.start_date && (
            <p className="text-sm text-red-600 mt-1">{errors.start_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
          <input
            type="date"
            {...register('end_date')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {errors.end_date && (
            <p className="text-sm text-red-600 mt-1">{errors.end_date.message}</p>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create Recurring'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
