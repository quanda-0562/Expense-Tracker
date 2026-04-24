import { NextRequest, NextResponse } from 'next/server'
import { resetPasswordSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { ZodError } from 'zod'

/**
 * POST /api/auth/reset-password
 * Send password reset email
 *
 * Request body:
 * {
 *   email: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    // Send reset password email
    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      )
    }

    // Always return success for security (don't reveal if email exists)
    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'If an account exists, a reset link has been sent to your email',
        },
      },
      { status: 200 }
    )
  } catch (error) {
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

    console.error('Reset password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred',
      },
      { status: 500 }
    )
  }
}
