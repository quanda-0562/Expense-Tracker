# Supabase Setup Guide - Expense Tracker

## Step 1: Create Supabase Account & Project

### 1.1 Create Account
1. Visit [https://supabase.com](https://supabase.com)
2. Click "Sign Up"
3. Use GitHub or email to sign up
4. Complete email verification

### 1.2 Create New Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: `expense-tracker` (or your preference)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location (e.g., `ap-southeast-1` for Asia)
4. Click "Create new project"
5. Wait 2-3 minutes for project initialization

### 1.3 Get API Credentials
1. Go to Settings → API in your project
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Step 2: Configure Environment Variables

### 2.1 Update `.env.local`
```bash
# File: /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web/.env.local

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace with your actual values from Step 1.3.

---

## Step 3: Create Database Tables

### 3.1 Access SQL Editor
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy each SQL script below and run them one by one

### 3.2 Create Users Table

```sql
-- Create users table (linked to Auth users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
```

**Expected Output**: Query executed successfully ✓

---

### 3.3 Create Categories Table

```sql
-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique category names per user
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own categories
CREATE POLICY "Users can manage own categories" ON public.categories
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- Grant permissions
GRANT ALL ON public.categories TO authenticated;
GRANT SELECT ON public.categories TO anon;
```

**Expected Output**: Query executed successfully ✓

---

### 3.4 Create Transactions Table

```sql
-- Create transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  
  -- Soft delete: transactions with deleted_at are considered deleted
  CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only manage their own transactions
CREATE POLICY "Users can manage own transactions" ON public.transactions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
CREATE INDEX idx_transactions_deleted ON public.transactions(deleted_at);

-- Grant permissions
GRANT ALL ON public.transactions TO authenticated;
GRANT SELECT ON public.transactions TO anon;
```

**Expected Output**: Query executed successfully ✓

---

### 3.5 (Optional) Create Default Categories Function

This will automatically create default categories when a user signs up.

```sql
-- Create function to initialize default categories
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, is_default)
  VALUES
    (NEW.id, 'Housing', true),
    (NEW.id, 'Food & Dining', true),
    (NEW.id, 'Entertainment', true),
    (NEW.id, 'Transport', true),
    (NEW.id, 'Utilities', true),
    (NEW.id, 'Health', true),
    (NEW.id, 'Shopping', true),
    (NEW.id, 'Salary', true),
    (NEW.id, 'Investment', true),
    (NEW.id, 'Others', true)
  ON CONFLICT (user_id, name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger: execute function after user is created in users table
CREATE TRIGGER trigger_create_default_categories
AFTER INSERT ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.create_default_categories();
```

**Expected Output**: Query executed successfully ✓

---

## Step 4: Setup Authentication

### 4.1 Configure Auth Settings
1. In Supabase Dashboard, go to **Authentication → Providers**
2. Ensure "Email" is enabled (default)
3. Go to **Authentication → Email Templates**
4. Verify email templates are configured (they should be by default)

### 4.2 Set Redirect URLs (For Production)
1. Go to **Authentication → URL Configuration**
2. Add these redirect URLs:
   ```
   http://localhost:3000
   http://localhost:3000/dashboard
   https://your-domain.com (when deploying to production)
   ```

---

## Step 5: Test the Setup

### 5.1 Start Development Server
```bash
cd /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web
npm run dev
```

The app should now be running at `http://localhost:3000`

### 5.2 Test User Signup
1. Click "Sign up" on the login page
2. Enter:
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Confirm Password: `Test123!@#`
   - Display Name: `Test User`
3. Click "Sign up"

**Expected**: 
- User is created in Supabase
- Auto-redirects to dashboard
- Default categories are created (if using Step 3.5)

### 5.3 Test Login
1. Sign out (click user menu → Logout)
2. Go back to login page
3. Enter credentials from Step 5.2
4. Click "Sign in"

**Expected**: Successful login, redirects to dashboard

### 5.4 Test Transaction Creation
1. On dashboard, click "Add Transaction"
2. Fill in:
   - Type: "Expense"
   - Amount: "50"
   - Category: Select one from dropdown
   - Date: Today
   - Description: "Test transaction"
3. Click "Create Transaction"

**Expected**: Transaction appears in recent transactions list and dashboard updates

---

## Step 6: Verify Database

### 6.1 Check Data in Supabase
1. Go to Supabase Dashboard → Table Editor
2. Check these tables have data:
   - **users** - should have your user
   - **categories** - should have default categories (if Step 3.5 was executed)
   - **transactions** - should have your test transaction

### 6.2 View Real-time Data
All tables show real-time data in Supabase Dashboard. You can:
- View all records
- Edit records directly
- Delete records
- Check Row Level Security policies

---

## Troubleshooting

### Issue: "Cannot find module" or "Supabase error"

**Solution:**
1. Verify `.env.local` has correct values
2. Restart dev server: `npm run dev`
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: "Permission denied" error in browser

**Solution:**
1. Check RLS policies are enabled
2. Verify Row Level Security policies were created for each table
3. Go to Supabase Dashboard → Authentication → Check user is actually created

### Issue: "User creation failed"

**Solution:**
1. Check email is valid format
2. Password must be at least 6 characters
3. Email must be unique (no duplicate signups)
4. Check Auth settings are enabled

### Issue: Can't see default categories after signup

**Solution:**
1. Check Step 3.5 was executed (default categories function)
2. Go to Supabase Dashboard → Table Editor → categories table
3. Filter by your user_id to verify categories exist
4. If not, manually insert them via SQL:

```sql
INSERT INTO public.categories (user_id, name, is_default)
VALUES 
  ('your-user-id', 'Housing', true),
  ('your-user-id', 'Food & Dining', true),
  ('your-user-id', 'Entertainment', true);
```

---

## Next Steps

### For Development
- Run tests: `npm test:watch`
- View code coverage: `npm test:coverage`
- Build for production: `npm run build`

### For Production Deployment
- See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Configure Vercel with Supabase env vars
- Set up custom domain
- Configure email provider for password resets

---

## Security Checklist

- [x] Row Level Security (RLS) enabled on all tables
- [x] All users can only access their own data
- [x] Passwords stored securely by Supabase Auth
- [x] API keys are environment variables (not hardcoded)
- [x] Soft deletes for transactions (data privacy)
- [x] Email verification for password resets

---

## Database Schema Summary

### users
- `id` (UUID) - Primary key, linked to auth.users
- `email` (VARCHAR) - User's email
- `display_name` (VARCHAR) - Optional display name
- `created_at` (TIMESTAMP) - Account creation time
- `updated_at` (TIMESTAMP) - Last update time

### categories
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `name` (VARCHAR) - Category name (unique per user)
- `icon` (VARCHAR) - Optional icon identifier
- `is_default` (BOOLEAN) - Whether it's a default category
- `created_at` (TIMESTAMP) - Creation time

### transactions
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `category_id` (UUID) - Foreign key to categories
- `type` (VARCHAR) - 'income' or 'expense'
- `amount` (DECIMAL) - Transaction amount
- `description` (TEXT) - Optional description
- `transaction_date` (DATE) - Transaction date
- `created_at` (TIMESTAMP) - Creation time
- `updated_at` (TIMESTAMP) - Last update time
- `deleted_at` (TIMESTAMP) - Soft delete timestamp (NULL if not deleted)

---

**Questions?** Check the main [README.md](./README.md) or [SETUP.md](./SETUP.md) for more details.
