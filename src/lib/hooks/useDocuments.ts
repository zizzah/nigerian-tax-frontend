import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/lib/api/documents'

export const DOCUMENT_KEYS = {
  all: ['documents'] as const,
  list: (params?: object) => [...DOCUMENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...DOCUMENT_KEYS.all, 'detail', id] as const,
}

export function useDocuments(params?: {
  skip?: number
  limit?: number
  document_type?: string
  processing_status?: string
  start_date?: string
  end_date?: string
}) {
  return useQuery({
    queryKey: DOCUMENT_KEYS.list(params),
    queryFn: async () => {
      const data = await documentsApi.list(params)
      return data
    },
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: DOCUMENT_KEYS.detail(id),
    queryFn: async () => {
      const data = await documentsApi.get(id)
      return data
    },
    enabled: !!id,
  })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: 'RECEIPT' | 'INVOICE' | 'BILL' | 'QUOTE' | 'OTHER' }) => 
      documentsApi.upload(file, documentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.all })
    },
  })
}

export function useReprocessDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.reprocess(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.all })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENT_KEYS.all })
    },
  })
}
