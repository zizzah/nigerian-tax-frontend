// Create src/components/DarkModeToggle.tsx
'use client'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useDarkMode } from '@/lib/hooks/useDarkMode'

export function DarkModeToggle() {
  const { mode, setMode } = useDarkMode()
  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ] as const

  return (
    <div style={{ display: 'flex', gap: 2, background: 'var(--cream)', borderRadius: 8, padding: 3, border: '1px solid var(--border)' }}>
      {options.map(({ value, icon: Icon, label }) => (
        <button key={value} onClick={() => setMode(value)}
          title={label}
          style={{
            width: 30, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: mode === value ? 'var(--paper)' : 'transparent',
            color: mode === value ? 'var(--gold)' : 'var(--text-dim)',
            boxShadow: mode === value ? 'var(--shadow)' : 'none',
          }}>
          <Icon size={14} />
        </button>
      ))}
    </div>
  )
}