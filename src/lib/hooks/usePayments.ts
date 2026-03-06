import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/lib/api/payment'
import type { PaymentCreate, PaymentUpdate } from '@/lib/types'
import { INVOICE_KEYS } from './useInvoices'

export const PAYMENT_KEYS = {
  all:    ['payments'] as const,
  list:   (params?: object) => [...PAYMENT_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PAYMENT_KEYS.all, 'detail', id] as const,
}

export function usePayments(params?: {
  invoice_id?: string
  customer_id?: string
  from_date?: string
  to_date?: string
}) {
  return useQuery({
    queryKey: PAYMENT_KEYS.list(params),
    queryFn:  () => paymentsApi.list(params),
    enabled:  !!params?.invoice_id || !params?.invoice_id,
  })
}

export function useInvoicePayments(invoiceId: string) {
  return useQuery({
    queryKey: PAYMENT_KEYS.list({ invoice_id: invoiceId }),
    queryFn:  () => paymentsApi.list({ invoice_id: invoiceId }),
    enabled:  !!invoiceId,
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PaymentCreate) => paymentsApi.create(payload),
    onSuccess: (_, payload) => {
      // Invalidate the invoice so paid_amount / status refresh
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(String(payload.invoice_id)) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all })
    },
  })
}

export function useDeletePayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => paymentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PAYMENT_KEYS.all })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}