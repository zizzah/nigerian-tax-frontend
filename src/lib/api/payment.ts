import apiClient from './client'
import { Payment, PaymentCreate, PaymentUpdate, PaymentListResponse } from '@/lib/types'

export const paymentsApi = {
  // Create payment
  create: async (data: PaymentCreate): Promise<Payment> => {
    const response = await apiClient.post('/payments/', data)
    return response.data
  },

  // List payments
  list: async (params?: {
    skip?: number
    limit?: number
    invoice_id?: string
    start_date?: string
    end_date?: string
  }): Promise<PaymentListResponse> => {
    const response = await apiClient.get('/payments/', { params })
    return response.data
  },

  // Get payment by ID
  get: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`/payments/${id}`)
    return response.data
  },

  // Update payment
  update: async (id: string, data: PaymentUpdate): Promise<Payment> => {
    const response = await apiClient.patch(`/payments/${id}`, data)
    return response.data
  },

  // Delete payment
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/payments/${id}`)
  },
}