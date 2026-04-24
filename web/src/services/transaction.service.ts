/**
 * Transaction Service
 * Handles transaction-related business logic
 */

import { Transaction } from '@/types'
import { roundToTwo } from '@/lib/utils'

/**
 * Calculate balance from transactions
 */
export function calculateBalance(
  transactions: Transaction[]
): { income: number; expense: number; balance: number } {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  return {
    income: roundToTwo(income),
    expense: roundToTwo(expense),
    balance: roundToTwo(income - expense),
  }
}

/**
 * Group transactions by category
 */
export function groupTransactionsByCategory(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce(
    (acc, transaction) => {
      const categoryId = transaction.category_id
      if (!acc[categoryId]) {
        acc[categoryId] = []
      }
      acc[categoryId].push(transaction)
      return acc
    },
    {} as Record<string, Transaction[]>
  )
}

/**
 * Filter transactions by date range
 */
export function filterTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter((transaction) => {
    const txDate = new Date(transaction.transaction_date)
    return txDate >= startDate && txDate <= endDate
  })
}

/**
 * Sort transactions by date (newest first)
 */
export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  )
}

/**
 * Calculate total amount by category
 */
export function calculateCategoryTotals(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce(
    (acc, transaction) => {
      const categoryId = transaction.category_id
      acc[categoryId] = (acc[categoryId] || 0) + transaction.amount
      return acc
    },
    {} as Record<string, number>
  )
}
