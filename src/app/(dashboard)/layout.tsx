'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
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
  X
} from 'lucide-react'

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

  return (
    <div className="layout-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button 
          className="menu-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-logo">
          <div className="logo-icon">₦</div>
          <span className="logo-text">TaxFlow NG</span>
        </div>
        <div className="mobile-avatar">AO</div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <div className="logo-icon">₦</div>
            <div>
              <div className="logo-text">TaxFlow NG</div>
              <div className="logo-sub">Tax Compliance</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <div className="nav-section-title">{section.label}</div>
              {section.items.map((item, itemIndex) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <Link 
                    key={itemIndex}
                    href={item.href}
                    className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    {isActive && <div className="nav-indicator" />}
                    <item.icon size={16} strokeWidth={1.5} className="nav-icon" />
                    {item.label}
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">AO</div>
            <div>
              <div className="user-name">Adebayo Okonkwo</div>
              <div className="user-role">Business Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      <style jsx>{`
        .layout-container {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        /* Mobile Header */
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #0f0e0b;
          padding: 0 16px;
          align-items: center;
          justify-content: space-between;
          z-index: 100;
        }

        .menu-toggle {
          background: none;
          border: none;
          color: #fff;
          cursor: pointer;
          padding: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .logo-icon {
          width: 34px;
          height: 34px;
          background: #c8952a;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', serif;
          font-size: 18px;
          font-weight: 700;
          color: #0f0e0b;
        }

        .logo-text {
          font-family: 'Fraunces', serif;
          font-size: 17px;
          font-weight: 600;
          color: #fff;
        }

        .mobile-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #c8952a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #0f0e0b;
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 150;
        }

        /* Sidebar */
        .sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #0f0e0b;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .sidebar-header {
          padding: 24px 20px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .logo-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .sidebar-nav {
          flex: 1;
          overflow-y: auto;
          padding: 16px 12px;
        }

        .nav-section {
          margin-bottom: 24px;
        }

        .nav-section-title {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.25);
          padding: 0 8px;
          margin-bottom: 6px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          color: rgba(255,255,255,0.5);
          font-size: 13.5px;
          font-weight: 400;
          position: relative;
          text-decoration: none;
          background: transparent;
        }

        .nav-item:hover {
          color: #f0c96b;
          background: rgba(200,149,42,0.1);
        }

        .nav-item-active {
          color: #f0c96b;
          background: rgba(200,149,42,0.15);
        }

        .nav-indicator {
          position: absolute;
          left: 0;
          top: 20%;
          bottom: 20%;
          width: 3px;
          background: #c8952a;
          border-radius: 0 2px 2px 0;
        }

        .nav-icon {
          font-size: 15px;
          width: 18px;
          height: 18px;
          text-align: center;
          flex-shrink: 0;
          color: rgba(255,255,255,0.5);
        }

        .nav-badge {
          margin-left: auto;
          background: #c8952a;
          color: #0f0e0b;
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .sidebar-footer {
          padding: 16px 12px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #c8952a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #0f0e0b;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .user-role {
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: #faf9f6;
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .layout-container {
            flex-direction: column;
          }

          .mobile-header {
            display: flex;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar-open {
            transform: translateX(0);
          }

          .sidebar-overlay {
            display: block;
          }

          .main-content {
            margin-top: 60px;
            height: calc(100vh - 60px);
          }
        }

        @media (max-width: 640px) {
          .logo-text {
            font-size: 15px;
          }
          
          .logo-sub {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}
