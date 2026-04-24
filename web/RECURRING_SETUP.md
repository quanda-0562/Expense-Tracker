# Database Setup for Phase 2.4 - Recurring Transactions

## Creating the Recurring Transactions Table

Run this SQL in the Supabase SQL Editor to create the `recurring_transactions` table:

```sql
-- Create recurring_transactions table
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS recurring_tx_user_id_idx ON public.recurring_transactions(user_id);
CREATE INDEX IF NOT EXISTS recurring_tx_category_id_idx ON public.recurring_transactions(category_id);
CREATE INDEX IF NOT EXISTS recurring_tx_is_active_idx ON public.recurring_transactions(is_active);
CREATE INDEX IF NOT EXISTS recurring_tx_start_date_idx ON public.recurring_transactions(start_date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to see only their own recurring transactions
CREATE POLICY "Users can view their own recurring transactions" 
  ON public.recurring_transactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert recurring transactions only for themselves
CREATE POLICY "Users can create their own recurring transactions" 
  ON public.recurring_transactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own recurring transactions
CREATE POLICY "Users can update their own recurring transactions" 
  ON public.recurring_transactions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete only their own recurring transactions
CREATE POLICY "Users can delete their own recurring transactions" 
  ON public.recurring_transactions FOR DELETE 
  USING (auth.uid() = user_id);
```

## Steps to Execute

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (jrvnjntywyjmwskrdbsm)
3. Go to SQL Editor
4. Create a new query
5. Paste the SQL above
6. Click "Run"
7. The recurring_transactions table will be created with all necessary RLS policies

## Verification

After running the SQL, you should be able to:
- Create recurring transactions at `/dashboard/recurring`
- Pause/resume recurring transactions
- Delete recurring transactions
- See all recurring transactions in the list

## How Auto-Generation Works

The system automatically creates new transaction entries for:
- Daily recurring transactions (every day)
- Weekly recurring transactions (every 7 days)
- Bi-weekly recurring transactions (every 14 days)
- Monthly recurring transactions (on the same day each month)
- Quarterly recurring transactions (every 3 months)
- Yearly recurring transactions (annually)

Note: Auto-generation requires a cron job or scheduled function (Phase 2.5 enhancement)
