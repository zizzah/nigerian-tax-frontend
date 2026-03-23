'use client'

import { useState, Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const redirect     = searchParams.get('redirect') || '/dashboard'

  const { login, isLoading, isAuthenticated } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // If already authenticated, skip straight to dashboard
  // This prevents the flicker: /login → (already logged in) → /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirect)
    }
  }, [isAuthenticated, redirect, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login({ email, password })
    if (result.success) {
      toast.success('Welcome back!')
      router.replace(redirect)
    } else {
      toast.error(result.error || 'Login failed. Please try again.')
    }
  }

  // Show spinner while redirecting authenticated users
  if (isAuthenticated) {
    return (
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 12, color: '#9e9990' }}>
        <Loader2 size={20} color="#c8952a" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: 14 }}>Redirecting...</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={cardStyle}>
      <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 24, fontWeight: 600, color: '#0f0e0b', marginBottom: 8, textAlign: 'center' }}>
        Welcome back
      </h2>
      <p style={{ fontSize: 14, color: '#6b6560', textAlign: 'center', marginBottom: 32 }}>
        Sign in to your account to continue
      </p>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        {/* Email */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com" required disabled={isLoading}
            autoComplete="email" style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#c8952a'; e.target.style.boxShadow = '0 0 0 3px rgba(200,149,42,0.12)' }}
            onBlur={(e)  => { e.target.style.borderColor = '#ddd9cf'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <label style={labelStyle}>Password</label>
            <Link href="/forgot-password" style={{ fontSize: 12, color: '#c8952a', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password" required disabled={isLoading}
              autoComplete="current-password"
              style={{ ...inputStyle, padding: '12px 44px 12px 16px' }}
              onFocus={(e) => { e.target.style.borderColor = '#c8952a'; e.target.style.boxShadow = '0 0 0 3px rgba(200,149,42,0.12)' }}
              onBlur={(e)  => { e.target.style.borderColor = '#ddd9cf'; e.target.style.boxShadow = 'none' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer', color: '#9e9990', padding: 4, display: 'flex', alignItems: 'center' }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading || !email || !password}
          style={{ width: '100%', padding: '14px', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#0f0e0b', background: '#c8952a', border: 'none', cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer', opacity: isLoading || !email || !password ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
          {isLoading
            ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(15,14,11,0.3)', borderTop: '2px solid #0f0e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Signing in...</>
            : <><LogIn size={18} />Sign In</>}
        </button>
      </form>

      <p style={{ fontSize: 14, color: '#6b6560', textAlign: 'center', marginTop: 24 }}>
        Don&apos;t have an account?{' '}
        <Link href="/register" style={{ color: '#c8952a', fontWeight: 500, textDecoration: 'none' }}>
          Create account
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240, gap: 10, color: '#9e9990' }}>
        <Loader2 size={20} color="#c8952a" style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    }>
      <LoginForm />
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
  textTransform: 'uppercase', letterSpacing: '0.5px',
}
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', border: '1px solid #ddd9cf', borderRadius: 8,
  fontSize: 14, color: '#2c2a24', background: '#fff', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s', boxSizing: 'border-box',
}