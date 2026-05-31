// lib/api/documents.ts

import apiClient from './client'
import { Document, DocumentListResponse } from '@/lib/types'

export const documentsApi = {

  upload: async (
    file: File,
    documentType: 'RECEIPT' | 'INVOICE' | 'BANK_STATEMENT' | 'TAX_DOCUMENT' | 'OTHER'
  ): Promise<Document> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', documentType)

    const response = await apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  // Receipts
  listReceipts: async (params?: {
    skip?: number
    limit?: number
    processing_status?: string
    start_date?: string
    end_date?: string
  }): Promise<DocumentListResponse> => {
    const response = await apiClient.get('/documents/receipts', { params })
    return response.data
  },

  // Bank statements
  listBankStatements: async (params?: {
    skip?: number
    limit?: number
    processing_status?: string
    start_date?: string
    end_date?: string
  }): Promise<DocumentListResponse> => {
    const response = await apiClient.get('/documents/bank-statements', { params })
    return response.data
  },

  getReceipt: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/receipts/${id}`)
    return response.data
  },

  getBankStatement: async (id: string): Promise<Document> => {
    const response = await apiClient.get(`/documents/bank-statements/${id}`)
    return response.data
  },

  updateReceipt: async (id: string, data: {
    vendor_name?: string
    vendor_tin?: string
    document_date?: string
    total_amount?: number
    vat_amount?: number
    category?: string
  }): Promise<Document> => {
    const response = await apiClient.patch(`/documents/receipts/${id}`, data)
    return response.data
  },

  updateBankStatement: async (id: string, data: {
    account_name?: string
    bank_name?: string
    period_from?: string
    period_to?: string
  }): Promise<Document> => {
    const response = await apiClient.patch(`/documents/bank-statements/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`)
  },

  // Removed: download, reprocess — backend no longer stores files.
  // If called, show a UI message: "Please re-upload the original file."
}