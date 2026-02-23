import apiClient from './client'
import { Invoice, InvoiceCreate, InvoiceUpdate, InvoiceListResponse } from '@/lib/types'

export const invoicesApi = {
  // Create invoice
  create: async (data: InvoiceCreate): Promise<Invoice> => {
    const response = await apiClient.post('/invoices/', data)
    return response.data
  },

  // List invoices
  list: async (params?: {
    skip?: number
    limit?: number
    status?: string
    payment_status?: string
    customer_id?: string
    start_date?: string
    end_date?: string
  }): Promise<InvoiceListResponse> => {
    const response = await apiClient.get('/invoices/', { params })
    return response.data
  },

  // Get invoice by ID
  get: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get(`/invoices/${id}`)
    return response.data
  },

  // Update invoice (only DRAFT status)
  update: async (id: string, data: InvoiceUpdate): Promise<Invoice> => {
    const response = await apiClient.patch(`/invoices/${id}`, data)
    return response.data
  },

  // Finalize invoice (send to customer)
  finalize: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post(`/invoices/${id}/finalize`)
    return response.data
  },

  // Cancel invoice
  cancel: async (id: string, reason?: string): Promise<Invoice> => {
    const response = await apiClient.post(`/invoices/${id}/cancel`, { reason })
    return response.data
  },

  // Download PDF
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Get invoice statistics
  getStats: async (params?: {
    start_date?: string
    end_date?: string
  }): Promise<{
    total_invoices: number
    total_revenue: number
    total_paid: number
    total_outstanding: number
    draft_count: number
    sent_count: number
    paid_count: number
    overdue_count: number
    average_invoice_value: number
    revenue_by_month: Array<{
      month: string
      revenue: number
      count: number
    }>
  }> => {
    const response = await apiClient.get('/invoices/stats/overview', { params })
    return response.data
  },
}