// lib/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api/client'

export interface RevenueMonth {
  month: string
  year: number
  revenue: number
  count: number
}

export interface DashboardInvoice {
  id: string
  invoice_number: string
  customer_name: string
  total_amount: number
  outstanding_amount: number
  status: string
  issue_date: string | null
  due_date: string | null
}

export interface DashboardPayment {
  id: string
  amount: number
  payment_date: string | null
  payment_method: string
  receipt_number: string | null
  customer_name: string
  created_at: string | null
}

export interface DashboardStats {
  // Invoice counts
  total_invoices: number
  draft_count: number
  sent_count: number
  paid_count: number
  overdue_count: number
  cancelled_count: number
  partially_paid_count: number

  // Money
  total_invoiced: number
  total_collected: number
  total_outstanding: number
  overdue_amount: number

  // Customers
  active_customers: number

  // Chart
  revenue_by_month: RevenueMonth[]

  // Activity
  recent_invoices: DashboardInvoice[]
  recent_payments: DashboardPayment[]
}

export function useDashboard() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/analytics/dashboard')
      return res.data
    },
    staleTime: 60_000, // refetch after 1 minute
  })
}