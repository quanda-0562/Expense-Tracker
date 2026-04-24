import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createTransactionSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { ZodError } from 'zod'

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
 * GET /api/transactions?page=1&limit=20
 * Get all transactions for current user with pagination
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
    // Get current user
    const user = await getAuthenticatedUser(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get pagination params
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const offset = (page - 1) * limit

    // Create authenticated client for this request
    const authClient = getAuthenticatedClient(token)

    // Get transactions
    const { data, error, count } = await authClient
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('transaction_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      page_size: limit,
    })
  } catch (error) {
    console.error('GET /api/transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/transactions
 * Create a new transaction
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user
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

    // Parse and validate input
    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // Create authenticated client for this request
    const authClient = getAuthenticatedClient(token)

    // Create transaction
    const { data, error } = await authClient
      .from('transactions')
      .insert({
        user_id: user.id,
        category_id: validatedData.category_id,
        type: validatedData.type,
        amount: validatedData.amount,
        description: validatedData.description || null,
        transaction_date: validatedData.transaction_date,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(
      { success: true, data },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('POST /api/transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}
