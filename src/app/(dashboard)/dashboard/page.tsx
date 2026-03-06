'use client'

import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { useDashboard } from '@/lib/hooks/useDashboard'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount || 0)

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short',
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID:           { bg: '#d4eddf', text: '#1a6b4a' },
  SENT:           { bg: '#fff3cd', text: '#856404' },
  OVERDUE:        { bg: '#fde8e8', text: '#b83232' },
  DRAFT:          { bg: '#ede9de', text: '#6b6560' },
  PARTIALLY_PAID: { bg: '#dce8f8', text: '#1e4d8c' },
  CANCELLED:      { bg: '#f0ede6', text: '#9e9990' },
}

const methodLabels: Record<string, string> = {
  CASH: 'Cash', BANK_TRANSFER: 'Bank', CARD: 'Card',
  POS: 'POS', MOBILE_MONEY: 'Mobile', CHEQUE: 'Cheque', OTHER: 'Other',
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: stats, isLoading, isError } = useDashboard()

  const chartData    = stats?.revenue_by_month ?? []
  const maxChartVal  = Math.max(...chartData.map(d => d.revenue), 1)

  if (isLoading) return (
    <>
      <div className="topbar"><div className="topbar-title">Dashboard</div></div>
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading dashboard...</p>
      </div>
      <style jsx>{`.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
    </>
  )

  if (isError) return (
    <>
      <div className="topbar"><div className="topbar-title">Dashboard</div></div>
      <div style={{ padding: 40, textAlign: 'center', color: '#b83232' }}>
        Failed to load dashboard. Check your connection and try again.
      </div>
    </>
  )

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div className="topbar-title">Dashboard</div>
        <div className="topbar-actions">
          <button onClick={() => router.push('/invoices/new')} className="btn btn-gold">
            <Plus size={16} /> New Invoice
          </button>
        </div>
      </div>

      <div className="content">

        {/* ── Stats Grid ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fff3d4' }}>💰</div>
              <span className="stat-change up">↑ {stats?.paid_count} paid</span>
            </div>
            <div className="stat-value">{formatCurrency(stats?.total_collected ?? 0)}</div>
            <div className="stat-label">Total Collected</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fde8e8' }}>⚠️</div>
              <span className="stat-change down">{stats?.overdue_count} invoices</span>
            </div>
            <div className="stat-value">{formatCurrency(stats?.overdue_amount ?? 0)}</div>
            <div className="stat-label">Overdue Amount</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#dce8f8' }}>🧾</div>
              <span className="stat-change up">{stats?.total_invoices} total</span>
            </div>
            <div className="stat-value">{stats?.sent_count ?? 0}</div>
            <div className="stat-label">Unpaid Invoices</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#d4eddf' }}>👥</div>
              <span className="stat-change up">active</span>
            </div>
            <div className="stat-value">{stats?.active_customers ?? 0}</div>
            <div className="stat-label">Customers</div>
          </div>
        </div>

        {/* ── Revenue Chart + Quick Actions ── */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue Collected</span>
              <span className="text-dim">Last 6 months</span>
            </div>
            <div className="chart-area">
              {chartData.length > 0 ? chartData.map((item, i) => (
                <div key={i} className="bar-wrap">
                  <div className="bar-val">
                    {item.revenue > 0 ? `₦${(item.revenue / 1000).toFixed(0)}K` : '—'}
                  </div>
                  <div
                    className="bar"
                    style={{ height: `${Math.max((item.revenue / maxChartVal) * 140, item.revenue > 0 ? 4 : 2)}px`,
                             opacity: item.revenue > 0 ? 0.9 : 0.2 }}
                    title={`${item.month}: ${formatCurrency(item.revenue)}`}
                  />
                  <div className="bar-label">{item.month}</div>
                </div>
              )) : (
                <div className="chart-empty">No payment data yet</div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Actions</span>
            </div>
            <div className="quick-actions">
              {[
                { icon: '🧾', bg: '#fff3d4', label: 'Create Invoice', sub: 'Bill a customer', href: '/invoices/new' },
                { icon: '👤', bg: '#dce8f8', label: 'Add Customer',   sub: 'New client',     href: '/customers'    },
                { icon: '📥', bg: '#d4eddf', label: 'Upload Receipt', sub: 'AI extraction',  href: '/documents'    },
                { icon: '📊', bg: '#f3e8ff', label: 'View Reports',   sub: 'Analytics',      href: '/analytics'    },
              ].map(a => (
                <button key={a.href} onClick={() => router.push(a.href)} className="quick-btn">
                  <div className="quick-icon" style={{ background: a.bg }}>{a.icon}</div>
                  <div>
                    <div className="quick-text">{a.label}</div>
                    <div className="quick-sub">{a.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Invoice Summary bar ── */}
        <div className="status-bar-card">
          {[
            { label: 'Draft',    count: stats?.draft_count ?? 0,    color: '#9e9990' },
            { label: 'Sent',     count: stats?.sent_count ?? 0,     color: '#856404' },
            { label: 'Partial',  count: stats?.partially_paid_count ?? 0, color: '#1e4d8c' },
            { label: 'Overdue',  count: stats?.overdue_count ?? 0,  color: '#b83232' },
            { label: 'Paid',     count: stats?.paid_count ?? 0,     color: '#1a6b4a' },
          ].map(s => (
            <div key={s.label} className="status-pill">
              <span className="status-dot" style={{ background: s.color }} />
              <span className="status-count" style={{ color: s.color }}>{s.count}</span>
              <span className="status-label">{s.label}</span>
            </div>
          ))}
          <div className="status-total">
            {formatCurrency(stats?.total_outstanding ?? 0)} outstanding
          </div>
        </div>

        {/* ── Recent Invoices + Activity ── */}
        <div className="grid-2">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Recent Invoices</span>
              <button onClick={() => router.push('/invoices')} className="btn btn-outline btn-sm">
                View all
              </button>
            </div>
            {(stats?.recent_invoices?.length ?? 0) > 0 ? (
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
                  {stats?.recent_invoices.map(inv => (
                    <tr key={inv.id} style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/invoices/${inv.id}`)}>
                      <td className="font-bold">{inv.invoice_number}</td>
                      <td>{inv.customer_name}</td>
                      <td className="font-bold">{formatCurrency(inv.total_amount)}</td>
                      <td>
                        <span className="badge" style={{
                          background: statusColors[inv.status]?.bg ?? '#ede9de',
                          color:      statusColors[inv.status]?.text ?? '#6b6560',
                        }}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <p>No invoices yet</p>
                <button onClick={() => router.push('/invoices/new')} className="btn btn-gold btn-sm">
                  Create First Invoice
                </button>
              </div>
            )}
          </div>

          {/* Activity Feed — chronologically merged timeline */}
          <div className="card">
            <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span className="card-title">Recent Activity</span>
              <button className="btn btn-sm btn-outline" onClick={() => router.push('/invoices')}>View All</button>
            </div>
            {(() => {
              // Merge payments + invoices into single timeline sorted by date desc
              type ActivityItem =
                | { kind: 'payment'; id: string; date: string; amount: number; customer: string; method: string; receipt: string | null }
                | { kind: 'invoice'; id: string; date: string; number: string; customer: string; status: string; amount: number }

              const items: ActivityItem[] = [
                ...(stats?.recent_payments ?? []).map(p => ({
                  kind: 'payment' as const,
                  id: p.id, date: p.created_at ?? p.payment_date ?? '',
                  amount: p.amount, customer: p.customer_name,
                  method: p.payment_method, receipt: p.receipt_number,
                })),
                ...(stats?.recent_invoices ?? []).map(inv => ({
                  kind: 'invoice' as const,
                  id: inv.id, date: inv.issue_date ?? '',
                  number: inv.invoice_number, customer: inv.customer_name,
                  status: inv.status, amount: inv.total_amount,
                })),
              ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

              if (!items.length) return <div className="empty-state"><p>No recent activity</p></div>

              return (
                <div className="activity-list">
                  {items.map(item => {
                    if (item.kind === 'payment') {
                      return (
                        <div key={`pay-${item.id}`} className="activity-item">
                          <div style={{ width:32, height:32, borderRadius:'50%', background:'#d4eddf', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>💳</div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div className="activity-text">
                              Payment received · <strong>{formatCurrency(item.amount)}</strong>
                            </div>
                            <div className="activity-time">{item.customer} · {methodLabels[item.method] ?? item.method} · {formatDate(item.date)}</div>
                          </div>
                          <div style={{ fontSize:13, fontWeight:600, color:'#1a6b4a', flexShrink:0 }}>+{formatCurrency(item.amount)}</div>
                        </div>
                      )
                    }
                    const statusKey = item.status?.toLowerCase()
                    const sColor = statusColors[statusKey] ?? { bg:'#ede9de', text:'#6b6560' }
                    const emoji = item.status === 'PAID' ? '✅' : item.status === 'OVERDUE' ? '⚠️' : item.status === 'DRAFT' ? '📝' : '📄'
                    return (
                      <div key={`inv-${item.id}`} className="activity-item"
                        style={{ cursor:'pointer' }}
                        onClick={() => router.push(`/invoices/${item.id}`)}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background: sColor.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:14 }}>{emoji}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div className="activity-text">
                            Invoice <strong>{item.number}</strong> · {item.customer}
                          </div>
                          <div className="activity-time">{formatDate(item.date)}</div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3, flexShrink:0 }}>
                          <span style={{ fontSize:12, fontWeight:500, padding:'2px 8px', borderRadius:20, background: sColor.bg, color: sColor.text }}>{item.status.replace('_',' ')}</span>
                          <span style={{ fontSize:12, color:'#9e9990' }}>{formatCurrency(item.amount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .topbar-actions{display:flex;align-items:center;gap:10px}
        .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;border:none;transition:all 0.15s}
        .btn-gold{background:var(--gold);color:var(--ink)}
        .btn-gold:hover{background:#d4a030;transform:translateY(-1px)}
        .btn-outline{background:transparent;border:1px solid var(--border);color:var(--text)}
        .btn-outline:hover{background:var(--cream)}
        .btn-sm{padding:6px 12px;font-size:12px}
        .content{flex:1;overflow-y:auto;padding:28px}

        /* Stats */
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
        .stat-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:var(--shadow);transition:transform 0.15s,box-shadow 0.15s}
        .stat-card:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg)}
        .stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
        .stat-change{font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px}
        .stat-change.up{color:var(--green);background:var(--green-light)}
        .stat-change.down{color:var(--red);background:var(--red-light)}
        .stat-value{font-family:'Fraunces',serif;font-size:28px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:4px}
        .stat-label{font-size:12px;color:var(--text-dim)}

        /* Status summary bar */
        .status-bar-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:16px 20px;margin-bottom:24px;display:flex;align-items:center;gap:24px;box-shadow:var(--shadow);flex-wrap:wrap}
        .status-pill{display:flex;align-items:center;gap:6px}
        .status-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
        .status-count{font-size:16px;font-weight:700;font-family:'Fraunces',serif}
        .status-label{font-size:12px;color:var(--text-dim)}
        .status-total{margin-left:auto;font-size:13px;font-weight:600;color:var(--ink)}

        /* Layout */
        .grid-2{display:grid;grid-template-columns:1.5fr 1fr;gap:16px;margin-bottom:24px}
        .card{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
        .card-header{padding:18px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .card-title{font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:var(--ink)}
        .text-dim{color:var(--text-dim);font-size:12px}

        /* Chart */
        .chart-area{padding:20px;height:200px;display:flex;align-items:flex-end;gap:8px}
        .chart-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:13px}
        .bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
        .bar{width:100%;border-radius:6px 6px 0 0;background:var(--gold);min-height:2px;transition:all 0.3s;cursor:pointer}
        .bar:hover{opacity:1!important;transform:scaleY(1.02);transform-origin:bottom}
        .bar-label{font-size:10px;color:var(--text-dim)}
        .bar-val{font-size:10px;color:var(--text-dim);font-weight:500;white-space:nowrap}

        /* Quick actions */
        .quick-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:16px}
        .quick-btn{display:flex;align-items:center;gap:10px;padding:14px;border-radius:10px;border:1px solid var(--border);background:var(--paper);cursor:pointer;transition:all 0.15s;text-align:left;width:100%}
        .quick-btn:hover{background:#fff;border-color:var(--gold);box-shadow:var(--shadow)}
        .quick-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
        .quick-text{font-size:12.5px;font-weight:500;color:var(--ink)}
        .quick-sub{font-size:11px;color:var(--text-dim)}

        /* Table */
        .table{width:100%;border-collapse:collapse}
        .table th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-dim);padding:10px 20px;background:var(--cream);font-weight:500;border-bottom:1px solid var(--border)}
        .table td{padding:12px 20px;border-bottom:1px solid #f0ede6;font-size:13px}
        .table tr:last-child td{border-bottom:none}
        .table tr:hover td{background:var(--gold-pale)}
        .font-bold{font-weight:600}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:500}

        /* Activity */
        .activity-list{overflow-y:auto;max-height:320px}
        .activity-item{display:flex;align-items:flex-start;gap:12px;padding:14px 20px;border-bottom:1px solid #f0ede6;transition:background 0.1s}
        .activity-item:last-child{border-bottom:none}
        .activity-item:hover{background:var(--gold-pale)}
        .activity-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:5px}
        .activity-text{font-size:13px;color:var(--text);line-height:1.5}
        .activity-sub{color:var(--text-dim)}
        .activity-time{font-size:11px;color:var(--text-dim);margin-top:2px}

        /* Empty */
        .empty-state{padding:40px 20px;text-align:center;color:var(--text-dim)}
        .empty-state p{margin-bottom:12px}

        @media(max-width:1024px){
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .grid-2{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .content{padding:16px}
          .stats-grid{grid-template-columns:1fr;gap:12px}
          .stat-value{font-size:24px}
          .status-bar-card{gap:14px}
          .status-total{margin-left:0;width:100%}
          .chart-area{height:150px;padding:12px}
          .table{display:block;overflow-x:auto}
          .quick-actions{grid-template-columns:1fr}
        }
      `}</style>
    </>
  )
}