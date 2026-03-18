'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, AlertTriangle, Package, History } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct } from '@/lib/hooks/useProducts'
import type { Product, ProductCreate } from '@/lib/types'
import apiClient from '@/lib/api/client'
import { toast } from 'sonner'

// ── Types ─────────────────────────────────────────────────────────────────────

interface StockSummary {
  product_id: string; name: string; sku: string
  total_in: number; total_sold: number; available: number
  is_low: boolean; is_out: boolean; unit_price: number; cost_price: number
}
interface Movement {
  id: string; type: string; quantity: number
  unit_cost: number | null; note: string | null
  movement_date: string; invoice_number: string | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const N = (n: number) =>
  '\u20a6' + new Intl.NumberFormat('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(n || 0))

const D = (s: string) => {
  try { return new Date(s).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) }
  catch { return s }
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const INP: React.CSSProperties = { padding: '9px 12px', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, color: '#0f0e0b', background: '#fff', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }
const LBL: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 5 }
const BTN: React.CSSProperties = { padding: '10px 20px', background: '#c8952a', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }
const GHOST: React.CSSProperties = { padding: '10px 16px', background: 'none', color: '#6b6560', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, cursor: 'pointer' }
const OL: React.CSSProperties = { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,14,11,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }
const CARD: React.CSSProperties = { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: 'calc(100vh - 32px)', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'hidden' }
const HEAD: React.CSSProperties = { padding: '18px 24px', borderBottom: '1px solid #ede9de', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }
const BODY: React.CSSProperties = { padding: '20px 24px', overflowY: 'auto', flex: 1 }
const FOOT: React.CSSProperties = { padding: '16px 24px', borderTop: '1px solid #ede9de', display: 'flex', gap: 10, flexShrink: 0, background: '#fff' }
const TH: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#9e9990', textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #ede9de', background: '#faf9f6', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '11px 14px', fontSize: 13, borderBottom: '1px solid #f5f3ef', color: '#0f0e0b', verticalAlign: 'middle' }

const BLANK: ProductCreate = { name: '', description: '', sku: '', category: '', unit_price: 0, cost_price: 0, tax_rate: 7.5, track_inventory: true, quantity_in_stock: 0, low_stock_threshold: 10 }

// ── Product Form Modal ────────────────────────────────────────────────────────

function ProductForm({ initial, mode, onSave, onCancel, saving }: {
  initial: ProductCreate; mode: 'add' | 'edit'
  onSave: (f: ProductCreate) => void; onCancel: () => void; saving: boolean
}) {
  const [f, setF] = useState<ProductCreate>(initial)
  const set = (k: keyof ProductCreate, v: string | number | boolean) => setF(p => ({ ...p, [k]: v }))
  const isValid = !!(f.name && f.unit_price > 0)

  return (
    <div style={OL}>
      <div style={CARD}>
        <div style={HEAD}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#0f0e0b' }}>{mode === 'add' ? 'Add Product' : 'Edit Product'}</span>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', fontSize: 22 }}>&times;</button>
        </div>
        <div style={BODY}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={LBL}>Product Name *</label>
              <input style={INP} value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. HP Elitebook Pro" />
            </div>
            <div>
              <label style={LBL}>SKU / Code</label>
              <input style={INP} value={f.sku || ''} onChange={e => set('sku', e.target.value)} placeholder="PRD001" />
            </div>
            <div>
              <label style={LBL}>Category</label>
              <input style={INP} value={f.category || ''} onChange={e => set('category', e.target.value)} placeholder="e.g. Laptops" />
            </div>
            <div>
              <label style={LBL}>Unit Price (&#8358;) *</label>
              <input style={INP} type="number" min={0} value={f.unit_price} onChange={e => set('unit_price', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <label style={LBL}>
                Cost Price (&#8358;)
                <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 4, marginLeft: 6, fontWeight: 600 }}>P&amp;L Required</span>
              </label>
              <input style={INP} type="number" min={0} value={f.cost_price || 0} placeholder="Purchase cost per unit" onChange={e => set('cost_price', parseFloat(e.target.value) || 0)} />
              <span style={{ fontSize: 11, color: '#9e9990', marginTop: 3, display: 'block' }}>Used to auto-calculate COGS</span>
            </div>
            <div>
              <label style={LBL}>VAT Rate (%)</label>
              <input style={INP} type="number" min={0} max={100} step={0.5} value={f.tax_rate || 0} onChange={e => set('tax_rate', parseFloat(e.target.value) || 0)} />
            </div>
            <div style={{ gridColumn: 'span 2', borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
                <input type="checkbox" checked={f.track_inventory} onChange={e => set('track_inventory', e.target.checked)} style={{ width: 15, height: 15, accentColor: '#c8952a' }} />
                Track inventory for this product
              </label>
            </div>
            {f.track_inventory && (
              <>
                <div>
                  <label style={LBL}>{mode === 'add' ? 'Opening Stock Qty' : 'Stock Qty'}</label>
                  <input style={INP} type="number" min={0} value={f.quantity_in_stock || 0} onChange={e => set('quantity_in_stock', parseInt(e.target.value) || 0)} />
                  {mode === 'edit' && <span style={{ fontSize: 11, color: '#d97706', marginTop: 3, display: 'block' }}>Use Restock button to add new stock</span>}
                </div>
                <div>
                  <label style={LBL}>Low Stock Alert</label>
                  <input style={INP} type="number" min={0} value={f.low_stock_threshold || 10} onChange={e => set('low_stock_threshold', parseInt(e.target.value) || 0)} />
                </div>
              </>
            )}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={LBL}>Description</label>
              <textarea style={{ ...INP, height: 56, resize: 'vertical' }} value={f.description || ''} onChange={e => set('description', e.target.value)} placeholder="Optional" />
            </div>
          </div>
        </div>
        <div style={FOOT}>
          <button onClick={() => onSave(f)} disabled={saving || !isValid} style={{ ...BTN, flex: 1, justifyContent: 'center', opacity: saving || !isValid ? 0.7 : 1, cursor: saving || !isValid ? 'not-allowed' : 'pointer' }}>
            {saving ? <><Loader2 size={14} /> Saving...</> : mode === 'add' ? 'Add Product' : 'Save Changes'}
          </button>
          <button onClick={onCancel} style={GHOST}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  const [search,         setSearch]         = useState('')
  const [modalMode,      setModalMode]      = useState<'add' | 'edit' | null>(null)
  const [editTarget,     setEditTarget]     = useState<Product | null>(null)
  const [stockData,      setStockData]      = useState<StockSummary[]>([])
  const [restockTarget,  setRestockTarget]  = useState<StockSummary | null>(null)
  const [restockQty,     setRestockQty]     = useState('')
  const [restockCost,    setRestockCost]    = useState('')
  const [restockNote,    setRestockNote]    = useState('')
  const [restocking,     setRestocking]     = useState(false)
  const [historyTarget,  setHistoryTarget]  = useState<StockSummary | null>(null)
  const [movements,      setMovements]      = useState<Movement[]>([])
  const [histLoading,    setHistLoading]    = useState(false)

  const { data: productsData, isLoading, refetch } = useProducts({ limit: 100, search: search || undefined })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const products: Product[] = productsData?.products || []

  const loadStock = useCallback(async () => {
    try {
      const r = await apiClient.get('/stock-movements/')
      setStockData(r.data as StockSummary[])
    } catch { /* stock_movements table not yet created */ }
  }, [])

  useEffect(() => { loadStock() }, [loadStock])

  const stockMap = Object.fromEntries(stockData.map(s => [s.product_id, s]))

  const alertProducts = products.filter(p => {
    if (!p.track_inventory) return false
    const sm = stockMap[p.id]
    const avail = sm ? sm.available : (p.quantity_in_stock ?? 0)
    return avail <= (p.low_stock_threshold ?? 10)
  })

  const handleSave = async (form: ProductCreate) => {
    try {
      if (modalMode === 'add') {
        await createProduct.mutateAsync(form)
        toast.success('Product added')
      } else if (editTarget) {
        await updateProduct.mutateAsync({ id: editTarget.id, data: form })
        toast.success('Product updated')
      }
      setModalMode(null); setEditTarget(null)
      refetch(); loadStock()
    } catch { toast.error('Failed to save product') }
  }

  const handleRestock = async () => {
    if (!restockTarget || !restockQty || parseFloat(restockQty) <= 0) return
    setRestocking(true)
    try {
      const r = await apiClient.post('/stock-movements/restock', {
        product_id: restockTarget.product_id,
        quantity:   parseFloat(restockQty),
        unit_cost:  restockCost ? parseFloat(restockCost) : undefined,
        note:       restockNote || 'Stock replenishment',
      })
      toast.success((r.data as { message: string }).message)
      setRestockTarget(null); setRestockQty(''); setRestockCost(''); setRestockNote('')
      loadStock(); refetch()
    } catch { toast.error('Failed to add stock') }
    finally { setRestocking(false) }
  }

  const openHistory = async (sm: StockSummary) => {
    setHistoryTarget(sm); setHistLoading(true); setMovements([])
    try {
      const r = await apiClient.get('/stock-movements/' + sm.product_id)
      setMovements((r.data as { movements: Movement[] }).movements)
    } catch { toast.error('Failed to load history') }
    finally { setHistLoading(false) }
  }

  const saving = createProduct.isPending || updateProduct.isPending

  const editInitial: ProductCreate | undefined = editTarget ? {
    name: editTarget.name, description: editTarget.description || '',
    sku: editTarget.sku || '', category: editTarget.category || '',
    unit_price: editTarget.unit_price, cost_price: editTarget.cost_price || 0,
    tax_rate: editTarget.tax_rate, track_inventory: editTarget.track_inventory,
    quantity_in_stock: editTarget.quantity_in_stock || 0,
    low_stock_threshold: editTarget.low_stock_threshold || 10,
  } : undefined

  if (isLoading) return (
    <>
      <div className="topbar"><div className="topbar-title">Products</div></div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12, color: '#9e9990' }}>
        <Loader2 size={24} color="#c8952a" /> Loading...
      </div>
    </>
  )

  return (
    <>
      {/* Product form modal */}
      {modalMode && (
        <ProductForm
          initial={modalMode === 'edit' && editInitial ? editInitial : BLANK}
          mode={modalMode}
          onSave={handleSave}
          onCancel={() => { setModalMode(null); setEditTarget(null) }}
          saving={saving}
        />
      )}

      {/* Restock modal */}
      {restockTarget && (
        <div style={OL}>
          <div style={{ ...CARD, maxWidth: 440 }}>
            <div style={HEAD}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0e0b' }}>Add Stock</div>
                <div style={{ fontSize: 12, color: '#9e9990', marginTop: 2 }}>{restockTarget.name}</div>
              </div>
              <button onClick={() => setRestockTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', fontSize: 22 }}>&times;</button>
            </div>
            <div style={BODY}>
              {/* Stock status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                {[
                  { label: 'Purchased',  val: restockTarget.total_in,   col: '#059669' },
                  { label: 'Sold',       val: restockTarget.total_sold, col: '#dc2626' },
                  { label: 'Available',  val: restockTarget.available,  col: restockTarget.is_out ? '#dc2626' : restockTarget.is_low ? '#d97706' : '#059669' },
                ].map(k => (
                  <div key={k.label} style={{ background: '#f7f6f2', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: k.col }}>{k.val}</div>
                    <div style={{ fontSize: 10, color: '#9e9990', marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{k.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={LBL}>Quantity to Add *</label>
                <input style={INP} type="number" min={1} placeholder="e.g. 10" value={restockQty} onChange={e => setRestockQty(e.target.value)} autoFocus />
                {restockQty && parseFloat(restockQty) > 0 && (
                  <span style={{ fontSize: 11, color: '#059669', marginTop: 3, display: 'block', fontWeight: 600 }}>
                    Available will become {restockTarget.available + parseFloat(restockQty)} units
                  </span>
                )}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={LBL}>Purchase Cost per Unit (&#8358;)</label>
                <input style={INP} type="number" min={0} placeholder={restockTarget.cost_price ? String(restockTarget.cost_price) : 'e.g. 300000'} value={restockCost} onChange={e => setRestockCost(e.target.value)} />
                <span style={{ fontSize: 11, color: '#9e9990', marginTop: 3, display: 'block' }}>Used for COGS calculation — leave blank to use existing cost price</span>
              </div>
              <div>
                <label style={LBL}>Note</label>
                <input style={INP} placeholder="e.g. Purchased from Ikeja supplier" value={restockNote} onChange={e => setRestockNote(e.target.value)} />
              </div>
            </div>
            <div style={FOOT}>
              <button onClick={handleRestock} disabled={restocking || !restockQty || parseFloat(restockQty) <= 0}
                style={{ ...BTN, flex: 1, justifyContent: 'center', opacity: restocking || !restockQty ? 0.7 : 1, cursor: restocking || !restockQty ? 'not-allowed' : 'pointer' }}>
                {restocking ? <><Loader2 size={14} /> Adding...</> : '+ Add ' + (restockQty || '0') + ' Units to Stock'}
              </button>
              <button onClick={() => setRestockTarget(null)} style={GHOST}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* History modal */}
      {historyTarget && (
        <div style={OL}>
          <div style={{ ...CARD, maxWidth: 660 }}>
            <div style={HEAD}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#0f0e0b' }}>Stock History — {historyTarget.name}</div>
                <div style={{ fontSize: 12, color: '#9e9990', marginTop: 2 }}>
                  {historyTarget.total_sold} units sold &middot; {historyTarget.available} available &middot; {historyTarget.total_in} total purchased
                </div>
              </div>
              <button onClick={() => setHistoryTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9e9990', fontSize: 22 }}>&times;</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {histLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 12, color: '#9e9990' }}>
                  <Loader2 size={20} color="#c8952a" /> Loading...
                </div>
              ) : movements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 24px', color: '#9e9990', fontSize: 13 }}>No stock movements recorded yet</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Date', 'Movement', 'Qty', 'Unit Cost', 'Note / Invoice'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {movements.map((m, i) => (
                        <tr key={m.id || i}>
                          <td style={{ ...TD, color: '#6b6560', whiteSpace: 'nowrap' }}>{D(m.movement_date)}</td>
                          <td style={TD}>
                            <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: m.type === 'IN' ? '#d1fae5' : '#fee2e2', color: m.type === 'IN' ? '#059669' : '#dc2626' }}>
                              {m.type === 'IN' ? '+ Stock In' : '- Sale Out'}
                            </span>
                          </td>
                          <td style={{ ...TD, fontWeight: 700, color: m.type === 'IN' ? '#059669' : '#dc2626' }}>
                            {m.type === 'IN' ? '+' : '-'}{m.quantity}
                          </td>
                          <td style={{ ...TD, color: '#6b6560' }}>{m.unit_cost ? N(m.unit_cost) : '—'}</td>
                          <td style={{ ...TD, color: '#6b6560', fontSize: 12 }}>
                            {m.invoice_number
                              ? <span style={{ color: '#c8952a', fontWeight: 600 }}>#{m.invoice_number}</span>
                              : (m.note || '—')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div style={{ ...FOOT, justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#6b6560' }}>
                Total COGS: <strong>{N(movements.filter(m => m.type === 'OUT').reduce((s, m) => s + m.quantity * (m.unit_cost || 0), 0))}</strong>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setRestockTarget(historyTarget); setHistoryTarget(null); setRestockCost(String(historyTarget.cost_price || '')) }} style={BTN}>+ Add Stock</button>
                <button onClick={() => setHistoryTarget(null)} style={GHOST}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className="topbar">
        <span className="topbar-title">Products</span>
        <div className="topbar-actions">
          <input style={{ padding: '8px 14px', border: '1px solid #ddd9cf', borderRadius: 8, fontSize: 13, color: '#0f0e0b', background: '#fff', width: 200 }}
            type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
          <button style={BTN} onClick={() => setModalMode('add')}><Plus size={14} /> Add Product</button>
        </div>
      </div>

      <div className="content">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f0e0b', margin: 0 }}>Products &amp; Services</h1>
            <p style={{ fontSize: 13, color: '#9e9990', margin: '4px 0 0' }}>{products.length} items in catalogue</p>
          </div>

          {alertProducts.length > 0 && (
            <div style={{ background: '#fffbf0', border: '1px solid #f6d860', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={16} color="#d97706" />
              <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>Stock Alert</span>
              <span style={{ fontSize: 13, color: '#6b6560' }}>
                {alertProducts.length === 1 ? '1 product' : alertProducts.length + ' products'} running low
                {' \u2014 '}{alertProducts.map(p => p.name).join(', ')}
              </span>
            </div>
          )}

          {products.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede9de', padding: '60px 32px', textAlign: 'center' }}>
              <Package size={48} color="#ddd9cf" style={{ display: 'block', margin: '0 auto 16px' }} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0f0e0b', marginBottom: 8 }}>
                {search ? 'No products match "' + search + '"' : 'No products yet'}
              </div>
              <div style={{ fontSize: 14, color: '#9e9990', marginBottom: 24 }}>Add products and services to start creating invoices.</div>
              {!search && <button style={BTN} onClick={() => setModalMode('add')}><Plus size={14} /> Add First Product</button>}
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #ede9de', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      {['NAME / SKU', 'CATEGORY', 'UNIT PRICE', 'COST PRICE', 'VAT', 'AVAILABLE STOCK', 'TOTAL SOLD', 'ACTION'].map(h => (
                        <th key={h} style={TH}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => {
                      const sm    = stockMap[product.id]
                      const avail = sm ? sm.available  : (product.quantity_in_stock ?? 0)
                      const sold  = sm ? sm.total_sold : (product.usage_count ?? 0)
                      const isOut = product.track_inventory && avail <= 0
                      const isLow = product.track_inventory && !isOut && avail <= (product.low_stock_threshold ?? 10)
                      const smFallback: StockSummary = { product_id: product.id, name: product.name, sku: product.sku || '', total_in: avail + sold, total_sold: sold, available: avail, is_low: isLow, is_out: isOut, unit_price: product.unit_price, cost_price: product.cost_price || 0 }

                      return (
                        <tr key={product.id} style={{ borderBottom: '1px solid #f5f3ef' }}>

                          {/* Name + SKU */}
                          <td style={TD}>
                            <div style={{ fontWeight: 700 }}>{product.name}</div>
                            {product.sku && <div style={{ fontSize: 11, color: '#9e9990', marginTop: 1 }}>{product.sku}</div>}
                          </td>

                          {/* Category */}
                          <td style={TD}>
                            <span style={{ fontSize: 11, background: '#f3e8ff', color: '#7c3aed', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                              {product.category || 'General'}
                            </span>
                          </td>

                          {/* Unit Price */}
                          <td style={{ ...TD, fontWeight: 700 }}>{N(product.unit_price)}</td>

                          {/* Cost Price */}
                          <td style={TD}>
                            {product.cost_price && product.cost_price > 0
                              ? <span style={{ color: '#6b6560' }}>{N(product.cost_price)}</span>
                              : <span style={{ color: '#d97706', fontSize: 11, fontWeight: 700 }}>Not set</span>}
                          </td>

                          {/* VAT */}
                          <td style={{ ...TD, color: '#9e9990' }}>{product.tax_rate}%</td>

                          {/* Available Stock */}
                          <td style={TD}>
                            {product.track_inventory ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 800, fontSize: 15, color: isOut ? '#dc2626' : isLow ? '#d97706' : '#059669' }}>{avail}</span>
                                {isOut && <span style={{ fontSize: 10, background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>OUT</span>}
                                {isLow && <span style={{ fontSize: 10, background: '#fef3c7', color: '#d97706', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>LOW</span>}
                                <button
                                  onClick={() => { setRestockTarget(sm || smFallback); setRestockCost(String(product.cost_price || '')) }}
                                  style={{ fontSize: 11, background: '#c8952a', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 9px', cursor: 'pointer', fontWeight: 600 }}>
                                  + Restock
                                </button>
                              </div>
                            ) : (
                              <span style={{ color: '#9e9990', fontSize: 12 }}>Not tracked</span>
                            )}
                          </td>

                          {/* Total Sold — click to see history */}
                          <td style={TD}>
                            {product.track_inventory ? (
                              <button onClick={() => openHistory(sm || smFallback)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c8952a', fontWeight: 800, fontSize: 15, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                {sold}
                                <History size={12} color="#9e9990" />
                              </button>
                            ) : (
                              <span style={{ color: '#9e9990', fontSize: 12 }}>—</span>
                            )}
                          </td>

                          {/* Edit */}
                          <td style={TD}>
                            <button onClick={() => { setEditTarget(product); setModalMode('edit') }}
                              style={{ padding: '5px 14px', background: 'none', border: '1px solid #ddd9cf', borderRadius: 7, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                              Edit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}