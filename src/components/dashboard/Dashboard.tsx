'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardData, Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { TransactionList } from '@/components/transactions/TransactionList'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface DashboardProps {
  categories: Category[]
}

export function Dashboard({ categories }: DashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month')

  useEffect(() => {
    fetchDashboard()
  }, [period])

  const fetchDashboard = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await authenticatedFetch(`/api/dashboard?period=${period}`)

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const data = await response.json()
      setDashboardData(data.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>
  }

  if (!dashboardData) {
    return <div className="text-center py-8 text-gray-600">No data available</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Period Selector */}
      <div className="flex gap-2">
        {(['today', 'week', 'month', 'year'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(dashboardData.summary.total_income)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Expense</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {formatCurrency(dashboardData.summary.total_expense)}
          </p>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Balance</h3>
          <p
            className={`text-3xl font-bold mt-2 ${
              dashboardData.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(dashboardData.summary.balance)}
          </p>
        </div>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        {dashboardData.by_category.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Expense by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.by_category}
                  dataKey="total_amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {dashboardData.by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
            <Link href="/dashboard/transactions" className="text-blue-600 hover:text-blue-500 text-sm">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recent_transactions.slice(0, 5).map((tx) => (
              <div key={tx.id} className="flex justify-between items-center py-2 border-b">
                <div>
                  <p className="font-medium">
                    {categories.find((c) => c.id === tx.category_id)?.name}
                  </p>
                  <p className="text-sm text-gray-600">{tx.description || 'No description'}</p>
                </div>
                <p
                  className={`font-semibold ${
                    tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Transaction Button */}
      <div className="flex justify-center">
        <Link
          href="/dashboard/transactions/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Add Transaction
        </Link>
      </div>
    </div>
  )
}
