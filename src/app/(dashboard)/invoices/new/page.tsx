'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'

const initialLineItems = [
  { id: 1, description: '', quantity: 1, unitPrice: 0 }
]

export default function NewInvoicePage() {
  const router = useRouter()
  const [lineItems, setLineItems] = useState(initialLineItems)
  const [invoiceData, setInvoiceData] = useState(() => ({
    invoiceNumber: `INV-${String(Date.now()).slice(-6)}`,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    customerId: '',
    customerName: '',
    notes: '',
    subtotal: 0,
    vatRate: 7.5,
    vatAmount: 0,
    total: 0
  }))

  const calculateTotals = (items: typeof lineItems) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const vatAmount = subtotal * (invoiceData.vatRate / 100)
    const total = subtotal + vatAmount
    return { subtotal, vatAmount, total }
  }

  const updateLineItem = (id: number, field: string, value: string | number) => {
    setLineItems(items => items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
    const totals = calculateTotals(lineItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
    setInvoiceData(prev => ({ ...prev, ...totals }))
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { 
      id: Date.now(), 
      description: '', 
      quantity: 1, 
      unitPrice: 0 
    }])
  }

  const removeLineItem = (id: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const totals = calculateTotals(lineItems)
    setInvoiceData(prev => ({ ...prev, ...totals }))
    // In production, this would call the API
    alert('Invoice created! (Demo)')
    router.push('/invoices')
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const vatAmount = subtotal * (invoiceData.vatRate / 100)
  const total = subtotal + vatAmount

  return (
    <>
      {/* Topbar */}
      <div className="invoice-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => router.push('/invoices')}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ArrowLeft size={20} color="#6b6560" />
          </button>
          <h1 className="page-title">New Invoice</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => router.push('/invoices')}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: '1px solid #ddd9cf',
              background: '#fff',
              color: '#2c2a24'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: '#c8952a',
              color: '#0f0e0b',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={16} />
            Save Invoice
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="invoice-content">
        <form onSubmit={handleSubmit}>
          {/* Invoice Details Card */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Invoice Details</span>
            </div>
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              <div>
                <label className="form-label">Invoice Number</label>
                <input 
                  type="text" 
                  value={invoiceData.invoiceNumber}
                  onChange={(e) => setInvoiceData({...invoiceData, invoiceNumber: e.target.value})}
                  className="form-input"
                  readOnly
                />
              </div>
              <div>
                <label className="form-label">Issue Date</label>
                <input 
                  type="date" 
                  value={invoiceData.issueDate}
                  onChange={(e) => setInvoiceData({...invoiceData, issueDate: e.target.value})}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Due Date</label>
                <input 
                  type="date" 
                  value={invoiceData.dueDate}
                  onChange={(e) => setInvoiceData({...invoiceData, dueDate: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
              <div>
                <label className="form-label">Customer Name</label>
                <input 
                  type="text" 
                  value={invoiceData.customerName}
                  onChange={(e) => setInvoiceData({...invoiceData, customerName: e.target.value})}
                  className="form-input"
                  placeholder="Enter customer name"
                  required
                />
              </div>
            </div>
          </div>

          {/* Line Items Card */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-header">
              <span className="card-title">Line Items</span>
              <button 
                type="button"
                onClick={addLineItem}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: 'none',
                  background: '#c8952a',
                  color: '#0f0e0b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f4f2eb' }}>
                  <th style={tableHeaderStyle}>Description</th>
                  <th style={{ ...tableHeaderStyle, width: '120px' }}>Quantity</th>
                  <th style={{ ...tableHeaderStyle, width: '150px' }}>Unit Price (₦)</th>
                  <th style={{ ...tableHeaderStyle, width: '150px' }}>Total (₦)</th>
                  <th style={{ ...tableHeaderStyle, width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f0ede6' }}>
                    <td style={tableCellStyle}>
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                        className="form-input"
                        placeholder="Item description"
                        required
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={tableCellStyle}>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        min="1"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={tableCellStyle}>
                      <input 
                        type="number" 
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="form-input"
                        min="0"
                        step="0.01"
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{ fontWeight: 600, color: '#0f0e0b' }}>
                        ₦{(item.quantity * item.unitPrice).toLocaleString()}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <button 
                        type="button"
                        onClick={() => removeLineItem(item.id)}
                        disabled={lineItems.length === 1}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: lineItems.length === 1 ? 'not-allowed' : 'pointer',
                          padding: '4px',
                          opacity: lineItems.length === 1 ? 0.3 : 1
                        }}
                      >
                        <Trash2 size={16} color="#b83232" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Card */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '280px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6b6560', fontSize: '14px' }}>Subtotal</span>
                  <span style={{ fontWeight: 600, color: '#0f0e0b' }}>₦{subtotal.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: '#6b6560', fontSize: '14px' }}>VAT ({invoiceData.vatRate}%)</span>
                  <span style={{ fontWeight: 600, color: '#0f0e0b' }}>₦{vatAmount.toLocaleString()}</span>
                </div>
                <div style={{ borderTop: '1px solid #ddd9cf', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: '#0f0e0b', fontSize: '16px' }}>Total</span>
                  <span style={{ fontWeight: 700, color: '#c8952a', fontSize: '20px', fontFamily: 'Fraunces, serif' }}>₦{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          <div className="card" style={{ marginTop: '16px' }}>
            <div className="card-header">
              <span className="card-title">Notes</span>
            </div>
            <div style={{ padding: '20px' }}>
              <textarea 
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({...invoiceData, notes: e.target.value})}
                className="form-input"
                placeholder="Add any notes or payment instructions..."
                rows={3}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .invoice-topbar {
          height: 60px;
          background: #faf9f6;
          border-bottom: 1px solid #ddd9cf;
          display: flex;
          align-items: center;
          padding: 0 28px;
          gap: 16px;
          flex-shrink: 0;
          justify-content: space-between;
        }

        .page-title {
          font-family: Fraunces, serif;
          font-size: 20px;
          font-weight: 600;
          color: #0f0e0b;
          margin: 0;
        }

        .invoice-content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }

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

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #6b6560;
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd9cf;
          border-radius: 8px;
          font-size: 14px;
          color: #2c2a24;
          background: #fff;
          outline: none;
          transition: border-color 0.15s;
        }

        .form-input:focus {
          border-color: #c8952a;
        }

        .table-header {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #9e9990;
          padding: 12px 16px;
          background: #f4f2eb;
          font-weight: 500;
          border-bottom: 1px solid #ddd9cf;
        }

        .table-cell {
          padding: 12px 16px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .invoice-content {
            padding: 16px;
          }
          
          .invoice-topbar {
            padding: 0 16px;
          }
        }
      `}</style>
    </>
  )
}

const tableHeaderStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  color: '#9e9990',
  padding: '12px 16px',
  background: '#f4f2eb',
  fontWeight: 500,
  borderBottom: '1px solid #ddd9cf'
}

const tableCellStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: '14px'
}
