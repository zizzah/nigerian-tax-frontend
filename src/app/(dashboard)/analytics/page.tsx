'use client'

import { useInvoiceStats } from '@/lib/hooks/useInvoices'
import { useCustomerStats } from '@/lib/hooks/useCustomers'
import { Loader2 } from 'lucide-react'
import{Customer} from '@/lib/types'

interface TopCustomer {
  customer_name: string
  total_invoiced: number
  invoice_count: number
}

export default function AnalyticsPage() {
  const { data: invoiceStats, isLoading: invoiceLoading } = useInvoiceStats()
  const { data: customerStats, isLoading: customerLoading } = useCustomerStats()

  const isLoading = invoiceLoading || customerLoading

  const chartData = [
    { month: 'Jun', value: 320000 },
    { month: 'Jul', value: 415000 },
    { month: 'Aug', value: 380000 },
    { month: 'Sep', value: 510000 },
    { month: 'Oct', value: 475000 },
    { month: 'Nov', value: 620000 },
  ]

  const maxValue = Math.max(...chartData.map(d => d.value))

  // Calculate invoice status breakdown
  const paidCount = invoiceStats?.paid_count || 41
  const sentCount = invoiceStats?.sent_count || 3
  const overdueCount = invoiceStats?.overdue_count || 3
  const total = paidCount + sentCount + overdueCount || 1
  const collectionRate = Math.round((paidCount / total) * 100)

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
          Analytics & Reports
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fff3d4' }}>📈</div>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#1a6b4a', background: '#d4eddf', padding: '2px 8px', borderRadius: '20px' }}>↑ 18%</span>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{(invoiceStats?.total_revenue || 2400000).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>YTD Revenue</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#d4eddf' }}>💸</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{Math.round((invoiceStats?.total_revenue || 2400000) * 0.075).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>VAT Collected</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fde8e8' }}>🏛️</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{Math.round((invoiceStats?.total_revenue || 2400000) * 0.05).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>WHT Deducted</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#dce8f8' }}>📊</div>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#1a6b4a', background: '#d4eddf', padding: '2px 8px', borderRadius: '20px' }}>{collectionRate}%</span>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {paidCount}/{invoiceStats?.total_invoices || 47}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Collection Rate</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Revenue Chart */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>Revenue by Month</span>
              <span style={{ fontSize: '12px', color: '#9e9990' }}>Last 6 months</span>
            </div>
            <div style={{ padding: '20px', height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              {chartData.map((d) => {
                const height = Math.round((d.value / maxValue) * 140)
                return (
                  <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ fontSize: '10px', color: '#6b6560', fontWeight: 500 }}>₦{(d.value / 1000).toFixed(0)}K</div>
                    <div style={{ width: '100%', borderRadius: '6px 6px 0 0', background: '#c8952a', opacity: 0.85, minHeight: '4px', height: `${height}px`, cursor: 'pointer', transition: 'all 0.3s' }} />
                    <div style={{ fontSize: '10px', color: '#9e9990' }}>{d.month}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Invoice Status Donut */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>Invoice Status</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="55" fill="none" stroke="#f0ede6" strokeWidth="22"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#1a6b4a" strokeWidth="22"
                  strokeDasharray={`${(paidCount / total) * 187} 345`} strokeDashoffset="30" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#c8952a" strokeWidth="22"
                  strokeDasharray={`${(sentCount / total) * 187} 345`} strokeDashoffset={`${30 - (paidCount / total) * 187}`} transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="55" fill="none" stroke="#b83232" strokeWidth="22"
                  strokeDasharray={`${(overdueCount / total) * 187} 345`} strokeDashoffset={`${30 - ((paidCount + sentCount) / total) * 187}`} transform="rotate(-90 70 70)"/>
                <text x="70" y="66" textAnchor="middle" fontFamily="Fraunces, serif" fontSize="18" fontWeight="700" fill="#0f0e0b">{collectionRate}%</text>
                <text x="70" y="80" textAnchor="middle" fontFamily="DM Sans, sans-serif" fontSize="10" fill="#9e9990">collected</text>
              </svg>
            </div>
            <div style={{ padding: '0 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#1a6b4a', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px', color: '#6b6560' }}>Paid</span>
                <span style={{ fontWeight: 600, color: '#0f0e0b' }}>{paidCount} — ₦{(invoiceStats?.total_paid || 1972100).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#c8952a', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px', color: '#6b6560' }}>Pending</span>
                <span style={{ fontWeight: 600, color: '#0f0e0b' }}>{sentCount} — ₦{(invoiceStats?.total_outstanding || 245000).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#b83232', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '13px', color: '#6b6560' }}>Overdue</span>
                <span style={{ fontWeight: 600, color: '#0f0e0b' }}>{overdueCount} — ₦{(invoiceStats?.total_outstanding || 485000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Top Customers */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>Top Customers</span>
            </div>
            <div>
              {(customerStats?.top_customers || [
                { customer_name: 'Dangote Foods Ltd', total_invoiced: 2100000, invoice_count: 12 },
                { customer_name: 'Zenith Traders', total_invoiced: 845000, invoice_count: 8 },
                { customer_name: 'Lagos Grocers', total_invoiced: 620000, invoice_count: 6 },
              ]).slice(0, 5).map((customer: TopCustomer, index: number) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', borderBottom: index < 4 ? '1px solid #f0ede6' : 'none' }}>
                  <div style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '11px', 
                    fontWeight: 600,
                    background: index === 0 ? '#fde8c8' : index === 1 ? '#e8e6e0' : index === 2 ? '#e8d5c0' : '#f4f2eb',
                    color: index < 3 ? '#0f0e0b' : '#6b6560'
                  }}>
                    {index === 0 ? '1st' : index === 1 ? '2nd' : index === 2 ? '3rd' : `${index + 1}th`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0f0e0b' }}>{customer.customer_name}</div>
                    <div style={{ fontSize: '11px', color: '#9e9990' }}>{customer.invoice_count} invoices</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f0e0b' }}>₦{(customer.total_invoiced || 0).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tax Summary */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>Tax Summary</span>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ background: '#f4f2eb', border: '1px solid #ddd9cf', borderRadius: '10px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px' }}>
                    <span style={{ color: '#6b6560' }}>Total Invoiced</span>
                    <span style={{ fontWeight: 600 }}>₦{(invoiceStats?.total_revenue ?? 2706250).toLocaleString()}</span>
                  </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px' }}>
                  <span style={{ color: '#6b6560' }}>Total VAT (7.5%)</span>
                  <span style={{ color: '#c8952a', fontWeight: 600 }}>₦{Math.round((invoiceStats?.total_revenue || 2706250) * 0.075).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px' }}>
                  <span style={{ color: '#6b6560' }}>Total WHT (5%)</span>
                  <span style={{ color: '#b83232', fontWeight: 600 }}>₦{Math.round((invoiceStats?.total_revenue || 2706250) * 0.05).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px' }}>
                  <span style={{ color: '#6b6560' }}>Net Collected</span>
                  <span style={{ color: '#1a6b4a', fontWeight: 600 }}>₦{(invoiceStats?.total_paid || 1972100).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 6px', marginTop: '10px', borderTop: '2px solid #0f0e0b', fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700 }}>
                  <span>Net Receivable</span>
                  <span>₦{(invoiceStats?.total_outstanding || 413195).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
