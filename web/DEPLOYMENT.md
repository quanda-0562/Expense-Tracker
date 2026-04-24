# 🚀 Deployment Guide - Expense Tracker

**Current Status**: ✅ Ready for Production  
**Branch**: `main` (Latest: commit 7f991c1)  
**Last Updated**: April 24, 2026

---

## ✅ Pre-Deployment Checklist

- [x] All Phase 1-2 features implemented
- [x] CSV export feature complete
- [x] 107 unit tests passing
- [x] Build successful (2.9s, 29 pages, 0 errors)
- [x] All code committed and pushed to GitHub
- [x] Environment variables configured
- [x] Vercel configuration created
- [x] Production security headers configured

---

## 🔧 Deployment Steps

### **Option 1: Deploy via Vercel Web UI (Recommended for First Time)**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click "Add New..." → "Project"**
3. **Select GitHub Repository**: `quanda-0562/Expense-Tracker`
4. **Configure Project**:
   - Framework Preset: `Next.js`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm ci`
5. **Add Environment Variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL = jrvnjntywyjmwskrdbsm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_9ANIc1muL5mqMJyQb5NEow_kZu6gF4a
   ```
6. **Click "Deploy"**
7. **Wait for build to complete** (~2-3 minutes)
8. **Visit your production URL** when ready

### **Option 2: Deploy via Vercel CLI (Faster if Installed)**

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web
vercel --prod

# Note: When asked to link project:
# - Link to existing project: Yes (if already set up)
# - Or create new: Yes
# - Provide Supabase env vars when prompted
```

### **Option 3: Automatic Deployment via GitHub**

1. Set up Vercel GitHub integration (if not done)
2. Vercel automatically deploys on every push to `main`
3. Check deployment status at: https://vercel.com/dashboard

---

## 📋 Production Checklist After Deployment

- [ ] Production URL is accessible
- [ ] Dashboard loads correctly
- [ ] Can login with test user:
  - Email: `dang.anh.quan@sun-asterisk.com`
  - Password: `Aa@123456`
- [ ] Transactions page shows 4 test transactions
- [ ] CSV export works
- [ ] Reports page displays all charts
- [ ] Budget page loads
- [ ] Recurring transactions page loads
- [ ] All API endpoints respond correctly

---

## 🔐 Production Environment Variables

**Required for Production**:

```
NEXT_PUBLIC_SUPABASE_URL=jrvnjntywyjmwskrdbsm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9ANIc1muL5mqMJyQb5NEow_kZu6gF4a
```

**Optional (for monitoring)**:

```
SENTRY_DSN=<your-sentry-dsn>  # For error tracking
NEXT_PUBLIC_GTAG_ID=<your-gtag-id>  # For analytics
```

---

## 📊 Production Configuration

- **Framework**: Next.js 16.2.4
- **Runtime**: Node.js (Vercel auto-selected)
- **Build Command**: `next build`
- **Start Command**: `next start`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

---

## 🔍 Health Check Endpoints

Once deployed, test these endpoints:

```bash
# API Health Check
curl https://your-vercel-url.vercel.app/api/transactions -H "Authorization: Bearer YOUR_TOKEN"

# Export CSV
curl https://your-vercel-url.vercel.app/api/export/csv \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o transactions.csv
```

---

## 📈 Monitoring & Logging

**Vercel Analytics** (Built-in):
- View at: Vercel Dashboard → Project → Analytics
- Tracks: Page load time, Core Web Vitals, Network requests

**Optional: Add Error Tracking**:
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
```

---

## 🚨 Troubleshooting

### **Build Fails on Vercel**

```bash
# Check build logs
vercel logs <deployment-url>

# Try local build
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

### **Environment Variables Not Available**

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add missing variables
3. Redeploy: Click "Redeploy" button

### **Database Queries Failing**

1. Verify Supabase URL and key are correct
2. Check Supabase RLS policies
3. Verify CORS settings in Supabase
4. Check that `recurring_transactions` table exists (run setup endpoint)

---

## 🔧 Running Setup Endpoint in Production

If recurring transactions table is not created:

```bash
curl -X POST https://your-vercel-url.vercel.app/api/admin/setup-tables \
  -H "Content-Type: application/json" \
  -H "x-setup-token: expense-tracker-setup-2024" \
  -d '{}'
```

---

## 📝 Post-Deployment Tasks

- [ ] **Setup Monitoring**: Sentry or LogRocket
- [ ] **Configure Analytics**: Google Analytics or Vercel Analytics
- [ ] **Setup Cron Jobs**:
  - Add to `/api/cron/generate-recurring` route
  - Use Vercel Cron Jobs: https://vercel.com/docs/crons
- [ ] **Database Backups**: Setup Supabase backups
- [ ] **Security Audit**: Check HTTPS, CORS, headers
- [ ] **Load Testing**: Test with production data

---

## 📞 Support

**Production Issues**:
- Check Vercel logs
- Verify environment variables
- Check Supabase status page
- Review Next.js error pages

**Questions**:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs

---

## 🎯 Next Phase After Deployment

1. **Monitor Production** (24 hours)
   - Check error rates
   - Monitor performance
   - User feedback

2. **Optimize Performance** (Optional)
   - Implement image optimization
   - Add caching headers
   - Optimize database queries

3. **Add Features** (Phase 3+)
   - Receipt upload
   - Advanced analytics
   - Mobile app support

---

**Deployment Ready!** 🚀 Choose Option 1, 2, or 3 above to deploy.
