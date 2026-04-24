# Testing Guide - Expense Tracker

Complete guide for testing the Expense Tracker application.

---

## Testing Strategy

This project uses **Test-Driven Development (TDD)** with:
- **Jest**: Unit & integration testing framework
- **React Testing Library**: Component testing
- **Target Coverage**: 70% code coverage

---

## Unit & Integration Testing

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (TDD mode)
npm test:watch

# Run specific test file
npm test -- src/components/auth/LoginForm.test.tsx

# Run with coverage report
npm test:coverage
```

### Test Structure

Tests use **AAA (Arrange-Act-Assert)** pattern:

```typescript
test('should login successfully with valid credentials', () => {
  // Arrange: Set up test data
  const mockEmail = 'test@example.com'
  const mockPassword = 'Test123!@#'

  // Act: Perform action
  fireEvent.change(emailInput, { target: { value: mockEmail } })
  fireEvent.click(submitButton)

  // Assert: Verify result
  expect(mockFunction).toHaveBeenCalledWith(mockEmail, mockPassword)
})
```

### Existing Test Files

#### Authentication Tests
- **LoginForm.test.tsx** - Login form component
  - Rendering validation
  - Form submission
  - Error handling
  - Accessibility checks

- **RegisterForm.test.tsx** - Register form component
  - Form validation
  - Password matching
  - Duplicate email prevention

- **auth.service.test.ts** - Auth utilities
  - Email validation
  - Password strength checking

#### Transaction Tests
- **TransactionForm.test.tsx** - Transaction form component
  - Create/update modes
  - Form validation
  - Date handling
  - Category selection

- **transaction.service.test.ts** - Transaction logic
  - Balance calculation
  - Category grouping
  - Date filtering

---

## Manual Testing

### Test Environment

**Prerequisites:**
- Dev server running: `npm run dev` → http://localhost:3000
- Supabase project configured (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- `.env.local` with valid Supabase credentials

### Test Users

Use these test accounts (or create your own):

```
Email: test1@example.com
Password: Test123!@#

Email: test2@example.com
Password: Test456!@#
```

---

## Manual Test Cases

### 1. Authentication Flow

#### 1.1 User Signup
1. Navigate to http://localhost:3000
2. Click "Sign up"
3. Enter:
   - Display Name: "Test User"
   - Email: "newuser@example.com"
   - Password: "Test123!@#"
   - Confirm: "Test123!@#"
4. Click "Sign up"

**Expected Results:**
- ✅ User created in Supabase
- ✅ Redirects to `/dashboard`
- ✅ Default categories created
- ✅ User can see empty dashboard

#### 1.2 User Login
1. Click "Logout" in navbar
2. Enter credentials from 1.1
3. Check "Remember me"
4. Click "Sign in"

**Expected Results:**
- ✅ User logs in successfully
- ✅ Redirects to `/dashboard`
- ✅ User email shown in navbar
- ✅ Previous transactions visible (if any)

#### 1.3 Forgot Password
1. On login page, click "Forgot your password?"
2. Enter email: "test@example.com"
3. Click "Send reset link"

**Expected Results:**
- ✅ Shows "Check your email" message
- ✅ Email received with reset link
- ✅ Can reset password via link
- ✅ Can log in with new password

#### 1.4 Logout
1. Click user menu in navbar
2. Click "Logout"

**Expected Results:**
- ✅ Redirects to `/auth/login`
- ✅ User session cleared
- ✅ Cannot access protected routes

---

### 2. Transaction Management

#### 2.1 Create Income Transaction
1. Go to `/transactions/new`
2. Select type: "Income"
3. Enter:
   - Amount: "5000"
   - Category: "Salary"
   - Date: Today's date
   - Description: "Monthly salary"
4. Click "Create Transaction"

**Expected Results:**
- ✅ Transaction created
- ✅ Redirects to `/transactions`
- ✅ New transaction visible in list
- ✅ Dashboard balance updates (+5000)

#### 2.2 Create Expense Transaction
1. Go to `/transactions/new`
2. Select type: "Expense"
3. Enter:
   - Amount: "1500"
   - Category: "Housing"
   - Date: Today
   - Description: "Monthly rent"
4. Click "Create Transaction"

**Expected Results:**
- ✅ Transaction created
- ✅ Appears in transaction list
- ✅ Dashboard updates:
     - Expense card shows 1500
     - Balance decreases by 1500
     - Pie chart shows Housing category

#### 2.3 Edit Transaction
1. Go to `/transactions`
2. Find a transaction
3. Click "Edit" button
4. Change amount to "2000"
5. Click "Update Transaction"

**Expected Results:**
- ✅ Transaction updated
- ✅ Dashboard values recalculate
- ✅ Edit form pre-populates data
- ✅ Redirects to `/transactions`

#### 2.4 Delete Transaction
1. Go to `/transactions`
2. Find a transaction
3. Click "Delete" button
4. Confirm deletion

**Expected Results:**
- ✅ Transaction removed from list
- ✅ Dashboard updates
- ✅ Soft delete in database (deleted_at set)
- ✅ Cannot access deleted transaction

#### 2.5 Pagination
1. Create 25+ transactions
2. Go to `/transactions`
3. See first 20 transactions
4. Click "Next" or page 2

**Expected Results:**
- ✅ Shows next 20 transactions
- ✅ Pagination controls work
- ✅ No missing transactions

---

### 3. Dashboard Features

#### 3.1 Summary Cards
1. Go to `/dashboard`
2. Check three cards at top:
   - **Income**: Sum of all income transactions (green)
   - **Expense**: Sum of all expense transactions (red)
   - **Balance**: Income - Expense (blue)

**Expected Results:**
- ✅ All values calculated correctly
- ✅ Colors are consistent
- ✅ Values update when transactions change

#### 3.2 Pie Chart
1. On dashboard, view pie chart
2. Each segment represents a spending category
3. Hover over segment

**Expected Results:**
- ✅ Shows category name
- ✅ Shows percentage of total spending
- ✅ Only shows expense categories
- ✅ Updates when transactions change

#### 3.3 Period Filters
1. On dashboard, click filter buttons:
   - "Today" - transactions from today only
   - "Week" - last 7 days
   - "Month" - current month
   - "Year" - current year
2. Verify data updates

**Expected Results:**
- ✅ Summary cards update
- ✅ Pie chart updates
- ✅ Recent transactions filter correctly
- ✅ All calculations reflect selected period

#### 3.4 Recent Transactions
1. Create 15+ transactions
2. View recent transactions widget on dashboard

**Expected Results:**
- ✅ Shows 10 most recent transactions
- ✅ Sorted newest first
- ✅ Includes date, category, amount, description
- ✅ Clicking transaction opens details or edit

---

### 4. Category Management

#### 4.1 Default Categories
1. Create new user and sign up
2. Go to `/transactions/new`
3. Click category dropdown

**Expected Results:**
- ✅ Pre-populated with default categories:
     - Housing, Food & Dining, Entertainment, etc.
- ✅ Categories only visible to that user

#### 4.2 Create Custom Category
1. On transaction form, click "+" or "Add Category"
2. Enter: "Freelance Work"
3. Click "Add"

**Expected Results:**
- ✅ New category added to user
- ✅ Available in future transactions
- ✅ Appears in category dropdown

#### 4.3 Category Isolation
1. Log in as different user
2. Go to transaction form

**Expected Results:**
- ✅ See different set of categories
- ✅ Custom categories from other users not visible
- ✅ Each user has own category list

---

### 5. Security & Data Privacy

#### 5.1 Row Level Security
1. Open browser DevTools
2. Network tab
3. Create transaction
4. Check request/response
5. User can only see their own data

**Expected Results:**
- ✅ API returns only own transactions
- ✅ Cannot fetch other users' transactions
- ✅ Cannot modify other users' data

#### 5.2 Session Persistence
1. Log in to account
2. Refresh page (F5)
3. Check if still logged in

**Expected Results:**
- ✅ Session persists across refresh
- ✅ User data reloads correctly
- ✅ No need to log in again

#### 5.3 Protected Routes
1. Open DevTools Console
2. Try to navigate to `/dashboard` while logged out
3. Try to access `/api/transactions` directly

**Expected Results:**
- ✅ Redirected to `/auth/login`
- ✅ Cannot access protected routes
- ✅ Middleware enforces protection

---

### 6. Error Handling

#### 6.1 Invalid Login
1. Go to login page
2. Enter invalid email/password
3. Click "Sign in"

**Expected Results:**
- ✅ Shows error message
- ✅ Stays on login page
- ✅ Can retry with correct credentials

#### 6.2 Network Error
1. Close Supabase (simulate offline)
2. Try to create transaction

**Expected Results:**
- ✅ Shows "Failed to create transaction"
- ✅ Data not lost
- ✅ Can retry when back online

#### 6.3 Validation Error
1. On transaction form
2. Try to submit with empty fields
3. Try invalid amount (negative number)

**Expected Results:**
- ✅ Shows field validation errors
- ✅ Cannot submit form
- ✅ Clear error messages

---

### 7. Cross-Browser Testing

Test on these browsers (if available):

- [ ] Chrome / Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Expected Results:**
- ✅ Layout looks good
- ✅ Forms work correctly
- ✅ Charts render properly
- ✅ No console errors

---

### 8. Responsive Design

#### 8.1 Mobile (320px width)
1. Open DevTools → Responsive Design Mode
2. Set to 320x568 (iPhone SE)
3. Test all pages

**Expected Results:**
- ✅ Layout stacks vertically
- ✅ Buttons are easy to tap (>44px)
- ✅ Text is readable
- ✅ No horizontal scroll

#### 8.2 Tablet (768px width)
1. Set DevTools to 768x1024 (iPad)
2. Test layout

**Expected Results:**
- ✅ Two-column layout if applicable
- ✅ Good use of space
- ✅ All content visible

#### 8.3 Desktop (1920px width)
1. Set DevTools to 1920x1080
2. Test layout

**Expected Results:**
- ✅ Full-width layout
- ✅ Not too spread out
- ✅ Good readability

---

### 9. Performance Testing

#### 9.1 Load Time
1. Open DevTools → Network tab
2. Reload page
3. Check load time

**Expected Results:**
- ✅ First Contentful Paint (FCP) < 2s
- ✅ Largest Contentful Paint (LCP) < 2.5s
- ✅ Total page size < 1MB

#### 9.2 Large Dataset
1. Create 100+ transactions
2. View `/transactions` page
3. Check pagination and performance

**Expected Results:**
- ✅ Page loads in < 3s
- ✅ No lag when scrolling
- ✅ Charts render smoothly

---

## Automated Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm test:watch

# Run specific test file
npm test -- LoginForm.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should login"

# Generate coverage report
npm test:coverage

# Run tests with verbose output
npm test -- --verbose

# Run tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## Coverage Report

```bash
npm test:coverage
```

This generates a coverage report showing:
- **Statements**: % of code statements executed
- **Branches**: % of conditional branches tested
- **Functions**: % of functions called
- **Lines**: % of lines executed

**Target: 70% overall coverage**

Generated files:
- `coverage/index.html` - Visual report (open in browser)
- `coverage/lcov-report/` - Detailed coverage

---

## Continuous Testing

For ongoing development:

```bash
# Terminal 1: Run dev server
npm run dev

# Terminal 2: Run tests in watch mode
npm test:watch
```

Changes to code automatically re-run affected tests.

---

## Debugging Tests

### Print Debug Info
```typescript
import { screen, debug } from '@testing-library/react'

test('example', () => {
  render(<LoginForm />)
  
  // Print DOM to console
  debug()
  
  // Or print specific element
  debug(screen.getByRole('button'))
})
```

### Use React DevTools
1. Install "React Developer Tools" browser extension
2. In test component, use `screen` to inspect elements
3. See component hierarchy in DevTools

### Check if Element is in Document
```typescript
expect(screen.getByText('Login')).toBeInTheDocument()
```

---

## Troubleshooting Test Failures

### Tests time out
- Increase timeout: `jest.setTimeout(10000)`
- Check for missing `async/await`
- Check if component is unmounting

### "Cannot find element" error
- Use `screen.logTestingPlaygroundURL()` to get selector
- Check if element is rendered conditionally
- Use `waitFor()` for async elements

### Mock function not called
- Verify the action triggers the callback
- Check if callback is passed correctly
- Use `debug()` to inspect DOM

---

## Test Best Practices

1. **Test behavior, not implementation**
   - ❌ Test internal state
   - ✅ Test user interactions and outputs

2. **Use semantic queries**
   - ✅ `screen.getByRole('button')`
   - ❌ `wrapper.find('.btn-submit')`

3. **Use descriptive test names**
   - ✅ "should show error message when login fails"
   - ❌ "test login"

4. **Isolate tests**
   - Each test should be independent
   - Clean up after each test (done by React Testing Library)

5. **Test accessibility**
   - Use `getByRole()` for semantic elements
   - Verify keyboard navigation works
   - Test screen reader compatibility

---

**Happy Testing! 🧪**
