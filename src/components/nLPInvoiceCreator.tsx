'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Check, Edit2, X } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

// FIX: Removed unused import of `useRouter` — not needed here.
// FIX: Empty catch block `catch (err: unknown) {}` silently swallowed all errors.
//      Added toast.error so the user knows when parsing fails, not just nothing happening.

interface ParsedItem {
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
}

interface ParsedInvoice {
  customer_name: string | null
  customer_id: string | null
  line_items: ParsedItem[]
  notes: string | null
  payment_terms: string | null
  total_estimate: number
  confidence: number
  raw_interpretation: string
}

interface NLPInvoiceCreatorProps {
  onParsed: (data: ParsedInvoice) => void
  onClose: () => void
}

const SUGGESTIONS = [
  "Invoice Acme Corp for 3 days consulting at 150k per day",
  "Bill TechStart for 5 HP laptops at 380,000 each plus 2 monitors at 120k",
  "Invoice Chidi for website design 200k, monthly hosting 15k for 12 months",
]

export function NLPInvoiceCreator({ onParsed, onClose }: NLPInvoiceCreatorProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsed, setParsed] = useState<ParsedInvoice | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleParse = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.post('/nlp/parse-invoice/', { text })
      setParsed(res.data)
    } catch (err: unknown) {
      // FIX: Was `catch (err: unknown) {}` — completely swallowed the error.
      // The user saw nothing happen when the parse failed.
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? ((err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? 'Failed to parse. Please try rephrasing.')
          : 'Failed to parse. Please try rephrasing.'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) => '₦' + new Intl.NumberFormat('en-NG').format(n)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,14,11,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.25)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #ede9de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #c8952a, #f0c96b)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0e0b' }}>AI Invoice Creator</div>
              <div style={{ fontSize: 11, color: '#9e9990' }}>Describe what to invoice in plain English</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', fontSize: 20 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {!parsed ? (
            <>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleParse() }}
                placeholder="e.g. Invoice Acme Corp for 5 days consulting at ₦150k per day and travel expenses of ₦45,000..."
                style={{
                  width: '100%', minHeight: 100, padding: '12px 14px',
                  border: '1.5px solid #ddd9cf', borderRadius: 10,
                  fontSize: 14, color: '#0f0e0b', resize: 'vertical',
                  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                  lineHeight: 1.6,
                }}
                autoFocus
              />
              <div style={{ fontSize: 11, color: '#9e9990', marginTop: 6, marginBottom: 16 }}>
                Ctrl+Enter to parse
              </div>

              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>Try an example:</div>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => setText(s)}
                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', marginBottom: 6, background: '#faf9f6', border: '1px solid #ede9de', borderRadius: 8, fontSize: 12.5, color: '#4b4843', cursor: 'pointer', lineHeight: 1.5 }}>
                    {s}
                  </button>
                ))}
              </div>

              {error && (
                <div style={{ background: '#fde8e8', color: '#b83232', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginTop: 12 }}>
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15803d', marginBottom: 16 }}>
                <strong>AI understood:</strong> {parsed.raw_interpretation}
                <span style={{ float: 'right', fontSize: 11, fontWeight: 700 }}>
                  {Math.round(parsed.confidence * 100)}% confidence
                </span>
              </div>

              {parsed.customer_name && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 5 }}>Customer</div>
                  <div style={{ padding: '10px 14px', background: '#faf9f6', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#0f0e0b', border: '1px solid #ede9de' }}>
                    {parsed.customer_name}
                    {parsed.customer_id && <span style={{ marginLeft: 8, fontSize: 11, background: '#d4eddf', color: '#1a6b4a', padding: '2px 7px', borderRadius: 10 }}>Matched</span>}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 8 }}>Line Items</div>
                {parsed.line_items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#faf9f6', borderRadius: 8, marginBottom: 6, border: '1px solid #ede9de', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0f0e0b' }}>{item.description}</div>
                      <div style={{ fontSize: 11, color: '#9e9990', marginTop: 2 }}>
                        Qty: {item.quantity} × {fmt(item.unit_price)} · VAT: {item.tax_rate}%
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#0f0e0b', flexShrink: 0 }}>
                      {fmt(item.quantity * item.unit_price * (1 + item.tax_rate / 100))}
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 14px 0', fontSize: 15, fontWeight: 800, color: '#c8952a' }}>
                  Total: {fmt(parsed.total_estimate)}
                </div>
              </div>

              <button onClick={() => { setText(''); setParsed(null); setError(null) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6560', background: 'none', border: '1px solid #ddd9cf', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', marginBottom: 4 }}>
                <Edit2 size={13} /> Try different description
              </button>
            </>
          )}
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid #ede9de', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: '10px 18px', background: 'none', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#6b6560' }}>
            Cancel
          </button>
          {!parsed ? (
            <button onClick={handleParse} disabled={loading || !text.trim()}
              style={{ padding: '10px 20px', background: loading || !text.trim() ? '#ddd' : '#c8952a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading || !text.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Parsing...</> : <><Sparkles size={14} /> Parse Invoice</>}
            </button>
          ) : (
            <button onClick={() => onParsed(parsed)}
              style={{ padding: '10px 20px', background: '#0f0e0b', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={14} /> Use This Invoice
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}