'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Search, X, CheckSquare, Square, Mail, Download, Trash2, CheckCircle } from 'lucide-react'
import { useInvoices, useInvoiceStats, useSendInvoiceEmail, useDeleteInvoice } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import type { Invoice } from '@/lib/types'

// ─── CSV export helper ────────────────────────────────────────────────────────
function downloadCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const esc = (v: string | number) => { const s = String(v); return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s }
  const csv = [headers, ...rows].map(r => r.map(esc).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ─── Days overdue helper ──────────────────────────────────────────────────────
function daysOverdue(dueDateStr: string | null): number {
  if (!dueDateStr) return 0
  const diff = Math.floor((Date.now() - new Date(dueDateStr).getTime()) / 86400000)
  return Math.max(0, diff)
}

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
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  paid:           { bg: '#d4eddf', text: '#1a6b4a' },
  sent:           { bg: '#fff3cd', text: '#856404' },
  overdue:        { bg: '#fde8e8', text: '#b83232' },
  draft:          { bg: '#ede9de', text: '#6b6560' },
  cancelled:      { bg: '#f0ede6', text: '#9e9990' },
  partially_paid: { bg: '#dce8f8', text: '#1e4d8c' },
}

const STATUS_FILTERS = [
  { label: 'All',       value: undefined        },
  { label: 'Draft',     value: 'DRAFT'          },
  { label: 'Sent',      value: 'SENT'           },
  { label: 'Paid',      value: 'PAID'           },
  { label: 'Overdue',   value: 'OVERDUE'        },
  { label: 'Partial',   value: 'PARTIALLY_PAID' },
  { label: 'Cancelled', value: 'CANCELLED'      },
]

export default function InvoicesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [page, setPage]         = useState(1)
  const PAGE_SIZE = 20
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string | null>(null)
  const [bulkMsg, setBulkMsg]   = useState<string | null>(null)
  const sendEmail   = useSendInvoiceEmail()
  const deleteInv   = useDeleteInvoice()

  // Use server pagination when not searching; load all when searching (client filter)
  const { data: invoicesData, isLoading } = useInvoices({
    page_size: search ? 500 : PAGE_SIZE,
    page:      search ? 1   : page,
    status:    filter,
  })
  const { data: statsData }               = useInvoiceStats()
  const { data: customersData }           = useCustomers({ limit: 200 })

  const customerMap = Object.fromEntries(
    (customersData?.customers ?? []).map(c => [c.id, c.name])
  )

  // Overdue badge: check if past due date and not paid/cancelled
  const isOverdue = (inv: Invoice) =>
    !['PAID','CANCELLED'].includes(inv.status) &&
    !!inv.due_date && new Date(inv.due_date) < new Date()

  // Client-side search — filter by invoice #, customer name, or amount
  // (must be defined BEFORE any derived values that reference invoices)
  const rawInvoices: Invoice[] = invoicesData?.invoices || []
  const invoices = search.trim()
    ? rawInvoices.filter(inv => {
        const q   = search.toLowerCase()
        const num = (inv.invoice_number ?? '').toLowerCase()
        const cus = (customerMap[inv.customer_id] ?? '').toLowerCase()
        const amt = String(inv.total_amount)
        return num.includes(q) || cus.includes(q) || amt.includes(q)
      })
    : rawInvoices

  // Bulk select helpers
  const toggleOne = (id: string) => setSelected(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s
  })
  const toggleAll = (ids: string[], allSelected: boolean) =>
    setSelected(allSelected ? new Set() : new Set(ids))

  // Bulk export CSV
  const handleBulkExport = () => {
    const rows = invoices
      .filter(i => selected.has(i.id))
      .map(i => [i.invoice_number, customerMap[i.customer_id] ?? '', i.issue_date ?? '', i.due_date ?? '', i.total_amount, i.paid_amount, i.outstanding_amount, i.status])
    downloadCSV('invoices-export.csv', rows, ['Invoice #','Customer','Issue Date','Due Date','Total','Paid','Outstanding','Status'])
    setBulkMsg(`Exported ${rows.length} invoices`)
    setTimeout(() => setBulkMsg(null), 3000)
  }

  // Bulk chase email (sends to all selected overdue/sent)
  const handleBulkChase = async () => {
    const targets = invoices.filter(i => selected.has(i.id) && ['SENT','OVERDUE','PARTIALLY_PAID'].includes(i.status))
    if (!targets.length) { setBulkMsg('No emailable invoices selected'); return }
    let sent = 0
    for (const inv of targets) {
      try { await sendEmail.mutateAsync({ id: inv.id, message: 'This is a friendly reminder that the above invoice is outstanding. Please arrange payment at your earliest convenience.' }); sent++ } catch {}
    }
    setBulkMsg(`Chase email sent for ${sent} invoice${sent !== 1 ? 's' : ''}`)
    setTimeout(() => setBulkMsg(null), 4000)
    setSelected(new Set())
  }

  // Bulk delete drafts
  const handleBulkDelete = async () => {
    const drafts = invoices.filter(i => selected.has(i.id) && i.status === 'DRAFT')
    if (!drafts.length) { setBulkMsg('No draft invoices selected'); return }
    if (!window.confirm(`Delete ${drafts.length} draft invoice(s)? This cannot be undone.`)) return
    for (const inv of drafts) { try { await deleteInv.mutateAsync(inv.id) } catch {} }
    setBulkMsg(`Deleted ${drafts.length} draft(s)`)
    setTimeout(() => setBulkMsg(null), 3000)
    setSelected(new Set())
  }

  if (isLoading) {
    return (
      <>
        <div className="topbar"><div className="topbar-title">Invoices</div></div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading invoices...</p>
        </div>
        <style jsx>{`.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Invoices</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search invoice #, customer, amount…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} title="Clear">
                <X size={12} />
              </button>
            )}
          </div>
          <button onClick={() => router.push('/invoices/new')} className="btn btn-gold">
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Invoices</div>
          <div className="page-sub">
            {statsData
              ? `${statsData.total_invoices} total · ${statsData.paid_invoices} paid · ${statsData.overdue_invoices} overdue`
              : `${rawInvoices.length} invoices`}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="filters">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.label}
                  onClick={() => { setFilter(f.value); setSearch(''); setPage(1) }}
                  className={`btn btn-sm ${filter === f.value ? 'btn-active' : 'btn-tab'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            {search ? (
              <span className="search-hint">
                {invoices.length} result{invoices.length !== 1 ? 's' : ''} for &ldquo;{search}&rdquo;
              </span>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <button className="btn btn-sm btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}>← Prev</button>
                <span style={{ fontSize:12, color:'var(--text-dim)', whiteSpace:'nowrap' }}>
                  Page {page} of {Math.max(1, invoicesData?.total_pages ?? 1)}
                </span>
                <button className="btn btn-sm btn-outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= (invoicesData?.total_pages ?? 1)}>Next →</button>
              </div>
            )}
          </div>

          {/* Bulk action bar */}
          {selected.size > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#faf9f6', borderBottom:'1px solid #ddd9cf', flexWrap:'wrap' }}>
              <span style={{ fontSize:12, fontWeight:600, color:'#0f0e0b' }}>{selected.size} selected</span>
              <button className="btn btn-sm btn-outline" onClick={handleBulkExport}><Download size={13} /> Export CSV</button>
              <button className="btn btn-sm btn-outline" onClick={handleBulkChase} disabled={sendEmail.isPending}>
                <Mail size={13} /> {sendEmail.isPending ? 'Sending…' : 'Chase Email'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={handleBulkDelete} disabled={deleteInv.isPending}><Trash2 size={13} /> Delete Drafts</button>
              <button className="btn btn-sm btn-outline" onClick={() => setSelected(new Set())}><X size={12} /> Clear</button>
            </div>
          )}

          {/* Feedback message */}
          {bulkMsg && (
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', background:'#d4eddf', borderBottom:'1px solid #b2d8c4', fontSize:13, color:'#1a6b4a' }}>
              <CheckCircle size={14} /> {bulkMsg}
            </div>
          )}

          {invoices.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width:36 }}>
                    {(() => {
                      const vids = invoices.map(i => i.id)
                      const allSel = vids.length > 0 && vids.every(id => selected.has(id))
                      return (
                        <button onClick={() => toggleAll(vids, allSel)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'#9e9990', padding:0 }}>
                          {allSel ? <CheckSquare size={16} color="#c8952a" /> : <Square size={16} />}
                        </button>
                      )
                    })()}
                  </th>
                  <th>Invoice #</th><th>Customer</th><th>Issue Date</th>
                  <th>Due Date</th><th>Amount</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const statusKey = invoice.status?.toLowerCase() ?? 'draft'
                  const label     = statusKey.replace('_', ' ')
                  const overdue   = isOverdue(invoice)
                  const days      = daysOverdue(invoice.due_date)
                  const isSelected = selected.has(invoice.id)
                  return (
                    <tr key={invoice.id} className="clickable-row"
                      style={{ background: isSelected ? '#fffbf0' : undefined }}
                      onClick={() => router.push(`/invoices/${invoice.id}`)}>
                      <td onClick={e => e.stopPropagation()} style={{ padding:'13px 8px 13px 20px' }}>
                        <button onClick={() => toggleOne(invoice.id)} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:'#9e9990', padding:0 }}>
                          {isSelected ? <CheckSquare size={16} color="#c8952a" /> : <Square size={16} />}
                        </button>
                      </td>
                      <td className="font-bold" style={{ fontFamily:'monospace', fontSize:12.5 }}>{invoice.invoice_number}</td>
                      <td>{customerMap[invoice.customer_id] ?? '—'}</td>
                      <td className="text-dim">{formatDate(invoice.issue_date)}</td>
                      <td className="text-dim" style={{ color: overdue ? '#b83232' : undefined }}>
                        {formatDate(invoice.due_date)}
                        {overdue && <span style={{ marginLeft:5, fontSize:10, fontWeight:600, background:'#fde8e8', color:'#b83232', padding:'1px 6px', borderRadius:10 }}>{days}d overdue</span>}
                      </td>
                      <td className="font-bold">{formatCurrency(invoice.total_amount)}</td>
                      <td>
                        <span className="badge" style={{
                          background: statusColors[statusKey]?.bg ?? '#ede9de',
                          color:      statusColors[statusKey]?.text ?? '#6b6560',
                        }}>
                          {label.charAt(0).toUpperCase() + label.slice(1)}
                        </span>
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display:'flex', gap:4 }}>
                          <button className="btn btn-outline btn-sm"
                            onClick={() => router.push(`/invoices/${invoice.id}`)}>
                            View
                          </button>
                          {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
                            <button className="btn btn-sm chase-btn"
                              title="Send chase email"
                              onClick={() => sendEmail.mutateAsync({ id: invoice.id, message: 'This is a friendly reminder that the above invoice is outstanding.' }).catch(() => {})}
                              disabled={sendEmail.isPending}>
                              <Mail size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              {search ? (
                <>
                  <p>No invoices match &ldquo;{search}&rdquo;</p>
                  <button className="btn btn-outline" onClick={() => setSearch('')}>Clear Search</button>
                </>
              ) : (
                <>
                  <p>{filter ? `No ${filter.toLowerCase().replace('_', ' ')} invoices` : 'No invoices yet'}</p>
                  <button onClick={() => router.push('/invoices/new')} className="btn btn-gold">
                    <Plus size={16} /> Create First Invoice
                  </button>
                </>
              )}
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
        .card{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
        .card-header{padding:14px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px}
        .filters{display:flex;gap:5px;flex-wrap:wrap}

        /* Search */
        .search-wrap{position:relative;display:flex;align-items:center}
        .search-icon{position:absolute;left:10px;color:var(--text-dim);pointer-events:none;z-index:1}
        .search-input{padding:8px 32px 8px 32px;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);background:var(--cream);outline:none;width:260px;transition:all 0.15s}
        .search-input:focus{border-color:var(--gold);background:#fff;box-shadow:0 0 0 3px rgba(200,149,42,0.1)}
        .search-clear{position:absolute;right:8px;background:none;border:none;cursor:pointer;color:var(--text-dim);display:flex;align-items:center;padding:2px;border-radius:4px}
        .search-clear:hover{color:var(--ink);background:var(--cream)}
        .search-hint{font-size:12px;color:var(--text-dim);white-space:nowrap}

        /* Tabs */
        .btn-tab{background:transparent;border:1px solid var(--border);color:var(--text-dim)}
        .btn-tab:hover{background:var(--cream);color:var(--text)}
        .btn-active{background:var(--ink);color:#fff;border:1px solid var(--ink)}

        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.15s}
        .btn-gold{background:var(--gold);color:var(--ink)}
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
        .btn-outline:hover{background:var(--cream)}
        .btn-sm{padding:6px 12px;font-size:12px}
        .table{width:100%;border-collapse:collapse}
        .table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-dim);padding:10px 20px;background:var(--cream);font-weight:500;border-bottom:1px solid var(--border)}
        .table td{padding:13px 20px;border-bottom:1px solid #f0ede6;font-size:13.5px}
        .table tr:last-child td{border-bottom:none}
        .clickable-row{cursor:pointer}
        .clickable-row:hover td{background:var(--gold-pale)}
        .font-bold{font-weight:600}
        .text-dim{color:var(--text-dim);font-size:12px}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
        .chase-btn{background:#fff3cd;border:1px solid #f5d76e;color:#856404;padding:5px 8px}
        .chase-btn:hover{background:#f5d76e}
        .btn-danger{background:#fde8e8;border:1px solid #f5c6c6;color:#b83232}
        .btn-danger:hover{background:#f5c6c6}
        .empty-state{padding:40px 20px;text-align:center;color:var(--text-dim);display:flex;flex-direction:column;align-items:center;gap:12px}
        @media(max-width:900px){
          .topbar{flex-wrap:wrap;height:auto;padding:12px 16px}
          .topbar-actions{width:100%;flex-wrap:wrap}
          .search-wrap{flex:1}
          .search-input{width:100%}
        }
        @media(max-width:768px){
          .content{padding:16px}
          .table{display:block;overflow-x:auto}
          .table th,.table td{padding:10px 12px;font-size:12px;white-space:nowrap}
        }
      `}</style>
    </>
  )
}