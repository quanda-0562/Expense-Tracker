# Expense Tracker - Specification (Chi Tiết)

## 1. Tổng Quan

**Tên Ứng Dụng:** Expense Tracker - Ứng dụng quản lý chi tiêu cá nhân

**Mục Tiêu:** Giúp người dùng quản lý và theo dõi chi tiêu hằng ngày, phân loại giao dịch, và xem báo cáo chi tiêu theo khoảng thời gian.

**Phương Pháp Phát Triển:** Spec Driven Development (SDD)

---

## 2. Tính Năng Chính

### 2.1 Xác Thực & Quản Lý Tài Khoản
- **Đăng ký (Sign Up):** Người dùng tạo tài khoản với email, mật khẩu
- **Đăng nhập (Login):** Xác thực qua email/mật khẩu
- **Quên mật khẩu (Reset Password):** Gửi link reset qua email
- **Đăng xuất (Logout):** Xóa session người dùng

### 2.2 Quản Lý Giao Dịch (Transaction)
- **Tạo giao dịch mới:**
  - Loại: Thu hoặc Chi
  - Số tiền (amount)
  - Phân loại (category)
  - Mô tả (description) - tùy chọn
  - Ngày giao dịch (transaction_date)
  
- **Chỉnh sửa giao dịch:** Cập nhật thông tin giao dịch
- **Xóa giao dịch:** Xóa vĩnh viễn hoặc soft delete
- **Xem danh sách giao dịch:** Hiển thị toàn bộ giao dịch của người dùng

### 2.3 Phân Loại (Category)
**Categories Mặc Định:**
- Nhà ở (Housing)
- Sinh hoạt (Living Expenses)
- Giải trí (Entertainment)
- Đầu tư (Investment)
- Khác (Others)

**Chức Năng:**
- Gắn category cho mỗi giao dịch
- Hỗ trợ thêm category tùy chỉnh (nếu cần)
- Xem tổng chi tiêu theo từng category

### 2.4 Dashboard (Ưu Tiên)
**Hiển Thị:**
- Tổng thu nhập (total income)
- Tổng chi tiêu (total expense)
- Số dư (balance)
- Biểu đồ chi tiêu theo category (pie chart hoặc bar chart)
- Biểu đồ xu hướng chi tiêu theo thời gian (line chart)

**Bộ Lọc Thời Gian:**
- Ngày (Today)
- Tuần (This Week)
- Tháng (This Month)
- Tháng trước (Last Month)
- Tùy chỉnh (Custom Range)

**Thông Tin Chi Tiết:**
- Top categories by spending
- Recent transactions (5-10 giao dịch gần nhất)

### 2.5 Lọc & Tìm Kiếm
- **Lọc theo:**
  - Category
  - Loại (Income/Expense)
  - Khoảng thời gian
  - Mức độ chi tiêu (Min-Max amount)

- **Tìm kiếm:**
  - Theo mô tả (description)
  - Theo số tiền (amount)

### 2.6 Xuất Dữ Liệu (Export)
- Xuất ra file CSV với các cột: Ngày, Loại, Số tiền, Category, Mô tả
- Hỗ trợ xuất toàn bộ hoặc theo bộ lọc

---

## 3. Lưu Đồ Người Dùng (User Flows)

### Flow 1: Đăng Ký & Đăng Nhập
```
Người dùng → Trang đăng ký → Nhập email/password → Tạo tài khoản → Trang login → Đăng nhập thành công → Dashboard
```

### Flow 2: Tạo Giao Dịch
```
Dashboard → Nút "Thêm giao dịch" → Form giao dịch → Chọn loại/category/nhập số tiền → Lưu → Giao dịch hiển thị trên Dashboard
```

### Flow 3: Xem Báo Cáo
```
Dashboard → Chọn khoảng thời gian → Xem biểu đồ + thống kê → Lọc theo category → Xem chi tiết
```

### Flow 4: Xuất Dữ Liệu
```
Dashboard/Danh sách giao dịch → Nút "Export CSV" → Chọn bộ lọc (nếu cần) → Tải file CSV
```

---

## 4. Mô Hình Dữ Liệu (Data Model)

### 4.1 Bảng Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### 4.2 Bảng Categories
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50), -- Tùy chọn
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);
```

### 4.3 Bảng Transactions
```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID NOT NULL REFERENCES categories(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

---

## 5. Thiết Kế Giao Diện (UI/UX)

### Nguyên Tắc:
- **Đơn giản (Simple):** Ít thông tin không cần thiết
- **Dễ dùng (Intuitive):** Các nút hành động rõ ràng
- **Responsive:** Hoạt động tốt trên mobile, tablet, desktop

### Các Trang Chính:
1. **Login/Register Page** - Đăng nhập/đăng ký
2. **Dashboard** - Tổng quan chi tiêu (ưu tiên)
3. **Transactions List** - Danh sách giao dịch
4. **Transaction Form** - Tạo/chỉnh sửa giao dịch
5. **Settings** - Cài đặt tài khoản (tùy chọn)

---

## 6. Công Nghệ & Stack

### Frontend
- **Framework:** Next.js 14+
- **Language:** TypeScript
- **State Management:** React Context API hoặc Zustand
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui hoặc Headless UI
- **Charts:** Recharts hoặc Chart.js
- **Form:** React Hook Form + Zod (validation)

### Backend
- **Framework:** Next.js API Routes (hoặc tách riêng)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth hoặc NextAuth.js
- **ORM:** Supabase Client / Prisma (tùy chọn)

### Deployment
- **Frontend/Backend:** Vercel
- **Database:** Supabase (hosted)
- **Storage:** Vercel/Supabase Storage (nếu cần)

---

## 7. API Endpoints (Backend)

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/reset-password` - Reset mật khẩu

### Transactions
- `GET /api/transactions` - Lấy danh sách giao dịch (có filter)
- `POST /api/transactions` - Tạo giao dịch mới
- `GET /api/transactions/:id` - Lấy chi tiết giao dịch
- `PUT /api/transactions/:id` - Cập nhật giao dịch
- `DELETE /api/transactions/:id` - Xóa giao dịch

### Categories
- `GET /api/categories` - Lấy danh sách categories
- `POST /api/categories` - Tạo category tùy chỉnh
- `PUT /api/categories/:id` - Cập nhật category
- `DELETE /api/categories/:id` - Xóa category

### Dashboard & Reports
- `GET /api/dashboard?period=month&date=2024-04` - Lấy dữ liệu dashboard
- `GET /api/reports/summary?start_date=...&end_date=...` - Báo cáo tổng hợp
- `GET /api/reports/by-category?period=month` - Thống kê theo category
- `GET /api/export/csv?filters=...` - Xuất CSV

---

## 8. Giai Đoạn Phát Triển (Phases)

### Phase 1: MVP (2-3 tuần)
- Authentication (login/register)
- CRUD transactions
- Category management
- Basic list view

### Phase 2: Dashboard & Reports (1-2 tuần)
- Dashboard với biểu đồ
- Bộ lọc thời gian
- Thống kê theo category

### Phase 3: Advanced Features (1 tuần)
- Lọc & tìm kiếm chi tiết
- Export CSV
- Tùy chỉnh categories

### Phase 4: Polish & Deploy (1 tuần)
- Testing & bug fixes
- UI/UX improvements
- Deploy to Vercel

---

## 9. Quy Tắc Phát Triển theo TDD (Test-Driven Development)

### Nguyên Tắc TDD
Mỗi feature được phát triển theo chu kỳ **Red → Green → Refactor**:

1. **Red:** Viết test trước, test sẽ fail vì chưa có implementation
2. **Green:** Viết code tối thiểu để test pass
3. **Refactor:** Cải thiện code mà giữ test vẫn pass

### Quy Tắc Chi Tiết

#### 9.1 Test Structure
```
src/
├── __tests__/
│   ├── unit/          # Unit tests cho functions, utilities
│   ├── integration/   # Integration tests cho API, services
│   └── e2e/          # End-to-end tests cho user flows
├── components/
├── services/
├── utils/
└── ...
```

#### 9.2 Naming Convention cho Tests
- **Unit Tests:** `functionName.test.ts`
- **Integration Tests:** `serviceName.integration.test.ts`
- **E2E Tests:** `userFlow.e2e.test.ts`

#### 9.3 Test Coverage Yêu Cầu
- **Mục tiêu:** Tối thiểu 70% coverage
- **Critical paths:** 100% coverage
- **Utils & helpers:** 80%+ coverage
- **Components:** 60%+ coverage

#### 9.4 Testing Framework & Tools
- **Test Runner:** Vitest hoặc Jest
- **React Testing:** React Testing Library
- **API Testing:** Supertest (cho API routes)
- **E2E Testing:** Playwright hoặc Cypress
- **Assertion Library:** Vitest/Jest built-in matchers

#### 9.5 Quy Tắc Viết Test

**1. Arrange-Act-Assert (AAA)**
```typescript
// Arrange: Setup data & mocks
const user = { id: '1', email: 'test@test.com' };

// Act: Thực hiện action
const result = createTransaction(user.id, transaction);

// Assert: Kiểm tra kết quả
expect(result).toEqual(expectedTransaction);
```

**2. One Assertion Per Test (tập trung)**
Mỗi test chỉ kiểm tra một điều duy nhất

**3. Descriptive Test Names**
```typescript
// ❌ Không tốt
test('creates transaction', () => {});

// ✅ Tốt
test('should create transaction with valid input and persist to database', () => {});
```

**4. Test Behavior, Not Implementation**
Kiểm tra output/side effects, không kiểm tra chi tiết nội bộ

**5. Use Fixtures & Factories**
```typescript
// Tạo factory cho test data
function createUserFixture(overrides = {}) {
  return { id: '1', email: 'user@test.com', ...overrides };
}
```

#### 9.6 TDD Workflow cho Mỗi Feature

**Bước 1: Viết Test (Red)**
```typescript
describe('TransactionService', () => {
  it('should create a new transaction with valid data', async () => {
    const input = { amount: 100, category: 'housing', type: 'expense' };
    const result = await createTransaction(userId, input);
    
    expect(result.id).toBeDefined();
    expect(result.amount).toBe(100);
  });
});
```

**Bước 2: Viết Implementation (Green)**
```typescript
async function createTransaction(userId: string, data: TransactionInput) {
  const transaction = { id: crypto.randomUUID(), ...data };
  await db.transactions.insert(transaction);
  return transaction;
}
```

**Bước 3: Refactor (Refactor)**
```typescript
// Tách validation logic
const schema = z.object({ amount: z.number(), category: z.string() });

async function createTransaction(userId: string, data: unknown) {
  const validated = schema.parse(data);
  const transaction = { id: crypto.randomUUID(), userId, ...validated };
  await db.transactions.insert(transaction);
  return transaction;
}
```

#### 9.7 Mocks & Stubs
- **Mock Database:** Dùng test fixtures thay vì database thực
- **Mock External APIs:** Dùng MSW (Mock Service Worker) hoặc jest.mock
- **Mock Supabase:** Tạo mock client cho testing

```typescript
// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn().mockResolvedValue({ data: mockTransaction }),
    })),
  })),
}));
```

#### 9.8 Test Dependencies & Mocking
```typescript
// Mock dependencies
vi.mock('../services/supabase');

// Setup before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Test isolated behavior
test('service handles database error', async () => {
  supabaseMock.from().insert.mockRejectedValue(new Error('DB Error'));
  
  expect(() => createTransaction(data)).rejects.toThrow('DB Error');
});
```

#### 9.9 Continuous Testing
- Chạy tests sau mỗi commit: `npm test`
- Pre-commit hook: Chạy tests trước khi commit
- CI/CD: GitHub Actions tự động chạy tests
- Watch mode: `npm test -- --watch` khi phát triển

#### 9.10 Documentation qua Tests
Tests cũng là documentation cho hành vi của code:

```typescript
describe('Category API', () => {
  describe('GET /api/categories', () => {
    test('returns all categories for authenticated user', async () => {
      // Test này giải thích API behavior
    });
  });
});
```

---

## 10. Yêu Cầu Phi Chức Năng

### Performance
- Tải trang Dashboard < 2s
- API response time < 500ms
- Support 1000+ transactions per user

### Security
- Password hashing (bcrypt)
- JWT tokens hoặc Session-based auth
- HTTPS only
- CORS properly configured
- Input validation & sanitization

### Scalability
- Database indexes trên user_id, category_id, transaction_date
- Pagination cho danh sách transactions (20-50 items/page)
- Caching strategy cho dashboard data

---

## 11. Tiêu Chí Chấp Nhận (Acceptance Criteria)

- ✓ Người dùng có thể đăng ký, đăng nhập, đăng xuất
- ✓ Tạo, chỉnh sửa, xóa giao dịch thành công
- ✓ Dashboard hiển thị tổng quan chi tiêu với biểu đồ
- ✓ Lọc giao dịch theo category, thời gian, loại
- ✓ Tìm kiếm giao dịch theo mô tả
- ✓ Xuất dữ liệu ra CSV
- ✓ Giao diện đơn giản, responsive
- ✓ Không có lỗi critical
- ✓ Deploy thành công trên Vercel

---

## 12. Ghi Chú & Mở Rộng Tương Lai

### Có thể thêm sau:
- Budget planning & alerts
- Recurring transactions
- Multiple currencies
- Mobile app (React Native)
- Data synchronization
- Expense sharing (chia chi tiêu với bạn)
- Receipt upload & OCR
- Advanced analytics & insights
- Export to other formats (PDF, Excel)
