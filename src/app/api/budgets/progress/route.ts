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
 * GET /api/budgets/progress
 * Get budget progress for current period (spending vs limit)
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

    const authClient = getAuthenticatedClient(token)

    // Get all active budgets
    const { data: budgets, error: budgetError } = await authClient
      .from('budgets')
      .select('*, categories(id, name, icon)')
      .eq('user_id', user.id)

    if (budgetError) {
      throw budgetError
    }

    // For each budget, calculate spending in current period
    const budgetProgress = await Promise.all(
      (budgets || []).map(async (budget) => {
        // Get period based on budget period setting
        const periodType = budget.period === 'weekly' ? 'week' : 
                          budget.period === 'yearly' ? 'year' : 'month'
        const { start, end } = getPeriodDates(periodType as any)

        // Get spending for this category in period
        const { data: transactions, error: txError } = await authClient
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('category_id', budget.category_id)
          .eq('type', 'expense')
          .is('deleted_at', null)
          .gte('transaction_date', start.toISOString().split('T')[0])
          .lte('transaction_date', end.toISOString().split('T')[0])

        if (txError) {
          console.error('Error fetching transactions for budget:', txError)
          return {
            budget_id: budget.id,
            category_name: budget.categories?.name || 'Unknown',
            budget_limit: budget.amount,
            spent: 0,
            remaining: budget.amount,
            percentage: 0,
            status: 'under' as const,
          }
        }

        const spent = roundToTwo(
          (transactions || []).reduce((sum, tx) => sum + tx.amount, 0)
        )
        const remaining = roundToTwo(budget.amount - spent)
        const percentage = Math.round((spent / budget.amount) * 100)
        
        // Determine status
        const status = percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'under'

        return {
          budget_id: budget.id,
          category_name: budget.categories?.name || 'Unknown',
          budget_limit: budget.amount,
          spent,
          remaining,
          percentage,
          status,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: budgetProgress,
    })
  } catch (error) {
    console.error('GET /api/budgets/progress error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget progress' },
      { status: 500 }
    )
  }
}
