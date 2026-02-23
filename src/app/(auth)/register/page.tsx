'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus, Check, X } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains uppercase', met: /[A-Z]/.test(password) },
    { label: 'Contains number', met: /\d/.test(password) },
  ]

  if (!password) return null

  return (
    <div style={{ marginTop: '8px' }}>
      {checks.map((check, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          {check.met ? (
            <Check size={12} color="#1a6b4a" />
          ) : (
            <X size={12} color="#b83232" />
          )}
          <span style={{ fontSize: '11px', color: check.met ? '#1a6b4a' : '#9e9990' }}>
            {check.label}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [validationError, setValidationError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setValidationError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    const result = await register({
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      phone: formData.phone || undefined,
    })

    if (result.success) {
      toast.success('Account created! Please check your email to verify.')
      router.push('/login')
    } else {
      toast.error(result.error || 'Registration failed. Please try again.')
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #ddd9cf',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#2c2a24',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box' as const,
  }

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = '#c8952a'
      e.target.style.boxShadow = '0 0 0 3px rgba(200,149,42,0.12)'
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.target.style.borderColor = '#ddd9cf'
      e.target.style.boxShadow = 'none'
    },
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
        Create your account
      </h2>
      <p
        style={{
          fontSize: '14px',
          color: '#6b6560',
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        Start your 14-day free trial
      </p>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            disabled={isLoading}
            autoComplete="email"
            style={inputStyle}
            {...focusHandlers}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>
            Phone Number{' '}
            <span style={{ color: '#9e9990', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
              (optional)
            </span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
            disabled={isLoading}
            autoComplete="tel"
            style={inputStyle}
            {...focusHandlers}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              disabled={isLoading}
              autoComplete="new-password"
              style={{ ...inputStyle, padding: '12px 44px 12px 16px' }}
              {...focusHandlers}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              style={eyeButtonStyle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={formData.password} />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '24px' }}>
          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
              autoComplete="new-password"
              style={{
                ...inputStyle,
                borderColor:
                  formData.confirmPassword && formData.confirmPassword !== formData.password
                    ? '#b83232'
                    : '#ddd9cf',
              }}
              {...focusHandlers}
            />
          </div>
          {formData.confirmPassword && formData.confirmPassword !== formData.password && (
            <p style={{ fontSize: '11px', color: '#b83232', marginTop: '4px' }}>
              Passwords do not match
            </p>
          )}
        </div>

        {/* Validation error */}
        {validationError && (
          <div
            style={{
              padding: '10px 14px',
              background: '#fde8e8',
              border: '1px solid #f5c6c6',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#b83232',
            }}
          >
            {validationError}
          </div>
        )}

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
              Creating account...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          )}
        </button>
      </form>

      <p
        style={{
          fontSize: '12px',
          color: '#9e9990',
          textAlign: 'center',
          marginTop: '20px',
          lineHeight: 1.6,
        }}
      >
        By creating an account, you agree to our{' '}
        <a href="#" style={{ color: '#c8952a', textDecoration: 'none' }}>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" style={{ color: '#c8952a', textDecoration: 'none' }}>
          Privacy Policy
        </a>
      </p>

      <p
        style={{
          fontSize: '14px',
          color: '#6b6560',
          textAlign: 'center',
          marginTop: '24px',
        }}
      >
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#c8952a', fontWeight: 500, textDecoration: 'none' }}>
          Sign in
        </Link>
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 500,
  color: '#6b6560',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '8px',
}

const eyeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#9e9990',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
}