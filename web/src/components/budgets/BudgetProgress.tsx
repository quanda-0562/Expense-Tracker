'use client'

import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface BudgetProgressItem {
  budget_id: string
  category_name: string
  budget_limit: number
  spent: number
  remaining: number
  percentage: number
  status: 'under' | 'warning' | 'exceeded'
}

export function BudgetProgress() {
  const [budgets, setBudgets] = useState<BudgetProgressItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBudgetProgress()
  }, [])

  const fetchBudgetProgress = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await authenticatedFetch('/api/budgets/progress')

      if (!response.ok) {
        throw new Error('Failed to fetch budget progress')
      }

      const data = await response.json()
      setBudgets(data.data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading budgets...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    )
  }

  if (budgets.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">No budgets set. Create one to get started!</p>
      </div>
    )
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'exceeded':
        return 'bg-red-600'
      case 'warning':
        return 'bg-yellow-600'
      default:
        return 'bg-green-600'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'exceeded':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            Exceeded
          </span>
        )
      case 'warning':
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
            Warning
          </span>
        )
      default:
        return (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
            On Track
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      {budgets.map((budget) => (
        <div key={budget.budget_id} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold">{budget.category_name}</h3>
            {getStatusBadge(budget.status)}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
            <div>
              <p className="text-gray-600">Spent</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatCurrency(budget.spent)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Budget</p>
              <p className="text-xl font-semibold text-gray-800">
                {formatCurrency(budget.budget_limit)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Remaining</p>
              <p
                className={`text-xl font-semibold ${
                  budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(budget.remaining)}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`${getProgressColor(budget.status)} h-3 rounded-full transition-all`}
              style={{ width: `${Math.min(budget.percentage, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">{budget.percentage}% spent</p>
        </div>
      ))}
    </div>
  )
}
