'use client'

import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Calendar, AlertTriangle, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api/client'

const fmt = (n: number) => '₦' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0 }).format(n)

export function TaxCalendarWidget() {
  const router = useRouter()
  const { data, isLoading } = useQuery({
    queryKey: ['tax-obligations'],
    queryFn: () => apiClient.get('/tax-calendar/obligations/').then(r => r.data),
    staleTime: 6 * 60 * 60 * 1000, // 6 hours
  })

  if (isLoading || !data) return null

  const urgent = data.obligations.filter((o: {days_until_due: number}) => o.days_until_due <= 14)

  return (
    <div style={{ background: '#fff', border: '1px solid #ede9de', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #ede9de', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} color="#c8952a" />
          <span style={{ fontFamily: "'Fraunces',serif", fontSize: 14, fontWeight: 600, color: '#0f0e0b' }}>Tax Obligations</span>
          {urgent.length > 0 && (
            <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>
              {urgent.length} due soon
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: '#9e9990' }}>
          Total est. {fmt(data.total_estimated_liability)}
        </div>
      </div>

      <div>
        {data.obligations.map((ob: {type: string; full_name: string; due_date: string; days_until_due: number; estimated_liability: number; firs_form: string; color: string; rate: string}, i: number) => {
          const isUrgent = ob.days_until_due <= 14
          const isOverdue = ob.days_until_due < 0
          return (
            <div key={ob.type} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              borderBottom: i < data.obligations.length - 1 ? '1px solid #f5f3ef' : 'none',
              background: isOverdue ? '#fef2f2' : isUrgent ? '#fffbeb' : '#fff',
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: ob.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: ob.color }}>{ob.type}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0f0e0b', marginBottom: 2 }}>{ob.full_name}</div>
                <div style={{ fontSize: 11, color: '#9e9990' }}>
                  Due {new Date(ob.due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  {isOverdue ? <span style={{ color: '#dc2626', fontWeight: 700 }}> — OVERDUE</span>
                   : isUrgent ? <span style={{ color: '#d97706', fontWeight: 700 }}> — {ob.days_until_due} days</span>
                   : <span> — {ob.days_until_due} days</span>}
                  · {ob.firs_form}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: isUrgent ? '#d97706' : '#0f0e0b' }}>~{fmt(ob.estimated_liability)}</div>
                <div style={{ fontSize: 11, color: '#9e9990' }}>{ob.rate}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '10px 20px', background: '#faf9f6', borderTop: '1px solid #f5f3ef' }}>
        <div style={{ fontSize: 10, color: '#9e9990', lineHeight: 1.5 }}>
          ⚠ Estimates only — consult your accountant for exact FIRS filings
        </div>
      </div>
    </div>
  )
}