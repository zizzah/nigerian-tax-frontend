'use client'

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'

interface Factor {
  label: string
  score: number
  max: number
}

interface CreditScoreData {
  score: number | null
  grade: string
  color: string
  avg_payment_days: number | null
  total_invoices: number
  paid_invoices: number
  overdue_invoices: number
  overdue_amount: number
  factors: Record<string, Factor>
  reason?: string
}

export function CreditScoreWidget({ customerId }: { customerId: string }) {
  const { data, isLoading } = useQuery<CreditScoreData>({
    queryKey: ['credit-score', customerId],
    queryFn: () =>
      apiClient.get(`/customers/${customerId}/credit-score/`).then(r => r.data),
    staleTime: 60 * 60 * 1000,
    enabled: !!customerId,
  })

  if (isLoading) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #ede9de',
          padding: '18px 20px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      >
        <div
          style={{
            height: 14,
            width: 80,
            background: '#f0ede6',
            borderRadius: 4,
            marginBottom: 12,
          }}
        />
        <div
          style={{
            height: 100,
            background: '#f0ede6',
            borderRadius: 8,
          }}
        />
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    )
  }

  if (!data || data.score === null) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #ede9de',
          padding: '18px 20px',
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#9e9990',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: 10,
          }}
        >
          Credit Score
        </div>
        <div style={{ fontSize: 13, color: '#9e9990', fontStyle: 'italic' }}>
          {data?.reason ?? 'No invoice history yet'}
        </div>
      </div>
    )
  }

  const { score, grade, color, factors, avg_payment_days } = data
  const circumference = 2 * Math.PI * 40
  const dash = (score / 100) * circumference

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #ede9de',
        padding: '18px 20px',
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#9e9990',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginBottom: 14,
        }}
      >
        Credit Score
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Radial gauge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg
            width={100}
            height={100}
            style={{ transform: 'rotate(-90deg)' }}
          >
            <circle
              cx={50}
              cy={50}
              r={40}
              fill="none"
              stroke="#f3f4f6"
              strokeWidth={10}
            />
            <circle
              cx={50}
              cy={50}
              r={40}
              fill="none"
              stroke={color}
              strokeWidth={10}
              strokeDasharray={`${dash} ${circumference}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 900,
                color,
                lineHeight: 1,
              }}
            >
              {grade}
            </div>
            <div style={{ fontSize: 11, color: '#9e9990', marginTop: 2 }}>
              {score}/100
            </div>
          </div>
        </div>

        {/* Factor bars */}
        <div style={{ flex: 1 }}>
          {Object.values(factors).map((f) => {
            const pct = (f.score / f.max) * 100
            const barColor =
              pct >= 70 ? '#059669' : pct >= 40 ? '#d97706' : '#dc2626'
            return (
              <div key={f.label} style={{ marginBottom: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ color: '#4b4843' }}>{f.label}</span>
                  <span style={{ color: '#9e9990' }}>
                    {f.score}/{f.max}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: '#f3f4f6',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: barColor,
                      borderRadius: 2,
                      transition: 'width 0.6s ease',
                    }}
                  />
                </div>
              </div>
            )
          })}

          {avg_payment_days !== null && avg_payment_days !== undefined && (
            <div style={{ fontSize: 11, color: '#9e9990', marginTop: 6 }}>
              Avg. payment:{' '}
              <strong style={{ color: '#0f0e0b' }}>
                {avg_payment_days} days
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 14,
          paddingTop: 12,
          borderTop: '1px solid #f0ede6',
          flexWrap: 'wrap',
        }}
      >
        {[
          { label: 'Total Invoices', val: data.total_invoices },
          { label: 'Paid', val: data.paid_invoices, color: '#059669' },
          { label: 'Overdue', val: data.overdue_invoices, color: '#dc2626' },
        ].map(k => (
          <div key={k.label}>
            <div style={{ fontSize: 10, color: '#9e9990', marginBottom: 2 }}>
              {k.label}
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: k.color ?? '#0f0e0b',
              }}
            >
              {k.val}
            </div>
          </div>
        ))}
        {data.overdue_amount > 0 && (
          <div>
            <div style={{ fontSize: 10, color: '#9e9990', marginBottom: 2 }}>
              Overdue Amount
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>
              ₦
              {new Intl.NumberFormat('en-NG').format(
                Math.round(data.overdue_amount)
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}