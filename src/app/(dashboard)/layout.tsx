'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Package, 
  CreditCard, 
  FileScan, 
  BarChart3, 
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

const navItems = [
  { label: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Invoices', href: '/invoices', icon: FileText, badge: 4 },
    { label: 'Customers', href: '/customers', icon: Users },
    { label: 'Products', href: '/products', icon: Package },
    { label: 'Payments', href: '/payments', icon: CreditCard },
  ]},
  { label: 'Tools', items: [
    { label: 'Documents', href: '/documents', icon: FileScan },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  ]},
  { label: 'Account', items: [
    { label: 'Settings', href: '/settings', icon: Settings },
  ]},
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 40,
            display: 'none'
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className="sidebar sidebar-mobile" style={{
        width: '240px',
        flexShrink: 0,
        background: '#0f0e0b',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        height: '100vh',
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease'
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              background: '#c8952a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Fraunces, serif',
              fontSize: '18px',
              fontWeight: 700,
              color: '#0f0e0b',
              flexShrink: 0
            }}>₦</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '17px', fontWeight: 600, color: '#fff', letterSpacing: '-0.3px' }}>TaxFlow NG</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', textTransform: 'uppercase', marginTop: '2px' }}>Tax Compliance</div>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'none' }}
            className="sidebar-close-btn"
          >
            <X size={24} />
          </button>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
          {navItems.map((section) => (
            <div key={section.label} style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.25)', padding: '0 8px', marginBottom: '6px' }}>
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      color: isActive ? '#f0c96b' : 'rgba(255,255,255,0.5)',
                      fontSize: '13.5px',
                      fontWeight: 400,
                      position: 'relative',
                      textDecoration: 'none',
                      background: isActive ? 'rgba(200,149,42,0.15)' : 'transparent'
                    }}
                  >
                    <item.icon size={18} style={{ width: '18px', textAlign: 'center', flexShrink: 0 }} />
                    {item.label}
                    {item.badge && (
                      <span style={{
                        marginLeft: 'auto',
                        background: '#c8952a',
                        color: '#0f0e0b',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: '10px',
                        minWidth: '18px',
                        textAlign: 'center'
                      }}>{item.badge}</span>
                    )}
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '20%',
                        bottom: '20%',
                        width: '3px',
                        background: '#c8952a',
                        borderRadius: '0 2px 2px 0'
                      }} />
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#c8952a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, color: '#0f0e0b', flexShrink: 0 }}>
              {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                {user?.email?.split('@')[0] || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
                {user?.email || 'Business Owner'}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px',
              marginTop: '8px',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#faf9f6', width: '100%' }} className="main-content">
        {/* Mobile Header */}
        <header style={{ 
          height: '60px',
          background: '#faf9f6',
          borderBottom: '1px solid #ddd9cf',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          flexShrink: 0
        }} className="mobile-header">
          <button 
            onClick={() => setSidebarOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="menu-btn"
          >
            <Menu size={24} color="#2c2a24" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#c8952a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Fraunces, serif',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0f0e0b'
            }}>₦</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, color: '#0f0e0b' }} className="mobile-logo-text">TaxFlow</span>
          </div>
        </header>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-mobile {
            transform: translateX(-100%) !important;
          }
          .sidebar-mobile.open {
            transform: translateX(0) !important;
          }
          .mobile-overlay {
            display: block !important;
          }
          .sidebar-close-btn {
            display: block !important;
          }
          .menu-btn {
            display: flex !important;
          }
          .mobile-header {
            display: flex !important;
          }
          .mobile-logo-text {
            display: block !important;
          }
          .desktop-sidebar {
            display: none !important;
          }
        }
        @media (min-width: 769px) {
          .sidebar-mobile {
            transform: translateX(0) !important;
            position: relative !important;
          }
          .menu-btn {
            display: none !important;
          }
          .mobile-header {
            display: none !important;
          }
          .mobile-logo-text {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
