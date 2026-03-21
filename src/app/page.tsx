'use client'

import Link from 'next/link'
import {
  FileText, Users, Receipt, BarChart3, Shield, Zap,
  ArrowRight, CheckCircle, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const features = [
  { icon: FileText, title: 'Smart Invoices', description: 'Create professional invoices with automatic VAT at 7.5% and WHT calculations. PDF download and email delivery built in.' },
  { icon: Users, title: 'Customer Management', description: 'Track customer details, payment history, and outstanding balances. Chase overdue invoices automatically.' },
  { icon: Receipt, title: 'Expense Tracking', description: 'Record business expenses by category. Automatic P&L statements show your real profit after COGS, OPEX, and tax.' },
  { icon: BarChart3, title: 'Financial Reports', description: 'VAT reports, aged receivables, P&L statements, and product sales reports — all exportable to PDF or CSV.' },
  { icon: Shield, title: 'Tax Compliance', description: 'Built for FIRS compliance. Tracks VAT, WHT, PAYE and other Nigerian tax obligations in one place.' },
  { icon: Zap, title: 'Online Payments', description: 'Generate Paystack payment links. Customers pay online, invoices auto-mark as PAID.' },
]

const testimonials = [
  { name: 'Adetola Bakare', role: 'CEO, TechStart Solutions', content: 'TaxFlow has transformed how we handle invoicing. I can create a professional invoice and send it to a client in under 2 minutes.', avatar: 'AB' },
  { name: 'Chioma Okonkwo', role: 'Finance Director, Lagos Retail Co', content: 'Finally, a tax compliance platform that actually understands Nigerian business needs. The P&L report is exactly what my accountant needs.', avatar: 'CO' },
  { name: 'Emeka Obi', role: 'Founder, SME Hub', content: 'The payment reminder feature alone has recovered over ₦2M in overdue invoices that I had written off.', avatar: 'EO' },
]

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', background: '#faf9f6' }}>
      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: 'rgba(250, 249, 246, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #ddd9cf' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: '#c8952a', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 700, color: '#0f0e0b' }}>₦</div>
            <div>
              <div style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#0f0e0b' }}>TaxFlow NG</div>
              <div style={{ fontSize: 10, color: '#9e9990', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Tax Compliance</div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="desktop-nav">
            <a href="#features" style={{ color: '#6b6560', textDecoration: 'none', fontSize: 14 }}>Features</a>
            <a href="#testimonials" style={{ color: '#6b6560', textDecoration: 'none', fontSize: 14 }}>Reviews</a>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/login" style={{ padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#2c2a24', textDecoration: 'none', border: '1px solid #ddd9cf', background: 'transparent' }}>Log In</Link>
              <Link href="/register" style={{ padding: '9px 18px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#0f0e0b', textDecoration: 'none', background: '#c8952a', border: 'none' }}>Get Started</Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div style={{ padding: '16px 24px', background: '#fff', borderTop: '1px solid #ddd9cf' }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} style={{ color: '#2c2a24', textDecoration: 'none', fontSize: 14 }}>Features</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} style={{ color: '#2c2a24', textDecoration: 'none', fontSize: 14 }}>Reviews</a>
              <Link href="/login" style={{ padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#2c2a24', textDecoration: 'none', border: '1px solid #ddd9cf', textAlign: 'center' }}>Log In</Link>
              <Link href="/register" style={{ padding: '12px', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#0f0e0b', textDecoration: 'none', background: '#c8952a', textAlign: 'center' }}>Get Started Free</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section style={{ padding: 'clamp(120px, 15vw, 200px) 24px clamp(60px, 8vw, 100px)', textAlign: 'center', background: 'linear-gradient(180deg, #f4f2eb 0%, #faf9f6 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(200,149,42,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: '#fff', borderRadius: 50, border: '1px solid #ddd9cf', marginBottom: 24, fontSize: 13, color: '#6b6560' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a6b4a', flexShrink: 0 }} />
            Built specifically for Nigerian SMEs
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 700, color: '#0f0e0b', lineHeight: 1.1, marginBottom: 22, letterSpacing: '-1.5px' }}>
            Invoice. Collect. Stay{' '}
            <span style={{ color: '#c8952a' }}>Tax Compliant.</span>
          </h1>
          <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', color: '#6b6560', maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.7 }}>
            The invoicing and tax compliance platform for Nigerian businesses. Create invoices, track payments, manage expenses, and stay on top of VAT and WHT — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#0f0e0b', textDecoration: 'none', background: '#c8952a' }}>
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 500, color: '#2c2a24', textDecoration: 'none', background: '#fff', border: '1px solid #ddd9cf' }}>
              Sign In
            </Link>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
            {['No credit card required', 'Free to start', 'Cancel anytime'].map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#9e9990', fontSize: 13 }}>
                <CheckCircle size={13} color="#1a6b4a" />{text}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: 'clamp(60px, 8vw, 100px) 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#0f0e0b', marginBottom: 14 }}>Everything your business needs</h2>
            <p style={{ fontSize: 16, color: '#6b6560', maxWidth: 480, margin: '0 auto' }}>Purpose-built for Nigerian tax compliance</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((feature) => (
              <div key={feature.title} style={{ padding: 28, background: '#faf9f6', borderRadius: 14, border: '1px solid #f0ede6' }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: '#c8952a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <feature.icon size={22} color="#0f0e0b" />
                </div>
                <h3 style={{ fontFamily: 'Fraunces, serif', fontSize: 18, fontWeight: 600, color: '#0f0e0b', marginBottom: 10 }}>{feature.title}</h3>
                <p style={{ fontSize: 14, color: '#6b6560', lineHeight: 1.65 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: 'clamp(60px, 8vw, 100px) 24px', background: '#f4f2eb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#0f0e0b', marginBottom: 14 }}>Trusted by Nigerian businesses</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ padding: 28, background: '#fff', borderRadius: 14, border: '1px solid #f0ede6' }}>
                <p style={{ fontSize: 15, color: '#2c2a24', lineHeight: 1.7, marginBottom: 22, fontStyle: 'italic' }}>&ldquo;{t.content}&rdquo;</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#c8952a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#0f0e0b' }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0f0e0b' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#9e9990' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(60px, 8vw, 100px) 24px', background: '#0f0e0b', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Fraunces, serif', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Ready to get started?</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 36 }}>Join Nigerian businesses already using TaxFlow NG</p>
          <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '15px 36px', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#0f0e0b', textDecoration: 'none', background: '#c8952a' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer — real links */}
      <footer style={{ padding: '32px 24px', background: '#faf9f6', borderTop: '1px solid #ddd9cf' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: '#c8952a', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 700, color: '#0f0e0b' }}>₦</div>
            <span style={{ fontFamily: 'Fraunces, serif', fontSize: 15, fontWeight: 600, color: '#0f0e0b' }}>TaxFlow NG</span>
          </div>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, flexWrap: 'wrap' }}>
            {/* Real links — no more '#' placeholders */}
            <Link href="/privacy" style={{ color: '#6b6560', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: '#6b6560', textDecoration: 'none' }}>Terms of Service</Link>
            <a href="mailto:support@taxcompliance.ng" style={{ color: '#6b6560', textDecoration: 'none' }}>Contact</a>
          </div>
          <div style={{ fontSize: 13, color: '#9e9990' }}>© {new Date().getFullYear()} TaxFlow NG</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}