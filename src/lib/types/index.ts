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

// Customer Types
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

// Product Types
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

// Invoice Types
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
  average_days_to_payment: number
}

// Payment Types
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

// Document Types
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

// Paginated Response Types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}
