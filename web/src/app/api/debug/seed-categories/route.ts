import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

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
 * POST /api/debug/seed-categories
 * Create default categories for current user (for development/testing)
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

    const defaultCategories = [
      { name: 'Food & Dining', icon: '🍔', is_default: true },
      { name: 'Transportation', icon: '🚗', is_default: true },
      { name: 'Shopping', icon: '🛍️', is_default: true },
      { name: 'Entertainment', icon: '🎬', is_default: true },
      { name: 'Bills & Utilities', icon: '💡', is_default: true },
      { name: 'Healthcare', icon: '⚕️', is_default: true },
      { name: 'Salary', icon: '💰', is_default: true },
    ]

    const categoriesToInsert = defaultCategories.map((cat) => ({
      user_id: user.id,
      ...cat,
    }))

    // Create authenticated client for this request
    const authClient = getAuthenticatedClient(token)

    const { data, error } = await authClient
      .from('categories')
      .insert(categoriesToInsert)
      .select()

    if (error) {
      console.error('Error creating categories:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Default categories created',
      data: data || [],
    })
  } catch (error) {
    console.error('Seed categories error:', error)
    return NextResponse.json(
      { success: false, error: 'An error occurred' },
      { status: 500 }
    )
  }
}
