# Deployment Guide - Vercel

This guide covers deploying the Expense Tracker to Vercel for production use.

## Prerequisites

Before deploying, ensure you have:
- ✅ Supabase project created with database (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- ✅ All environment variables configured locally
- ✅ Code pushed to GitHub (Vercel requires Git)
- ✅ Application tested locally with `npm run dev`

---

## Step 1: Prepare for Deployment

### 1.1 Build Verification
```bash
cd /Users/dang.anh.quan/Desktop/repo/fe/Expense-Tracker/web

# Run production build
npm run build

# Should output: "✓ Compiled successfully"
```

### 1.2 Run Tests
```bash
npm test
```

### 1.3 Push Code to GitHub

Create a GitHub repository and push your code:

```bash
git init
git add .
git commit -m "Initial commit: Expense Tracker MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/expense-tracker.git
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub repositories

### 2.2 Import Project
1. In Vercel Dashboard, click "Add New" → "Project"
2. Find your `expense-tracker` repository
3. Click "Import"
4. Configure project settings:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `web` (if needed)
   - **Environment Variables**: (see Step 2.3)

### 2.3 Add Environment Variables

On the "Configure Project" page, add these environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get these values from:
- Supabase Dashboard → Settings → API
- Copy Project URL and anon public key

**Important**: These are public keys (safe to expose), but keep them only in `.env.local` during development.

### 2.4 Deploy
1. Click "Deploy"
2. Wait for deployment to complete (usually 2-5 minutes)
3. You'll get a production URL: `https://YOUR_PROJECT_NAME.vercel.app`

---

## Step 3: Configure Vercel Deployment Settings

### 3.1 Update Supabase Redirect URLs
After deployment, add your Vercel URL to Supabase:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add redirect URLs:
   ```
   https://YOUR_PROJECT_NAME.vercel.app
   https://YOUR_PROJECT_NAME.vercel.app/dashboard
   ```

### 3.2 Configure Custom Domain (Optional)

If you own a domain:

1. In Vercel Dashboard, go to your project → Settings → Domains
2. Add your domain (e.g., `expense-tracker.com`)
3. Follow DNS configuration steps provided by Vercel
4. Update Supabase redirect URLs with your custom domain

---

## Step 4: Test Production Deployment

### 4.1 Verify Application
1. Visit your Vercel URL: `https://YOUR_PROJECT_NAME.vercel.app`
2. Test signup flow:
   - Register new user
   - Verify user appears in Supabase
3. Test login flow:
   - Log out
   - Log back in
4. Test features:
   - Create transaction
   - View dashboard
   - Edit/delete transaction

### 4.2 Monitor Deployment
- **Vercel Dashboard**: View logs, builds, deployments
- **Supabase Dashboard**: Monitor database queries and errors

---

## Step 5: Post-Deployment Configuration

### 5.1 Enable Advanced Supabase Features (Optional)

#### Email Notifications
1. Supabase Dashboard → Authentication → Email Templates
2. Customize password reset email template
3. Add your app logo and branding

#### Database Backups
1. Supabase Dashboard → Settings → Backups
2. Enable automated backups (recommended for production)
3. Set backup frequency (daily/weekly)

#### Database Monitoring
1. Supabase Dashboard → Monitoring
2. Set up alerts for:
   - Database errors
   - Slow queries
   - Storage warnings

### 5.2 Set Up Monitoring & Logging

#### Vercel Analytics
1. In Vercel Dashboard → Settings → Analytics
2. Enable Web Analytics
3. Monitor:
   - Page load times
   - User interactions
   - Error rates

#### Error Tracking
1. In Vercel, errors are automatically tracked
2. Visit Deployments → View logs for any errors

---

## Step 6: Continuous Deployment

Once deployed, Vercel automatically:
- ✅ Builds on every GitHub push to `main`
- ✅ Deploys to production on successful build
- ✅ Creates preview deployments for pull requests
- ✅ Rollbacks failed deployments

### 6.1 Making Updates

To deploy updates:

```bash
# Make code changes
git add .
git commit -m "Feature: Add new functionality"
git push origin main

# Vercel automatically deploys!
```

### 6.2 Preview Deployments

For testing before production:
1. Create a pull request from a feature branch
2. Vercel automatically creates a preview URL
3. Test on preview URL
4. Once ready, merge to main (auto-deploys)

---

## Troubleshooting Deployment

### Issue: Build Fails on Vercel

**Check these:**
1. **Vercel Dashboard** → Deployments → View logs
2. Look for:
   - TypeScript errors
   - Missing environment variables
   - Failed dependency installations

**Solution:**
1. Fix error locally: `npm run build`
2. Push to GitHub
3. Vercel will automatically retry

### Issue: "Cannot find Supabase"

**Solution:**
1. Verify environment variables are set in Vercel Dashboard
2. Redeploy after adding variables (if just added)
3. Check variable names exactly match code

### Issue: "Authentication not working"

**Solution:**
1. Check Supabase redirect URLs include your Vercel domain
2. Verify Supabase project is active
3. Check network tab for errors in browser DevTools

### Issue: Database errors on production

**Solution:**
1. Check Row Level Security policies in Supabase
2. Verify user authentication is working
3. Check database quota limits in Supabase

---

## Performance Optimization

### 6.1 Image Optimization
Next.js automatically optimizes images. Ensure all images are:
- Less than 1MB for thumbnails
- Properly sized for their containers
- Using Next.js `Image` component

### 6.2 Database Performance
Monitor in Supabase:
- Query performance
- Slow queries
- Connection usage

### 6.3 Frontend Performance
Vercel provides:
- Automatic code splitting
- Caching headers
- Edge network distribution

---

## Security Checklist

- [x] Never commit `.env.local` to GitHub
- [x] Use Vercel environment variables for secrets
- [x] Enable Row Level Security in Supabase
- [x] Use strong database password
- [x] Enable HTTPS (automatic with Vercel)
- [x] Keep dependencies updated
- [x] Monitor security logs
- [x] Regular database backups enabled

---

## Monitoring & Maintenance

### Weekly Checks
- [ ] Check Vercel deployment logs for errors
- [ ] Review Supabase database usage
- [ ] Monitor application performance

### Monthly Tasks
- [ ] Update dependencies: `npm update`
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review database backups

### Quarterly Tasks
- [ ] Database optimization/cleanup
- [ ] Performance audit
- [ ] Security review

---

## Rollback Procedure

If you need to revert to a previous version:

1. **In Vercel Dashboard:**
   - Go to Deployments
   - Find the previous successful deployment
   - Click "Redeploy"

2. **Or via GitHub:**
   - Revert to previous commit
   - Push to main (Vercel auto-deploys)

---

## Support & Resources

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: Report deployment issues

---

## Next Phase: Advanced Features

Once deployed, you can add:

### Phase 2: Enhanced Features
- [ ] Advanced transaction filtering
- [ ] Custom date range reports
- [ ] CSV export functionality
- [ ] Recurring transactions
- [ ] Budget limits and alerts

### Phase 3: Mobile & PWA
- [ ] Mobile-responsive design improvements
- [ ] Progressive Web App (PWA)
- [ ] Offline functionality
- [ ] Mobile app (React Native)

### Phase 4: Advanced Analytics
- [ ] Spending trends analysis
- [ ] Predictive budgeting
- [ ] Multi-currency support
- [ ] Social sharing features

---

**Congratulations! Your Expense Tracker is now live! 🎉**
