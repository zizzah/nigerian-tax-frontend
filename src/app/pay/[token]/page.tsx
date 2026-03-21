'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, AlertCircle, Shield, CreditCard } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL.replace('/api/v1', '')
  : 'https://nigerian-tax-compliance-backend.onrender.com'

interface PaystackResponse { status: string; reference: string; message: string }
interface PaystackHandler  { openIframe: () => void }
interface PaystackSetupOpts {
  key: string; email: string; amount: number; ref: string; currency: string
  metadata: Record<string, string>; onClose: () => void; callback: (r: PaystackResponse) => void
}
interface PaystackPopType { setup: (opts: PaystackSetupOpts) => PaystackHandler }
declare global { interface Window { PaystackPop?: PaystackPopType } }

type InvoiceItem = { description: string; quantity: string; unit_price: string; line_total: string; tax_rate: string }
type PaymentData = {
  status: 'pending' | 'already_paid' | 'cancelled'; token: string; paystack_key: string | null
  invoice: { id: string; number: string; issue_date: string; due_date: string; total_amount: string; paid_amount: string; outstanding: string; status: string; notes: string | null; items: InvoiceItem[] }
  business: { name: string; email: string; phone: string; address: string; city: string; primary_color: string; logo_url: string }
  customer: { name: string; email: string }
}

const fmt = (n: string | number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(n) || 0)
const fmtDate = (d: string) => { try { return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return d } }

function usePaystack() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const existing = document.getElementById('paystack-js')
    if (existing) { const t = setTimeout(() => setReady(true), 0); return () => clearTimeout(t) }
    const s = document.createElement('script')
    s.id = 'paystack-js'; s.src = 'https://js.paystack.co/v1/inline.js'; s.async = true
    s.onload = () => setReady(true)
    document.head.appendChild(s)
  }, [])
  return ready
}

// ── Inner component that uses useParams ───────────────────────────────────────
function PayPageInner() {
  const params = useParams()
  const token = params?.token as string
  const [data, setData]     = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid]     = useState(false)
  const paystackReady = usePaystack()

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/v1/paystack/pay/${token}`)
      .then(r => r.json()).then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Could not load invoice. Please try again.'); setLoading(false) })
  }, [token])

  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const ref = p.get('reference') || p.get('trxref')
    if (ref) { fetch(`${API}/api/v1/paystack/verify/${ref}`).catch(() => {}); setPaid(true) }
  }, [])

  const handlePay = useCallback(async () => {
    if (!data || !paystackReady) return
    setPaying(true); setError(null)
    try {
      const res = await fetch(`${API}/api/v1/paystack/pay/${token}/initiate`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.detail || 'Payment initiation failed')
      if (data.paystack_key && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key: data.paystack_key, email: data.customer.email,
          amount: Math.round(Number(data.invoice.outstanding) * 100),
          ref: json.reference, currency: 'NGN',
          metadata: { invoice_number: String(data.invoice.number ?? ''), customer_name: String(data.customer.name ?? '') },
          onClose: () => setPaying(false),
          callback: (response: PaystackResponse) => {
            if (response.status === 'success') { fetch(`${API}/api/v1/paystack/verify/${response.reference}`).catch(() => {}); setPaid(true) }
            else { setPaying(false) }
          },
        })
        handler.openIframe()
      } else { window.location.href = json.payment_url }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setPaying(false)
    }
  }, [data, token, paystackReady])

  const gold = data?.business?.primary_color || '#c8952a'
  const biz  = data?.business; const inv = data?.invoice; const cust = data?.customer

  if (loading) return (
    <div style={S.shell}>
      <div style={S.card}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 16, color: '#6b6560' }}>
          <Loader2 size={36} style={{ animation: 'spin 1s linear infinite', color: gold }} />
          <p style={{ fontSize: 14 }}>Loading invoice…</p>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (data?.status === 'already_paid' || paid) return (
    <div style={S.shell}>
      <div style={{ ...S.card, textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#d4eddf', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} color="#1a6b4a" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0f0e0b', marginBottom: 8 }}>Payment Received!</h2>
        <p style={{ color: '#6b6560', fontSize: 14 }}>{inv ? `Invoice ${inv.number} has been paid. Thank you!` : 'Thank you for your payment.'}</p>
        {biz?.name && <p style={{ marginTop: 20, fontSize: 13, color: '#9e9990' }}>{biz.name}{biz.email ? ` · ${biz.email}` : ''}</p>}
      </div>
    </div>
  )

  if (data?.status === 'cancelled') return (
    <div style={S.shell}>
      <div style={{ ...S.card, textAlign: 'center', padding: '60px 24px' }}>
        <XCircle size={48} color="#b83232" style={{ margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f0e0b', marginBottom: 8 }}>Invoice Cancelled</h2>
        <p style={{ color: '#6b6560', fontSize: 14 }}>This invoice has been cancelled. Please contact {biz?.name || 'the business'} for details.</p>
      </div>
    </div>
  )

  if (error && !data) return (
    <div style={S.shell}>
      <div style={{ ...S.card, textAlign: 'center', padding: '60px 24px' }}>
        <AlertCircle size={48} color="#b83232" style={{ margin: '0 auto 16px', display: 'block' }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f0e0b', marginBottom: 8 }}>Link Not Found</h2>
        <p style={{ color: '#6b6560', fontSize: 14 }}>{error}</p>
      </div>
    </div>
  )

  if (!data || !inv || !biz) return null

  return (
    <div style={S.shell}>
      <div style={{ background: gold, padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderRadius: '12px 12px 0 0',
        width: '100%', maxWidth: 540, boxSizing: 'border-box' as const }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {biz.logo_url && <img src={biz.logo_url} alt={biz.name} style={{ height: 30, width: 30, objectFit: 'contain', borderRadius: 6, background: 'rgba(255,255,255,0.2)', padding: 2 }} />}
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{biz.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.85)', fontSize: 11 }}>
          <Shield size={12} />Secured by Paystack
        </div>
      </div>

      <div style={S.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: '#9e9990', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Invoice</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#0f0e0b' }}>#{inv.number}</div>
            <div style={{ fontSize: 12, color: '#6b6560', marginTop: 3 }}>Due {fmtDate(inv.due_date)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#9e9990', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>Amount Due</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: gold }}>{fmt(inv.outstanding)}</div>
            {Number(inv.paid_amount) > 0 && <div style={{ fontSize: 11, color: '#6b6560', marginTop: 2 }}>{fmt(inv.paid_amount)} paid · Total {fmt(inv.total_amount)}</div>}
          </div>
        </div>

        <div style={{ background: '#faf9f6', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          <span style={{ color: '#9e9990', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Bill To</span>
          <div style={{ fontWeight: 600, marginTop: 3, color: '#0f0e0b' }}>{cust?.name}</div>
          {cust?.email && <div style={{ color: '#6b6560', fontSize: 12 }}>{cust.email}</div>}
        </div>

        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 16 }}>
          <table style={{ width: '100%', minWidth: 300, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0ede6' }}>
                {['Description', 'Qty', 'Price', 'Amount'].map(h => (
                  <th key={h} style={{ padding: '7px 5px', textAlign: h === 'Description' ? 'left' : 'right', fontSize: 10, fontWeight: 600, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inv.items.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f5f3ef' }}>
                  <td style={{ padding: '9px 5px', color: '#0f0e0b', fontWeight: 500 }}>{item.description}</td>
                  <td style={{ padding: '9px 5px', textAlign: 'right', color: '#6b6560' }}>{item.quantity}</td>
                  <td style={{ padding: '9px 5px', textAlign: 'right', color: '#6b6560', whiteSpace: 'nowrap' }}>{fmt(item.unit_price)}</td>
                  <td style={{ padding: '9px 5px', textAlign: 'right', fontWeight: 600, color: '#0f0e0b', whiteSpace: 'nowrap' }}>{fmt(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ borderTop: '2px solid #f0ede6', paddingTop: 10, marginBottom: 18 }}>
          {Number(inv.paid_amount) > 0 && (
            <>
              <div style={S.totRow}><span style={{ color: '#6b6560' }}>Total</span><span>{fmt(inv.total_amount)}</span></div>
              <div style={S.totRow}><span style={{ color: '#1a6b4a' }}>Paid</span><span style={{ color: '#1a6b4a' }}>−{fmt(inv.paid_amount)}</span></div>
            </>
          )}
          <div style={{ ...S.totRow, fontSize: 16, fontWeight: 800, color: gold, marginTop: 6 }}>
            <span>Amount Due</span><span>{fmt(inv.outstanding)}</span>
          </div>
        </div>

        {inv.notes && (
          <div style={{ background: '#faf9f6', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#6b6560', marginBottom: 16, borderLeft: `3px solid ${gold}` }}>
            {inv.notes}
          </div>
        )}

        {error && (
          <div style={{ background: '#fde8e8', border: '1px solid #f5c6c6', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b83232', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <button onClick={handlePay} disabled={paying || !paystackReady}
          style={{ width: '100%', padding: '16px', borderRadius: 10, border: 'none',
            background: paying ? '#ccc' : '#16a34a', color: '#fff', fontSize: 16, fontWeight: 700,
            cursor: paying ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 10, minHeight: 54 }}>
          {paying ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : <><CreditCard size={18} /> Pay {fmt(inv.outstanding)} Now</>}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9e9990', marginTop: 12 }}>
          🔒 Payments processed securely by Paystack. Your card details are never stored.
        </p>
      </div>

      <div style={{ textAlign: 'center', padding: '12px 16px', fontSize: 12, color: '#9e9990', width: '100%', maxWidth: 540, boxSizing: 'border-box' as const }}>
        {biz.address && <span>{biz.address}{biz.city ? `, ${biz.city}` : ''} · </span>}
        {biz.phone && <span>{biz.phone} · </span>}
        {biz.email && <span>{biz.email}</span>}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0 }
        body { background: #f5f3ef; font-family: 'DM Sans', -apple-system, sans-serif }
      `}</style>
    </div>
  )
}

// ── Page export wrapped in Suspense to fix Next.js 15 prerender crash ─────────
export default function PayPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
        <Loader2 size={32} color="#c8952a" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <PayPageInner />
    </Suspense>
  )
}

const S = {
  shell: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ef 0%, #ede9de 100%)', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'flex-start', padding: '0 0 32px' },
  card: { background: '#fff', borderRadius: '0 0 12px 12px', padding: '18px 18px 22px', width: '100%', maxWidth: 540, boxShadow: '0 8px 40px rgba(0,0,0,0.08)' },
  totRow: { display: 'flex' as const, justifyContent: 'space-between' as const, fontSize: 14, padding: '4px 0', color: '#2c2a24' },
}