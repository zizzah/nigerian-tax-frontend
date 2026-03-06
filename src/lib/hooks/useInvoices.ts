import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { invoicesApi } from '@/lib/api/invoice'
import type { InvoiceCreate, InvoiceUpdate, InvoiceStats } from '@/lib/types'

export const INVOICE_KEYS = {
  all:    ['invoices'] as const,
  list:   (params?: object) => [...INVOICE_KEYS.all, 'list', params] as const,
  detail: (id: string)      => [...INVOICE_KEYS.all, 'detail', id]  as const,
  stats:  ['invoices', 'stats'] as const,
}

export function useInvoices(params?: {
  page?:        number
  page_size?:   number
  status?:      string
  customer_id?: string
  from_date?:   string
  to_date?:     string
}) {
  return useQuery({
    queryKey: INVOICE_KEYS.list(params),
    queryFn:  () => invoicesApi.list(params),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: INVOICE_KEYS.detail(id),
    queryFn:  () => invoicesApi.get(id),
    enabled:  !!id,
  })
}

export function useInvoiceStats(params?: { from_date?: string; to_date?: string }) {
  return useQuery<InvoiceStats>({
    queryKey: [...INVOICE_KEYS.stats, params],
    queryFn:  () => invoicesApi.getStats({
      start_date: params?.from_date,
      end_date:   params?.to_date,
    }),
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InvoiceCreate) => invoicesApi.create(payload),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all }) },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: InvoiceUpdate }) => invoicesApi.update(id, data),
    onSuccess:  (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

export function useFinalizeInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoicesApi.finalize(id),
    onSuccess:  (_, id) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => invoicesApi.cancel(id, reason),
    onSuccess:  (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

// ── Delete invoice (draft only) ───────────────────────────────────────────────
export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoicesApi.delete(id),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all }) },
  })
}

// ── Send invoice by email ─────────────────────────────────────────────────────
export function useSendInvoiceEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, message, cc }: { id: string; message?: string; cc?: string }) =>
      invoicesApi.sendEmail(id, { message, cc }),
    onSuccess:  (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all })
    },
  })
}

// ── Duplicate invoice ─────────────────────────────────────────────────────────
export function useDuplicateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => invoicesApi.duplicate(id),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: INVOICE_KEYS.all }) },
  })
}