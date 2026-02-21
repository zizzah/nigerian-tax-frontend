'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Toaster } from 'sonner'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { checkAuth, isAuthenticated } = useAuth()
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        retry: 1,
        refetchOnWindowFocus: false,
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
