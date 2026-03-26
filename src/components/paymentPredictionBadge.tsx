'use client'

import { useQuery } from '@tanstack/react-query'
import { Clock, TrendingDown } from 'lucide-react'
import apiClient from '@/lib/api/client'

export function PaymentPredictionBadge({ invoiceId, status }: { invoiceId: string; status: string }) {
  const canPredict = ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(status)

  const { data } = useQuery({
    queryKey: ['payment-prediction', invoiceId],
    queryFn: () => apiClient.get(`/insights/payment-prediction/${invoiceId}/`).then(r => r.data),
    enabled: canPredict,
    staleTime: 60 * 60 * 1000,
  })

  if (!canPredict || !data?.has_prediction) return null

  const isLate = data.is_likely_late
  const color = isLate ? '#dc2626' : '#2563eb'
  const bg = isLate ? '#fee2e2' : '#dbeafe'
  const border = isLate ? '#fca5a5' : '#93c5fd'

  const dateStr = data.predicted_date
    ? new Date(data.predicted_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: bg, border: `1px solid ${border}`, borderRadius: 20, fontSize: 11, color, fontWeight: 600 }}>
      {isLate ? <TrendingDown size={11} /> : <Clock size={11} />}
      {isLate ? 'Payment overdue — chase now' : `Expected ~${dateStr}`}
      <span style={{ opacity: 0.7, fontWeight: 400 }}>({Math.round(data.confidence * 100)}%)</span>
    </div>
  )
}