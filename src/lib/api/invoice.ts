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
    page?: number
    page_size?: number
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

  cancel: async (id: string, reason?: string): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/cancel`, { reason })
    return response.data
  },

  // ── DELETE (draft invoices only) ──────────────────────────────────────────
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`)
  },

  // ── SEND EMAIL ────────────────────────────────────────────────────────────
  // POST /invoices/{id}/send   — backend triggers email to customer
  sendEmail: async (id: string, opts?: { message?: string; cc?: string }): Promise<Invoice> => {
    const response = await apiClient.post<Invoice>(`/invoices/${id}/send`, opts ?? {})
    return response.data
  },

  // ── DUPLICATE ─────────────────────────────────────────────────────────────
  // Fetches the original, strips server-only fields, and POSTs a new draft.
  // If the backend ever adds POST /invoices/{id}/duplicate, swap to that.
  duplicate: async (id: string): Promise<Invoice> => {
    const original = await apiClient.get<Invoice>(`/invoices/${id}`)
    const src = original.data

    const today = new Date().toISOString().split('T')[0]
    const payload: InvoiceCreate = {
      customer_id:    src.customer_id,
      issue_date:     today,
      due_date:       undefined,   // backend defaults to +30 days
      discount_amount: parseFloat(src.discount_amount) || undefined,
      notes:          src.notes       || undefined,
      internal_notes: src.internal_notes || undefined,
      items: (src.items ?? []).map(item => ({
        product_id:       item.product_id   || undefined,
        description:      item.description,
        quantity:         parseFloat(item.quantity),
        unit_price:       parseFloat(item.unit_price),
        discount_percent: parseFloat(item.discount_percent) || undefined,
        tax_rate:         parseFloat(item.tax_rate) || undefined,
        sort_order:       item.sort_order,
      })),
    }

    const response = await apiClient.post<Invoice>('/invoices/', payload)
    return response.data
  },

  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  },

  getStats: async (_params?: {
    start_date?: string
    end_date?: string
  }): Promise<InvoiceStatsOverview> => {
    const response = await apiClient.get<InvoiceListResponse>('/invoices/', {
      params: { limit: 1000 },
    })

    const invoices = response.data.invoices ?? []
    const total_invoices     = invoices.length
    const total_amount       = invoices.reduce((s, inv) => s + (parseFloat(inv.total_amount)       || 0), 0)
    const total_paid_amount  = invoices.filter(inv => inv.status === 'PAID')
                                       .reduce((s, inv) => s + (parseFloat(inv.total_amount)       || 0), 0)
    const total_outstanding  = invoices.filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
                                       .reduce((s, inv) => s + (parseFloat(inv.outstanding_amount) || 0), 0)
    const overdue_count      = invoices.filter(inv => inv.status === 'OVERDUE').length
    const draft_count        = invoices.filter(inv => inv.status === 'DRAFT').length
    const sent_count         = invoices.filter(inv => inv.status === 'SENT').length
    const paid_count         = invoices.filter(inv => inv.status === 'PAID').length
    const cancelled_count    = invoices.filter(inv => inv.status === 'CANCELLED').length
    const non_cancelled      = invoices.filter(inv => inv.status !== 'CANCELLED')
    const avg_value          = non_cancelled.length > 0 ? total_amount / non_cancelled.length : 0

    return {
      total_invoices,
      draft_invoices:        draft_count,
      sent_invoices:         sent_count,
      paid_invoices:         paid_count,
      overdue_invoices:      overdue_count,
      cancelled_invoices:    cancelled_count,
      total_invoiced:        total_amount.toFixed(2),
      total_paid:            total_paid_amount.toFixed(2),
      total_outstanding:     total_outstanding.toFixed(2),
      average_invoice_value: avg_value.toFixed(2),
      average_days_to_payment: null,
    } satisfies InvoiceStatsOverview
  },
}