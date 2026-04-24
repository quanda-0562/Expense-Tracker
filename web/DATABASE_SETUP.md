# Database Setup for Phase 2.3 - Budget Management

## Creating the Budgets Table

Run this SQL in the Supabase SQL Editor to create the `budgets` table:

```sql
-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  period VARCHAR(20) NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, category_id) -- One budget per category per user
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON public.budgets(category_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow users to see only their own budgets
CREATE POLICY "Users can view their own budgets" 
  ON public.budgets FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow users to insert budgets only for themselves
CREATE POLICY "Users can create their own budgets" 
  ON public.budgets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update only their own budgets
CREATE POLICY "Users can update their own budgets" 
  ON public.budgets FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow users to delete only their own budgets
CREATE POLICY "Users can delete their own budgets" 
  ON public.budgets FOR DELETE 
  USING (auth.uid() = user_id);
```

## Steps to Execute

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (jrvnjntywyjmwskrdbsm)
3. Go to SQL Editor
4. Create a new query
5. Paste the SQL above
6. Click "Run"
7. The budgets table will be created with all necessary RLS policies

## Verification

After running the SQL, you should be able to:
- Create budgets for your account
- See budgets in the Budget Management page at `/dashboard/budgets`
- View budget progress and spending vs. limit
