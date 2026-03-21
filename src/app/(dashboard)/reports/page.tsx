'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import { Loader2, Download, FileText, TrendingUp, AlertCircle, Package, ChevronDown, X } from 'lucide-react'
import { useInvoices } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { useProducts } from '@/lib/hooks/useProducts'
import type { Invoice } from '@/lib/types'

const fmt = (n: number) => {
  const abs = Math.abs(n || 0)
  if (abs >= 1_000_000_000) return `₦${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000)     return `₦${(abs / 1_000_000).toFixed(1)}M`
  return '₦' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(abs)
}
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
const n = (v: string | number | null | undefined) => typeof v === 'string' ? parseFloat(v) || 0 : v || 0

const today = new Date()
const iso = (d: Date) => d.toISOString().split('T')[0]

const PRESETS = [
  { label: 'This Month',    from: iso(new Date(today.getFullYear(), today.getMonth(), 1)),     to: iso(today) },
  { label: 'Last Month',   from: iso(new Date(today.getFullYear(), today.getMonth() - 1, 1)), to: iso(new Date(today.getFullYear(), today.getMonth(), 0)) },
  { label: 'Last 3 Months',from: iso(new Date(today.getFullYear(), today.getMonth() - 3, 1)), to: iso(today) },
  { label: 'This Year',    from: iso(new Date(today.getFullYear(), 0, 1)),                    to: iso(today) },
  { label: 'Last Year',    from: iso(new Date(today.getFullYear() - 1, 0, 1)),               to: iso(new Date(today.getFullYear() - 1, 11, 31)) },
  { label: 'All Time',     from: '2020-01-01',                                                to: iso(today) },
]

function downloadCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const escape = (v: string | number) => { const s = String(v); return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s }
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
}

function printReport(title: string, tableId: string, meta: string) {
  const table = document.getElementById(tableId)?.outerHTML ?? ''
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><title>${title}</title><style>body{font-family:Arial,sans-serif;font-size:11px;margin:24px}h1{font-size:18px;margin:0 0 4px}.meta{color:#666;font-size:10px;margin-bottom:16px}table{width:100%;border-collapse:collapse}th{background:#f4f2eb;font-size:10px;text-transform:uppercase;letter-spacing:.4px;padding:6px 8px;text-align:left;border-bottom:2px solid #c8952a}td{padding:6px 8px;border-bottom:1px solid #eee;font-size:11px}.right{text-align:right}@media print{@page{margin:16mm}}</style></head><body><h1>${title}</h1><div class="meta">${meta}</div>${table}</body></html>`)
  win.document.close(); win.print()
}

type ReportTab = 'pl' | 'vat' | 'aged' | 'products'

function ReportsPageInner() {
  const [tab, setTab]             = useState<ReportTab>('pl')
  const [preset, setPreset]       = useState(PRESETS[0])
  const [from, setFrom]           = useState(PRESETS[0].from)
  const [to, setTo]               = useState(PRESETS[0].to)
  const [showPresets, setShowPresets] = useState(false)
  const [showDateFilter, setShowDateFilter] = useState(false)

  const invParams = { page_size: 100, from_date: from, to_date: to }
  const { data: invPage1, isLoading: invLoading1 } = useInvoices({ ...invParams, page: 1 })
  const { data: invPage2, isLoading: invLoading2 } = useInvoices({ ...invParams, page: 2 })
  const { data: allUnpaidData }  = useInvoices({ page_size: 100, status: 'OVERDUE', page: 1 })
  const { data: allSentData }    = useInvoices({ page_size: 100, status: 'SENT', page: 1 })
  const { data: allPartialData } = useInvoices({ page_size: 100, status: 'PARTIALLY_PAID', page: 1 })
  const { data: productsData, isLoading: prodLoading } = useProducts({ limit: 100 })
  const { data: customersData } = useCustomers({ skip: 0, limit: 100 })

  const [expensesByPeriod, setExpensesByPeriod] = useState<{ total: number; cogs: number; opex: number; finance: number; tax_expense: number } | null>(null)
  const [expenseSummary, setExpenseSummary] = useState<{ total_expenses: number; total_deductible: number; ytd_revenue: number; net_profit: number; profit_margin: number; groups: { group: string; total: number; categories: { category: string; label: string; amount: number }[] }[] } | null>(null)

  useEffect(() => {
    const year = new Date(from).getFullYear()
    fetch('/api/proxy/expenses/summary?year=' + year, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => setExpenseSummary(d)).catch(() => {})
    fetch('/api/proxy/expenses/?page_size=100&from_date=' + from + '&to_date=' + to, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(d => {
      if (!d?.expenses) return
      const expenses = d.expenses as Array<{ category: string; category_label: string; amount: number }>
      const COGS_CATS = ['COST_OF_SALES']; const FINANCE_CATS = ['BANK_CHARGES', 'LOAN_INTEREST', 'LOAN_REPAYMENT']; const TAX_CATS = ['COMPANY_TAX', 'VAT_REMITTED', 'WHT_REMITTED', 'PAYE_TAX', 'GOVT_LEVIES']
      const cogs = expenses.filter(e => COGS_CATS.includes(e.category)).reduce((s, e) => s + e.amount, 0)
      const finance = expenses.filter(e => FINANCE_CATS.includes(e.category)).reduce((s, e) => s + e.amount, 0)
      const taxExp = expenses.filter(e => TAX_CATS.includes(e.category)).reduce((s, e) => s + e.amount, 0)
      const opex = expenses.filter(e => !COGS_CATS.includes(e.category) && !FINANCE_CATS.includes(e.category) && !TAX_CATS.includes(e.category)).reduce((s, e) => s + e.amount, 0)
      const total = expenses.reduce((s, e) => s + e.amount, 0)
      setExpensesByPeriod({ total, cogs, opex, finance, tax_expense: taxExp })
    }).catch(() => {})
  }, [from, to])

  const allInvoices: Invoice[] = [...(invPage1?.invoices ?? []), ...(invPage2?.invoices ?? [])]
  const invoices = useMemo(() => { const seen = new Set<string>(); return allInvoices.filter(inv => { if (seen.has(inv.id)) return false; seen.add(inv.id); return true }) }, [invPage1, invPage2])
  const allUnpaidInvoices: Invoice[] = [...(allUnpaidData?.invoices ?? []), ...(allSentData?.invoices ?? []), ...(allPartialData?.invoices ?? [])]
  const customerMap = Object.fromEntries((customersData?.customers ?? []).map(c => [c.id, c.name]))

  const applyPreset = (p: typeof PRESETS[0]) => { setPreset(p); setFrom(p.from); setTo(p.to); setShowPresets(false); setShowDateFilter(false) }

  const plData = useMemo(() => {
    const nc = invoices.filter(i => i.status !== 'CANCELLED')
    const totalInvoiced = nc.reduce((s, i) => s + n(i.total_amount), 0)
    const totalCollected = nc.reduce((s, i) => s + n(i.paid_amount), 0)
    const totalOutstanding = nc.reduce((s, i) => s + n(i.outstanding_amount), 0)
    const totalDiscount = nc.reduce((s, i) => s + n(i.discount_amount), 0)
    const totalTax = nc.reduce((s, i) => s + n(i.tax_amount), 0)
    const subtotal = nc.reduce((s, i) => s + n(i.subtotal), 0)
    const overdueAmount = invoices.filter(i => i.status === 'OVERDUE').reduce((s, i) => s + n(i.outstanding_amount), 0)
    const byMonth: Record<string, { invoiced: number; collected: number; tax: number; count: number }> = {}
    for (const inv of nc) {
      const key = inv.issue_date?.slice(0, 7) ?? 'Unknown'
      if (!byMonth[key]) byMonth[key] = { invoiced: 0, collected: 0, tax: 0, count: 0 }
      byMonth[key].invoiced  += n(inv.total_amount); byMonth[key].collected += n(inv.paid_amount)
      byMonth[key].tax       += n(inv.tax_amount);   byMonth[key].count     += 1
    }
    return { totalInvoiced, totalCollected, totalOutstanding, totalDiscount, totalTax, subtotal, overdueAmount, months: Object.entries(byMonth).sort(([a], [b]) => a.localeCompare(b)), count: nc.length }
  }, [invoices])

  const vatData = useMemo(() => {
    const vi = invoices.filter(i => i.status !== 'CANCELLED' && n(i.tax_amount) > 0)
    return { totalVAT: vi.reduce((s, i) => s + n(i.tax_amount), 0), totalNet: vi.reduce((s, i) => s + n(i.subtotal), 0), totalGross: vi.reduce((s, i) => s + n(i.total_amount), 0), rows: vi.map(inv => ({ invoice_number: inv.invoice_number, customer: customerMap[inv.customer_id] ?? '—', date: inv.issue_date, net: n(inv.subtotal), vat: n(inv.tax_amount), gross: n(inv.total_amount), status: inv.status })) }
  }, [invoices, customerMap])

  const agedData = useMemo(() => {
    const unpaid = allUnpaidInvoices.filter(i => n(i.outstanding_amount) > 0)
    const buckets = { current: 0, d30: 0, d60: 0, d90: 0, over90: 0 }
    const rows = unpaid.map(inv => {
      const due = inv.due_date ? new Date(inv.due_date) : new Date()
      const daysOverdue = Math.floor((today.getTime() - due.getTime()) / 86400000)
      const amt = n(inv.outstanding_amount)
      if (daysOverdue <= 0) buckets.current += amt
      else if (daysOverdue <= 30) buckets.d30 += amt
      else if (daysOverdue <= 60) buckets.d60 += amt
      else if (daysOverdue <= 90) buckets.d90 += amt
      else buckets.over90 += amt
      return { customer: customerMap[inv.customer_id] ?? '—', invoice_number: inv.invoice_number, due_date: inv.due_date, days_overdue: Math.max(0, daysOverdue), outstanding: amt, status: inv.status }
    }).sort((a, b) => b.days_overdue - a.days_overdue)
    return { buckets, rows, total: Object.values(buckets).reduce((s, v) => s + v, 0) }
  }, [allUnpaidInvoices, customerMap])

  const productData = useMemo(() =>
    (productsData?.products ?? []).filter(p => p.usage_count > 0).sort((a, b) => b.usage_count - a.usage_count)
    .map(p => ({ name: p.name, sku: p.sku ?? '—', category: p.category ?? '—', unit_price: n(p.unit_price), usage_count: p.usage_count ?? 0, revenue: n(p.unit_price) * (p.usage_count ?? 0), stock: p.track_inventory ? (p.quantity_in_stock ?? 0) : null, last_used: p.last_used_at }))
  , [productsData])

  const isLoading = invLoading1 || invLoading2 || prodLoading
  const metaLine = `Period: ${fmtDate(from)} – ${fmtDate(to)} · Generated ${fmtDate(iso(today))}`

  const S = {
    card:  { background: '#fff', border: '1px solid #ddd9cf', borderRadius: 12, overflow: 'hidden', marginBottom: 20 },
    th:    { padding: '10px 12px', fontSize: 11, fontWeight: 500, color: '#9e9990', textTransform: 'uppercase' as const, letterSpacing: '0.5px', borderBottom: '1px solid #ddd9cf', whiteSpace: 'nowrap' as const, background: '#faf9f6' },
    td:    { padding: '10px 12px', fontSize: 13, color: '#2c2a24', borderBottom: '1px solid #f0ede6' },
    tdR:   { padding: '10px 12px', fontSize: 13, color: '#2c2a24', borderBottom: '1px solid #f0ede6', textAlign: 'right' as const },
    sum:   { padding: '11px 12px', fontSize: 13, fontWeight: 600, color: '#0f0e0b', background: '#faf9f6', textAlign: 'right' as const },
    sumL:  { padding: '11px 12px', fontSize: 13, fontWeight: 600, color: '#0f0e0b', background: '#faf9f6' },
    kpiWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 18 },
    kpi:   { background: '#fff', border: '1px solid #ddd9cf', borderRadius: 12, padding: '16px' },
    kpiLbl: { fontSize: 11, fontWeight: 500, color: '#9e9990', textTransform: 'uppercase' as const, letterSpacing: '0.5px', marginBottom: 6 },
    kpiVal: { fontSize: 20, fontWeight: 700, color: '#0f0e0b', fontFamily: "'Fraunces',serif" },
    btnOut:  { display: 'inline-flex' as const, alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', background: '#fff', border: '1px solid #ddd9cf', color: '#2c2a24' },
    btnGold: { display: 'inline-flex' as const, alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, cursor: 'pointer', background: '#c8952a', border: 'none', color: '#0f0e0b' },
  }

  const tabStyle = (t: ReportTab) => ({
    padding: '9px 14px', borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: 'pointer',
    background: tab === t ? '#0f0e0b' : 'transparent', color: tab === t ? '#fff' : '#6b6560', border: 'none', whiteSpace: 'nowrap' as const,
  })

  if (isLoading) return (
    <>
      <div className="topbar"><div className="topbar-title">Reports</div></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: '#9e9990' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /><span>Generating reports…</span>
      </div>
      <style jsx>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      {/* Topbar — stacks vertically on mobile */}
      <div className="topbar">
        <div className="topbar-title">Reports</div>
        <div className="topbar-actions">
          {/* Preset picker */}
          <div style={{ position: 'relative' }}>
            <button style={S.btnOut} onClick={() => { setShowPresets(v => !v); setShowDateFilter(false) }}>
              <span className="preset-label">{preset.label}</span> <ChevronDown size={13} />
            </button>
            {showPresets && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowPresets(false)} />
                <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, background: '#fff', border: '1px solid #ddd9cf', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, overflow: 'hidden' }}>
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => applyPreset(p)}
                      style={{ display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', fontSize: 13, background: preset.label === p.label ? '#faf9f6' : '#fff', border: 'none', cursor: 'pointer', color: '#2c2a24', fontWeight: preset.label === p.label ? 600 : 400 }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Custom date toggle — always visible */}
          <button style={S.btnOut} onClick={() => setShowDateFilter(v => !v)} title="Custom date range">
            <span className="date-label">{from.slice(0, 7)} → {to.slice(0, 7)}</span>
          </button>
        </div>
      </div>

      {/* Expandable custom date row */}
      {showDateFilter && (
        <div style={{ background: '#faf9f6', borderBottom: '1px solid #ddd9cf', padding: '12px 20px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 12, color: '#6b6560', fontWeight: 500 }}>From</label>
          <input type="date" value={from} max={to}
            onChange={e => { setFrom(e.target.value); setPreset({ label: 'Custom', from: e.target.value, to }) }}
            style={{ padding: '7px 10px', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, color: '#2c2a24' }} />
          <label style={{ fontSize: 12, color: '#6b6560', fontWeight: 500 }}>To</label>
          <input type="date" value={to} min={from}
            onChange={e => { setTo(e.target.value); setPreset({ label: 'Custom', from, to: e.target.value }) }}
            style={{ padding: '7px 10px', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, color: '#2c2a24' }} />
          <button onClick={() => setShowDateFilter(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', padding: 4, display: 'flex', alignItems: 'center' }}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="content">
        {/* Tab bar — scrollable on mobile */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 4, background: '#faf9f6', padding: 4, borderRadius: 10, width: 'fit-content', minWidth: '100%', border: '1px solid #ddd9cf', boxSizing: 'border-box' }}>
            {([['pl', <TrendingUp size={14} key="t" />, 'P & L'], ['vat', <FileText size={14} key="f" />, 'VAT'], ['aged', <AlertCircle size={14} key="a" />, 'Aged Receivables'], ['products', <Package size={14} key="p" />, 'Product Sales']] as [ReportTab, React.ReactNode, string][]).map(([t, icon, label]) => (
              <button key={t} style={{ ...tabStyle(t), display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => setTab(t)}>
                {icon}{label}
              </button>
            ))}
          </div>
        </div>

        {/* ── P&L ── */}
        {tab === 'pl' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: '#0f0e0b' }}>Profit & Loss</div>
                <div style={{ fontSize: 12, color: '#9e9990', marginTop: 2 }}>{metaLine}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button style={S.btnOut} onClick={() => printReport('P&L Report', 'pl-table', metaLine)}><Download size={13} /> PDF</button>
                <button style={S.btnGold} onClick={() => downloadCSV(`pl-report-${from}-${to}.csv`, plData.months.map(([m, v]) => [m, v.count, v.invoiced.toFixed(2), v.collected.toFixed(2), v.tax.toFixed(2)]), ['Month', 'Invoices', 'Total Invoiced (₦)', 'Collected (₦)', 'Tax (₦)'])}><Download size={13} /> CSV</button>
              </div>
            </div>

            <div style={S.kpiWrap}>
              {[
                { label: 'Total Invoiced', val: fmt(plData.totalInvoiced), sub: plData.count + ' invoices', color: '#0f0e0b' },
                { label: 'Collected', val: fmt(plData.totalCollected), sub: Math.round(plData.totalCollected / (plData.totalInvoiced || 1) * 100) + '% rate', color: '#c8952a' },
                { label: 'Outstanding', val: fmt(plData.totalOutstanding), sub: 'Unpaid balance', color: '#b83232' },
                { label: 'Total VAT', val: fmt(plData.totalTax), sub: '7.5% standard rate', color: '#0f0e0b' },
              ].map(k => (
                <div key={k.label} style={S.kpi}>
                  <div style={S.kpiLbl}>{k.label}</div>
                  <div style={{ ...S.kpiVal, color: k.color }}>{k.val}</div>
                  <div style={{ fontSize: 11, color: '#9e9990', marginTop: 4 }}>{k.sub}</div>
                </div>
              ))}
            </div>

            {expensesByPeriod && (() => {
              const revenue = plData.totalCollected
              const grossProfit = revenue - expensesByPeriod.cogs
              const ebit = grossProfit - expensesByPeriod.opex
              const netBeforeTax = ebit - expensesByPeriod.finance
              const netAfterTax = netBeforeTax - expensesByPeriod.tax_expense
              const grossMargin = revenue > 0 ? Math.round(grossProfit / revenue * 100) : 0
              const row = (label: string, val: number, indent = false, bold = false, isExpense = false, sep = false) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: bold ? '10px 0' : '7px 0', borderTop: sep ? '1px solid #ede9de' : 'none', borderBottom: bold && sep ? '2px solid #0f0e0b' : 'none' }}>
                  <span style={{ fontSize: 13, fontWeight: bold ? 700 : 400, color: bold ? '#0f0e0b' : '#4b4843', paddingLeft: indent ? 20 : 0 }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: val === 0 ? '#9e9990' : (isExpense || val < 0) ? '#b83232' : '#0f0e0b' }}>
                    {val === 0 ? '—' : (isExpense || val < 0) ? '(' + fmt(Math.abs(val)) + ')' : fmt(val)}
                  </span>
                </div>
              )
              return (
                <div style={{ ...S.card, padding: '18px 20px', marginBottom: 20 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f0e0b', marginBottom: 14, paddingBottom: 10, borderBottom: '2px solid #0f0e0b' }}>P&L Statement — {from} to {to}</div>
                  {row('Revenue (Cash Collected)', revenue)}
                  {expensesByPeriod.cogs > 0 && row('Less: Cost of Sales', expensesByPeriod.cogs, true, false, true)}
                  {row('Gross Profit', grossProfit, false, true, false, true)}
                  {grossProfit !== revenue && <div style={{ fontSize: 11, color: '#9e9990', paddingBottom: 8 }}>Gross margin: {grossMargin}%</div>}
                  {expensesByPeriod.opex > 0 && row('Less: Operating Expenses', expensesByPeriod.opex, true, false, true)}
                  {row('Net Operating Profit (EBIT)', ebit, false, true, false, true)}
                  {expensesByPeriod.finance > 0 && row('Less: Finance Costs', expensesByPeriod.finance, true, false, true)}
                  {row('Net Profit Before Tax', netBeforeTax, false, true, false, true)}
                  {expensesByPeriod.tax_expense > 0 && row('Less: Tax & Levies', expensesByPeriod.tax_expense, true, false, true)}
                  {row('Net Profit After Tax', netAfterTax, false, true, false, true)}
                  {expensesByPeriod.total === 0 && <div style={{ fontSize: 12, color: '#d97706', background: '#fef3c7', padding: '8px 12px', borderRadius: 6, marginTop: 10 }}>No expenses recorded for this period. Add expenses to see full P&L.</div>}
                </div>
              )
            })()}

            <div style={S.card}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table id="pl-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead style={{ background: '#faf9f6' }}>
                    <tr>{['Month', 'Invoices', 'Subtotal', 'VAT', 'Total Invoiced', 'Collected', 'Outstanding'].map((h, i) => <th key={h} style={{ ...S.th, textAlign: i > 0 ? 'right' : 'left' }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {plData.months.length === 0 ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9e9990', padding: 32 }}>No invoices in this period</td></tr> :
                      plData.months.map(([month, v]) => {
                        const outstanding = v.invoiced - v.collected
                        return <tr key={month}><td style={S.td}>{month}</td><td style={S.tdR}>{v.count}</td><td style={S.tdR}>{fmt(v.invoiced - v.tax)}</td><td style={S.tdR}>{fmt(v.tax)}</td><td style={S.tdR}>{fmt(v.invoiced)}</td><td style={{ ...S.tdR, color: '#1a6b4a' }}>{fmt(v.collected)}</td><td style={{ ...S.tdR, color: outstanding > 0 ? '#b83232' : '#9e9990' }}>{fmt(outstanding)}</td></tr>
                      })}
                  </tbody>
                  {plData.months.length > 0 && <tfoot><tr><td style={S.sumL}>Total</td><td style={S.sum}>{plData.count}</td><td style={S.sum}>{fmt(plData.subtotal)}</td><td style={S.sum}>{fmt(plData.totalTax)}</td><td style={S.sum}>{fmt(plData.totalInvoiced)}</td><td style={{ ...S.sum, color: '#1a6b4a' }}>{fmt(plData.totalCollected)}</td><td style={{ ...S.sum, color: '#b83232' }}>{fmt(plData.totalOutstanding)}</td></tr></tfoot>}
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── VAT ── */}
        {tab === 'vat' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: '#0f0e0b' }}>VAT Report</div>
                <div style={{ fontSize: 12, color: '#9e9990', marginTop: 2 }}>{metaLine} · Standard rate 7.5% (FIRS)</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btnOut} onClick={() => printReport('VAT Report', 'vat-table', metaLine)}><Download size={13} /> PDF</button>
                <button style={S.btnGold} onClick={() => downloadCSV(`vat-report-${from}-${to}.csv`, vatData.rows.map(r => [r.invoice_number, r.customer, fmtDate(r.date ?? null), r.net.toFixed(2), r.vat.toFixed(2), r.gross.toFixed(2), r.status]), ['Invoice #', 'Customer', 'Date', 'Net Amount (₦)', 'VAT (₦)', 'Gross (₦)', 'Status'])}><Download size={13} /> CSV</button>
              </div>
            </div>
            <div style={S.kpiWrap}>
              {[{ label: 'Total Net Sales', val: fmt(vatData.totalNet) }, { label: 'Total VAT Charged', val: fmt(vatData.totalVAT), gold: true }, { label: 'Total Gross', val: fmt(vatData.totalGross) }, { label: 'VAT-able Invoices', val: String(vatData.rows.length) }].map(k => (
                <div key={k.label} style={S.kpi}><div style={S.kpiLbl}>{k.label}</div><div style={{ ...S.kpiVal, color: k.gold ? '#c8952a' : '#0f0e0b' }}>{k.val}</div></div>
              ))}
            </div>
            <div style={{ background: '#fff3cd', border: '1px solid #f5d76e', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 12.5, color: '#856404' }}>
              ⚠ This report is for reference only. File VAT returns on the FIRS TaxPro Max portal.
            </div>
            <div style={S.card}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table id="vat-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                  <thead style={{ background: '#faf9f6' }}><tr>{['Invoice #', 'Customer', 'Date', 'Net Amount', 'VAT (7.5%)', 'Gross Amount', 'Status'].map((h, i) => <th key={h} style={{ ...S.th, textAlign: i < 3 ? 'left' : 'right' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {vatData.rows.length === 0 ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9e9990', padding: 32 }}>No VAT-able invoices in this period</td></tr> :
                      vatData.rows.map(r => (
                        <tr key={r.invoice_number}>
                          <td style={{ ...S.td, fontFamily: 'monospace', fontSize: 12 }}>{r.invoice_number}</td>
                          <td style={S.td}>{r.customer}</td>
                          <td style={S.td}>{fmtDate(r.date ?? null)}</td>
                          <td style={S.tdR}>{fmt(r.net)}</td>
                          <td style={{ ...S.tdR, color: '#c8952a', fontWeight: 500 }}>{fmt(r.vat)}</td>
                          <td style={S.tdR}>{fmt(r.gross)}</td>
                          <td style={S.td}><span style={{ background: r.status === 'PAID' ? '#d4eddf' : '#fff3cd', color: r.status === 'PAID' ? '#1a6b4a' : '#856404', padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{r.status}</span></td>
                        </tr>
                      ))}
                  </tbody>
                  {vatData.rows.length > 0 && <tfoot><tr><td colSpan={3} style={S.sumL}>Total</td><td style={S.sum}>{fmt(vatData.totalNet)}</td><td style={{ ...S.sum, color: '#c8952a' }}>{fmt(vatData.totalVAT)}</td><td style={S.sum}>{fmt(vatData.totalGross)}</td><td style={S.sum}></td></tr></tfoot>}
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Aged Receivables ── */}
        {tab === 'aged' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: '#0f0e0b' }}>Aged Receivables</div>
                <div style={{ fontSize: 12, color: '#9e9990', marginTop: 2 }}>As of {fmtDate(iso(today))} · All unpaid invoices</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={S.btnOut} onClick={() => printReport('Aged Receivables', 'aged-table', `As of ${fmtDate(iso(today))}`)}><Download size={13} /> PDF</button>
                <button style={S.btnGold} onClick={() => downloadCSV(`aged-receivables-${iso(today)}.csv`, agedData.rows.map(r => [r.customer, r.invoice_number, fmtDate(r.due_date ?? null), r.days_overdue, r.outstanding.toFixed(2), r.status]), ['Customer', 'Invoice #', 'Due Date', 'Days Overdue', 'Outstanding (₦)', 'Status'])}><Download size={13} /> CSV</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10, marginBottom: 20 }}>
              {[{ label: 'Current', val: agedData.buckets.current, color: '#1a6b4a', bg: '#d4eddf' }, { label: '1–30 days', val: agedData.buckets.d30, color: '#856404', bg: '#fff3cd' }, { label: '31–60 days', val: agedData.buckets.d60, color: '#c8952a', bg: '#fde8c8' }, { label: '61–90 days', val: agedData.buckets.d90, color: '#b83232', bg: '#fde8e8' }, { label: '90+ days', val: agedData.buckets.over90, color: '#7c1a1a', bg: '#f5c6c6' }].map(b => (
                <div key={b.label} style={{ background: b.bg, borderRadius: 10, padding: '14px 14px', border: `1px solid ${b.color}22` }}>
                  <div style={{ fontSize: 11, fontWeight: 500, color: b.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{b.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: b.color, fontFamily: "'Fraunces',serif" }}>{fmt(b.val)}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table id="aged-table" style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
                  <thead style={{ background: '#faf9f6' }}><tr>{['Customer', 'Invoice #', 'Due Date', 'Days Overdue', 'Outstanding', 'Status'].map((h, i) => <th key={h} style={{ ...S.th, textAlign: i < 3 ? 'left' : 'right' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {agedData.rows.length === 0 ? <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#1a6b4a', padding: 32 }}>🎉 No outstanding receivables!</td></tr> :
                      agedData.rows.map(r => {
                        const urgency = r.days_overdue === 0 ? '#1a6b4a' : r.days_overdue <= 30 ? '#856404' : r.days_overdue <= 60 ? '#c8952a' : '#b83232'
                        return <tr key={r.invoice_number}><td style={S.td}>{r.customer}</td><td style={{ ...S.td, fontFamily: 'monospace', fontSize: 12 }}>{r.invoice_number}</td><td style={S.td}>{fmtDate(r.due_date ?? null)}</td><td style={{ ...S.tdR, color: urgency, fontWeight: 600 }}>{r.days_overdue === 0 ? 'Current' : `${r.days_overdue}d`}</td><td style={{ ...S.tdR, fontWeight: 600 }}>{fmt(r.outstanding)}</td><td style={S.td}><span style={{ background: urgency + '22', color: urgency, padding: '2px 8px', borderRadius: 20, fontSize: 11 }}>{r.status}</span></td></tr>
                      })}
                  </tbody>
                  {agedData.rows.length > 0 && <tfoot><tr><td colSpan={4} style={S.sumL}>Total Outstanding</td><td style={{ ...S.sum, color: '#b83232' }}>{fmt(agedData.total)}</td><td style={S.sum}></td></tr></tfoot>}
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Product Sales ── */}
        {tab === 'products' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: '#0f0e0b' }}>Product Sales</div>
                <div style={{ fontSize: 12, color: '#9e9990', marginTop: 2 }}>All time · Ranked by usage</div>
              </div>
              <button style={S.btnGold} onClick={() => downloadCSV(`product-sales-${iso(today)}.csv`, productData.map(p => [p.name, p.sku, p.category, n(p.unit_price).toFixed(2), p.usage_count, n(p.revenue).toFixed(2), p.stock ?? 'N/A', fmtDate(p.last_used ?? null)]), ['Product', 'SKU', 'Category', 'Unit Price (₦)', 'Times Sold', 'Est. Revenue (₦)', 'Stock', 'Last Used'])}><Download size={13} /> CSV</button>
            </div>
            <div style={S.kpiWrap}>
              {[{ label: 'Products Tracked', val: String(productData.length) }, { label: 'Most Sold', val: productData[0]?.name ?? '—', sub: `${productData[0]?.usage_count ?? 0} times` }, { label: 'Est. Total Revenue', val: fmt(productData.reduce((s, p) => s + p.revenue, 0)), gold: true }, { label: 'Total Units Sold', val: String(productData.reduce((s, p) => s + p.usage_count, 0)) }].map(k => (
                <div key={k.label} style={S.kpi}><div style={S.kpiLbl}>{k.label}</div><div style={{ ...S.kpiVal, fontSize: k.val.length > 12 ? 15 : 20, color: k.gold ? '#c8952a' : '#0f0e0b' }}>{k.val}</div>{k.sub && <div style={{ fontSize: 11, color: '#9e9990', marginTop: 4 }}>{k.sub}</div>}</div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
                  <thead style={{ background: '#faf9f6' }}><tr>{['#', 'Product', 'Category', 'Unit Price', 'Sold', 'Est. Revenue', 'Stock'].map((h, i) => <th key={h} style={{ ...S.th, textAlign: i < 3 ? 'left' : 'right' }}>{h}</th>)}</tr></thead>
                  <tbody>
                    {productData.length === 0 ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: '#9e9990', padding: 32 }}>No product sales data yet</td></tr> :
                      productData.map((p, i) => (
                        <tr key={p.name}><td style={{ ...S.td, color: '#9e9990', fontSize: 12 }}>{i + 1}</td><td style={{ ...S.td, fontWeight: 500 }}>{p.name}</td><td style={S.td}>{p.category}</td><td style={S.tdR}>{fmt(p.unit_price)}</td><td style={{ ...S.tdR, fontWeight: 600 }}>{p.usage_count}</td><td style={{ ...S.tdR, color: '#c8952a', fontWeight: 600 }}>{fmt(p.revenue)}</td><td style={{ ...S.tdR, color: p.stock === null ? '#9e9990' : p.stock === 0 ? '#b83232' : p.stock <= 10 ? '#856404' : '#1a6b4a' }}>{p.stock === null ? '—' : p.stock}</td></tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .topbar{background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:10px;flex-shrink:0;flex-wrap:wrap;min-height:60px}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .topbar-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
        .preset-label{max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .date-label{font-size:12px;color:#6b6560}
        .content{flex:1;overflow-y:auto;padding:20px;background:#f5f5f0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .topbar{padding:10px 14px;gap:8px}
          .topbar-title{font-size:17px}
          .content{padding:12px}
        }
        @media(max-width:480px){
          .topbar{padding:10px 12px}
          .topbar-title{font-size:15px;flex:0 0 auto;width:100%}
          .topbar-actions{width:100%;justify-content:flex-start}
          .content{padding:10px}
          .preset-label{max-width:70px}
        }
      `}</style>
    </>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: '#9e9990' }}>
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: '#c8952a' }} />
        <span>Loading reports…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ReportsPageInner />
    </Suspense>
  )
}