'use client'

import { useEffect, useState } from 'react'
import { RecurringTransactionForm } from '@/components/recurring/RecurringTransactionForm'
import { RecurringTransactionList } from '@/components/recurring/RecurringTransactionList'
import { Category } from '@/types'
import { authenticatedFetch } from '@/lib/auth-fetch'

export default function RecurringTransactionsPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await authenticatedFetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSuccess = () => {
    setShowForm(false)
    setRefresh((prev) => prev + 1)
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Recurring Transactions</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            + New Recurring
          </button>
        )}
      </div>

      {showForm && (
        <RecurringTransactionForm
          categories={categories}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Recurring Transactions</h2>
            <RecurringTransactionList key={refresh} onRefresh={() => setRefresh((prev) => prev + 1)} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">ℹ️ How It Works</h3>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-800">Automatic Creation</p>
              <p className="text-xs mt-1">Transactions are automatically created on their scheduled dates</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Pause & Resume</p>
              <p className="text-xs mt-1">Use the pause button to temporarily stop recurring transactions</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">End Date Optional</p>
              <p className="text-xs mt-1">Leave end date blank for indefinite recurrence</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Auto-Generated</p>
              <p className="text-xs mt-1">Monthly check creates due transactions automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
