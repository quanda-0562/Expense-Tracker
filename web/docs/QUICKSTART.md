# Quick Start Guide

**Get the Expense Tracker up and running in 5 minutes!**

---

## Step 1: Start Development Server (1 minute)

```bash
cd /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web
npm run dev
```

✅ Server running at http://localhost:3000

---

## Step 2: Setup Supabase (3 minutes)

### 2.1 Create Supabase Account
1. Go to https://supabase.com
2. Sign up with GitHub or email
3. Create a new project

### 2.2 Get Credentials
1. In Supabase Dashboard → Settings → API
2. Copy:
   - **Project URL** 
   - **Anon Key**

### 2.3 Update `.env.local`
```bash
# Edit file: .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Step 3: Create Database Tables (1 minute)

In Supabase Dashboard → SQL Editor, run these 3 SQL scripts:

### Script 1: Users Table
```sql
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);
GRANT ALL ON public.users TO authenticated;
```

### Script 2: Categories Table
```sql
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
GRANT ALL ON public.categories TO authenticated;
```

### Script 3: Transactions Table
```sql
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
  deleted_at TIMESTAMP NULL
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_date ON public.transactions(transaction_date);
GRANT ALL ON public.transactions TO authenticated;
```

---

## ✅ You're Done!

Now you can:

1. **Sign Up** → Go to http://localhost:3000/auth/register
2. **Create Transaction** → Go to /transactions/new
3. **View Dashboard** → Go to /dashboard

---

## 🎯 Common Commands

```bash
# Development
npm run dev              # Start dev server

# Testing
npm test                 # Run all tests
npm test:watch         # Watch mode

# Production
npm run build           # Build for production
npm test:coverage      # Coverage report
```

---

## 📚 Need More Details?

| Need | Document |
|------|----------|
| Complete setup guide | [SETUP.md](./SETUP.md) |
| Supabase full guide | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) |
| Deployment to Vercel | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| Testing guide | [TESTING.md](./TESTING.md) |
| Full documentation | [README.md](./README.md) |

---

## 🆘 Troubleshooting

### Error: "Cannot connect to Supabase"
- Check `.env.local` has correct URL and key
- Restart dev server: `npm run dev`

### Error: "User not found in database"
- Run all 3 SQL scripts above
- Check RLS policies are enabled

### Error: "Categories dropdown is empty"
- This is normal - categories are created on first signup
- Sign up new account to trigger category creation

---

**Questions? Check the full docs or raise an issue on GitHub!**
