'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Circle, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useOnboarding } from '@/lib/hooks/useOnboarding'

export function OnboardingChecklist() {
  const router = useRouter()
  const { steps, completedCount, isFullyComplete, progressPct, totalSteps } = useOnboarding()
  const [expanded, setExpanded] = useState(true)
  const [dismissed, setDismissed] = useState(false)

  if (isFullyComplete || dismissed) return null

  return (
    <div style={{ background: 'linear-gradient(135deg, #0f0e0b, #1a1610)', borderRadius: 14, marginBottom: 24, overflow: 'hidden', border: '1px solid #2a2520' }}>
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
              Get started with TaxFlow NG 🚀
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
              {completedCount} of {totalSteps} steps complete
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Progress bar */}
          <div style={{ width: 80, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: '#c8952a', borderRadius: 3, transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 12, color: '#c8952a', fontWeight: 700 }}>{progressPct}%</span>
          {expanded ? <ChevronUp size={16} color="rgba(255,255,255,0.5)" /> : <ChevronDown size={16} color="rgba(255,255,255,0.5)" />}
          <button onClick={e => { e.stopPropagation(); setDismissed(true) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 2, display: 'flex' }}>
            <X size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
          {steps.map(step => (
            <div key={step.id}
              onClick={() => !step.completed && router.push(step.href)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                background: step.completed ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: 10, cursor: step.completed ? 'default' : 'pointer',
                border: `1px solid ${step.completed ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'background 0.15s',
              }}>
              <div style={{ fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: step.completed ? '#34d399' : '#fff', marginBottom: 1 }}>{step.label}</div>
                {!step.completed && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{step.cta} →</div>}
              </div>
              {step.completed
                ? <CheckCircle size={16} color="#34d399" style={{ flexShrink: 0 }} />
                : <Circle size={16} color="rgba(255,255,255,0.2)" style={{ flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}