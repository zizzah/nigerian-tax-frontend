'use client'

import { useState, useEffect, useCallback } from 'react'
import { Receipt, Plus, Trash2, Edit2, RefreshCw, Loader2, Bell, BarChart3, Heart, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────
interface Expense {
  id: string; category: string; category_label: string
  subcategory: string | null; description: string; amount: number
  expense_date: string; vendor_name: string | null; reference_number: string | null
  payment_method: string; is_tax_deductible: boolean; is_recurring: boolean
  recurrence_period: string | null; next_due_date: string | null
  days_until_due?: number; is_overdue?: boolean; notes: string | null; tax_year: number | null
}
interface CatGroup {
  group: string; total: number
  categories: { category: string; label: string; amount: number; count: number; is_deductible: boolean }[]
}
interface MonthRow {
  month: number; label: string; revenue: number; expenses: number
  profit: number; is_past: boolean; is_current: boolean
}
interface Summary {
  year: number; total_expenses: number; total_deductible: number
  ytd_revenue: number; ytd_invoiced: number
  cogs: number; gross_profit: number; gross_margin: number
  opex: number; ebit: number; finance_costs: number
  net_before_tax: number; tax_expenses: number
  net_profit: number; profit_margin: number
  health: string; missing_cogs: boolean
  groups: CatGroup[]; monthly: MonthRow[]; due_soon: Expense[]
}
interface FormState {
  category: string; subcategory: string; description: string; amount: string
  expense_date: string; vendor_name: string; reference_number: string
  payment_method: string; is_recurring: boolean; recurrence_period: string; notes: string
}

// ── Constants ─────────────────────────────────────────────────────────────────
const CAT_GROUPS: Record<string, string[]> = {
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
const CAT_LABELS: Record<string, string> = {
  COST_OF_SALES:'Cost of Sales', SALARIES_WAGES:'Salaries & Wages', PAYE_TAX:'PAYE Tax Remitted',
  PENSION_CONTRIBUTION:'Pension Contribution', NHF_CONTRIBUTION:'NHF Contribution', STAFF_WELFARE:'Staff Welfare',
  RENT_RATES:'Rent & Rates', UTILITIES:'Utilities', MAINTENANCE_REPAIRS:'Maintenance & Repairs',
  FUEL_TRANSPORT:'Fuel & Transport', INTERNET_TELECOM:'Internet & Telecoms', OFFICE_SUPPLIES:'Office Supplies',
  EQUIPMENT_ASSETS:'Equipment & Assets', DEPRECIATION:'Depreciation', MARKETING_ADS:'Marketing & Advertising',
  BANK_CHARGES:'Bank Charges', LOAN_REPAYMENT:'Loan Repayment', LOAN_INTEREST:'Loan Interest',
  PROFESSIONAL_FEES:'Professional Fees', GOVT_LEVIES:'Government Levies', INSURANCE:'Insurance',
  COMPANY_TAX:'Company Tax (CIT)', VAT_REMITTED:'VAT Remitted', WHT_REMITTED:'WHT Remitted',
  TRAVEL_ACCOMMODATION:'Travel & Accommodation', TRAINING_DEVELOPMENT:'Training & Development', OTHER:'Other Expenses',
}
type HealthKey = 'healthy' | 'stable' | 'breaking_even' | 'loss' | 'no_data'
const HEALTH_CFG: Record<HealthKey, { label: string; color: string; bg: string; Icon: typeof Heart }> = {
  healthy:       { label: 'Healthy',       color: '#059669', bg: '#d1fae5', Icon: Heart },
  stable:        { label: 'Stable',        color: '#2563eb', bg: '#dbeafe', Icon: CheckCircle },
  breaking_even: { label: 'Breaking Even', color: '#d97706', bg: '#fef3c7', Icon: AlertCircle },
  loss:          { label: 'Making a Loss', color: '#dc2626', bg: '#fee2e2', Icon: TrendingDown },
  no_data:       { label: 'No Data',       color: '#9ca3af', bg: '#f3f4f6', Icon: BarChart3 },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  const a = Math.abs(n || 0)
  if (a >= 1_000_000_000) return '\u20a6' + (a / 1_000_000_000).toFixed(1) + 'B'
  if (a >= 1_000_000)     return '\u20a6' + (a / 1_000_000).toFixed(1) + 'M'
  return '\u20a6' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(a)
}
function fmtDate(d: string): string {
  try { return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return d }
}
function signed(n: number): string {
  return n < 0 ? '(' + fmt(Math.abs(n)) + ')' : fmt(n)
}
function blank(): FormState {
  return {
    category: '', subcategory: '', description: '', amount: '',
    expense_date: new Date().toISOString().slice(0, 10),
    vendor_name: '', reference_number: '', payment_method: 'CASH',
    is_recurring: false, recurrence_period: 'monthly', notes: '',
  }
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const INP: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1px solid #ddd9cf', borderRadius: 8,
  fontSize: 13, color: '#0f0e0b', background: '#fff', fontFamily: 'inherit', boxSizing: 'border-box',
}
const LBL: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.5px',
  textTransform: 'uppercase', color: '#6b6560', marginBottom: 5,
}
const CARD: React.CSSProperties = { background: '#fff', borderRadius: 12, border: '1px solid #ede9de' }

// ── Form Modal ────────────────────────────────────────────────────────────────
function ExpenseForm({ initial, onSave, onCancel, saving }: {
  initial?: Partial<FormState>
  onSave: (f: FormState) => void
  onCancel: () => void
  saving: boolean
}) {
  const [f, setF] = useState<FormState>({ ...blank(), ...initial })
  const s = (k: keyof FormState, v: string | boolean) => setF(p => ({ ...p, [k]: v }))
  const isValid = !!(f.category && f.description && f.amount)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15,14,11,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 680,
        maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #ede9de', flexShrink: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#0f0e0b' }}>
            {initial?.category ? 'Edit Expense' : 'Add Expense'}
          </span>
          <button onClick={onCancel} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#9e9990', fontSize: 22, lineHeight: 1, padding: '0 4px',
          }}>&times;</button>
        </div>

        {/* Scrollable fields */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          <div className="exp-form-grid">

            <div className="exp-form-full" style={{ gridColumn: 'span 2' }}>
              <label style={LBL}>Category *</label>
              <select style={INP} value={f.category} onChange={e => s('category', e.target.value)}>
                <option value="">— Select category —</option>
                {Object.entries(CAT_GROUPS).map(([grp, cats]) => (
                  <optgroup key={grp} label={grp}>
                    {cats.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="exp-form-full" style={{ gridColumn: 'span 2' }}>
              <label style={LBL}>Description *</label>
              <input style={INP} type="text" placeholder="e.g. Office rent March 2026"
                value={f.description} onChange={e => s('description', e.target.value)} />
            </div>

            <div>
              <label style={LBL}>Amount (NGN) *</label>
              <input style={INP} type="number" min="0" step="0.01" placeholder="0.00"
                value={f.amount} onChange={e => s('amount', e.target.value)} />
            </div>
            <div>
              <label style={LBL}>Date *</label>
              <input style={INP} type="date" value={f.expense_date}
                onChange={e => s('expense_date', e.target.value)} />
            </div>

            <div>
              <label style={LBL}>Vendor / Paid To</label>
              <input style={INP} type="text" placeholder="e.g. Landlord, AEDC, MTN"
                value={f.vendor_name} onChange={e => s('vendor_name', e.target.value)} />
            </div>
            <div>
              <label style={LBL}>Payment Method</label>
              <select style={INP} value={f.payment_method} onChange={e => s('payment_method', e.target.value)}>
                {['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'MOBILE_MONEY', 'OTHER'].map(m =>
                  <option key={m} value={m}>{m.replace(/_/g, ' ')}</option>
                )}
              </select>
            </div>

            <div>
              <label style={LBL}>Receipt / Reference</label>
              <input style={INP} type="text" placeholder="e.g. RCT-001"
                value={f.reference_number} onChange={e => s('reference_number', e.target.value)} />
            </div>
            <div>
              <label style={LBL}>Sub-description</label>
              <input style={INP} type="text" placeholder="e.g. Diesel, Lagos LIRS"
                value={f.subcategory} onChange={e => s('subcategory', e.target.value)} />
            </div>

            <div className="exp-form-full" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={f.is_recurring}
                  onChange={e => s('is_recurring', e.target.checked)} />
                <span>This is a recurring expense</span>
              </label>
              {f.is_recurring && (
                <div style={{ marginTop: 10 }}>
                  <label style={LBL}>Frequency</label>
                  <select style={{ ...INP, maxWidth: 200 }} value={f.recurrence_period}
                    onChange={e => s('recurrence_period', e.target.value)}>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="annual">Annual</option>
                  </select>
                </div>
              )}
            </div>

            <div className="exp-form-full" style={{ gridColumn: 'span 2' }}>
              <label style={LBL}>Notes</label>
              <textarea
                style={{ ...INP, resize: 'vertical', minHeight: 60 } as React.CSSProperties}
                value={f.notes} onChange={e => s('notes', e.target.value)}
              />
            </div>

          </div>
        </div>

        {/* Sticky footer — always visible */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #ede9de',
          display: 'flex', gap: 10, flexShrink: 0, background: '#fff',
        }}>
          <button
            onClick={() => onSave(f)}
            disabled={saving || !isValid}
            style={{
              flex: 1, padding: '12px 0',
              background: isValid ? '#c8952a' : '#e5e0d4',
              color: isValid ? '#fff' : '#a09890',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
              cursor: saving || !isValid ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}>
            {saving ? 'Saving\u2026' : 'Save Expense'}
          </button>
          <button onClick={onCancel} style={{
            padding: '12px 20px', background: 'none', color: '#6b6560',
            border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 14, cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'cashflow' | 'list' | 'recurring'

export default function ExpensesPage() {
  const thisYear = new Date().getFullYear()
  const [year,      setYear]      = useState(thisYear)
  const [tab,       setTab]       = useState<Tab>('overview')
  const [expenses,  setExpenses]  = useState<Expense[]>([])
  const [summary,   setSummary]   = useState<Summary | null>(null)
  const [recurring, setRecurring] = useState<Expense[]>([])
  const [loading,   setLoading]   = useState(false)
  const [showForm,  setShowForm]  = useState(false)
  const [editId,    setEditId]    = useState<string | null>(null)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('')
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)
  const [total,     setTotal]     = useState(0)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const p: Record<string, string | number> = { page, page_size: 50, year }
      if (filterCat) p.category = filterCat
      if (search)    p.search   = search
      const [eR, sR, rR] = await Promise.all([
        apiClient.get('/expenses/', { params: p }),
        apiClient.get('/expenses/summary', { params: { year } }),
        apiClient.get('/expenses/recurring'),
      ])
      const ed = eR.data as { expenses: Expense[]; total: number }
      setExpenses(ed.expenses)
      setTotal(ed.total)
      setSummary(sR.data as Summary)
      setRecurring(rR.data as Expense[])
    } catch { toast.error('Failed to load expenses') }
    finally { setLoading(false) }
  }, [page, year, filterCat, search])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleSave(form: FormState) {
    if (!form.category || !form.description || !form.amount) {
      toast.error('Category, description and amount required')
      return
    }
    setSaving(true)
    try {
      const body = {
        category: form.category, subcategory: form.subcategory || null,
        description: form.description, amount: parseFloat(form.amount),
        expense_date: form.expense_date, vendor_name: form.vendor_name || null,
        reference_number: form.reference_number || null,
        payment_method: form.payment_method, is_recurring: form.is_recurring,
        recurrence_period: form.is_recurring ? form.recurrence_period : null,
        notes: form.notes || null,
      }
      if (editId) {
        await apiClient.patch('/expenses/' + editId, body)
        toast.success('Updated')
        setEditId(null)
      } else {
        await apiClient.post('/expenses/', body)
        toast.success('Expense added')
        setShowForm(false)
      }
      await loadAll()
    } catch (err: unknown) {
      const d = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(d ?? 'Failed to save')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    setDeleting(id)
    try {
      await apiClient.delete('/expenses/' + id)
      toast.success('Deleted')
      await loadAll()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(null) }
  }

  const editExp  = expenses.find(e => e.id === editId)
  const editInit = editExp ? {
    category: editExp.category, subcategory: editExp.subcategory ?? '',
    description: editExp.description, amount: String(editExp.amount),
    expense_date: editExp.expense_date, vendor_name: editExp.vendor_name ?? '',
    reference_number: editExp.reference_number ?? '', payment_method: editExp.payment_method,
    is_recurring: editExp.is_recurring, recurrence_period: editExp.recurrence_period ?? 'monthly',
    notes: editExp.notes ?? '',
  } : undefined

  const hKey    = (summary?.health ?? 'no_data') as HealthKey
  const hCfg    = HEALTH_CFG[hKey]
  const HIcon   = hCfg.Icon
  const dueSoon = recurring.filter(r => r.is_overdue || (r.days_until_due ?? 99) <= 7).length
  const maxBar  = summary
    ? Math.max(...summary.monthly.map(m => Math.max(m.revenue, m.expenses)), 1)
    : 1

  const TABS: { key: Tab; label: string }[] = [
    { key: 'overview',  label: 'By Category' },
    { key: 'cashflow',  label: 'Cash Flow' },
    { key: 'list',      label: 'All Expenses' },
    { key: 'recurring', label: 'Recurring' + (recurring.length > 0 ? ' (' + recurring.length + ')' : '') },
  ]

  // P&L rows for the statement card
  type PLRow = { label: string; val: number; color: string; bold: boolean; indent: boolean; skip?: boolean; sub?: string }
  const plRows: PLRow[] = summary ? [
    { label: 'Revenue (Cash Collected)', val: summary.ytd_revenue ?? 0,      color: '#10b981', bold: false, indent: false },
    { label: 'Less: Cost of Sales',      val: -(summary.cogs ?? 0),          color: '#ef4444', bold: false, indent: true,  skip: (summary.cogs ?? 0) === 0 },
    { label: 'Gross Profit',             val: summary.gross_profit ?? 0,     color: (summary.gross_profit ?? 0) >= 0 ? '#10b981' : '#ef4444', bold: true, indent: false, sub: (summary.gross_margin ?? 0) + '% gross margin' },
    { label: 'Less: Operating Expenses', val: -(summary.opex ?? 0),          color: '#ef4444', bold: false, indent: true,  skip: (summary.opex ?? 0) === 0 },
    { label: 'Net Operating Profit',     val: summary.ebit ?? 0,             color: (summary.ebit ?? 0) >= 0 ? '#10b981' : '#ef4444', bold: true, indent: false },
    { label: 'Less: Finance Costs',      val: -(summary.finance_costs ?? 0), color: '#ef4444', bold: false, indent: true,  skip: (summary.finance_costs ?? 0) === 0 },
    { label: 'Net Profit Before Tax',    val: summary.net_before_tax ?? 0,   color: (summary.net_before_tax ?? 0) >= 0 ? '#10b981' : '#ef4444', bold: true, indent: false },
    { label: 'Less: Tax & Levies',       val: -(summary.tax_expenses ?? 0),  color: '#ef4444', bold: false, indent: true,  skip: (summary.tax_expenses ?? 0) === 0 },
    { label: 'Net Profit After Tax',     val: summary.net_profit ?? 0,       color: (summary.net_profit ?? 0) >= 0 ? '#10b981' : '#ef4444', bold: true, indent: false },
  ] : []

  return (
    <>
      {/* Spin keyframe for loaders */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg) } }
        .exp-spin { animation: spin 1s linear infinite }
        .content {
          overflow-y: auto !important; overflow-x: hidden !important;
          height: auto !important; min-height: 0 !important;
          padding: 24px !important; padding-bottom: 64px !important;
          box-sizing: border-box !important;
        }
        .topbar { flex-wrap: wrap; gap: 8px; }
        .topbar-actions { flex-wrap: wrap; gap: 6px; }
        .exp-kpi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
        .exp-cat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
        .exp-rec-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 14px; }
        .exp-tabs { display:flex; gap:0; border-bottom:1px solid #ede9de; margin-bottom:20px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; }
        .exp-tabs::-webkit-scrollbar { display:none }
        .exp-tab-btn { padding:10px 16px; background:none; border:none; border-bottom:2px solid transparent; font-size:13px; font-weight:600; cursor:pointer; margin-bottom:-1px; white-space:nowrap; flex-shrink:0; }
        .exp-filters { display:flex; gap:10px; margin-bottom:16px; flex-wrap:wrap; }
        .exp-filters input { flex:1; min-width:160px; }
        .exp-table-scroll { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .exp-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:8px; }
        @media(max-width:900px){
          .content{padding:16px!important;padding-bottom:64px!important}
          .exp-kpi-grid{grid-template-columns:repeat(2,1fr)}
          .exp-cat-grid{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:600px){
          .content{padding:12px!important;padding-bottom:80px!important}
          .topbar{padding:10px 12px!important;min-height:auto!important}
          .topbar-title{font-size:15px!important}
          .topbar-actions{width:100%;justify-content:flex-end}
          .exp-kpi-grid{grid-template-columns:1fr 1fr;gap:8px}
          .exp-kpi-health{grid-column:span 2}
          .exp-cat-grid{grid-template-columns:1fr}
          .exp-rec-grid{grid-template-columns:1fr}
          .exp-form-grid{grid-template-columns:1fr!important}
          .exp-form-full{grid-column:span 1!important}
          .exp-table-scroll table{font-size:12px}
          .exp-table-scroll th,.exp-table-scroll td{padding:9px 10px!important}
          .exp-filters{flex-direction:column}
          .exp-filters input,.exp-filters select,.exp-filters button{width:100%;box-sizing:border-box}
          .exp-tab-btn{padding:9px 12px;font-size:12px}
          .exp-kpi-val{font-size:15px!important}
          .exp-kpi-sub{font-size:10px!important}
          .exp-modal-card{border-radius:12px!important;max-height:calc(100vh - 16px)!important}
          .exp-barchart{height:160px!important}
        }
        @media(max-width:380px){
          .exp-kpi-grid{grid-template-columns:1fr}
          .exp-kpi-health{grid-column:span 1}
          .exp-kpi-val{font-size:14px!important}
        }
      ` }} />

      {/* ── Topbar ── */}
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Receipt size={20} color="#c8952a" />
          <span className="topbar-title">Expenses</span>
        </div>
        <div className="topbar-actions">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #ddd9cf', fontSize: 13, fontWeight: 600, color: '#0f0e0b', background: '#fff' }}>
            {[thisYear + 1, thisYear, thisYear - 1, thisYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {dueSoon > 0 && (
            <button onClick={() => setTab('recurring')}
              style={{ position: 'relative', background: '#fff', border: '1px solid #ddd9cf', borderRadius: 8, padding: '7px 10px', cursor: 'pointer' }}>
              <Bell size={16} />
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, background: '#dc2626', borderRadius: '50%', fontSize: 9, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {dueSoon}
              </span>
            </button>
          )}

          <button onClick={() => { setShowForm(true); setEditId(null) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#c8952a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Add Expense
          </button>
        </div>
      </div>

      {/* ── Modal Form (fixed overlay, outside content scroll) ── */}
      {(showForm || editId) && (
        <ExpenseForm
          initial={editId ? editInit : undefined}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditId(null) }}
          saving={saving}
        />
      )}

      {/* ── Main content area ── */}
      <div className="content">

        {/* KPI strip */}
        {summary && (
          <div className="exp-kpi-grid">
            {/* Health */}
            <div className="exp-kpi-health" style={{ background: hCfg.bg, borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <HIcon size={15} color={hCfg.color} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: hCfg.color }}>Business Health</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: hCfg.color }}>{hCfg.label}</div>
              <div style={{ fontSize: 11, color: '#6b6560', marginTop: 2 }}>{Math.abs(summary.profit_margin)}% net margin (YTD)</div>
              {summary.missing_cogs && (
                <div style={{ fontSize: 10, color: '#d97706', marginTop: 4, fontWeight: 600 }}>Margin may be overstated &mdash; no COGS recorded</div>
              )}
            </div>
            {/* KPI cards */}
            {[
              { label: 'Revenue Collected', val: fmt(summary.ytd_revenue),              sub: 'Cash collected ' + year,              col: '#059669' },
              { label: 'Total Expenses',    val: fmt(summary.total_expenses),            sub: 'COGS + OPEX + Finance',              col: '#dc2626' },
              { label: 'Gross Profit',      val: fmt(summary.gross_profit),             sub: (summary.gross_margin ?? 0) + '% gross margin', col: (summary.gross_profit ?? 0) >= 0 ? '#059669' : '#dc2626' },
              { label: 'Net ' + ((summary.net_profit ?? 0) >= 0 ? 'Profit' : 'Loss'),   val: fmt(Math.abs(summary.net_profit ?? 0)), sub: Math.abs(summary.profit_margin) + '% net margin', col: (summary.net_profit ?? 0) >= 0 ? '#059669' : '#dc2626' },
              { label: 'Tax Deductible',    val: fmt(summary.total_deductible),         sub: 'FIRS allowable',                    col: '#2563eb' },
            ].map(k => (
              <div key={k.label} style={{ ...CARD, padding: '16px 18px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', marginBottom: 6 }}>{k.label}</div>
                <div className="exp-kpi-val" style={{ fontSize: 18, fontWeight: 800, color: k.col }}>{k.val}</div>
                <div className="exp-kpi-sub" style={{ fontSize: 11, color: '#9e9990', marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div className="exp-tabs">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="exp-tab-btn"
              style={{ borderBottomColor: tab === t.key ? '#c8952a' : 'transparent', color: tab === t.key ? '#c8952a' : '#6b6560' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── TAB: By Category ── */}
        {tab === 'overview' && summary && (
          summary.groups.length === 0 ? (
            <div style={{ ...CARD, padding: '60px 32px', textAlign: 'center' }}>
              <Receipt size={48} color="#ddd9cf" style={{ margin: '0 auto 16px', display: 'block' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f0e0b', marginBottom: 8 }}>No expenses for {year}</div>
              <div style={{ fontSize: 14, color: '#9e9990', marginBottom: 24 }}>Add expenses to see P&amp;L analysis.</div>
              <button onClick={() => setShowForm(true)}
                style={{ padding: '12px 28px', background: '#c8952a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Add First Expense
              </button>
            </div>
          ) : (
            <div className="exp-cat-grid">
              {/* Category group cards */}
              {summary.groups.map(g => (
                <div key={g.group} style={{ ...CARD, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0f0e0b' }}>{g.group}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: '#dc2626' }}>{fmt(g.total)}</span>
                  </div>
                  {g.categories.map(c => {
                    const pct = summary.total_expenses > 0 ? Math.round(c.amount / summary.total_expenses * 100) : 0
                    return (
                      <div key={c.category} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ color: '#2c2a24' }}>{c.label}</span>
                            {!c.is_deductible && (
                              <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>Non-deductible</span>
                            )}
                          </div>
                          <span style={{ fontWeight: 600 }}>{fmt(c.amount)}</span>
                        </div>
                        <div style={{ height: 5, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: pct + '%', background: '#c8952a', borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 11, color: '#9e9990', marginTop: 2 }}>
                          {c.count} {c.count === 1 ? 'entry' : 'entries'} &middot; {pct}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}

              {/* P&L Statement card */}
              <div style={{ background: '#0f0e0b', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>P&amp;L Statement &mdash; {year} YTD</div>
                <div style={{ fontSize: 11, color: '#6b6560', marginBottom: 14 }}>Cash basis &middot; Revenue = payments collected this year</div>

                {summary.missing_cogs && (
                  <div style={{ background: '#fef3c7', borderRadius: 8, padding: '8px 12px', marginBottom: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>No Cost of Sales recorded</div>
                    <div style={{ fontSize: 11, color: '#92400e', marginTop: 2 }}>Add a Cost of Sales expense to see accurate gross profit.</div>
                  </div>
                )}

                {plRows.filter(r => !r.skip).map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: r.bold ? '10px 0' : '6px 0', borderTop: r.bold ? '1px solid rgba(255,255,255,0.15)' : 'none', marginTop: r.bold ? 2 : 0 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: r.bold ? 700 : 400, color: r.bold ? '#fff' : '#9e9990', paddingLeft: r.indent ? 16 : 0 }}>{r.label}</span>
                      {r.sub && <div style={{ fontSize: 10, color: '#6b6560' }}>{r.sub}</div>}
                    </div>
                    <span style={{ fontSize: r.bold ? 13 : 12, fontWeight: r.bold ? 800 : 500, color: r.val === 0 ? '#6b6560' : r.color }}>
                      {r.val === 0 ? '\u2014' : r.val < 0 ? '(' + fmt(Math.abs(r.val)) + ')' : fmt(r.val)}
                    </span>
                  </div>
                ))}

                <div style={{ marginTop: 14, padding: '10px 12px', background: hCfg.bg, borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: hCfg.color }}>{hCfg.label} &middot; {Math.abs(summary.profit_margin ?? 0)}% net margin</div>
                  <div style={{ fontSize: 11, color: '#6b6560', marginTop: 2 }}>Cash collected: {fmt(summary.ytd_revenue)} &middot; Tax-deductible: {fmt(summary.total_deductible)}</div>
                </div>
              </div>
            </div>
          )
        )}

        {/* ── TAB: Cash Flow ── */}
        {tab === 'cashflow' && summary && (
          <div style={{ ...CARD, padding: '24px 24px 32px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0e0b', marginBottom: 20 }}>Monthly Cash Flow {year}</div>

            {/* Bar chart */}
            <div className="exp-barchart" style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 200, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
              {summary.monthly.map(m => {
                const rh = Math.max((m.revenue / maxBar) * 160, m.revenue > 0 ? 4 : 0)
                const eh = Math.max((m.expenses / maxBar) * 160, m.expenses > 0 ? 4 : 0)
                return (
                  <div key={m.month} style={{ flex: 1, minWidth: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: 160 }}>
                      <div title={'Revenue: ' + fmt(m.revenue)} style={{ flex: 1, background: '#d1fae5', borderRadius: '4px 4px 0 0', height: rh + 'px' }} />
                      <div title={'Expenses: ' + fmt(m.expenses)} style={{ flex: 1, background: '#fee2e2', borderRadius: '4px 4px 0 0', height: eh + 'px' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#9e9990', fontWeight: 600 }}>{m.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
              {[['#d1fae5', '#059669', 'Revenue'], ['#fee2e2', '#dc2626', 'Expenses']].map(([bg, bd, lbl]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6b6560' }}>
                  <div style={{ width: 12, height: 12, background: bg, border: '1px solid ' + bd, borderRadius: 3 }} />
                  {lbl}
                </div>
              ))}
            </div>

            {/* Monthly data table */}
            <div className="exp-table-scroll" style={{ borderRadius: 8, border: '1px solid #ede9de' }}>
              <table style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#faf9f6' }}>
                    {['Month', 'Revenue', 'Expenses', 'Net', 'Status'].map(h => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left', fontSize: 11,
                        fontWeight: 700, color: '#9e9990', textTransform: 'uppercase',
                        letterSpacing: '0.4px', borderBottom: '2px solid #ede9de',
                        whiteSpace: 'nowrap', background: '#faf9f6',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {summary.monthly.filter(m => m.is_past || m.is_current).map((m, i, arr) => (
                    <tr key={m.month} style={{
                      background: m.is_current ? '#fffbf0' : i % 2 === 0 ? '#fff' : '#fafaf8',
                      borderBottom: i < arr.length - 1 ? '1px solid #f0ede6' : 'none',
                    }}>
                      <td style={{ padding: '12px 16px', fontWeight: m.is_current ? 700 : 500, color: '#0f0e0b', whiteSpace: 'nowrap' }}>
                        {m.label}
                        {m.is_current && (
                          <span style={{ marginLeft: 6, fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>NOW</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#059669', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {m.revenue > 0 ? fmt(m.revenue) : <span style={{ color: '#d1ccc4' }}>&mdash;</span>}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {m.expenses > 0 ? fmt(m.expenses) : <span style={{ color: '#d1ccc4' }}>&mdash;</span>}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, whiteSpace: 'nowrap', color: m.profit >= 0 ? '#059669' : '#dc2626' }}>
                        {m.revenue === 0 && m.expenses === 0
                          ? <span style={{ color: '#d1ccc4' }}>&mdash;</span>
                          : signed(m.profit)
                        }
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {m.revenue === 0 && m.expenses === 0 ? (
                          <span style={{ fontSize: 11, color: '#9e9990' }}>No data</span>
                        ) : m.profit >= 0 ? (
                          <span style={{ fontSize: 11, background: '#d1fae5', color: '#059669', padding: '3px 10px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>Profit</span>
                        ) : (
                          <span style={{ fontSize: 11, background: '#fee2e2', color: '#dc2626', padding: '3px 10px', borderRadius: 20, fontWeight: 700, whiteSpace: 'nowrap' }}>Loss</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: All Expenses ── */}
        {tab === 'list' && (
          <div>
            {/* Filters */}
            <div className="exp-filters">
              <input type="text" placeholder="Search description, vendor\u2026"
                value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd9cf', fontSize: 13 }} />
              <select value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(1) }}
                style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd9cf', fontSize: 13, background: '#fff' }}>
                <option value="">All Categories</option>
                {Object.entries(CAT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={() => { setSearch(''); setFilterCat(''); setPage(1) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: 'none', border: '1px solid #ddd9cf', borderRadius: 8, cursor: 'pointer', color: '#6b6560', fontSize: 13 }}>
                <RefreshCw size={13} /> Reset
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12, color: '#9e9990' }}>
                <Loader2 size={24} color="#c8952a" className="exp-spin" /> Loading\u2026
              </div>
            ) : expenses.length === 0 ? (
              <div style={{ ...CARD, padding: '48px 32px', textAlign: 'center' }}>
                <Receipt size={40} color="#ddd9cf" style={{ margin: '0 auto 12px', display: 'block' }} />
                <div style={{ fontSize: 16, fontWeight: 600, color: '#0f0e0b' }}>No expenses found</div>
                <div style={{ fontSize: 13, color: '#9e9990', marginTop: 4 }}>
                  {search || filterCat ? 'Try adjusting filters' : 'No expenses for ' + year}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ ...CARD, overflow: 'hidden' }}>
                  <div className="exp-table-scroll">
                    <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#faf9f6' }}>
                          {['Date', 'Category', 'Description', 'Vendor', 'Amount', 'Method', ''].map(h => (
                            <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #ede9de', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(e => (
                          editId === e.id ? null : (
                            <tr key={e.id} style={{ borderBottom: '1px solid #f5f3ef' }}>
                              <td style={{ padding: '11px 14px', color: '#6b6560', whiteSpace: 'nowrap' }}>{fmtDate(e.expense_date)}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <span style={{ fontSize: 12, background: '#faf9f6', border: '1px solid #ede9de', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>
                                  {e.category_label}
                                </span>
                                {e.is_recurring && (
                                  <span style={{ marginLeft: 4, fontSize: 10, background: '#dbeafe', color: '#1d4ed8', padding: '1px 5px', borderRadius: 4, fontWeight: 600 }}>
                                    {e.recurrence_period}
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '11px 14px', fontWeight: 500, maxWidth: 200 }}>
                                {e.description}
                                {e.subcategory && <div style={{ fontSize: 11, color: '#9e9990' }}>{e.subcategory}</div>}
                              </td>
                              <td style={{ padding: '11px 14px', color: '#6b6560' }}>{e.vendor_name ?? '\u2014'}</td>
                              <td style={{ padding: '11px 14px', fontWeight: 700, color: '#dc2626', whiteSpace: 'nowrap' }}>{fmt(e.amount)}</td>
                              <td style={{ padding: '11px 14px', color: '#9e9990', fontSize: 12 }}>{e.payment_method.replace(/_/g, ' ')}</td>
                              <td style={{ padding: '11px 14px' }}>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button onClick={() => setEditId(e.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', padding: 4 }}>
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDelete(e.id)} disabled={deleting === e.id}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#b83232', padding: 4 }}>
                                    {deleting === e.id ? <Loader2 size={14} className="exp-spin" /> : <Trash2 size={14} />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {total > 50 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, fontSize: 13, color: '#6b6560' }}>
                    <span>{total} total</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                        style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #ddd9cf', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
                        Prev
                      </button>
                      <button disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}
                        style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #ddd9cf', background: '#fff', cursor: page * 50 >= total ? 'not-allowed' : 'pointer', opacity: page * 50 >= total ? 0.5 : 1 }}>
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Recurring ── */}
        {tab === 'recurring' && (
          recurring.length === 0 ? (
            <div style={{ ...CARD, padding: '48px 32px', textAlign: 'center' }}>
              <Bell size={40} color="#ddd9cf" style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0f0e0b' }}>No recurring expenses</div>
              <div style={{ fontSize: 13, color: '#9e9990', marginTop: 4 }}>Mark expenses as recurring to get reminders.</div>
            </div>
          ) : (
            <div className="exp-rec-grid">
              {recurring.map(e => {
                const isOD   = !!e.is_overdue
                const soon   = !isOD && (e.days_until_due ?? 99) <= 7
                const lc     = isOD ? '#dc2626' : soon ? '#d97706' : '#0369a1'
                const lbg    = isOD ? '#fee2e2' : soon ? '#fef3c7' : '#f0f9ff'
                const lbd    = isOD ? '#fca5a5' : soon ? '#fde68a' : '#bae6fd'
                const slabel = isOD ? 'Overdue' : 'Due in ' + (e.days_until_due ?? '?') + 'd'
                return (
                  <div key={e.id} style={{ ...CARD, padding: 18, borderLeft: '3px solid ' + lc }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0f0e0b', marginBottom: 2 }}>{e.description}</div>
                        <div style={{ fontSize: 11, color: '#9e9990' }}>{e.category_label} &middot; {e.recurrence_period}</div>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, background: lbg, color: lc, border: '1px solid ' + lbd, padding: '3px 8px', borderRadius: 20 }}>
                        {slabel}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#dc2626' }}>{fmt(e.amount)}</div>
                      <button onClick={() => { setShowForm(true); setEditId(null) }}
                        style={{ padding: '6px 14px', background: '#c8952a', color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                        + Re-enter
                      </button>
                    </div>
                    {e.next_due_date && (
                      <div style={{ fontSize: 11, color: '#9e9990', marginTop: 6 }}>
                        Next due: {fmtDate(e.next_due_date)}{e.vendor_name ? ' \u00b7 ' + e.vendor_name : ''}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        )}

      </div>{/* /content */}
    </>
  )
}