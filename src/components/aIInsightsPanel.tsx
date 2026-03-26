'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Brain, X, RefreshCw, TrendingUp, AlertTriangle, AlertCircle, CheckCircle, Info, ArrowRight } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { useRouter } from 'next/navigation'

interface Insight {
  id: string
  insight_type: string
  severity: 'info' | 'warning' | 'critical' | 'positive'
  title: string
  body: string
  action_label: string | null
  action_url: string | null
  is_dismissed: boolean
  created_at: string
}

const SEVERITY_CONFIG = {
  critical: { bg: '#fef2f2', border: '#fecaca', icon: AlertCircle, iconColor: '#dc2626', badge: '#fee2e2', badgeText: '#dc2626', label: 'Action Required' },
  warning:  { bg: '#fffbeb', border: '#fde68a', icon: AlertTriangle, iconColor: '#d97706', badge: '#fef3c7', badgeText: '#92400e', label: 'Attention Needed' },
  positive: { bg: '#f0fdf4', border: '#bbf7d0', icon: CheckCircle, iconColor: '#16a34a', badge: '#dcfce7', badgeText: '#15803d', label: 'Good News' },
  info:     { bg: '#f8fafc', border: '#e2e8f0', icon: Info, iconColor: '#64748b', badge: '#f1f5f9', badgeText: '#475569', label: 'Insight' },
}

export function AIInsightsPanel() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: () => apiClient.get('/insights/').then(r => r.data as { insights: Insight[]; cached: boolean }),
    staleTime: 30 * 60 * 1000, // 30 min
  })

  const dismiss = useMutation({
    mutationFn: (id: string) => apiClient.post(`/insights/${id}/dismiss/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-insights'] }),
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await apiClient.get('/insights/?refresh=true')
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    } finally {
      setRefreshing(false)
    }
  }

  const insights = data?.insights?.filter(i => !i.is_dismissed) ?? []

  if (isLoading) return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede9de', padding: '20px 24px', marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9e9990', fontSize: 13 }}>
        <Brain size={16} style={{ animation: 'spin 2s linear infinite', color: '#c8952a' }} />
        AI is analyzing your business data…
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!insights.length) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Brain size={16} color="#c8952a" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f0e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI Insights
          </span>
          <span style={{ fontSize: 11, background: '#c8952a', color: '#fff', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
            {insights.length}
          </span>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9e9990', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
        {insights.map(insight => {
          const cfg = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.info
          const Icon = cfg.icon
          return (
            <div key={insight.id} style={{
              background: cfg.bg,
              border: `1px solid ${cfg.border}`,
              borderRadius: 12,
              padding: '16px 18px',
              position: 'relative',
              borderLeft: `4px solid ${cfg.iconColor}`,
            }}>
              <button
                onClick={() => dismiss.mutate(insight.id)}
                style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', padding: 2, borderRadius: 4, display: 'flex' }}
              >
                <X size={14} />
              </button>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.badge, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <Icon size={16} color={cfg.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: cfg.badgeText, background: cfg.badge, padding: '2px 7px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {cfg.label}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0e0b', marginBottom: 6, lineHeight: 1.4 }}>{insight.title}</div>
                  <div style={{ fontSize: 12.5, color: '#4b4843', lineHeight: 1.7, marginBottom: insight.action_label ? 12 : 0 }}>{insight.body}</div>
                  {insight.action_label && insight.action_url && (
                    <button
                      onClick={() => router.push(insight.action_url!)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, color: cfg.iconColor, background: 'none', border: `1px solid ${cfg.border}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}
                    >
                      {insight.action_label} <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}