'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Toaster } from 'sonner'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth()

  useEffect(() => {
    // Warm up Render backend — fires silently on first load
    // Prevents the 30-50 second cold start delay for first real request
    const backendBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')
      ?? 'https://nigerian-tax-compliance-backend.onrender.com'
    fetch(`${backendBase}/alive`, { method: 'GET' }).catch(() => {})

    // Check auth state
    checkAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,      // 1 minute before refetch
        retry: 1,                   // 1 retry on failure
        refetchOnWindowFocus: false,
        // Increase timeout tolerance for Render cold starts
        retryDelay: 2000,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              border: '1px solid #ddd9cf',
            },
          }}
        />
      </AuthInitializer>
    </QueryClientProvider>
  )
}

export default Providers