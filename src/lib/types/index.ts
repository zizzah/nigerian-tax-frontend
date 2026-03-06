// Auth Types
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

// Business Types
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

export interface BusinessCreate {
  business_name: string
  business_type?: string
  industry?: string
  tin?: string
  vat_registered: boolean
  vat_number?: string
  rc_number?: string
  address?: string
  city?: string
  state?: string
  country: string
  phone?: string
  email?: string
  website?: string
}

export interface BusinessUpdate {
  business_name?: string
  business_type?: string
  industry?: string
  tin?: string
  vat_registered?: boolean
  vat_number?: string
  rc_number?: string
  address?: string
  city?: string
  state?: string
  phone?: string
  email?: string
  website?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  invoice_prefix?: string
}

// Customer Types
// Customer Types - synced with backend schemas

// Customer Types - synced with backend schemas

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
  total_invoiced_amount: string  // Decimal comes back as string from FastAPI
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

export interface CustomerCreate {
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  tin?: string
  customer_type: string
  credit_limit?: number
  payment_terms_days?: number
  notes?: string
}

export interface CustomerUpdate extends Partial<CustomerCreate> {
  is_active?: boolean
}

export interface CustomerListResponse {
  customers: Customer[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Matches what customersApi.getStats() computes client-side
export interface CustomerStats {
  total_customers: number
  active_customers: number
}
export interface Product {
  id: string
  business_id: string
  name: string
  description: string | null
  sku: string | null
  category: string | null
  unit_price: number
  cost_price: number | null
  tax_rate: number              // was: vat_rate
  is_taxable: boolean           // was: missing
  track_inventory: boolean
  quantity_in_stock: number | null  // was: current_stock
  low_stock_threshold: number | null // was: reorder_level
  usage_count: number           // was: missing
  last_used_at: string | null   // was: missing
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductSummary {
  id: string
  name: string
  unit_price: number            // was: string (backend returns number)
  is_active: boolean
}

export interface ProductCreate {
  name: string
  description?: string
  sku?: string
  category?: string
  unit_price: number
  cost_price?: number
  tax_rate?: number             // was: vat_rate
  is_taxable?: boolean          // was: missing
  track_inventory?: boolean
  quantity_in_stock?: number    // was: current_stock
  low_stock_threshold?: number  // was: reorder_level
}

export interface ProductUpdate extends Partial<ProductCreate> {
  is_active?: boolean
}

export interface ProductListResponse {
  products: Product[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
// Invoice Types
// Invoice Types - synced with backend schemas/invoice.py

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'  // matches backend InvoiceStatus enum

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string | null
  description: string
  quantity: string        // Decimal comes as string from FastAPI
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
  issue_date: string      // was: invoice_date
  due_date: string
  status: InvoiceStatus
  payment_terms: string | null
  notes: string | null
  internal_notes: string | null
  subtotal: string
  discount_amount: string
  tax_amount: string
  total_amount: string
  paid_amount: string
  outstanding_amount: string
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  paid_at: string | null
  cancelled_at: string | null
  items: InvoiceItem[]
}

// Matches backend InvoiceStatistics schema exactly
export interface InvoiceStats {
  total_invoices: number
  draft_invoices: number
  sent_invoices: number
  paid_invoices: number
  overdue_invoices: number
  cancelled_invoices: number
  total_invoiced: string
  total_paid: string
  total_outstanding: string
  average_invoice_value: string
  average_days_to_payment: number | null
}

// Keep for backward compat with useInvoiceStats hook
export type InvoiceStatsOverview = InvoiceStats

export interface InvoiceItemCreate {
  product_id?: string
  description: string     // required by backend
  quantity: number
  unit_price: number
  discount_percent?: number  // was: discount_amount
  tax_rate?: number          // was: vat_rate
  sort_order?: number
}

export interface InvoiceCreate {
  customer_id: string
  issue_date: string         // was: invoice_date
  due_date?: string          // optional — backend defaults to +30 days
  discount_amount?: number
  payment_terms?: string
  notes?: string
  internal_notes?: string
  items: InvoiceItemCreate[]
}

export interface InvoiceUpdate {
  customer_id?: string
  issue_date?: string
  due_date?: string
  discount_amount?: number
  payment_terms?: string
  notes?: string
  internal_notes?: string
}

export interface InvoiceListResponse {
  invoices: Invoice[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Payment Types
export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CHEQUE'
  | 'CARD'
  | 'MOBILE_MONEY'
  | 'POS'
  | 'OTHER'

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

export interface PaymentCreate {
  invoice_id: string
  amount: number
  payment_date: string
  payment_method: PaymentMethod
  reference_number?: string
  transaction_id?: string
  bank_name?: string
  notes?: string
}

export interface PaymentUpdate {
  amount?: number
  payment_date?: string
  payment_method?: PaymentMethod
  reference_number?: string
  notes?: string
}

export interface PaymentListResponse {
  payments: Payment[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Document Types
export type DocumentType =
  | 'RECEIPT'
  | 'INVOICE'
  | 'BANK_STATEMENT'
  | 'TAX_DOCUMENT'
  | 'OTHER'

export type ProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVIEW_NEEDED'

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
  file_name?: string
  file_path: string
  file_size: number
  file_type: string
  status: ProcessingStatus
  processing_status?: string
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

export interface ExtractedData {
  vendor: string | null
  vendor_tin: string | null
  document_date: string | null
  total_amount: number | null
  vat_amount: number | null
  category: string | null
  line_items: Array<{
    description: string
    quantity: number
    unit_price: number
    total: number
  }> | null
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Paginated Response Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Line item for invoice creation form
export interface LineItem {
  description: string
  quantity: number
  unit_price: number
}

// Extracted document data for UI display
export interface ExtractedDocumentDisplay {
  name: string
  vendor: string
  date: string
  amount: number
  category: string
  vat: number
  receiptNumber: string
}

// New payment form state
export interface NewPaymentForm {
  invoice_id: string
  amount: number
  payment_method: string
  payment_date: string
  reference: string
  notes: string
}

// New customer form state
export interface NewCustomerForm {
  name: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  tin: string
  customer_type: 'Business' | 'Individual'
  payment_terms_days: number
}

// New product form state
export interface NewProductForm {
  name: string
  description: string
  sku: string
  category: string
  unit_price: number
  cost_price: number
  tax_rate: number          // was: vat_rate
  is_active: boolean
  track_inventory: boolean
  quantity_in_stock: number  // was: current_stock
  low_stock_threshold: number // was: low_stock_threshold (same)
}