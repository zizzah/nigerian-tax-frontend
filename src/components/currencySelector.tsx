'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api/client'

interface CurrencySelectorProps {
  value: string
  onChange: (currency: string) => void
  showRate?: boolean
}

const CURRENCIES = [
  { code: 'NGN', symbol: '₦', flag: '🇳🇬', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', flag: '🇬🇧', name: 'British Pound' },
  { code: 'EUR', symbol: '€', flag: '🇪🇺', name: 'Euro' },
]

export function CurrencySelector({ value, onChange, showRate = true }: CurrencySelectorProps) {
  const { data: fxData } = useQuery({
    queryKey: ['fx-rates'],
    queryFn: () => apiClient.get('/insights/fx-rates/').then(r => r.data),
    staleTime: 60 * 60 * 1000,
    enabled: value !== 'NGN',
  })

  const selected = CURRENCIES.find(c => c.code === value) || CURRENCIES[0]
  const rate = value !== 'NGN' && fxData?.rates?.[value]
    ? (1 / fxData.rates[value]).toFixed(2)
    : null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ padding: '9px 12px', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, color: '#0f0e0b', background: '#fff', cursor: 'pointer' }}>
        {CURRENCIES.map(c => (
          <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
        ))}
      </select>
      {showRate && rate && (
        <div style={{ fontSize: 11, color: '#9e9990', background: '#f0fdf4', padding: '4px 10px', borderRadius: 20, border: '1px solid #bbf7d0' }}>
          1 {value} ≈ ₦{rate}
        </div>
      )}
    </div>
  )
}