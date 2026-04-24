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

const updateBudgetSchema = z.object({
  category_id: z.string().uuid().optional(),
  amount: z.number().positive().optional(),
  period: z.enum(['weekly', 'monthly', 'yearly']).optional(),
})

/**
 * GET /api/budgets/[id]
 * Get a specific budget
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

    // Get budget
    const { data: budget, error } = await authClient
      .from('budgets')
      .select('*, categories(id, name, icon)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Budget not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      data: budget,
    })
  } catch (error) {
    console.error('GET /api/budgets/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch budget' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/budgets/[id]
 * Update a budget
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
    const validatedData = updateBudgetSchema.parse(body)

    const { id } = await params
    const authClient = getAuthenticatedClient(token)

    // Verify ownership
    const { data: existing, error: checkError } = await authClient
      .from('budgets')
      .select('user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Budget not found or unauthorized' },
        { status: 404 }
      )
    }

    // Update budget
    const { data: budget, error } = await authClient
      .from('budgets')
      .update(validatedData)
      .eq('id', id)
      .select('*, categories(id, name, icon)')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: budget,
    })
  } catch (error) {
    console.error('PUT /api/budgets/[id] error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/budgets/[id]
 * Delete a budget
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
      .from('budgets')
      .select('user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (checkError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Budget not found or unauthorized' },
        { status: 404 }
      )
    }

    // Delete budget
    const { error } = await authClient
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully',
    })
  } catch (error) {
    console.error('DELETE /api/budgets/[id] error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
