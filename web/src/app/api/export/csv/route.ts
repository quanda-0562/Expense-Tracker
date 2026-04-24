import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { transactionsToCSV, generateCSVFilename } from '@/lib/csv-export'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/export/csv
 * Export transactions as CSV file
 *
 * Query parameters:
 * - startDate: YYYY-MM-DD (optional)
 * - endDate: YYYY-MM-DD (optional)
 * - categoryId: UUID (optional)
 * - type: 'income' | 'expense' (optional)
 *
 * Example: GET /api/export/csv?startDate=2024-01-01&endDate=2024-12-31
 */
export async function GET(request: NextRequest) {
  try {
    // Extract auth token from headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create authenticated Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    const authenticatedClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const categoryId = searchParams.get('categoryId')
    const type = searchParams.get('type')

    // Build query
    let query = authenticatedClient
      .from('transactions')
      .select(
        'date, type, amount, categories!inner(name), description'
      )
      .eq('user_id', user.id)
      .order('date', { ascending: false })

    // Apply filters
    if (startDate) {
      query = query.gte('date', startDate)
    }

    if (endDate) {
      query = query.lte('date', endDate)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (type && (type === 'income' || type === 'expense')) {
      query = query.eq('type', type)
    }

    // Fetch data
    const { data: transactions, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching transactions:', fetchError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: 'No transactions found' },
        { status: 404 }
      )
    }

    // Transform data for CSV export
    // Type assertion needed because Supabase relation is complex
    const transactionsForExport = (transactions as any[]).map(tx => ({
      date: tx.date,
      type: tx.type,
      amount: tx.amount,
      category_name: tx.categories?.name || 'Unknown',
      description: tx.description,
    }))

    // Generate CSV
    const csv = transactionsToCSV(transactionsForExport)

    // Return as CSV file download
    const filename = generateCSVFilename()

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Export CSV error:', error)
    return NextResponse.json(
      {
        error: 'Failed to export CSV',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
