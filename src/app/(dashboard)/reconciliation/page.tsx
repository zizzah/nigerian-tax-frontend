'use client'

import { useState } from 'react'
import { Upload, CheckCircle, XCircle, Loader2, AlertTriangle, Check } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

interface MatchResult {
  transaction: { date: string; description: string; amount: number; reference: string | null }
  matched: boolean
  confidence: number
  invoice_id: string | null
  invoice_number: string | null
  customer_name: string | null
  invoice_amount: number | null
}

interface ReconciliationResult {
  filename: string
  total_transactions: number
  matched_count: number
  unmatched_count: number
  total_credit_amount: number
  matches: MatchResult[]
}

const fmt = (n: number) => '₦' + new Intl.NumberFormat('en-NG').format(n)

export default function ReconciliationPage() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<ReconciliationResult | null>(null)
  const [selectedMatches, setSelectedMatches] = useState<Set<number>>(new Set())
  const [applying, setApplying] = useState(false)
  const [bankName, setBankName] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    setUploading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bank_name', bankName)
      const res = await apiClient.post('/reconciliation/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      // Auto-select high-confidence matches
      const autoSelect = new Set<number>()
      res.data.matches.forEach((m: MatchResult, i: number) => {
        if (m.matched && m.confidence >= 60) autoSelect.add(i)
      })
      setSelectedMatches(autoSelect)
      toast.success(`Found ${res.data.matched_count} potential matches`)
    } catch (err: unknown) {
      toast.error('Failed to process statement')
    } finally {
      setUploading(false)
    }
  }

  const handleApply = async () => {
    if (!result) return
    setApplying(true)
    try {
      const toApply = result.matches.filter((_, i) => selectedMatches.has(i) && result.matches[i].matched)
      const res = await apiClient.post('/reconciliation/apply/', { matches: toApply })
      toast.success(`${res.data.applied_count} invoices marked as paid!`)
      setResult(null)
      setSelectedMatches(new Set())
    } catch {
      toast.error('Failed to apply reconciliation')
    } finally {
      setApplying(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Bank Reconciliation</div>
      </div>
      <div className="content">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, fontWeight: 700, color: '#0f0e0b', marginBottom: 4 }}>Bank Statement Reconciliation</h1>
            <p style={{ fontSize: 13, color: '#9e9990' }}>Upload your bank statement — AI will match credits to your outstanding invoices automatically.</p>
          </div>

          {!result && (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede9de', padding: 24, marginBottom: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 8 }}>Bank Name (optional)</label>
                <input value={bankName} onChange={e => setBankName(e.target.value)}
                  placeholder="e.g. GTBank, Zenith, Access"
                  style={{ padding: '9px 12px', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, width: 250 }} />
              </div>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                style={{
                  border: `2px dashed ${dragOver ? '#c8952a' : '#ddd9cf'}`,
                  borderRadius: 12, padding: '48px 24px', textAlign: 'center',
                  background: dragOver ? '#fffbf0' : '#faf9f6', cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {uploading ? (
                  <><Loader2 size={36} color="#c8952a" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', display: 'block' }} /><div style={{ fontSize: 14, color: '#9e9990' }}>Analyzing statement with AI...</div></>
                ) : (
                  <>
                    <Upload size={36} color="#9e9990" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#0f0e0b', marginBottom: 6 }}>Drop your bank statement here</div>
                    <div style={{ fontSize: 13, color: '#9e9990', marginBottom: 16 }}>CSV, TXT, or PDF · GTBank, Zenith, Access, UBA, and more</div>
                    <label style={{ padding: '10px 20px', background: '#c8952a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      Browse Files
                      <input type="file" accept=".csv,.txt,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                    </label>
                  </>
                )}
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Credits', val: fmt(result.total_credit_amount), color: '#059669' },
                  { label: 'Auto-Matched', val: `${result.matched_count} invoices`, color: '#2563eb' },
                  { label: 'Unmatched', val: `${result.unmatched_count} transactions`, color: '#d97706' },
                  { label: 'Selected', val: `${selectedMatches.size} to apply`, color: '#c8952a' },
                ].map(k => (
                  <div key={k.label} style={{ background: '#fff', borderRadius: 10, padding: '14px 16px', border: '1px solid #ede9de' }}>
                    <div style={{ fontSize: 11, color: '#9e9990', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>{k.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: k.color }}>{k.val}</div>
                  </div>
                ))}
              </div>

              {/* Matches table */}
              <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede9de', overflow: 'hidden', marginBottom: 16 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#faf9f6' }}>
                      {['', 'Date', 'Description', 'Credit Amount', 'Matched Invoice', 'Confidence'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #ede9de' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.matches.map((match, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f5f3ef', background: selectedMatches.has(i) ? '#fffbf0' : '#fff' }}>
                        <td style={{ padding: '11px 14px' }}>
                          {match.matched && (
                            <input type="checkbox" checked={selectedMatches.has(i)}
                              onChange={() => {
                                const next = new Set(selectedMatches)
                                next.has(i) ? next.delete(i) : next.add(i)
                                setSelectedMatches(next)
                              }} style={{ width: 15, height: 15, accentColor: '#c8952a' }} />
                          )}
                        </td>
                        <td style={{ padding: '11px 14px', color: '#6b6560', whiteSpace: 'nowrap' }}>{match.transaction.date}</td>
                        <td style={{ padding: '11px 14px', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5 }}>{match.transaction.description}</div>
                        </td>
                        <td style={{ padding: '11px 14px', fontWeight: 600, color: '#059669', whiteSpace: 'nowrap' }}>{fmt(match.transaction.amount)}</td>
                        <td style={{ padding: '11px 14px' }}>
                          {match.matched ? (
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 12.5 }}>{match.invoice_number}</div>
                              <div style={{ fontSize: 11, color: '#9e9990' }}>{match.customer_name} · {match.invoice_amount ? fmt(match.invoice_amount) : ''}</div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 11, color: '#9e9990', fontStyle: 'italic' }}>No match found</span>
                          )}
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {match.matched && (
                            <span style={{
                              fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                              background: match.confidence >= 80 ? '#d1fae5' : match.confidence >= 50 ? '#fef3c7' : '#fee2e2',
                              color: match.confidence >= 80 ? '#059669' : match.confidence >= 50 ? '#92400e' : '#dc2626',
                            }}>
                              {match.confidence}%
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setResult(null)} style={{ padding: '10px 18px', background: 'none', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#6b6560' }}>
                  Upload Different File
                </button>
                <button onClick={handleApply} disabled={applying || selectedMatches.size === 0}
                  style={{ padding: '10px 20px', background: selectedMatches.size === 0 ? '#ddd' : '#0f0e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: selectedMatches.size === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {applying ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Applying...</> : <><Check size={14} /> Apply {selectedMatches.size} Matches</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .content{flex:1;overflow-y:auto;padding:28px}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>
    </>
  )
}