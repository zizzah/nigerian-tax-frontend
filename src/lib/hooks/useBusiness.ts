import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { businessApi } from '@/lib/api/business'
import type { BusinessCreate, BusinessUpdate } from '@/lib/types'

export const BUSINESS_KEYS = {
  me: ['business', 'me'] as const,
  nextInvoiceNumber: ['business', 'next-invoice-number'] as const,
}

export function useBusiness() {
  return useQuery({
    queryKey: BUSINESS_KEYS.me,
    queryFn: () => businessApi.getMy(),
    retry: (failureCount, error: unknown) => {
      // Don't retry 404 — user just hasn't created a business yet
      const status = (error as { response?: { status?: number } })?.response?.status
      if (status === 404) return false
      return failureCount < 2
    },
  })
}

export function useCreateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BusinessCreate) => businessApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_KEYS.me })
    },
  })
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BusinessUpdate) => businessApi.updateMy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_KEYS.me })
    },
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => businessApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_KEYS.me })
    },
  })
}