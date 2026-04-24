'use client'

import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface Budget {
  id: string
  category_id: string
  amount: number
  period: string
  created_at: string
  categories: {
    id: string
    name: string
    icon: string
  }
}

interface BudgetListProps {
  onRefresh: () => void
}

export function BudgetList({ onRefresh }: BudgetListProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchBudgets()
  }, [])

  const fetchBudgets = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await authenticatedFetch('/api/budgets')

      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
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

  const handleDelete = async (budgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return
    }

    try {
      setDeleting(budgetId)
      const response = await authenticatedFetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete budget')
      }

      setBudgets((prev) => prev.filter((b) => b.id !== budgetId))
      onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      alert(message)
    } finally {
      setDeleting(null)
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
        <p className="text-gray-600">No budgets created yet.</p>
      </div>
    )
  }

  const periodLabels: Record<string, string> = {
    weekly: 'Weekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  }

  return (
    <div className="space-y-3">
      {budgets.map((budget) => (
        <div key={budget.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{budget.categories?.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{budget.categories?.name}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(budget.amount)} / {periodLabels[budget.period]}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDelete(budget.id)}
            disabled={deleting === budget.id}
            className="ml-4 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
          >
            {deleting === budget.id ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  )
}
