'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '@/lib/hooks/useAuth'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuth()
  
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  })
  const [validationError, setValidationError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setValidationError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setValidationError('')
    
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }

    const success = await register({
      email: formData.email,
      password: formData.password,
      confirm_password: formData.confirmPassword,
      phone: formData.phone || undefined
    })
    
    if (success) {
      toast.success('Account created! Please check your email to verify.')
      router.push('/login')
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
        Create your account
      </h2>
      <p style={{ 
        fontSize: '14px', 
        color: '#6b6560',
        textAlign: 'center',
        marginBottom: '32px'
      }}>
        Start your 14-day free trial
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
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
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
            }}
          />
        </div>

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
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+234 800 000 0000"
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
            }}
          />
        </div>

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
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              minLength={8}
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
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9e9990',
                padding: '4px'
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ 
            display: 'block',
            fontSize: '12px',
            fontWeight: 500,
            color: '#6b6560',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Confirm Password
          </label>
          <input
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            minLength={8}
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
            }}
          />
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
            'Creating account...'
          ) : (
            <>
              <UserPlus size={18} />
              Create Account
            </>
          )}
        </button>
      </form>

      <p style={{ 
        fontSize: '12px', 
        color: '#9e9990',
        textAlign: 'center',
        marginTop: '20px',
        lineHeight: 1.6
      }}>
        By creating an account, you agree to our{' '}
        <a href="#" style={{ color: '#c8952a', textDecoration: 'none' }}>Terms of Service</a>
        {' '}and{' '}
        <a href="#" style={{ color: '#c8952a', textDecoration: 'none' }}>Privacy Policy</a>
      </p>

      <p style={{ 
        fontSize: '14px', 
        color: '#6b6560',
        textAlign: 'center',
        marginTop: '24px'
      }}>
        Already have an account?{' '}
        <Link 
          href="/login"
          style={{ color: '#c8952a', fontWeight: 500, textDecoration: 'none' }}
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
