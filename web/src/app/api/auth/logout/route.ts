import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * POST /api/auth/logout
 * Logout current user
 */
export async function POST(request: NextRequest) {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during logout',
      },
      { status: 500 }
    )
  }
}
