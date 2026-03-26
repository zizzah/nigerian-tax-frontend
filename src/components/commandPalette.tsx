'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, Users, Package, CreditCard, BarChart3, Settings, X, Zap } from 'lucide-react'

const COMMANDS = [
  { label: 'New Invoice', shortcut: 'N', href: '/invoices/new', icon: FileText, category: 'Create' },
  { label: 'Invoices', shortcut: 'I', href: '/invoices', icon: FileText, category: 'Navigate' },
  { label: 'Customers', shortcut: 'C', href: '/customers', icon: Users, category: 'Navigate' },
  { label: 'Products', shortcut: 'P', href: '/products', icon: Package, category: 'Navigate' },
  { label: 'Payments', shortcut: null, href: '/payments', icon: CreditCard, category: 'Navigate' },
  { label: 'Analytics', shortcut: 'A', href: '/analytics', icon: BarChart3, category: 'Navigate' },
  { label: 'Settings', shortcut: 'S', href: '/settings', icon: Settings, category: 'Navigate' },
  { label: 'Dashboard', shortcut: 'D', href: '/dashboard', icon: Zap, category: 'Navigate' },
]

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleKey = useCallback((e: KeyboardEvent) => {
    // Cmd+K or Ctrl+K to open
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setOpen(v => !v)
      return
    }
    // ESC to close
    if (e.key === 'Escape' && open) { setOpen(false); return }

    // Letter shortcuts when palette is closed and not in an input
    if (!open && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
      const cmd = COMMANDS.find(c => c.shortcut?.toLowerCase() === e.key.toLowerCase())
      if (cmd) { e.preventDefault(); router.push(cmd.href) }
    }
  }, [open, router])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  const filtered = query
    ? COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS

  if (!open) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}
      onClick={() => setOpen(false)}>
      <div style={{ background: 'var(--paper)', borderRadius: 14, width: '100%', maxWidth: 560, boxShadow: '0 24px 60px rgba(0,0,0,0.3)', border: '1px solid var(--border)', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <Search size={18} color="var(--text-dim)" />
          <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
            placeholder="Search commands..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: 'var(--ink)', fontFamily: 'inherit' }} />
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.map(cmd => (
            <button key={cmd.href} onClick={() => { router.push(cmd.href); setOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--cream)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid var(--border)' }}>
                <cmd.icon size={15} color="var(--gold)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)' }}>{cmd.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{cmd.category}</div>
              </div>
              {cmd.shortcut && (
                <kbd style={{ fontSize: 11, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 5, padding: '2px 7px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                  {cmd.shortcut}
                </kbd>
              )}
            </button>
          ))}
        </div>
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 16 }}>
          {[['↑↓', 'Navigate'], ['↵', 'Open'], ['Esc', 'Close'], ['⌘K', 'Toggle']].map(([key, label]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{ fontSize: 10, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 5px', fontFamily: 'monospace', color: 'var(--text-dim)' }}>{key}</kbd>
              <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}