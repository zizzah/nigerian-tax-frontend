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
  X,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'

const navSections = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, badge: null },
      { label: 'Invoices',  href: '/invoices',  icon: FileText,        badge: 4    },
      { label: 'Customers', href: '/customers', icon: Users,           badge: null },
      { label: 'Products',  href: '/products',  icon: Package,         badge: null },
      { label: 'Payments',  href: '/payments',  icon: CreditCard,      badge: null },
    ],
  },
  {
    label: 'Tools',
    items: [
      { label: 'Documents', href: '/documents', icon: FileScan,  badge: null },
      { label: 'Analytics', href: '/analytics', icon: BarChart3, badge: null },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings',  href: '/settings',  icon: Settings,  badge: null },
    ],
  },
]

// Generate initials from email or name
function getInitials(email?: string | null, name?: string | null): string {
  if (name) {
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return 'U'
}

// Derive a display name from user data
function getDisplayName(user: { email: string } | null): string {
  if (!user) return 'User'
  // Use the part before @ as a friendly name
  const local = user.email.split('@')[0]
  // Capitalise each word split by dots/underscores/hyphens
  return local
    .split(/[._-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const { user, logout } = useAuth()

  const displayName = getDisplayName(user)
  const initials = getInitials(user?.email, null)

  return (
    <>
      <div style={s.shell}>

        {/* ══ Mobile top-bar ══ */}
        <header className="mobile-bar" style={s.mobileBar}>
          <button style={s.burger} onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={s.logoSymbol}>₦</div>
            <span style={s.logoText}>TaxFlow NG</span>
          </div>
          <div style={s.userAvatar} title={displayName}>{initials}</div>
        </header>

        {/* ══ Dim overlay (mobile) ══ */}
        {open && (
          <div
            style={s.overlay}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* ════════════════ SIDEBAR ════════════════ */}
        <aside
          className={`sidebar${open ? ' sidebar-open' : ''}`}
          style={s.sidebar}
        >
          {/* Logo */}
          <div style={s.sidebarLogo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={s.logoSymbol}>₦</div>
              <div>
                <div style={s.logoText}>TaxFlow NG</div>
                <div style={s.logoSub}>Tax Compliance</div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={s.sidebarNav}>
            {navSections.map((section) => (
              <div key={section.label} style={s.navSection}>
                <div style={s.navLabel}>{section.label}</div>

                {section.items.map((item) => {
                  const active  = pathname === item.href || pathname.startsWith(item.href + '/')
                  const isHover = hovered === item.href && !active
                  const color   = active  ? '#f0c96b'
                                : isHover ? 'rgba(255,255,255,0.85)'
                                :           'rgba(255,255,255,0.5)'
                  const bg      = active  ? 'rgba(200,149,42,0.15)'
                                : isHover ? 'rgba(255,255,255,0.06)'
                                :           'transparent'

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setHovered(item.href)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        ...s.navItem,
                        background: bg,
                        color,
                        textDecoration: 'none',
                      }}
                    >
                      {active && <div style={s.activeBar} />}
                      <item.icon
                        size={16}
                        strokeWidth={1.5}
                        color={color}
                        style={{ flexShrink: 0 }}
                      />
                      <span style={{ ...s.navItemLabel, color }}>{item.label}</span>
                      {item.badge && (
                        <span style={s.navBadge}>{item.badge}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}
          </nav>

          {/* User card */}
          <div style={s.sidebarFooter}>
            <div style={s.userCard}>
              <div style={s.userAvatar} title={displayName}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...s.userName, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </div>
                <div style={s.userRole}>{user?.email || 'Business Account'}</div>
              </div>
              <button
                onClick={logout}
                title="Sign out"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  opacity: 0.5,
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
              >
                <LogOut size={15} color="rgba(255,255,255,0.8)" />
              </button>
            </div>
          </div>
        </aside>

        {/* ════════════════ MAIN CONTENT ════════════════ */}
        <main style={s.main} className="dashboard-main">
          {children}
        </main>

      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        /* Desktop: show sidebar, hide mobile bar */
        .mobile-bar {
          display: none !important;
        }

        .sidebar {
          position: relative;
          transform: none;
          z-index: auto;
        }

        /* Mobile breakpoint */
        @media (max-width: 768px) {
          .mobile-bar {
            display: flex !important;
          }

          .sidebar {
            position: fixed !important;
            top: 0;
            left: 0;
            height: 100vh;
            width: 260px !important;
            z-index: 200;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          }

          .sidebar.sidebar-open {
            transform: translateX(0);
          }

          .dashboard-main {
            padding-top: 60px !important;
          }
        }

        /* Tablet tweaks */
        @media (min-width: 769px) and (max-width: 1024px) {
          .sidebar {
            width: 200px !important;
          }
        }
      `}</style>
    </>
  )
}

/* ─────────────────────────────────────────────────────
   Inline styles — matches original home.html exactly
   Only position/transform handled via className above
───────────────────────────────────────────────────── */
const s: Record<string, React.CSSProperties> = {

  shell: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    lineHeight: 1.5,
  },

  /* ── Mobile bar ── */
  mobileBar: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    height: 60,
    background: '#0f0e0b',
    padding: '0 16px',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
  },
  burger: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    alignItems: 'center',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 150,
  },

  /* ── Sidebar ── */
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: '#0f0e0b',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  sidebarLogo: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },

  logoSymbol: {
    width: 34,
    height: 34,
    background: '#c8952a',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Fraunces', serif",
    fontSize: 18,
    fontWeight: 700,
    color: '#0f0e0b',
    flexShrink: 0,
  },

  logoText: {
    fontFamily: "'Fraunces', serif",
    fontSize: 17,
    fontWeight: 600,
    color: '#ffffff',
    letterSpacing: '-0.3px',
  },

  logoSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    marginTop: 2,
  },

  sidebarNav: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 12px',
  },

  navSection: {
    marginBottom: 24,
  },

  navLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.25)',
    padding: '0 8px',
    marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  },

  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '9px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontSize: 13.5,
    fontWeight: 400,
    position: 'relative',
    width: '100%',
  },

  navItemLabel: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: 400,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    display: 'inline',
    visibility: 'visible',
    opacity: 1,
  },

  activeBar: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    background: '#c8952a',
    borderRadius: '0 2px 2px 0',
  },

  navBadge: {
    marginLeft: 'auto',
    background: '#c8952a',
    color: '#0f0e0b',
    fontSize: 10,
    fontWeight: 600,
    padding: '1px 6px',
    borderRadius: 10,
    minWidth: 18,
    textAlign: 'center',
  },

  /* ── User card ── */
  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },

  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 8,
    cursor: 'pointer',
  },

  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#c8952a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    color: '#0f0e0b',
    flexShrink: 0,
  },

  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
  },

  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  /* ── Main content area ── */
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#faf9f6',
  },
}