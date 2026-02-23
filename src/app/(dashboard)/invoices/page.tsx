'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { useInvoices, useInvoiceStats } from '@/lib/hooks/useInvoices'
import type { Invoice } from '@/lib/types'

// Helper to format currency
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

// Helper to format date
const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID: { bg: '#d4eddf', text: '#1a6b4a' },
  SENT: { bg: '#fff3cd', text: '#856404' },
  OVERDUE: { bg: '#fde8e8', text: '#b83232' },
  DRAFT: { bg: '#ede9de', text: '#6b6560' },
  PARTIALLY_PAID: { bg: '#dce8f8', text: '#1e4d8c' },
}

export default function InvoicesPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [filter, setFilter] = useState('All')

  // Fetch data from API
  const { data: invoicesData, isLoading } = useInvoices({ 
    limit: 50,
    status: filter === 'All' ? undefined : filter,
  })
  const { data: statsData } = useInvoiceStats()

  const invoices: Invoice[] = invoicesData?.invoices || []
  const totalInvoices = invoicesData?.total || 0

  // Filter mapping for API
  const statusFilterMap: Record<string, string> = {
    'All': '',
    'Draft': 'DRAFT',
    'Pending': 'SENT',
    'Paid': 'PAID',
    'Overdue': 'OVERDUE',
  }

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Invoices</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading invoices...</p>
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
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">Invoices</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => router.push('/invoices/new')}
            className="btn btn-gold"
          >
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <div className="page-header">
          <div className="page-title">Invoices</div>
          <div className="page-sub">
            {statsData ? `${statsData.total_invoices} total invoices` : `${totalInvoices} total invoices`}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="flex gap-2">
              {['All', 'Draft', 'Pending', 'Paid', 'Overdue'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`btn ${filter === status ? 'btn-primary' : 'btn-outline'} btn-sm`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="search-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search invoices..."
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
          </div>
          
          {invoices.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Customer</th>
                  <th>Issue Date</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="font-bold">{invoice.invoice_number}</td>
                    <td>{invoice.customer_name || '-'}</td>
                    <td className="text-dim">{formatDate(invoice.issue_date)}</td>
                    <td className="text-dim">{formatDate(invoice.due_date)}</td>
                    <td className="font-bold">{formatCurrency(invoice.total_amount)}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          background: statusColors[invoice.status]?.bg || '#ede9de', 
                          color: statusColors[invoice.status]?.text || '#6b6560' 
                        }}
                      >
                        {invoice.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No invoices found</p>
              <button 
                onClick={() => router.push('/invoices/new')}
                className="btn btn-gold"
              >
                <Plus size={16} /> Create First Invoice
              </button>
            </div>
          )}
        </div>
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

        .card-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .btn-primary {
          background: var(--ink);
          color: #fff;
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
          border-color: #c5c0b5;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
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

        .flex {
          display: flex;
        }

        .gap-2 {
          gap: 8px;
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
          box-shadow: 0 0 0 3px rgba(200,149,42,0.1);
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-dim);
        }

        .text-dim {
          color: var(--text-dim);
          font-size: 12px;
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
          .card-header {
            flex-wrap: wrap;
            gap: 12px;
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
          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .flex {
            flex-wrap: wrap;
            width: 100%;
          }
          .gap-2 {
            gap: 6px;
          }
          .btn {
            padding: 6px 10px;
            font-size: 11px;
          }
          .search-wrap {
            width: 100%;
          }
          .search-input {
            width: 100%;
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
        }
      `}</style>
    </>
  )
}
