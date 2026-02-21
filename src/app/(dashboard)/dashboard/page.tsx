'use client'

import { useState } from 'react'
import { Plus, FileText, Users, DollarSign, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

const statsData = [
  { label: 'Total Revenue', value: '₦2.4M', change: '+12%', changeType: 'up', icon: DollarSign, iconBg: '#fff3d4' },
  { label: 'Overdue Amount', value: '₦485K', change: '+3', changeType: 'up', icon: Clock, iconBg: '#fde8e8' },
  { label: 'Total Invoices', value: '47', change: '+8%', changeType: 'up', icon: FileText, iconBg: '#dce8f8' },
  { label: 'Active Customers', value: '24', change: '+5', changeType: 'up', icon: Users, iconBg: '#d4eddf' },
]

const chartData = [
  { month: 'Jun', value: 320000 },
  { month: 'Jul', value: 415000 },
  { month: 'Aug', value: 380000 },
  { month: 'Sep', value: 510000 },
  { month: 'Oct', value: 475000 },
  { month: 'Nov', value: 620000 },
]

const recentInvoices = [
  { id: 'INV-047', customer: 'Dangote Foods Ltd', amount: 185000, status: 'Paid' },
  { id: 'INV-046', customer: 'Zenith Traders', amount: 92500, status: 'Pending' },
  { id: 'INV-045', customer: 'Lagos Grocers', amount: 340000, status: 'Overdue' },
  { id: 'INV-044', customer: 'Abuja Mart', amount: 67200, status: 'Partial' },
]

const activityData = [
  { text: 'Payment received from Dangote Foods Ltd — ₦185,000', time: '2 hours ago', color: '#1a6b4a' },
  { text: 'Invoice #INV-046 sent to Zenith Traders', time: '5 hours ago', color: '#c8952a' },
  { text: 'Invoice #INV-045 is 7 days overdue', time: '1 day ago', color: '#b83232' },
  { text: 'Document uploaded: Receipt_Nov24.pdf — AI extracted ₦45,200', time: '2 days ago', color: '#1e4d8c' },
  { text: 'New customer Kano Distributors added', time: '3 days ago', color: '#1a6b4a' },
]

const quickActions = [
  { label: 'Create Invoice', sub: 'Bill a customer', icon: '🧾', bg: '#fff3d4', href: '/invoices/new' },
  { label: 'Add Customer', sub: 'New client', icon: '👤', bg: '#dce8f8', href: '/customers/new' },
  { label: 'Upload Receipt', sub: 'AI extraction', icon: '📥', bg: '#d4eddf', href: '/documents' },
  { label: 'View Reports', sub: 'Analytics', icon: '📊', bg: '#f3e8ff', href: '/analytics' },
]

const statusColors: Record<string, { bg: string; text: string }> = {
  Paid: { bg: '#d4eddf', text: '#1a6b4a' },
  Pending: { bg: '#fff3cd', text: '#856404' },
  Overdue: { bg: '#fde8e8', text: '#b83232' },
  Partial: { bg: '#dce8f8', text: '#1e4d8c' },
  Draft: { bg: '#ede9de', text: '#6b6560' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const maxChartValue = Math.max(...chartData.map(d => d.value))

  return (
    <>
      {/* Topbar */}
      <div className="dashboard-topbar">
        <h1 className="dashboard-title">Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="search-wrapper">
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9e9990' }}>🔍</span>
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
            className="new-invoice-btn"
          >
            <Plus size={16} /> <span className="btn-label">New Invoice</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">

        {/* Stats Grid */}
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: stat.iconBg }}>
                  <stat.icon size={18} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '20px', color: stat.changeType === 'up' ? '#1a6b4a' : '#b83232', background: stat.changeType === 'up' ? '#d4eddf' : '#fde8e8' }}>
                  {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
                </span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div style={{ fontSize: '12px', color: '#9e9990' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue + Quick Actions */}
        <div className="grid-2-cols" style={{ marginBottom: '24px' }}>
          {/* Revenue Chart */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue Overview</span>
              <span style={{ fontSize: '12px', color: '#9e9990' }}>Last 6 months</span>
            </div>
            <div style={{ padding: '20px', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              {chartData.map((item, index) => (
                <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  <div style={{ fontSize: '10px', color: '#9e9990', fontWeight: 500 }}>₦{(item.value / 1000).toFixed(0)}K</div>
                  <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: '#c8952a', opacity: 0.85, minHeight: '4px', height: `${(item.value / maxChartValue) * 140}px` }} />
                  <div style={{ fontSize: '10px', color: '#9e9990' }}>{item.month}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
            </div>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => router.push(action.href)}
                  className="quick-action-btn"
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0, background: action.bg }}>{action.icon}</div>
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 500, color: '#0f0e0b' }}>{action.label}</div>
                    <div style={{ fontSize: '11px', color: '#9e9990' }}>{action.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Invoices + Activity */}
        <div className="grid-2-cols">
          {/* Recent Invoices */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Invoices</span>
              <button
                onClick={() => router.push('/invoices')}
                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', border: '1px solid #ddd9cf', background: 'transparent', color: '#2c2a24' }}
              >
                View all
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="invoices-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th className="table-th">Invoice</th>
                    <th className="table-th hide-mobile">Customer</th>
                    <th className="table-th">Amount</th>
                    <th className="table-th">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0ede6' }}>
                      <td className="table-td" style={{ fontWeight: 600, color: '#0f0e0b' }}>{invoice.id}</td>
                      <td className="table-td hide-mobile" style={{ color: '#2c2a24' }}>{invoice.customer}</td>
                      <td className="table-td" style={{ fontWeight: 600, color: '#0f0e0b' }}>₦{invoice.amount.toLocaleString()}</td>
                      <td className="table-td">
                        <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500, background: statusColors[invoice.status].bg, color: statusColors[invoice.status].text }}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Activity</span>
            </div>
            <div>
              {activityData.map((activity, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 20px', borderBottom: index < activityData.length - 1 ? '1px solid #f0ede6' : 'none' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, marginTop: '5px', background: activity.color }} />
                  <div>
                    <div style={{ fontSize: '13px', color: '#2c2a24', lineHeight: 1.5 }}>{activity.text}</div>
                    <div style={{ fontSize: '11px', color: '#9e9990', marginTop: '2px' }}>{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* Base layout */
        .dashboard-topbar {
          height: 60px;
          background: #faf9f6;
          border-bottom: 1px solid #ddd9cf;
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 16px;
          flex-shrink: 0;
        }

        .dashboard-title {
          font-family: Fraunces, serif;
          font-size: 20px;
          font-weight: 600;
          color: #0f0e0b;
          flex: 1;
          margin: 0;
        }

        .search-wrapper {
          position: relative;
        }

        .search-input {
          padding: 9px 14px 9px 38px;
          border: 1px solid #ddd9cf;
          border-radius: 8px;
          font-family: DM Sans, sans-serif;
          font-size: 13px;
          color: #2c2a24;
          background: #f4f2eb;
          outline: none;
          width: 220px;
          transition: all 0.15s;
        }

        .new-invoice-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          font-family: DM Sans, sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: #c8952a;
          color: #0f0e0b;
          white-space: nowrap;
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

        /* Stats grid — 4 cols on desktop */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #ddd9cf;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 1px 3px rgba(15,14,11,0.08);
        }

        .stat-value {
          font-family: Fraunces, serif;
          font-size: 28px;
          font-weight: 700;
          color: #0f0e0b;
          line-height: 1;
          margin-bottom: 4px;
        }

        /* 2-col grid */
        .grid-2-cols {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        /* Card */
        .card {
          background: #fff;
          border: 1px solid #ddd9cf;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15,14,11,0.08);
          overflow: hidden;
        }

        .card-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid #ddd9cf;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-title {
          font-family: Fraunces, serif;
          font-size: 15px;
          font-weight: 600;
          color: #0f0e0b;
        }

        /* Quick actions */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          padding: 16px;
        }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border-radius: 10px;
          border: 1px solid #ddd9cf;
          background: #faf9f6;
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
          width: 100%;
        }

        .quick-action-btn:hover {
          background: #f0ede6;
        }

        /* Table */
        .table-th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9e9990;
          padding: 10px 20px;
          background: #f4f2eb;
          font-weight: 500;
          border-bottom: 1px solid #ddd9cf;
        }

        .table-td {
          padding: 13px 20px;
          font-size: 13.5px;
        }

        /* ─── Tablet ─── */
        @media (max-width: 1024px) {
          .dashboard-content {
            padding: 20px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ─── Mobile ─── */
        @media (max-width: 768px) {
          .dashboard-topbar {
            padding: 0 16px;
            height: 56px;
          }

          .dashboard-title {
            font-size: 17px;
          }

          .search-wrapper {
            display: none;
          }

          .dashboard-content {
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-value {
            font-size: 22px;
          }

          .stat-card {
            padding: 16px;
          }

          /* Stack 2-col grids */
          .grid-2-cols {
            grid-template-columns: 1fr;
            margin-bottom: 16px;
          }

          /* Hide customer column on small screens */
          .hide-mobile {
            display: none;
          }

          .table-th, .table-td {
            padding: 10px 14px;
            font-size: 12.5px;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .new-invoice-btn {
            padding: 8px 12px;
          }
        }

        /* ─── Small mobile ─── */
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .btn-label {
            display: none;
          }

          .new-invoice-btn {
            padding: 8px 10px;
          }
        }
      `}</style>
    </>
  )
}