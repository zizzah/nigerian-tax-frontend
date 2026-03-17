'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Receipt, Plus, Trash2, Edit2, RefreshCw, Loader2,
  TrendingDown, AlertCircle, CheckCircle,
  Bell, BarChart3, Heart
} from 'lucide-react'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

// ── Types ──────────────────────────────────────────────────────────────────

interface Expense {
  id: string; category: string; category_label: string
  subcategory: string | null; description: string
  amount: number; expense_date: string
  vendor_name: string | null; reference_number: string | null
  payment_method: string; is_tax_deductible: boolean
  is_recurring: boolean; recurrence_period: string | null
  next_due_date: string | null; days_until_due?: number
  is_overdue?: boolean; notes: string | null; tax_year: number | null
}

interface CategoryGroup {
  group: string; total: number
  categories: { category: string; label: string; amount: number; count: number; is_deductible: boolean }[]
}

interface MonthData {
  month: number; label: string; revenue: number
  expenses: number; profit: number; is_past: boolean; is_current: boolean
}

interface Summary {
  year: number; total_expenses: number; total_deductible: number
  ytd_revenue: number; net_profit: number; profit_margin: number
  health: string; by_category: Record<string, { label: string; amount: number; count: number }>
  groups: CategoryGroup[]; monthly: MonthData[]; due_soon: Expense[]
}

// ── Constants ─────────────────────────────────────────────────────────────

const CATEGORY_GROUPS: Record<string, string[]> = {
  'Cost of Sales':        ['COST_OF_SALES'],
  'Staff Costs':          ['SALARIES_WAGES','PAYE_TAX','PENSION_CONTRIBUTION','NHF_CONTRIBUTION','STAFF_WELFARE'],
  'Premises':             ['RENT_RATES','UTILITIES','MAINTENANCE_REPAIRS'],
  'Operations':           ['FUEL_TRANSPORT','INTERNET_TELECOM','OFFICE_SUPPLIES','EQUIPMENT_ASSETS','DEPRECIATION'],
  'Marketing':            ['MARKETING_ADS'],
  'Finance & Loans':      ['BANK_CHARGES','LOAN_REPAYMENT','LOAN_INTEREST'],
  'Professional & Legal': ['PROFESSIONAL_FEES','INSURANCE'],
  'Compliance & Tax':     ['GOVT_LEVIES','COMPANY_TAX','VAT_REMITTED','WHT_REMITTED'],
  'Other':                ['TRAVEL_ACCOMMODATION','TRAINING_DEVELOPMENT','OTHER'],
}

const CATEGORY_LABELS: Record<string, string> = {
  COST_OF_SALES:'Cost of Sales', SALARIES_WAGES:'Salaries & Wages',
  PAYE_TAX:'PAYE Tax Remitted', PENSION_CONTRIBUTION:'Pension Contribution',
  NHF_CONTRIBUTION:'NHF Contribution', STAFF_WELFARE:'Staff Welfare',
  RENT_RATES:'Rent & Rates', UTILITIES:'Utilities',
  MAINTENANCE_REPAIRS:'Maintenance & Repairs', FUEL_TRANSPORT:'Fuel & Transport',
  INTERNET_TELECOM:'Internet & Telecoms', OFFICE_SUPPLIES:'Office Supplies',
  EQUIPMENT_ASSETS:'Equipment & Assets', DEPRECIATION:'Depreciation',
  MARKETING_ADS:'Marketing & Advertising', BANK_CHARGES:'Bank Charges',
  LOAN_REPAYMENT:'Loan Repayment', LOAN_INTEREST:'Loan Interest',
  PROFESSIONAL_FEES:'Professional Fees', GOVT_LEVIES:'Government Levies',
  INSURANCE:'Insurance', COMPANY_TAX:'Company Tax (CIT)',
  VAT_REMITTED:'VAT Remitted', WHT_REMITTED:'WHT Remitted',
  TRAVEL_ACCOMMODATION:'Travel & Accommodation', TRAINING_DEVELOPMENT:'Training & Development',
  OTHER:'Other Expenses',
}

const HEALTH_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof Heart }> = {
  healthy:       { label: 'Healthy',       color: '#059669', bg: '#d1fae5', icon: Heart },
  stable:        { label: 'Stable',        color: '#2563eb', bg: '#dbeafe', icon: CheckCircle },
  breaking_even: { label: 'Breaking Even', color: '#d97706', bg: '#fef3c7', icon: AlertCircle },
  loss:          { label: 'Making a Loss', color: '#dc2626', bg: '#fee2e2', icon: TrendingDown },
  no_data:       { label: 'No Data',       color: '#9ca3af', bg: '#f3f4f6', icon: BarChart3 },
}

const fmt = (n: number) => {
  const abs = Math.abs(n || 0)
  if (abs >= 1_000_000_000) return `₦${(abs / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000)     return `₦${(abs / 1_000_000).toFixed(1)}M`
  return '₦' + new Intl.NumberFormat('en-NG', { minimumFractionDigits:0, maximumFractionDigits:0 }).format(abs)
}

const fmtDate = (d: string) => {
  try { return new Date(d).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric' }) }
  catch { return d }
}

// ── Add Expense Form ───────────────────────────────────────────────────────

interface FormData {
  category: string; subcategory: string; description: string
  amount: string; expense_date: string; vendor_name: string
  reference_number: string; payment_method: string
  is_recurring: boolean; recurrence_period: string; notes: string
}

const emptyForm = (): FormData => ({
  category: '', subcategory: '', description: '', amount: '',
  expense_date: new Date().toISOString().split('T')[0],
  vendor_name: '', reference_number: '', payment_method: 'CASH',
  is_recurring: false, recurrence_period: 'monthly', notes: '',
})

function ExpenseForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: Partial<FormData>
  onSave: (d: FormData) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<FormData>({ ...emptyForm(), ...initial })
  const set = (k: keyof FormData, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ background:'#fff', borderRadius:12, padding:24,
      border:'1px solid #ede9de', marginBottom:16 }}>
      <div style={{ fontSize:15, fontWeight:700, color:'#0f0e0b', marginBottom:20 }}>
        {initial?.category ? 'Edit Expense' : 'Add Expense'}
      </div>

      <div className="exp-grid">
        {/* Category */}
        <div className="exp-field full">
          <label className="exp-label">Category *</label>
          <select className="exp-input" value={form.category}
            onChange={e => set('category', e.target.value)}>
            <option value="">— Select category —</option>
            {Object.entries(CATEGORY_GROUPS).map(([group, cats]) => (
              <optgroup key={group} label={group}>
                {cats.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="exp-field full">
          <label className="exp-label">Description *</label>
          <input className="exp-input" type="text"
            placeholder="e.g. Office rent — March 2026"
            value={form.description}
            onChange={e => set('description', e.target.value)} />
        </div>

        {/* Amount */}
        <div className="exp-field">
          <label className="exp-label">Amount (₦) *</label>
          <input className="exp-input" type="number" min="0" step="0.01"
            placeholder="0.00" value={form.amount}
            onChange={e => set('amount', e.target.value)} />
        </div>

        {/* Date */}
        <div className="exp-field">
          <label className="exp-label">Date *</label>
          <input className="exp-input" type="date" value={form.expense_date}
            onChange={e => set('expense_date', e.target.value)} />
        </div>

        {/* Vendor */}
        <div className="exp-field">
          <label className="exp-label">Vendor / Paid To</label>
          <input className="exp-input" type="text"
            placeholder="e.g. Landlord, AEDC, MTN"
            value={form.vendor_name}
            onChange={e => set('vendor_name', e.target.value)} />
        </div>

        {/* Payment Method */}
        <div className="exp-field">
          <label className="exp-label">Payment Method</label>
          <select className="exp-input" value={form.payment_method}
            onChange={e => set('payment_method', e.target.value)}>
            {['CASH','BANK_TRANSFER','CARD','CHEQUE','MOBILE_MONEY','OTHER']
              .map(m => <option key={m} value={m}>{m.replace('_',' ')}</option>)}
          </select>
        </div>

        {/* Reference */}
        <div className="exp-field">
          <label className="exp-label">Receipt / Reference No.</label>
          <input className="exp-input" type="text"
            placeholder="e.g. RCT-001"
            value={form.reference_number}
            onChange={e => set('reference_number', e.target.value)} />
        </div>

        {/* Subcategory */}
        <div className="exp-field">
          <label className="exp-label">Sub-description</label>
          <input className="exp-input" type="text"
            placeholder="e.g. Diesel, Lagos State LIRS"
            value={form.subcategory}
            onChange={e => set('subcategory', e.target.value)} />
        </div>

        {/* Recurring */}
        <div className="exp-field full">
          <label style={{ display:'flex', alignItems:'center', gap:10,
            fontSize:13, color:'#2c2a24', cursor:'pointer' }}>
            <input type="checkbox" checked={form.is_recurring}
              onChange={e => set('is_recurring', e.target.checked)}
              style={{ width:15, height:15 }} />
            <span>This is a recurring expense</span>
          </label>
          {form.is_recurring && (
            <div style={{ marginTop:10 }}>
              <label className="exp-label">Frequency</label>
              <select className="exp-input" style={{ maxWidth:200 }}
                value={form.recurrence_period}
                onChange={e => set('recurrence_period', e.target.value)}>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annual">Annual</option>
              </select>
              <p style={{ fontSize:12, color:'#9e9990', marginTop:6 }}>
                You&apos;ll be reminded to re-enter this expense when it&apos;s due.
              </p>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="exp-field full">
          <label className="exp-label">Notes (optional)</label>
          <textarea className="exp-input" rows={2}
            style={{ resize:'vertical' as const, fontFamily:'inherit' }}
            value={form.notes}
            onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      <div style={{ display:'flex', gap:10, marginTop:4 }}>
        <button onClick={() => onSave(form)} disabled={saving ||
          !form.category || !form.description || !form.amount}
          style={{ padding:'10px 24px', background:'#c8952a', color:'#fff',
            border:'none', borderRadius:8, fontSize:14, fontWeight:600,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Expense'}
        </button>
        <button onClick={onCancel}
          style={{ padding:'10px 20px', background:'none', color:'#6b6560',
            border:'1px solid #ddd9cf', borderRadius:8, fontSize:14, cursor:'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function ExpensesPage() {
  const currentYear = new Date().getFullYear()
  const [year,        setYear]        = useState(currentYear)
  const [tab,         setTab]         = useState<'list'|'summary'|'cashflow'|'recurring'>('summary')
  const [expenses,    setExpenses]    = useState<Expense[]>([])
  const [summary,     setSummary]     = useState<Summary | null>(null)
  const [recurring,   setRecurring]   = useState<Expense[]>([])
  const [loading,     setLoading]     = useState(false)
  const [showForm,    setShowForm]    = useState(false)
  const [editId,      setEditId]      = useState<string | null>(null)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState<string | null>(null)
  const [filterCat,   setFilterCat]   = useState('')
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)
  const [total,       setTotal]       = useState(0)

  const loadExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, page_size: 50, year }
      if (filterCat) params.category = filterCat
      if (search)    params.search   = search
      const res = await apiClient.get('/expenses/', { params })
      const d = res.data as { expenses: Expense[]; total: number }
      setExpenses(d.expenses)
      setTotal(d.total)
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }, [page, year, filterCat, search])

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiClient.get(`/expenses/summary`, { params: { year } })
      setSummary(res.data as Summary)
    } catch { toast.error('Failed to load summary') }
  }, [year])

  const loadRecurring = useCallback(async () => {
    try {
      const res = await apiClient.get('/expenses/recurring')
      setRecurring(res.data as Expense[])
    } catch {}
  }, [])

  useEffect(() => { loadExpenses(); loadSummary(); loadRecurring() },
    [loadExpenses, loadSummary, loadRecurring])

  const handleSave = async (form: FormData) => {
    if (!form.category || !form.description || !form.amount) {
      toast.error('Category, description and amount are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        category:          form.category,
        subcategory:       form.subcategory || null,
        description:       form.description,
        amount:            parseFloat(form.amount),
        expense_date:      form.expense_date,
        vendor_name:       form.vendor_name || null,
        reference_number:  form.reference_number || null,
        payment_method:    form.payment_method,
        is_recurring:      form.is_recurring,
        recurrence_period: form.is_recurring ? form.recurrence_period : null,
        notes:             form.notes || null,
      }
      if (editId) {
        await apiClient.patch(`/expenses/${editId}`, payload)
        toast.success('Expense updated')
        setEditId(null)
      } else {
        await apiClient.post('/expenses/', payload)
        toast.success('Expense saved')
        setShowForm(false)
      }
      await loadExpenses()
      await loadSummary()
      await loadRecurring()
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail ?? 'Failed to save expense')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this expense?')) return
    setDeleting(id)
    try {
      await apiClient.delete(`/expenses/${id}`)
      toast.success('Expense deleted')
      await loadExpenses()
      await loadSummary()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(null) }
  }

  const editExpense = expenses.find(e => e.id === editId)
  const editInitial = editExpense ? {
    category:          editExpense.category,
    subcategory:       editExpense.subcategory ?? '',
    description:       editExpense.description,
    amount:            String(editExpense.amount),
    expense_date:      editExpense.expense_date,
    vendor_name:       editExpense.vendor_name ?? '',
    reference_number:  editExpense.reference_number ?? '',
    payment_method:    editExpense.payment_method,
    is_recurring:      editExpense.is_recurring,
    recurrence_period: editExpense.recurrence_period ?? 'monthly',
    notes:             editExpense.notes ?? '',
  } : undefined

  const health = summary ? HEALTH_CONFIG[summary.health] ?? HEALTH_CONFIG.no_data : null
  const HealthIcon = health?.icon ?? BarChart3

  // Bar chart max for cash flow
  const maxBar = summary
    ? Math.max(...summary.monthly.map(m => Math.max(m.revenue, m.expenses)), 1)
    : 1

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <Receipt size={20} color="#c8952a" />
          <span className="topbar-title">Expenses</span>
        </div>
        <div className="topbar-actions">
          {/* Year picker */}
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            style={{ padding:'7px 28px 7px 12px', borderRadius:8,
              border:'1px solid #ddd9cf', fontSize:13, fontWeight:600,
              color:'#0f0e0b', background:'#fff', cursor:'pointer',
              appearance:'none' as const }}>
            {[currentYear+1, currentYear, currentYear-1, currentYear-2].map(y =>
              <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Recurring bell */}
          {recurring.filter(r => r.is_overdue || (r.days_until_due ?? 99) <= 7).length > 0 && (
            <button onClick={() => setTab('recurring')}
              style={{ position:'relative', background:'#fff', border:'1px solid #ddd9cf',
                borderRadius:8, padding:'7px 10px', cursor:'pointer', color:'#0f0e0b' }}>
              <Bell size={16} />
              <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16,
                background:'#dc2626', borderRadius:'50%', fontSize:9, color:'#fff',
                display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
                {recurring.filter(r => r.is_overdue || (r.days_until_due ?? 99) <= 7).length}
              </span>
            </button>
          )}

          <button onClick={() => { setShowForm(true); setEditId(null) }}
            style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 16px',
              background:'#c8952a', color:'#fff', border:'none', borderRadius:8,
              fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      <div className="content">
        <div style={{ maxWidth:1200, margin:'0 auto' }}>

          {/* Add/Edit form */}
          {(showForm || editId) && (
            <ExpenseForm
              initial={editId ? editInitial : undefined}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditId(null) }}
              saving={saving}
            />
          )}

          {/* Health + KPI strip */}
          {summary && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',
              gap:12, marginBottom:20 }}>

              {/* Business Health */}
              <div style={{ background: health?.bg ?? '#f3f4f6', borderRadius:12,
                padding:'16px 18px', border:`1px solid ${health?.color ?? '#e5e7eb'}22`,
                gridColumn:'span 1' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <HealthIcon size={18} color={health?.color ?? '#9ca3af'} />
                  <span style={{ fontSize:11, fontWeight:700, textTransform:'uppercase' as const,
                    letterSpacing:'0.5px', color: health?.color ?? '#9ca3af' }}>
                    Business Health
                  </span>
                </div>
                <div style={{ fontSize:20, fontWeight:800, color: health?.color ?? '#9ca3af' }}>
                  {health?.label}
                </div>
                <div style={{ fontSize:12, color:'#6b6560', marginTop:2 }}>
                  {summary.profit_margin > 0
                    ? `${summary.profit_margin}% profit margin`
                    : `${Math.abs(summary.profit_margin)}% loss margin`}
                </div>
              </div>

              {[
                { label:'Total Expenses',    value: fmt(summary.total_expenses),   sub:`${year} YTD`,           color:'#dc2626' },
                { label:'Revenue',           value: fmt(summary.ytd_revenue),      sub:'Collected this year',   color:'#059669' },
                { label:'Net Profit / Loss', value: fmt(Math.abs(summary.net_profit)),
                  sub: summary.net_profit >= 0 ? 'Profit' : 'Net Loss',
                  color: summary.net_profit >= 0 ? '#059669' : '#dc2626' },
                { label:'Tax Deductible',    value: fmt(summary.total_deductible), sub:'Allowable deductions',  color:'#2563eb' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background:'#fff', borderRadius:12,
                  padding:'16px 18px', border:'1px solid #ede9de' }}>
                  <div style={{ fontSize:11, fontWeight:600, textTransform:'uppercase' as const,
                    letterSpacing:'0.5px', color:'#9e9990', marginBottom:6 }}>{label}</div>
                  <div style={{ fontSize:20, fontWeight:800, color, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                    {value}
                  </div>
                  <div style={{ fontSize:12, color:'#9e9990', marginTop:2 }}>{sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div style={{ display:'flex', gap:4, marginBottom:20,
            borderBottom:'1px solid #ede9de' }}>
            {([
              { key:'summary',   label:'By Category' },
              { key:'cashflow',  label:'Cash Flow' },
              { key:'list',      label:'All Expenses' },
              { key:'recurring', label:`Recurring${recurring.length > 0 ? ` (${recurring.length})` : ''}` },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                style={{ padding:'10px 16px', background:'none', border:'none',
                  borderBottom:`2px solid ${tab === key ? '#c8952a' : 'transparent'}`,
                  color: tab === key ? '#c8952a' : '#6b6560',
                  fontSize:13, fontWeight:600, cursor:'pointer', marginBottom:-1 }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB: By Category ── */}
          {tab === 'summary' && summary && (
            <div>
              {summary.groups.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:12, padding:'60px 32px',
                  textAlign:'center', border:'1px solid #ede9de' }}>
                  <Receipt size={48} color="#ddd9cf" style={{ margin:'0 auto 16px', display:'block' }} />
                  <div style={{ fontSize:18, fontWeight:700, color:'#0f0e0b', marginBottom:8 }}>
                    No expenses recorded for {year}
                  </div>
                  <div style={{ fontSize:14, color:'#9e9990', marginBottom:24 }}>
                    Start adding your business expenses to see P&L analysis.
                  </div>
                  <button onClick={() => setShowForm(true)}
                    style={{ padding:'12px 28px', background:'#c8952a', color:'#fff',
                      border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer' }}>
                    <Plus size={14} style={{ marginRight:6, verticalAlign:'middle' }} />
                    Add First Expense
                  </button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:16 }}>
                  {summary.groups.map(g => (
                    <div key={g.group} style={{ background:'#fff', borderRadius:12,
                      padding:20, border:'1px solid #ede9de' }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        alignItems:'center', marginBottom:14 }}>
                        <span style={{ fontSize:14, fontWeight:700, color:'#0f0e0b' }}>{g.group}</span>
                        <span style={{ fontSize:16, fontWeight:800, color:'#dc2626',
                          fontFamily:"'DM Sans',system-ui,sans-serif" }}>{fmt(g.total)}</span>
                      </div>
                      {g.categories.map(c => {
                        const pct = summary.total_expenses > 0
                          ? Math.round(c.amount / summary.total_expenses * 100) : 0
                        return (
                          <div key={c.category} style={{ marginBottom:10 }}>
                            <div style={{ display:'flex', justifyContent:'space-between',
                              marginBottom:4, fontSize:13 }}>
                              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <span style={{ color:'#2c2a24' }}>{c.label}</span>
                                {!c.is_deductible && (
                                  <span style={{ fontSize:10, background:'#fee2e2',
                                    color:'#dc2626', padding:'1px 5px', borderRadius:4,
                                    fontWeight:600 }}>Non-deductible</span>
                                )}
                              </div>
                              <span style={{ fontWeight:600, color:'#0f0e0b' }}>{fmt(c.amount)}</span>
                            </div>
                            <div style={{ height:5, background:'#f3f4f6', borderRadius:3, overflow:'hidden' }}>
                              <div style={{ height:'100%', width:`${pct}%`,
                                background:'#c8952a', borderRadius:3 }} />
                            </div>
                            <div style={{ fontSize:11, color:'#9e9990', marginTop:2 }}>
                              {c.count} {c.count === 1 ? 'entry' : 'entries'} · {pct}% of total
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}

                  {/* P&L Summary card */}
                  <div style={{ background:'#0f0e0b', borderRadius:12, padding:20,
                    border:'1px solid #0f0e0b' }}>
                    <div style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:16 }}>
                      P&L Summary — {year}
                    </div>
                    {[
                      { label:'Revenue Collected', value: fmt(summary.ytd_revenue),     color:'#10b981' },
                      { label:'Total Expenses',    value: `(${fmt(summary.total_expenses)})`, color:'#ef4444' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ display:'flex', justifyContent:'space-between',
                        padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ fontSize:13, color:'#9e9990' }}>{label}</span>
                        <span style={{ fontSize:13, fontWeight:700, color,
                          fontFamily:"'DM Sans',system-ui,sans-serif" }}>{value}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between',
                      padding:'12px 0 0' }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#fff' }}>
                        Net {summary.net_profit >= 0 ? 'Profit' : 'Loss'}
                      </span>
                      <span style={{ fontSize:18, fontWeight:800,
                        color: summary.net_profit >= 0 ? '#10b981' : '#ef4444',
                        fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                        {summary.net_profit < 0 ? '(' : ''}{fmt(Math.abs(summary.net_profit))}{summary.net_profit < 0 ? ')' : ''}
                      </span>
                    </div>
                    <div style={{ marginTop:16, padding:'10px 12px',
                      background: health?.bg ?? '#f3f4f6', borderRadius:8 }}>
                      <div style={{ fontSize:12, fontWeight:700, color: health?.color ?? '#9ca3af' }}>
                        {health?.label} · {Math.abs(summary.profit_margin)}% {summary.net_profit >= 0 ? 'margin' : 'loss'}
                      </div>
                      <div style={{ fontSize:11, color:'#6b6560', marginTop:2 }}>
                        Tax-deductible expenses: {fmt(summary.total_deductible)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}

          {/* ── TAB: Cash Flow ── */}
          {tab === 'cashflow' && summary && (
            <div style={{ background:'#fff', borderRadius:12, padding:24,
              border:'1px solid #ede9de' }}>
              <div style={{ fontSize:15, fontWeight:700, color:'#0f0e0b', marginBottom:20 }}>
                Monthly Cash Flow — {year}
              </div>

              {/* Bar chart */}
              <div style={{ display:'flex', gap:6, alignItems:'flex-end',
                height:200, marginBottom:20, overflowX:'auto' as const,
                paddingBottom:4 }}>
                {summary.monthly.map(m => (
                  <div key={m.month} style={{ flex:1, minWidth:40,
                    display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', display:'flex', gap:3, alignItems:'flex-end',
                      height:160 }}>
                      {/* Revenue bar */}
                      <div
                        title={`Revenue: ${fmt(m.revenue)}`}
                        style={{ flex:1, background:'#d1fae5', borderRadius:'4px 4px 0 0',
                        height:`${Math.max((m.revenue / maxBar) * 160, m.revenue > 0 ? 4 : 0)}px`,
                        minHeight: m.revenue > 0 ? 4 : 0,
                        transition:'height 0.4s ease' }} />
                      {/* Expense bar */}
                      <div style={{ flex:1, background:'#fee2e2', borderRadius:'4px 4px 0 0',
                        height:`${Math.max((m.expenses / maxBar) * 160, m.expenses > 0 ? 4 : 0)}px`,
                        minHeight: m.expenses > 0 ? 4 : 0,
                        transition:'height 0.4s ease' }} />
                    </div>
                    <div style={{ fontSize:10, color:'#9e9990', fontWeight:600 }}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div style={{ display:'flex', gap:20, marginBottom:20 }}>
                {[
                  { color:'#d1fae5', border:'#059669', label:'Revenue' },
                  { color:'#fee2e2', border:'#dc2626', label:'Expenses' },
                ].map(({ color, border, label }) => (
                  <div key={label} style={{ display:'flex', alignItems:'center', gap:6,
                    fontSize:12, color:'#6b6560' }}>
                    <div style={{ width:12, height:12, background:color,
                      border:`1px solid ${border}`, borderRadius:3 }} />
                    {label}
                  </div>
                ))}
              </div>

              {/* Monthly table */}
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'#faf9f6' }}>
                    {['Month','Revenue','Expenses','Net','Status'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left',
                        fontSize:11, fontWeight:700, color:'#9e9990',
                        textTransform:'uppercase' as const, letterSpacing:'0.4px',
                        borderBottom:'1px solid #ede9de' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.monthly.filter(m => m.is_past || m.is_current).map(m => (
                    <tr key={m.month} style={{
                      background: m.is_current ? '#fffbf0' : 'transparent',
                      borderBottom:'1px solid #f5f3ef' }}>
                      <td style={{ padding:'10px 14px', fontWeight: m.is_current ? 700 : 500,
                        color:'#0f0e0b' }}>
                        {m.label}
                        {m.is_current && (
                          <span style={{ marginLeft:6, fontSize:10, background:'#fef3c7',
                            color:'#d97706', padding:'2px 5px', borderRadius:4, fontWeight:700 }}>
                            NOW
                          </span>
                        )}
                      </td>
                      <td style={{ padding:'10px 14px', color:'#059669', fontWeight:600,
                        fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                        {m.revenue > 0 ? fmt(m.revenue) : '—'}
                      </td>
                      <td style={{ padding:'10px 14px', color:'#dc2626', fontWeight:600,
                        fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                        {m.expenses > 0 ? fmt(m.expenses) : '—'}
                      </td>
                      <td style={{ padding:'10px 14px', fontWeight:700,
                        color: m.profit >= 0 ? '#059669' : '#dc2626',
                        fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                        {m.revenue === 0 && m.expenses === 0 ? '—'
                          : (m.profit < 0 ? `(${fmt(Math.abs(m.profit))})` : fmt(m.profit))}
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        {m.revenue === 0 && m.expenses === 0 ? (
                          <span style={{ fontSize:11, color:'#9e9990' }}>No data</span>
                        ) : m.profit >= 0 ? (
                          <span style={{ fontSize:11, background:'#d1fae5', color:'#059669',
                            padding:'2px 8px', borderRadius:20, fontWeight:700 }}>Profit</span>
                        ) : (
                          <span style={{ fontSize:11, background:'#fee2e2', color:'#dc2626',
                            padding:'2px 8px', borderRadius:20, fontWeight:700 }}>Loss</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
          </div>
          )}

          {/* ── TAB: All Expenses ── */}
          {tab === 'list' && (
            <div>
              {/* Filters */}
              <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' as const }}>
                <input type="text" placeholder="Search description, vendor…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  style={{ flex:1, minWidth:200, padding:'8px 12px', borderRadius:8,
                    border:'1px solid #ddd9cf', fontSize:13, color:'#0f0e0b' }} />
                <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}
                  style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #ddd9cf',
                    fontSize:13, color:'#0f0e0b', background:'#fff' }}>
                  <option value="">All Categories</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) =>
                    <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => { setSearch(''); setFilterCat(''); setPage(1); loadExpenses() }}
                  style={{ padding:'8px 12px', background:'none', border:'1px solid #ddd9cf',
                    borderRadius:8, cursor:'pointer', color:'#6b6560', display:'flex',
                    alignItems:'center', gap:6, fontSize:13 }}>
                  <RefreshCw size={13} /> Reset
                </button>
              </div>

              {loading ? (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center',
                  minHeight:200, gap:12, color:'#9e9990' }}>
                  <Loader2 size={24} style={{ animation:'spin 1s linear infinite', color:'#c8952a' }} />
                  Loading expenses…
                </div>
              ) : expenses.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:12, padding:'48px 32px',
                  textAlign:'center', border:'1px solid #ede9de' }}>
                  <Receipt size={40} color="#ddd9cf" style={{ margin:'0 auto 12px', display:'block' }} />
                  <div style={{ fontSize:16, fontWeight:600, color:'#0f0e0b' }}>No expenses found</div>
                  <div style={{ fontSize:13, color:'#9e9990', marginTop:4 }}>
                    {search || filterCat ? 'Try adjusting your filters' : `No expenses recorded for ${year}`}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ background:'#fff', borderRadius:12, border:'1px solid #ede9de',
                    overflow:'hidden' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                      <thead>
                        <tr style={{ background:'#faf9f6' }}>
                          {['Date','Category','Description','Vendor','Amount','Method',''].map(h => (
                            <th key={h} style={{ padding:'11px 14px', textAlign:'left',
                              fontSize:11, fontWeight:700, color:'#9e9990',
                              textTransform:'uppercase' as const, letterSpacing:'0.4px',
                              borderBottom:'1px solid #ede9de' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(e => (
                          editId === e.id ? (
                            <tr key={e.id}>
                              <td colSpan={7} style={{ padding:0 }}>
                                <div style={{ padding:'16px' }}>
                                  <ExpenseForm
                                    initial={editInitial}
                                    onSave={handleSave}
                                    onCancel={() => setEditId(null)}
                                    saving={saving}
                                  />
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={e.id} style={{ borderBottom:'1px solid #f5f3ef' }}>
                              <td style={{ padding:'11px 14px', color:'#6b6560', whiteSpace:'nowrap' as const }}>
                                {fmtDate(e.expense_date)}
                              </td>
                              <td style={{ padding:'11px 14px' }}>
                                <div style={{ fontSize:12, background:'#faf9f6',
                                  border:'1px solid #ede9de', borderRadius:6,
                                  padding:'2px 8px', display:'inline-block',
                                  color:'#2c2a24', whiteSpace:'nowrap' as const }}>
                                  {e.category_label}
                                </div>
                                {e.is_recurring && (
                                  <span style={{ marginLeft:4, fontSize:10, background:'#dbeafe',
                                    color:'#1d4ed8', padding:'1px 5px', borderRadius:4, fontWeight:600 }}>
                                    {e.recurrence_period}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding:'11px 14px', color:'#0f0e0b', fontWeight:500,
                                maxWidth:200 }}>
                                {e.description}
                                {e.subcategory && (
                                  <div style={{ fontSize:11, color:'#9e9990' }}>{e.subcategory}</div>
                                )}
                              </td>
                              <td style={{ padding:'11px 14px', color:'#6b6560' }}>
                                {e.vendor_name ?? '—'}
                              </td>
                              <td style={{ padding:'11px 14px', fontWeight:700, color:'#dc2626',
                                fontFamily:"'DM Sans',system-ui,sans-serif", whiteSpace:'nowrap' as const }}>
                                {fmt(e.amount)}
                              </td>
                              <td style={{ padding:'11px 14px', color:'#9e9990', fontSize:12 }}>
                                {e.payment_method.replace('_',' ')}
                              </td>
                              <td style={{ padding:'11px 14px' }}>
                                <div style={{ display:'flex', gap:6 }}>
                                  <button onClick={() => setEditId(e.id)}
                                    style={{ background:'none', border:'none', cursor:'pointer',
                                      color:'#9e9990', padding:4 }}>
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(e.id)}
                                    disabled={deleting === e.id}
                                    style={{ background:'none', border:'none', cursor:'pointer',
                                      color:'#b83232', padding:4 }}>
                                    {deleting === e.id
                                      ? <Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} />
                                      : <Trash2 size={14} />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {total > 50 && (
                    <div style={{ display:'flex', justifyContent:'space-between',
                      alignItems:'center', marginTop:14, fontSize:13, color:'#6b6560' }}>
                      <span>{total} expenses total</span>
                      <div style={{ display:'flex', gap:8 }}>
                        <button disabled={page === 1}
                          onClick={() => setPage(p => p - 1)}
                          style={{ padding:'6px 14px', borderRadius:7,
                            border:'1px solid #ddd9cf', background:'#fff',
                            cursor: page === 1 ? 'not-allowed' : 'pointer',
                            opacity: page === 1 ? 0.5 : 1 }}>← Prev</button>
                        <button disabled={page * 50 >= total}
                          onClick={() => setPage(p => p + 1)}
                          style={{ padding:'6px 14px', borderRadius:7,
                            border:'1px solid #ddd9cf', background:'#fff',
                            cursor: page * 50 >= total ? 'not-allowed' : 'pointer',
                            opacity: page * 50 >= total ? 0.5 : 1 }}>Next →</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── TAB: Recurring ── */}
          {tab === 'recurring' && (
            <div>
              {recurring.length === 0 ? (
                <div style={{ background:'#fff', borderRadius:12, padding:'48px 32px',
                  textAlign:'center', border:'1px solid #ede9de' }}>
                  <Bell size={40} color="#ddd9cf" style={{ margin:'0 auto 12px', display:'block' }} />
                  <div style={{ fontSize:16, fontWeight:600, color:'#0f0e0b' }}>No recurring expenses</div>
                  <div style={{ fontSize:13, color:'#9e9990', marginTop:4 }}>
                    Mark expenses as recurring when adding them to get reminders.
                  </div>
                </div>
              ) : (
                <div style={{ display:'grid',
                  gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                  {recurring.map(e => {
                    const overdue  = e.is_overdue
                    const dueSoon  = !overdue && (e.days_until_due ?? 99) <= 7
                    const bg       = overdue ? '#fee2e2' : dueSoon ? '#fef3c7' : '#f0f9ff'
                    const border   = overdue ? '#fca5a5' : dueSoon ? '#fde68a' : '#bae6fd'
                    const textColor= overdue ? '#dc2626' : dueSoon ? '#d97706' : '#0369a1'
                    const statusLabel = overdue ? 'Overdue' : dueSoon
                      ? `Due in ${e.days_until_due}d` : `Due in ${e.days_until_due}d`
                    return (
                      <div key={e.id} style={{ background:'#fff', borderRadius:12,
                        padding:18, border:'1px solid #ede9de',
                        borderLeft:`3px solid ${textColor}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'flex-start', marginBottom:10 }}>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#0f0e0b',
                              marginBottom:2 }}>{e.description}</div>
                            <div style={{ fontSize:11, color:'#9e9990' }}>
                              {e.category_label} · {e.recurrence_period}
                            </div>
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, background:bg,
                            color:textColor, border:`1px solid ${border}`,
                            padding:'3px 8px', borderRadius:20 }}>{statusLabel}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between',
                          alignItems:'center' }}>
                          <div style={{ fontSize:18, fontWeight:800, color:'#dc2626',
                            fontFamily:"'DM Sans',system-ui,sans-serif" }}>
                            {fmt(e.amount)}
                          </div>
                          <button
                            onClick={() => {
                              setShowForm(true)
                              setEditId(null)
                              // Pre-fill form with this recurring expense data
                              toast.info(`Pre-filling form with "${e.description}"`)
                            }}
                            style={{ padding:'6px 14px', background:'#c8952a', color:'#fff',
                              border:'none', borderRadius:7, fontSize:12, fontWeight:600,
                              cursor:'pointer' }}>
                            + Re-enter
                          </button>
                        </div>
                        {e.next_due_date && (
                          <div style={{ fontSize:11, color:'#9e9990', marginTop:6 }}>
                            Next due: {fmtDate(e.next_due_date)}
                            {e.vendor_name ? ` · ${e.vendor_name}` : ''}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

        </div>{/* maxWidth */}
      </div>{/* content */}
    <style jsx global>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .exp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 8px }
        .exp-field { display: flex; flex-direction: column; gap: 5px }
        .exp-field.full { grid-column: span 2 }
        .exp-label { font-size: 11px; font-weight: 700; color: #6b6560;
          text-transform: uppercase; letter-spacing: 0.4px }
        .exp-input { padding: 9px 12px; border: 1px solid #ddd9cf; border-radius: 8px;
          font-size: 13px; color: #0f0e0b; background: #fff;
          font-family: inherit; width: 100%; box-sizing: border-box }
        .exp-input:focus { outline: none; border-color: #c8952a }
        @media(max-width: 768px) {
          .exp-grid { grid-template-columns: 1fr }
          .exp-field.full { grid-column: span 1 }
          .content { padding: 12px }
          .topbar { height: auto; min-height: 52px; padding: 10px 14px; flex-wrap: wrap }
          .topbar-actions { flex-wrap: wrap; gap: 6px }
          table { font-size: 11px }
          th, td { padding: 8px 8px !important }
        }
        @media(max-width: 480px) {
          .content { padding: 8px }
          .topbar-title { font-size: 15px }
        }
      `}</style>
    </>
  )
}