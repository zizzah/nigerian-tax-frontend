'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { useCreateInvoice } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { useProducts } from '@/lib/hooks/useProducts'
import type { InvoiceItemCreate } from '@/lib/types'
import { NLPInvoiceCreator } from '@/components/nLPInvoiceCreator'

interface LineItem {
  _id: number
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number
  discount_percent: number
}

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





const today = () => new Date().toISOString().split('T')[0]
const in30Days = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] }

const lineTotal = (item: LineItem) => {
  const base = item.quantity * item.unit_price
  const afterDiscount = base - (base * item.discount_percent / 100)
  return afterDiscount + afterDiscount * (item.tax_rate / 100)
}

const formatNum = (n: number) =>
  new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)

export default function NewInvoicePage() {
  const router = useRouter()
  const createInvoice = useCreateInvoice()

  const { data: customersData } = useCustomers({ limit: 100 })
  const { data: productsData }  = useProducts({ limit: 100 })

  const customers = customersData?.customers ?? []
  const products  = productsData?.products ?? []

  const [customerId, setCustomerId]     = useState('')
  const [issueDate, setIssueDate]       = useState(today())
  const [dueDate, setDueDate]           = useState(in30Days())
  const [notes, setNotes]               = useState('')
  const [paymentTerms, setPaymentTerms] = useState('')
  const [error, setError]               = useState<string | null>(null)
  const [showNLP, setShowNLP] = useState(false)




  const [lineItems, setLineItems] = useState<LineItem[]>([
    { _id: 1, description: '', quantity: 1, unit_price: 0, tax_rate: 7.5, discount_percent: 0 },
  ])

  const addLineItem = () => setLineItems(prev => [...prev, { _id: Date.now(), description: '', quantity: 1, unit_price: 0, tax_rate: 7.5, discount_percent: 0 }])
  const removeLineItem = (id: number) => { if (lineItems.length > 1) setLineItems(prev => prev.filter(i => i._id !== id)) }
  const updateLineItem = (id: number, field: keyof LineItem, value: string | number) =>
    setLineItems(prev => prev.map(item => item._id === id ? { ...item, [field]: value } : item))
  const applyProduct = (itemId: number, productId: string) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    setLineItems(prev => prev.map(item => item._id === itemId ? { ...item, product_id: product.id, description: product.name, unit_price: Number(product.unit_price), tax_rate: Number(product.tax_rate ?? 7.5) } : item))
  }

  const subtotal  = lineItems.reduce((sum, item) => { const base = item.quantity * item.unit_price; return sum + base - (base * item.discount_percent / 100) }, 0)
  const totalTax  = lineItems.reduce((sum, item) => { const base = item.quantity * item.unit_price; const ad = base - (base * item.discount_percent / 100); return sum + ad * (item.tax_rate / 100) }, 0)
  const total     = subtotal + totalTax


const handleNLPParsed = (data: ParsedInvoice) => {
  if (data.customer_id) setCustomerId(data.customer_id)
  setLineItems(data.line_items.map((item, i) => ({
    _id: Date.now() + i,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    tax_rate: item.tax_rate,
    discount_percent: 0,
  })))
  if (data.notes) setNotes(data.notes)
  if (data.payment_terms) setPaymentTerms(data.payment_terms)
  setShowNLP(false)
}



  const handleSubmit = async () => {
    setError(null)
    if (!customerId) { setError('Please select a customer'); return }
    if (lineItems.some(i => !i.description.trim())) { setError('All line items must have a description'); return }
    const items: InvoiceItemCreate[] = lineItems.map((item, idx) => ({
      product_id: item.product_id || undefined, description: item.description,
      quantity: item.quantity, unit_price: item.unit_price, tax_rate: item.tax_rate,
      discount_percent: item.discount_percent, sort_order: idx,
    }))
    try {
      const invoice = await createInvoice.mutateAsync({ customer_id: customerId, issue_date: issueDate, due_date: dueDate, payment_terms: paymentTerms || undefined, notes: notes || undefined, items })
      router.push(`/invoices/${invoice.id}`)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail
      if (typeof detail === 'string') setError(detail)
      else if (Array.isArray(detail)) setError(detail.map((e: { msg?: string }) => e.msg).join(', '))
      else setError('Failed to create invoice')
    }
  }

  return (
    <>
      {/* Topbar — stacks on mobile */}
      <div className="inv-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => router.push('/invoices')} className="back-btn">
            <ArrowLeft size={18} color="#6b6560" />
          </button>
          <h1 className="page-title">New Invoice</h1>
        </div>
        <div className="topbar-right">
      <button onClick={() => setShowNLP(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <Sparkles size={15} color="#c8952a" /> AI Create
      </button>

          <button onClick={() => router.push('/invoices')} className="btn btn-outline btn-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={createInvoice.isPending} className="btn btn-gold">
            {createInvoice.isPending ? <Loader2 size={15} className="spin" /> : <Save size={15} />}
            {createInvoice.isPending ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>

      <div className="inv-content">
        {error && <div className="error-banner">{error}</div>}

        {/* Invoice Details */}
        <div className="card">
          <div className="card-header"><span className="card-title">Invoice Details</span></div>
          <div className="form-grid">
            <div className="field span-2">
              <label className="label">Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="input">
                <option value="">Select customer...</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label">Issue Date</label>
              <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="input" />
            </div>
            <div className="field">
              <label className="label">Due Date</label>
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="input" />
            </div>
            <div className="field span-2">
              <label className="label">Payment Terms</label>
              <input type="text" value={paymentTerms} placeholder="e.g. Payment due within 30 days"
                onChange={e => setPaymentTerms(e.target.value)} className="input" />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-header">
            <span className="card-title">Line Items</span>
            <button type="button" onClick={addLineItem} className="btn btn-gold btn-sm">
              <Plus size={14} /> Add Item
            </button>
          </div>

          {/* Table — scrollable on mobile */}
          <div className="line-items-scroll">
            <table className="line-items-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 160 }}>Description</th>
                  <th style={{ width: 70 }}>Qty</th>
                  <th style={{ width: 120 }}>Unit Price (₦)</th>
                  <th style={{ width: 80 }}>VAT %</th>
                  <th style={{ width: 110 }}>Total (₦)</th>
                  <th style={{ width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {products.length > 0 && (
                          <select value={item.product_id ?? ''} onChange={e => applyProduct(item._id, e.target.value)} className="input" style={{ fontSize: 11, padding: '4px 8px' }}>
                            <option value="">— pick product —</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                        )}
                        <input type="text" value={item.description} onChange={e => updateLineItem(item._id, 'description', e.target.value)} className="input" placeholder="Item description" />
                      </div>
                    </td>
                    <td>
                      <input type="number" value={item.quantity} min={1} onChange={e => updateLineItem(item._id, 'quantity', parseFloat(e.target.value) || 1)} className="input" style={{ width: '100%' }} />
                    </td>
                    <td>
                      <input type="number" value={item.unit_price} min={0} step="0.01" onChange={e => updateLineItem(item._id, 'unit_price', parseFloat(e.target.value) || 0)} className="input" style={{ width: '100%' }} />
                    </td>
                    <td>
                      <input type="number" value={item.tax_rate} min={0} max={100} step="0.5" onChange={e => updateLineItem(item._id, 'tax_rate', parseFloat(e.target.value) || 0)} className="input" style={{ width: '100%' }} />
                    </td>
                    <td style={{ fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                      {formatNum(lineTotal(item))}
                    </td>
                    <td>
                      <button type="button" onClick={() => removeLineItem(item._id)} disabled={lineItems.length === 1}
                        style={{ background: 'none', border: 'none', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', opacity: lineItems.length === 1 ? 0.3 : 1, padding: 4, display: 'flex' }}>
                        <Trash2 size={15} color="#b83232" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile item cards — shown instead of table on very small screens */}
          <div className="line-items-cards">
            {lineItems.map((item, idx) => (
              <div key={item._id} className="item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#9e9990' }}>ITEM {idx + 1}</span>
                  <button type="button" onClick={() => removeLineItem(item._id)} disabled={lineItems.length === 1}
                    style={{ background: 'none', border: 'none', cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer', opacity: lineItems.length === 1 ? 0.3 : 1, padding: 2 }}>
                    <Trash2 size={15} color="#b83232" />
                  </button>
                </div>
                {products.length > 0 && (
                  <div className="item-field">
                    <label className="item-label">Product</label>
                    <select value={item.product_id ?? ''} onChange={e => applyProduct(item._id, e.target.value)} className="input">
                      <option value="">— pick product or type below —</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                )}
                <div className="item-field">
                  <label className="item-label">Description *</label>
                  <input type="text" value={item.description} onChange={e => updateLineItem(item._id, 'description', e.target.value)} className="input" placeholder="Item description" />
                </div>
                <div className="item-row-3">
                  <div className="item-field">
                    <label className="item-label">Qty</label>
                    <input type="number" value={item.quantity} min={1} onChange={e => updateLineItem(item._id, 'quantity', parseFloat(e.target.value) || 1)} className="input" />
                  </div>
                  <div className="item-field">
                    <label className="item-label">Unit Price (₦)</label>
                    <input type="number" value={item.unit_price} min={0} step="0.01" onChange={e => updateLineItem(item._id, 'unit_price', parseFloat(e.target.value) || 0)} className="input" />
                  </div>
                  <div className="item-field">
                    <label className="item-label">VAT %</label>
                    <input type="number" value={item.tax_rate} min={0} max={100} step="0.5" onChange={e => updateLineItem(item._id, 'tax_rate', parseFloat(e.target.value) || 0)} className="input" />
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 700, color: '#0f0e0b', marginTop: 8 }}>
                  Total: ₦{formatNum(lineTotal(item))}
                </div>
              </div>
            ))}
            <button type="button" onClick={addLineItem} className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}>
              <Plus size={14} /> Add Item
            </button>
          </div>
        </div>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
          <div className="card totals-card">
            <div className="total-row"><span className="total-label">Subtotal</span><span className="total-value">₦{formatNum(subtotal)}</span></div>
            <div className="total-row"><span className="total-label">VAT</span><span className="total-value">₦{formatNum(totalTax)}</span></div>
            <div className="total-row total-final"><span>Total</span><span>₦{formatNum(total)}</span></div>
          </div>
        </div>

        {/* Notes */}
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-header"><span className="card-title">Notes</span></div>
          <div style={{ padding: 16 }}>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="input"
              placeholder="Payment instructions or notes for the customer..."
              rows={3} style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Mobile save button */}
        <div className="mobile-save">
          <button onClick={handleSubmit} disabled={createInvoice.isPending} className="btn btn-gold" style={{ flex: 1, justifyContent: 'center', padding: '13px' }}>
            {createInvoice.isPending ? <><Loader2 size={16} className="spin" /> Saving...</> : <><Save size={16} /> Save Invoice</>}
          </button>
        </div>
      </div>

      <style>{`
        .inv-topbar {
          min-height: 60px; background: #faf9f6; border-bottom: 1px solid #ddd9cf;
          display: flex; align-items: center; padding: 10px 16px;
          justify-content: space-between; flex-shrink: 0; flex-wrap: wrap; gap: 8px;
        }
        .topbar-right { display: flex; gap: 8px; align-items: center; }
        .back-btn { background: none; border: none; cursor: pointer; padding: 8px; display: flex; align-items: center; border-radius: 6px; }
        .back-btn:hover { background: #f0ede6; }
        .page-title { font-family: Fraunces, serif; font-size: 18px; font-weight: 600; color: #0f0e0b; margin: 0; }
        .inv-content { flex: 1; overflow-y: auto; padding: 16px; padding-bottom: 80px; }
        .error-banner { background: #fde8e8; color: #b83232; border-radius: 8px; padding: 12px 16px; font-size: 13px; margin-bottom: 14px; }
        .card { background: #fff; border: 1px solid #ddd9cf; border-radius: 12px; box-shadow: 0 1px 3px rgba(15,14,11,0.08); overflow: hidden; }
        .card-header { padding: 14px 16px; border-bottom: 1px solid #ddd9cf; display: flex; align-items: center; justify-content: space-between; }
        .card-title { font-family: Fraunces, serif; font-size: 15px; font-weight: 600; color: #0f0e0b; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; padding: 16px; }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .span-2 { grid-column: span 2; }
        .label { font-size: 11px; font-weight: 500; color: #6b6560; text-transform: uppercase; letter-spacing: 0.5px; }
        .input { width: 100%; padding: 10px 12px; border: 1px solid #ddd9cf; border-radius: 8px; font-size: 14px; color: #2c2a24; background: #fff; outline: none; transition: border-color 0.15s; box-sizing: border-box; font-family: 'DM Sans', sans-serif; }
        .input:focus { border-color: #c8952a; }
        textarea.input { resize: vertical; }

        /* Line items table — visible on ≥ 520px */
        .line-items-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .line-items-table { width: 100%; border-collapse: collapse; min-width: 500px; }
        .line-items-table th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #9e9990; padding: 10px 12px; background: #f4f2eb; font-weight: 500; border-bottom: 1px solid #ddd9cf; white-space: nowrap; }
        .line-items-table td { padding: 10px 12px; border-bottom: 1px solid #f0ede6; font-size: 14px; vertical-align: middle; }

        /* Line items cards — visible on < 520px */
        .line-items-cards { display: none; padding: 14px; }
        .item-card { background: #faf9f6; border-radius: 10px; padding: 14px; margin-bottom: 12px; border: 1px solid #ede9de; }
        .item-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
        .item-label { font-size: 11px; font-weight: 500; color: #6b6560; text-transform: uppercase; letter-spacing: 0.5px; }
        .item-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

        .totals-card { width: 100%; max-width: 300px; padding: 18px; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; color: #6b6560; }
        .total-value { font-weight: 600; color: #0f0e0b; }
        .total-final { border-top: 1px solid #ddd9cf; padding-top: 10px; margin-top: 4px; font-weight: 700; font-size: 16px; color: #c8952a; }

        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; border: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
        .btn-gold { background: #c8952a; color: #0f0e0b; }
        .btn-gold:hover { background: #b8851a; }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-outline { background: #fff; border: 1px solid #ddd9cf; color: #2c2a24; }
        .btn-outline:hover { background: #f4f2eb; }
        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .mobile-save { display: none; position: fixed; bottom: 0; left: 0; right: 0; padding: 12px 16px; background: #fff; border-top: 1px solid #ddd9cf; z-index: 50; box-shadow: 0 -4px 16px rgba(0,0,0,0.08); display: none; gap: 10px; }

        @media (max-width: 640px) {
          .inv-topbar { padding: 10px 12px; }
          .page-title { font-size: 16px; }
          .form-grid { grid-template-columns: 1fr; }
          .span-2 { grid-column: span 1; }
          .inv-content { padding: 12px; padding-bottom: 80px; }
          .totals-card { max-width: 100%; }
        }
        @media (max-width: 520px) {
          .line-items-scroll { display: none; }
          .line-items-cards { display: block; }
          .mobile-save { display: flex; }
          .topbar-right .btn-outline { display: none; }
        }
        @media (max-width: 400px) {
          .item-row-3 { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
      {showNLP && <NLPInvoiceCreator onParsed={handleNLPParsed} onClose={() => setShowNLP(false)} />}

    </>
  )
}