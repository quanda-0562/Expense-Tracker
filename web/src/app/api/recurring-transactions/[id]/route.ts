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

const updateRecurringTransactionSchema = z.object({
  category_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  type: z.enum(['income', 'expense']).optional(),
  pattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']).optional(),
  description: z.string().min(1).max(255).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_active: z.boolean().optional(),
})

/**
 * GET /api/recurring-transactions/[id]
 * Get a specific recurring transaction
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const authClient = getAuthenticatedClient(token)

    // Get recurring transaction
    const { data: recurringTx, error } = await authClient
      .from('recurring_transactions')
      .select('*, categories(id, name, icon)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Recurring transaction not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: recurringTx,
    })
  } catch (error) {
    console.error('GET /api/recurring-transactions/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recurring transaction' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/recurring-transactions/[id]
 * Update a recurring transaction
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const validatedData = updateRecurringTransactionSchema.parse(body)

    const { id } = await params
    const authClient = getAuthenticatedClient(token)

    // Verify ownership
    const { data: existing, error: checkError } = await authClient
      .from('recurring_transactions')
      .select('user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Recurring transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update recurring transaction
    const { data: recurringTx, error } = await authClient
      .from('recurring_transactions')
      .update(validatedData)
      .eq('id', id)
      .select('*, categories(id, name, icon)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: recurringTx,
    })
  } catch (error) {
    console.error('PUT /api/recurring-transactions/[id] error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update recurring transaction' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/recurring-transactions/[id]
 * Delete a recurring transaction (stops the recurrence)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params
    const authClient = getAuthenticatedClient(token)

    // Verify ownership
    const { data: existing, error: checkError } = await authClient
      .from('recurring_transactions')
      .select('user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Recurring transaction not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete recurring transaction
    const { error } = await authClient
      .from('recurring_transactions')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Recurring transaction deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/recurring-transactions/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete recurring transaction' },
      { status: 500 }
    )
  }
}
