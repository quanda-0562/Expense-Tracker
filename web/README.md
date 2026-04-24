# Expense Tracker - Complete Development Guide

A modern **Personal Expense Tracker** web application built with **Next.js 16**, **TypeScript**, and **Supabase**. 

**Status**: ✅ Phase 1 MVP Complete - Ready for Deployment

---

## 🎯 Features

### Phase 1 (MVP) - ✅ Complete
- **User Authentication**
  - Email/password signup & login
  - Password reset via email
  - Session persistence
  - Secure logout

- **Transaction Management**
  - Create income & expense transactions
  - Edit & delete transactions  
  - Categorize transactions
  - Soft delete (data privacy)
  - Pagination (20 per page)

- **Dashboard & Analytics**
  - Summary cards (Income, Expense, Balance)
  - Pie chart showing expense breakdown by category
  - Recent transactions widget
  - Period filters (Today, Week, Month, Year)
  - Real-time updates

- **Category Management**
  - Pre-defined default categories
  - Create custom categories
  - Per-user category isolation

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier available)
- Git

### 2. Clone & Install
```bash
cd /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web

# Install dependencies (already done - 742 packages)
npm install

# Start development server
npm run dev
```

Visit: **http://localhost:3000**

### 3. Setup Supabase
See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for complete instructions:
- Create Supabase project
- Create database tables
- Configure authentication
- Set environment variables

### 4. Test the Application
```bash
# Sign up new account at /auth/register
# Create transactions at /transactions/new
# View dashboard at /dashboard
```

---

## 📁 Project Structure

```
web/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── auth/             # Authentication routes (signup, login, reset)
│   │   ├── dashboard/        # Protected dashboard routes
│   │   ├── api/              # API endpoints
│   │   └── layout.tsx        # Root layout with AuthProvider
│   │
│   ├── components/           # React components
│   │   ├── auth/             # Login, Register, ForgotPassword forms
│   │   ├── transactions/     # TransactionForm, TransactionList
│   │   ├── dashboard/        # Dashboard component
│   │   ├── layout/           # Navbar, Layouts
│   │   └── ui/               # Reusable UI components
│   │
│   ├── context/              # React Context (AuthContext)
│   ├── lib/                  # Utilities & configuration
│   │   ├── supabase.ts       # Supabase client
│   │   ├── validations.ts    # Zod schemas
│   │   └── utils.ts          # Helper functions
│   ├── services/             # Business logic
│   │   ├── auth.service.ts   # Auth utilities
│   │   └── transaction.service.ts  # Transaction logic
│   └── types/                # TypeScript type definitions
│
├── public/                   # Static assets
├── jest.config.ts            # Jest testing configuration
├── jest.setup.ts             # Jest setup
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
├── middleware.ts             # Route protection middleware
└── tailwind.config.ts        # Tailwind CSS configuration
```

---

## 🛠 Tech Stack

### Frontend
- **Next.js 16.2.4** - Full-stack React framework with App Router
- **React 19.2.4** - UI library with hooks
- **TypeScript 5** - Type-safe JavaScript (strict mode)
- **Tailwind CSS 4** - Utility-first styling

### Backend & Auth
- **Supabase** - PostgreSQL database + Auth service
- **Next.js API Routes** - Backend endpoints

### Forms & Validation
- **React Hook Form 7** - Form state management
- **Zod 4** - Runtime schema validation

### Charts & Visualization
- **Recharts 3** - React charting library

### Testing
- **Jest 30** - Unit testing framework
- **React Testing Library** - Component testing
- **Target Coverage**: 70%

### Deployment
- **Vercel** - Serverless deployment platform
- **GitHub** - Version control

---

## 📚 Documentation

### For Different Tasks

| Task | Document |
|------|----------|
| **Local Development** | [SETUP.md](./SETUP.md) - Complete setup guide |
| **Supabase Configuration** | [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Database setup with SQL scripts |
| **Production Deployment** | [DEPLOYMENT.md](./DEPLOYMENT.md) - Vercel deployment guide |
| **Testing Guide** | [TESTING.md](./TESTING.md) - Unit & manual testing |
| **Project Specification** | [doc/spec.md](./doc/spec.md) - Original requirements document |

---

## 💻 Development

### Available Commands

```bash
# Development
npm run dev              # Start development server (http://localhost:3000)

# Testing
npm test                 # Run all tests once
npm test:watch          # Run tests in watch mode (TDD)
npm test:coverage       # Generate coverage report

# Build & Deploy
npm run build           # Build for production
npm run lint            # Run TypeScript type checking
```

### Development Workflow

1. **Start Dev Server**
   ```bash
   npm run dev
   ```
   Runs on http://localhost:3000 with hot-reload enabled

2. **Make Changes**
   - Edit components in `src/components/`
   - Edit pages in `src/app/`
   - Edit API routes in `src/app/api/`

3. **Run Tests (TDD)**
   ```bash
   npm test:watch
   ```
   Tests automatically re-run as you edit files

4. **Verify Build**
   ```bash
   npm run build
   ```
   Compiles TypeScript and checks for errors

---

## 🧪 Testing

### Quick Start
```bash
npm test                # Run all tests
npm test:watch         # Watch mode (recommended)
npm test:coverage      # Coverage report
```

### Key Test Files
- `src/components/auth/LoginForm.test.tsx` - Login component tests
- `src/components/auth/RegisterForm.test.tsx` - Register component tests
- `src/components/transactions/TransactionForm.test.tsx` - Transaction form tests
- `src/services/auth.service.test.ts` - Auth utilities tests
- `src/services/transaction.service.test.ts` - Transaction logic tests

### Test Coverage
- **Target**: 70% coverage
- **Current**: All Phase 1 components have comprehensive tests
- **View Report**: `npm test:coverage` then open `coverage/index.html`

**See [TESTING.md](./TESTING.md) for complete testing guide**

---

## 🚀 Deployment

### Build Verification
```bash
npm run build    # Should complete without errors
```

### Deploy to Vercel
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy (automatic on every push to main)

**See [DEPLOYMENT.md](./DEPLOYMENT.md) for step-by-step instructions**

---

## 🔒 Security Features

- ✅ **Row Level Security (RLS)** - Users can only access own data
- ✅ **Password hashing** - Passwords hashed by Supabase Auth
- ✅ **Session management** - JWT tokens with automatic refresh
- ✅ **HTTPS only** - All communication encrypted
- ✅ **Environment variables** - No secrets in code
- ✅ **Soft deletes** - Data retained for compliance
- ✅ **Input validation** - Zod schemas validate all inputs
- ✅ **CSRF protection** - Built into Next.js
- ✅ **API authentication** - All endpoints check user session

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/reset-password` - Password reset

### Transactions
- `GET /api/transactions` - List transactions (paginated)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get single transaction
- `PUT /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

### Dashboard
- `GET /api/dashboard` - Get dashboard data with period filter

All endpoints require authentication (except auth endpoints).

---

## 🎯 Next Phase (Phase 2)

After Phase 1 MVP is deployed, planned features:

- [ ] Advanced filtering (by date range, amount, category)
- [ ] Search functionality
- [ ] CSV export
- [ ] Recurring transactions
- [ ] Budget limits and alerts
- [ ] Multiple currencies
- [ ] Mobile app (React Native)
- [ ] Dark mode

---

## 🤝 Contributing

Development guidelines are in [.github/copilot-instructions.md](./.github/copilot-instructions.md)

---

## 📞 Support & Resources

| Resource | Link |
|----------|------|
| Next.js Docs | [nextjs.org/docs](https://nextjs.org/docs) |
| Supabase Docs | [supabase.com/docs](https://supabase.com/docs) |
| React Docs | [react.dev](https://react.dev) |
| TypeScript Docs | [typescriptlang.org](https://www.typescriptlang.org/) |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com) |
| Vercel Docs | [vercel.com/docs](https://vercel.com/docs) |

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🎉 Project Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Setup | ✅ Complete | 742 packages, Jest configured |
| Phase 1: MVP | ✅ Complete | Auth, CRUD, Dashboard ready |
| Phase 2: Features | ⏳ Planned | Advanced features, search |
| Phase 3: Mobile | ⏳ Planned | React Native app |
| Phase 4: Analytics | ⏳ Planned | Advanced reporting |

**Current**: Ready for production deployment on Vercel

---

**Built with ❤️ using Next.js, React, and Supabase**
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Jest Testing](https://jestjs.io/)
