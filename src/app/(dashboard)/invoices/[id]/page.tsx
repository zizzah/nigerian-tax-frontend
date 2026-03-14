'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Loader2, Printer, Send, Plus, Trash2, CheckCircle,
  Download, Mail, Copy, X, Link, ExternalLink,
} from 'lucide-react'
import {
  useInvoice, useFinalizeInvoice, useCancelInvoice,
  useDeleteInvoice, useSendInvoiceEmail, useDuplicateInvoice,
} from '@/lib/hooks/useInvoices'
import { useCustomer }        from '@/lib/hooks/useCustomers'
import { useBusiness }        from '@/lib/hooks/useBusiness'
import { useInvoicePayments, useCreatePayment, useDeletePayment } from '@/lib/hooks/usePayments'
import { invoicesApi }        from '@/lib/api/invoice'
import type { InvoiceItem, PaymentMethod } from '@/lib/types'
import { toast } from 'sonner'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

const today = () => new Date().toISOString().split('T')[0]

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID:           { bg: '#d4eddf', text: '#1a6b4a' },
  SENT:           { bg: '#fff3cd', text: '#856404' },
  OVERDUE:        { bg: '#fde8e8', text: '#b83232' },
  DRAFT:          { bg: '#ede9de', text: '#6b6560' },
  PARTIALLY_PAID: { bg: '#dce8f8', text: '#1e4d8c' },
  CANCELLED:      { bg: '#f0ede6', text: '#9e9990' },
}

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CASH',          label: 'Cash'          },
  { value: 'CARD',          label: 'Card'          },
  { value: 'POS',           label: 'POS'           },
  { value: 'MOBILE_MONEY',  label: 'Mobile Money'  },
  { value: 'CHEQUE',        label: 'Cheque'        },
  { value: 'OTHER',         label: 'Other'         },
]

// ─── Shared modal shell ───────────────────────────────────────────────────────
function ModalShell({ title, onClose, children, footer }: {
  title: string; onClose: () => void
  children: React.ReactNode; footer: React.ReactNode
}) {
  const S = {
    overlay: { position:'fixed' as const, inset:0, background:'rgba(15,14,11,0.55)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 },
    modal:   { background:'#fff', borderRadius:16, width:'100%', maxWidth:480,
      boxShadow:'0 24px 64px rgba(0,0,0,0.22)', display:'flex',
      flexDirection:'column' as const, maxHeight:'90vh', overflow:'hidden' },
    header:  { display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'18px 24px', borderBottom:'1px solid #ddd9cf' },
    title:   { fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:'#0f0e0b', margin:0 },
    close:   { background:'none', border:'none', fontSize:20, cursor:'pointer',
      color:'#9e9990', padding:'2px 8px', borderRadius:6, display:'flex' },
    body:    { padding:24, overflowY:'auto' as const, display:'flex',
      flexDirection:'column' as const, gap:14 },
    footer:  { padding:'14px 24px', borderTop:'1px solid #ddd9cf',
      display:'flex', justifyContent:'flex-end', gap:10 },
  }
  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <h2 style={S.title}>{title}</h2>
          <button style={S.close} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={S.body}>{children}</div>
        <div style={S.footer}>{footer}</div>
      </div>
    </div>
  )
}

// Inline style primitives reused across modals
const ms = {
  field:     { display:'flex', flexDirection:'column' as const, gap:5 },
  label:     { fontSize:11, fontWeight:500, color:'#9e9990', textTransform:'uppercase' as const, letterSpacing:'0.5px' },
  input:     { width:'100%', padding:'10px 12px', border:'1px solid #ddd9cf', borderRadius:8,
    fontSize:13.5, color:'#0f0e0b', background:'#fff', outline:'none',
    boxSizing:'border-box' as const, fontFamily:"'DM Sans',sans-serif" },
  info:      { background:'#f4f2eb', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#6b6560' },
  error:     { background:'#fde8e8', color:'#b83232', borderRadius:8, padding:'10px 14px', fontSize:13 },
  btnOutline:{ display:'inline-flex' as const, alignItems:'center', gap:6, padding:'9px 18px',
    borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer',
    background:'#fff', border:'1px solid #ddd9cf', color:'#2c2a24' },
  btnPrimary:{ display:'inline-flex' as const, alignItems:'center', gap:6, padding:'9px 18px',
    borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer',
    background:'#0f0e0b', border:'none', color:'#fff' },
  btnGold:   { display:'inline-flex' as const, alignItems:'center', gap:6, padding:'9px 18px',
    borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer',
    background:'#c8952a', border:'none', color:'#0f0e0b' },
}

// ─── Email Modal ──────────────────────────────────────────────────────────────
function EmailModal({ invoiceId, customerEmail, invoiceNumber, onClose }: {
  invoiceId: string; customerEmail: string | null
  invoiceNumber: string; onClose: () => void
}) {
  const sendEmail = useSendInvoiceEmail()
  const [cc, setCc]           = useState('')
  const [message, setMessage] = useState(
    `Please find attached invoice ${invoiceNumber}. Kindly ensure payment is made by the due date. Thank you for your business.`
  )
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent]   = useState(false)

  const handleSend = async () => {
    setError(null)
    if (!customerEmail) { setError('This customer has no email address on file.'); return }
    try {
      await sendEmail.mutateAsync({ id: invoiceId, message: message || undefined, cc: cc || undefined })
      setSent(true)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to send email. Check your email configuration.')
    }
  }

  if (sent) {
    return (
      <ModalShell title="Email Sent" onClose={onClose} footer={
        <button style={ms.btnGold} onClick={onClose}>Done</button>
      }>
        <div style={{ textAlign:'center', padding:'16px 0' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'#d4eddf',
            display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 12px' }}>
            <CheckCircle size={28} color="#1a6b4a" />
          </div>
          <div style={{ fontSize:16, fontWeight:600, color:'#0f0e0b', marginBottom:6 }}>Invoice Sent!</div>
          <div style={{ fontSize:13, color:'#6b6560' }}>
            Invoice {invoiceNumber} was emailed to <strong>{customerEmail}</strong>
          </div>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Email Invoice" onClose={onClose} footer={<>
      <button style={ms.btnOutline} onClick={onClose}>Cancel</button>
      <button style={{ ...ms.btnPrimary, opacity: sendEmail.isPending ? 0.7 : 1 }}
        onClick={handleSend} disabled={sendEmail.isPending}>
        {sendEmail.isPending
          ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Sending...</>
          : <><Mail size={14} /> Send Email</>}
      </button>
    </>}>
      {error && <div style={ms.error}>{error}</div>}
      <div style={ms.info}>
        To: <strong style={{ color:'#0f0e0b' }}>{customerEmail ?? '—'}</strong>
        {!customerEmail && (
          <div style={{ color:'#b83232', marginTop:4, fontSize:12 }}>
            ⚠ No email on file — add one on the customer profile first.
          </div>
        )}
      </div>
      <div style={ms.field}>
        <label style={ms.label}>CC (optional)</label>
        <input style={ms.input} type="email" value={cc} placeholder="accounts@company.com"
          onChange={e => setCc(e.target.value)} />
      </div>
      <div style={ms.field}>
        <label style={ms.label}>Message</label>
        <textarea style={{ ...ms.input, resize:'vertical' }} rows={4} value={message}
          onChange={e => setMessage(e.target.value)} />
      </div>
      <div style={{ fontSize:11, color:'#9e9990' }}>
        The PDF invoice will be attached automatically.
      </div>
    </ModalShell>
  )
}

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({ invoiceId, outstanding, onClose }: {
  invoiceId: string; outstanding: number; onClose: () => void
}) {
  const createPayment = useCreatePayment()
  const [amount, setAmount]           = useState(outstanding.toFixed(2))
  const [method, setMethod]           = useState<PaymentMethod>('BANK_TRANSFER')
  const [paymentDate, setPaymentDate] = useState(today())
  const [reference, setReference]     = useState('')
  const [bankName, setBankName]       = useState('')
  const [notes, setNotes]             = useState('')
  const [error, setError]             = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    const amt = parseFloat(amount)
    if (!amt || amt <= 0)  { setError('Enter a valid amount'); return }
    if (amt > outstanding) { setError(`Exceeds outstanding balance of ${formatCurrency(outstanding)}`); return }
    try {
      await createPayment.mutateAsync({
        invoice_id: invoiceId, amount: amt, payment_method: method,
        payment_date: paymentDate,
        reference_number: reference || undefined,
        bank_name: bankName || undefined,
        notes: notes || undefined,
      })
      onClose()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Failed to record payment')
    }
  }

  return (
    <ModalShell title="Record Payment" onClose={onClose} footer={<>
      <button style={ms.btnOutline} onClick={onClose}>Cancel</button>
      <button style={{ ...ms.btnPrimary, opacity: createPayment.isPending ? 0.7 : 1 }}
        onClick={handleSubmit} disabled={createPayment.isPending}>
        {createPayment.isPending
          ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Recording...</>
          : <><CheckCircle size={14} /> Record Payment</>}
      </button>
    </>}>
      {error && <div style={ms.error}>{error}</div>}
      <div style={ms.info}>Outstanding: <strong style={{ color:'#0f0e0b' }}>{formatCurrency(outstanding)}</strong></div>
      <div style={ms.field}>
        <label style={ms.label}>Amount (₦) *</label>
        <input style={ms.input} type="number" value={amount} min={0.01} max={outstanding} step="0.01"
          onChange={e => setAmount(e.target.value)} />
      </div>
      <div style={ms.field}>
        <label style={ms.label}>Payment Method *</label>
        <select style={ms.input} value={method} onChange={e => setMethod(e.target.value as PaymentMethod)}>
          {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </div>
      <div style={ms.field}>
        <label style={ms.label}>Payment Date *</label>
        <input style={ms.input} type="date" value={paymentDate} max={today()}
          onChange={e => setPaymentDate(e.target.value)} />
      </div>
      {['BANK_TRANSFER', 'CHEQUE'].includes(method) && (
        <div style={ms.field}>
          <label style={ms.label}>Bank Name</label>
          <input style={ms.input} type="text" value={bankName} placeholder="e.g. GTBank"
            onChange={e => setBankName(e.target.value)} />
        </div>
      )}
      <div style={ms.field}>
        <label style={ms.label}>Reference / Transaction ID</label>
        <input style={ms.input} type="text" value={reference} placeholder="e.g. TXN123456"
          onChange={e => setReference(e.target.value)} />
      </div>
      <div style={ms.field}>
        <label style={ms.label}>Notes</label>
        <textarea style={{ ...ms.input, resize:'vertical' }} rows={2} value={notes}
          placeholder="Optional notes…" onChange={e => setNotes(e.target.value)} />
      </div>
    </ModalShell>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()

  const [modal, setModal] = useState<'payment' | 'email' | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError,   setPdfError]   = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [payLink,    setPayLink]    = useState<string | null>(null)
  const [payLinkLoading, setPayLinkLoading] = useState(false)

  const { data: invoice, isLoading, error } = useInvoice(id)
  const { data: customer }     = useCustomer(invoice?.customer_id ?? '')
  const { data: business }     = useBusiness()

  // Brand colours from business settings — fall back to app defaults
  const primaryColor   = business?.primary_color   ?? '#c8952a'
  const secondaryColor = business?.secondary_color ?? '#1a6b4a'
  const { data: paymentsData } = useInvoicePayments(id)
  const payments = paymentsData?.payments ?? []

  const finalizeInvoice = useFinalizeInvoice()
  const cancelInvoice   = useCancelInvoice()
  const deleteInvoice   = useDeleteInvoice()
  const duplicateInvoice = useDuplicateInvoice()
  const deletePayment   = useDeletePayment()

  const outstanding = parseFloat(invoice?.outstanding_amount ?? '0')
  const canPay      = invoice && ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status) && outstanding > 0
  const canEmail    = invoice && ['SENT', 'OVERDUE', 'PARTIALLY_PAID', 'PAID'].includes(invoice.status)
  const isDraft     = invoice?.status === 'DRAFT'
  const canPayLink  = invoice && ['SENT', 'OVERDUE', 'PARTIALLY_PAID'].includes(invoice.status)

  const handleFinalize = async () => {
    try { await finalizeInvoice.mutateAsync(id) } catch (e) { console.error(e) }
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this invoice?')) return
    try { await cancelInvoice.mutateAsync({ id, reason: 'Cancelled by user' }) } catch (e) { console.error(e) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this draft invoice? This cannot be undone.')) return
    try {
      await deleteInvoice.mutateAsync(id)
      router.push('/invoices')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setActionError(detail ?? 'Failed to delete invoice.')
    }
  }

  const handleDuplicate = async () => {
    try {
      const newInvoice = await duplicateInvoice.mutateAsync(id)
      router.push(`/invoices/${newInvoice.id}`)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setActionError(detail ?? 'Failed to duplicate invoice.')
    }
  }

  const handleGeneratePayLink = async () => {
    setPayLinkLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const API   = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
      const res   = await fetch(`${API}/api/v1/paystack/links/${id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token ?? ''}` },
      })
      const data = await res.json() as { detail?: string; payment_url?: string }
      if (!res.ok) throw new Error(data.detail ?? 'Failed to generate link')
      const url = data.payment_url ?? ''
      setPayLink(url)
      // Copy to clipboard
      await navigator.clipboard.writeText(url)
      toast.success('Payment link copied to clipboard!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not generate payment link'
      toast.error(msg)
    } finally {
      setPayLinkLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId: string) => {
    if (!window.confirm('Reverse this payment?')) return
    try { await deletePayment.mutateAsync(paymentId) } catch (e) { console.error(e) }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
    setPdfLoading(true); setPdfError(null)
    try {
      const blob = await invoicesApi.downloadPDF(id)
      const url  = URL.createObjectURL(blob)
      const a    = Object.assign(document.createElement('a'), { href: url, download: `invoice-${invoice.invoice_number}.pdf` })
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      setPdfError(detail ?? 'PDF generation failed.')
    } finally { setPdfLoading(false) }
  }

  // ── Loading / error states ─────────────────────────────────────────────────
  if (isLoading) return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div className="topbar-title">Invoice Details</div>
      </div>
      <div className="center-state"><Loader2 className="animate-spin" size={32} /><p>Loading…</p></div>
      <style jsx>{`.center-state{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
    </>
  )

  if (error || !invoice) return (
    <>
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div className="topbar-title">Invoice Details</div>
      </div>
      <div className="center-state">
        <p>Error loading invoice.</p>
        <button className="btn btn-outline" onClick={() => router.back()}>Go Back</button>
      </div>
      <style jsx>{`.center-state{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
    </>
  )

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <button className="back-btn" onClick={() => router.back()}><ArrowLeft size={20} /></button>
        <div className="topbar-title">Invoice {invoice.invoice_number}</div>
        <div className="topbar-actions">

          {/* Send (finalize draft) */}
          {isDraft && (
            <button className="btn btn-primary" onClick={handleFinalize} disabled={finalizeInvoice.isPending}>
              {finalizeInvoice.isPending ? 'Sending…' : <><Send size={14} /> Send Invoice</>}
            </button>
          )}

          {/* Record Payment */}
          {canPay && (
            <button className="btn btn-gold" onClick={() => setModal('payment')}>
              <Plus size={14} /> Record Payment
            </button>
          )}

          {/* Email to customer */}
          {canEmail && (
            <button className="btn btn-outline" onClick={() => setModal('email')}>
              <Mail size={14} />
              {invoice.email_sent ? 'Resend Email' : 'Email Invoice'}
            </button>
          )}

          {/* Generate Payment Link */}
          {canPayLink && (
            <button className="btn btn-outline" onClick={handleGeneratePayLink}
              disabled={payLinkLoading} title="Generate a payment link to share with your customer">
              {payLinkLoading
                ? <><Loader2 size={14} className="spin" /> Generating…</>
                : <><Link size={14} /> Payment Link</>}
            </button>
          )}

          {/* Duplicate */}
          <button className="btn btn-outline" onClick={handleDuplicate} disabled={duplicateInvoice.isPending}
            title="Create a copy of this invoice as a new draft">
            {duplicateInvoice.isPending
              ? <><Loader2 size={14} className="spin" /> Copying…</>
              : <><Copy size={14} /> Duplicate</>}
          </button>

          {/* Download PDF */}
          <button className="btn btn-outline" onClick={handleDownloadPDF} disabled={pdfLoading}>
            {pdfLoading ? <><Loader2 size={14} className="spin" /> Generating…</> : <><Download size={14} /> PDF</>}
          </button>

          {/* Cancel (non-terminal) */}
          {!['CANCELLED', 'PAID'].includes(invoice.status) && !isDraft && (
            <button className="btn btn-outline" onClick={handleCancel} disabled={cancelInvoice.isPending}>
              Cancel
            </button>
          )}

          {/* Delete draft */}
          {isDraft && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleteInvoice.isPending}
              title="Delete this draft permanently">
              <Trash2 size={14} /> Delete
            </button>
          )}

          <button className="btn btn-outline" onClick={() => window.print()}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="content">
        {/* Error banners */}
        {(pdfError || actionError) && (
          <div className="err-banner">
            ⚠️ {pdfError ?? actionError}
            <button onClick={() => { setPdfError(null); setActionError(null) }}
              style={{ background:'none', border:'none', cursor:'pointer', color:'#b83232', fontSize:18, lineHeight:1 }}>✕</button>
          </div>
        )}

        {/* Payment link banner */}
        {payLink && (
          <div style={{ background:'#e8f4fd', border:'1px solid #b3d9f7', borderRadius:8,
            padding:'12px 16px', marginBottom:16, display:'flex', alignItems:'center',
            justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#1a5276' }}>
              <Link size={15} />
              <span><strong>Payment link ready</strong> — copied to clipboard</span>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <code style={{ fontSize:11, background:'#fff', padding:'3px 8px', borderRadius:4,
                color:'#2c2a24', border:'1px solid #d0e8f7', maxWidth:280,
                overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'block' }}>
                {payLink}
              </code>
              <button onClick={() => { navigator.clipboard.writeText(payLink); toast.success('Copied!') }}
                style={{ padding:'4px 10px', fontSize:12, background:'#1a5276', color:'#fff',
                  border:'none', borderRadius:6, cursor:'pointer', whiteSpace:'nowrap' }}>
                Copy
              </button>
              <a href={payLink} target="_blank" rel="noopener noreferrer"
                style={{ padding:'4px 10px', fontSize:12, background:'none', color:'#1a5276',
                  border:'1px solid #1a5276', borderRadius:6, textDecoration:'none',
                  display:'flex', alignItems:'center', gap:4, whiteSpace:'nowrap' }}>
                <ExternalLink size={11} /> Preview
              </a>
              <button onClick={() => setPayLink(null)}
                style={{ background:'none', border:'none', cursor:'pointer',
                  color:'#6b6560', fontSize:16, lineHeight:1 }}>✕</button>
            </div>
          </div>
        )}

        {/* Email sent badge */}
        {invoice.email_sent && (
          <div className="email-sent-badge">
            <Mail size={13} /> Emailed {invoice.email_sent_at ? `on ${formatDate(invoice.email_sent_at)}` : ''}
          </div>
        )}

        <div className="invoice-container">
          {/* Header */}
          <div className="invoice-header" style={{ borderBottomColor: primaryColor }}>
            <div className="invoice-brand">
              {business?.logo_url && (
                <img src={business.logo_url} alt="logo" style={{ height:52, marginBottom:8, objectFit:'contain' }} />
              )}
              <h1 className="company-name">{business?.business_name ?? 'Your Business'}</h1>
              <p className="company-detail">{[business?.address, business?.city, business?.state].filter(Boolean).join(', ')}</p>
              {business?.phone && <p className="company-detail">{business.phone}</p>}
              {business?.tin   && <p className="company-detail">TIN: {business.tin}</p>}
            </div>
            <div className="invoice-info">
              <h2 className="invoice-title" style={{ color: primaryColor }}>INVOICE</h2>
              <div className="invoice-meta">
                {([
                  ['Invoice #', invoice.invoice_number],
                  ['Issue Date', formatDate(invoice.issue_date)],
                  ['Due Date',   formatDate(invoice.due_date)],
                ] as [string, string][]).map(([label, value]) => (
                  <div className="meta-row" key={label}>
                    <span className="meta-label">{label}:</span>
                    <span className="meta-value">{value}</span>
                  </div>
                ))}
                <div className="meta-row">
                  <span className="meta-label">Status:</span>
                  <span className="badge" style={{
                    background: statusColors[invoice.status]?.bg ?? '#ede9de',
                    color:      statusColors[invoice.status]?.text ?? '#6b6560',
                  }}>
                    {invoice.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="customer-section">
            <div className="section-title">Bill To:</div>
            <div className="customer-name">{customer?.name ?? '—'}</div>
            {customer && (
              <div className="customer-details">
                {customer.address && <p>{customer.address}</p>}
                {customer.city    && <p>{customer.city}{customer.state ? `, ${customer.state}` : ''}</p>}
                {customer.email   && <p>{customer.email}</p>}
                {customer.phone   && <p>{customer.phone}</p>}
                {customer.tin     && <p>TIN: {customer.tin}</p>}
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="items-section">
            <table className="items-table">
              <thead>
                <tr>
                  {['Description','Qty','Unit Price','Discount','Tax','Amount'].map((h, i) => (
                    <th key={h} className={i === 5 ? 'text-right' : ''}
                      style={{ background: secondaryColor, color: '#fff', borderBottom: `2px solid ${primaryColor}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: InvoiceItem, i: number) => (
                  <tr key={item.id || i}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{parseFloat(item.discount_amount) > 0 ? formatCurrency(item.discount_amount) : '-'}</td>
                    <td>{item.tax_rate}%</td>
                    <td className="text-right">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals-row"><span className="totals-label">Subtotal:</span><span className="totals-value">{formatCurrency(invoice.subtotal)}</span></div>
            {parseFloat(invoice.discount_amount) > 0 && (
              <div className="totals-row"><span className="totals-label">Discount:</span><span className="totals-value">-{formatCurrency(invoice.discount_amount)}</span></div>
            )}
            <div className="totals-row"><span className="totals-label">VAT:</span><span className="totals-value">{formatCurrency(invoice.tax_amount)}</span></div>
            <div className="totals-row grand-total" style={{ borderTopColor: primaryColor }}><span className="totals-label">Total:</span><span className="totals-value" style={{ color: primaryColor }}>{formatCurrency(invoice.total_amount)}</span></div>
            {parseFloat(invoice.paid_amount) > 0 && (<>
              <div className="totals-row paid"><span className="totals-label">Paid:</span><span className="totals-value">{formatCurrency(invoice.paid_amount)}</span></div>
              <div className="totals-row outstanding"><span className="totals-label">Outstanding:</span><span className="totals-value">{formatCurrency(invoice.outstanding_amount)}</span></div>
            </>)}
          </div>

          {invoice.notes && (
            <div className="notes-section">
              <div className="section-title">Notes:</div>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="payments-section">
              <div className="section-title" style={{ marginBottom:12 }}>Payment History</div>
              <table className="items-table">
                <thead>
                  <tr><th>Date</th><th>Method</th><th>Reference</th><th>Receipt #</th><th className="text-right">Amount</th><th></th></tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id}>
                      <td>{formatDate(p.payment_date)}</td>
                      <td>{p.payment_method.replace('_', ' ')}</td>
                      <td className="text-dim">{p.reference_number ?? '-'}</td>
                      <td className="text-dim">{p.receipt_number ?? '-'}</td>
                      <td className="text-right" style={{ color:'#1a6b4a', fontWeight:600 }}>{formatCurrency(p.amount)}</td>
                      <td>
                        <button onClick={() => handleDeletePayment(p.id)} disabled={deletePayment.isPending}
                          style={{ background:'none', border:'none', cursor:'pointer', padding:4 }}>
                          <Trash2 size={14} color="#b83232" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="invoice-footer"><p>Thank you for your business!</p></div>
        </div>
      </div>

      {/* Modals */}
      {modal === 'payment' && (
        <PaymentModal invoiceId={id} outstanding={outstanding} onClose={() => setModal(null)} />
      )}
      {modal === 'email' && (
        <EmailModal
          invoiceId={id}
          customerEmail={customer?.email ?? null}
          invoiceNumber={invoice.invoice_number}
          onClose={() => setModal(null)}
        />
      )}

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:8px;flex-shrink:0;flex-wrap:wrap}
        .back-btn{display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:8px;border:1px solid var(--border);background:transparent;cursor:pointer;flex-shrink:0}
        .back-btn:hover{background:var(--cream)}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1;white-space:nowrap}
        .topbar-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
        .content{flex:1;overflow-y:auto;padding:28px;background:#f5f5f0}
        .err-banner{background:#fde8e8;color:#b83232;border-radius:10px;padding:12px 16px;margin-bottom:16px;font-size:13px;display:flex;justify-content:space-between;align-items:center}
        .email-sent-badge{display:inline-flex;align-items:center;gap:6px;background:#d4eddf;color:#1a6b4a;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:500;margin-bottom:12px}
        .invoice-container{max-width:800px;margin:0 auto;background:#fff;border:1px solid var(--border);border-radius:12px;padding:40px;box-shadow:var(--shadow)}
        .invoice-header{display:flex;justify-content:space-between;margin-bottom:40px;padding-bottom:20px;border-bottom:2px solid currentColor}
        .company-name{font-family:'Fraunces',serif;font-size:22px;font-weight:700;color:var(--ink);margin:0 0 4px}
        .company-detail{color:var(--text-dim);font-size:12px;margin:2px 0}
        .invoice-info{text-align:right}
        .invoice-title{font-family:'Fraunces',serif;font-size:32px;font-weight:700;margin:0 0 16px}
        .invoice-meta{display:flex;flex-direction:column;gap:6px}
        .meta-row{display:flex;justify-content:flex-end;gap:12px;font-size:13px}
        .meta-label{color:var(--text-dim)}
        .meta-value{font-weight:500;color:var(--ink);min-width:120px}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
        .customer-section{margin-bottom:30px}
        .section-title{font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-dim);margin-bottom:6px}
        .customer-name{font-size:16px;font-weight:600;color:var(--ink);margin-bottom:4px}
        .customer-details p{font-size:13px;color:var(--text);margin:2px 0}
        .items-section{margin-bottom:30px}
        .items-table{width:100%;border-collapse:collapse}
        .items-table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;padding:10px 12px;font-weight:500}
        .items-table td{padding:12px;border-bottom:1px solid #f0ede6;font-size:13px}
        .text-right{text-align:right}
        .text-dim{color:var(--text-dim);font-size:12px}
        .totals-section{display:flex;flex-direction:column;align-items:flex-end;margin-bottom:30px}
        .totals-row{display:flex;justify-content:space-between;width:260px;padding:6px 0;font-size:13px}
        .totals-label{color:var(--text-dim)}
        .totals-value{font-weight:500}
        .totals-row.grand-total{border-top:2px solid currentColor;margin-top:8px;padding-top:12px;font-size:16px;font-weight:700}
        .totals-row.grand-total .totals-value{color:inherit}
        .totals-row.paid .totals-value{color:#1a6b4a}
        .totals-row.outstanding .totals-value{color:#b83232;font-weight:700}
        .notes-section{padding:16px 20px;background:var(--cream);border-radius:8px;margin-bottom:24px}
        .notes-section p{font-size:13px;color:var(--text);margin:0}
        .payments-section{margin-bottom:24px}
        .invoice-footer{text-align:center;padding-top:20px;border-top:1px solid var(--border)}
        .invoice-footer p{font-size:13px;color:var(--text-dim);margin:0}
        .btn{display:inline-flex;align-items:center;gap:5px;padding:7px 13px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:12.5px;font-weight:500;cursor:pointer;border:none;transition:all 0.15s;white-space:nowrap}
        .btn-primary{background:var(--ink);color:#fff}
        .btn-gold{background:var(--gold);color:var(--ink)}
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
        .btn-outline:hover{background:var(--cream)}
        .btn-danger{background:#fde8e8;border:1px solid #f5c6c6;color:#b83232}
        .btn-danger:hover{background:#f5c6c6}
        .btn:disabled{opacity:0.6;cursor:not-allowed}
        .spin{animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .content{padding:16px}
          .invoice-container{padding:20px}
          .invoice-header{flex-direction:column;gap:20px}
          .invoice-info{text-align:left}
          .meta-row{justify-content:flex-start}
          .items-table{display:block;overflow-x:auto}
          .topbar{height:auto;padding:10px 16px}
        }
      `}</style>
    </>
  )
}