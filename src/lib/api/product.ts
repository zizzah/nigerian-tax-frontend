import apiClient from './client'
import { Product, ProductCreate, ProductUpdate, ProductListResponse } from '@/lib/types'

export const productsApi = {
  // Create product
  create: async (data: ProductCreate): Promise<Product> => {
    const response = await apiClient.post('/products/', data)
    return response.data
  },

  // List products
  list: async (params?: {
    skip?: number
    limit?: number
    search?: string
    category?: string
    is_active?: boolean
  }): Promise<ProductListResponse> => {
    const response = await apiClient.get('/products/', { params })
    return response.data
  },

  // Get product by ID
  get: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`)
    return response.data
  },

  // Update product
  update: async (id: string, data: ProductUpdate): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data)
    return response.data
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  // Adjust stock
  adjustStock: async (id: string, quantity: number, reason?: string): Promise<Product> => {
    const response = await apiClient.post(`/products/${id}/adjust-stock`, {
      quantity,
      reason
    })
    return response.data
  },
}