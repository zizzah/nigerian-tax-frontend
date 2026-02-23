'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCustomers, useCustomerStats, useCreateCustomer, useDeleteCustomer, } from '@/lib/hooks/useCustomers'
import {Customer} from '@/lib/types'
import { toast } from 'sonner'
import { 
  Search, 
  Plus, 
  Users, 
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Loader2
} from 'lucide-react'

export default function CustomersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    tin: '',
    customer_type: 'Business' as 'Business' | 'Individual',
    payment_terms_days: 30,
  })

  const { data: customersData, isLoading, error } = useCustomers({ 
    search: search || undefined,
    limit: 50 
  })
  
  const { data: stats } = useCustomerStats()
  const createCustomer = useCreateCustomer()
  const deleteCustomer = useDeleteCustomer()

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createCustomer.mutateAsync(newCustomer)
      toast.success('Customer added successfully!')
      setShowModal(false)
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        tin: '',
        customer_type: 'Business',
        payment_terms_days: 30,
      })
    } catch (err) {
      toast.error('Failed to create customer')
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer.mutateAsync(id)
        toast.success('Customer deleted')
      } catch (err) {
        toast.error('Failed to delete customer')
      }
    }
  }

  const customers = customersData?.customers || []
  const totalCustomers = stats?.total_customers || customers.length

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
          Customers
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: '#9e9990' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search customers..." 
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
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#d4eddf' }}>👥</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {stats?.total_customers || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Total Customers</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#d4eddf' }}>✅</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {stats?.active_customers || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Active</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fde8e8' }}>⏳</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              {(stats?.total_customers || 0) - (stats?.active_customers || 0)}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Inactive</div>
          </div>
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: '#fff3d4' }}>💰</div>
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', lineHeight: 1, marginBottom: '4px' }}>
              ₦{(stats?.total_revenue || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '12px', color: '#9e9990' }}>Total Revenue</div>
          </div>
        </div>

        {/* Customer List */}
        <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
              {totalCustomers} customers
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 size={32} style={{ color: '#c8952a', animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : error ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#b83232' }}>
              Failed to load customers
            </div>
          ) : customers.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', opacity: 0.3, marginBottom: '16px' }}>👥</div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600, color: '#0f0e0b', marginBottom: '8px' }}>
                No customers yet
              </div>
              <div style={{ fontSize: '13px', color: '#9e9990', marginBottom: '24px' }}>
                Add your first customer to get started
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
                <Plus size={16} /> Add Customer
              </button>
            </div>
          ) : (
            <div style={{ padding: '4px 0' }}>
              {customers.map((customer: Customer) => {
                const initials = customer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                const avatarColors = ['#fde8c8', '#dce8f8', '#d4eddf', '#f3e8ff', '#fde8e8']
                const colorIndex = customer.name.charCodeAt(0) % avatarColors.length
                
                return (
                  <div 
                    key={customer.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '12px 20px',
                      borderBottom: '1px solid #f0ede6',
                      cursor: 'pointer',
                      transition: 'background 0.12s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fdf6e3'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '13px', 
                      fontWeight: 600,
                      background: avatarColors[colorIndex],
                      color: '#0f0e0b',
                      flexShrink: 0 
                    }}>
                      {initials}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#0f0e0b' }}>{customer.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#9e9990' }}>{customer.email || 'No email'}</div>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a6b4a', marginRight: '12px' }}>
                      ₦{parseFloat(String(customer.total_invoiced_amount) || '0').toLocaleString()}
                    </div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 500,
                      background: customer.is_active ? '#d4eddf' : '#ede9de',
                      color: customer.is_active ? '#1a6b4a' : '#6b6560',
                      marginRight: '12px'
                    }}>
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteCustomer(customer.id)
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9e9990',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
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
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '18px', fontWeight: 600 }}>Add New Customer</span>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#9e9990', padding: '4px', borderRadius: '6px' }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Company Name *</label>
                    <input 
                      type="text"
                      value={newCustomer.name}
                      onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      required
                      placeholder="e.g. Zenith Traders"
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
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Customer Type</label>
                    <select 
                      value={newCustomer.customer_type}
                      onChange={(e) => setNewCustomer({ ...newCustomer, customer_type: e.target.value as 'Business' | 'Individual' })}
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
                      <option value="Business">Business</option>
                      <option value="Individual">Individual</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Email</label>
                    <input 
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      placeholder="billing@company.com"
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
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Phone</label>
                    <input 
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Address</label>
                  <input 
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    placeholder="Business address..."
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>City</label>
                    <input 
                      type="text"
                      value={newCustomer.city}
                      onChange={(e) => setNewCustomer({ ...newCustomer, city: e.target.value })}
                      placeholder="Lagos"
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
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>TIN</label>
                    <input 
                      type="text"
                      value={newCustomer.tin}
                      onChange={(e) => setNewCustomer({ ...newCustomer, tin: e.target.value })}
                      placeholder="Tax ID Number"
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
                  disabled={createCustomer.isPending}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: createCustomer.isPending ? 'not-allowed' : 'pointer',
                    border: 'none',
                    background: '#c8952a',
                    color: '#0f0e0b',
                    opacity: createCustomer.isPending ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {createCustomer.isPending && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
