import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { ZodError } from 'zod'

/**
 * POST /api/auth/login
 * Login with email and password
 *
 * Request body:
 * {
 *   email: string,
 *   password: string
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   data: {
 *     user: { id, email, display_name },
 *     session: { access_token, refresh_token, expires_in }
 *   }
 * }
 *
 * Error Response (400/401/500):
 * {
 *   success: false,
 *   error: "error message"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()

    // Validate input
    const validatedData = loginSchema.parse(body)

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email or password',
        },
        { status: 401 }
      )
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            display_name: data.user.user_metadata?.display_name,
          },
          session: {
            access_token: data.session?.access_token,
            refresh_token: data.session?.refresh_token,
            expires_in: data.session?.expires_in,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // Handle other errors
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login',
      },
      { status: 500 }
    )
  }
}
