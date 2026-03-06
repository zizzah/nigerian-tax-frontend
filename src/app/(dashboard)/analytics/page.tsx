'use client'

import { Loader2 } from 'lucide-react'
import { useDashboard } from '@/lib/hooks/useDashboard'
import { useCustomers } from '@/lib/hooks/useCustomers'

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency', currency: 'NGN',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount || 0)

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useDashboard()
  const { data: customersData } = useCustomers({ limit: 100 })

  // Top 3 customers by total invoiced amount
  const topCustomers = [...(customersData?.customers ?? [])]
    .sort((a, b) => parseFloat(b.total_invoiced_amount ?? '0') - parseFloat(a.total_invoiced_amount ?? '0'))
    .slice(0, 3)
    .map((c, i) => ({
      name:     c.name,
      amount:   parseFloat(c.total_invoiced_amount ?? '0'),
      invoices: c.total_invoices_count ?? 0,
      rank:     ['1st', '2nd', '3rd'][i],
      color:    ['#fde8c8', '#e8e6e0', '#e8d5c0'][i],
    }))

  // Amounts from dashboard stats
  const totalCollected  = stats?.total_collected  ?? 0
  const totalOutstanding = stats?.total_outstanding ?? 0
  const totalInvoiced   = stats?.total_invoiced    ?? 0
  const paidCount       = stats?.paid_count        ?? 0
  const sentCount       = stats?.sent_count        ?? 0
  const overdueCount    = stats?.overdue_count     ?? 0
  const overdueAmount   = stats?.overdue_amount    ?? 0

  // Derive pending amount (sent invoices outstanding)
  const pendingAmount = totalOutstanding - overdueAmount

  // Tax estimates derived from collected revenue
  const vatCollected = totalCollected * 0.075
  const whtDeducted  = totalCollected * 0.05

  // Collection rate: paid invoices / non-cancelled invoices
  const nonCancelled = (stats?.total_invoices ?? 0) - (stats?.cancelled_count ?? 0)
  const collectionRate = nonCancelled > 0 ? Math.round((paidCount / nonCancelled) * 100) : 0

  // Chart data
  const revenueByMonth = stats?.revenue_by_month ?? []
  const maxRevenue = Math.max(...revenueByMonth.map(m => m.revenue), 1)

  // Donut chart — proportions of paid / pending / overdue
  const donutTotal = (totalCollected + pendingAmount + overdueAmount) || 1
  const CIRCUMFERENCE = 345
  const paidDash    = (totalCollected  / donutTotal) * CIRCUMFERENCE
  const pendingDash = (pendingAmount   / donutTotal) * CIRCUMFERENCE
  const overdueDash = (overdueAmount   / donutTotal) * CIRCUMFERENCE

  if (isLoading) return (
    <>
      <div className="topbar"><div className="topbar-title">Analytics</div></div>
      <div className="loading-container">
        <Loader2 className="animate-spin" size={32} />
        <p>Loading analytics...</p>
      </div>
      <style jsx>{`.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
    </>
  )

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Analytics</div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Analytics & Reports</div>
          <div className="page-sub">Financial overview based on recorded payments</div>
        </div>

        {/* ── Stats ── */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fff3d4' }}>📈</div>
            </div>
            <div className="stat-value">{formatCurrency(totalCollected)}</div>
            <div className="stat-label">Total Collected</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#d4eddf' }}>💸</div>
            </div>
            <div className="stat-value">{formatCurrency(vatCollected)}</div>
            <div className="stat-label">Est. VAT Collected (7.5%)</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#fde8e8' }}>🏛️</div>
            </div>
            <div className="stat-value">{formatCurrency(whtDeducted)}</div>
            <div className="stat-label">Est. WHT Deducted (5%)</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon" style={{ background: '#dce8f8' }}>📊</div>
              <span className="stat-change up">{collectionRate}%</span>
            </div>
            <div className="stat-value">{paidCount}/{nonCancelled}</div>
            <div className="stat-label">Collection Rate</div>
          </div>
        </div>

        <div className="analytics-grid">

          {/* ── Revenue Chart ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Revenue Collected by Month</span>
            </div>
            <div className="chart-area">
              {revenueByMonth.length > 0 ? revenueByMonth.map((item, i) => (
                <div key={i} className="bar-wrap">
                  <div className="bar-val">
                    {item.revenue > 0 ? `₦${(item.revenue / 1000).toFixed(0)}K` : '—'}
                  </div>
                  <div className="bar" style={{
                    height: `${Math.max((item.revenue / maxRevenue) * 140, item.revenue > 0 ? 4 : 2)}px`,
                    opacity: item.revenue > 0 ? 0.9 : 0.2,
                  }} />
                  <div className="bar-label">{item.month}</div>
                </div>
              )) : (
                <div className="chart-empty">No payment data yet</div>
              )}
            </div>
          </div>

          {/* ── Invoice Status Donut ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Invoice Status</span>
            </div>
            <div className="donut-wrap">
              <div style={{ position: 'relative', width: 140, height: 140 }}>
                <svg width="140" height="140" viewBox="0 0 140 140">
                  {/* Track */}
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#f0ede6" strokeWidth="22" />
                  {/* Paid */}
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#1a6b4a" strokeWidth="22"
                    strokeDasharray={`${paidDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset="86"
                    transform="rotate(-90 70 70)" />
                  {/* Pending */}
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#c8952a" strokeWidth="22"
                    strokeDasharray={`${pendingDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`${86 - paidDash}`}
                    transform="rotate(-90 70 70)" />
                  {/* Overdue */}
                  <circle cx="70" cy="70" r="55" fill="none" stroke="#b83232" strokeWidth="22"
                    strokeDasharray={`${overdueDash} ${CIRCUMFERENCE}`}
                    strokeDashoffset={`${86 - paidDash - pendingDash}`}
                    transform="rotate(-90 70 70)" />
                </svg>
                <div style={{ position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Fraunces,serif', fontSize: 18, fontWeight: 700, color: '#0f0e0b' }}>
                    {collectionRate}%
                  </div>
                  <div style={{ fontSize: 10, color: '#9e9990' }}>collected</div>
                </div>
              </div>
            </div>
            <div className="legend-list">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: '#1a6b4a' }} />
                <span className="legend-label">Paid</span>
                <span className="legend-val">{paidCount} — {formatCurrency(totalCollected)}</span>
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

          {/* ── Top Customers ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Top Customers</span>
            </div>
            <div className="customer-list">
              {topCustomers.length > 0 ? topCustomers.map((c, i) => (
                <div key={i} className="customer-row">
                  <div className="cust-avatar" style={{ background: c.color }}>{c.rank}</div>
                  <div>
                    <div className="cust-name">{c.name}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                      {formatCurrency(c.amount)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)' }}>
                      {c.invoices} invoice{c.invoices !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="empty-state"><p>No customer data yet</p></div>
              )}
            </div>
          </div>

          {/* ── Tax Summary ── */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tax Summary</span>
            </div>
            <div style={{ padding: 20 }}>
              <div className="summary-box">
                <div className="summary-row">
                  <span>Total Invoiced</span>
                  <span className="font-bold">{formatCurrency(totalInvoiced)}</span>
                </div>
                <div className="summary-row">
                  <span>Total Collected</span>
                  <span className="font-bold">{formatCurrency(totalCollected)}</span>
                </div>
                <div className="summary-row">
                  <span>Est. VAT (7.5%)</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{formatCurrency(vatCollected)}</span>
                </div>
                <div className="summary-row">
                  <span>Est. WHT (5%)</span>
                  <span style={{ color: '#b83232', fontWeight: 600 }}>{formatCurrency(whtDeducted)}</span>
                </div>
                <div className="summary-row total">
                  <span>Outstanding</span>
                  <span>{formatCurrency(totalOutstanding)}</span>
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 12, lineHeight: 1.5 }}>
                * VAT and WHT are estimates based on collected revenue. Consult your accountant for exact FIRS filings.
              </p>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .topbar{height:60px;background:var(--paper);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 28px;gap:16px;flex-shrink:0}
        .topbar-title{font-family:'Fraunces',serif;font-size:20px;font-weight:600;color:var(--ink);flex:1}
        .content{flex:1;overflow-y:auto;padding:28px}
        .page-header{margin-bottom:24px}
        .page-title{font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:var(--ink)}
        .page-sub{font-size:13px;color:var(--text-dim);margin-top:4px}

        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
        .stat-card{background:#fff;border:1px solid var(--border);border-radius:12px;padding:20px;box-shadow:var(--shadow)}
        .stat-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
        .stat-icon{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
        .stat-change.up{color:var(--green);background:var(--green-light);font-size:11px;font-weight:500;padding:2px 8px;border-radius:20px}
        .stat-value{font-family:'Fraunces',serif;font-size:26px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:4px}
        .stat-label{font-size:12px;color:var(--text-dim)}

        .analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .card{background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:var(--shadow);overflow:hidden}
        .card-header{padding:18px 20px 14px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
        .card-title{font-family:'Fraunces',serif;font-size:15px;font-weight:600;color:var(--ink)}

        .chart-area{padding:20px;height:180px;display:flex;align-items:flex-end;gap:8px}
        .chart-empty{flex:1;display:flex;align-items:center;justify-content:center;color:var(--text-dim);font-size:13px}
        .bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
        .bar{width:100%;border-radius:6px 6px 0 0;background:var(--gold);min-height:2px;transition:all 0.3s}
        .bar-label{font-size:10px;color:var(--text-dim)}
        .bar-val{font-size:10px;color:var(--text-dim);font-weight:500}

        .donut-wrap{display:flex;align-items:center;justify-content:center;padding:24px}
        .legend-list{padding:0 20px 16px}
        .legend-item{display:flex;align-items:center;gap:10px;padding:6px 0;font-size:13px}
        .legend-dot{width:10px;height:10px;border-radius:3px;flex-shrink:0}
        .legend-label{flex:1;color:var(--text-dim)}
        .legend-val{font-weight:600;color:var(--ink)}

        .customer-list{padding:4px 0}
        .customer-row{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid #f0ede6}
        .customer-row:last-child{border-bottom:none}
        .cust-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0}
        .cust-name{font-size:13.5px;font-weight:500;color:var(--ink)}

        .summary-box{background:var(--cream);border:1px solid var(--border);border-radius:10px;padding:18px}
        .summary-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;font-size:13.5px;color:var(--text-mid)}
        .summary-row.total{border-top:2px solid var(--ink);margin-top:10px;padding-top:14px;font-family:'Fraunces',serif;font-size:18px;font-weight:700;color:var(--ink)}
        .font-bold{font-weight:600}
        .empty-state{padding:40px 20px;text-align:center;color:var(--text-dim)}

        @media(max-width:1024px){
          .stats-grid{grid-template-columns:repeat(2,1fr)}
          .analytics-grid{grid-template-columns:1fr}
        }
        @media(max-width:768px){
          .content{padding:16px}
          .stats-grid{grid-template-columns:1fr}
        }
      `}</style>
    </>
  )
}