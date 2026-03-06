'use client'

import { useState } from 'react'
import { Plus, Loader2, Search } from 'lucide-react'
import {
  useCustomers,
  useCustomerStats,
  useCreateCustomer,
  useUpdateCustomer,
} from '@/lib/hooks/useCustomers'
import type { Customer, CustomerCreate } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(num) ? 0 : num)
}

const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()

const getAvatarColor = (name: string) => {
  const colors = [
    { bg: '#fde8c8', text: '#8b5e00' },
    { bg: '#dce8f8', text: '#1e4d8c' },
    { bg: '#d4eddf', text: '#1a6b4a' },
    { bg: '#f3e8ff', text: '#7c3aed' },
    { bg: '#fde8e8', text: '#b83232' },
    { bg: '#fff3d4', text: '#8b6000' },
  ]
  return colors[name.charCodeAt(0) % colors.length]
}

const statusColors = {
  Active:   { bg: '#d4eddf', text: '#1a6b4a' },
  Inactive: { bg: '#ede9de', text: '#6b6560' },
}

const emptyForm = (): CustomerCreate => ({
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  tin: '',
  customer_type: 'Individual',
  payment_terms_days: 30,
  notes: '',
})

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const [searchValue, setSearchValue]         = useState('')
  const [page, setPage]                        = useState(1)
  const PAGE_SIZE = 20
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData]               = useState<CustomerCreate>(emptyForm())
  const [formError, setFormError]             = useState<string | null>(null)

  const { data: customersData, isLoading } = useCustomers({
    limit: PAGE_SIZE,
    skip:  (page - 1) * PAGE_SIZE,
    search: searchValue || undefined,
  })
  const { data: statsData }  = useCustomerStats()
  const createCustomer       = useCreateCustomer()
  const updateCustomer       = useUpdateCustomer()

  const customers: Customer[] = customersData?.customers || []
  const totalCustomers        = customersData?.total || 0

  // ── Form handlers ──────────────────────────────────────────────────────────

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value,
    }))
  }

  const handleAddClick = () => {
    setFormData(emptyForm())
    setFormError(null)
    setIsAddDialogOpen(true)
  }

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name:               customer.name,
      email:              customer.email || '',
      phone:              customer.phone || '',
      address:            customer.address || '',
      city:               customer.city || '',
      state:              customer.state || '',
      tin:                customer.tin || '',
      customer_type:      customer.customer_type,
      credit_limit:       customer.credit_limit ? parseFloat(customer.credit_limit) : undefined,
      payment_terms_days: customer.payment_terms_days,
      notes:              customer.notes || '',
    })
    setFormError(null)
    setIsEditDialogOpen(true)
  }

  const handleAddSubmit = async () => {
    if (!formData.name.trim()) { setFormError('Customer name is required'); return }
    setFormError(null)
    try {
      await createCustomer.mutateAsync(formData)
      setIsAddDialogOpen(false)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Failed to create customer'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }

  const handleEditSubmit = async () => {
    if (!selectedCustomer) return
    if (!formData.name.trim()) { setFormError('Customer name is required'); return }
    setFormError(null)
    try {
      await updateCustomer.mutateAsync({ id: selectedCustomer.id, data: formData })
      setIsEditDialogOpen(false)
      setSelectedCustomer(null)
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || 'Failed to update customer'
      setFormError(typeof msg === 'string' ? msg : JSON.stringify(msg))
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <div className="topbar"><div className="topbar-title">Customers</div></div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading customers...</p>
        </div>
        <style jsx>{`.loading-container{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;gap:12px;color:var(--text-dim)}`}</style>
      </>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Customers</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search customers..." value={searchValue}
              onChange={(e) => { setSearchValue(e.target.value); setPage(1) }} className="search-input" />
          </div>
          <button className="btn btn-gold" onClick={handleAddClick}>
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Customers</div>
          <div className="page-sub">
            {statsData
              ? `${statsData.active_customers} active of ${statsData.total_customers} total`
              : `${totalCustomers} customers`}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span className="text-dim">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalCustomers)}–{Math.min(page * PAGE_SIZE, totalCustomers)} of {totalCustomers} customers
            </span>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-sm btn-outline" onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}>← Prev</button>
              <span style={{ fontSize:12, color:'var(--text-dim)', alignSelf:'center', padding:'0 4px' }}>
                Page {page} of {Math.max(1, Math.ceil(totalCustomers / PAGE_SIZE))}
              </span>
              <button className="btn btn-sm btn-outline" onClick={() => setPage(p => p + 1)}
                disabled={page * PAGE_SIZE >= totalCustomers}>Next →</button>
            </div>
          </div>

          {customers.length > 0 ? (
            <div className="customer-list">
              {customers.map((customer) => {
                const avatarColor = getAvatarColor(customer.name)
                return (
                  <div key={customer.id} className="customer-row"
                    onClick={() => handleEditClick(customer)}>
                    <div className="cust-avatar"
                      style={{ background: avatarColor.bg, color: avatarColor.text }}>
                      {getInitials(customer.name)}
                    </div>
                    <div className="cust-info">
                      <div className="cust-name">{customer.name}</div>
                      <div className="cust-email">{customer.email || 'No email'}</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:2 }}>
                      <div className="cust-amount">{formatCurrency(customer.total_invoiced_amount || 0)}</div>
                      {(() => {
                        const outstanding = parseFloat(customer.total_invoiced_amount || '0') - parseFloat(customer.total_paid_amount || '0')
                        return outstanding > 0
                          ? <div style={{ fontSize:11, color:'#b83232', fontWeight:500 }}>
                              ₦{new Intl.NumberFormat('en-NG').format(outstanding)} outstanding
                            </div>
                          : <div style={{ fontSize:11, color:'#1a6b4a', fontWeight:500 }}>✓ Settled</div>
                      })()}
                    </div>
                    <span className="badge" style={{
                      background: customer.is_active ? statusColors.Active.bg : statusColors.Inactive.bg,
                      color:      customer.is_active ? statusColors.Active.text : statusColors.Inactive.text,
                    }}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No customers found</p>
              <button className="btn btn-gold" onClick={handleAddClick}>
                <Plus size={16} /> Add First Customer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>Fill in the customer details below.</DialogDescription>
          </DialogHeader>
    <div className="grid gap-4 py-4">
      {formError && (
        <div className="error-banner">{formError}</div>
      )}

      {/* Name + Customer Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name *</Label>
          <Input id="name" name="name" value={formData.name}
            onChange={handleInputChange} placeholder="Full name or company" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_type">Type</Label>
          <select id="customer_type" name="customer_type" value={formData.customer_type}
            onChange={handleInputChange} className="select-input">
            <option value="Individual">Individual</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email}
            onChange={handleInputChange} placeholder="customer@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone}
            onChange={handleInputChange} placeholder="+234..." />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={formData.address}
          onChange={handleInputChange} placeholder="Street address" />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city}
            onChange={handleInputChange} placeholder="Lagos" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" value={formData.state}
            onChange={handleInputChange} placeholder="Lagos State" />
        </div>
      </div>

      {/* TIN + Payment Terms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tin">TIN</Label>
          <Input id="tin" name="tin" value={formData.tin}
            onChange={handleInputChange} placeholder="Tax ID number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_terms_days">Payment Terms (days)</Label>
          <Input id="payment_terms_days" name="payment_terms_days" type="number"
            value={formData.payment_terms_days} onChange={handleInputChange} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" value={formData.notes}
          onChange={handleInputChange} placeholder="Any additional notes" />
      </div>
    </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSubmit} disabled={createCustomer.isPending}>
              {createCustomer.isPending ? 'Creating...' : 'Create Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update the customer details below.</DialogDescription>
          </DialogHeader>
    <div className="grid gap-4 py-4">
      {formError && (
        <div className="error-banner">{formError}</div>
      )}

      {/* Name + Customer Type */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Customer Name *</Label>
          <Input id="name" name="name" value={formData.name}
            onChange={handleInputChange} placeholder="Full name or company" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_type">Type</Label>
          <select id="customer_type" name="customer_type" value={formData.customer_type}
            onChange={handleInputChange} className="select-input">
            <option value="Individual">Individual</option>
            <option value="Business">Business</option>
          </select>
        </div>
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email}
            onChange={handleInputChange} placeholder="customer@email.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={formData.phone}
            onChange={handleInputChange} placeholder="+234..." />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" value={formData.address}
          onChange={handleInputChange} placeholder="Street address" />
      </div>

      {/* City + State */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" value={formData.city}
            onChange={handleInputChange} placeholder="Lagos" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" value={formData.state}
            onChange={handleInputChange} placeholder="Lagos State" />
        </div>
      </div>

      {/* TIN + Payment Terms */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tin">TIN</Label>
          <Input id="tin" name="tin" value={formData.tin}
            onChange={handleInputChange} placeholder="Tax ID number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_terms_days">Payment Terms (days)</Label>
          <Input id="payment_terms_days" name="payment_terms_days" type="number"
            value={formData.payment_terms_days} onChange={handleInputChange} />
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input id="notes" name="notes" value={formData.notes}
          onChange={handleInputChange} placeholder="Any additional notes" />
      </div>
    </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 28px;
        }
        .page-header { margin-bottom: 24px; }
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
        .btn-gold { background: var(--gold); color: var(--ink); }
        .btn-gold:hover { background: #d4a030; }
        .customer-list { padding: 4px 0; }
        .customer-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid #f0ede6;
          cursor: pointer;
          transition: background 0.12s;
        }
        .customer-row:hover { background: var(--gold-pale); }
        .customer-row:last-child { border-bottom: none; }
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
        .cust-info { flex: 1; min-width: 0; }
        .cust-name {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cust-email {
          font-size: 11.5px;
          color: var(--text-dim);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cust-amount {
          font-size: 13px;
          font-weight: 600;
          color: var(--green);
          white-space: nowrap;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
          white-space: nowrap;
        }
        .search-wrap { position: relative; }
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
        .search-input:focus { border-color: var(--gold); background: #fff; }
        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-dim);
        }
        .text-dim { color: var(--text-dim); font-size: 12px; }
        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }
        .empty-state p { margin-bottom: 12px; }
        .select-input {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: var(--text);
          background: #fff;
          outline: none;
        }
        .select-input:focus { border-color: var(--gold); }
        .error-banner {
          background: #fde8e8;
          color: #b83232;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
        }
        @media (max-width: 768px) {
          .content { padding: 16px; }
          .page-title { font-size: 22px; }
          .customer-row { flex-wrap: wrap; gap: 8px; padding: 12px; }
          .cust-amount { width: 100%; margin-top: 4px; text-align: right; }
          .search-input { width: 180px; }
        }
        @media (max-width: 480px) {
          .content { padding: 12px; }
          .search-input { width: 100%; }
        }
      `}</style>
    </>
  )
}