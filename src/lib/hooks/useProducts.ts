import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/product'

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
    queryFn: async () => {
      const data = await productsApi.list(params)
      return data
    },
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: async () => {
      const data = await productsApi.get(id)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof productsApi.create>[0]) => 
      productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof productsApi.update>[1] }) => 
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
