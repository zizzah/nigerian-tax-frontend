'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { useProducts } from '@/lib/hooks/useProducts'
import type { Product } from '@/lib/types'

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ProductsPage() {
  const [searchValue, setSearchValue] = useState('')

  // Fetch data from API
  const { data: productsData, isLoading } = useProducts({ 
    limit: 50,
    search: searchValue || undefined,
  })

  const products: Product[] = productsData?.products || []
  const totalProducts = productsData?.total || 0

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Products</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading products...</p>
        </div>
        <style jsx>{`
          .loading-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            flex: 1;
            gap: 12px;
            color: var(--text-dim);
          }
        `}</style>
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
            <input
              type="text"
              placeholder="Search products..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-gold">
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Products & Services</div>
          <div className="page-sub">{totalProducts} items in catalogue</div>
        </div>

        {products.length > 0 ? (
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>VAT</th>
                  <th>Stock</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="font-bold">{product.name}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          background: product.category === 'Services' ? '#dce8f8' : '#f3e8ff',
                          color: product.category === 'Services' ? '#1e4d8c' : '#7c3aed'
                        }}
                      >
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td>{formatCurrency(product.unit_price)}</td>
                    <td>{product.vat_rate}%</td>
                    <td>{product.current_stock ?? '-'}</td>
                    <td>
                      <button className="btn btn-outline btn-sm">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <p>No products found</p>
              <button className="btn btn-gold">
                <Plus size={16} /> Add First Product
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .topbar {
          height: 60px;
          background: var(--paper);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 16px;
          flex-shrink: 0;
        }

        .topbar-title {
          font-family: 'Fraunces', serif;
          font-size: 20px;
          font-weight: 600;
          color: var(--ink);
          flex: 1;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-title {
          font-family: 'Fraunces', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--ink);
        }

        .page-sub {
          font-size: 13px;
          color: var(--text-dim);
          margin-top: 4px;
        }

        .card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: var(--shadow);
          overflow: hidden;
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-dim);
          padding: 10px 20px;
          background: var(--cream);
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }

        .table td {
          padding: 13px 20px;
          border-bottom: 1px solid #f0ede6;
          font-size: 13.5px;
        }

        .table tr:last-child td {
          border-bottom: none;
        }

        .table tr:hover td {
          background: var(--gold-pale);
        }

        .font-bold {
          font-weight: 600;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          transition: all 0.15s;
        }

        .btn-gold {
          background: var(--gold);
          color: var(--ink);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text);
        }

        .btn-outline:hover {
          background: var(--cream);
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .search-wrap {
          position: relative;
        }

        .search-input {
          padding: 9px 14px 9px 38px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--text);
          background: var(--cream);
          outline: none;
          width: 220px;
          transition: all 0.15s;
        }

        .search-input:focus {
          border-color: var(--gold);
          background: #fff;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-dim);
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }

        .empty-state p {
          margin-bottom: 12px;
        }

        @media (max-width: 1024px) {
          .topbar {
            flex-wrap: wrap;
            height: auto;
            padding: 12px 16px;
            gap: 10px;
          }
          .topbar-title {
            width: 100%;
            font-size: 18px;
          }
          .topbar-actions {
            width: 100%;
            justify-content: space-between;
          }
          .table {
            display: block;
            overflow-x: auto;
          }
        }

        @media (max-width: 768px) {
          .content {
            padding: 16px;
          }
          .page-header {
            margin-bottom: 16px;
          }
          .page-title {
            font-size: 22px;
          }
          .table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .table th, .table td {
            padding: 10px 12px;
            font-size: 12px;
            white-space: nowrap;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 12px;
          }
          .topbar-actions {
            flex-wrap: wrap;
          }
          .search-wrap {
            order: 3;
            width: 100%;
            margin-top: 8px;
          }
          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </>
  )
}
