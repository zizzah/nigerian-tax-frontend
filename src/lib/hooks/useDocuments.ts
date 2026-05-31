// lib/hooks/useDocuments.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/lib/api/documents'

export const DOCUMENT_KEYS = {
  receipts:      ['documents', 'receipts']      as const,
  bankStatements:['documents', 'bank-statements'] as const,
  detail: (type: string, id: string) => ['documents', type, id] as const,
}

export function useReceipts(params?: {
  skip?: number
  limit?: number
  processing_status?: string
  start_date?: string
  end_date?: string
}) {
  return useQuery({
    queryKey: [...DOCUMENT_KEYS.receipts, params],
    queryFn:  () => documentsApi.listReceipts(params),
  })
}

export function useBankStatements(params?: {
  skip?: number
  limit?: number
  processing_status?: string
  start_date?: string
  end_date?: string
}) {
  return useQuery({
    queryKey: [...DOCUMENT_KEYS.bankStatements, params],
    queryFn:  () => documentsApi.listBankStatements(params),
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      file,
      documentType,
    }: {
      file: File
      documentType: 'RECEIPT' | 'INVOICE' | 'BANK_STATEMENT' | 'TAX_DOCUMENT' | 'OTHER'
    }) => documentsApi.upload(file, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

// useReprocessDocument removed — reprocessing is not supported.
// Show UI message directing user to re-upload.