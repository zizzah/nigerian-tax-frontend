'use client'

import { useState } from 'react'
import { Plus, Loader2, Search } from 'lucide-react'
import { useCustomers, useCustomerStats } from '@/lib/hooks/useCustomers'
import type { Customer } from '@/lib/types'

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

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: '#d4eddf', text: '#1a6b4a' },
  Inactive: { bg: '#ede9de', text: '#6b6560' },
}

// Generate initials from name
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Generate avatar color from name
const getAvatarColor = (name: string) => {
  const colors = [
    { bg: '#fde8c8', text: '#8b5e00' },
    { bg: '#dce8f8', text: '#1e4d8c' },
    { bg: '#d4eddf', text: '#1a6b4a' },
    { bg: '#f3e8ff', text: '#7c3aed' },
    { bg: '#fde8e8', text: '#b83232' },
    { bg: '#fff3d4', text: '#8b6000' },
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export default function CustomersPage() {
  const [searchValue, setSearchValue] = useState('')

  // Fetch data from API
  const { data: customersData, isLoading } = useCustomers({ 
    limit: 50,
    search: searchValue || undefined,
  })
  const { data: statsData } = useCustomerStats()

  const customers: Customer[] = customersData?.customers || []
  const totalCustomers = customersData?.total || 0

  if (isLoading) {
    return (
      <>
        <div className="topbar">
          <div className="topbar-title">Customers</div>
        </div>
        <div className="loading-container">
          <Loader2 className="animate-spin" size={32} />
          <p>Loading customers...</p>
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

  return (
    <>
      <div className="topbar">
        <div className="topbar-title">Customers</div>
        <div className="topbar-actions">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn btn-gold">
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
              : `${totalCustomers} customers`
            }
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="search-wrap">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="search-input"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <span className="text-dim">Showing {customers.length} of {totalCustomers}</span>
          </div>
          
          {customers.length > 0 ? (
            <div className="customer-list">
              {customers.map((customer) => {
                const avatarColor = getAvatarColor(customer.name)
                return (
                  <div key={customer.id} className="customer-row">
                    <div 
                      className="cust-avatar" 
                      style={{ background: avatarColor.bg, color: avatarColor.text }}
                    >
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <div className="cust-name">{customer.name}</div>
                      <div className="cust-email">{customer.email || 'No email'}</div>
                    </div>
                    <div className="cust-amount">
                      {formatCurrency(customer.total_invoiced_amount || 0)}
                    </div>
                    <span 
                      className="badge"
                      style={{ 
                        background: customer.is_active ? statusColors.Active?.bg : statusColors.Inactive?.bg, 
                        color: customer.is_active ? statusColors.Active?.text : statusColors.Inactive?.text,
                        marginLeft: '12px'
                      }}
                    >
                      {customer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-state">
              <p>No customers found</p>
              <button className="btn btn-gold">
                <Plus size={16} /> Add First Customer
              </button>
            </div>
          )}
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

        .page-header {
          margin-bottom: 24px;
        }

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

        .btn-gold {
          background: var(--gold);
          color: var(--ink);
        }

        .btn-gold:hover {
          background: #d4a030;
        }

        .customer-list {
          padding: 4px 0;
        }

        .customer-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          border-bottom: 1px solid #f0ede6;
          cursor: pointer;
          transition: background 0.12s;
        }

        .customer-row:hover {
          background: var(--gold-pale);
        }

        .customer-row:last-child {
          border-bottom: none;
        }

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

        .cust-name {
          font-size: 13.5px;
          font-weight: 500;
          color: var(--ink);
        }

        .cust-email {
          font-size: 11.5px;
          color: var(--text-dim);
        }

        .cust-amount {
          font-size: 13px;
          font-weight: 600;
          color: var(--green);
          margin-left: auto;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }

        .search-wrap {
          position: relative;
        }

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

        .search-input:focus {
          border-color: var(--gold);
          background: #fff;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          color: var(--text-dim);
        }

        .text-dim {
          color: var(--text-dim);
          font-size: 12px;
        }

        .empty-state {
          padding: 40px 20px;
          text-align: center;
          color: var(--text-dim);
        }

        .empty-state p {
          margin-bottom: 12px;
        }

        @media (max-width: 1024px) {
          .topbar {
            flex-wrap: wrap;
            height: auto;
            padding: 12px 16px;
            gap: 10px;
          }
          .topbar-title {
            width: 100%;
            font-size: 18px;
          }
          .topbar-actions {
            width: 100%;
            justify-content: space-between;
          }
        }

        @media (max-width: 768px) {
          .content {
            padding: 16px;
          }
          .page-header {
            margin-bottom: 16px;
          }
          .page-title {
            font-size: 22px;
          }
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .search-wrap {
            width: 100%;
          }
          .search-input {
            width: 100%;
          }
          .customer-row {
            flex-wrap: wrap;
            gap: 8px;
            padding: 12px;
          }
          .cust-avatar {
            width: 40px;
            height: 40px;
          }
          .cust-name {
            font-size: 14px;
          }
          .cust-email {
            font-size: 11px;
          }
          .cust-amount {
            width: 100%;
            margin-left: 0;
            margin-top: 4px;
            text-align: right;
          }
          .badge {
            margin-left: 0 !important;
          }
        }

        @media (max-width: 480px) {
          .content {
            padding: 12px;
          }
          .topbar-actions {
            flex-wrap: wrap;
          }
          .search-wrap {
            order: 3;
            width: 100%;
            margin-top: 8px;
          }
        }
      `}</style>
    </>
  )
}
