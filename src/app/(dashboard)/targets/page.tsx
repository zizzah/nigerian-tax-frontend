'use client'

import { useState, useEffect, useCallback } from 'react'
import { Target, TrendingUp, TrendingDown, Minus, Brain,
         ChevronDown, Plus, Trash2, Loader2, RefreshCw,
         AlertTriangle, CheckCircle, Zap } from 'lucide-react'
import apiClient from '@/lib/api/client'

// ── Types ──────────────────────────────────────────────────────────────────

interface MonthPerf {
  month: number; label: string; target: number; actual: number
  pct: number; status: string; is_past: boolean; is_current: boolean
}

interface QuarterPerf {
  quarter: number; label: string; target: number; actual: number
  pct: number; status: string; is_past: boolean; is_current: boolean
}

interface Performance {
  year: number
  annual_target: number
  total_actual: number
  annual_pct: number
  annual_status: string
  gap: number
  projected: number
  months_elapsed: number
  run_rate_monthly: number
  pipeline: number
  top_customers: { name: string; amount: number }[]
  monthly: MonthPerf[]
  quarters: QuarterPerf[]
}

interface AIAdvice {
  headline: string
  overall_status: string
  gap_analysis: string
  customer_recommendations: string
  seasonal_insight: string
  pipeline_forecast: string
  top_3_actions: string[]
  confidence_score: number
}

interface TargetSummary { id: string; year: number; annual_target: number }

// ── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number) => {
  const abs = Math.abs(n || 0)
  if (abs >= 1_000_000_000) return `₦${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000)     return `₦${(abs / 1_000_000).toFixed(1)}M`
  return '₦' + new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(abs)
}

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`
  return fmt(n)
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string; icon: typeof CheckCircle }> = {
  exceeding: { color: '#059669', bg: '#d1fae5', label: 'Exceeding',  icon: Zap },
  on_track:  { color: '#2563eb', bg: '#dbeafe', label: 'On Track',   icon: CheckCircle },
  at_risk:   { color: '#d97706', bg: '#fef3c7', label: 'At Risk',    icon: AlertTriangle },
  behind:    { color: '#dc2626', bg: '#fee2e2', label: 'Behind',     icon: TrendingDown },
  future:    { color: '#9ca3af', bg: '#f3f4f6', label: 'Upcoming',   icon: Minus },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.future
  const Icon = cfg.icon
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 10px', borderRadius:20, fontSize:11, fontWeight:700,
      color: cfg.color, background: cfg.bg, textTransform:'uppercase',
      letterSpacing:'0.5px' }}>
      <Icon size={10} />{cfg.label}
    </span>
  )
}

function ProgressBar({ pct, status }: { pct: number; status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.future
  const w = Math.min(pct, 100)
  return (
    <div style={{ height:6, background:'#f3f4f6', borderRadius:4, overflow:'hidden' }}>
      <div style={{ height:'100%', width:`${w}%`, background: cfg.color,
        borderRadius:4, transition:'width 0.6s ease' }} />
    </div>
  )
}

function RadialProgress({ pct, status, size = 120 }: { pct: number; status: string; size?: number }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.future
  const r = (size - 16) / 2
  const circ = 2 * Math.PI * r
  const dash = Math.min(pct / 100, 1) * circ
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="#f3f4f6" strokeWidth={10} />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={cfg.color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition:'stroke-dasharray 0.8s ease' }} />
    </svg>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function TargetsPage() {
  const currentYear = new Date().getFullYear()
  const [targets,      setTargets]      = useState<TargetSummary[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const [perf,         setPerf]         = useState<Performance | null>(null)
  const [advice,       setAdvice]       = useState<AIAdvice | null>(null)
  const [loadingPerf,  setLoadingPerf]  = useState(false)
  const [loadingAI,    setLoadingAI]    = useState(false)
  const [showCreate,   setShowCreate]   = useState(false)
  const [creating,     setCreating]     = useState(false)
  const [deleting,     setDeleting]     = useState(false)
  const [newTarget,    setNewTarget]    = useState({ year: currentYear, annual_target: '' })
  const [error,        setError]        = useState<string | null>(null)
  const [tab,          setTab]          = useState<'overview' | 'monthly' | 'ai'>('overview')

  // Load target list
  const loadTargets = useCallback(async () => {
    try {
      const res = await apiClient.get('/targets/')
      setTargets(res.data as TargetSummary[])
    } catch { setError('Failed to load targets') }
  }, [])

  // Load performance for selected year
  const loadPerf = useCallback(async (year: number) => {
    setLoadingPerf(true)
    setPerf(null)
    setAdvice(null)
    try {
      const res = await apiClient.get(`/targets/${year}`)
      setPerf(res.data as Performance)
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response?.status
      if (status === 404) setPerf(null)
      else setError('Failed to load performance data')
    } finally { setLoadingPerf(false) }
  }, [])

  // Get AI advice
  const getAIAdvice = async () => {
    setLoadingAI(true)
    setAdvice(null)
    try {
      const res = await apiClient.post(`/targets/${selectedYear}/ai-advice`)
      setAdvice((res.data as { advice: AIAdvice }).advice)
      setTab('ai')
    } catch { setError('AI advisor unavailable. Try again.') }
    finally { setLoadingAI(false) }
  }

  // Create target
  const handleCreate = async () => {
    if (!newTarget.annual_target || Number(newTarget.annual_target) <= 0) {
      setError('Enter a valid target amount')
      return
    }
    setCreating(true)
    try {
      await apiClient.post('/targets/', {
        year: newTarget.year,
        annual_target: Number(newTarget.annual_target),
      })
      setShowCreate(false)
      setNewTarget({ year: currentYear, annual_target: '' })
      await loadTargets()
      setSelectedYear(newTarget.year)
      await loadPerf(newTarget.year)
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setError(detail ?? 'Failed to create target')
    } finally { setCreating(false) }
  }

  // Delete target
  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedYear} target? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await apiClient.delete(`/targets/${selectedYear}`)
      await loadTargets()
      setPerf(null)
      setAdvice(null)
    } catch { setError('Failed to delete target') }
    finally { setDeleting(false) }
  }

  useEffect(() => { loadTargets() }, [loadTargets])
  useEffect(() => {
    if (targets.some(t => t.year === selectedYear)) {
      loadPerf(selectedYear)
    } else {
      setPerf(null)
      setAdvice(null)
    }
  }, [selectedYear, targets, loadPerf])

  const hasTarget = targets.some(t => t.year === selectedYear)

  return (
    <>
      {/* Topbar — uses dashboard layout class for proper scroll behaviour */}
      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Target size={20} color="#c8952a" />
          <span className="topbar-title">Sales Targets</span>
        </div>
        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
          {/* Year selector */}
          <div style={{ position:'relative' }}>
            <select value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{ appearance:'none', padding:'7px 32px 7px 14px', borderRadius:8,
                border:'1px solid #ddd9cf', fontSize:14, fontWeight:600,
                color:'#0f0e0b', background:'#fff', cursor:'pointer' }}>
              {[currentYear + 1, currentYear, currentYear - 1, currentYear - 2]
                .map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown size={14} style={{ position:'absolute', right:10, top:'50%',
              transform:'translateY(-50%)', pointerEvents:'none', color:'#9e9990' }} />
          </div>

          {perf && (
            <button onClick={getAIAdvice} disabled={loadingAI}
              style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px',
                background: loadingAI ? '#e8e4da' : '#0f0e0b', color:'#fff',
                border:'none', borderRadius:8, fontSize:13, fontWeight:600,
                cursor: loadingAI ? 'not-allowed' : 'pointer' }}>
              {loadingAI
                ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Analysing…</>
                : <><Brain size={14} /> AI Advisor</>}
            </button>
          )}

          <button onClick={() => setShowCreate(true)}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px',
              background:'#c8952a', color:'#fff', border:'none', borderRadius:8,
              fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={14} /> Set Target
          </button>
        </div>
      </div>

      <div className="content">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

        {/* Error */}
        {error && (
          <div style={{ background:'#fee2e2', border:'1px solid #fca5a5', borderRadius:8,
            padding:'10px 16px', marginBottom:16, fontSize:13, color:'#dc2626',
            display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            {error}
            <button onClick={() => setError(null)}
              style={{ background:'none', border:'none', cursor:'pointer',
                color:'#dc2626', fontSize:18 }}>✕</button>
          </div>
        )}

        {/* Create target form */}
        {showCreate && (
          <div style={{ background:'#fff', borderRadius:12, padding:24,
            marginBottom:24, border:'1px solid #ede9de',
            boxShadow:'0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#0f0e0b',
              marginBottom:16 }}>Set Sales Target</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16,
              marginBottom:20 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#6b6560',
                  textTransform:'uppercase', letterSpacing:'0.4px',
                  display:'block', marginBottom:6 }}>Year</label>
                <select value={newTarget.year}
                  onChange={e => setNewTarget(f => ({ ...f, year: Number(e.target.value) }))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8,
                    border:'1px solid #ddd9cf', fontSize:14, color:'#0f0e0b' }}>
                  {[currentYear + 1, currentYear, currentYear - 1].map(y =>
                    <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:'#6b6560',
                  textTransform:'uppercase', letterSpacing:'0.4px',
                  display:'block', marginBottom:6 }}>Annual Target (₦)</label>
                <input type="number" placeholder="e.g. 12000000"
                  value={newTarget.annual_target}
                  onChange={e => setNewTarget(f => ({ ...f, annual_target: e.target.value }))}
                  style={{ width:'100%', padding:'10px 12px', borderRadius:8,
                    border:'1px solid #ddd9cf', fontSize:14, color:'#0f0e0b',
                    boxSizing:'border-box' as const }} />
              </div>
            </div>

            {newTarget.annual_target && Number(newTarget.annual_target) > 0 && (
              <div style={{ background:'#faf9f6', borderRadius:8, padding:'12px 16px',
                marginBottom:20, fontSize:13, color:'#6b6560' }}>
                <strong style={{ color:'#0f0e0b' }}>Auto-split preview</strong>
                {' '}— weighted Q3/Q4 heavy:
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',
                  gap:8, marginTop:8 }}>
                  {[
                    { q:'Q1 (Jan-Mar)', pct:20 },
                    { q:'Q2 (Apr-Jun)', pct:22 },
                    { q:'Q3 (Jul-Sep)', pct:25 },
                    { q:'Q4 (Oct-Dec)', pct:33 },
                  ].map(({ q, pct }) => (
                    <div key={q} style={{ background:'#fff', borderRadius:6,
                      padding:'8px 10px', border:'1px solid #ede9de' }}>
                      <div style={{ fontSize:11, color:'#9e9990', marginBottom:2 }}>{q}</div>
                      <div style={{ fontWeight:700, color:'#0f0e0b', fontSize:14 }}>
                        {fmtShort(Number(newTarget.annual_target) * pct / 100)}
                      </div>
                      <div style={{ fontSize:11, color:'#c8952a' }}>{pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleCreate} disabled={creating}
                style={{ padding:'10px 24px', background:'#c8952a', color:'#fff',
                  border:'none', borderRadius:8, fontSize:14, fontWeight:600,
                  cursor: creating ? 'not-allowed' : 'pointer',
                  opacity: creating ? 0.7 : 1 }}>
                {creating ? 'Saving…' : 'Save Target'}
              </button>
              <button onClick={() => setShowCreate(false)}
                style={{ padding:'10px 20px', background:'none', color:'#6b6560',
                  border:'1px solid #ddd9cf', borderRadius:8, fontSize:14,
                  cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* No target state */}
        {!hasTarget && !loadingPerf && (
          <div style={{ background:'#fff', borderRadius:12, padding:'60px 40px',
            textAlign:'center', border:'1px solid #ede9de' }}>
            <Target size={48} color="#ddd9cf" style={{ margin:'0 auto 16px',
              display:'block' }} />
            <div style={{ fontSize:20, fontWeight:700, color:'#0f0e0b',
              marginBottom:8 }}>No target set for {selectedYear}</div>
            <div style={{ fontSize:14, color:'#9e9990', marginBottom:24 }}>
              Set an annual sales target to track your progress and get AI-powered advice.
            </div>
            <button onClick={() => setShowCreate(true)}
              style={{ padding:'12px 28px', background:'#c8952a', color:'#fff',
                border:'none', borderRadius:8, fontSize:14, fontWeight:600,
                cursor:'pointer' }}>
              <Plus size={14} style={{ marginRight:6, verticalAlign:'middle' }} />
              Set {selectedYear} Target
            </button>
          </div>
        )}

        {loadingPerf && (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
            minHeight:300, gap:12, color:'#9e9990' }}>
            <Loader2 size={28} style={{ animation:'spin 1s linear infinite',
              color:'#c8952a' }} />
            Loading performance data…
          </div>
        )}

        {/* Performance dashboard */}
        {perf && !loadingPerf && (
          <>
            {/* Hero strip */}
            <div style={{ background:'#0f0e0b', borderRadius:16, padding:'28px 32px',
              marginBottom:24, display:'flex', alignItems:'center',
              gap:24, flexWrap:'wrap' as const,
              boxShadow:'0 8px 32px rgba(0,0,0,0.12)' }}>
              {/* Radial */}
              <div style={{ position:'relative', flexShrink:0 }}>
                <RadialProgress pct={perf.annual_pct}
                  status={perf.annual_status} size={130} />
                <div style={{ position:'absolute', inset:0, display:'flex',
                  flexDirection:'column', alignItems:'center',
                  justifyContent:'center' }}>
                  <div style={{ fontSize:22, fontWeight:800,
                    color: STATUS_CONFIG[perf.annual_status]?.color ?? '#fff' }}>
                    {perf.annual_pct}%
                  </div>
                  <div style={{ fontSize:10, color:'#9e9990',
                    textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    of target
                  </div>
                </div>
              </div>

              {/* Key numbers */}
              <div style={{ flex:1, minWidth:200 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10,
                  marginBottom:6 }}>
                  <StatusBadge status={perf.annual_status} />
                  <span style={{ color:'#9e9990', fontSize:13 }}>{perf.year}</span>
                </div>
                <div style={{ fontSize:32, fontWeight:800, color:'#fff',
                  lineHeight:1.1, marginBottom:4 }}>
                  {fmtShort(perf.total_actual)}
                  <span style={{ fontSize:16, fontWeight:400, color:'#9e9990',
                    marginLeft:8 }}>of {fmtShort(perf.annual_target)}</span>
                </div>
                <div style={{ fontSize:13, color: perf.gap > 0 ? '#ef4444' : '#10b981' }}>
                  {perf.gap > 0
                    ? `${fmtShort(perf.gap)} gap remaining`
                    : `${fmtShort(Math.abs(perf.gap))} ahead of target 🎉`}
                </div>
              </div>

              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))',
                gap:'16px 24px', minWidth:240 }}>
                {[
                  { label:'Monthly Run Rate', value: fmtShort(perf.run_rate_monthly) },
                  { label:'Projected Year-End', value: fmtShort(perf.projected) },
                  { label:'Pipeline', value: perf.pipeline > 0 ? fmtShort(perf.pipeline) : '₦0' },
                  { label:'Months Elapsed', value: `${perf.months_elapsed} / 12` },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize:11, color:'#9e9990', marginBottom:4,
                      textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>
                      {label}
                    </div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#fff', marginTop:2 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Delete */}
              <button onClick={handleDelete} disabled={deleting}
                style={{ marginLeft:'auto', alignSelf:'flex-start',
                  background:'rgba(255,255,255,0.08)', border:'none',
                  borderRadius:8, padding:'8px 10px', cursor:'pointer',
                  color:'#9e9990' }}>
                {deleting
                  ? <Loader2 size={16} style={{ animation:'spin 1s linear infinite' }} />
                  : <Trash2 size={16} />}
              </button>
            </div>

            {/* Quarter cards */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
              gap:12, marginBottom:24 }}>
              {perf.quarters.map(q => {
                const cfg = STATUS_CONFIG[q.status] ?? STATUS_CONFIG.future
                return (
                  <div key={q.quarter} style={{ background:'#fff', borderRadius:12,
                    padding:'16px 18px', border:'1px solid #ede9de',
                    borderTop:`3px solid ${cfg.color}` }}>
                    <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginBottom:10 }}>
                      <span style={{ fontWeight:700, fontSize:15,
                        color:'#0f0e0b' }}>{q.label}</span>
                      <StatusBadge status={q.status} />
                    </div>
                    <div style={{ fontSize:20, fontWeight:800, color:'#0f0e0b',
                      marginBottom:2 }}>{fmtShort(q.actual)}</div>
                    <div style={{ fontSize:12, color:'#9e9990',
                      marginBottom:10 }}>of {fmtShort(q.target)}</div>
                    <ProgressBar pct={q.pct} status={q.status} />
                    <div style={{ fontSize:12, fontWeight:600,
                      color: cfg.color, marginTop:6 }}>{q.pct}%</div>
                  </div>
                )
              })}
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:4, marginBottom:20,
              borderBottom:'1px solid #ede9de' }}>
              {([
                { key:'overview', label:'Monthly Breakdown' },
                { key:'monthly', label:'Top Customers' },
                { key:'ai', label:'AI Advisor' },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setTab(key)}
                  style={{ padding:'10px 18px', background:'none', border:'none',
                    borderBottom:`2px solid ${tab === key ? '#c8952a' : 'transparent'}`,
                    color: tab === key ? '#c8952a' : '#6b6560',
                    fontSize:13, fontWeight:600, cursor:'pointer',
                    marginBottom:-1 }}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Monthly breakdown */}
            {tab === 'overview' && (
              <div style={{ background:'#fff', borderRadius:12,
                border:'1px solid #ede9de', overflow:'hidden' }}>
                <table style={{ width:'100%', borderCollapse:'collapse',
                  fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'#faf9f6' }}>
                      {['Month','Target','Actual','Progress','Status'].map(h => (
                        <th key={h} style={{ padding:'12px 16px', textAlign:'left',
                          fontSize:11, fontWeight:700, color:'#9e9990',
                          textTransform:'uppercase', letterSpacing:'0.4px',
                          borderBottom:'1px solid #ede9de' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {perf.monthly.map((m, i) => (
                      <tr key={m.month}
                        style={{ background: m.is_current ? '#fffbf0' : 'transparent',
                          opacity: !m.is_past && !m.is_current ? 0.5 : 1 }}>
                        <td style={{ padding:'12px 16px', fontWeight: m.is_current ? 700 : 500,
                          color:'#0f0e0b', borderBottom:'1px solid #f5f3ef' }}>
                          {m.label}
                          {m.is_current && (
                            <span style={{ marginLeft:6, fontSize:10, background:'#fef3c7',
                              color:'#d97706', padding:'2px 6px', borderRadius:4,
                              fontWeight:700 }}>NOW</span>
                          )}
                        </td>
                        <td style={{ padding:'12px 16px', color:'#6b6560',
                          borderBottom:'1px solid #f5f3ef' }}>
                          {fmtShort(m.target)}
                        </td>
                        <td style={{ padding:'12px 16px', fontWeight:600,
                          color:'#0f0e0b', borderBottom:'1px solid #f5f3ef' }}>
                          {m.is_past || m.is_current ? fmtShort(m.actual) : '—'}
                        </td>
                        <td style={{ padding:'12px 16px', width:160,
                          borderBottom:'1px solid #f5f3ef' }}>
                          {(m.is_past || m.is_current) && (
                            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                              <div style={{ flex:1 }}>
                                <ProgressBar pct={m.pct} status={m.status} />
                              </div>
                              <span style={{ fontSize:11, fontWeight:600,
                                color: STATUS_CONFIG[m.status]?.color ?? '#9e9990',
                                minWidth:32 }}>{m.pct}%</span>
                            </div>
                          )}
                        </td>
                        <td style={{ padding:'12px 16px',
                          borderBottom:'1px solid #f5f3ef' }}>
                          {(m.is_past || m.is_current) && (
                            <StatusBadge status={m.status} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Top customers */}
            {tab === 'monthly' && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 }}>
                <div style={{ background:'#fff', borderRadius:12, padding:24,
                  border:'1px solid #ede9de' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0f0e0b',
                    marginBottom:16 }}>Top Customers by Revenue ({perf.year})</div>
                  {perf.top_customers.length === 0 ? (
                    <div style={{ color:'#9e9990', fontSize:13 }}>
                      No payment data yet for {perf.year}.
                    </div>
                  ) : (
                    perf.top_customers.map((c, i) => {
                      const pct = perf.total_actual > 0
                        ? Math.round(c.amount / perf.total_actual * 100) : 0
                      return (
                        <div key={i} style={{ marginBottom:16 }}>
                          <div style={{ display:'flex', justifyContent:'space-between',
                            marginBottom:4 }}>
                            <span style={{ fontSize:13, fontWeight:600,
                              color:'#0f0e0b' }}>{c.name}</span>
                            <span style={{ fontSize:13, color:'#c8952a',
                              fontWeight:700 }}>{fmtShort(c.amount)}</span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ flex:1, height:6, background:'#f3f4f6',
                              borderRadius:4, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct}%`,
                                background:'#c8952a', borderRadius:4 }} />
                            </div>
                            <span style={{ fontSize:11, color:'#9e9990',
                              minWidth:28 }}>{pct}%</span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <div style={{ background:'#fff', borderRadius:12, padding:24,
                  border:'1px solid #ede9de' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#0f0e0b',
                    marginBottom:16 }}>Revenue Summary</div>
                  {[
                    { label:'Annual Target',      value: fmt(perf.annual_target), color:'#0f0e0b' },
                    { label:'Collected So Far',   value: fmt(perf.total_actual),  color:'#059669' },
                    { label:'Gap to Target',      value: fmt(Math.max(perf.gap, 0)), color:'#dc2626' },
                    { label:'Unpaid Pipeline',    value: fmt(perf.pipeline),      color:'#d97706' },
                    { label:'Projected Year-End', value: fmt(perf.projected),     color:'#2563eb' },
                    { label:'Monthly Run Rate',   value: fmt(perf.run_rate_monthly), color:'#6b6560' },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ display:'flex', justifyContent:'space-between',
                      padding:'10px 0', borderBottom:'1px solid #f5f3ef' }}>
                      <span style={{ fontSize:13, color:'#6b6560' }}>{label}</span>
                      <span style={{ fontSize:13, fontWeight:700, color }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: AI Advisor */}
            {tab === 'ai' && (
              <div>
                {!advice && !loadingAI && (
                  <div style={{ background:'#fff', borderRadius:12, padding:'48px 32px',
                    textAlign:'center', border:'1px solid #ede9de' }}>
                    <Brain size={48} color="#c8952a" style={{ margin:'0 auto 16px',
                      display:'block' }} />
                    <div style={{ fontSize:18, fontWeight:700, color:'#0f0e0b',
                      marginBottom:8 }}>AI Sales Advisor</div>
                    <div style={{ fontSize:14, color:'#9e9990', marginBottom:24,
                      maxWidth:420, margin:'0 auto 24px' }}>
                      Get AI-powered analysis of your sales performance including gap analysis,
                      customer recommendations, seasonal patterns and pipeline forecast.
                    </div>
                    <button onClick={getAIAdvice}
                      style={{ padding:'12px 28px', background:'#0f0e0b', color:'#fff',
                        border:'none', borderRadius:8, fontSize:14, fontWeight:600,
                        cursor:'pointer' }}>
                      <Brain size={15} style={{ marginRight:8, verticalAlign:'middle' }} />
                      Analyse My Performance
                    </button>
                  </div>
                )}

                {loadingAI && (
                  <div style={{ background:'#fff', borderRadius:12, padding:'48px 32px',
                    textAlign:'center', border:'1px solid #ede9de' }}>
                    <Loader2 size={36} style={{ animation:'spin 1s linear infinite',
                      color:'#c8952a', margin:'0 auto 16px', display:'block' }} />
                    <div style={{ fontSize:14, color:'#9e9990' }}>
                      Analysing your sales data with AI…
                    </div>
                  </div>
                )}

                {advice && (
                  <div>
                    {/* Headline card */}
                    <div style={{ background:'#0f0e0b', borderRadius:12, padding:24,
                      marginBottom:16, display:'flex', alignItems:'center', gap:16 }}>
                      <Brain size={32} color="#c8952a" style={{ flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:16, fontWeight:700, color:'#fff',
                          marginBottom:4 }}>{advice.headline}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <StatusBadge status={advice.overall_status} />
                          <span style={{ fontSize:12, color:'#6b6560' }}>
                            Confidence: {advice.confidence_score}%
                          </span>
                        </div>
                      </div>
                      <button onClick={getAIAdvice} disabled={loadingAI}
                        style={{ background:'rgba(255,255,255,0.08)', border:'none',
                          borderRadius:8, padding:'8px', cursor:'pointer',
                          color:'#9e9990' }} title="Refresh analysis">
                        <RefreshCw size={15} />
                      </button>
                    </div>

                    {/* Insight cards */}
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',
                      gap:16, marginBottom:16 }}>
                      {[
                        { title:'Gap Analysis',     icon: TrendingUp,   body: advice.gap_analysis },
                        { title:'Customer Action',  icon: Target,       body: advice.customer_recommendations },
                        { title:'Seasonal Pattern', icon: TrendingDown, body: advice.seasonal_insight },
                        { title:'Pipeline Forecast',icon: Zap,          body: advice.pipeline_forecast },
                      ].map(({ title, icon: Icon, body }) => (
                        <div key={title} style={{ background:'#fff', borderRadius:12,
                          padding:24, border:'1px solid #ede9de',
                          borderLeft:'3px solid #c8952a' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8,
                            marginBottom:12 }}>
                            <div style={{ width:30, height:30, borderRadius:8,
                              background:'#faf9f6', display:'flex', alignItems:'center',
                              justifyContent:'center' }}>
                              <Icon size={15} color="#c8952a" />
                            </div>
                            <span style={{ fontSize:13, fontWeight:700,
                              color:'#0f0e0b' }}>{title}</span>
                          </div>
                          <p style={{ fontSize:14, color:'#2c2a24',
                            lineHeight:1.8, margin:0 }}>{body}</p>
                        </div>
                      ))}
                    </div>

                    {/* Top 3 actions */}
                    <div style={{ background:'#0f0e0b', borderRadius:12, padding:24,
                      border:'1px solid #ede9de' }}>
                      <div style={{ fontSize:14, fontWeight:700, color:'#fff',
                        marginBottom:20, display:'flex', alignItems:'center', gap:8 }}>
                        <Zap size={16} color="#c8952a" /> Top 3 Actions to Take Now
                      </div>
                      {advice.top_3_actions.map((action, i) => (
                        <div key={i} style={{ display:'flex', gap:14,
                          alignItems:'flex-start',
                          padding:'14px 0',
                          borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                          <div style={{ width:28, height:28, borderRadius:8,
                            background:'#c8952a', color:'#fff', fontSize:13,
                            fontWeight:800, display:'flex', alignItems:'center',
                            justifyContent:'center', flexShrink:0 }}>{i + 1}</div>
                          <p style={{ fontSize:14, color:'#e8e4da', lineHeight:1.7,
                            margin:0, paddingTop:3 }}>{action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>{/* end maxWidth wrapper */}
      </div>{/* end content */}

      <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box }
        .topbar { height:auto; min-height:60px; background:#fff; border-bottom:1px solid #ede9de;
          padding:0 20px; display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:8px }
        .topbar-title { font-size:18px; font-weight:700; color:#0f0e0b }
        .content { flex:1; overflow-y:auto; padding:24px; background:#f7f6f2 }
        @media(max-width:768px){
          .content { padding:12px }
          .topbar { padding:10px 14px; min-height:52px }
        }
      `}</style>
    </>
  )
}