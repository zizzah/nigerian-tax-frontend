'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await forgotPassword(email)

    if (result.success) {
      setSubmitted(true)
      toast.success('Reset instructions sent!')
    } else {
      // Still show success to prevent email enumeration, but log error
      // For better UX, show success regardless (security best practice)
      setSubmitted(true)
      toast.success('If that email exists, reset instructions were sent.')
    }
  }

  if (submitted) {
    return (
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: 'clamp(24px, 5vw, 40px)',
          boxShadow: '0 4px 24px rgba(15,14,11,0.08)',
          border: '1px solid #ddd9cf',
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#d4eddf',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle size={28} color="#1a6b4a" />
        </div>

        <h2
          style={{
            fontFamily: 'Fraunces, serif',
            fontSize: '22px',
            fontWeight: 600,
            color: '#0f0e0b',
            marginBottom: '12px',
          }}
        >
          Check your inbox
        </h2>

        <p style={{ fontSize: '14px', color: '#6b6560', lineHeight: 1.6, marginBottom: '8px' }}>
          We sent password reset instructions to:
        </p>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f0e0b', marginBottom: '24px' }}>
          {email}
        </p>

        <p style={{ fontSize: '13px', color: '#9e9990', lineHeight: 1.6, marginBottom: '32px' }}>
          Didn&apos;t receive the email? Check your spam folder, or{' '}
          <button
            onClick={() => setSubmitted(false)}
            style={{
              background: 'none',
              border: 'none',
              color: '#c8952a',
              cursor: 'pointer',
              fontSize: '13px',
              padding: 0,
            }}
          >
            try again
          </button>
          .
        </p>

        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#6b6560',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>
    )
  }

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: 'clamp(24px, 5vw, 40px)',
        boxShadow: '0 4px 24px rgba(15,14,11,0.08)',
        border: '1px solid #ddd9cf',
        width: '100%',
        maxWidth: '420px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: '#fff3d4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}
      >
        <Mail size={24} color="#c8952a" />
      </div>

      <h2
        style={{
          fontFamily: 'Fraunces, serif',
          fontSize: '24px',
          fontWeight: 600,
          color: '#0f0e0b',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        Forgot password?
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#6b6560',
          textAlign: 'center',
          marginBottom: '32px',
          lineHeight: 1.6,
        }}
      >
        Enter your email address and we&apos;ll send you instructions to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 500,
              color: '#6b6560',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
            }}
          >
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            autoComplete="email"
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
              boxSizing: 'border-box',
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

        <button
          type="submit"
          disabled={isLoading || !email}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#0f0e0b',
            background: '#c8952a',
            border: 'none',
            cursor: isLoading || !email ? 'not-allowed' : 'pointer',
            opacity: isLoading || !email ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.15s',
          }}
        >
          {isLoading ? (
            <>
              <span
                style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(15,14,11,0.3)',
                  borderTop: '2px solid #0f0e0b',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }}
              />
              Sending...
            </>
          ) : (
            <>
              <Mail size={18} />
              Send Reset Instructions
            </>
          )}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            color: '#6b6560',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}