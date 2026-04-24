'use client'

import React, { useState } from 'react'
import { Category } from '@/types'
import { formatDateForInput } from '@/lib/utils'

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  categoryIds?: string[]
  type?: 'income' | 'expense'
  minAmount?: number
  maxAmount?: number
  search?: string
}

interface TransactionFilterProps {
  categories: Category[]
  onFilterChange: (filters: TransactionFilters) => void
  onReset: () => void
}

export function TransactionFilter({
  categories,
  onFilterChange,
  onReset,
}: TransactionFilterProps) {
  const today = new Date()
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: formatDateForInput(monthStart),
    endDate: formatDateForInput(today),
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof TransactionFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCategoryToggle = (categoryId: string) => {
    const current = filters.categoryIds || []
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId]
    handleFilterChange('categoryIds', updated.length > 0 ? updated : undefined)
  }

  const handleReset = () => {
    setFilters({
      startDate: formatDateForInput(monthStart),
      endDate: formatDateForInput(today),
    })
    setShowAdvanced(false)
    onReset()
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search description..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Advanced Filters Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-blue-600 hover:text-blue-500 text-sm font-medium"
      >
        {showAdvanced ? '▼' : '▶'} Advanced Filters
      </button>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.categoryIds || []).includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={filters.minAmount || ''}
                onChange={(e) =>
                  handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={filters.maxAmount || ''}
                onChange={(e) =>
                  handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
