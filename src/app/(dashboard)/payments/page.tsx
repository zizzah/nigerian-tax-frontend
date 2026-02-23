'use client'

import { useState } from 'react'
import { usePayments } from '@/lib/hooks/usePayments'
import { Payment } from '@/lib/types'
import { toast } from 'sonner'
import { 
  Search, 
  Plus, 
  CreditCard,
  Loader2
} from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string }> = {
  CONFIRMED: { bg: '#d4eddf', text: '#1a6b4a' },
  PENDING: { bg: '#fff3cd', text: '#856404' },
  FAILED: { bg: '#fde8e8', text: '#b83232' },
}

export default function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newPayment, setNewPayment] = useState({
    invoice_id: '',
    amount: 0,
    payment_method: 'Bank Transfer',
    payment_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  })

  const { data: paymentsData, isLoading, error } = usePayments({ 
    limit: 50 
  })
  
  const payments = paymentsData?.payments || []

  // Calculate totals from payments
  const totalCollected = payments
    .filter((p: Payment) => p.status === 'CONFIRMED')
    .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount || '0'), 0)

  const totalPending = payments
    .filter((p: Payment) => p.status === 'PENDING')
    .reduce((sum: number, p: Payment) => sum + parseFloat(p.amount || '0'), 0)

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Payment recorded successfully!')
    setShowModal(false)
    setNewPayment({
      invoice_id: '',
      amount: 0,
      payment_method: 'Bank Transfer',
      payment_date: new Date().toISOString().split('T')[0],
      reference: '',
      notes: '',
    })
  }

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
          Payments
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9e9990' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search payments..." 
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
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#d4eddf' }}>✅</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{totalCollected.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Collected</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fff3cd' }}>⏳</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{totalPending.toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Pending</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#dce8f8' }}>📊</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {payments.length}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Transactions</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#f3e8ff' }}>💳</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {new Set(payments.map((p: Payment) => p.payment_method)).size}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Methods</div>
          </div>
        </div>

        {/* Payments Table */}
        <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
              Payment Transactions
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 size={32} style={{ color: '#c8952a', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#b83232' }}>
              Failed to load payments
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>💳</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: '#0f0e0b', marginBottom: '8px' }}>
                No payments yet
              </div>
              <div style={{ fontSize: '13px', color: '#9e9990', marginBottom: '24px' }}>
                Record your first payment to get started
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
                <Plus size={16} /> Record Payment
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Date</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Customer</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Invoice</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Method</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Amount</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: Payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#9e9990' }}>
                      {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                    </td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#2c2a24' }}>{payment.customer_name || payment.invoice_number || 'Unknown'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#2c2a24' }}>#{payment.invoice_number || '-'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#6b6560' }}>{payment.payment_method || '-'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', fontWeight: 600, color: '#0f0e0b' }}>₦{parseFloat(payment.amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: statusColors[payment.status]?.bg || '#ede9de',
                        color: statusColors[payment.status]?.text || '#6b6560',
                      }}>
                        {payment.status || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
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
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600 }}>Record Payment</span>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9e9990', padding: '4px', borderRadius: '6px' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleRecordPayment}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Invoice *</label>
                  <select 
                    value={newPayment.invoice_id}
                    onChange={(e) => setNewPayment({ ...newPayment, invoice_id: e.target.value })}
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
                    <option value="">Select invoice...</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Amount (₦) *</label>
                    <input 
                      type="number"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Payment Method</label>
                    <select 
                      value={newPayment.payment_method}
                      onChange={(e) => setNewPayment({ ...newPayment, payment_method: e.target.value })}
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
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Cheque</option>
                      <option>Online Payment</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Payment Date</label>
                    <input 
                      type="date"
                      value={newPayment.payment_date}
                      onChange={(e) => setNewPayment({ ...newPayment, payment_date: e.target.value })}
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
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Reference</label>
                    <input 
                      type="text"
                      value={newPayment.reference}
                      onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                      placeholder="Bank ref number..."
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
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    border: 'none',
                    background: '#c8952a',
                    color: '#0f0e0b',
                  }}
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
