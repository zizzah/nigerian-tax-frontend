'use client'

import { useState } from 'react'
import { useProducts, useCreateProduct, useDeleteProduct } from '@/lib/hooks/useProducts'
import { Product } from '@/lib/types'
import { toast } from 'sonner'
import { 
  Search, 
  Plus, 
  Package,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react'

const VAT_RATE = 7.5

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    sku: '',
    category: 'Services',
    unit_price: 0,
    cost_price: 0,
    vat_rate: VAT_RATE,
    is_active: true,
    track_inventory: false,
    current_stock: 0,
    low_stock_threshold: 10,
  })

  const { data: productsData, isLoading, error } = useProducts({ 
    search: search || undefined,
    category: category || undefined,
    limit: 50 
  })
  
  const createProduct = useCreateProduct()
  const deleteProduct = useDeleteProduct()

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createProduct.mutateAsync(newProduct)
      toast.success('Product added successfully!')
      setShowModal(false)
      setNewProduct({
        name: '',
        description: '',
        sku: '',
        category: 'Services',
        unit_price: 0,
        cost_price: 0,
        vat_rate: VAT_RATE,
        is_active: true,
        track_inventory: false,
        current_stock: 0,
        low_stock_threshold: 10,
      })
    } catch (err) {
      toast.error('Failed to create product')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(id)
        toast.success('Product deleted')
      } catch (err) {
        toast.error('Failed to delete product')
      }
    }
  }

  const products = productsData?.products || []
  const totalProducts = products.length

  return (
    <>
      {/* Topbar */}
      <div style={{ 
        height: '60px', 
        background: '#faf9f6', 
        borderBottom: '1px solid #ddd9cf', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 28px', 
        gap: '16px',
        flexShrink: 0 
      }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 600, color: '#0f0e0b', flex: 1 }}>
          Products & Services
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9e9990' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ 
                padding: '9px 14px 9px 38px', 
                border: '1px solid #ddd9cf', 
                borderRadius: '8px', 
                fontFamily: 'DM Sans, sans-serif', 
                fontSize: '13px', 
                color: '#2c2a24', 
                background: '#f4f2eb', 
                outline: 'none', 
                width: '220px',
                transition: 'all 0.15s'
              }}
            />
          </div>
          <button 
            onClick={() => setShowModal(true)}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 16px', 
              borderRadius: '8px', 
              fontFamily: 'DM Sans, sans-serif', 
              fontSize: '13px', 
              fontWeight: 500, 
              cursor: 'pointer', 
              border: 'none', 
              background: '#c8952a', 
              color: '#0f0e0b' 
            }}
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        {/* Products Table */}
        <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
              {totalProducts} items in catalogue
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setCategory('')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: category === '' ? 'none' : '1px solid #ddd9cf',
                  background: category === '' ? '#0f0e0b' : 'transparent',
                  color: category === '' ? '#fff' : '#6b6560',
                }}
              >
                All
              </button>
              <button 
                onClick={() => setCategory('Services')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: category === 'Services' ? 'none' : '1px solid #ddd9cf',
                  background: category === 'Services' ? '#0f0e0b' : 'transparent',
                  color: category === 'Services' ? '#fff' : '#6b6560',
                }}
              >
                Services
              </button>
              <button 
                onClick={() => setCategory('Products')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: category === 'Products' ? 'none' : '1px solid #ddd9cf',
                  background: category === 'Products' ? '#0f0e0b' : 'transparent',
                  color: category === 'Products' ? '#fff' : '#6b6560',
                }}
              >
                Products
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 size={32} style={{ color: '#c8952a', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#b83232' }}>
              Failed to load products
            </div>
          ) : products.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>📦</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: '#0f0e0b', marginBottom: '8px' }}>
                No products yet
              </div>
              <div style={{ fontSize: '13px', color: '#9e9990', marginBottom: '24px' }}>
                Add your first product or service to get started
              </div>
              <button 
                onClick={() => setShowModal(true)}
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontSize: '13px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: 'none', 
                  background: '#c8952a', 
                  color: '#0f0e0b' 
                }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Name</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Category</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>SKU</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Unit Price</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>VAT</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Status</th>
                  <th style={{ textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: Product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                    <td style={{ padding: '13px 20px', fontSize: '13.5px', fontWeight: 600, color: '#0f0e0b' }}>{product.name}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: product.category === 'Services' ? '#dce8f8' : '#f3e8ff',
                        color: product.category === 'Services' ? '#1e4d8c' : '#7c3aed',
                      }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#6b6560' }}>{product.sku || '-'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', fontWeight: 600, color: '#0f0e0b' }}>₦{parseFloat(product.unit_price || 0).toLocaleString()}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#6b6560' }}>{product.vat_rate || 0}%</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: product.is_active ? '#d4eddf' : '#ede9de',
                        color: product.is_active ? '#1a6b4a' : '#6b6560',
                      }}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9e9990',
                          padding: '8px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,14,11,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setShowModal(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '480px',
              maxWidth: '90vw',
              boxShadow: '0 8px 32px rgba(15,14,11,0.12)',
              animation: 'slideUp 0.25s ease'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600 }}>Add Product / Service</span>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9e9990', padding: '4px', borderRadius: '6px' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Name *</label>
                    <input 
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      required
                      placeholder="e.g. Web Design Package"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd9cf',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2c2a24',
                        background: '#fff',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Category *</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd9cf',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2c2a24',
                        background: '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="Services">Services</option>
                      <option value="Products">Products</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>SKU</label>
                    <input 
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      placeholder="e.g. WEB-001"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd9cf',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2c2a24',
                        background: '#fff',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Unit Price (₦) *</label>
                    <input 
                      type="number"
                      value={newProduct.unit_price}
                      onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                      required
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd9cf',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2c2a24',
                        background: '#fff',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Cost Price (₦)</label>
                    <input 
                      type="number"
                      value={newProduct.cost_price}
                      onChange={(e) => setNewProduct({ ...newProduct, cost_price: parseFloat(e.target.value) || 0 })}
                      placeholder="0"
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd9cf',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2c2a24',
                        background: '#fff',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>VAT Rate (%)</label>
                    <select 
                      value={newProduct.vat_rate}
                      onChange={(e) => setNewProduct({ ...newProduct, vat_rate: parseFloat(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: '1px solid #ddd9cf',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#2c2a24',
                        background: '#fff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value={7.5}>7.5% (Standard)</option>
                      <option value={0}>0% (Exempt)</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #ddd9cf',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#2c2a24',
                      background: '#fff',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>
              </div>
              <div style={{ padding: '16px 24px', borderTop: '1px solid #ddd9cf', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: '1px solid #ddd9cf',
                    background: 'transparent',
                    color: '#2c2a24',
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createProduct.isPending}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: createProduct.isPending ? 'not-allowed' : 'pointer',
                    border: 'none',
                    background: '#c8952a',
                    color: '#0f0e0b',
                    opacity: createProduct.isPending ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {createProduct.isPending && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
