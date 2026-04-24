// User types
export interface User {
  id: string
  email: string
  display_name?: string
  created_at: string
  updated_at: string
}

// Category types
export interface Category {
  id: string
  user_id: string
  name: string
  icon?: string
  is_default: boolean
  created_at: string
}

// Transaction types
export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  user_id: string
  category_id: string
  type: TransactionType
  amount: number
  description?: string
  transaction_date: string
  created_at: string
  updated_at: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  page_size: number
}

// Dashboard types
export interface DashboardSummary {
  total_income: number
  total_expense: number
  balance: number
  transactions_count: number
}

export interface CategorySummary {
  category_id: string
  category_name: string
  total_amount: number
  percentage: number
}

export interface DashboardData {
  summary: DashboardSummary
  by_category: CategorySummary[]
  recent_transactions: Transaction[]
}
