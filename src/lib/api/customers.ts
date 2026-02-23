import apiClient from './client'
import type {
  Customer,
  CustomerCreate,
  CustomerUpdate,
  CustomerListResponse,
  CustomerStats,
} from '@/lib/types'

export const customersApi = {
  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await apiClient.post<Customer>('/customers/', data)
    return response.data
  },

  list: async (params?: {
    skip?: number
    limit?: number
    search?: string
    is_active?: boolean
  }): Promise<CustomerListResponse> => {
    const response = await apiClient.get<CustomerListResponse>('/customers/', { params })
    return response.data
  },

  getById: async (id: string): Promise<Customer> => {
    const response = await apiClient.get<Customer>(`/customers/${id}`)
    return response.data
  },

  update: async (id: string, data: CustomerUpdate): Promise<Customer> => {
    const response = await apiClient.patch<Customer>(`/customers/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },

  getStats: async (): Promise<CustomerStats> => {
    const response = await apiClient.get<CustomerStats>('/customers/stats/overview')
    return response.data
  },
}