import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

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

// Recurring transaction validation schema
const createRecurringTransactionSchema = z.object({
  category_id: z.string().uuid('Invalid category ID'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['income', 'expense']),
  pattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  description: z.string().min(1, 'Description required').max(255),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
})

const updateRecurringTransactionSchema = createRecurringTransactionSchema.partial()

/**
 * GET /api/recurring-transactions
 * Get all recurring transactions for authenticated user
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

    // Get all recurring transactions for user
    const { data: recurringTransactions, error } = await authClient
      .from('recurring_transactions')
      .select('*, categories(id, name, icon)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: recurringTransactions || [],
    })
  } catch (error) {
    console.error('GET /api/recurring-transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recurring transactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/recurring-transactions
 * Create a new recurring transaction
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = createRecurringTransactionSchema.parse(body)

    const authClient = getAuthenticatedClient(token)

    // Create recurring transaction
    const { data: recurringTx, error } = await authClient
      .from('recurring_transactions')
      .insert({
        user_id: user.id,
        ...validatedData,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select('*, categories(id, name, icon)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        data: recurringTx,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/recurring-transactions error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create recurring transaction' },
      { status: 500 }
    )
  }
}
