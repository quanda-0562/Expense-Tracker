'use client'

import React, { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { authenticatedFetch } from '@/lib/auth-fetch'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

interface ReportData {
  period: string
  summary: {
    total_income: number
    total_expense: number
    balance: number
    days_in_period: number
  }
  statistics: {
    average_expense: number
    max_expense: number
    min_expense: number
    transaction_counts: {
      income: number
      expense: number
      total: number
    }
  }
  by_category: Array<{
    category_id: string
    category_name: string
    total_amount: number
    percentage: number
  }>
  top_categories: Array<{
    category_id: string
    category_name: string
    total_amount: number
    percentage: number
  }>
  daily_trends: Array<{
    date: string
    income: number
    expense: number
    net: number
  }>
}

interface ReportsProps {
  initialPeriod?: 'today' | 'week' | 'month' | 'year'
}

export function Reports({ initialPeriod = 'month' }: ReportsProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>(initialPeriod)

  useEffect(() => {
    fetchReports()
  }, [period])

  const fetchReports = async () => {
    try {
      setError(null)
      setLoading(true)
      const response = await authenticatedFetch(`/api/reports?period=${period}`)

      if (!response.ok) {
        throw new Error('Failed to fetch reports')
      }

      const data = await response.json()
      setReportData(data.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

  if (loading) {
    return <div className="text-center py-8">Loading reports...</div>
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm font-medium text-red-800">{error}</p>
      </div>
    )
  }

  if (!reportData) {
    return <div className="text-center py-8 text-gray-600">No data available</div>
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Income</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {formatCurrency(reportData.summary.total_income)}
          </p>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Expense</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {formatCurrency(reportData.summary.total_expense)}
          </p>
        </div>

        {/* Average Expense */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Avg Expense</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {formatCurrency(reportData.statistics.average_expense)}
          </p>
        </div>

        {/* Balance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Balance</h3>
          <p
            className={`text-3xl font-bold mt-2 ${
              reportData.summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(reportData.summary.balance)}
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category */}
        {reportData.by_category.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.by_category}
                  dataKey="total_amount"
                  nameKey="category_name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.category_name} (${entry.percentage}%)`}
                >
                  {reportData.by_category.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Trends */}
        {reportData.daily_trends.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.daily_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" dot={false} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Categories */}
      {reportData.top_categories.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Spending Categories</h3>
          <div className="space-y-3">
            {reportData.top_categories.map((category, index) => (
              <div key={category.category_id} className="flex items-center">
                <div className="flex-grow">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {index + 1}. {category.category_name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(category.total_amount)} ({category.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Expense Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Expense Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Maximum Expense</span>
              <span className="font-semibold">{formatCurrency(reportData.statistics.max_expense)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Minimum Expense</span>
              <span className="font-semibold">{formatCurrency(reportData.statistics.min_expense)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Expense</span>
              <span className="font-semibold">{formatCurrency(reportData.statistics.average_expense)}</span>
            </div>
          </div>
        </div>

        {/* Transaction Count */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Transaction Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Income Transactions</span>
              <span className="font-semibold text-green-600">
                {reportData.statistics.transaction_counts.income}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Expense Transactions</span>
              <span className="font-semibold text-red-600">
                {reportData.statistics.transaction_counts.expense}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Transactions</span>
              <span className="font-semibold">
                {reportData.statistics.transaction_counts.total}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
