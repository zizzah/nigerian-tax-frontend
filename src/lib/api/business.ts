import apiClient from './client'
import { Business, BusinessCreate, BusinessUpdate } from '@/lib/types'

export interface NextInvoiceNumberResponse {
  next_invoice_number: string
  current_counter: number
  prefix: string
}

export const businessApi = {
  // Create business
  create: async (data: BusinessCreate): Promise<Business> => {
    const response = await apiClient.post<Business>('/businesses/', data)
    return response.data
  },

  // Get my business
  getMy: async (): Promise<Business> => {
    const response = await apiClient.get<Business>('/businesses/me')
    return response.data
  },

  // Update my business
  updateMy: async (data: BusinessUpdate): Promise<Business> => {
    const response = await apiClient.patch<Business>('/businesses/me', data)
    return response.data
  },

  // Upload logo
  uploadLogo: async (file: File): Promise<Business> => {
    const formData = new FormData()
    formData.append('logo', file)

    const response = await apiClient.post<Business>('/businesses/me/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Get next invoice number
  getNextInvoiceNumber: async (): Promise<NextInvoiceNumberResponse> => {
    const response = await apiClient.get<NextInvoiceNumberResponse>(
      '/businesses/me/next-invoice-number'
    )
    return response.data
  },
}