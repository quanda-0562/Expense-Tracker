'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTransactionSchema, type CreateTransactionInput } from '@/lib/validations'
import { Category } from '@/types'
import { formatDateForInput } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface TransactionFormProps {
  categories: Category[]
  initialData?: any
  onSuccess?: () => void
}

export function TransactionForm({ categories, initialData, onSuccess }: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      type: initialData?.type || 'expense',
      amount: initialData?.amount || undefined,
      category_id: initialData?.category_id || '',
      description: initialData?.description || '',
      transaction_date: initialData?.transaction_date
        ? formatDateForInput(initialData.transaction_date)
        : formatDateForInput(new Date()),
    },
  })

  const onSubmit = async (data: CreateTransactionInput) => {
    try {
      setError(null)
      setLoading(true)

      const endpoint = initialData?.id ? `/api/transactions/${initialData.id}` : '/api/transactions'
      const method = initialData?.id ? 'PUT' : 'POST'

      const response = await authenticatedFetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save transaction')
      }

      onSuccess?.()
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {initialData ? 'Edit Transaction' : 'Add Transaction'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                {...register('type')}
                type="radio"
                value="income"
                className="h-4 w-4 border-gray-300"
              />
              <span className="ml-2">Income</span>
            </label>
            <label className="flex items-center">
              <input
                {...register('type')}
                type="radio"
                value="expense"
                className="h-4 w-4 border-gray-300"
              />
              <span className="ml-2">Expense</span>
            </label>
          </div>
          {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            {...register('amount', { valueAsNumber: true })}
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            {...register('category_id')}
            id="category"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            {...register('transaction_date')}
            id="date"
            type="date"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.transaction_date && (
            <p className="mt-1 text-sm text-red-600">{errors.transaction_date.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={3}
            placeholder="Add notes about this transaction..."
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : initialData ? 'Update' : 'Add'} Transaction
        </button>
      </form>
    </div>
  )
}
