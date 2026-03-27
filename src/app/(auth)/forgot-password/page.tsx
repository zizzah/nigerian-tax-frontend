'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

// ── Inner component ───────────────────────────────────────────────────────────
function ForgotPasswordForm() {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail]         = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await forgotPassword(email)
    // FIX: Always show the same message regardless of API result.
    // This is the correct security pattern — prevents email enumeration.
    // Original code had inverted condition: `if (!result.success)` → toast.success
    // which showed a success toast on failure and vice-versa.
    toast.success('If that email exists, reset instructions were sent.')
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={cardStyle}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#d4eddf', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={28} color="#1a6b4a" />
        </div>
        <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 22, fontWeight: 600, color: '#0f0e0b', marginBottom: 12, textAlign: 'center' }}>
          Check your inbox
        </h2>
        <p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.6, marginBottom: 8, textAlign: 'center' }}>
          We sent password reset instructions to:
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#0f0e0b', marginBottom: 24, textAlign: 'center' }}>{email}</p>
        <p style={{ fontSize: 13, color: '#9e9990', lineHeight: 1.6, marginBottom: 32, textAlign: 'center' }}>
          Didn&apos;t receive the email? Check your spam folder, or{' '}
          <button onClick={() => setSubmitted(false)} style={{ background: 'none', border: 'none', color: '#c8952a', cursor: 'pointer', fontSize: 13, padding: 0 }}>
            try again
          </button>
          .
        </p>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#6b6560', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff3d4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Mail size={24} color="#c8952a" />
      </div>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: '#0f0e0b', marginBottom: 8, textAlign: 'center' }}>
        Forgot password?
      </h2>
      <p style={{ fontSize: 14, color: '#6b6560', textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required disabled={isLoading} autoComplete="email"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#c8952a'; e.target.style.boxShadow = '0 0 0 3px rgba(200,149,42,0.12)' }}
            onBlur={(e) => { e.target.style.borderColor = '#ddd9cf'; e.target.style.boxShadow = 'none' }}
          />
        </div>
        <button type="submit" disabled={isLoading || !email}
          style={{ width: '100%', padding: '14px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#0f0e0b', background: '#c8952a', border: 'none', cursor: isLoading || !email ? 'not-allowed' : 'pointer', opacity: isLoading || !email ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
          {isLoading
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(15,14,11,0.3)', borderTop: '2px solid #0f0e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Sending...</>
            : <><Mail size={18} />Send Reset Instructions</>}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, color: '#6b6560', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Page export wrapped in Suspense ───────────────────────────────────────────
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 10, color: '#9e9990' }}>
        <Loader2 size={20} color="#c8952a" style={{ animation: 'spin 1s linear infinite' }} />
        Loading...
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}

const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 'clamp(24px, 5vw, 40px)',
  boxShadow: '0 4px 24px rgba(15,14,11,0.08)', border: '1px solid #ddd9cf',
  width: '100%', maxWidth: 420,
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 500, color: '#6b6560',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8,
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid #ddd9cf', borderRadius: 8,
  fontSize: 14, color: '#2c2a24', background: '#fff', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
}