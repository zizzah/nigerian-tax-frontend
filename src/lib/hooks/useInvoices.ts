import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/lib/api/invoice'
import type { InvoiceCreate, InvoiceUpdate, InvoiceStatsOverview } from '@/lib/types'

export const INVOICE_KEYS = {
  all: ['invoices'] as const,
  list: (params?: object) => [...INVOICE_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...INVOICE_KEYS.all, 'detail', id] as const,
  stats: ['invoices', 'stats'] as const,
}

export function useInvoices(params?: {
  skip?: number
  limit?: number
  status?: string
  payment_status?: string
  customer_id?: string
  start_date?: string
  end_date?: string
}) {
  return useQuery({
    queryKey: INVOICE_KEYS.list(params),
    queryFn: () => invoicesApi.list(params),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn: () => invoicesApi.get(id),
    enabled: !!id,
  })
}

export function useInvoiceStats(params?: {
  start_date?: string
  end_date?: string
}) {
  return useQuery<InvoiceStatsOverview>({
    queryKey: [...INVOICE_KEYS.stats, params],
    queryFn: () => invoicesApi.getStats(params),
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InvoiceCreate) => invoicesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdate }) =>
      invoicesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

export function useFinalizeInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoicesApi.finalize(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      invoicesApi.cancel(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}