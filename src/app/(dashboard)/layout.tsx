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
} from 'lucide-react'

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen]   = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  return (
    <div style={s.shell}>

      {/* ══ Mobile top-bar ══ */}
      <header style={s.mobileBar}>
        <button style={s.burger} onClick={() => setOpen(!open)}>
          {open ? <X size={22} color="#fff" /> : <Menu size={22} color="#fff" />}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={s.logoSymbol}>N</div>
          <span style={s.logoText}>TaxFlow NG</span>
        </div>
        <div style={s.userAvatar}>AO</div>
      </header>

      {/* ══ Dim overlay (mobile) ══ */}
      {open && <div style={s.overlay} onClick={() => setOpen(false)} />}

      {/* ════════════════ SIDEBAR ════════════════ */}
      <aside style={s.sidebar}>

        {/* Logo */}
        <div style={s.sidebarLogo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={s.logoSymbol}>N</div>
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

              {/* Section heading e.g. "MAIN" */}
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
                    {/* Gold bar on active item */}
                    {active && <div style={s.activeBar} />}

                    {/* Lucide icon — color via prop, immune to CSS resets */}
                    <item.icon
                      size={16}
                      strokeWidth={1.5}
                      color={color}
                      style={{ flexShrink: 0 }}
                    />

                    {/* Label text */}
                    <span style={{ ...s.navItemLabel, color }}>{item.label}</span>

                    {/* Badge */}
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
            <div style={s.userAvatar}>AO</div>
            <div>
              <div style={s.userName}>Adebayo Okonkwo</div>
              <div style={s.userRole}>Business Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ════════════════ MAIN CONTENT ════════════════ */}
      <main style={s.main}>
        {children}
      </main>

    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Pure inline-style object — Tailwind / globals.css
   cannot touch these. Matches home.html exactly.
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

  /* ── Mobile bar (hidden on desktop) ── */
  mobileBar: {
    display: 'none',          // override with media query in globals.css if needed
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
    position: 'relative',
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

  /* The label span — explicit styles so no global reset can hide it */
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