'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { useInvoices, useInvoiceStats } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { usePayments } from '@/lib/hooks/usePayments'
import type { Invoice, Payment } from '@/lib/types'

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
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID: { bg: '#d4eddf', text: '#1a6b4a' },
  SENT: { bg: '#fff3cd', text: '#856404' },
  OVERDUE: { bg: '#fde8e8', text: '#b83232' },
  DRAFT: { bg: '#ede9de', text: '#6b6560' },
  PARTIALLY_PAID: { bg: '#dce8f8', text: '#1e4d8c' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')

  // Fetch data from API
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ limit: 10 })
  const { data: statsData, isLoading: statsLoading } = useInvoiceStats()
  const { data: customersData, isLoading: customersLoading } = useCustomers({ limit: 10 })
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments({ limit: 10 })

  const isLoading = invoicesLoading || statsLoading || customersLoading || paymentsLoading

  // Extract data from responses
  const invoices: Invoice[] = invoicesData?.invoices || []
  const customers = customersData?.customers || []
  const payments: Payment[] = paymentsData?.payments || []
  const stats = statsData

  // Calculate stats from API data
  const totalRevenue = stats?.total_paid || stats?.total_revenue || 0
  const totalInvoices = stats?.total_invoices || invoices.length
  const activeCustomers = customersData?.total || customers.filter(c => c.is_active).length
  const overdueAmount = stats?.total_outstanding || invoices
    .filter(i => i.status === 'OVERDUE')
    .reduce((sum, i) => sum + parseFloat(i.outstanding_amount || '0'), 0)

  // Recent invoices (sorted by date)
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  // Recent payments (sorted by date)
  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5)

  // Chart data from stats
  const chartData = stats?.revenue_by_month || [
    { month: 'Jun', revenue: 320000, count: 0 },
    { month: 'Jul', revenue: 415000, count: 0 },
    { month: 'Aug', revenue: 380000, count: 0 },
    { month: 'Sep', revenue: 510000, count: 0 },
    { month: 'Oct', revenue: 475000, count: 0 },
    { month: 'Nov', revenue: 620000, count: 0 },
  ]

  // Activity from recent invoices and payments
  const activities = [
    ...recentPayments.map(p => ({
      text: `Payment of ${formatCurrency(p.amount)} received${p.customer_name ? ` from ${p.customer_name}` : ''}`,
      time: new Date(p.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
      color: '#1a6b4a'
    })),
    ...recentInvoices.map(i => ({
      text: `Invoice ${i.invoice_number} ${i.status === 'PAID' ? 'paid' : 'sent'} to ${i.customer_name || 'customer'}`,
      time: new Date(i.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
      color: i.status === 'PAID' ? '#1a6b4a' : '#c8952a'
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5)

  const maxChartValue = Math.max(...chartData.map(d => d.revenue), 1)

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Dashboard</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading dashboard data...</p>
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
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            onClick={() => router.push('/invoices/new')}
            className="btn btn-gold"
          >
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fff3d4' }}>💰</div>
              <span className="stat-change up">↑ {stats?.paid_count || 0} paid</span>
            </div>
            <div className="stat-value">{formatCurrency(totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fde8e8' }}>📋</div>
              <span className="stat-change down">{stats?.overdue_count || 0} overdue</span>
            </div>
            <div className="stat-value">{formatCurrency(overdueAmount)}</div>
            <div className="stat-label">Overdue Amount</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#dce8f8' }}>🧾</div>
              <span className="stat-change up">{totalInvoices} total</span>
            </div>
            <div className="stat-value">{totalInvoices}</div>
            <div className="stat-label">Total Invoices</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#d4eddf' }}>👥</div>
              <span className="stat-change up">{customersData?.total || activeCustomers}</span>
            </div>
            <div className="stat-value">{customersData?.total || activeCustomers}</div>
            <div className="stat-label">Active Customers</div>
          </div>
        </div>

        {/* Revenue + Quick Actions */}
        <div className="grid-2">
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue Overview</span>
              <span className="text-dim">Last 6 months</span>
            </div>
            <div className="chart-area">
              {chartData.map((item, index) => (
                <div key={index} className="bar-wrap">
                  <div className="bar-val">₦{(item.revenue / 1000).toFixed(0)}K</div>
                  <div 
                    className="bar" 
                    style={{ height: `${(item.revenue / maxChartValue) * 140}px` }}
                  />
                  <div className="bar-label">{item.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
            </div>
            <div className="quick-actions">
              <button
                onClick={() => router.push('/invoices/new')}
                className="quick-btn"
              >
                <div className="quick-icon" style={{ background: '#fff3d4' }}>🧾</div>
                <div>
                  <div className="quick-text">Create Invoice</div>
                  <div className="quick-sub">Bill a customer</div>
                </div>
              </button>
              <button
                onClick={() => router.push('/customers')}
                className="quick-btn"
              >
                <div className="quick-icon" style={{ background: '#dce8f8' }}>👤</div>
                <div>
                  <div className="quick-text">Add Customer</div>
                  <div className="quick-sub">New client</div>
                </div>
              </button>
              <button
                onClick={() => router.push('/documents')}
                className="quick-btn"
              >
                <div className="quick-icon" style={{ background: '#d4eddf' }}>📥</div>
                <div>
                  <div className="quick-text">Upload Receipt</div>
                  <div className="quick-sub">AI extraction</div>
                </div>
              </button>
              <button
                onClick={() => router.push('/analytics')}
                className="quick-btn"
              >
                <div className="quick-icon" style={{ background: '#f3e8ff' }}>📊</div>
                <div>
                  <div className="quick-text">View Reports</div>
                  <div className="quick-sub">Analytics</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Invoices + Activity */}
        <div className="grid-2">
          {/* Recent Invoices */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Invoices</span>
              <button
                onClick={() => router.push('/invoices')}
                className="btn btn-outline btn-sm"
              >
                View all
              </button>
            </div>
            {recentInvoices.length > 0 ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="font-bold">{invoice.invoice_number}</td>
                      <td>{invoice.customer_name || '-'}</td>
                      <td className="font-bold">{formatCurrency(invoice.total_amount)}</td>
                      <td>
                        <span 
                          className={`badge badge-${invoice.status.toLowerCase()}`}
                          style={{ 
                            background: statusColors[invoice.status]?.bg || '#ede9de', 
                            color: statusColors[invoice.status]?.text || '#6b6560' 
                          }}
                        >
                          {invoice.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No invoices yet</p>
                <button 
                  onClick={() => router.push('/invoices/new')}
                  className="btn btn-gold btn-sm"
                >
                  Create First Invoice
                </button>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
            </div>
            {activities.length > 0 ? (
              <div className="activity-list">
                {activities.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-dot" style={{ background: activity.color }} />
                    <div>
                      <div className="activity-text">{activity.text}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
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

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
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

        .btn-gold:hover {
          background: #d4a030;
          transform: translateY(-1px);
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

        .content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
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
          transition: transform 0.15s, box-shadow 0.15s;
          cursor: default;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
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

        .stat-change {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 20px;
        }

        .stat-change.up {
          color: var(--green);
          background: var(--green-light);
        }

        .stat-change.down {
          color: var(--red);
          background: var(--red-light);
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

        .grid-2 {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
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
          transition: all 0.3s;
          cursor: pointer;
        }

        .bar:hover {
          opacity: 1;
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

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--paper);
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          width: 100%;
        }

        .quick-btn:hover {
          background: #fff;
          border-color: var(--gold);
          box-shadow: var(--shadow);
        }

        .quick-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }

        .quick-text {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink);
        }

        .quick-sub {
          font-size: 11px;
          color: var(--text-dim);
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

        .badge-paid, .badge-sent, .badge-draft, .badge-overdue, .badge-partially_paid {
          background: var(--green-light);
          color: var(--green);
        }

        .activity-list {
          padding: 0;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid #f0ede6;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }

        .activity-text {
          font-size: 13px;
          color: var(--text);
          line-height: 1.5;
        }

        .activity-time {
          font-size: 11px;
          color: var(--text-dim);
          margin-top: 2px;
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
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .grid-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .content {
            padding: 16px;
          }
          .topbar {
            padding: 0 16px;
            flex-wrap: wrap;
            height: auto;
            padding: 12px 16px;
            gap: 10px;
          }
          .topbar-title {
            font-size: 18px;
            width: 100%;
          }
          .topbar-actions {
            width: 100%;
            justify-content: space-between;
          }
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .stat-card {
            padding: 16px;
          }
          .stat-value {
            font-size: 24px;
          }
          .grid-2 {
            grid-template-columns: 1fr;
          }
          .card-header {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          .table {
            display: block;
            overflow-x: auto;
          }
          .table th, .table td {
            padding: 10px 12px;
            font-size: 12px;
          }
          .search-wrap {
            display: block;
          }
          .search-input {
            width: 100%;
          }
          .quick-actions {
            grid-template-columns: 1fr;
          }
          .chart-area {
            height: 150px;
            padding: 12px;
          }
          .bar-wrap {
            gap: 4px;
          }
          .bar-label, .bar-val {
            font-size: 9px;
          }
          .activity-item {
            padding: 12px;
          }
        }
      `}</style>
    </>
  )
}
