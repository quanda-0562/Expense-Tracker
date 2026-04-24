# Development Guidelines

Development standards and best practices for the Expense Tracker project.

---

## Code Quality Standards

### TypeScript
- **Strict Mode**: Enabled in `tsconfig.json`
- **No `any`**: Use proper types everywhere
- **Interfaces**: Preferred over types for object shapes
- **Generics**: Use for reusable components/functions

✅ **Good**
```typescript
interface User {
  id: string
  email: string
  created_at: Date
}

function getUserData(id: string): Promise<User> {
  // ...
}
```

❌ **Avoid**
```typescript
function getUserData(id: any): any {
  // ...
}
```

### React Components
- **Functional Components**: Always use function syntax (never class components)
- **Hooks**: Use React hooks for state management
- **Props Typing**: Always type component props with TypeScript interfaces
- **Naming**: PascalCase for components, camelCase for functions

✅ **Good**
```typescript
interface CardProps {
  title: string
  amount: number
  color: 'green' | 'red' | 'blue'
}

export function Card({ title, amount, color }: CardProps) {
  return <div>{title}: {amount}</div>
}
```

### File Organization
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public routes
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (dashboard)/              # Protected routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── transactions/
│   ├── api/                      # API endpoints
│   │   ├── auth/
│   │   ├── categories/
│   │   ├── transactions/
│   │   └── dashboard/
│   └── layout.tsx                # Root layout
│
├── components/
│   ├── auth/                     # Authentication UI
│   │   ├── LoginForm.tsx
│   │   ├── LoginForm.test.tsx
│   │   ├── RegisterForm.tsx
│   │   └── ForgotPasswordForm.tsx
│   ├── transactions/             # Transaction UI
│   ├── dashboard/                # Dashboard UI
│   ├── layout/                   # Layout components
│   └── ui/                       # Reusable UI components
│
├── context/
│   ├── AuthContext.tsx           # Authentication context
│   └── __tests__/                # Context tests
│
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── validations.ts            # Zod schemas
│   ├── utils.ts                  # Utilities
│   └── __tests__/                # Utility tests
│
├── services/
│   ├── auth.service.ts           # Auth logic
│   ├── auth.service.test.ts
│   ├── transaction.service.ts    # Transaction logic
│   └── transaction.service.test.ts
│
└── types/
    └── index.ts                  # TypeScript interfaces
```

---

## Naming Conventions

### Files & Folders
- **Components**: PascalCase with `.tsx` extension
  - `LoginForm.tsx`
  - `DashboardLayout.tsx`
  
- **Pages**: lowercase with `.tsx` extension
  - `page.tsx`
  - `layout.tsx`
  
- **API Routes**: lowercase with `.ts` extension
  - `route.ts`

- **Tests**: Append `.test.ts(x)` to tested file
  - `LoginForm.test.tsx`
  - `auth.service.test.ts`

### Variables & Functions
- **Constants**: UPPER_SNAKE_CASE
  ```typescript
  const MAX_TRANSACTIONS_PER_PAGE = 20
  const API_BASE_URL = 'http://localhost:3000/api'
  ```

- **Functions**: camelCase
  ```typescript
  function calculateBalance(transactions: Transaction[]): number
  const formatCurrency = (amount: number): string => {}
  ```

- **Variables**: camelCase
  ```typescript
  let isLoading = false
  const userData = await fetchUser()
  ```

- **React Props Interfaces**: ComponentNameProps
  ```typescript
  interface LoginFormProps {
    onSuccess?: () => void
  }
  ```

---

## Git & Version Control

### Branch Naming
```
feature/add-csv-export        # New feature
fix/login-validation-bug      # Bug fix
docs/update-setup-guide       # Documentation
refactor/extract-form-logic   # Code refactoring
test/add-dashboard-tests      # Tests
```

### Commit Messages
Follow conventional commits:

```
feat: add transaction export functionality
fix: correct dashboard balance calculation
docs: update deployment guide
refactor: extract transaction form logic
test: add integration tests for login
```

### Pull Requests
- **Title**: Descriptive, use conventional commits format
- **Description**: Explain what changed and why
- **Tests**: Include test results or coverage changes
- **Screenshots**: For UI changes, include before/after

---

## Testing Standards

### Test Structure (AAA Pattern)

```typescript
describe('LoginForm', () => {
  test('should login successfully with valid credentials', () => {
    // Arrange: Setup
    const mockUser = { email: 'test@example.com', password: 'Test123' }
    render(<LoginForm />)
    
    // Act: Perform action
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: mockUser.email } 
    })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Assert: Verify
    expect(screen.getByText(/success/i)).toBeInTheDocument()
  })
})
```

### Testing Best Practices
1. **Test behavior, not implementation**
   - ✅ Test what user sees and does
   - ❌ Test internal state or props

2. **Use semantic queries**
   - ✅ `screen.getByRole('button')`
   - ✅ `screen.getByLabelText(/password/i)`
   - ❌ `wrapper.find('.submit-btn')`

3. **Mock external dependencies**
   ```typescript
   jest.mock('@/lib/supabase', () => ({
     supabase: {
       auth: {
         signInWithPassword: jest.fn()
       }
     }
   }))
   ```

4. **Coverage targets**
   - Statements: 70%+
   - Branches: 70%+
   - Functions: 70%+
   - Lines: 70%+

---

## Performance Guidelines

### Component Optimization
1. **Use `React.memo` for expensive components**
   ```typescript
   export const TransactionListItem = React.memo(({ transaction }) => {
     // Component code
   })
   ```

2. **Use `useCallback` for event handlers**
   ```typescript
   const handleDelete = useCallback((id: string) => {
     // Handle delete
   }, [])
   ```

3. **Use `useMemo` for expensive calculations**
   ```typescript
   const total = useMemo(() => {
     return transactions.reduce((sum, t) => sum + t.amount, 0)
   }, [transactions])
   ```

### API Optimization
1. **Pagination**: Always paginate large datasets
2. **Filtering**: Filter at database level, not frontend
3. **Caching**: Use React Query or similar for caching
4. **Indexes**: Create database indexes for frequent queries

---

## Security Practices

### Never
❌ Commit `.env.local` or secrets to Git
❌ Hardcode API keys or passwords
❌ Trust user input without validation
❌ Use unescaped HTML in templates
❌ Store sensitive data in localStorage

### Always
✅ Use environment variables for secrets
✅ Validate input with Zod schemas
✅ Use parameterized queries
✅ Escape HTML output
✅ Use secure auth providers (Supabase)

### Example
```typescript
// ✅ Good
const email = await validateEmail(input)
const user = await supabase
  .from('users')
  .select()
  .eq('email', email)

// ❌ Avoid
const user = await query(`SELECT * FROM users WHERE email = '${input}'`)
```

---

## Error Handling

### API Routes
```typescript
export async function POST(request: NextRequest) {
  try {
    // Validate input
    const data = await request.json()
    const validated = loginSchema.parse(data)
    
    // Execute operation
    const result = await supabase.auth.signInWithPassword(validated)
    
    // Return success
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: error.errors
      }, { status: 400 })
    }
    
    // Handle other errors
    console.error('Login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Login failed'
    }, { status: 500 })
  }
}
```

### Components
```typescript
export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (data: LoginData) => {
    try {
      setError(null)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Login failed')
      }
      
      const result = await response.json()
      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
      </form>
      {error && <div className="text-red-600">{error}</div>}
    </>
  )
}
```

---

## Styling Guidelines

### Tailwind CSS
- Use utility classes exclusively
- No custom CSS unless absolutely necessary
- Consistency: Use existing color palette

```typescript
// ✅ Good
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Button
</div>

// ❌ Avoid custom CSS
<style>
  .my-button { background: blue; }
</style>
```

### Responsive Design
```typescript
// Mobile-first approach
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Items */}
</div>
```

---

## Documentation

### Code Comments
- Document **why**, not **what**
- Use JSDoc for functions

```typescript
/**
 * Calculates the balance of transactions grouped by type
 * @param transactions - Array of transaction objects
 * @returns Object with income, expense, and balance totals
 */
function calculateBalance(transactions: Transaction[]): BalanceSummary {
  // Implementation
}
```

### README Files
- Each major feature should have a README
- Document setup, usage, and examples
- Keep updated with code changes

---

## Development Tools

### Recommended Extensions
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **ESLint**
- **Thunder Client** (API testing)
- **GitLens** (Git integration)

### Useful Commands
```bash
# Format code
npm run format      # or prettier --write .

# Check lint errors
npm run lint        # or eslint src/

# Build & test
npm run build
npm test
npm test:coverage
```

---

## Review Checklist

Before submitting a PR:

- [ ] Code follows naming conventions
- [ ] TypeScript strict mode passes
- [ ] Tests written and passing
- [ ] No `console.log` or debug code
- [ ] No uncommitted secrets or credentials
- [ ] Git history is clean (sensible commits)
- [ ] Documentation updated if needed
- [ ] Performance impact considered

---

## Phase Development Checklist

### Per-Feature Checklist
- [ ] Feature specification documented
- [ ] Database schema prepared (if needed)
- [ ] API routes stubbed
- [ ] Component structure designed
- [ ] Tests written (TDD)
- [ ] Implementation complete
- [ ] Tests passing (70% coverage minimum)
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Ready for deployment

---

**Questions? Check the main [README.md](../README.md) or raise an issue!**
