'use client'

import { useEffect, useState } from 'react'
import { BudgetForm } from '@/components/budgets/BudgetForm'
import { BudgetProgress } from '@/components/budgets/BudgetProgress'
import { BudgetList } from '@/components/budgets/BudgetList'
import { Category } from '@/types'
import { authenticatedFetch } from '@/lib/auth-fetch'

export default function BudgetsPage() {
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
        <h1 className="text-3xl font-bold">Budget Management</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
          >
            + New Budget
          </button>
        )}
      </div>

      {showForm && (
        <BudgetForm
          categories={categories}
          onSuccess={handleSuccess}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Budget Progress</h2>
            <BudgetProgress key={refresh} />
          </div>
        </div>

        {/* Budget List */}
        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Your Budgets</h2>
            <BudgetList key={refresh} onRefresh={() => setRefresh((prev) => prev + 1)} />
          </div>
        </div>
      </div>
    </div>
  )
}
