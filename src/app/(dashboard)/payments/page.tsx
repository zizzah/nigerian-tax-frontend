'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { usePayments } from '@/lib/hooks/usePayments'
import type { Payment } from '@/lib/types'

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
  CONFIRMED: { bg: '#d4eddf', text: '#1a6b4a' },
  PENDING: { bg: '#fff3cd', text: '#856404' },
  FAILED: { bg: '#fde8e8', text: '#b83232' },
}

const methodLabels: Record<string, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  CARD: 'Card',
  MOBILE_MONEY: 'Mobile Money',
  POS: 'POS',
  OTHER: 'Other',
}

export default function PaymentsPage() {
  const [searchValue, setSearchValue] = useState('')

  // Fetch data from API
  const { data: paymentsData, isLoading } = usePayments({ 
    limit: 50,
  })

  const payments: Payment[] = paymentsData?.payments || []
  const totalPayments = paymentsData?.total || 0

  // Calculate stats from API data
  const totalCollected = payments
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)
  
  const totalPending = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Payments</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading payments...</p>
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
        <div className="topbar-title">Payments</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search payments..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-gold">
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Payments</div>
          <div className="page-sub">{formatCurrency(totalCollected)} collected this month</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#d4eddf' }}>✅</div>
              <span className="stat-change up">+{payments.filter(p => p.status === 'CONFIRMED').length}</span>
            </div>
            <div className="stat-value">{formatCurrency(totalCollected)}</div>
            <div className="stat-label">Collected</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fff3cd' }}>⏳</div>
            </div>
            <div className="stat-value">{formatCurrency(totalPending)}</div>
            <div className="stat-label">Pending</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fde8e8' }}>🔴</div>
            </div>
            <div className="stat-value">{payments.filter(p => p.status === 'FAILED').length}</div>
            <div className="stat-label">Failed</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#dce8f8' }}>📊</div>
            </div>
            <div className="stat-value">{totalPayments}</div>
            <div className="stat-label">Transactions</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Payment Transactions</span>
          </div>
          
          {payments.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Invoice</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="text-dim">{formatDate(payment.payment_date)}</td>
                    <td>{payment.customer_name || '-'}</td>
                    <td>{payment.invoice_number || '-'}</td>
                    <td>{methodLabels[payment.payment_method] || payment.payment_method}</td>
                    <td className="font-bold">{formatCurrency(payment.amount)}</td>
                    <td>
                      <span 
                        className="badge"
                        style={{ 
                          background: statusColors[payment.status]?.bg || '#ede9de', 
                          color: statusColors[payment.status]?.text || '#6b6560' 
                        }}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No payments found</p>
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

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          box-shadow: var(--shadow);
        }

        .stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .stat-change.up {
          color: var(--green);
          background: var(--green-light);
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .stat-value {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--text-dim);
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

        .card-title {
          font-family: 'Fraunces', serif;
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
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

        .text-dim {
          color: var(--text-dim);
          font-size: 12px;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  )
}
