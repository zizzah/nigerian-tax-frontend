'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Printer, Send, MoreHorizontal } from 'lucide-react'
import { useInvoice, useFinalizeInvoice, useCancelInvoice } from '@/lib/hooks/useInvoices'
import type { Invoice, InvoiceItem } from '@/lib/types'

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
    month: 'long',
    year: 'numeric',
  })
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PAID: { bg: '#d4eddf', text: '#1a6b4a' },
  SENT: { bg: '#fff3cd', text: '#856404' },
  OVERDUE: { bg: '#fde8e8', text: '#b83232' },
  DRAFT: { bg: '#ede9de', text: '#6b6560' },
  PARTIALLY_PAID: { bg: '#dce8f8', text: '#1e4d8c' },
  CANCELLED: { bg: '#fde8e8', text: '#b83232' },
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  // Fetch invoice data
  const { data: invoice, isLoading, error } = useInvoice(id)
  
  // Mutations
  const finalizeInvoice = useFinalizeInvoice()
  const cancelInvoice = useCancelInvoice()

  const handleFinalize = async () => {
    try {
      await finalizeInvoice.mutateAsync(id)
    } catch (err) {
      console.error('Error finalizing invoice:', err)
    }
  }

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      try {
        await cancelInvoice.mutateAsync({ id, reason: 'Cancelled by user' })
      } catch (err) {
        console.error('Error cancelling invoice:', err)
      }
    }
  }

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div className="topbar-title">Invoice Details</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading invoice...</p>
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

  if (error || !invoice) {
    return (
      <>
        <div className="topbar">
          <button className="back-btn" onClick={() => router.back()}>
            <ArrowLeft size={20} />
          </button>
          <div className="topbar-title">Invoice Details</div>
        </div>
        <div className="error-container">
          <p>Error loading invoice</p>
          <button className="btn btn-outline" onClick={() => router.back()}>
            Go Back
          </button>
        </div>
        <style jsx>{`
          .error-container {
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
        <button className="back-btn" onClick={() => router.back()}>
          <ArrowLeft size={20} />
        </button>
        <div className="topbar-title">Invoice {invoice.invoice_number}</div>
        <div className="topbar-actions">
          {invoice.status === 'DRAFT' && (
            <button 
              className="btn btn-primary"
              onClick={handleFinalize}
              disabled={finalizeInvoice.isPending}
            >
              {finalizeInvoice.isPending ? 'Sending...' : 'Send Invoice'}
            </button>
          )}
          {invoice.status !== 'CANCELLED' && invoice.status !== 'PAID' && (
            <button 
              className="btn btn-outline"
              onClick={handleCancel}
              disabled={cancelInvoice.isPending}
            >
              Cancel
            </button>
          )}
          <button className="btn btn-outline">
            <Printer size={16} /> Print
          </button>
          <button className="btn btn-outline">
            <Send size={16} /> Send
          </button>
          <button className="btn btn-gold">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="content">
        <div className="invoice-container">
          {/* Invoice Header */}
          <div className="invoice-header">
            <div className="invoice-brand">
              <h1 className="company-name">Your Business Name</h1>
              <p className="company-address">123 Business Street, Lagos, Nigeria</p>
            </div>
            <div className="invoice-info">
              <h2 className="invoice-title">INVOICE</h2>
              <div className="invoice-meta">
                <div className="meta-row">
                  <span className="meta-label">Invoice #:</span>
                  <span className="meta-value">{invoice.invoice_number}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Status:</span>
                  <span 
                    className="badge"
                    style={{ 
                      background: statusColors[invoice.status]?.bg || '#ede9de', 
                      color: statusColors[invoice.status]?.text || '#6b6560' 
                    }}
                  >
                    {invoice.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Issue Date:</span>
                  <span className="meta-value">{formatDate(invoice.issue_date)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Due Date:</span>
                  <span className="meta-value">{formatDate(invoice.due_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="customer-section">
            <div className="section-title">Bill To:</div>
            <div className="customer-details">
              <div className="customer-name">{invoice.customer?.name || invoice.customer_name || 'N/A'}</div>
              {invoice.customer && (
                <>
                  {invoice.customer.address && <p>{invoice.customer.address}</p>}
                  {invoice.customer.city && <p>{invoice.customer.city}{invoice.customer.state ? `, ${invoice.customer.state}` : ''}</p>}
                  {invoice.customer.email && <p>{invoice.customer.email}</p>}
                  {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
                  {invoice.customer.tin && <p>TIN: {invoice.customer.tin}</p>}
                </>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="items-section">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: InvoiceItem, index: number) => (
                  <tr key={item.id || index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price)}</td>
                    <td>{parseFloat(item.discount_amount) > 0 ? formatCurrency(item.discount_amount) : '-'}</td>
                    <td>{item.tax_rate}%</td>
                    <td className="text-right">{formatCurrency(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="totals-section">
            <div className="totals-row">
              <span className="totals-label">Subtotal:</span>
              <span className="totals-value">{formatCurrency(invoice.subtotal)}</span>
            </div>
            {parseFloat(invoice.discount_amount) > 0 && (
              <div className="totals-row">
                <span className="totals-label">Discount:</span>
                <span className="totals-value">-{formatCurrency(invoice.discount_amount)}</span>
              </div>
            )}
            <div className="totals-row">
              <span className="totals-label">VAT:</span>
              <span className="totals-value">{formatCurrency(invoice.tax_amount)}</span>
            </div>
            <div className="totals-row grand-total">
              <span className="totals-label">Total:</span>
              <span className="totals-value">{formatCurrency(invoice.total_amount)}</span>
            </div>
            {parseFloat(invoice.paid_amount) > 0 && (
              <>
                <div className="totals-row paid">
                  <span className="totals-label">Paid:</span>
                  <span className="totals-value">{formatCurrency(invoice.paid_amount)}</span>
                </div>
                <div className="totals-row outstanding">
                  <span className="totals-label">Outstanding:</span>
                  <span className="totals-value">{formatCurrency(invoice.outstanding_amount)}</span>
                </div>
              </>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="notes-section">
              <div className="section-title">Notes:</div>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="invoice-footer">
            <p>Thank you for your business!</p>
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

        .back-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
        }

        .back-btn:hover {
          background: var(--cream);
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
          background: #f5f5f0;
        }

        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 40px;
          box-shadow: var(--shadow);
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--gold);
        }

        .company-name {
          font-family: 'Fraunces', serif;
          font-size: 24px;
          font-weight: 700;
          color: var(--ink);
          margin: 0 0 8px 0;
        }

        .company-address {
          color: var(--text-dim);
          font-size: 13px;
          margin: 0;
        }

        .invoice-info {
          text-align: right;
        }

        .invoice-title {
          font-family: 'Fraunces', serif;
          font-size: 32px;
          font-weight: 700;
          color: var(--gold);
          margin: 0 0 16px 0;
        }

        .invoice-meta {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .meta-row {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          font-size: 13px;
        }

        .meta-label {
          color: var(--text-dim);
        }

        .meta-value {
          font-weight: 500;
          color: var(--ink);
          min-width: 120px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }

        .customer-section {
          margin-bottom: 30px;
        }

        .section-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-dim);
          margin-bottom: 8px;
        }

        .customer-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 4px;
        }

        .customer-details p {
          font-size: 13px;
          color: var(--text);
          margin: 2px 0;
        }

        .items-section {
          margin-bottom: 30px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--text-dim);
          padding: 10px 12px;
          background: var(--cream);
          font-weight: 500;
          border-bottom: 1px solid var(--border);
        }

        .items-table td {
          padding: 12px;
          border-bottom: 1px solid #f0ede6;
          font-size: 13px;
        }

        .items-table .text-right {
          text-align: right;
        }

        .totals-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-bottom: 30px;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          width: 250px;
          padding: 6px 0;
          font-size: 13px;
        }

        .totals-label {
          color: var(--text-dim);
        }

        .totals-value {
          font-weight: 500;
        }

        .totals-row.grand-total {
          border-top: 2px solid var(--gold);
          margin-top: 8px;
          padding-top: 12px;
          font-size: 16px;
          font-weight: 700;
        }

        .totals-row.grand-total .totals-value {
          color: var(--gold);
        }

        .totals-row.paid .totals-value {
          color: #1a6b4a;
        }

        .totals-row.outstanding .totals-value {
          color: #b83232;
          font-weight: 700;
        }

        .notes-section {
          padding: 20px;
          background: var(--cream);
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .notes-section p {
          font-size: 13px;
          color: var(--text);
          margin: 0;
        }

        .invoice-footer {
          text-align: center;
          padding-top: 20px;
          border-top: 1px solid var(--border);
        }

        .invoice-footer p {
          font-size: 13px;
          color: var(--text-dim);
          margin: 0;
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
        }

        @media (max-width: 768px) {
          .content {
            padding: 16px;
          }
          .invoice-container {
            padding: 20px;
          }
          .invoice-header {
            flex-direction: column;
            gap: 20px;
          }
          .invoice-info {
            text-align: left;
          }
          .meta-row {
            justify-content: flex-start;
          }
          .items-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </>
  )
}
