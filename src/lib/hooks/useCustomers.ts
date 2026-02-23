import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersApi } from '@/lib/api/customers'

export const CUSTOMER_KEYS = {
  all: ['customers'] as const,
  list: (params?: object) => [...CUSTOMER_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...CUSTOMER_KEYS.all, 'detail', id] as const,
  stats: ['customers', 'stats'] as const,
}

export function useCustomers(params?: {
  skip?: number
  limit?: number
  search?: string
  is_active?: boolean
}) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.list(params),
    queryFn: async () => {
      const data = await customersApi.list(params)
      return data
    },
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: CUSTOMER_KEYS.detail(id),
    queryFn: async () => {
      const data = await customersApi.getById(id)
      return data
    },
    enabled: !!id,
  })
}

export function useCustomerStats() {
  return useQuery({
    queryKey: CUSTOMER_KEYS.stats,
    queryFn: async () => {
      const data = await customersApi.getStats()
      return data
    },
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof customersApi.create>[0]) => 
      customersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all })
    },
  })
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof customersApi.update>[1] }) => 
      customersApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all })
    },
  })
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => customersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_KEYS.all })
    },
  })
}
