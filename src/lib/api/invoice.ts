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

  getStats: async (params?: {
    start_date?: string
    end_date?: string
  }): Promise<InvoiceStatsOverview> => {
    const response = await apiClient.get<InvoiceStatsOverview>('/invoices/stats/overview', {
      params,
    })
    return response.data
  },
}