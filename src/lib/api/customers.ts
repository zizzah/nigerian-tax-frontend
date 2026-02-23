import apiClient from './client'
import { Customer, CustomerCreate, CustomerUpdate, CustomerListResponse } from '@/lib/types'

export const customersApi = {
  // Create customer
  create: async (data: CustomerCreate): Promise<Customer> => {
    const response = await apiClient.post('/customers/', data)
    return response.data
  },

  // List customers
  list: async (params?: {
    skip?: number
    limit?: number
    search?: string
    is_active?: boolean
  }): Promise<CustomerListResponse> => {
    const response = await apiClient.get('/customers/', { params })
    return response.data
  },

    // Get customer by ID
    getById: async (id: string): Promise<Customer> => {
      const response = await apiClient.get(`/customers/${id}`)
      return response.data
    },
  
  // Update customer
  update: async (id: string, data: CustomerUpdate): Promise<Customer> => {
    const response = await apiClient.patch(`/customers/${id}`, data)
    return response.data
  },

  // Delete customer
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/customers/${id}`)
  },

  // Get customer statistics
  getStats: async (): Promise<{
    total_customers: number
    active_customers: number
    total_revenue: number
    top_customers: Array<{
      customer_id: string
      customer_name: string
      total_invoiced: number
      total_paid: number
      invoice_count: number
    }>
  }> => {
    const response = await apiClient.get('/customers/stats/overview')
    return response.data
  }
}

  