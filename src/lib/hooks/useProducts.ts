import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/product'
import type { ProductCreate, ProductUpdate } from '@/lib/types'

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  list: (params?: object) => [...PRODUCT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PRODUCT_KEYS.all, 'detail', id] as const,
}

export function useProducts(params?: {
  skip?: number
  limit?: number
  search?: string
  category?: string
  is_active?: boolean
}) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: () => productsApi.list(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: () => productsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProductCreate) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductUpdate }) =>
      productsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
    },
  })
}