import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/lib/api/payment'

export const PAYMENT_KEYS = {
  all: ['payments'] as const,
  list: (params?: object) => [...PAYMENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PAYMENT_KEYS.all, 'detail', id] as const,
}

export function usePayments(params?: {
  skip?: number
  limit?: number
  invoice_id?: string
  start_date?: string
  end_date?: string
}) {
  return useQuery({
    queryKey: PAYMENT_KEYS.list(params),
    queryFn: async () => {
      const data = await paymentsApi.list(params)
      return data
    },
  })
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.detail(id),
    queryFn: async () => {
      const data = await paymentsApi.get(id)
      return data
    },
    enabled: !!id,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof paymentsApi.create>[0]) => 
      paymentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all })
    },
  })
}

export function useUpdatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof paymentsApi.update>[1] }) => 
      paymentsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all })
    },
  })
}
