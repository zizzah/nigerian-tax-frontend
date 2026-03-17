'use client'

import { useState } from 'react'
import { Plus, Loader2, AlertTriangle, Package } from 'lucide-react'
import { useProducts, useCreateProduct, useUpdateProduct } from '@/lib/hooks/useProducts'
import type { Product, ProductCreate } from '@/lib/types'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount)

// Determine stock status for a product
function stockStatus(product: Product): 'ok' | 'low' | 'out' | 'untracked' {
  if (!product.track_inventory) return 'untracked'
  const qty       = product.quantity_in_stock ?? 0
  const threshold = product.low_stock_threshold ?? 10
  if (qty <= 0)         return 'out'
  if (qty <= threshold) return 'low'
  return 'ok'
}

const STOCK_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  ok:        { bg: '#d4eddf', text: '#1a6b4a', label: '' },
  low:       { bg: '#fff3cd', text: '#856404', label: '⚠ Low'  },
  out:       { bg: '#fde8e8', text: '#b83232', label: '✕ Out'  },
  untracked: { bg: '#f0ede6', text: '#9e9990', label: '—'       },
}

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductModal({
  title, initial, onSave, onClose, isSaving,
}: {
  title: string
  initial: ProductCreate
  onSave: (data: ProductCreate) => void
  onClose: () => void
  isSaving: boolean
}) {
  const [form, setForm] = useState<ProductCreate>(initial)

  const set = (key: keyof ProductCreate, val: string | number | boolean) =>
    setForm(f => ({ ...f, [key]: val }))

  const S = {
    overlay:    { position:'fixed' as const, inset:0, background:'rgba(15,14,11,0.55)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 },
    modal:      { background:'#fff', borderRadius:16, width:'100%', maxWidth:580, boxShadow:'0 24px 64px rgba(0,0,0,0.22)', display:'flex', flexDirection:'column' as const, maxHeight:'92vh', overflow:'hidden' },
    header:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'18px 24px', borderBottom:'1px solid #ddd9cf' },
    title:      { fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:700, color:'#0f0e0b', margin:0 },
    closeBtn:   { background:'none', border:'none', fontSize:20, cursor:'pointer', color:'#9e9990', padding:'2px 8px' },
    body:       { padding:24, overflowY:'auto' as const, display:'flex', flexDirection:'column' as const, gap:14 },
    footer:     { padding:'14px 24px', borderTop:'1px solid #ddd9cf', display:'flex', justifyContent:'flex-end', gap:10 },
    grid2:      { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 },
    field:      { display:'flex', flexDirection:'column' as const, gap:5 },
    label:      { fontSize:11, fontWeight:500, color:'#9e9990', textTransform:'uppercase' as const, letterSpacing:'0.5px' },
    input:      { width:'100%', padding:'9px 12px', border:'1px solid #ddd9cf', borderRadius:8, fontSize:13.5, color:'#0f0e0b', background:'#fff', outline:'none', boxSizing:'border-box' as const, fontFamily:"'DM Sans',sans-serif" },
    check:      { display:'flex', alignItems:'center', gap:8, padding:'12px 14px', background:'#faf9f6', borderRadius:8, border:'1px solid #ddd9cf', cursor:'pointer' },
    checkLabel: { fontSize:13, color:'#2c2a24', cursor:'pointer', userSelect:'none' as const },
    btnOutline: { display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', background:'#fff', border:'1px solid #ddd9cf', color:'#2c2a24' },
    btnPrimary: { display:'inline-flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:8, fontSize:13, fontWeight:500, cursor:'pointer', background:'#c8952a', border:'none', color:'#0f0e0b' },
  }

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={S.header}>
          <h2 style={S.title}>{title}</h2>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.body}>
          <div style={S.grid2}>
            <div style={S.field}>
              <label style={S.label}>Product Name *</label>
              <input style={S.input} value={form.name} placeholder="e.g. Office Chair"
                onChange={e => set('name', e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>SKU</label>
              <input style={S.input} value={form.sku} placeholder="e.g. PRD-001"
                onChange={e => set('sku', e.target.value)} />
            </div>
          </div>

          <div style={S.field}>
            <label style={S.label}>Description</label>
            <input style={S.input} value={form.description} placeholder="Short description…"
              onChange={e => set('description', e.target.value)} />
          </div>

          <div style={S.grid2}>
            <div style={S.field}>
              <label style={S.label}>Category</label>
              <input style={S.input} value={form.category} placeholder="e.g. Electronics"
                onChange={e => set('category', e.target.value)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>VAT Rate (%)</label>
              <input style={S.input} type="number" value={form.tax_rate} min={0} max={100} step={0.5}
                onChange={e => set('tax_rate', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          <div style={S.grid2}>
            <div style={S.field}>
              <label style={S.label}>Unit Price (₦) *</label>
              <input style={S.input} type="number" value={form.unit_price} min={0} step="0.01"
                onChange={e => set('unit_price', parseFloat(e.target.value) || 0)} />
            </div>
            <div style={S.field}>
              <label style={S.label}>Cost Price (₦)</label>
              <input style={S.input} type="number" value={form.cost_price} min={0} step="0.01"
                onChange={e => set('cost_price', parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {/* Inventory tracking toggle */}
          <label style={S.check}>
            <input type="checkbox" checked={form.track_inventory}
              onChange={e => set('track_inventory', e.target.checked)}
              style={{ width:16, height:16, accentColor:'#c8952a', cursor:'pointer' }} />
            <div>
              <div style={S.checkLabel}>Track Inventory</div>
              <div style={{ fontSize:11, color:'#9e9990', marginTop:2 }}>Enable stock quantity tracking &amp; low-stock alerts</div>
            </div>
          </label>

          {form.track_inventory && (
            <div style={S.grid2}>
              <div style={S.field}>
                <label style={S.label}>Current Stock (units)</label>
                <input style={S.input} type="number" value={form.quantity_in_stock} min={0}
                  onChange={e => set('quantity_in_stock', parseInt(e.target.value) || 0)} />
              </div>
              <div style={S.field}>
                <label style={S.label}>Low Stock Alert Below</label>
                <input style={S.input} type="number" value={form.low_stock_threshold} min={1}
                  onChange={e => set('low_stock_threshold', parseInt(e.target.value) || 10)} />
              </div>
            </div>
          )}
        </div>
        <div style={S.footer}>
          <button style={S.btnOutline} onClick={onClose}>Cancel</button>
          <button style={{ ...S.btnPrimary, opacity: isSaving ? 0.65 : 1 }}
            onClick={() => onSave(form)} disabled={isSaving || !form.name}>
            {isSaving
              ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} /> Saving...</>
              : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

const BLANK: ProductCreate = {
  name: '', description: '', sku: '', category: '',
  unit_price: 0, cost_price: 0, tax_rate: 7.5,
  track_inventory: false, quantity_in_stock: 0, low_stock_threshold: 10,
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const [searchValue, setSearchValue]   = useState('')
  const [modalMode, setModalMode]       = useState<'add' | 'edit' | null>(null)
  const [editTarget, setEditTarget]     = useState<Product | null>(null)
  const [initialForm, setInitialForm]   = useState<ProductCreate>(BLANK)

  const { data: productsData, isLoading } = useProducts({ limit: 100, search: searchValue || undefined })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const products: Product[] = productsData?.products || []

  // Low-stock products (tracked, qty ≤ threshold or out)
  const alertProducts = products.filter(p => {
    const s = stockStatus(p)
    return s === 'low' || s === 'out'
  })

  const openAdd = () => { setInitialForm(BLANK); setModalMode('add') }
  const openEdit = (p: Product) => {
    setEditTarget(p)
    setInitialForm({
      name: p.name, description: p.description || '', sku: p.sku || '',
      category: p.category || '', unit_price: p.unit_price,
      cost_price: p.cost_price || 0, tax_rate: p.tax_rate,
      track_inventory: p.track_inventory,
      quantity_in_stock: p.quantity_in_stock || 0,
      low_stock_threshold: p.low_stock_threshold || 10,
    })
    setModalMode('edit')
  }

  const handleSave = async (data: ProductCreate) => {
    try {
      if (modalMode === 'edit' && editTarget) {
        await updateProduct.mutateAsync({ id: editTarget.id, data })
      } else {
        await createProduct.mutateAsync(data)
      }
      setModalMode(null)
      setEditTarget(null)
    } catch (e) { console.error(e) }
  }

  if (isLoading) {
    return (
      <>
        <div className="topbar"><div className="topbar-title">Products</div></div>
        <div className="loading-container"><Loader2 className="animate-spin" size={32} /><p>Loading products...</p></div>
        <style jsx>{`.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
      </>
    )
  }

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Products</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Search products…" value={searchValue}
              onChange={e => setSearchValue(e.target.value)} className="search-input" />
          </div>
          <button className="btn btn-gold" onClick={openAdd}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Products &amp; Services</div>
          <div className="page-sub">{productsData?.total ?? products.length} items in catalogue</div>
        </div>

        {/* ── Low-stock alert banner ── */}
        {alertProducts.length > 0 && (
          <div className="alert-banner">
            <AlertTriangle size={16} color="#856404" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize:13 }}>Stock Alert</strong>
              <span style={{ fontSize:12, marginLeft:6 }}>
                {alertProducts.filter(p => stockStatus(p) === 'out').length > 0 && (
                  <span style={{ color:'#b83232' }}>
                    {alertProducts.filter(p => stockStatus(p) === 'out').length} out of stock
                  </span>
                )}
                {alertProducts.filter(p => stockStatus(p) === 'out').length > 0 &&
                 alertProducts.filter(p => stockStatus(p) === 'low').length > 0 && ' · '}
                {alertProducts.filter(p => stockStatus(p) === 'low').length > 0 && (
                  <span style={{ color:'#856404' }}>
                    {alertProducts.filter(p => stockStatus(p) === 'low').length} running low
                  </span>
                )}
                {' — '}
                {alertProducts.map(p => p.name).join(', ')}
              </span>
            </div>
          </div>
        )}

        <div className="card">
          {products.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name / SKU</th><th>Category</th><th>Unit Price</th>
                  <th>Cost</th><th>VAT</th><th>Stock</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const status = stockStatus(product)
                  const badge  = STOCK_BADGE[status]
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="font-bold">{product.name}</div>
                        {product.sku && <div className="text-dim">{product.sku}</div>}
                      </td>
                      <td>
                        <span className="badge" style={{
                          background: product.category === 'Services' ? '#dce8f8' : '#f3e8ff',
                          color:      product.category === 'Services' ? '#1e4d8c' : '#7c3aed',
                        }}>
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="font-bold">{formatCurrency(product.unit_price)}</td>
                      <td className="text-dim">
                        {product.cost_price ? formatCurrency(product.cost_price) : '—'}
                      </td>
                      <td className="text-dim">{product.tax_rate}%</td>
                      <td>
                        {product.track_inventory ? (
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <span>{product.quantity_in_stock ?? 0}</span>
                            {status !== 'ok' && (
                              <span className="badge" style={{ background: badge.bg, color: badge.text, fontSize:10 }}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-dim">—</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(product)}>
                          Edit
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Package size={36} color="var(--text-dim)" />
              <p>{searchValue ? `No products match "${searchValue}"` : 'No products in your catalogue yet'}</p>
              <button className="btn btn-gold" onClick={openAdd}>
                <Plus size={16} /> Add First Product
              </button>
            </div>
          )}
        </div>
      </div>

      {modalMode && (
        <ProductModal
          title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
          initial={initialForm}
          onSave={handleSave}
          onClose={() => { setModalMode(null); setEditTarget(null) }}
          isSaving={createProduct.isPending || updateProduct.isPending}
        />
      )}

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .topbar-actions{display:flex;align-items:center;gap:10px}
        .content{flex:1;overflow-y:auto;padding:28px}
        .page-header{margin-bottom:16px}
        .page-title{font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:var(--ink)}
        .page-sub{font-size:13px;color:var(--text-dim);margin-top:4px}

        /* Alert banner */
        .alert-banner{display:flex;align-items:flex-start;gap:10px;padding:12px 16px;background:#fffbe6;border:1px solid #f0c96b;border-radius:10px;margin-bottom:16px;color:#856404}

        .card{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
        .table{width:100%;border-collapse:collapse}
        .table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-dim);padding:10px 20px;background:var(--cream);font-weight:500;border-bottom:1px solid var(--border)}
        .table td{padding:13px 20px;border-bottom:1px solid #f0ede6;font-size:13.5px;vertical-align:middle}
        .table tr:last-child td{border-bottom:none}
        .table tr:hover td{background:var(--gold-pale)}
        .font-bold{font-weight:600}
        .text-dim{color:var(--text-dim);font-size:12px}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.15s}
        .btn-gold{background:var(--gold);color:var(--ink)}
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
        .btn-outline:hover{background:var(--cream)}
        .btn-sm{padding:6px 12px;font-size:12px}
        .search-wrap{position:relative}
        .search-input{padding:9px 14px 9px 38px;border:1px solid var(--border);border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;color:var(--text);background:var(--cream);outline:none;width:220px;transition:all 0.15s}
        .search-input:focus{border-color:var(--gold);background:#fff}
        .search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--text-dim)}
        .empty-state{padding:48px 20px;text-align:center;color:var(--text-dim);display:flex;flex-direction:column;align-items:center;gap:12px}
        .empty-state p{margin:0}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:900px){
          .topbar{flex-wrap:wrap;height:auto;padding:12px 16px}
          .topbar-actions{width:100%;justify-content:space-between}
        }
        @media(max-width:768px){
          .content{padding:12px}
          .table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch}
          .table th,.table td{padding:8px 10px;font-size:12px;white-space:nowrap}
          .topbar{flex-wrap:wrap;height:auto;min-height:52px;padding:10px 14px}
          .topbar-actions{flex-wrap:wrap;gap:6px}
        }
        @media(max-width:480px){
          .content{padding:8px}
          .topbar-title{font-size:15px}
          .table th,.table td{padding:6px 8px;font-size:11px}
        }
      `}</style>
    </>
  )
}