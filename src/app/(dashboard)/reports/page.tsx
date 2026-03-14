'use client'

import { useState, useMemo } from 'react'
import { Loader2, Download, FileText, TrendingUp, AlertCircle, Package, ChevronDown } from 'lucide-react'
import { useInvoices } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { useProducts } from '@/lib/hooks/useProducts'
import { usePayments } from '@/lib/hooks/usePayments'
import type { Invoice, Customer } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = (d: string | null) => d
  ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—'

const n = (v: string | number | null | undefined) =>
  typeof v === 'string' ? parseFloat(v) || 0 : v || 0

const today = new Date()
const iso = (d: Date) => d.toISOString().split('T')[0]

// Date range presets
const PRESETS = [
  { label: 'This Month',      from: iso(new Date(today.getFullYear(), today.getMonth(), 1)),         to: iso(today) },
  { label: 'Last Month',      from: iso(new Date(today.getFullYear(), today.getMonth() - 1, 1)),     to: iso(new Date(today.getFullYear(), today.getMonth(), 0)) },
  { label: 'Last 3 Months',   from: iso(new Date(today.getFullYear(), today.getMonth() - 3, 1)),     to: iso(today) },
  { label: 'This Year',       from: iso(new Date(today.getFullYear(), 0, 1)),                        to: iso(today) },
  { label: 'Last Year',       from: iso(new Date(today.getFullYear() - 1, 0, 1)),                    to: iso(new Date(today.getFullYear() - 1, 11, 31)) },
  { label: 'All Time',        from: '2020-01-01',                                                    to: iso(today) },
]

// ─── CSV export ───────────────────────────────────────────────────────────────
function downloadCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const escape = (v: string | number) => {
    const s = String(v)
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }) // BOM for Excel
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click()
  document.body.removeChild(a); URL.revokeObjectURL(url)
}

// ─── PDF print helper (uses browser print with print-specific CSS) ────────────
function printReport(title: string, tableId: string, meta: string) {
  const table = document.getElementById(tableId)?.outerHTML ?? ''
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:24px}
    h1{font-size:18px;margin:0 0 4px}
    .meta{color:#666;font-size:10px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}
    th{background:#f4f2eb;font-size:10px;text-transform:uppercase;letter-spacing:.4px;padding:6px 8px;text-align:left;border-bottom:2px solid #c8952a}
    td{padding:6px 8px;border-bottom:1px solid #eee;font-size:11px}
    tr:last-child td{border-bottom:none}
    .right{text-align:right}
    @media print{@page{margin:16mm}}
  </style></head><body>
  <h1>${title}</h1><div class="meta">${meta}</div>
  ${table}
  </body></html>`)
  win.document.close()
  win.print()
}

// ─── Report Tab types ─────────────────────────────────────────────────────────
type ReportTab = 'pl' | 'vat' | 'aged' | 'products'

export default function ReportsPage() {
  const [tab, setTab]           = useState<ReportTab>('pl')
  const [preset, setPreset]     = useState(PRESETS[0])
  const [from, setFrom]         = useState(PRESETS[0].from)
  const [to, setTo]             = useState(PRESETS[0].to)
  const [showPresets, setShowPresets] = useState(false)

  // Invoices: backend caps page_size at 100, so fetch p1 + p2 to cover up to 200 invoices.
  // We also pass from_date/to_date so the backend filters server-side — avoids 422 from page_size>100.
  const invParams = { page_size: 100, from_date: from, to_date: to }
  const { data: invPage1, isLoading: invLoading1 } = useInvoices({ ...invParams, page: 1 })
  const { data: invPage2, isLoading: invLoading2 } = useInvoices({ ...invParams, page: 2 })
  // For aged receivables we need ALL unpaid invoices regardless of date range
  const { data: allUnpaidData } = useInvoices({ page_size: 100, status: 'OVERDUE', page: 1 })
  const { data: allSentData }   = useInvoices({ page_size: 100, status: 'SENT',    page: 1 })
  const { data: allPartialData }= useInvoices({ page_size: 100, status: 'PARTIALLY_PAID', page: 1 })

  const { data: productsData, isLoading: prodLoading } = useProducts({ limit: 100 })
  // Customers: backend uses skip/limit (not page_size)
  const { data: customersData } = useCustomers({ skip: 0, limit: 100 })

  const allInvoices: Invoice[] = [
    ...(invPage1?.invoices ?? []),
    ...(invPage2?.invoices ?? []),
  ]
  // Deduplicate by id (pages may overlap near boundaries)
  const invoices = useMemo(() => {
    const seen = new Set<string>()
    return allInvoices.filter(inv => {
      if (seen.has(inv.id)) return false
      seen.add(inv.id)
      return true
    })
  }, [invPage1, invPage2])

  const allUnpaidInvoices: Invoice[] = [
    ...(allUnpaidData?.invoices  ?? []),
    ...(allSentData?.invoices    ?? []),
    ...(allPartialData?.invoices ?? []),
  ]

  const customerMap = Object.fromEntries(
    (customersData?.customers ?? []).map(c => [c.id, c.name])
  )

  const applyPreset = (p: typeof PRESETS[0]) => {
    setPreset(p); setFrom(p.from); setTo(p.to); setShowPresets(false)
  }

  // ─── P&L data ──────────────────────────────────────────────────────────────
  const plData = useMemo(() => {
    const nonCancelledInvoices = invoices.filter(i => i.status !== 'CANCELLED')
    const totalInvoiced   = nonCancelledInvoices.reduce((s, i) => s + n(i.total_amount), 0)
    const totalCollected  = nonCancelledInvoices.reduce((s, i) => s + n(i.paid_amount), 0)
    const totalOutstanding= nonCancelledInvoices.reduce((s, i) => s + n(i.outstanding_amount), 0)
    const totalDiscount   = nonCancelledInvoices.reduce((s, i) => s + n(i.discount_amount), 0)
    const totalTax        = nonCancelledInvoices.reduce((s, i) => s + n(i.tax_amount), 0)
    const subtotal        = nonCancelledInvoices.reduce((s, i) => s + n(i.subtotal), 0)
    const overdueAmount   = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + n(i.outstanding_amount), 0)

    // Month-by-month breakdown
    const byMonth: Record<string, { invoiced: number; collected: number; tax: number; count: number }> = {}
    for (const inv of nonCancelledInvoices) {
      const key = inv.issue_date?.slice(0, 7) ?? 'Unknown'
      if (!byMonth[key]) byMonth[key] = { invoiced: 0, collected: 0, tax: 0, count: 0 }
      byMonth[key].invoiced   += n(inv.total_amount)
      byMonth[key].collected  += n(inv.paid_amount)
      byMonth[key].tax        += n(inv.tax_amount)
      byMonth[key].count      += 1
    }
    const months = Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b))

    const count = nonCancelledInvoices.length
    return { totalInvoiced, totalCollected, totalOutstanding, totalDiscount, totalTax, subtotal, overdueAmount, months, count }
  }, [invoices])

  // ─── VAT data ──────────────────────────────────────────────────────────────
  const vatData = useMemo(() => {
    const nonCancelledInvoices = invoices.filter(i => i.status !== 'CANCELLED')
    const vatInvoices = nonCancelledInvoices.filter(i => n(i.tax_amount) > 0)
    const totalVAT    = vatInvoices.reduce((s, i) => s + n(i.tax_amount), 0)
    const totalNet    = vatInvoices.reduce((s, i) => s + n(i.subtotal), 0)
    const totalGross  = vatInvoices.reduce((s, i) => s + n(i.total_amount), 0)

    // Per-invoice VAT rows
    const rows = vatInvoices.map(inv => ({
      invoice_number: inv.invoice_number,
      customer:       customerMap[inv.customer_id] ?? '—',
      date:           inv.issue_date,
      net:            n(inv.subtotal),
      vat:            n(inv.tax_amount),
      gross:          n(inv.total_amount),
      status:         inv.status,
    }))

    return { totalVAT, totalNet, totalGross, rows }
  }, [invoices, customerMap])

  // ─── Aged Receivables ──────────────────────────────────────────────────────
  const agedData = useMemo(() => {
    // Use dedicated unpaid fetches (not date-filtered) so aged report shows all outstanding
    const unpaid = allUnpaidInvoices.filter(i => n(i.outstanding_amount) > 0)
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, over90: 0 }
    const rows = unpaid.map(inv => {
      const due = inv.due_date ? new Date(inv.due_date) : new Date()
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000)
      const amt = n(inv.outstanding_amount)
      if (daysOverdue <= 0)        buckets.current += amt
      else if (daysOverdue <= 30)  buckets.d30     += amt
      else if (daysOverdue <= 60)  buckets.d60     += amt
      else if (daysOverdue <= 90)  buckets.d90     += amt
      else                         buckets.over90  += amt
      return {
        customer:       customerMap[inv.customer_id] ?? '—',
        invoice_number: inv.invoice_number,
        due_date:       inv.due_date,
        days_overdue:   Math.max(0, daysOverdue),
        outstanding:    amt,
        status:         inv.status,
      }
    }).sort((a, b) => b.days_overdue - a.days_overdue)

    const total = Object.values(buckets).reduce((s, v) => s + v, 0)
    return { buckets, rows, total }
  }, [allUnpaidInvoices, customerMap])

  // ─── Product Sales ─────────────────────────────────────────────────────────
  const productData = useMemo(() => {
    const products = productsData?.products ?? []
    return products
      .filter(p => p.usage_count > 0)
      .sort((a, b) => b.usage_count - a.usage_count)
      .map(p => ({
        name:        p.name,
        sku:         p.sku ?? '—',
        category:    p.category ?? '—',
        unit_price:  n(p.unit_price),
        usage_count: p.usage_count ?? 0,
        revenue:     n(p.unit_price) * (p.usage_count ?? 0),
        stock:       p.track_inventory ? (p.quantity_in_stock ?? 0) : null,
        last_used:   p.last_used_at,
      }))
  }, [productsData])

  const isLoading = invLoading1 || invLoading2 || prodLoading

  // ─── Style tokens ──────────────────────────────────────────────────────────
  const S = {
    card:    { background:'#fff', border:'1px solid #ddd9cf', borderRadius:12, overflow:'hidden', marginBottom:20 },
    thead:   { background:'#faf9f6' },
    th:      { padding:'10px 14px', fontSize:11, fontWeight:500, color:'#9e9990', textTransform:'uppercase' as const, letterSpacing:'0.5px', borderBottom:'1px solid #ddd9cf', whiteSpace:'nowrap' as const },
    td:      { padding:'11px 14px', fontSize:13, color:'#2c2a24', borderBottom:'1px solid #f0ede6' },
    tdR:     { padding:'11px 14px', fontSize:13, color:'#2c2a24', borderBottom:'1px solid #f0ede6', textAlign:'right' as const },
    sum:     { padding:'12px 14px', fontSize:13, fontWeight:600, color:'#0f0e0b', background:'#faf9f6', textAlign:'right' as const },
    sumL:    { padding:'12px 14px', fontSize:13, fontWeight:600, color:'#0f0e0b', background:'#faf9f6' },
    kpiWrap: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, marginBottom:20 },
    kpi:     { background:'#fff', border:'1px solid #ddd9cf', borderRadius:12, padding:'18px 20px' },
    kpiLbl:  { fontSize:11, fontWeight:500, color:'#9e9990', textTransform:'uppercase' as const, letterSpacing:'0.5px', marginBottom:6 },
    kpiVal:  { fontSize:22, fontWeight:700, color:'#0f0e0b', fontFamily:"'Fraunces',serif" },
    kpiSub:  { fontSize:11, color:'#9e9990', marginTop:4 },
    btnGold: { display:'inline-flex' as const, alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, fontSize:12.5, fontWeight:500, cursor:'pointer', background:'#c8952a', border:'none', color:'#0f0e0b' },
    btnOut:  { display:'inline-flex' as const, alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, fontSize:12.5, fontWeight:500, cursor:'pointer', background:'#fff', border:'1px solid #ddd9cf', color:'#2c2a24' },
  }

  const tabStyle = (t: ReportTab) => ({
    padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer',
    background: tab === t ? '#0f0e0b' : 'transparent',
    color:      tab === t ? '#fff'    : '#6b6560',
    border:     'none',
  })

  const metaLine = `Period: ${fmtDate(from)} – ${fmtDate(to)} · Generated ${fmtDate(iso(today))}`

  if (isLoading) return (
    <>
      <div className="topbar"><div className="topbar-title">Reports</div></div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', flex:1, gap:12, color:'#9e9990' }}>
        <Loader2 size={28} style={{ animation:'spin 1s linear infinite' }} />
        <span>Generating reports…</span>
      </div>
      <style jsx>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">Reports</div>
        <div className="topbar-actions">

          {/* Date range preset picker */}
          <div style={{ position:'relative' }}>
            <button style={S.btnOut} onClick={() => setShowPresets(v => !v)}>
              {preset.label} <ChevronDown size={13} />
            </button>
            {showPresets && (
              <div style={{ position:'absolute', top:'calc(100% + 6px)', right:0, background:'#fff',
                border:'1px solid #ddd9cf', borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,0.12)',
                zIndex:100, minWidth:160, overflow:'hidden' }}>
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => applyPreset(p)}
                    style={{ display:'block', width:'100%', padding:'10px 16px', textAlign:'left',
                      fontSize:13, background: preset.label === p.label ? '#faf9f6' : '#fff',
                      border:'none', cursor:'pointer', color:'#2c2a24',
                      fontWeight: preset.label === p.label ? 600 : 400 }}>
                    {p.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Custom date range */}
          <input type="date" value={from} max={to}
            onChange={e => { setFrom(e.target.value); setPreset({ label:'Custom', from:e.target.value, to }) }}
            style={{ padding:'7px 10px', border:'1px solid #ddd9cf', borderRadius:8, fontSize:12.5, color:'#2c2a24', background:'#fff' }} />
          <span style={{ color:'#9e9990', fontSize:13 }}>→</span>
          <input type="date" value={to} min={from}
            onChange={e => { setTo(e.target.value); setPreset({ label:'Custom', from, to:e.target.value }) }}
            style={{ padding:'7px 10px', border:'1px solid #ddd9cf', borderRadius:8, fontSize:12.5, color:'#2c2a24', background:'#fff' }} />
        </div>
      </div>

      <div className="content">
        {/* Tab nav */}
        <div style={{ display:'flex', gap:4, background:'#faf9f6', padding:4, borderRadius:10, marginBottom:24, width:'fit-content', border:'1px solid #ddd9cf' }}>
          {([
            ['pl',       'trending-up',    'P & L'],
            ['vat',      'file-text',      'VAT'],
            ['aged',     'alert-circle',   'Aged Receivables'],
            ['products', 'package',        'Product Sales'],
          ] as [ReportTab, string, string][]).map(([t, iconName, label]) => (
            <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
              {iconName === 'trending-up'  && <TrendingUp  size={14} />}
              {iconName === 'file-text'    && <FileText    size={14} />}
              {iconName === 'alert-circle' && <AlertCircle size={14} />}
              {iconName === 'package'      && <Package     size={14} />}
              {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════ P&L REPORT ══════════════════════════════════ */}
        {tab === 'pl' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:'#0f0e0b' }}>Profit & Loss</div>
                <div style={{ fontSize:12, color:'#9e9990', marginTop:2 }}>{metaLine}</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={S.btnOut} onClick={() => printReport('P&L Report', 'pl-table', metaLine)}>
                  <Download size={13} /> PDF
                </button>
                <button style={S.btnGold} onClick={() => downloadCSV(
                  `pl-report-${from}-${to}.csv`,
                  plData.months.map(([m, v]) => [m, v.count, v.invoiced.toFixed(2), v.collected.toFixed(2), v.tax.toFixed(2)]),
                  ['Month', 'Invoices', 'Total Invoiced (₦)', 'Collected (₦)', 'Tax (₦)']
                )}>
                  <Download size={13} /> CSV
                </button>
              </div>
            </div>

            {/* KPIs */}
            <div style={S.kpiWrap}>
              {[
                { label:'Total Invoiced',    val: fmt(plData.totalInvoiced),    sub:`${plData.count} invoices` },
                { label:'Revenue Collected', val: fmt(plData.totalCollected),   sub:`${Math.round(plData.totalCollected / (plData.totalInvoiced || 1) * 100)}% collection rate`, gold: true },
                { label:'Outstanding',       val: fmt(plData.totalOutstanding), sub:'Unpaid balance' },
                { label:'Overdue',           val: fmt(plData.overdueAmount),    sub:'Past due date', red: plData.overdueAmount > 0 },
                { label:'Total VAT',         val: fmt(plData.totalTax),         sub:'7.5% standard rate' },
                { label:'Total Discounts',   val: fmt(plData.totalDiscount),    sub:'Given to customers' },
              ].map(k => (
                <div key={k.label} style={S.kpi}>
                  <div style={S.kpiLbl}>{k.label}</div>
                  <div style={{ ...S.kpiVal, color: k.gold ? '#c8952a' : k.red ? '#b83232' : '#0f0e0b' }}>{k.val}</div>
                  <div style={S.kpiSub}>{k.sub}</div>
                </div>
              ))}
            </div>

            {/* Month-by-month table */}
            <div style={S.card}>
              <table id="pl-table" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={S.thead}>
                  <tr>
                    {['Month','Invoices','Subtotal','Discounts','VAT','Total Invoiced','Collected','Outstanding'].map(h => (
                      <th key={h} style={{ ...S.th, textAlign: h === 'Month' || h === 'Invoices' ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plData.months.length === 0
                    ? <tr><td colSpan={8} style={{ ...S.td, textAlign:'center', color:'#9e9990', padding:32 }}>No invoices in this period</td></tr>
                    : plData.months.map(([month, v]) => {
                        const outstanding = v.invoiced - v.collected
                        return (
                          <tr key={month}>
                            <td style={S.td}>{month}</td>
                            <td style={S.td}>{v.count}</td>
                            <td style={S.tdR}>{fmt(v.invoiced - v.tax)}</td>
                            <td style={S.tdR}>—</td>
                            <td style={S.tdR}>{fmt(v.tax)}</td>
                            <td style={S.tdR}>{fmt(v.invoiced)}</td>
                            <td style={{ ...S.tdR, color:'#1a6b4a' }}>{fmt(v.collected)}</td>
                            <td style={{ ...S.tdR, color: outstanding > 0 ? '#b83232' : '#9e9990' }}>{fmt(outstanding)}</td>
                          </tr>
                        )
                      })
                  }
                </tbody>
                {plData.months.length > 0 && (
                  <tfoot>
                    <tr>
                      <td style={S.sumL}>Total</td>
                      <td style={S.sum}>{plData.count}</td>
                      <td style={S.sum}>{fmt(plData.subtotal)}</td>
                      <td style={S.sum}>{fmt(plData.totalDiscount)}</td>
                      <td style={S.sum}>{fmt(plData.totalTax)}</td>
                      <td style={S.sum}>{fmt(plData.totalInvoiced)}</td>
                      <td style={{ ...S.sum, color:'#1a6b4a' }}>{fmt(plData.totalCollected)}</td>
                      <td style={{ ...S.sum, color:'#b83232' }}>{fmt(plData.totalOutstanding)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}

        {/* ══════════════════════ VAT REPORT ══════════════════════════════════ */}
        {tab === 'vat' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:'#0f0e0b' }}>VAT Report</div>
                <div style={{ fontSize:12, color:'#9e9990', marginTop:2 }}>{metaLine} · Standard rate 7.5% (FIRS)</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={S.btnOut} onClick={() => printReport('VAT Report', 'vat-table', metaLine)}>
                  <Download size={13} /> PDF
                </button>
                <button style={S.btnGold} onClick={() => downloadCSV(
                  `vat-report-${from}-${to}.csv`,
                  vatData.rows.map(r => [r.invoice_number, r.customer, fmtDate(r.date ?? null), r.net.toFixed(2), r.vat.toFixed(2), r.gross.toFixed(2), r.status]),
                  ['Invoice #', 'Customer', 'Date', 'Net Amount (₦)', 'VAT (₦)', 'Gross (₦)', 'Status']
                )}>
                  <Download size={13} /> CSV
                </button>
              </div>
            </div>

            <div style={S.kpiWrap}>
              {[
                { label:'Total Net Sales',   val: fmt(vatData.totalNet)   },
                { label:'Total VAT Charged', val: fmt(vatData.totalVAT), gold: true },
                { label:'Total Gross',       val: fmt(vatData.totalGross)  },
                { label:'VAT-able Invoices', val: String(vatData.rows.length) },
              ].map(k => (
                <div key={k.label} style={S.kpi}>
                  <div style={S.kpiLbl}>{k.label}</div>
                  <div style={{ ...S.kpiVal, color: k.gold ? '#c8952a' : '#0f0e0b' }}>{k.val}</div>
                </div>
              ))}
            </div>

            <div style={{ background:'#fff3cd', border:'1px solid #f5d76e', borderRadius:10, padding:'12px 16px', marginBottom:16, fontSize:12.5, color:'#856404' }}>
              ⚠ This report is for reference only. File your VAT returns directly on the FIRS TaxPro Max portal. Consult a tax professional for compliance advice.
            </div>

            <div style={S.card}>
              <table id="vat-table" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={S.thead}>
                  <tr>
                    {['Invoice #','Customer','Date','Net Amount','VAT (7.5%)','Gross Amount','Status'].map(h => (
                      <th key={h} style={{ ...S.th, textAlign: ['Invoice #','Customer','Date'].includes(h) ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vatData.rows.length === 0
                    ? <tr><td colSpan={7} style={{ ...S.td, textAlign:'center', color:'#9e9990', padding:32 }}>No VAT-able invoices in this period</td></tr>
                    : vatData.rows.map(r => (
                        <tr key={r.invoice_number}>
                          <td style={{ ...S.td, fontFamily:'monospace', fontSize:12 }}>{r.invoice_number}</td>
                          <td style={S.td}>{r.customer}</td>
                          <td style={S.td}>{fmtDate(r.date ?? null)}</td>
                          <td style={S.tdR}>{fmt(r.net)}</td>
                          <td style={{ ...S.tdR, color:'#c8952a', fontWeight:500 }}>{fmt(r.vat)}</td>
                          <td style={S.tdR}>{fmt(r.gross)}</td>
                          <td style={S.td}>
                            <span style={{ background: r.status === 'PAID' ? '#d4eddf' : '#fff3cd',
                              color: r.status === 'PAID' ? '#1a6b4a' : '#856404',
                              padding:'2px 8px', borderRadius:20, fontSize:11 }}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
                {vatData.rows.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={S.sumL}>Total</td>
                      <td style={S.sum}>{fmt(vatData.totalNet)}</td>
                      <td style={{ ...S.sum, color:'#c8952a' }}>{fmt(vatData.totalVAT)}</td>
                      <td style={S.sum}>{fmt(vatData.totalGross)}</td>
                      <td style={S.sum}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}

        {/* ══════════════════════ AGED RECEIVABLES ════════════════════════════ */}
        {tab === 'aged' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:'#0f0e0b' }}>Aged Receivables</div>
                <div style={{ fontSize:12, color:'#9e9990', marginTop:2 }}>As of {fmtDate(iso(today))} · All unpaid invoices</div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <button style={S.btnOut} onClick={() => printReport('Aged Receivables', 'aged-table', `As of ${fmtDate(iso(today))}`)}>
                  <Download size={13} /> PDF
                </button>
                <button style={S.btnGold} onClick={() => downloadCSV(
                  `aged-receivables-${iso(today)}.csv`,
                  agedData.rows.map(r => [r.customer, r.invoice_number, fmtDate(r.due_date ?? null), r.days_overdue, r.outstanding.toFixed(2), r.status]),
                  ['Customer', 'Invoice #', 'Due Date', 'Days Overdue', 'Outstanding (₦)', 'Status']
                )}>
                  <Download size={13} /> CSV
                </button>
              </div>
            </div>

            {/* Aging buckets */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
              {[
                { label:'Current',    val: agedData.buckets.current, color:'#1a6b4a', bg:'#d4eddf' },
                { label:'1–30 days',  val: agedData.buckets.d30,    color:'#856404', bg:'#fff3cd' },
                { label:'31–60 days', val: agedData.buckets.d60,    color:'#c8952a', bg:'#fde8c8' },
                { label:'61–90 days', val: agedData.buckets.d90,    color:'#b83232', bg:'#fde8e8' },
                { label:'90+ days',   val: agedData.buckets.over90, color:'#7c1a1a', bg:'#f5c6c6' },
              ].map(b => (
                <div key={b.label} style={{ background: b.bg, borderRadius:12, padding:'16px 18px',
                  border:`1px solid ${b.color}22` }}>
                  <div style={{ fontSize:11, fontWeight:500, color: b.color, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:6 }}>{b.label}</div>
                  <div style={{ fontSize:20, fontWeight:700, color: b.color, fontFamily:"'Fraunces',serif" }}>{fmt(b.val)}</div>
                </div>
              ))}
            </div>

            <div style={S.card}>
              <table id="aged-table" style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={S.thead}>
                  <tr>
                    {['Customer','Invoice #','Due Date','Days Overdue','Outstanding','Status'].map(h => (
                      <th key={h} style={{ ...S.th, textAlign: ['Customer','Invoice #','Due Date'].includes(h) ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {agedData.rows.length === 0
                    ? <tr><td colSpan={6} style={{ ...S.td, textAlign:'center', color:'#1a6b4a', padding:32 }}>🎉 No outstanding receivables!</td></tr>
                    : agedData.rows.map(r => {
                        const urgency = r.days_overdue === 0 ? '#1a6b4a' : r.days_overdue <= 30 ? '#856404' : r.days_overdue <= 60 ? '#c8952a' : '#b83232'
                        return (
                          <tr key={r.invoice_number}>
                            <td style={S.td}>{r.customer}</td>
                            <td style={{ ...S.td, fontFamily:'monospace', fontSize:12 }}>{r.invoice_number}</td>
                            <td style={S.td}>{fmtDate(r.due_date ?? null)}</td>
                            <td style={{ ...S.tdR, color: urgency, fontWeight:600 }}>
                              {r.days_overdue === 0 ? 'Current' : `${r.days_overdue}d`}
                            </td>
                            <td style={{ ...S.tdR, fontWeight:600 }}>{fmt(r.outstanding)}</td>
                            <td style={S.td}>
                              <span style={{ background: urgency + '22', color: urgency,
                                padding:'2px 8px', borderRadius:20, fontSize:11 }}>{r.status}</span>
                            </td>
                          </tr>
                        )
                      })
                  }
                </tbody>
                {agedData.rows.length > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={S.sumL}>Total Outstanding</td>
                      <td style={{ ...S.sum, color:'#b83232' }}>{fmt(agedData.total)}</td>
                      <td style={S.sum}></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}

        {/* ══════════════════════ PRODUCT SALES ════════════════════════════════ */}
        {tab === 'products' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:700, color:'#0f0e0b' }}>Product Sales</div>
                <div style={{ fontSize:12, color:'#9e9990', marginTop:2 }}>All time · Ranked by usage</div>
              </div>
              <button style={S.btnGold} onClick={() => downloadCSV(
                `product-sales-${iso(today)}.csv`,
                productData.map(p => [p.name, p.sku, p.category, n(p.unit_price).toFixed(2), p.usage_count, n(p.revenue).toFixed(2), p.stock ?? 'N/A', fmtDate(p.last_used ?? null)]),
                ['Product','SKU','Category','Unit Price (₦)','Times Sold','Est. Revenue (₦)','Stock','Last Used']
              )}>
                <Download size={13} /> CSV
              </button>
            </div>

            <div style={S.kpiWrap}>
              {[
                { label:'Products Tracked', val: String(productData.length) },
                { label:'Most Sold',        val: productData[0]?.name ?? '—', sub:`${productData[0]?.usage_count ?? 0} times` },
                { label:'Est. Total Revenue', val: fmt(productData.reduce((s, p) => s + p.revenue, 0)), gold: true },
                { label:'Total Units Sold', val: String(productData.reduce((s, p) => s + p.usage_count, 0)) },
              ].map(k => (
                <div key={k.label} style={S.kpi}>
                  <div style={S.kpiLbl}>{k.label}</div>
                  <div style={{ ...S.kpiVal, fontSize:k.val.length > 12 ? 16 : 22, color: k.gold ? '#c8952a' : '#0f0e0b' }}>{k.val}</div>
                  {k.sub && <div style={S.kpiSub}>{k.sub}</div>}
                </div>
              ))}
            </div>

            {/* Mini bar chart — top 8 */}
            {productData.length > 0 && (
              <div style={{ ...S.card, padding:20, marginBottom:20 }}>
                <div style={{ fontSize:12, fontWeight:500, color:'#9e9990', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:14 }}>Top Products by Usage</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {productData.slice(0, 8).map((p, i) => {
                    const pct = (p.usage_count / productData[0].usage_count) * 100
                    return (
                      <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ fontSize:11, color:'#9e9990', width:18, textAlign:'right' }}>#{i+1}</div>
                        <div style={{ fontSize:13, color:'#2c2a24', width:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</div>
                        <div style={{ flex:1, background:'#f0ede6', borderRadius:4, height:10, overflow:'hidden' }}>
                          <div style={{ width:`${pct}%`, height:'100%', background:'#c8952a', borderRadius:4, transition:'width 0.5s ease' }} />
                        </div>
                        <div style={{ fontSize:12, color:'#6b6560', width:60, textAlign:'right' }}>{p.usage_count}×</div>
                        <div style={{ fontSize:12, fontWeight:600, color:'#0f0e0b', width:90, textAlign:'right' }}>{fmt(p.revenue)}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={S.card}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead style={S.thead}>
                  <tr>
                    {['#','Product','SKU','Category','Unit Price','Times Sold','Est. Revenue','Stock','Last Used'].map(h => (
                      <th key={h} style={{ ...S.th, textAlign: ['#','Product','SKU','Category'].includes(h) ? 'left' : 'right' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {productData.length === 0
                    ? <tr><td colSpan={9} style={{ ...S.td, textAlign:'center', color:'#9e9990', padding:32 }}>No product sales data yet</td></tr>
                    : productData.map((p, i) => (
                        <tr key={p.name}>
                          <td style={{ ...S.td, color:'#9e9990', fontSize:12 }}>{i+1}</td>
                          <td style={{ ...S.td, fontWeight:500 }}>{p.name}</td>
                          <td style={{ ...S.td, fontFamily:'monospace', fontSize:11, color:'#9e9990' }}>{p.sku}</td>
                          <td style={S.td}>{p.category}</td>
                          <td style={S.tdR}>{fmt(p.unit_price)}</td>
                          <td style={{ ...S.tdR, fontWeight:600 }}>{p.usage_count}</td>
                          <td style={{ ...S.tdR, color:'#c8952a', fontWeight:600 }}>{fmt(p.revenue)}</td>
                          <td style={{ ...S.tdR, color: p.stock === null ? '#9e9990' : p.stock === 0 ? '#b83232' : p.stock <= 10 ? '#856404' : '#1a6b4a' }}>
                            {p.stock === null ? '—' : p.stock}
                          </td>
                          <td style={S.tdR}>{fmtDate(p.last_used)}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:8px;flex-shrink:0;flex-wrap:wrap}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .topbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .content{flex:1;overflow-y:auto;padding:28px;background:#f5f5f0}
        @media(max-width:768px){
          .content{padding:16px}
          .topbar{height:auto;padding:12px 16px;gap:8px}
        }
      `}</style>
    </>
  )
}