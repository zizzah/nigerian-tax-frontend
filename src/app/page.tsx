'use client'

import Link from 'next/link'
import { 
  FileText, 
  Users, 
  Receipt, 
  BarChart3, 
  Shield, 
  Zap, 
  ArrowRight, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const features = [
  {
    icon: FileText,
    title: 'Smart Invoices',
    description: 'Create professional invoices with automatic VAT calculations and customizable templates.'
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Track customer details, payment history, and outstanding balances in one place.'
  },
  {
    icon: Receipt,
    title: 'AI Document Processing',
    description: 'Upload receipts and invoices. Our AI extracts all the data automatically.'
  },
  {
    icon: BarChart3,
    title: 'Financial Analytics',
    description: 'Get insights into your business with detailed reports and revenue tracking.'
  },
  {
    icon: Shield,
    title: 'Tax Compliance',
    description: 'Stay compliant with Nigerian tax regulations. Automatic WHT and VAT calculations.'
  },
  {
    icon: Zap,
    title: 'Quick Payments',
    description: 'Record payments easily and track outstanding invoices with minimal effort.'
  }
]

const stats = [
  { value: '₦2.4B+', label: 'Invoiced' },
  { value: '15K+', label: 'Invoices' },
  { value: '5K+', label: 'Businesses' },
  { value: '99.9%', label: 'Uptime' }
]

const testimonials = [
  {
    name: 'Adetola Bakare',
    role: 'CEO, TechStart Solutions',
    content: 'TaxFlow has transformed how we handle invoicing. The AI extraction saves hours every week.',
    avatar: 'AB'
  },
  {
    name: 'Chioma Okonkwo',
    role: 'Finance Director, Lagos Retail Co',
    content: 'Finally, a tax compliance platform that actually understands Nigerian business needs.',
    avatar: 'CO'
  },
  {
    name: 'Emeka Obi',
    role: 'Founder, SME Hub',
    content: 'The automatic VAT and WHT calculations have made tax season stress-free.',
    avatar: 'EO'
  }
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6' }}>
      {/* Header */}
      <header style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 50,
        background: 'rgba(250, 249, 246, 0.9)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #ddd9cf'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#c8952a',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Fraunces, serif',
              fontSize: '22px',
              fontWeight: 700,
              color: '#0f0e0b'
            }}>₦</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '20px', fontWeight: 600, color: '#0f0e0b' }}>TaxFlow NG</div>
              <div style={{ fontSize: '10px', color: '#9e9990', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Tax Compliance</div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-nav">
            <a href="#features" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '14px' }}>Features</a>
            <a href="#pricing" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
            <a href="#testimonials" style={{ color: '#6b6560', textDecoration: 'none', fontSize: '14px' }}>Testimonials</a>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link 
                href="/login"
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  color: '#2c2a24',
                  textDecoration: 'none',
                  border: '1px solid #ddd9cf',
                  background: 'transparent'
                }}
              >
                Log In
              </Link>
              <Link 
                href="/register"
                style={{ 
                  padding: '10px 20px', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  fontWeight: 500,
                  color: '#0f0e0b',
                  textDecoration: 'none',
                  background: '#c8952a',
                  border: 'none'
                }}
              >
                Get Started
              </Link>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ 
            padding: '16px 24px', 
            background: '#fff',
            borderTop: '1px solid #ddd9cf'
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <a href="#features" style={{ color: '#2c2a24', textDecoration: 'none', fontSize: '14px' }}>Features</a>
              <a href="#pricing" style={{ color: '#2c2a24', textDecoration: 'none', fontSize: '14px' }}>Pricing</a>
              <a href="#testimonials" style={{ color: '#2c2a24', textDecoration: 'none', fontSize: '14px' }}>Testimonials</a>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <Link 
                  href="/login"
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: '#2c2a24',
                    textDecoration: 'none',
                    border: '1px solid #ddd9cf',
                    background: 'transparent',
                    textAlign: 'center'
                  }}
                >
                  Log In
                </Link>
                <Link 
                  href="/register"
                  style={{ 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '14px', 
                    fontWeight: 500,
                    color: '#0f0e0b',
                    textDecoration: 'none',
                    background: '#c8952a',
                    border: 'none',
                    textAlign: 'center'
                  }}
                >
                  Get Started
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section style={{ 
        padding: '180px 24px 100px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #f4f2eb 0%, #faf9f6 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decoration */}
        <div style={{
          position: 'absolute',
          top: '-200px',
          right: '-200px',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(200,149,42,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(26,107,74,0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 16px',
            background: '#fff',
            borderRadius: '50px',
            border: '1px solid #ddd9cf',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#6b6560'
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1a6b4a' }} />
            Trusted by 5,000+ Nigerian Businesses
          </div>

          <h1 style={{ 
            fontFamily: 'Fraunces, serif',
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 700,
            color: '#0f0e0b',
            lineHeight: 1.1,
            marginBottom: '24px',
            letterSpacing: '-2px'
          }}>
            Tax Compliance,{' '}
            <span style={{ color: '#c8952a' }}>Simplified.</span>
          </h1>

          <p style={{ 
            fontSize: '18px',
            color: '#6b6560',
            maxWidth: '600px',
            margin: '0 auto 40px',
            lineHeight: 1.7
          }}>
            The all-in-one platform for Nigerian businesses to create invoices, 
            track payments, and stay tax compliant. Powered by AI for speed and accuracy.
          </p>

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link 
              href="/register"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                color: '#0f0e0b',
                textDecoration: 'none',
                background: '#c8952a',
                transition: 'all 0.2s'
              }}
            >
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <Link 
              href="/login"
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 500,
                color: '#2c2a24',
                textDecoration: 'none',
                background: '#fff',
                border: '1px solid #ddd9cf',
                transition: 'all 0.2s'
              }}
            >
              View Demo
            </Link>
          </div>

          {/* Stats */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '48px',
            marginTop: '64px',
            flexWrap: 'wrap'
          }}>
            {stats.map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: 'Fraunces, serif',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#0f0e0b'
                }}>{stat.value}</div>
                <div style={{ fontSize: '14px', color: '#9e9990' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontFamily: 'Fraunces, serif',
              fontSize: '40px',
              fontWeight: 700,
              color: '#0f0e0b',
              marginBottom: '16px'
            }}>
              Everything you need
            </h2>
            <p style={{ fontSize: '16px', color: '#6b6560', maxWidth: '500px', margin: '0 auto' }}>
              Powerful features designed specifically for Nigerian businesses
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '32px',
                  background: '#faf9f6',
                  borderRadius: '16px',
                  border: '1px solid #f0ede6',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: '#c8952a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}>
                  <feature.icon size={24} color="#0f0e0b" />
                </div>
                <h3 style={{ 
                  fontFamily: 'Fraunces, serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#0f0e0b',
                  marginBottom: '12px'
                }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b6560', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '100px 24px', background: '#f4f2eb' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontFamily: 'Fraunces, serif',
              fontSize: '40px',
              fontWeight: 700,
              color: '#0f0e0b',
              marginBottom: '16px'
            }}>
              How it works
            </h2>
            <p style={{ fontSize: '16px', color: '#6b6560' }}>
              Get started in minutes, not days
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }} className="steps-grid">
            {[
              { step: '01', title: 'Create Account', desc: 'Sign up with your email. No credit card required.' },
              { step: '02', title: 'Add Your Business', desc: 'Enter your business details and tax information.' },
              { step: '03', title: 'Start Invoicing', desc: 'Create invoices, track payments, stay compliant.' }
            ].map((item, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontFamily: 'Fraunces, serif',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: '#c8952a',
                  opacity: 0.5,
                  marginBottom: '16px'
                }}>{item.step}</div>
                <h3 style={{ 
                  fontFamily: 'Fraunces, serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#0f0e0b',
                  marginBottom: '8px'
                }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b6560' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '100px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ 
              fontFamily: 'Fraunces, serif',
              fontSize: '40px',
              fontWeight: 700,
              color: '#0f0e0b',
              marginBottom: '16px'
            }}>
              Loved by businesses
            </h2>
            <p style={{ fontSize: '16px', color: '#6b6560' }}>
              See what Nigerian business owners say about TaxFlow
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '32px',
                  background: '#faf9f6',
                  borderRadius: '16px',
                  border: '1px solid #f0ede6'
                }}
              >
                <p style={{ 
                  fontSize: '15px', 
                  color: '#2c2a24', 
                  lineHeight: 1.7,
                  marginBottom: '24px',
                  fontStyle: 'italic'
                }}>
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    borderRadius: '50%', 
                    background: '#c8952a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#0f0e0b'
                  }}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0e0b' }}>{testimonial.name}</div>
                    <div style={{ fontSize: '12px', color: '#9e9990' }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '100px 24px', 
        background: '#0f0e0b',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ 
            fontFamily: 'Fraunces, serif',
            fontSize: '40px',
            fontWeight: 700,
            color: '#fff',
            marginBottom: '16px'
          }}>
            Ready to get started?
          </h2>
          <p style={{ 
            fontSize: '16px', 
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '40px'
          }}>
            Join thousands of Nigerian businesses already using TaxFlow
          </p>
          <Link 
            href="/register"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '18px 40px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#0f0e0b',
              textDecoration: 'none',
              background: '#c8952a',
              transition: 'all 0.2s'
            }}
          >
            Start Your Free Trial
            <ArrowRight size={20} />
          </Link>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '24px',
            marginTop: '32px'
          }}>
            {['No credit card required', '14-day free trial', 'Cancel anytime'].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                <CheckCircle size={14} />
                {text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 24px', 
        background: '#faf9f6',
        borderTop: '1px solid #ddd9cf'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#c8952a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Fraunces, serif',
              fontSize: '16px',
              fontWeight: 700,
              color: '#0f0e0b'
            }}>₦</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: '16px', fontWeight: 600, color: '#0f0e0b' }}>TaxFlow NG</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#6b6560' }}>
            <a href="#" style={{ color: '#6b6560', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: '#6b6560', textDecoration: 'none' }}>Terms of Service</a>
            <a href="#" style={{ color: '#6b6560', textDecoration: 'none' }}>Contact</a>
          </div>
          <div style={{ fontSize: '13px', color: '#9e9990' }}>
            © 2024 TaxFlow NG. All rights reserved.
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
