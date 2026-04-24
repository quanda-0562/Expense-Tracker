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
 * GET /api/transactions
 * Get transactions with advanced filtering and pagination
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - startDate: string (YYYY-MM-DD)
 * - endDate: string (YYYY-MM-DD)
 * - categoryIds: string (comma-separated category IDs)
 * - type: string (income|expense)
 * - minAmount: number
 * - maxAmount: number
 * - search: string (search in description)
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

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, parseInt(searchParams.get('limit') || '20'))
    const offset = (page - 1) * limit

    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryIds = searchParams.get('categoryIds')?.split(',').filter(Boolean) || []
    const type = searchParams.get('type') as 'income' | 'expense' | null
    const minAmount = searchParams.get('minAmount')
    const maxAmount = searchParams.get('maxAmount')
    const search = searchParams.get('search')

    // Create authenticated client for this request
    const authClient = getAuthenticatedClient(token)

    // Build query
    let query = authClient
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .is('deleted_at', null)

    // Apply date filters
    if (startDate) {
      query = query.gte('transaction_date', startDate)
    }
    if (endDate) {
      query = query.lte('transaction_date', endDate)
    }

    // Apply category filter
    if (categoryIds.length > 0) {
      query = query.in('category_id', categoryIds)
    }

    // Apply type filter
    if (type) {
      query = query.eq('type', type)
    }

    // Apply amount filters
    if (minAmount) {
      query = query.gte('amount', parseFloat(minAmount))
    }
    if (maxAmount) {
      query = query.lte('amount', parseFloat(maxAmount))
    }

    // Apply search filter (description contains)
    if (search) {
      query = query.or(`description.ilike.%${search}%`)
    }

    // Order and paginate
    const { data, error, count } = await query
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
