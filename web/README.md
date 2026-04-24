# 💰 Expense Tracker

A modern personal expense tracking application built with **Next.js 16**, **TypeScript**, **React 19**, and **Supabase PostgreSQL**.

**Status**: ✅ **Phase 2 Complete** - Ready for Production  
**Build**: ✅ 28 pages | 0 TypeScript errors | 2.9s compile time

---

## 🎯 Features

### Phase 1 (MVP) ✅
- User authentication (signup, login, password reset)
- Transaction management (create, edit, delete)
- Dashboard with analytics
- Period filters (Today, Week, Month, Year)
- Transaction categorization

### Phase 2 (Advanced) ✅
- **Advanced Filtering** - Multi-criteria transaction filtering
- **Reports & Analytics** - Comprehensive charts & statistics
- **Budget Management** - Set and track spending limits
- **Recurring Transactions** - Automate income/expense patterns
- **Auto-Generation** - Cron job for automatic transaction creation

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### 4. Initialize Database
Call the setup endpoint:
```bash
curl -X POST http://localhost:3000/api/admin/setup-tables \
  -H "x-setup-token: expense-tracker-setup-2024" \
  -H "Content-Type: application/json"
```

For detailed setup, see [**docs/QUICKSTART.md**](docs/QUICKSTART.md)


---

## 📚 Documentation

All documentation is in the **`docs/`** folder:

| Document | Purpose |
|----------|---------|
| [INDEX.md](docs/INDEX.md) | Documentation overview & project structure |
| [QUICKSTART.md](docs/QUICKSTART.md) | Installation & first steps |
| [PHASE_2_COMPLETE.md](docs/PHASE_2_COMPLETE.md) | **⭐ Complete Phase 2 feature guide** |
| [SETUP_CRON.md](docs/SETUP_CRON.md) | Auto-generation scheduling & setup |
| [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) | Database configuration |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [TESTING.md](docs/TESTING.md) | Testing strategy & test suites |
| [PROJECT_CHECKLIST.md](docs/PROJECT_CHECKLIST.md) | Complete project task list |

---

## 🏗️ Project Structure

```
web/
├── src/
│   ├── app/              # Next.js app directory & API routes
│   │   ├── api/         # REST API endpoints
│   │   ├── auth/        # Auth pages (login, signup, forgot-password)
│   │   ├── dashboard/   # Main application pages
│   │   └── layout.tsx   # Root layout
│   ├── components/       # React components
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities (date calc, reporting, etc.)
│   ├── services/        # API service layer
│   ├── types/           # TypeScript definitions
│   └── context/         # React context for global state
├── docs/                # Documentation (this folder)
├── public/              # Static assets
├── jest.config.ts       # Jest testing config
├── next.config.ts       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── middleware.ts        # Next.js middleware
```


---

## 🔑 Key Technologies

| Tech | Version | Purpose |
|------|---------|---------|
| **Next.js** | 16.2.4 | React framework with SSR |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Supabase** | Latest | PostgreSQL + Auth |
| **Tailwind CSS** | 4.x | Styling |
| **React Hook Form** | 7.x | Form state |
| **Zod** | Latest | Schema validation |
| **Recharts** | 2.x | Charts & visualizations |

---

## 📊 Dashboard Overview

The dashboard displays:
- **Summary Cards**: Total income, expense, balance for selected period
- **Expense Chart**: Pie chart showing spending by category
- **Daily Trends**: Line chart of daily income/expense
- **Recent Transactions**: Last 4 transactions with details
- **Period Filter**: Quick selection (Today, Week, Month, Year)

---

## 🔐 Security Features

✅ **Authentication**
- Supabase Auth with email/password
- JWT token in localStorage
- Secure password reset flow

✅ **Database Security**
- Row-Level Security (RLS) on all tables
- Users only see their own data
- Service role for admin operations

✅ **API Security**
- Bearer token validation on all endpoints
- Token-based admin endpoints (setup, cron)
- Environment variable protection


---

## 📈 Build & Deploy

### Local Development
```bash
npm run dev        # Start dev server
npm run build      # Build for production
npm run start      # Run production build
npm test          # Run Jest tests
npm run lint      # Run ESLint
```

### Production Deployment
See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Vercel deployment
- Environment configuration
- Database backups
- Monitoring setup

---

## 🧪 Testing

- **Unit Tests**: Jest test suites for utilities & services
- **API Testing**: curl commands for endpoint validation
- **Component Testing**: React component test files
- **E2E Testing**: Full workflow verification

Run tests:
```bash
npm test
```

See [docs/TESTING.md](docs/TESTING.md) for detailed testing guide.

---

## 💡 API Endpoints

### Public
- `GET /` - Homepage
- `GET /auth/login` - Login page
- `GET /auth/register` - Register page
- `GET /auth/forgot-password` - Password reset

### Authenticated (requires JWT token)
- `GET /api/transactions` - List transactions with filters
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `GET /api/reports` - Get analytics & reports
- `GET /api/budgets` - List budgets
- `POST /api/budgets` - Create budget
- `GET /api/budgets/progress` - Budget progress
- `GET /api/recurring-transactions` - List recurring
- `POST /api/recurring-transactions` - Create recurring

### Admin (requires x-setup-token)
- `POST /api/admin/setup-tables` - Initialize database tables

### Cron (requires x-cron-token)
- `POST /api/cron/generate-recurring` - Auto-generate transactions
- `GET /api/cron/generate-recurring` - Health check

---

## 🛠️ Development Workflow

1. **Feature Development**
   - Create feature branch from `main`
   - Implement with TypeScript strict mode
   - Run `npm run build` to verify
   - Commit with clear messages

2. **Code Quality**
   - ESLint: `npm run lint`
   - TypeScript: Strict type checking
   - Testing: `npm test`

3. **Deployment**
   - Test in staging environment
   - Verify all endpoints
   - Deploy to production via Vercel

---

## ✨ Next Steps

1. ✅ **Phase 2 Complete**
2. 📋 **Execute Supabase SQL** - Create tables (see setup guide)
3. 🔗 **Configure Cron** - Set up auto-generation scheduling
4. 🚀 **Deploy** - Move to production environment

---

## 📞 Support

For detailed information:
- 📖 Read [docs/INDEX.md](docs/INDEX.md) for documentation index
- 🚀 Check [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment
- ⚙️ See [docs/SETUP_CRON.md](docs/SETUP_CRON.md) for cron setup
- 🗄️ View [docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md) for database setup

---

**Last Updated**: April 24, 2026  
**Status**: ✅ Production Ready  
**Phase**: 2 (Advanced Features Complete)
