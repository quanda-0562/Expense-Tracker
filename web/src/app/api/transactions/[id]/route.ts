import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { updateTransactionSchema } from '@/lib/validations'
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
 * GET /api/transactions/:id
 * Get a single transaction
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Create authenticated client for this request
    const authClient = getAuthenticatedClient(token)

    const { data, error } = await authClient
      .from('transactions')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/transactions/:id error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transaction' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/transactions/:id
 * Update a transaction
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Verify ownership using authenticated client
    const authClient = getAuthenticatedClient(token)
    
    const { data: existing, error: fetchError } = await authClient
      .from('transactions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Parse and validate input
    const body = await request.json()
    const validatedData = updateTransactionSchema.parse(body)

    // Update transaction using the same authenticated client
    const { data, error } = await authClient
      .from('transactions')
      .update({
        ...(validatedData.type && { type: validatedData.type }),
        ...(validatedData.amount && { amount: validatedData.amount }),
        ...(validatedData.category_id && { category_id: validatedData.category_id }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
        ...(validatedData.transaction_date && { transaction_date: validatedData.transaction_date }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    console.error('PUT /api/transactions/:id error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/transactions/:id
 * Delete a transaction (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
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

    // Verify ownership using authenticated client
    const authClient = getAuthenticatedClient(token)

    const { data: existing, error: fetchError } = await authClient
      .from('transactions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Soft delete using the same authenticated client
    const { error } = await authClient
      .from('transactions')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    console.error('DELETE /api/transactions/:id error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    )
  }
}
