import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { getPeriodDates, roundToTwo, calculatePercentage } from '@/lib/utils'

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
 * GET /api/dashboard?period=month
 * Get dashboard data for current user
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

    // Calculate summary
    const total_income = roundToTwo(
      transactions
        ?.filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0
    )
    const total_expense = roundToTwo(
      transactions
        ?.filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0
    )

    // Calculate by category
    const categoryMap = new Map<string, number>()
    transactions?.forEach((tx) => {
      if (tx.type === 'expense') {
        const current = categoryMap.get(tx.category_id) || 0
        categoryMap.set(tx.category_id, current + tx.amount)
      }
    })

    // Get category names
    const categoryIds = Array.from(categoryMap.keys())
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', categoryIds)

    const by_category = Array.from(categoryMap.entries()).map(([categoryId, amount]) => ({
      category_id: categoryId,
      category_name: categories?.find((c) => c.id === categoryId)?.name || 'Unknown',
      total_amount: roundToTwo(amount),
      percentage: calculatePercentage(amount, total_expense),
    }))

    // Get recent transactions
    const recent_transactions = (transactions || [])
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
      .slice(0, 10)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          total_income,
          total_expense,
          balance: roundToTwo(total_income - total_expense),
          transactions_count: transactions?.length || 0,
        },
        by_category,
        recent_transactions,
      },
    })
  } catch (error) {
    console.error('GET /api/dashboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
