'use client'

import { useEffect } from 'react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to Sentry if configured
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#0f0e0b', marginBottom: 10 }}>
          Something went wrong
        </h2>
        <p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.7, marginBottom: 28 }}>
          An unexpected error occurred. Your data is safe — this is a display error only.
          {error.digest && (
            <span style={{ display: 'block', fontSize: 11, color: '#9e9990', marginTop: 8, fontFamily: 'monospace' }}>
              Error ID: {error.digest}
            </span>
          )}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={reset}
            style={{ padding: '11px 24px', background: '#c8952a', color: '#0f0e0b', border: 'none', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
            Try again
          </button>
          <button onClick={() => window.location.href = '/dashboard'}
            style={{ padding: '11px 24px', background: '#fff', color: '#2c2a24', border: '1px solid #ddd9cf', borderRadius: 9, fontWeight: 500, fontSize: 14, cursor: 'pointer' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}