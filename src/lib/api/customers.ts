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

  // Derive stats from two cheap queries instead of fetching limit=1000
  getStats: async (): Promise<CustomerStats> => {
    const [allRes, activeRes] = await Promise.all([
      apiClient.get<CustomerListResponse>('/customers/', { params: { limit: 1 } }),
      apiClient.get<CustomerListResponse>('/customers/', { params: { limit: 1, is_active: true } }),
    ])

    return {
      total_customers:  allRes.data.total,
      active_customers: activeRes.data.total,
    }
  },
}