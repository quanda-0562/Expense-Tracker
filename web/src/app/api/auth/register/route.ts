import { NextRequest, NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { ZodError } from 'zod'

/**
 * POST /api/auth/register
 * Register a new user
 *
 * Request body:
 * {
 *   email: string,
 *   password: string,
 *   confirm_password: string,
 *   display_name?: string
 * }
 *
 * Success Response (200):
 * {
 *   success: true,
 *   data: {
 *     user: { id, email, display_name }
 *   }
 * }
 *
 * Error Response (400/409/500):
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
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers()

    const userExists = existingUser?.users?.some((u) => u.email === validatedData.email)
    if (userExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 409 }
      )
    }

    // Sign up new user
    const { data, error } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          display_name: validatedData.display_name || null,
        },
      },
    })

    if (error || !data.user) {
      return NextResponse.json(
        {
          success: false,
          error: error?.message || 'Registration failed',
        },
        { status: 400 }
      )
    }

    // Create default categories for the user
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
      user_id: data.user!.id,
      ...cat,
    }))

    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)

    if (categoriesError) {
      console.error('Error creating default categories:', categoriesError)
      // Continue anyway - user is created even if categories fail
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
    console.error('Registration error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during registration',
      },
      { status: 500 }
    )
  }
}
