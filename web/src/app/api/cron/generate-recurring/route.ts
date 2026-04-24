import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { shouldGenerateToday, formatDate } from '@/lib/recurring-utils'

/**
 * POST /api/cron/generate-recurring
 * Auto-generate transactions from recurring transaction definitions
 * 
 * Security: Requires x-cron-token header (same as setup token)
 * This endpoint should be called once daily by a cron service
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron token for security
    const cronToken = request.headers.get('x-cron-token')
    if (!cronToken || cronToken !== 'expense-tracker-setup-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid cron token' },
        { status: 401 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: 'Missing Supabase credentials' },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const today = new Date()
    const todayStr = formatDate(today)

    // Try to fetch from recurring_transactions, if it fails with table-not-found, the tables don't exist
    // In that case, return a message indicating setup is needed
    let recurringTxs: any[] = []
    try {
      const { data, error: fetchError } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', todayStr)
        .order('id')

      if (fetchError) {
        // If table doesn't exist, return a helpful message
        if (fetchError.message.includes('Could not find the table')) {
          return NextResponse.json({
            success: false,
            error: 'Tables not initialized',
            message: 'Please call POST /api/admin/setup-tables first with x-setup-token header',
            endpoint: '/api/admin/setup-tables',
          }, { status: 503 })
        }
        throw fetchError
      }

      recurringTxs = data || []
    } catch (error) {
      console.error('Error fetching recurring transactions:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch recurring transactions', 
          details: error instanceof Error ? error.message : String(error) 
        },
        { status: 500 }
      )
    }

    if (recurringTxs.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active recurring transactions to generate',
        generated: 0,
        total_processed: 0,
      })
    }

    let generatedCount = 0
    const errors: string[] = []

    // Process each recurring transaction
    for (const recTx of recurringTxs) {
      try {
        // Check if end_date has passed
        if (recTx.end_date && todayStr > recTx.end_date) {
          continue
        }

        // Check if we should generate today
        if (!shouldGenerateToday(
          recTx.last_generated_date,
          recTx.start_date,
          recTx.end_date,
          recTx.pattern,
          today
        )) {
          continue
        }

        // Create a new transaction
        const { error: insertError } = await supabase
          .from('transactions')
          .insert({
            user_id: recTx.user_id,
            category_id: recTx.category_id,
            amount: recTx.amount,
            type: recTx.type,
            description: `[Auto] ${recTx.description}`,
            date: todayStr,
            created_at: new Date().toISOString(),
          })

        if (insertError) {
          errors.push(`Failed to create transaction for recurring_id ${recTx.id}: ${insertError.message}`)
          continue
        }

        // Update last_generated_date
        const { error: updateError } = await supabase
          .from('recurring_transactions')
          .update({ last_generated_date: todayStr })
          .eq('id', recTx.id)

        if (updateError) {
          errors.push(`Failed to update recurring_id ${recTx.id}: ${updateError.message}`)
          // Even if update fails, we created the transaction, so count it
        }

        generatedCount++
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`Error processing recurring_id ${recTx.id}: ${errorMsg}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Recurring transaction generation completed',
      generated: generatedCount,
      total_processed: recurringTxs.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('POST /api/cron/generate-recurring error:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate recurring transactions',
        details: errorMsg,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cron/generate-recurring
 * Health check / status endpoint
 */
export async function GET(request: NextRequest) {
  // Allow GET requests for monitoring without token
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/generate-recurring',
    method: 'POST',
    requires: 'x-cron-token header',
    description: 'Auto-generates transactions from active recurring transaction definitions',
  })
}
