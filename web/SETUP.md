# Expense Tracker - Complete Setup Guide

## 📋 Prerequisites
- Node.js 18+ and npm
- Supabase account (https://supabase.com)
- Git
- Text editor (VS Code recommended)

## 🚀 Quick Start (5 minutes)

### 1. Clone Repository
```bash
cd /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Supabase Project

#### Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for project to initialize
4. Go to Settings → API → Copy Project URL and Anon Key

#### Update Environment Variables
```bash
# Edit .env.local
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Initialize Database

Go to Supabase Dashboard → SQL Editor and run these commands:

#### Create Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Create Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- Insert default categories for new users (requires trigger, optional for MVP)
```

#### Create Transactions Table
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Enable RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
```

#### Create Default Categories Function (Optional)
```sql
-- This function auto-creates default categories for new users
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO categories (user_id, name, is_default) VALUES
    (NEW.id, 'Housing', true),
    (NEW.id, 'Living Expenses', true),
    (NEW.id, 'Entertainment', true),
    (NEW.id, 'Investment', true),
    (NEW.id, 'Others', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call function after user signup
CREATE TRIGGER trigger_create_default_categories
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION create_default_categories();
```

### 5. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

**Auto-redirects to:**
- `/auth/login` - if not authenticated
- `/dashboard` - if authenticated

## 📱 Using the Application

### First Time User Flow
1. **Register** → `/auth/register`
   - Email
   - Password (min 6 chars)
   - Confirm Password
   - Optional: Display Name

2. **Login** → `/auth/login`
   - Email
   - Password

3. **Dashboard** → `/dashboard`
   - See summary (income, expense, balance)
   - View pie chart of spending by category
   - See recent transactions
   - Filter by period (today, week, month, year)

4. **Add Transaction** → `/transactions/new`
   - Choose Income or Expense
   - Enter amount
   - Select category
   - Choose date
   - Add optional description

5. **View Transactions** → `/transactions`
   - List all transactions
   - Edit transaction
   - Delete transaction
   - Pagination (20 per page)

### Forgot Password
1. Go to `/auth/forgot-password`
2. Enter email
3. Check email for reset link
4. Follow link to reset password

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Watch Mode (TDD)
```bash
npm test:watch
```

### Coverage Report
```bash
npm test:coverage
```

## 🔨 Build & Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deploy to Vercel

#### Option 1: Using Vercel CLI
```bash
npm install -g vercel
vercel login
vercel
```

#### Option 2: Git Integration
1. Push code to GitHub
2. Go to https://vercel.com
3. Connect your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## 📊 Database Schema

### Tables
- **users** - User accounts (linked to Supabase Auth)
- **categories** - Spending categories (default + custom)
- **transactions** - Income/expense records

### Key Relationships
```
users (1) ←→ (many) categories
users (1) ←→ (many) transactions
categories (1) ←→ (many) transactions
```

## 🔒 Security Features

✅ **Authentication**
- Supabase Auth with email/password
- Password reset via email
- Secure session management

✅ **Authorization**
- Row Level Security (RLS) on all tables
- Users can only see their own data
- API routes verify user session

✅ **Data Validation**
- Zod schema validation on all inputs
- Type-safe TypeScript throughout

✅ **API Security**
- CORS properly configured
- Input validation & sanitization
- Error messages don't expose sensitive info

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Supabase Connection Issues
1. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Verify Supabase project is active
3. Check browser console for error details

### Test Failures
```bash
# Clear Jest cache
npx jest --clearCache
npm test
```

### Port 3000 Already in Use
```bash
# Run on different port
PORT=3001 npm run dev
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/reset-password` - Send reset email

### Transactions
- `GET /api/transactions?page=1&limit=20` - List transactions
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/:id` - Get transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Dashboard
- `GET /api/dashboard?period=month` - Get dashboard data

## 📝 Environment Variables

### Required
```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### Optional
```
PORT=3000                          # Dev server port
NODE_ENV=development               # development or production
```

## 🎯 Project Structure
```
web/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/               # Auth routes
│   │   ├── (dashboard)/          # Protected routes
│   │   ├── api/                  # API routes
│   │   └── layout.tsx
│   ├── components/               # React components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   └── layout/
│   ├── context/                  # React Context
│   ├── hooks/                    # Custom hooks
│   ├── lib/                      # Utilities
│   ├── services/                 # Business logic
│   ├── types/                    # TypeScript types
│   └── styles/                   # Global styles
├── public/                       # Static files
├── .env.local                    # Environment variables
├── jest.config.ts                # Jest configuration
├── next.config.ts                # Next.js configuration
├── package.json
├── tsconfig.json
└── middleware.ts                 # Protected routes middleware
```

## 🔄 Next Phase Features

**Phase 2: Advanced Features**
- [ ] Advanced filtering (date range, amount)
- [ ] Search functionality
- [ ] CSV export
- [ ] Recurring transactions
- [ ] Budget alerts

**Phase 3: Enhanced UI**
- [ ] Dark mode
- [ ] Mobile app
- [ ] More chart types
- [ ] Data import

**Phase 4: Social**
- [ ] Expense sharing
- [ ] Collaboration
- [ ] Social features

## 📞 Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Jest Testing](https://jestjs.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## ✅ Checklist Before Going Live

- [ ] Supabase project created
- [ ] Database tables created with RLS
- [ ] Environment variables configured
- [ ] All tests passing (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Local dev server working (`npm run dev`)
- [ ] User auth flow tested
- [ ] Transaction CRUD working
- [ ] Dashboard displaying correctly
- [ ] Responsive design tested on mobile
- [ ] Error handling verified
- [ ] Vercel/hosting configured
- [ ] Domain setup (optional)

## 🎉 You're Ready!

Your Expense Tracker is now ready for:
1. **Local Development** - Run `npm run dev`
2. **Testing** - Run `npm test:watch`
3. **Production** - Run `npm run build && npm start`
4. **Deployment** - Deploy to Vercel

**Happy tracking! 💰**
