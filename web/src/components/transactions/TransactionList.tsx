'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { TransactionFilter, TransactionFilters } from './TransactionFilter'
import { ExportButton } from './ExportButton'

interface TransactionListProps {
  categories: Category[]
}

export function TransactionList({ categories }: TransactionListProps) {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<TransactionFilters>({})

  useEffect(() => {
    setPage(1) // Reset to first page when filters change
  }, [filters])

  useEffect(() => {
    fetchTransactions()
  }, [page, filters])

  const fetchTransactions = async () => {
    try {
      setError(null)
      setLoading(true)

      // Build query string with filters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })

      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)
      if (filters.minAmount !== undefined) params.append('minAmount', filters.minAmount.toString())
      if (filters.maxAmount !== undefined) params.append('maxAmount', filters.maxAmount.toString())
      if (filters.categoryIds && filters.categoryIds.length > 0) {
        params.append('categoryIds', filters.categoryIds.join(','))
      }

      const response = await authenticatedFetch(`/api/transactions?${params.toString()}`)

      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }

      const data = await response.json()
      setTransactions(data.data)
      setTotalPages(Math.ceil(data.total / 20))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction?')) {
      return
    }

    try {
      const response = await authenticatedFetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete transaction')
      }

      // Remove from list
      setTransactions(transactions.filter((t) => t.id !== id))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    }
  }

  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters)
  }

  const handleFilterReset = () => {
    setFilters({})
  }

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown'
  }

  if (loading && transactions.length === 0) {
    return <div className="text-center py-8">Loading transactions...</div>
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
      <TransactionFilter
        categories={categories}
        onFilterChange={handleFilterChange}
        onReset={handleFilterReset}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton
          startDate={filters.startDate}
          endDate={filters.endDate}
          categoryId={filters.categoryIds?.[0]}
          type={filters.type as 'income' | 'expense' | undefined}
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No transactions found</p>
          <Link href="/dashboard/transactions/new" className="text-blue-600 hover:text-blue-500">
            Add your first transaction
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getCategoryName(transaction.category_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {transaction.description || '-'}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-medium text-right ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link
                        href={`/dashboard/transactions/${transaction.id}/edit`}
                        className="text-blue-600 hover:text-blue-500"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
