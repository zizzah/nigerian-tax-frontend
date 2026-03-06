import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'
import type { Business, BusinessCreate, BusinessUpdate } from '@/lib/types'

export const BUSINESS_KEYS = {
  all: ['business'] as const,
  me:  ['business', 'me'] as const,
}

async function fetchBusiness(): Promise<Business> {
  const res = await apiClient.get<Business>('/businesses/me')
  return res.data
}

export function useBusiness() {
  return useQuery<Business>({
    queryKey: BUSINESS_KEYS.me,
    queryFn:  fetchBusiness,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BusinessCreate) =>
      apiClient.post<Business>('/businesses', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_KEYS.me })
    },
  })
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: BusinessUpdate) =>
      apiClient.patch<Business>('/businesses/me', data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_KEYS.me })
    },
  })
}

export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('logo', file)
      return apiClient.post<Business>('/businesses/me/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BUSINESS_KEYS.me })
    },
  })
}