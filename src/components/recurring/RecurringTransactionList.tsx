'use client'

import React, { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'

interface RecurringTransaction {
  id: string
  category_id: string
  amount: number
  type: string
  pattern: string
  description: string
  start_date: string
  end_date: string | null
  is_active: boolean
  created_at: string
  categories: {
    id: string
    name: string
    icon: string
  }
}

interface RecurringTransactionListProps {
  onRefresh: () => void
}

export function RecurringTransactionList({ onRefresh }: RecurringTransactionListProps) {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchRecurringTransactions()
  }, [])

  const fetchRecurringTransactions = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await authenticatedFetch('/api/recurring-transactions')

      if (!response.ok) {
        throw new Error('Failed to fetch recurring transactions')
      }

      const data = await response.json()
      setTransactions(data.data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (txId: string) => {
    if (!window.confirm('Are you sure you want to delete this recurring transaction?')) {
      return
    }

    try {
      setDeleting(txId)
      const response = await authenticatedFetch(`/api/recurring-transactions/${txId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete recurring transaction')
      }

      setTransactions((prev) => prev.filter((t) => t.id !== txId))
      onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      alert(message)
    } finally {
      setDeleting(null)
    }
  }

  const handleToggleActive = async (txId: string, currentStatus: boolean) => {
    try {
      const response = await authenticatedFetch(`/api/recurring-transactions/${txId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update recurring transaction')
      }

      const updated = await response.json()
      setTransactions((prev) =>
        prev.map((t) => (t.id === txId ? updated.data : t))
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      alert(message)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
        <p className="text-gray-600">No recurring transactions created yet.</p>
      </div>
    )
  }

  const patternLabels: Record<string, string> = {
    daily: 'Daily',
    weekly: 'Weekly',
    biweekly: 'Bi-weekly',
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <div key={tx.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tx.categories?.icon}</span>
                <div>
                  <p className="font-semibold text-gray-800">{tx.description}</p>
                  <p className="text-sm text-gray-600">
                    {tx.categories?.name} · {patternLabels[tx.pattern]}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-lg font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </p>
              <p className="text-sm text-gray-600">{patternLabels[tx.pattern]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
            <span>
              {new Date(tx.start_date).toLocaleDateString()} →{' '}
              {tx.end_date ? new Date(tx.end_date).toLocaleDateString() : '∞'}
            </span>
            {!tx.is_active && <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">Paused</span>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleToggleActive(tx.id, tx.is_active)}
              className={`flex-1 px-3 py-2 text-sm rounded-md font-medium ${
                tx.is_active
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {tx.is_active ? 'Pause' : 'Resume'}
            </button>

            <button
              onClick={() => handleDelete(tx.id)}
              disabled={deleting === tx.id}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
            >
              {deleting === tx.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
