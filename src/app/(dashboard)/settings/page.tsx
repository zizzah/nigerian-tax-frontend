'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/lib/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [businessProfile, setBusinessProfile] = useState({
    business_name: 'Adebayo Okonkwo & Associates',
    email: 'info@adebayo-assoc.ng',
    phone: '+234 801 234 5678',
    address: '14 Awolowo Road, Ikoyi, Lagos',
    tin: '0012345678',
    rc_number: 'RC1234567',
    business_type: 'Sole Proprietorship',
  })

  const [invoiceDefaults, setInvoiceDefaults] = useState({
    vat_rate: '7.5',
    wht_rate: '5',
    payment_terms_days: 30,
    default_note: 'Payment due within 30 days. Bank details on request.',
  })

  const [userProfile, setUserProfile] = useState({
    full_name: 'Adebayo Okonkwo',
    email: 'adebayo@taxflow.ng',
  })

  const handleSaveBusiness = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Business profile saved!')
  }

  const handleSaveInvoiceDefaults = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Invoice defaults saved!')
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    toast.success('Profile updated!')
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
          Business Settings
        </h1>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
          {/* Business Profile */}
          <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
              <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
                Business Profile
              </span>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Business Name</label>
                <input 
                  type="text"
                  value={businessProfile.business_name}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, business_name: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Business Email</label>
                  <input 
                    type="email"
                    value={businessProfile.email}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Phone Number</label>
                  <input 
                    type="tel"
                    value={businessProfile.phone}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Address</label>
                <input 
                  type="text"
                  value={businessProfile.address}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, address: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>TIN (Tax ID)</label>
                  <input 
                    type="text"
                    value={businessProfile.tin}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, tin: e.target.value })}
                    placeholder="Enter your TIN"
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>RC Number</label>
                  <input 
                    type="text"
                    value={businessProfile.rc_number}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, rc_number: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Business Type</label>
                <select 
                  value={businessProfile.business_type}
                  onChange={(e) => setBusinessProfile({ ...businessProfile, business_type: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none', cursor: 'pointer' }}
                >
                  <option>Sole Proprietorship</option>
                  <option>Limited Liability Company (LLC)</option>
                  <option>Partnership</option>
                </select>
              </div>
              <button 
                onClick={handleSaveBusiness}
                disabled={isSaving}
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: '#c8952a', 
                  color: '#0f0e0b',
                  fontWeight: 500,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px'
                }}
              >
                {isSaving && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
                Save Changes
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Invoice Defaults */}
            <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
                  Invoice Defaults
                </span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Default VAT Rate</label>
                    <select 
                      value={invoiceDefaults.vat_rate}
                      onChange={(e) => setInvoiceDefaults({ ...invoiceDefaults, vat_rate: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="7.5">7.5% (Standard)</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Default WHT Rate</label>
                    <select 
                      value={invoiceDefaults.wht_rate}
                      onChange={(e) => setInvoiceDefaults({ ...invoiceDefaults, wht_rate: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none', cursor: 'pointer' }}
                    >
                      <option value="5">5% (Services)</option>
                      <option value="10">10% (Rent)</option>
                      <option value="0">None</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Payment Terms (days)</label>
                  <input 
                    type="number"
                    value={invoiceDefaults.payment_terms_days}
                    onChange={(e) => setInvoiceDefaults({ ...invoiceDefaults, payment_terms_days: parseInt(e.target.value) || 0 })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Invoice Note</label>
                  <textarea 
                    value={invoiceDefaults.default_note}
                    onChange={(e) => setInvoiceDefaults({ ...invoiceDefaults, default_note: e.target.value })}
                    rows={2}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                <button 
                  onClick={handleSaveInvoiceDefaults}
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd9cf', 
                    background: 'transparent', 
                    color: '#2c2a24',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Save Defaults
                </button>
              </div>
            </div>

            {/* User Profile */}
            <div style={{ background: '#fff', border: '1px solid #ddd9cf', borderRadius: '12px', boxShadow: '0 1px 3px rgba(15,14,11,0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #ddd9cf' }}>
                <span style={{ fontFamily: 'Fraunces, serif', fontSize: '15px', fontWeight: 600, color: '#0f0e0b' }}>
                  User Profile
                </span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Full Name</label>
                  <input 
                    type="text"
                    value={userProfile.full_name}
                    onChange={(e) => setUserProfile({ ...userProfile, full_name: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b6560', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Email</label>
                  <input 
                    type="email"
                    value={userProfile.email}
                    onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd9cf', borderRadius: '8px', fontSize: '14px', color: '#2c2a24', background: '#fff', outline: 'none' }}
                  />
                </div>
                <button 
                  onClick={handleSaveProfile}
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd9cf', 
                    background: 'transparent', 
                    color: '#2c2a24',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Update Profile
                </button>
                <button 
                  style={{ 
                    padding: '10px 20px', 
                    borderRadius: '8px', 
                    border: '1px solid #b83232', 
                    background: 'transparent', 
                    color: '#b83232',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
