import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'

interface DarkModeState {
  mode: 'light' | 'dark' | 'system'
  isDark: boolean
  setMode: (mode: 'light' | 'dark' | 'system') => void
}

export const useDarkMode = create<DarkModeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      isDark: false,
      setMode: (mode) => {
        const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
        set({ mode, isDark })
      },
    }),
    { name: 'theme-preference' }
  )
)

export function useDarkModeInit() {
  const { mode, setMode } = useDarkMode()

  useEffect(() => {
    setMode(mode)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (mode === 'system') setMode('system') }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
}