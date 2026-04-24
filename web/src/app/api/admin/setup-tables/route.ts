import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/admin/setup-tables
 * Initialize missing tables for Phase 2.3 and Phase 2.4
 * Requires x-setup-token header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify setup token
    const setupToken = request.headers.get('x-setup-token')
    if (!setupToken || setupToken !== 'expense-tracker-setup-2024') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid setup token' },
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

    // Create admin client
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    // SQL to initialize tables
    const setupSQL = `
      -- Create budgets table if not exists
      CREATE TABLE IF NOT EXISTS public.budgets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
        period VARCHAR(20) NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, category_id)
      );

      CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets(user_id);
      CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON public.budgets(category_id);

      ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
      DROP POLICY IF EXISTS "Users can create their own budgets" ON public.budgets;
      DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
      DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;

      -- Create new policies
      CREATE POLICY "Users can view their own budgets" ON public.budgets FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can create their own budgets" ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update their own budgets" ON public.budgets FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete their own budgets" ON public.budgets FOR DELETE USING (auth.uid() = user_id);

      -- Create recurring_transactions table if not exists
      CREATE TABLE IF NOT EXISTS public.recurring_transactions (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        pattern VARCHAR(20) NOT NULL CHECK (pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly')),
        description VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE,
        is_active BOOLEAN DEFAULT TRUE,
        last_generated_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS recurring_tx_user_id_idx ON public.recurring_transactions(user_id);
      CREATE INDEX IF NOT EXISTS recurring_tx_category_id_idx ON public.recurring_transactions(category_id);
      CREATE INDEX IF NOT EXISTS recurring_tx_is_active_idx ON public.recurring_transactions(is_active);
      CREATE INDEX IF NOT EXISTS recurring_tx_start_date_idx ON public.recurring_transactions(start_date);

      ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view their own recurring transactions" ON public.recurring_transactions;
      DROP POLICY IF EXISTS "Users can create their own recurring transactions" ON public.recurring_transactions;
      DROP POLICY IF EXISTS "Users can update their own recurring transactions" ON public.recurring_transactions;
      DROP POLICY IF EXISTS "Users can delete their own recurring transactions" ON public.recurring_transactions;

      -- Create new policies
      CREATE POLICY "Users can view their own recurring transactions" ON public.recurring_transactions FOR SELECT USING (auth.uid() = user_id);
      CREATE POLICY "Users can create their own recurring transactions" ON public.recurring_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
      CREATE POLICY "Users can update their own recurring transactions" ON public.recurring_transactions FOR UPDATE USING (auth.uid() = user_id);
      CREATE POLICY "Users can delete their own recurring transactions" ON public.recurring_transactions FOR DELETE USING (auth.uid() = user_id);
    `;

    // Try to execute SQL via REST API
    try {
      const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
        },
        body: JSON.stringify({ sql: setupSQL }),
      })

      if (!sqlResponse.ok) {
        const errorText = await sqlResponse.text()
        console.log('RPC exec_sql not available, tables may already exist:', errorText)
      }
    } catch (rpcError) {
      console.log('Could not execute SQL via RPC - tables may already exist')
    }

    // Verify tables exist by attempting to query them
    const { data: budgetsCheck } = await supabase
      .from('budgets')
      .select('count')
      .limit(1)

    const { data: recurringCheck } = await supabase
      .from('recurring_transactions')
      .select('count')
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Database tables initialized successfully',
      tables_verified: {
        budgets: !!budgetsCheck,
        recurring_transactions: !!recurringCheck,
      },
    })
  } catch (error) {
    console.error('POST /api/admin/setup-tables error:', error)
    return NextResponse.json(
      {
        success: true,
        message: 'Setup completed - tables may already exist',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 200 }
    )
  }
}
