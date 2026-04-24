import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getPeriodDates, roundToTwo } from '@/lib/utils'

/**
 * Helper to extract user from Authorization header
 */
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Helper to create authenticated Supabase client
 */
function getAuthenticatedClient(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const client = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  })

  return client
}

/**
 * GET /api/reports?period=month
 * Get comprehensive spending reports with multiple metrics
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.slice(7)
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get period
    const period = (request.nextUrl.searchParams.get('period') as any) || 'month'
    const { start, end } = getPeriodDates(period)

    // Create authenticated client for this request
    const authClient = getAuthenticatedClient(token)

    // Get transactions for period
    const { data: transactions, error: txError } = await authClient
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .gte('transaction_date', start.toISOString().split('T')[0])
      .lte('transaction_date', end.toISOString().split('T')[0])

    if (txError) {
      throw txError
    }

    // Calculate summary statistics
    const income = roundToTwo(
      transactions
        ?.filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0
    )
    const expense = roundToTwo(
      transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0
    )
    const balance = roundToTwo(income - expense)

    // Calculate by category
    const categoryMap = new Map<string, number>()
    transactions?.forEach((tx) => {
      if (tx.type === 'expense') {
        const current = categoryMap.get(tx.category_id) || 0
        categoryMap.set(tx.category_id, current + tx.amount)
      }
    })

    // Get category names and calculate percentages
    const categoryIds = Array.from(categoryMap.keys())
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)

    const by_category = Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => ({
        category_id: categoryId,
        category_name: categories?.find((c) => c.id === categoryId)?.name || 'Unknown',
        total_amount: roundToTwo(amount),
        percentage: Math.round((amount / expense) * 100),
      }))
      .sort((a, b) => b.total_amount - a.total_amount) // Sort by amount descending

    // Calculate spending by day
    const dailySpending = new Map<string, { income: number; expense: number }>()
    transactions?.forEach((tx) => {
      const date = tx.transaction_date
      if (!dailySpending.has(date)) {
        dailySpending.set(date, { income: 0, expense: 0 })
      }
      const day = dailySpending.get(date)!
      if (tx.type === 'income') {
        day.income += tx.amount
      } else {
        day.expense += tx.amount
      }
    })

    const daily_trends = Array.from(dailySpending.entries())
      .map(([date, { income, expense }]) => ({
        date,
        income: roundToTwo(income),
        expense: roundToTwo(expense),
        net: roundToTwo(income - expense),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate statistics
    const expenses = transactions?.filter((t) => t.type === 'expense') || []
    const expenses_only = expenses.map((t) => t.amount)
    const avg_expense = roundToTwo(
      expenses_only.length > 0
        ? expenses_only.reduce((a, b) => a + b, 0) / expenses_only.length
        : 0
    )
    const max_expense = roundToTwo(Math.max(...expenses_only, 0))
    const min_expense = roundToTwo(
      expenses_only.length > 0 ? Math.min(...expenses_only) : 0
    )

    // Top spending categories
    const top_categories = by_category.slice(0, 5)

    // Transaction count by type
    const transaction_counts = {
      income: transactions?.filter((t) => t.type === 'income').length || 0,
      expense: transactions?.filter((t) => t.type === 'expense').length || 0,
      total: transactions?.length || 0,
    }

    return NextResponse.json({
      success: true,
      data: {
        period,
        summary: {
          total_income: income,
          total_expense: expense,
          balance,
          days_in_period: Math.ceil(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
          ),
        },
        statistics: {
          average_expense: avg_expense,
          max_expense,
          min_expense,
          transaction_counts,
        },
        by_category,
        top_categories,
        daily_trends,
      },
    })
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    )
  }
}
