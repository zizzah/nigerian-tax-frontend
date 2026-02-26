import apiClient from './client'
import type {
  Invoice,
  InvoiceCreate,
  InvoiceUpdate,
  InvoiceListResponse,
  InvoiceStatsOverview,
} from '@/lib/types'

export const invoicesApi = {
  create: async (data: InvoiceCreate): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>('/invoices/', data)
    return response.data
  },

  list: async (params?: {
    skip?: number
    limit?: number
    status?: string
    payment_status?: string
    customer_id?: string
    start_date?: string
    end_date?: string
  }): Promise<InvoiceListResponse> => {
    const response = await apiClient.get<InvoiceListResponse>('/invoices/', { params })
    return response.data
  },

  get: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Invoice>(`/invoices/${id}`)
    return response.data
  },

  update: async (id: string, data: InvoiceUpdate): Promise<Invoice> => {
    const response = await apiClient.patch<Invoice>(`/invoices/${id}`, data)
    return response.data
  },

  finalize: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/finalize`)
    return response.data
  },

  // NOTE: /invoices/{id}/cancel is not in the backend API.
  // Kept here in case it's added later; callers should handle 404 gracefully.
  cancel: async (id: string, reason?: string): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/cancel`, { reason })
    return response.data
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  // Backend does NOT have /invoices/stats/overview.
  // This computes basic stats client-side from the invoices list instead.
  getStats: async (_params?: {
    start_date?: string
    end_date?: string
  }): Promise<InvoiceStatsOverview> => {
    const response = await apiClient.get<InvoiceListResponse>('/invoices/', {
      params: { limit: 1000 },
    })
    
    // InvoiceListResponse has 'invoices' property, not 'items'
    const invoices = response.data.invoices ?? []

    const total_invoices = invoices.length
    const total_amount = invoices.reduce((sum: number, inv: Invoice) => sum + (parseFloat(inv.total_amount) || 0), 0)
    const paid_amount = invoices
      .filter((inv: Invoice) => inv.payment_status === 'PAID')
      .reduce((sum: number, inv: Invoice) => sum + (parseFloat(inv.total_amount) || 0), 0)
    const outstanding_amount = invoices
      .filter((inv: Invoice) => inv.payment_status !== 'PAID')
      .reduce((sum: number, inv: Invoice) => sum + (parseFloat(inv.outstanding_amount) || 0), 0)
    const overdue_count = invoices.filter((inv: Invoice) => inv.status === 'OVERDUE').length
    const draft_count = invoices.filter((inv: Invoice) => inv.status === 'DRAFT').length
    const sent_count = invoices.filter((inv: Invoice) => inv.status === 'SENT').length
    const paid_count = invoices.filter((inv: Invoice) => inv.payment_status === 'PAID').length
    const average_invoice_value = total_invoices > 0 ? total_amount / total_invoices : 0

    return {
      total_invoices,
      total_revenue: total_amount,
      total_paid: paid_amount,
      total_outstanding: outstanding_amount,
      draft_count,
      sent_count,
      paid_count,
      overdue_count,
      average_invoice_value,
      revenue_by_month: [],
    } as InvoiceStatsOverview
  },
}
