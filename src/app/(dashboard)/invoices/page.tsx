'use client'

import { useState } from 'react'
import { useInvoices, useInvoiceStats, useCancelInvoice } from '@/lib/hooks/useInvoices'
import { useCustomers } from '@/lib/hooks/useCustomers'
import { toast } from 'sonner'
import { 
  Search, 
  Plus, 
  FileText,
  Loader2,
  Eye,
  Send,
  X,
  MessageCircle,
  Copy,
  Mail
} from 'lucide-react'

const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: '#ede9de', text: '#6b6560' },
  SENT: { bg: '#fff3cd', text: '#856404' },
  PAID: { bg: '#d4eddf', text: '#1a6b4a' },
  OVERDUE: { bg: '#fde8e8', text: '#b83232' },
  PARTIAL: { bg: '#dce8f8', text: '#1e4d8c' },
  CANCELLED: { bg: '#ede9de', text: '#6b6560' },
}

export default function InvoicesPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [lineItems, setLineItems] = useState([
    { description: '', quantity: 1, unit_price: 0 }
  ])

  const handleSendInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowSendModal(true)
  }

  const handleWhatsApp = () => {
    if (!selectedInvoice) return
    const phone = selectedInvoice.customer_phone || ''
    const message = `Hello! Please find your invoice #${selectedInvoice.invoice_number} for ₦${parseFloat(selectedInvoice.total_amount || 0).toLocaleString()}. Due date: ${selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}. View: https://taxflow.ng/invoices/${selectedInvoice.id}`
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank')
    toast.success('Opening WhatsApp...')
  }

  const handleCopyLink = () => {
    const link = `https://taxflow.ng/invoices/${selectedInvoice?.id}`
    navigator.clipboard.writeText(link)
    toast.success('Invoice link copied to clipboard!')
  }

  const handleSendEmail = () => {
    if (!selectedInvoice) return
    const subject = `Invoice #${selectedInvoice.invoice_number} from TaxFlow`
    const body = `Hello,\n\nPlease find your invoice #${selectedInvoice.invoice_number} for ₦${parseFloat(selectedInvoice.total_amount || 0).toLocaleString()}.\n\nDue Date: ${selectedInvoice.due_date ? new Date(selectedInvoice.due_date).toLocaleDateString() : 'N/A'}\n\nView online: https://taxflow.ng/invoices/${selectedInvoice.id}\n\nThank you for your business!\n\nTaxFlow NG`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const { data: invoicesData, isLoading, error } = useInvoices({ 
    status: status || undefined,
    limit: 50 
  })
  
  const { data: stats } = useInvoiceStats()
  const { data: customersData } = useCustomers({ limit: 100 })
  const cancelInvoice = useCancelInvoice()

  const invoices = invoicesData?.invoices || []
  const customers = customersData?.customers || []

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const calculateVAT = () => {
    return calculateSubtotal() * 0.075
  }

  const calculateWHT = () => {
    return calculateSubtotal() * 0.05
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT() - calculateWHT()
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unit_price: 0 }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const handleCancelInvoice = async (id: string) => {
    if (confirm('Are you sure you want to cancel this invoice?')) {
      try {
        await cancelInvoice.mutateAsync({ id, reason: 'Cancelled by user' })
        toast.success('Invoice cancelled')
      } catch (err) {
        toast.error('Failed to cancel invoice')
      }
    }
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
          Invoices
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9e9990' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search invoices..." 
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
            onClick={() => setShowCreateModal(true)}
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
            <Plus size={16} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fff3d4' }}>🧾</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {stats?.total_invoices || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Total Invoices</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#d4eddf' }}>✅</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{(stats?.total_paid || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Total Paid</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fff3cd' }}>⏳</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{(stats?.total_outstanding || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Outstanding</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fde8e8' }}>🔴</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {stats?.overdue_count || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Overdue</div>
          </div>
        </div>

        {/* Invoices Table */}
        <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setStatus('')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: status === '' ? 'none' : '1px solid #ddd9cf',
                  background: status === '' ? '#0f0e0b' : 'transparent',
                  color: status === '' ? '#fff' : '#6b6560',
                }}
              >
                All
              </button>
              <button 
                onClick={() => setStatus('DRAFT')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: status === 'DRAFT' ? 'none' : '1px solid #ddd9cf',
                  background: status === 'DRAFT' ? '#0f0e0b' : 'transparent',
                  color: status === 'DRAFT' ? '#fff' : '#6b6560',
                }}
              >
                Draft
              </button>
              <button 
                onClick={() => setStatus('SENT')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: status === 'SENT' ? 'none' : '1px solid #ddd9cf',
                  background: status === 'SENT' ? '#0f0e0b' : 'transparent',
                  color: status === 'SENT' ? '#fff' : '#6b6560',
                }}
              >
                Pending
              </button>
              <button 
                onClick={() => setStatus('PAID')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: status === 'PAID' ? 'none' : '1px solid #ddd9cf',
                  background: status === 'PAID' ? '#0f0e0b' : 'transparent',
                  color: status === 'PAID' ? '#fff' : '#6b6560',
                }}
              >
                Paid
              </button>
              <button 
                onClick={() => setStatus('OVERDUE')}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  fontSize: '12px', 
                  fontWeight: 500, 
                  cursor: 'pointer', 
                  border: status === 'OVERDUE' ? 'none' : '1px solid #ddd9cf',
                  background: status === 'OVERDUE' ? '#0f0e0b' : 'transparent',
                  color: status === 'OVERDUE' ? '#fff' : '#6b6560',
                }}
              >
                Overdue
              </button>
            </div>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 size={32} style={{ color: '#c8952a', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#b83232' }}>
              Failed to load invoices
            </div>
          ) : invoices.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>🧾</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: '#0f0e0b', marginBottom: '8px' }}>
                No invoices yet
              </div>
              <div style={{ fontSize: '13px', color: '#9e9990', marginBottom: '24px' }}>
                Create your first invoice to get started
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
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
                <Plus size={16} /> Create Invoice
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Invoice #</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Customer</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Issue Date</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Due Date</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Amount</th>
                  <th style={{ textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Status</th>
                  <th style={{ textAlign: 'right', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9e9990', padding: '10px 20px', background: '#f4f2eb', borderBottom: '1px solid #ddd9cf' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                    <td style={{ padding: '13px 20px', fontSize: '13.5px', fontWeight: 600, color: '#0f0e0b' }}>#{invoice.invoice_number}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#2c2a24' }}>{invoice.customer_name || 'Unknown'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#9e9990' }}>{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', color: '#9e9990' }}>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '13px 20px', fontSize: '13px', fontWeight: 600, color: '#0f0e0b' }}>₦{parseFloat(invoice.total_amount || 0).toLocaleString()}</td>
                    <td style={{ padding: '13px 20px' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 500,
                        background: statusColors[invoice.status]?.bg || '#ede9de',
                        color: statusColors[invoice.status]?.text || '#6b6560',
                      }}>
                        {invoice.status}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleSendInvoice(invoice)}
                          title="Send Invoice"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#c8952a',
                            padding: '8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Send size={16} />
                        </button>
                        <button 
                          onClick={() => handleCancelInvoice(invoice.id)}
                          disabled={invoice.status === 'PAID' || invoice.status === 'CANCELLED'}
                          title="Cancel Invoice"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: invoice.status === 'PAID' || invoice.status === 'CANCELLED' ? 'not-allowed' : 'pointer',
                            color: invoice.status === 'PAID' || invoice.status === 'CANCELLED' ? '#ddd' : '#9e9990',
                            padding: '8px',
                            borderRadius: '6px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.6
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Send Invoice Modal */}
      {showSendModal && selectedInvoice && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,14,11,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '40px 0'
          }}
          onClick={() => setShowSendModal(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '420px',
              maxWidth: '95vw',
              boxShadow: '0 8px 32px rgba(15,14,11,0.12)',
              animation: 'slideUp 0.25s ease',
              margin: '40px 0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600 }}>Send Invoice #{selectedInvoice?.invoice_number}</span>
              <button 
                onClick={() => setShowSendModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9e9990', padding: '4px', borderRadius: '6px' }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '13px', color: '#6b6560', marginBottom: '8px' }}>
                Choose how you want to send this invoice to your customer:
              </div>
              
              {/* WhatsApp Button */}
              <button 
                onClick={handleWhatsApp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #ddd9cf',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageCircle size={20} color="#fff" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0e0b' }}>WhatsApp</div>
                  <div style={{ fontSize: '12px', color: '#9e9990' }}>Send via WhatsApp</div>
                </div>
              </button>

              {/* Email Button */}
              <button 
                onClick={handleSendEmail}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #ddd9cf',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#1e4d8c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#fff" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0e0b' }}>Email</div>
                  <div style={{ fontSize: '12px', color: '#9e9990' }}>Send via email</div>
                </div>
              </button>

              {/* Copy Link Button */}
              <button 
                onClick={handleCopyLink}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #ddd9cf',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#c8952a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Copy size={20} color="#fff" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0e0b' }}>Copy Link</div>
                  <div style={{ fontSize: '12px', color: '#9e9990' }}>Copy invoice URL to clipboard</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15,14,11,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '40px 0'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            style={{
              background: '#fff',
              borderRadius: '16px',
              width: '700px',
              maxWidth: '95vw',
              boxShadow: '0 8px 32px rgba(15,14,11,0.12)',
              animation: 'slideUp 0.25s ease',
              margin: '40px 0'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600 }}>Create New Invoice</span>
              <button 
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9e9990', padding: '4px', borderRadius: '6px' }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Customer Selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Customer *</label>
                  <select 
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
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
                    <option value="">Select customer...</option>
                    {customers.map((customer: any) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Due Date</label>
                  <input 
                    type="date"
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

              {/* Line Items */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Line Items</label>
                  <button 
                    type="button"
                    onClick={addLineItem}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      border: '1px solid #ddd9cf',
                      background: 'transparent',
                      color: '#2c2a24',
                    }}
                  >
                    + Add Item
                  </button>
                </div>
                <div style={{ border: '1px solid #ddd9cf', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 36px', gap: '8px', padding: '10px 14px', background: '#f4f2eb', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', color: '#9e9990', borderBottom: '1px solid #ddd9cf' }}>
                    <span>Description</span>
                    <span>Qty</span>
                    <span>Unit Price</span>
                    <span>Total</span>
                    <span></span>
                  </div>
                  {lineItems.map((item, index) => (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 36px', gap: '8px', padding: '8px 14px', borderBottom: '1px solid #f0ede6', alignItems: 'center' }}>
                      <input 
                        type="text"
                        value={item.description}
                        onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description..."
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid transparent',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#2c2a24',
                          background: 'transparent',
                          outline: 'none',
                        }}
                      />
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid transparent',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#2c2a24',
                          background: 'transparent',
                          outline: 'none',
                        }}
                      />
                      <input 
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          border: '1px solid transparent',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#2c2a24',
                          background: 'transparent',
                          outline: 'none',
                        }}
                      />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f0e0b' }}>₦{(item.quantity * item.unit_price).toLocaleString()}</span>
                      <button 
                        type="button"
                        onClick={() => removeLineItem(index)}
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          border: 'none',
                          background: 'transparent',
                          color: '#9e9990',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: '#f4f2eb', border: '1px solid #ddd9cf', borderRadius: '10px', padding: '18px', width: '280px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px', color: '#6b6560' }}>
                    <span>Subtotal</span>
                    <span>₦{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px', color: '#6b6560' }}>
                    <span>VAT (7.5%)</span>
                    <span>₦{Math.round(calculateVAT()).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '13.5px', color: '#6b6560' }}>
                    <span>WHT (5%)</span>
                    <span>-₦{Math.round(calculateWHT()).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 6px', marginTop: '10px', borderTop: '2px solid #0f0e0b', fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 700 }}>
                    <span>Total</span>
                    <span style={{ color: '#1a6b4a' }}>₦{Math.round(calculateTotal()).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #ddd9cf', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => setShowCreateModal(false)}
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
                type="button"
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: 'none',
                  background: '#0f0e0b',
                  color: '#fff',
                }}
              >
                Save Draft
              </button>
              <button 
                type="button"
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
                Send Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
