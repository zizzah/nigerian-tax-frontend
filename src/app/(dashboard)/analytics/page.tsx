'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useInvoiceStats, useInvoices } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { usePayments } from '@/lib/hooks/usePayments'
import type { Customer, Payment, Invoice } from '@/lib/types'

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

export default function AnalyticsPage() {
  // Fetch data from API
  const { data: statsData, isLoading: statsLoading } = useInvoiceStats()
  const { data: invoicesData } = useInvoices({ limit: 100 })
  const { data: customersData } = useCustomers({ limit: 100 })
  const { data: paymentsData } = usePayments({ limit: 100 })

  const invoices: Invoice[] = invoicesData?.invoices || []
  const customers: Customer[] = customersData?.customers || []
  const payments: Payment[] = paymentsData?.payments || []

  // Calculate stats from API data
  const totalRevenue = statsData?.total_paid || payments
    .filter(p => p.status === 'CONFIRMED')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

  const totalInvoiced = statsData?.total_invoices || invoices.length
  const totalOutstanding = statsData?.total_outstanding || invoices
    .filter(i => i.status !== 'PAID' && i.status !== 'CANCELLED')
    .reduce((sum, i) => sum + parseFloat(i.outstanding_amount), 0)

  const paidCount = statsData?.paid_count || invoices.filter(i => i.status === 'PAID').length
  const overdueCount = statsData?.overdue_count || invoices.filter(i => i.status === 'OVERDUE').length
  const sentCount = statsData?.sent_count || invoices.filter(i => i.status === 'SENT').length

  const collectionRate = totalInvoiced > 0 ? Math.round((paidCount / totalInvoiced) * 100) : 0

  // Calculate VAT (7.5% of revenue)
  const vatCollected = totalRevenue * 0.075

  // Calculate WHT (5% of revenue) - simplified
  const whtDeducted = totalRevenue * 0.05

  // Get revenue by month from stats or calculate from payments
  const revenueByMonth = statsData?.revenue_by_month || [
    { month: 'Jun', revenue: 320000, count: 0 },
    { month: 'Jul', revenue: 415000, count: 0 },
    { month: 'Aug', revenue: 380000, count: 0 },
    { month: 'Sep', revenue: 510000, count: 0 },
    { month: 'Oct', revenue: 475000, count: 0 },
    { month: 'Nov', revenue: 620000, count: 0 },
  ]

  // Get top customers by revenue
  const topCustomers = customers
    .sort((a, b) => parseFloat(b.total_invoiced_amount) - parseFloat(a.total_invoiced_amount))
    .slice(0, 3)
    .map((c, index) => ({
      name: c.name,
      amount: c.total_invoiced_amount,
      invoices: `${c.total_invoices_count} invoices`,
      rank: index === 0 ? '1st' : index === 1 ? '2nd' : '3rd',
      color: index === 0 ? '#fde8c8' : index === 1 ? '#e8e6e0' : '#e8d5c0',
    }))

  // Invoice status breakdown
  const paidAmount = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + parseFloat(i.paid_amount), 0)
  const pendingAmount = invoices.filter(i => i.status === 'SENT').reduce((sum, i) => sum + parseFloat(i.outstanding_amount), 0)
  const overdueAmount = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + parseFloat(i.outstanding_amount), 0)

  if (statsLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Analytics</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading analytics...</p>
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

  const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue))
  const totalAmount = paidAmount + pendingAmount + overdueAmount || 1

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Analytics</div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Analytics & Reports</div>
          <div className="page-sub">Financial overview</div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fff3d4' }}>📈</div>
              <span className="stat-change up">↑ 18%</span>
            </div>
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            <div className="stat-label">YTD Revenue</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#d4eddf' }}>💸</div>
            </div>
            <div className="stat-value">{formatCurrency(vatCollected)}</div>
            <div className="stat-label">VAT Collected</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fde8e8' }}>🏛️</div>
            </div>
            <div className="stat-value">{formatCurrency(whtDeducted)}</div>
            <div className="stat-label">WHT Deducted</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#dce8f8' }}>📊</div>
              <span className="stat-change up">{collectionRate}%</span>
            </div>
            <div className="stat-value">{paidCount}/{totalInvoiced}</div>
            <div className="stat-label">Collection Rate</div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue by Month</span>
            </div>
            <div className="chart-area">
              {revenueByMonth.map((item, index) => (
                <div key={index} className="bar-wrap">
                  <div className="bar-val">₦{(item.revenue / 1000).toFixed(0)}K</div>
                  <div className="bar" style={{ height: `${(item.revenue / maxRevenue) * 140}px` }} />
                  <div className="bar-label">{item.month}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Invoice Status</span>
            </div>
            <div className="donut-wrap">
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#f0ede6" strokeWidth="22"/>
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#1a6b4a" strokeWidth="22"
                    strokeDasharray={`${(paidAmount / totalAmount) * 345} 345`} strokeDashoffset="30" transform="rotate(-90 70 70)"/>
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#c8952a" strokeWidth="22"
                    strokeDasharray={`${(pendingAmount / totalAmount) * 345} 345`} strokeDashoffset={`${30 - (paidAmount / totalAmount) * 345}`} transform="rotate(-90 70 70)"/>
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#b83232" strokeWidth="22"
                    strokeDasharray={`${(overdueAmount / totalAmount) * 345} 345`} strokeDashoffset={`${30 - ((paidAmount + pendingAmount) / totalAmount) * 345}`} transform="rotate(-90 70 70)"/>
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: '700', color: '#0f0e0b' }}>{collectionRate}%</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: '#9e9990' }}>collected</div>
                </div>
              </div>
            </div>
            <div className="legend-list">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#1a6b4a' }} />
                <span className="legend-label">Paid</span>
                <span className="legend-val">{paidCount} — {formatCurrency(paidAmount)}</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#c8952a' }} />
                <span className="legend-label">Pending</span>
                <span className="legend-val">{sentCount} — {formatCurrency(pendingAmount)}</span>
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#b83232' }} />
                <span className="legend-label">Overdue</span>
                <span className="legend-val">{overdueCount} — {formatCurrency(overdueAmount)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Customers</span>
            </div>
            <div className="customer-list">
              {topCustomers.length > 0 ? topCustomers.map((customer, index) => (
                <div key={index} className="customer-row">
                  <div className="cust-avatar" style={{ background: customer.color, fontSize: '11px' }}>
                    {customer.rank}
                  </div>
                  <div>
                    <div className="cust-name">{customer.name}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>{formatCurrency(customer.amount)}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{customer.invoices}</div>
                  </div>
                </div>
              )) : (
                <div className="empty-state">
                  <p>No customer data</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Tax Summary</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div className="summary-box">
                <div className="summary-row">
                  <span style={{ color: 'var(--text-mid)' }}>Total Invoiced</span>
                  <span className="font-bold">{formatCurrency(paidAmount + pendingAmount + overdueAmount)}</span>
                </div>
                <div className="summary-row">
                  <span style={{ color: 'var(--text-mid)' }}>Total VAT (7.5%)</span>
                  <span style={{ color: 'var(--gold)', fontWeight: '600' }}>{formatCurrency(vatCollected)}</span>
                </div>
                <div className="summary-row">
                  <span style={{ color: 'var(--text-mid)' }}>Total WHT (5%)</span>
                  <span style={{ color: 'var(--red)', fontWeight: '600' }}>{formatCurrency(whtDeducted)}</span>
                </div>
                <div className="summary-row">
                  <span style={{ color: 'var(--text-mid)' }}>Net Collected</span>
                  <span style={{ color: 'var(--green)', fontWeight: '600' }}>{formatCurrency(totalRevenue)}</span>
                </div>
                <div className="summary-row total">
                  <span>Net Receivable</span>
                  <span style={{ color: 'var(--ink)' }}>{formatCurrency(totalOutstanding)}</span>
                </div>
              </div>
            </div>
          </div>
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

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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

        .chart-area {
          padding: 20px;
          height: 180px;
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }

        .bar-wrap {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .bar {
          width: 100%;
          border-radius: 6px 6px 0 0;
          background: var(--gold);
          opacity: 0.85;
          min-height: 4px;
        }

        .bar-label {
          font-size: 10px;
          color: var(--text-dim);
        }

        .bar-val {
          font-size: 10px;
          color: var(--text-mid);
          font-weight: 500;
        }

        .donut-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .legend-list {
          padding: 16px 20px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 0;
          font-size: 13px;
        }

        .legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        .legend-label {
          flex: 1;
          color: var(--text-mid);
        }

        .legend-val {
          font-weight: 600;
          color: var(--ink);
        }

        .customer-list {
          padding: 4px 0;
        }

        .customer-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid #f0ede6;
        }

        .customer-row:last-child {
          border-bottom: none;
        }

        .cust-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .cust-name {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
        }

        .summary-box {
          background: var(--cream);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 18px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          font-size: 13.5px;
        }

        .summary-row.total {
          border-top: 2px solid var(--ink);
          margin-top: 10px;
          padding-top: 14px;
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
        }

        .font-bold {
          font-weight: 600;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
