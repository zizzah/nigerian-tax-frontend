'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  
  const { login, isLoading, error, clearError } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    
    const success = await login({ email, password })
    
    if (success) {
      toast.success('Login successful!')
      router.push(redirect)
    } else if (error) {
      toast.error(error)
    }
  }

  return (
    <div style={{ 
      background: '#fff',
      borderRadius: '16px',
      padding: 'clamp(24px, 5vw, 40px)',
      boxShadow: '0 4px 24px rgba(15,14,11,0.08)',
      border: '1px solid #ddd9cf',
      width: '100%',
      maxWidth: '420px'
    }}>
      <h2 style={{ 
        fontFamily: 'Fraunces, serif',
        fontSize: '24px',
        fontWeight: 600,
        color: '#0f0e0b',
        marginBottom: '8px',
        textAlign: 'center'
      }}>
        Welcome back
      </h2>
      <p style={{ 
        fontSize: '14px', 
        color: '#6b6560',
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        Sign in to your account to continue
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: '#6b6560',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #ddd9cf',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#2c2a24',
              background: '#fff',
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              opacity: isLoading ? 0.7 : 1,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#c8952a'
              e.target.style.boxShadow = '0 0 0 3px rgba(200,149,42,0.12)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#ddd9cf'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <label style={{ 
              fontSize: '12px',
              fontWeight: 500,
              color: '#6b6560',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <Link 
              href="/forgot-password"
              style={{ fontSize: '12px', color: '#c8952a', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '12px 44px 12px 16px',
                border: '1px solid #ddd9cf',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#2c2a24',
                background: '#fff',
                outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                opacity: isLoading ? 0.7 : 1,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#c8952a'
                e.target.style.boxShadow = '0 0 0 3px rgba(200,149,42,0.12)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#ddd9cf'
                e.target.style.boxShadow = 'none'
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                color: '#9e9990',
                padding: '4px'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0f0e0b',
            background: '#c8952a',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s'
          }}
        >
          {isLoading ? (
            'Signing in...'
          ) : (
            <>
              <LogIn size={18} />
              Sign In
            </>
          )}
        </button>
      </form>

      <p style={{ 
        fontSize: '14px', 
        color: '#6b6560',
        textAlign: 'center',
        marginTop: '24px'
      }}>
        Don&apos;t have an account?{' '}
        <Link 
          href="/register"
          style={{ color: '#c8952a', fontWeight: 500, textDecoration: 'none' }}
        >
          Create account
        </Link>
      </p>
    </div>
  )
}
