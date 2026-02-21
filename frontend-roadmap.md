# 🇳🇬 Nigerian Tax Compliance Platform — Complete Frontend Roadmap

> **For AI agents & engineers**: This document is self-contained. You do NOT need to read the backend code. Everything required to build the frontend — API contracts, payloads, response shapes, auth flows, page structures, component trees, and step-by-step implementation — is here.

---

## 📋 Table of Contents

1. [Tech Stack & Project Setup](#1-tech-stack--project-setup)
2. [Project Structure](#2-project-structure)
3. [Environment & Config](#3-environment--config)
4. [API Client Layer](#4-api-client-layer)
5. [Auth System](#5-auth-system)
6. [Page-by-Page Implementation](#6-page-by-page-implementation)
   - [Auth Pages](#61-auth-pages)
   - [Dashboard](#62-dashboard)
   - [Invoices](#63-invoices)
   - [Customers](#64-customers)
   - [Products](#65-products)
   - [Payments](#66-payments)
   - [Documents (AI OCR)](#67-documents-ai-ocr)
   - [Business Settings](#68-business-settings)
   - [User Profile](#69-user-profile)
7. [Shared Components](#7-shared-components)
8. [State Management](#8-state-management)
9. [Data Types Reference](#9-data-types-reference)
10. [API Reference (Complete)](#10-api-reference-complete)
11. [Implementation Order](#11-implementation-order)

---

## 1. Tech Stack & Project Setup

### Stack

| Tool | Version | Purpose |
|---|---|---|
| Next.js | 14+ (App Router) | Framework |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Styling |
| shadcn/ui | latest | UI components |
| React Query (TanStack) | 5+ | Server state, caching |
| Zustand | 4+ | Client state (auth token, UI) |
| React Hook Form | 7+ | Forms |
| Zod | 3+ | Validation schemas |
| Axios | 1+ | HTTP client |
| date-fns | 3+ | Date formatting |
| Recharts | 2+ | Charts on dashboard |
| React Dropzone | 14+ | File uploads |
| React PDF | 3+ | PDF viewer (optional) |

### Initial Setup

```bash
# 1. Create project
npx create-next-app@latest nigerian-tax-frontend \
  --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd nigerian-tax-frontend

# 2. Install shadcn/ui
npx shadcn@latest init
# → Choose: Default style, Slate base color, CSS variables: yes

# 3. Install shadcn components needed
npx shadcn@latest add button card input label select badge
npx shadcn@latest add table dialog sheet dropdown-menu
npx shadcn@latest add form toast avatar separator skeleton
npx shadcn@latest add alert popover calendar date-picker
npx shadcn@latest add command tabs progress

# 4. Install other dependencies
npm install @tanstack/react-query axios zustand
npm install react-hook-form @hookform/resolvers zod
npm install date-fns recharts
npm install react-dropzone
npm install lucide-react
npm install @tanstack/react-table
```

---

## 2. Project Structure
### `.env.local`


Project Structure

### 3.1 Complete Folder Structure
```
nigerian-tax-compliance-frontend/
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
│
├── public/
│   ├── logo.svg
│   ├── favicon.ico
│   └── images/
│       ├── empty-state.svg
│       └── placeholder-avatar.png
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout
│   │   ├── page.tsx                   # Landing page
│   │   ├── globals.css                # Global styles
│   │   │
│   │   ├── (auth)/                    # Auth group
│   │   │   ├── layout.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── verify-email/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/               # Protected routes
│   │   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx           # Main dashboard
│   │   │   │
│   │   │   ├── business/              # Business settings
│   │   │   │   └── page.tsx
│   │   │   │
│   │   │   ├── customers/             # Customer management
│   │   │   │   ├── page.tsx           # List customers
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Create customer
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # View customer
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx   # Edit customer
│   │   │   │
│   │   │   ├── products/              # Product management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── invoices/              # Invoice management
│   │   │   │   ├── page.tsx           # List invoices
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx       # Create invoice
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx       # View invoice
│   │   │   │       ├── edit/
│   │   │   │       │   └── page.tsx   # Edit draft invoice
│   │   │   │       └── pdf/
│   │   │   │           └── route.ts   # PDF generation
│   │   │   │
│   │   │   ├── payments/              # Payment tracking
│   │   │   │   ├── page.tsx
│   │   │   │   └── new/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── documents/             # Document processing
│   │   │   │   ├── page.tsx           # List documents
│   │   │   │   ├── upload/
│   │   │   │   │   └── page.tsx       # Upload receipts
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # View document
│   │   │   │
│   │   │   └── analytics/             # Analytics & reports
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                       # API routes (optional)
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   │
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts              # Axios instance
│   │   │   ├── auth.ts                # Auth endpoints
│   │   │   ├── business.ts            # Business endpoints
│   │   │   ├── customers.ts           # Customer endpoints
│   │   │   ├── products.ts            # Product endpoints
│   │   │   ├── invoices.ts            # Invoice endpoints
│   │   │   ├── payments.ts            # Payment endpoints
│   │   │   └── documents.ts           # Document endpoints
│   │   │
│   │   ├── utils/
│   │   │   ├── format.ts              # Formatting utilities
│   │   │   ├── validation.ts          # Validation schemas
│   │   │   ├── currency.ts            # Currency formatting
│   │   │   ├── date.ts                # Date utilities
│   │   │   └── cn.ts                  # Tailwind merge
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # Auth hook
│   │   │   ├── useBusiness.ts         # Business hook
│   │   │   ├── useCustomers.ts        # Customers hook
│   │   │   ├── useProducts.ts         # Products hook
│   │   │   ├── useInvoices.ts         # Invoices hook
│   │   │   ├── usePayments.ts         # Payments hook
│   │   │   └── useDocuments.ts        # Documents hook
│   │   │
│   │   └── constants/
│   │       ├── routes.ts              # Route constants
│   │       └── config.ts              # App config
│   │
│   ├── types/
│   │   ├── auth.ts                    # Auth types
│   │   ├── business.ts                # Business types
│   │   ├── customer.ts                # Customer types
│   │   ├── product.ts                 # Product types
│   │   ├── invoice.ts                 # Invoice types
│   │   ├── payment.ts                 # Payment types
│   │   ├── document.ts                # Document types
│   │   └── api.ts                     # API response types
│   │
│   ├── components/
│   │   ├── ui/                        # Base UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── dropdown.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── loading.tsx
│   │   │   └── alert.tsx
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── DashboardLayout.tsx
│   │   │
│   │   ├── forms/                     # Form components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── BusinessForm.tsx
│   │   │   ├── CustomerForm.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   ├── PaymentForm.tsx
│   │   │   └── DocumentUpload.tsx
│   │   │
│   │   ├── dashboard/                 # Dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── RecentInvoices.tsx
│   │   │   ├── TopCustomers.tsx
│   │   │   └── QuickActions.tsx
│   │   │
│   │   ├── invoices/                  # Invoice components
│   │   │   ├── InvoiceList.tsx
│   │   │   ├── InvoiceCard.tsx
│   │   │   ├── InvoicePreview.tsx
│   │   │   ├── InvoiceItems.tsx
│   │   │   └── InvoiceStatusBadge.tsx
│   │   │
│   │   ├── documents/                 # Document components
│   │   │   ├── DocumentList.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── DocumentUploadZone.tsx
│   │   │   ├── ProcessingStatus.tsx
│   │   │   └── ExtractedDataPreview.tsx
│   │   │
│   │   └── shared/                    # Shared components
│   │       ├── EmptyState.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── LoadingScreen.tsx
│   │       ├── Pagination.tsx
│   │       ├── SearchBar.tsx
│   │       └── StatusBadge.tsx
│   │
│   └── providers/
│       ├── QueryProvider.tsx          # React Query provider
│       ├── AuthProvider.tsx           # Auth context provider
│       └── ToastProvider.tsx          # Toast notifications
│
└── README.md














```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
# Production: https://your-backend.onrender.com/api/v1
```

### `src/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password']

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value
  const path = request.nextUrl.pathname

  const isPublicPath = PUBLIC_PATHS.some(p => path.startsWith(p))

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
```

---

## 4. API Client Layer

### `src/lib/api/client.ts`

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = Cookies.get('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally → redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('access_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### `src/lib/utils/errors.ts`

```typescript
import { AxiosError } from 'axios'

export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (typeof data?.detail === 'string') return data.detail
    if (data?.error?.message) return data.error.message
    if (Array.isArray(data?.detail)) {
      return data.detail.map((e: any) => e.msg).join(', ')
    }
  }
  return 'An unexpected error occurred'
}
```

### `src/lib/utils/currency.ts`

```typescript
export function formatNaira(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0)
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    currencyDisplay: 'narrowSymbol',
  }).format(num)
}
// Output: ₦450,000.00
```

---

## 5. Auth System

### Zustand Store — `src/lib/hooks/useAuth.ts`

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { apiClient } from '@/lib/api/client'
import type { User, LoginPayload, RegisterPayload, TokenResponse } from '@/lib/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<User>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (payload) => {
        const { data } = await apiClient.post<TokenResponse>('/auth/login', payload)
        Cookies.set('access_token', data.access_token, { expires: 1 }) // 1 day
        set({ user: data.user, token: data.access_token, isAuthenticated: true })
      },

      register: async (payload) => {
        const { data } = await apiClient.post<User>('/auth/register', payload)
        return data
      },

      logout: () => {
        Cookies.remove('access_token')
        set({ user: null, token: null, isAuthenticated: false })
        window.location.href = '/login'
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'auth', partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }) }
  )
)
```

---

## 6. Page-by-Page Implementation

---

### 6.1 Auth Pages

---

#### `/login` — Login Page

**File**: `src/app/(auth)/login/page.tsx`

**UI**: Centered card, logo at top, email + password fields, "Forgot password?" link, "Create account" link.

**Form fields**:
| Field | Type | Validation |
|---|---|---|
| email | email | required, valid email |
| password | string | required, min 1 char |

**API Call**:
```
POST /auth/login
Body: { "email": "user@example.com", "password": "SecurePassword123!" }

Success 200:
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "phone": null,
    "is_active": true,
    "is_verified": true,
    "is_superuser": false,
    "email_verified_at": "2024-01-15T10:30:00Z",
    "last_login": "2024-02-07T14:20:00Z",
    "created_at": "...",
    "updated_at": "..."
  }
}

Error 401: { "detail": "Incorrect email or password" }
Error 403: { "detail": { "error": "account_locked", "message": "...", "retry_after_minutes": 30 } }
Error 422: validation errors
Error 429: rate limited
```

**After login**:
1. Store token in cookie + Zustand
2. Call `GET /businesses/me` → if 404, redirect to `/onboarding`; else redirect to `/dashboard`

**Implementation**:
```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/lib/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api/client'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const form = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await login(data)
      // Check if business exists
      try {
        await apiClient.get('/businesses/me')
        router.push('/dashboard')
      } catch {
        router.push('/onboarding')
      }
    } catch (err: any) {
      const detail = err.response?.data?.detail
      if (detail?.error === 'account_locked') {
        toast.error(`Account locked. Try again in ${detail.retry_after_minutes} minutes.`)
      } else {
        toast.error(typeof detail === 'string' ? detail : 'Login failed')
      }
    }
  }
  // ... render form
}
```

---

#### `/register` — Register Page

**File**: `src/app/(auth)/register/page.tsx`

**Form fields**:
| Field | Type | Validation |
|---|---|---|
| email | email | required |
| password | string | min 8, 1 uppercase, 1 lowercase, 1 digit |
| confirm_password | string | must match password |
| phone | string | optional |

**API Call**:
```
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123",
  "phone": "+2348012345678"   // optional
}

Success 201: UserResponse (same shape as login user object)
Error 400: { "detail": "Email already registered" }
Error 422: validation errors array
Error 429: rate limited (5/minute)
```

**After register**: Show success toast → redirect to `/login`.

---

#### `/forgot-password` — Password Reset Request

**Form field**: email only.

**API Call**:
```
POST /auth/forgot-password
Body: { "email": "user@example.com" }

Always 200: { "message": "If the email exists, a password reset link has been sent", "success": true }
```

Show success message regardless (backend doesn't reveal if email exists).

---

#### Auth Layout `src/app/(auth)/layout.tsx`

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800">🇳🇬 TaxCompliance.ng</h1>
          <p className="text-green-600 mt-1">Nigerian Business Tax Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

---

### 6.2 Dashboard

**File**: `src/app/(dashboard)/dashboard/page.tsx`

**Purpose**: Overview of business financial health.

**API Calls** (run in parallel with `Promise.all`):
```
GET /invoices/stats/overview
GET /customers/stats/overview
GET /invoices?page=1&page_size=5    (recent invoices)
```

**Invoice Stats Response**:
```json
{
  "total_invoices": 142,
  "draft_invoices": 12,
  "sent_invoices": 45,
  "paid_invoices": 78,
  "overdue_invoices": 7,
  "cancelled_invoices": 0,
  "total_invoiced": "15420000.00",
  "total_paid": "12300000.00",
  "total_outstanding": "3120000.00",
  "average_invoice_value": "108591.55",
  "average_days_to_payment": 18.5
}
```

**Customer Stats Response**:
```json
{
  "total_customers": 48,
  "active_customers": 42,
  "inactive_customers": 6,
  "average_payment_days": 21.3,
  "top_customers": [
    {
      "id": "uuid",
      "name": "Dangote Industries",
      "total_invoiced": "5000000.00",
      "total_paid": "4500000.00",
      "outstanding": "500000.00"
    }
  ]
}
```

**Dashboard Components**:

```
DashboardPage
├── PageHeader ("Dashboard", subtitle with date)
├── MetricCards (grid 2x2 on mobile, 4x1 on desktop)
│   ├── MetricCard: Total Revenue (total_invoiced)
│   ├── MetricCard: Total Collected (total_paid)
│   ├── MetricCard: Outstanding (total_outstanding)  ← highlight if > 0
│   └── MetricCard: Overdue Invoices (overdue_invoices)  ← red if > 0
├── RevenueChart (line chart — monthly from invoice list)
├── RecentInvoices (table with last 5 invoices)
└── TopCustomers (list with progress bars)
```

**MetricCard Component**:
```typescript
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label: string }  // e.g. "+12% vs last month"
  icon: LucideIcon
  variant?: 'default' | 'danger' | 'warning' | 'success'
}
```

**RecentInvoices Table Columns**:
| Column | Data |
|---|---|
| Invoice # | invoice_number |
| Customer | customer.name (from invoice.customer_id — fetch separate or use summary) |
| Amount | total_amount |
| Status | status badge |
| Due Date | due_date |
| Actions | View, Download PDF |

**Invoice Status Badge Colors**:
- DRAFT → gray
- SENT → blue
- PAID → green
- PARTIALLY_PAID → yellow
- OVERDUE → red
- CANCELLED → gray (strikethrough)

---

### 6.3 Invoices

#### Invoice List Page — `/invoices`

**File**: `src/app/(dashboard)/invoices/page.tsx`

**API**:
```
GET /invoices?page=1&page_size=50&status=SENT&customer_id=uuid&from_date=2024-01-01&to_date=2024-12-31

Response:
{
  "invoices": [ InvoiceObject, ... ],
  "total": 142,
  "page": 1,
  "page_size": 50,
  "total_pages": 3
}
```

**InvoiceObject shape** (full):
```typescript
interface Invoice {
  id: string
  business_id: string
  customer_id: string
  invoice_number: string        // e.g. "INV-00042"
  issue_date: string            // "2024-02-01"
  due_date: string              // "2024-03-02"
  status: InvoiceStatus         // "DRAFT"|"SENT"|"PAID"|"PARTIALLY_PAID"|"OVERDUE"|"CANCELLED"
  subtotal: string              // "490000.00"
  discount_amount: string       // "10000.00"
  tax_amount: string            // "36750.00"
  total_amount: string          // "516750.00"
  paid_amount: string           // "0.00"
  outstanding_amount: string    // "516750.00"
  payment_terms: string | null
  notes: string | null
  internal_notes: string | null
  email_sent: boolean
  email_sent_at: string | null
  email_opened_at: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  paid_at: string | null
  cancelled_at: string | null
  items: InvoiceItem[]
  customer: Customer            // nested customer object
}

interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  quantity: string              // "2.00"
  unit_price: string            // "250000.00"
  discount_percent: string      // "0.00"
  discount_amount: string       // "0.00"
  tax_rate: string              // "7.50"
  tax_amount: string            // "37500.00"
  line_total: string            // "537500.00"
  sort_order: number
  created_at: string
  updated_at: string
}
```

**Filters UI**:
- Status dropdown: All / Draft / Sent / Paid / Partially Paid / Overdue / Cancelled
- Date range picker: from_date → to_date
- Customer search (typeahead)

**Table Columns**:
| # | Column | Notes |
|---|---|---|
| 1 | Invoice # | link to detail |
| 2 | Customer | customer.name |
| 3 | Issue Date | formatted |
| 4 | Due Date | red if overdue |
| 5 | Amount | formatNaira(total_amount) |
| 6 | Outstanding | formatNaira(outstanding_amount) |
| 7 | Status | colored badge |
| 8 | Actions | View / Download PDF / Record Payment |

**Toolbar**: "New Invoice" button → `/invoices/new`

---

#### Create Invoice Page — `/invoices/new`

**File**: `src/app/(dashboard)/invoices/new/page.tsx`

**Pre-fetch before rendering**:
```
GET /customers/summary?limit=100    → populate customer dropdown
GET /products/summary?limit=100     → populate product autocomplete in line items
GET /businesses/me/next-invoice-number  → show preview of invoice number
```

**Customer Summary Response**:
```json
[
  {
    "id": "uuid",
    "name": "Dangote Industries",
    "email": "info@dangote.com",
    "phone": "+234...",
    "total_invoices_count": 15,
    "outstanding_amount": "500000.00",
    "is_active": true
  }
]
```

**Product Summary Response**:
```json
[
  {
    "id": "uuid",
    "name": "Web Development Services",
    "unit_price": "250000.00",
    "is_active": true
  }
]
```

**Next Invoice Number Response**:
```json
{
  "next_invoice_number": "INV-00043",
  "current_counter": 42,
  "prefix": "INV"
}
```

**Form Fields**:
```
Section 1: Invoice Details
  - Customer (searchable select — required)
  - Issue Date (date picker, default today, not future)
  - Due Date (date picker, must be ≥ issue_date, default +30 days)
  - Payment Terms (text, optional)
  - Notes (textarea, optional)

Section 2: Line Items (dynamic rows, min 1)
  Each row:
  - Product (optional autocomplete → fills description + unit_price + tax_rate)
  - Description (text — required)
  - Quantity (number — required, >0)
  - Unit Price (number — required, ≥0)
  - Discount % (number, 0–100, optional)
  - Tax Rate (number, default 7.5)
  - Line Total (CALCULATED, readonly): (qty × price - discount) × (1 + tax/100)
  - Remove row button

  "Add Line Item" button

Section 3: Totals (auto-calculated, readonly)
  - Subtotal: sum of (qty × price - discount_amount) per row
  - Invoice Discount: numeric input (₦)
  - Tax Total: sum of tax_amount per row
  - Total: subtotal + tax_total - invoice_discount
  
  Display these live as user types.

Section 4: Internal Notes (textarea, hidden from customer)
```

**Submit API**:
```
POST /invoices
Body:
{
  "customer_id": "uuid",
  "issue_date": "2024-02-01",
  "due_date": "2024-03-02",
  "discount_amount": 10000,
  "payment_terms": "Payment due within 30 days",
  "notes": "Thank you for your business",
  "internal_notes": "VIP client",
  "items": [
    {
      "description": "Web Development Services",
      "quantity": 2,
      "unit_price": 250000,
      "discount_percent": 0,
      "tax_rate": 7.5,
      "product_id": "uuid-or-null",
      "sort_order": 0
    }
  ]
}

Success 201: Full Invoice object (see InvoiceObject above)
Error 422: validation errors
Error 404: customer not found
Error 500: invoice number collision (retry)
```

**After success**: Redirect to `/invoices/{id}`.

**Calculation Logic (frontend)**:
```typescript
function calculateLineItem(qty: number, price: number, discPct: number, taxRate: number) {
  const gross = qty * price
  const discountAmt = gross * (discPct / 100)
  const afterDisc = gross - discountAmt
  const taxAmt = afterDisc * (taxRate / 100)
  const lineTotal = afterDisc + taxAmt
  return { discountAmt, taxAmt, lineTotal }
}

function calculateInvoiceTotals(items: LineItemCalc[], invoiceDiscount: number) {
  const subtotal = items.reduce((s, i) => s + (i.qty * i.price - i.discountAmt), 0)
  const taxTotal = items.reduce((s, i) => s + i.taxAmt, 0)
  const total = subtotal + taxTotal - invoiceDiscount
  return { subtotal, taxTotal, total }
}
```

---

#### Invoice Detail Page — `/invoices/[id]`

**File**: `src/app/(dashboard)/invoices/[id]/page.tsx`

**API**:
```
GET /invoices/{id}
Response: Full InvoiceObject
```

**Page sections**:
```
InvoiceDetailPage
├── PageHeader
│   ├── Back button
│   ├── Invoice number + status badge
│   └── Action buttons (based on status):
│       DRAFT:   [Edit] [Finalize] [Delete]
│       SENT:    [Record Payment] [Cancel] [Download PDF]
│       PAID:    [Download PDF]
│       OVERDUE: [Record Payment] [Cancel] [Download PDF]
│       CANCELLED: (no actions)
│
├── InvoiceCard
│   ├── From: Business info (fetched from /businesses/me)
│   ├── To: Customer info (from invoice.customer)
│   ├── Invoice details (number, dates, terms)
│   ├── Line Items Table
│   │   Columns: Description | Qty | Unit Price | Discount | Tax | Total
│   └── Totals section (Subtotal, Discount, Tax, TOTAL, Paid, Outstanding)
│
└── PaymentsHistory (list of payments for this invoice)
    GET /payments?invoice_id={id}
```

**Finalize Invoice**:
```
POST /invoices/{id}/finalize
Body: {}
Response: Updated InvoiceObject (status changes to "SENT")
```

**Cancel Invoice**:
```
POST /invoices/{id}/cancel
Body: { "reason": "Customer requested cancellation" }
Response: Updated InvoiceObject (status changes to "CANCELLED")
```

**Delete Invoice** (DRAFT only):
```
DELETE /invoices/{id}
Response: 204 No Content
```

**Download PDF**:
```
GET /invoices/{id}/pdf
Response: application/pdf binary
```
Open in new tab or trigger download via:
```typescript
const blob = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' })
const url = URL.createObjectURL(blob.data)
window.open(url, '_blank')
```

---

#### Record Payment Modal

**Trigger**: "Record Payment" button on invoice detail.

**Component**: `src/components/invoices/PaymentModal.tsx`

**Form fields**:
| Field | Type | Notes |
|---|---|---|
| amount | number | required, > 0, ≤ outstanding_amount |
| payment_date | date | required, ≤ today |
| payment_method | select | CASH / BANK_TRANSFER / CHEQUE / CARD / MOBILE_MONEY / POS / OTHER |
| reference_number | string | optional |
| transaction_id | string | optional |
| bank_name | string | optional (show if BANK_TRANSFER) |
| account_number | string | optional (show if BANK_TRANSFER) |
| notes | textarea | optional |

**API**:
```
POST /payments
Body:
{
  "invoice_id": "uuid",
  "amount": 250000,
  "payment_date": "2024-02-10",
  "payment_method": "BANK_TRANSFER",
  "reference_number": "TRX123456",
  "bank_name": "GTBank",
  "notes": "Part payment"
}

Success 201:
{
  "id": "uuid",
  "invoice_id": "uuid",
  "business_id": "uuid",
  "customer_id": "uuid",
  "amount": "250000.00",
  "payment_date": "2024-02-10",
  "payment_method": "BANK_TRANSFER",
  "reference_number": "TRX123456",
  "transaction_id": null,
  "bank_name": "GTBank",
  "account_number": null,
  "notes": "Part payment",
  "receipt_number": "INV-20240210143022",
  "receipt_sent": null,
  "created_at": "...",
  "updated_at": "..."
}
```

**After success**: Invalidate invoice query + payments query → UI auto-updates.

---

### 6.4 Customers

#### Customer List Page — `/customers`

**API**:
```
GET /customers?skip=0&limit=50&search=dangote&customer_type=Business&is_active=true&sort_by=created_at&sort_order=desc

Response:
{
  "customers": [ CustomerObject, ... ],
  "total": 48,
  "page": 1,
  "page_size": 50,
  "total_pages": 1,
  "has_next": false,
  "has_prev": false
}
```

**CustomerObject**:
```typescript
interface Customer {
  id: string
  business_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string              // "Nigeria"
  tin: string | null
  total_invoices_count: number
  total_invoiced_amount: string  // "5000000.00"
  total_paid_amount: string      // "4500000.00"
  average_payment_days: number | null
  last_invoice_date: string | null
  customer_type: string          // "Individual" | "Business"
  credit_limit: string | null
  payment_terms_days: number     // 30
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}
```

**Table Columns**:
| Column | Data |
|---|---|
| Name | name + customer_type badge |
| Email | email |
| Phone | phone |
| Invoices | total_invoices_count |
| Invoiced | formatNaira(total_invoiced_amount) |
| Outstanding | formatNaira(outstanding = invoiced - paid) |
| Last Invoice | last_invoice_date |
| Status | is_active badge |
| Actions | View / Edit / Delete |

**Filters**: Search (name/email/phone), Type (Individual/Business), Active status

**Toolbar**: "New Customer" button → `/customers/new`

---

#### Customer Create/Edit — `/customers/new` and `/customers/[id]`

**Create API**:
```
POST /customers
Body:
{
  "name": "Dangote Industries",
  "email": "info@dangote.com",
  "phone": "+2348012345678",
  "address": "2 Allotey Street",
  "city": "Lagos",
  "state": "Lagos",
  "tin": "12345678-0001",
  "customer_type": "Business",
  "credit_limit": 5000000,
  "payment_terms_days": 30,
  "notes": "Major enterprise client"
}

Success 201: CustomerObject
Error 400: { "detail": "Customer with email ... already exists" }
```

**Update API**:
```
PATCH /customers/{id}
Body: (same fields, all optional)
Success 200: CustomerObject
```

**Form fields**:
| Field | Required | Validation |
|---|---|---|
| name | ✅ | min 2, max 255 |
| email | ❌ | valid email (unique per business) |
| phone | ❌ | string |
| address | ❌ | string |
| city | ❌ | string |
| state | ❌ | string (Nigerian states dropdown optional) |
| tin | ❌ | string |
| customer_type | ✅ | "Individual" or "Business" |
| credit_limit | ❌ | number ≥ 0 |
| payment_terms_days | ✅ | int 0–365, default 30 |
| notes | ❌ | textarea |

**Soft Delete**:
```
DELETE /customers/{id}
Response: 204 (marks is_active = false)
```

**Hard Delete** (only if total_invoices_count === 0):
```
DELETE /customers/{id}/permanent
Response: 204
Error 400: { "detail": "Cannot delete customer with X invoice(s)..." }
```

---

#### Customer Detail Page — `/customers/[id]`

**API**:
```
GET /customers/{id}
Response: Full CustomerObject
```

**Page sections**:
- Customer info card
- Analytics panel (total invoiced, paid, outstanding, avg payment days)
- Invoice history table → `GET /invoices?customer_id={id}`
- Payment history → `GET /payments?customer_id={id}`
- Edit / Deactivate buttons

---

### 6.5 Products

#### Product List Page — `/products`

**API**:
```
GET /products?page=1&page_size=50&search=laptop&category=Equipment&is_active=true&low_stock_only=false

Response:
{
  "products": [ ProductObject, ... ],
  "total": 25,
  "page": 1,
  "page_size": 50,
  "total_pages": 1
}
```

**ProductObject**:
```typescript
interface Product {
  id: string
  business_id: string
  name: string
  description: string | null
  sku: string | null
  unit_price: string        // "250000.00"
  cost_price: string | null
  tax_rate: string          // "7.50"
  is_taxable: boolean
  track_inventory: boolean
  quantity_in_stock: string | null
  low_stock_threshold: string | null
  category: string | null
  usage_count: number
  last_used_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
```

**Table Columns**:
| Column | Data |
|---|---|
| Name | name + (low stock badge if applicable) |
| SKU | sku |
| Price | formatNaira(unit_price) |
| Tax Rate | tax_rate + "%" |
| Category | category |
| Stock | quantity_in_stock or "N/A" |
| Usage | usage_count |
| Active | badge |
| Actions | Edit / Delete |

**Filters**: search, category dropdown (from `GET /products/categories/list`), is_active, low_stock_only toggle

**Categories API**:
```
GET /products/categories/list
Response: { "categories": ["Office Supplies", "Equipment", "Services", ...] }
```

---

#### Product Create/Edit

**Create API**:
```
POST /products
Body:
{
  "name": "Web Development Services",
  "description": "Custom web development",
  "sku": null,                   // auto-generated if omitted
  "unit_price": 250000,
  "cost_price": 150000,
  "tax_rate": 7.5,
  "is_taxable": true,
  "category": "Services",
  "track_inventory": false,
  "quantity_in_stock": null,
  "low_stock_threshold": null
}

Success 201: ProductObject
Error 409: { "error": { "error": "duplicate_sku", "message": "...", "existing_product": {...} } }
```

**SKU Check** (optional live validation):
```
GET /products/check-sku/{sku}
Response: { "available": true, "sku": "SVC-001" }
         OR { "available": false, "sku": "SVC-001", "existing_product": {...} }
```

**Update API**:
```
PATCH /products/{id}
Body: (all fields optional)
Success 200: ProductObject
```

**Form Fields**:
| Field | Required | Notes |
|---|---|---|
| name | ✅ | min 1 char |
| description | ❌ | textarea |
| sku | ❌ | auto-generated if blank, show SKU check indicator |
| unit_price | ✅ | ≥ 0 |
| cost_price | ❌ | ≥ 0 |
| tax_rate | ✅ | default 7.5 |
| is_taxable | ✅ | toggle |
| category | ❌ | text or select from existing |
| track_inventory | ✅ | toggle |
| quantity_in_stock | conditional | required if track_inventory = true |
| low_stock_threshold | ❌ | show only if track_inventory = true |

---

### 6.6 Payments

#### Payment List Page — `/payments`

**API**:
```
GET /payments?page=1&page_size=50&invoice_id=uuid&customer_id=uuid&from_date=2024-01-01&to_date=2024-12-31

Response:
{
  "payments": [ PaymentObject, ... ],
  "total": 89,
  "page": 1,
  "page_size": 50,
  "total_pages": 2
}
```

**PaymentObject**:
```typescript
interface Payment {
  id: string
  invoice_id: string
  business_id: string
  customer_id: string
  amount: string            // "250000.00"
  payment_date: string      // "2024-02-10"
  payment_method: PaymentMethod
  reference_number: string | null
  transaction_id: string | null
  bank_name: string | null
  account_number: string | null
  notes: string | null
  receipt_number: string | null
  receipt_sent: string | null
  created_at: string
  updated_at: string
}
```

**Table Columns**:
| Column | Data |
|---|---|
| Receipt # | receipt_number |
| Invoice # | link to invoice (invoice_id) |
| Amount | formatNaira(amount) |
| Method | payment_method badge |
| Date | payment_date |
| Reference | reference_number |
| Actions | View Invoice / Delete |

**Delete Payment** (reverses the payment, updates invoice):
```
DELETE /payments/{id}
Response: 204
```

---

### 6.7 Documents (AI OCR)

#### Document List Page — `/documents`

**API**:
```
GET /documents?document_type=RECEIPT&status=COMPLETED&skip=0&limit=20

Response:
{
  "documents": [ DocumentObject, ... ],
  "total": 35,
  "skip": 0,
  "limit": 20
}
```

**DocumentObject**:
```typescript
interface Document {
  id: string
  business_id: string
  document_type: DocumentType        // "RECEIPT"|"INVOICE"|"BANK_STATEMENT"|"TAX_DOCUMENT"|"OTHER"
  document_number: string | null
  document_date: string | null
  original_filename: string
  file_path: string
  file_size: number                  // bytes
  file_type: string                  // "image/jpeg"
  status: ProcessingStatus           // "PENDING"|"PROCESSING"|"COMPLETED"|"FAILED"|"REVIEW_NEEDED"
  confidence_score: string | null    // "0.95"
  processing_error: string | null
  processing_duration_seconds: string | null
  vendor_name: string | null
  vendor_tin: string | null
  vendor_address: string | null
  vendor_phone: string | null
  line_items: LineItem[] | null
  subtotal: string                   // "0.00"
  vat_amount: string
  total_amount: string
  vat_rate: string                   // "7.50"
  category: string | null
  tags: string[] | null
  payment_method: string | null
  payment_reference: string | null
  requires_review: boolean
  review_notes: string | null
  ai_model_used: string | null
  ocr_confidence: string | null
  created_at: string
  updated_at: string
  processing_completed_at: string | null
}
```

**Page Layout**:
```
DocumentsPage
├── PageHeader + Stats row
│   GET /documents/statistics/summary → { total, pending, completed, failed }
├── Upload Zone (drag & drop)
├── Filters (type, status, date)
└── DocumentCards Grid (card per document)
    Each card shows:
    - Filename + type icon
    - Status badge + confidence bar
    - Vendor name (if extracted)
    - Total amount (if extracted)
    - Date
    - Actions: View / Reprocess / Delete
```

**Statistics API**:
```
GET /documents/statistics/summary
Response:
{
  "total_documents": 35,
  "processed": 28,
  "pending": 3,
  "failed": 4
}
```

---

#### Document Upload

**Component**: `src/components/documents/DocumentUpload.tsx`

**Accepted files**: PNG, JPG, JPEG, PDF — max 10MB

**API**:
```
POST /documents/upload
Content-Type: multipart/form-data
Fields:
  - file: File binary
  - document_type: "RECEIPT" (string, default)
  - notes: "Optional notes" (string, optional)

Success 201 (Dev mode — synchronous, fully processed):
{
  "document_id": "uuid",
  "status": "COMPLETED",
  "message": "Document processed successfully (sync mode)",
  "estimated_completion_seconds": 0,
  "processing_result": {
    "status": "processed",
    "document_id": "uuid",
    "vendor_name": "Shoprite",
    "total_amount": 45000.00,
    "confidence_score": 0.92,
    "processing_time": 8.3
  }
}

Success 201 (Production — async via QStash):
{
  "document_id": "uuid",
  "task_id": "msg_xxx",
  "status": "PENDING",
  "message": "Document uploaded. AI processing started.",
  "estimated_completion_seconds": 15
}
```

**Upload Flow**:
1. User drops file or clicks to select
2. Validate: type must be image/png, image/jpeg, image/jpg, application/pdf; size ≤ 10MB
3. Show preview thumbnail (if image)
4. Select document_type from dropdown
5. Submit → show progress indicator
6. Dev: result comes back immediately, show extracted data
7. Prod: poll `GET /documents/{id}` every 3 seconds until status ≠ "PENDING|PROCESSING"

**Polling Logic**:
```typescript
const pollDocument = async (documentId: string) => {
  const maxAttempts = 20
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000)) // wait 3s
    const { data } = await apiClient.get(`/documents/${documentId}`)
    if (!['PENDING', 'PROCESSING'].includes(data.status)) {
      return data
    }
  }
  throw new Error('Processing timed out')
}
```

---

#### Document Detail Page — `/documents/[id]`

**API**: `GET /documents/{id}`

**Page Layout**:
```
DocumentDetailPage
├── Header: filename, status badge, confidence score
├── Two columns:
│   Left: Original file preview (image) or filename (PDF)
│   Right: ExtractedDataPanel
│       ├── Vendor Info (name, TIN, address, phone)
│       ├── Document Info (number, date, type)
│       ├── Line Items Table
│       ├── Financial Summary (subtotal, VAT, total)
│       └── Category + Tags
├── Review Banner (if requires_review = true)
│   "This document needs review. Confidence: X%"
└── Actions: Download Original / Reprocess / Delete
```

**Reprocess**:
```
POST /documents/{id}/reprocess
Body: {}
Response: Same as upload response
```

**Download original**:
```
GET /documents/{id}/download
Response: File binary with Content-Disposition header
```

**Delete**:
```
DELETE /documents/{id}
Response: 204
```

---

### 6.8 Business Settings

**File**: `src/app/(dashboard)/settings/page.tsx`

**API**:
```
GET /businesses/me
Response: BusinessObject

PATCH /businesses/me
Body: (partial update, any fields)
```

**BusinessObject**:
```typescript
interface Business {
  id: string
  user_id: string
  business_name: string
  business_type: string | null
  industry: string | null
  tin: string | null
  vat_registered: boolean
  vat_number: string | null
  rc_number: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  logo_url: string | null
  primary_color: string         // "#3B82F6"
  secondary_color: string       // "#10B981"
  invoice_prefix: string        // "INV"
  invoice_counter: number
  subscription_tier: string     // "FREE"|"BASIC"|"PROFESSIONAL"|"ENTERPRISE"
  monthly_invoice_quota: number
  monthly_document_quota: number
  created_at: string
  updated_at: string
}
```

**Settings Page Sections**:

```
SettingsPage (tabbed)
├── Tab: Business Info
│   - business_name (required)
│   - business_type (text)
│   - industry (text)
│   - RC number
│   
├── Tab: Tax Information
│   - TIN (Tax Identification Number)
│   - VAT registered toggle
│   - VAT number (show if vat_registered = true)
│   
├── Tab: Contact & Address
│   - phone, email, website
│   - address, city, state
│   
├── Tab: Invoice Settings
│   - invoice_prefix (e.g. "INV")
│   - primary_color (color picker)
│   - secondary_color (color picker)
│   - Preview next invoice number
│   
└── Tab: Logo Upload
    POST /businesses/me/logo
    Body: multipart/form-data { logo: File }
    Allowed: PNG/JPG/JPEG, max 5MB
    Response: BusinessObject (with updated logo_url)
```

---

#### Onboarding Page — `/onboarding`

**File**: `src/app/(dashboard)/onboarding/page.tsx`

**When shown**: After registration, when `GET /businesses/me` returns 404.

**API**:
```
POST /businesses
Body:
{
  "business_name": "My Company Ltd",
  "business_type": "Limited Liability Company",
  "industry": "Technology",
  "tin": "12345678-0001",          // optional
  "vat_registered": false,
  "phone": "+2348012345678",       // optional
  "email": "info@mycompany.com",   // optional
  "city": "Lagos",
  "state": "Lagos"
}

Success 201: BusinessObject
Error 400: "Business profile already exists"
```

**Multi-step wizard UI**:
```
Step 1: Business name + type (required to proceed)
Step 2: Tax info (TIN, VAT) — optional, skip available
Step 3: Contact & location — optional, skip available
Step 4: Done! → redirect to /dashboard
```

---

### 6.9 User Profile

**File**: `src/app/(dashboard)/settings/profile/page.tsx`

**API**:
```
GET /users/me
Response:
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+2348012345678",
  "is_active": true,
  "is_verified": true,
  "is_superuser": false,
  "email_verified_at": "2024-01-15T10:30:00Z",
  "last_login": "2024-02-07T14:20:00Z",
  "created_at": "...",
  "updated_at": "..."
}

PATCH /users/me
Body: { "phone": "+2348099999999" }
Response: UserObject

POST /users/me/change-password
Body: {
  "current_password": "OldPass123",
  "new_password": "NewPass456!",
  "confirm_password": "NewPass456!"
}
Response: { "message": "Password changed successfully", "success": true }
```

**Profile Page Sections**:
- Account info (email — read only, phone — editable)
- Change password form
- Account status (verified / active badges)

---

## 7. Shared Components

### `src/components/shared/DataTable.tsx`

A reusable wrapper over `@tanstack/react-table` that handles:
- Column definitions
- Pagination (skip/limit or page/page_size)
- Loading skeleton (10 rows)
- Empty state
- Row click → navigate

```typescript
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  isLoading: boolean
  onRowClick?: (row: T) => void
}
```

### `src/components/shared/CurrencyDisplay.tsx`

```typescript
export function CurrencyDisplay({ amount }: { amount: string | number }) {
  return <span className="font-mono">₦{parseFloat(String(amount)).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
}
```

### `src/components/invoices/InvoiceStatusBadge.tsx`

```typescript
const STATUS_CONFIG = {
  DRAFT:          { label: 'Draft',          className: 'bg-gray-100 text-gray-800' },
  SENT:           { label: 'Sent',           className: 'bg-blue-100 text-blue-800' },
  PAID:           { label: 'Paid',           className: 'bg-green-100 text-green-800' },
  PARTIALLY_PAID: { label: 'Partial',        className: 'bg-yellow-100 text-yellow-800' },
  OVERDUE:        { label: 'Overdue',        className: 'bg-red-100 text-red-800' },
  CANCELLED:      { label: 'Cancelled',      className: 'bg-gray-100 text-gray-400 line-through' },
}
```

### `src/components/layout/Sidebar.tsx`

**Nav items**:
```typescript
const navItems = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Invoices',   href: '/invoices',   icon: FileText },
  { label: 'Customers',  href: '/customers',  icon: Users },
  { label: 'Products',   href: '/products',   icon: Package },
  { label: 'Payments',   href: '/payments',   icon: CreditCard },
  { label: 'Documents',  href: '/documents',  icon: Scan },
  { label: 'Settings',   href: '/settings',   icon: Settings },
]
```

---

## 8. State Management

### React Query Setup — `src/app/providers.tsx`

```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,       // 1 min
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  )
}
```

### React Query Hooks — Example: `src/lib/hooks/useInvoices.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { Invoice, InvoiceListResponse } from '@/lib/types'

export const INVOICE_KEYS = {
  all: ['invoices'] as const,
  list: (params: object) => ['invoices', 'list', params] as const,
  detail: (id: string) => ['invoices', id] as const,
}

export function useInvoices(params: {
  page?: number; page_size?: number; status?: string; customer_id?: string
}) {
  return useQuery({
    queryKey: INVOICE_KEYS.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<InvoiceListResponse>('/invoices', { params })
      return data
    },
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Invoice>(`/invoices/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => apiClient.post('/invoices', payload).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INVOICE_KEYS.all }),
  })
}

export function useRecordPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: any) => apiClient.post('/payments', payload).then(r => r.data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: INVOICE_KEYS.detail(vars.invoice_id) })
      qc.invalidateQueries({ queryKey: ['payments'] })
    },
  })
}
```

---

## 9. Data Types Reference

### `src/lib/types/index.ts`

```typescript
// ─── Auth ───────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  phone: string | null
  is_active: boolean
  is_verified: boolean
  is_superuser: boolean
  email_verified_at: string | null
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  confirm_password: string
  phone?: string
}

// ─── Business ───────────────────────────────────────────────────
export interface Business {
  id: string
  user_id: string
  business_name: string
  business_type: string | null
  industry: string | null
  tin: string | null
  vat_registered: boolean
  vat_number: string | null
  rc_number: string | null
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  invoice_prefix: string
  invoice_counter: number
  subscription_tier: 'FREE' | 'BASIC' | 'PROFESSIONAL' | 'ENTERPRISE'
  monthly_invoice_quota: number
  monthly_document_quota: number
  created_at: string
  updated_at: string
}

// ─── Customer ───────────────────────────────────────────────────
export interface Customer {
  id: string
  business_id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  tin: string | null
  total_invoices_count: number
  total_invoiced_amount: string
  total_paid_amount: string
  average_payment_days: number | null
  last_invoice_date: string | null
  customer_type: 'Individual' | 'Business'
  credit_limit: string | null
  payment_terms_days: number
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CustomerSummary {
  id: string
  name: string
  email: string | null
  phone: string | null
  total_invoices_count: number
  outstanding_amount: string
  is_active: boolean
}

// ─── Product ───────────────────────────────────────────────────
export interface Product {
  id: string
  business_id: string
  name: string
  description: string | null
  sku: string | null
  unit_price: string
  cost_price: string | null
  tax_rate: string
  is_taxable: boolean
  track_inventory: boolean
  quantity_in_stock: string | null
  low_stock_threshold: string | null
  category: string | null
  usage_count: number
  last_used_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductSummary {
  id: string
  name: string
  unit_price: string
  is_active: boolean
}

// ─── Invoice ───────────────────────────────────────────────────
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED'

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  quantity: string
  unit_price: string
  discount_percent: string
  discount_amount: string
  tax_rate: string
  tax_amount: string
  line_total: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  business_id: string
  customer_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  status: InvoiceStatus
  subtotal: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  paid_amount: string
  outstanding_amount: string
  payment_terms: string | null
  notes: string | null
  internal_notes: string | null
  email_sent: boolean
  email_sent_at: string | null
  email_opened_at: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  paid_at: string | null
  cancelled_at: string | null
  items: InvoiceItem[]
  customer: Customer
}

// ─── Payment ───────────────────────────────────────────────────
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'MOBILE_MONEY' | 'POS' | 'OTHER'

export interface Payment {
  id: string
  invoice_id: string
  business_id: string
  customer_id: string
  amount: string
  payment_date: string
  payment_method: PaymentMethod
  reference_number: string | null
  transaction_id: string | null
  bank_name: string | null
  account_number: string | null
  notes: string | null
  receipt_number: string | null
  receipt_sent: string | null
  created_at: string
  updated_at: string
}

// ─── Document ──────────────────────────────────────────────────
export type DocumentType = 'RECEIPT' | 'INVOICE' | 'BANK_STATEMENT' | 'TAX_DOCUMENT' | 'OTHER'
export type ProcessingStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVIEW_NEEDED'

export interface DocumentLineItem {
  description: string
  quantity: number
  unit_price: number
  amount: number
}

export interface Document {
  id: string
  business_id: string
  document_type: DocumentType
  document_number: string | null
  document_date: string | null
  original_filename: string
  file_path: string
  file_size: number
  file_type: string
  status: ProcessingStatus
  confidence_score: string | null
  processing_error: string | null
  processing_duration_seconds: string | null
  vendor_name: string | null
  vendor_tin: string | null
  vendor_address: string | null
  vendor_phone: string | null
  line_items: DocumentLineItem[] | null
  subtotal: string
  vat_amount: string
  total_amount: string
  vat_rate: string
  category: string | null
  tags: string[] | null
  payment_method: string | null
  payment_reference: string | null
  requires_review: boolean
  review_notes: string | null
  ai_model_used: string | null
  ocr_confidence: string | null
  created_at: string
  updated_at: string
  processing_completed_at: string | null
}

// ─── Paginated Responses ───────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
```

---

## 10. API Reference (Complete)

> Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`)
> Auth: All protected endpoints require `Authorization: Bearer {token}`

### Authentication

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/auth/register` | `{email, password, confirm_password, phone?}` | `User` 201 | rate limited 5/min |
| POST | `/auth/login` | `{email, password}` | `{access_token, token_type, user}` 200 | rate limited 10/min |
| POST | `/auth/verify-email` | `?token=xxx` | `{message, success}` 200 | |
| POST | `/auth/forgot-password` | `{email}` | `{message, success}` 200 | rate limited 3/hr |
| POST | `/auth/reset-password` | `{token, new_password, confirm_password}` | `{message, success}` 200 | |
| POST | `/auth/logout` | — | `{message, success}` 200 | client-side only |

### Users

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| GET | `/users/me` | — | `User` 200 | 🔒 |
| PATCH | `/users/me` | `{phone?}` | `User` 200 | 🔒 |
| POST | `/users/me/change-password` | `{current_password, new_password, confirm_password}` | `MessageResponse` 200 | 🔒 |
| DELETE | `/users/me` | — | `MessageResponse` 200 | 🔒 soft delete |

### Business

| Method | Path | Body | Response | Notes |
|---|---|---|---|---|
| POST | `/businesses` | `BusinessCreate` | `Business` 201 | 🔒 |
| GET | `/businesses/me` | — | `Business` 200 | 🔒 404 if not created |
| PATCH | `/businesses/me` | `BusinessUpdate` | `Business` 200 | 🔒 |
| DELETE | `/businesses/me` | — | 204 | 🔒 |
| GET | `/businesses/me/summary` | — | `BusinessSummary` 200 | 🔒 |
| POST | `/businesses/me/logo` | `multipart: {logo: File}` | `Business` 200 | 🔒 max 5MB |
| GET | `/businesses/me/next-invoice-number` | — | `{next_invoice_number, current_counter, prefix}` | 🔒 |

### Customers

| Method | Path | Params / Body | Response | Notes |
|---|---|---|---|---|
| POST | `/customers` | `CustomerCreate` | `Customer` 201 | 🔒 |
| GET | `/customers` | `?skip&limit&search&customer_type&is_active&sort_by&sort_order` | `CustomerListResponse` 200 | 🔒 |
| GET | `/customers/summary` | `?limit=10` | `CustomerSummary[]` 200 | 🔒 lightweight |
| GET | `/customers/search` | `?q=dan&limit=20` | `CustomerSummary[]` 200 | 🔒 min 2 chars |
| GET | `/customers/stats/overview` | — | stats object | 🔒 |
| GET | `/customers/{id}` | — | `Customer` 200 | 🔒 |
| PATCH | `/customers/{id}` | `CustomerUpdate` | `Customer` 200 | 🔒 |
| DELETE | `/customers/{id}` | — | 204 | 🔒 soft delete |
| DELETE | `/customers/{id}/permanent` | — | 204 | 🔒 hard delete |

### Products

| Method | Path | Params / Body | Response | Notes |
|---|---|---|---|---|
| POST | `/products` | `ProductCreate` | `Product` 201 | 🔒 |
| GET | `/products` | `?page&page_size&search&category&is_active&low_stock_only` | `ProductListResponse` 200 | 🔒 |
| GET | `/products/summary` | `?limit=10` | `ProductSummary[]` 200 | 🔒 |
| GET | `/products/check-sku/{sku}` | — | `{available, sku, existing_product?}` | 🔒 |
| GET | `/products/categories/list` | — | `{categories: string[]}` | 🔒 |
| GET | `/products/{id}` | — | `Product` 200 | 🔒 |
| PATCH | `/products/{id}` | `ProductUpdate` | `Product` 200 | 🔒 |
| DELETE | `/products/{id}` | — | 204 | 🔒 soft delete |
| DELETE | `/products/{id}/permanent` | — | 204 | 🔒 hard delete |

### Invoices

| Method | Path | Params / Body | Response | Notes |
|---|---|---|---|---|
| POST | `/invoices` | `InvoiceCreate` | `Invoice` 201 | 🔒 |
| GET | `/invoices` | `?page&page_size&status&customer_id&from_date&to_date` | `InvoiceListResponse` | 🔒 |
| GET | `/invoices/stats/overview` | `?from_date&to_date` | stats object | 🔒 |
| GET | `/invoices/{id}` | — | `Invoice` 200 | 🔒 |
| PATCH | `/invoices/{id}` | `InvoiceUpdate` | `Invoice` 200 | 🔒 DRAFT only for most fields |
| DELETE | `/invoices/{id}` | — | 204 | 🔒 DRAFT only |
| POST | `/invoices/{id}/finalize` | — | `Invoice` 200 | 🔒 DRAFT→SENT |
| POST | `/invoices/{id}/cancel` | `{reason?: string}` | `Invoice` 200 | 🔒 |
| GET | `/invoices/{id}/pdf` | — | `application/pdf` binary | 🔒 |

### Payments

| Method | Path | Params / Body | Response | Notes |
|---|---|---|---|---|
| POST | `/payments` | `PaymentCreate` | `Payment` 201 | 🔒 |
| GET | `/payments` | `?page&page_size&invoice_id&customer_id&from_date&to_date` | `PaymentListResponse` | 🔒 |
| GET | `/payments/{id}` | — | `Payment` 200 | 🔒 |
| PATCH | `/payments/{id}` | `PaymentUpdate` | `Payment` 200 | 🔒 |
| DELETE | `/payments/{id}` | — | 204 | 🔒 reverses payment |

### Documents

| Method | Path | Params / Body | Response | Notes |
|---|---|---|---|---|
| POST | `/documents/upload` | `multipart: {file, document_type?, notes?}` | `DocumentUploadResponse` 201 | 🔒 max 10MB |
| GET | `/documents` | `?document_type&status&skip&limit` | `DocumentListResponse` | 🔒 |
| GET | `/documents/statistics/summary` | — | `{total, processed, pending, failed}` | 🔒 |
| GET | `/documents/{id}` | — | `Document` 200 | 🔒 |
| PATCH | `/documents/{id}` | `DocumentUpdate` | `Document` 200 | 🔒 |
| DELETE | `/documents/{id}` | — | 204 | 🔒 |
| GET | `/documents/{id}/download` | — | File binary | 🔒 |
| POST | `/documents/{id}/reprocess` | — | `DocumentUploadResponse` | 🔒 |

### Error Response Shapes

```typescript
// 422 Validation Error
{
  "error": {
    "type": "validation_error",
    "code": 422,
    "message": "Validation failed",
    "errors": [
      { "field": "email", "message": "Invalid email format", "type": "value_error.email" }
    ]
  }
}

// 401 Unauthorized
{ "detail": "Could not validate credentials" }

// 403 Account Locked
{
  "detail": {
    "error": "account_locked",
    "message": "Account is temporarily locked.",
    "locked_until": "2024-02-07T15:30:00Z",
    "retry_after_minutes": 29
  }
}

// 404 Not Found
{ "detail": "Customer not found" }

// 409 Conflict (e.g. duplicate SKU)
{
  "error": {
    "error": "duplicate_sku",
    "message": "A product with SKU 'SVC-001' already exists",
    "existing_product": { "id": "uuid", "name": "Old Product", "sku": "SVC-001" }
  }
}

// 429 Rate Limited
{
  "error": {
    "type": "rate_limit_exceeded",
    "message": "Too many requests. Please try again later.",
    "retry_after_seconds": 60
  }
}
```

---

## 11. Implementation Order

Follow this order to have a working app as fast as possible:

### Phase 1 — Foundation (Day 1–2)
1. ✅ Create Next.js project + install all deps
2. ✅ Set up project structure (folders)
3. ✅ Create `apiClient` (Axios + interceptors)
4. ✅ Create all TypeScript types (`src/lib/types/index.ts`)
5. ✅ Set up React Query + Zustand + providers
6. ✅ Set up middleware (route protection)
7. ✅ Auth layout + Login page (working)
8. ✅ Register page

### Phase 2 — Shell (Day 3)
9. ✅ Dashboard layout (sidebar + topbar)
10. ✅ Sidebar with nav links
11. ✅ Topbar with user menu + logout
12. ✅ Onboarding wizard (`POST /businesses`)
13. ✅ Dashboard page (stats + recent invoices)

### Phase 3 — Core Features (Day 4–6)
14. ✅ Customer list + filters
15. ✅ Customer create/edit form
16. ✅ Customer detail page
17. ✅ Product list + filters
18. ✅ Product create/edit form
19. ✅ Invoice list + filters
20. ✅ Invoice create form (complex — line items, totals calc)
21. ✅ Invoice detail page (actions: finalize, cancel, delete)
22. ✅ PDF download
23. ✅ Record Payment modal
24. ✅ Payment list page

### Phase 4 — AI Documents (Day 7–8)
25. ✅ Document list page
26. ✅ Upload component (drag & drop)
27. ✅ Processing state / polling
28. ✅ Document detail with extracted data

### Phase 5 — Settings & Polish (Day 9–10)
29. ✅ Business settings page (tabs)
30. ✅ Logo upload
31. ✅ User profile + change password
32. ✅ Empty states for all lists
33. ✅ Loading skeletons
34. ✅ Error boundaries
35. ✅ Toast notifications throughout
36. ✅ Mobile responsive layout

### Phase 6 — Production (Day 11+)
37. ✅ Add `NEXT_PUBLIC_API_URL` to Vercel/hosting env
38. ✅ Test all API integrations against live backend
39. ✅ `next build` — fix all TypeScript errors
40. ✅ Deploy

---

## Quick Reference: Common Patterns

### Fetch with Loading State
```typescript
const { data, isLoading, error } = useInvoices({ page: 1, page_size: 50 })
if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorState message={parseApiError(error)} />
```

### Mutation with Toast
```typescript
const mutation = useCreateInvoice()
const onSubmit = async (data) => {
  try {
    const invoice = await mutation.mutateAsync(data)
    toast.success('Invoice created!')
    router.push(`/invoices/${invoice.id}`)
  } catch (err) {
    toast.error(parseApiError(err))
  }
}
```

### PDF Download
```typescript
const downloadPdf = async (invoiceId: string, invoiceNumber: string) => {
  const { data } = await apiClient.get(`/invoices/${invoiceId}/pdf`, { responseType: 'blob' })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${invoiceNumber}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
```

### Nigerian States List (for dropdowns)
```typescript
export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara'
]
```

### VAT Calculation Helper
```typescript
export const VAT_RATE = 7.5

export function calculateVAT(amount: number): number {
  return amount * (VAT_RATE / 100)
}

export function amountWithVAT(amount: number): number {
  return amount * (1 + VAT_RATE / 100)
}

export function extractVATFromGross(gross: number): { net: number; vat: number } {
  const net = gross / (1 + VAT_RATE / 100)
  return { net, vat: gross - net }
}
```

---

*End of Frontend Roadmap. This document contains everything needed to build the complete Nigerian Tax Compliance Platform frontend without any reference to the backend codebase.*