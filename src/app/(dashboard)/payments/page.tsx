'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ExternalLink } from 'lucide-react'
import { usePayments } from '@/lib/hooks/usePayments'
import type { Payment } from '@/lib/types'

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  const n = isNaN(num) ? 0 : Math.abs(num)
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000)     return `₦${(n / 1_000_000).toFixed(1)}M`
  return '₦' + new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(n)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile Money',
  POS: 'POS',
  OTHER: 'Other',
}

const methodColors: Record<string, { bg: string; text: string }> = {
  CASH:          { bg: '#d4eddf', text: '#1a6b4a' },
  BANK_TRANSFER: { bg: '#dce8f8', text: '#1e4d8c' },
  CARD:          { bg: '#ede9de', text: '#6b6560' },
  POS:           { bg: '#f0e6f8', text: '#6b1e8c' },
  MOBILE_MONEY:  { bg: '#fff3cd', text: '#856404' },
  CHEQUE:        { bg: '#fde8e8', text: '#b83232' },
  OTHER:         { bg: '#ede9de', text: '#6b6560' },
}

export default function PaymentsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const { data: paymentsData, isLoading } = usePayments()
  const payments: Payment[] = paymentsData?.payments ?? []
  const totalPayments = paymentsData?.total ?? 0

  // All payments are successful — stats are derived from amounts & methods
  const totalCollected = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const avgPayment     = payments.length > 0 ? totalCollected / payments.length : 0
  const bankTransfers  = payments.filter(p => p.payment_method === 'BANK_TRANSFER').length
  const cashPayments   = payments.filter(p => p.payment_method === 'CASH').length

  const filtered = payments.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.receipt_number?.toLowerCase().includes(q) ||
      p.reference_number?.toLowerCase().includes(q) ||
      p.payment_method?.toLowerCase().includes(q) ||
      p.amount?.toString().includes(q)
    )
  })

  if (isLoading) return (
    <>
      <div className="topbar"><div className="topbar-title">Payments</div></div>
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} /><p>Loading payments...</p>
      </div>
      <style jsx>{`.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
    </>
  )

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Payments</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search by receipt, reference..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="search-input" />
          </div>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Payments</div>
          <div className="page-sub">{totalPayments} total payments recorded</div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#d4eddf' }}>💰</div>
            </div>
            <div className="stat-value">{formatCurrency(totalCollected)}</div>
            <div className="stat-label">Total Collected</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#dce8f8' }}>📊</div>
            </div>
            <div className="stat-value">{totalPayments}</div>
            <div className="stat-label">Transactions</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fff3cd' }}>📈</div>
            </div>
            <div className="stat-value">{formatCurrency(avgPayment)}</div>
            <div className="stat-label">Avg. Payment</div>
          </div>
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#ede9de' }}>🏦</div>
            </div>
            <div className="stat-value">{bankTransfers}</div>
            <div className="stat-label">Bank Transfers</div>
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Payment Transactions</span>
            <span className="card-count">{filtered.length} records</span>
          </div>

          {filtered.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Receipt #</th>
                  <th>Method</th>
                  <th>Reference</th>
                  <th>Notes</th>
                  <th className="text-right">Amount</th>
                  <th>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(payment => (
                  <tr key={payment.id}>
                    <td className="text-dim">{formatDate(payment.payment_date)}</td>
                    <td className="font-mono">{payment.receipt_number ?? '-'}</td>
                    <td>
                      <span className="badge" style={{
                        background: methodColors[payment.payment_method]?.bg ?? '#ede9de',
                        color:      methodColors[payment.payment_method]?.text ?? '#6b6560',
                      }}>
                        {methodLabels[payment.payment_method] ?? payment.payment_method}
                      </span>
                    </td>
                    <td className="text-dim">{payment.reference_number ?? '-'}</td>
                    <td className="text-dim">{payment.notes ?? '-'}</td>
                    <td className="text-right font-bold">{formatCurrency(payment.amount)}</td>
                    <td>
                      <button className="link-btn"
                        onClick={() => router.push(`/invoices/${payment.invoice_id}`)}>
                        <ExternalLink size={13} /> View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>{search ? 'No payments match your search' : 'No payments recorded yet'}</p>
              <p style={{ fontSize: 12, marginTop: 4 }}>
                Payments are recorded from the invoice detail page
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .topbar-actions{display:flex;align-items:center;gap:10px}
        .content{flex:1;overflow-y:auto;padding:28px}
        .page-header{margin-bottom:24px}
        .page-title{font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:var(--ink)}
        .page-sub{font-size:13px;color:var(--text-dim);margin-top:4px}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
        .stat-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:var(--shadow)}
        .stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
        .stat-value{font-family:'Fraunces',serif,system-ui,sans-serif;font-size:24px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:4px}
        .stat-label{font-size:12px;color:var(--text-dim)}
        .card{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
        .card-header{padding:18px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .card-title{font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:var(--ink)}
        .card-count{font-size:12px;color:var(--text-dim)}
        .table{width:100%;border-collapse:collapse}
        .table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-dim);padding:10px 20px;background:var(--cream);font-weight:500;border-bottom:1px solid var(--border)}
        .table td{padding:13px 20px;border-bottom:1px solid #f0ede6;font-size:13px}
        .table tr:last-child td{border-bottom:none}
        .table tr:hover td{background:var(--gold-pale)}
        .text-right{text-align:right}
        .font-bold{font-weight:600}
        .font-mono{font-family:monospace;font-size:12px}
        .text-dim{color:var(--text-dim);font-size:12px}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
        .link-btn{display:inline-flex;align-items:center;gap:4px;background:none;border:none;color:var(--gold);font-size:12px;cursor:pointer;padding:0;font-family:'DM Sans',sans-serif;font-weight:500}
        .link-btn:hover{text-decoration:underline}
        .search-wrap{position:relative}
        .search-input{padding:9px 14px 9px 38px;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);background:var(--cream);outline:none;width:240px;transition:all 0.15s}
        .search-input:focus{border-color:var(--gold);background:#fff}
        .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-dim)}
        .empty-state{padding:48px 20px;text-align:center;color:var(--text-dim)}
        @media(max-width:768px){
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .content{padding:12px}
          .table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
          .topbar{height:auto;min-height:52px;padding:10px 14px;flex-wrap:wrap}
          .topbar-actions{flex-wrap:wrap;gap:6px}
          .table th,.table td{padding:8px 10px;font-size:12px}
        }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr}
          .content{padding:8px}
          .topbar-title{font-size:15px}
        }
      `}</style>
    </>
  )
}