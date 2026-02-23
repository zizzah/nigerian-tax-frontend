import apiClient from './client'
import { Document, DocumentListResponse } from '@/lib/types'

export const documentsApi = {
  // Upload document
  upload: async (
    file: File,
    documentType: 'RECEIPT' | 'INVOICE' | 'BILL' | 'QUOTE' | 'OTHER'
  ): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)

    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // List documents
  list: async (params?: {
    skip?: number
    limit?: number
    document_type?: string
    processing_status?: string
    start_date?: string
    end_date?: string
  }): Promise<DocumentListResponse> => {
    const response = await apiClient.get('/documents/', { params })
    return response.data
  },

  // Get document by ID
  get: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`)
    return response.data
  },

  // Download document
  download: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/documents/${id}/download`, {
      responseType: 'blob'
    })
    return response.data
  },

  // Reprocess failed document
  reprocess: async (id: string): Promise<Document> => {
    const response = await apiClient.post(`/documents/${id}/reprocess`)
    return response.data
  },

  // Update document metadata
  update: async (id: string, data: {
    vendor_name?: string
    vendor_tin?: string
    document_date?: string
    total_amount?: number
    vat_amount?: number
    category?: string
  }): Promise<Document> => {
    const response = await apiClient.patch(`/documents/${id}`, data)
    return response.data
  },

  // Delete document
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`)
  },
}