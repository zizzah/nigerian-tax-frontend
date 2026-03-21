'use client'
import Link from 'next/link'

export default function TermsPage() {
  const h2: React.CSSProperties = { fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#0f0e0b', marginTop: 36, marginBottom: 12 }
  const ul: React.CSSProperties = { paddingLeft: 24 }
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', fontFamily: "'DM Sans', sans-serif", color: '#2c2a24', lineHeight: 1.8 }}>
      <Link  href="/" style={{ color: '#c8952a', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 32 }}>← Back to home</Link>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: '#0f0e0b', marginBottom: 6 }}>Terms of Service</h1>
      <p style={{ fontSize: 13, color: '#9e9990', marginBottom: 40 }}>Last updated: March 2026 · Effective on account creation</p>
      <p>By creating a TaxFlow NG account you agree to these terms.</p>
      <h2 style={h2}>1. The service</h2>
      <p>TaxFlow NG provides invoicing, payment tracking, expense management and tax compliance tools for Nigerian businesses. The service is provided on a subscription basis.</p>
      <h2 style={h2}>2. Your account</h2>
      <ul style={ul}>
        <li>Provide accurate business and contact information</li>
        <li>Keep your password secure — you are responsible for all activity under your account</li>
        <li>You must be 18 or older to create an account</li>
        <li>One account per business</li>
      </ul>
      <h2 style={h2}>3. Acceptable use</h2>
      <p>You may not use TaxFlow NG to create fraudulent invoices, misrepresent transactions, evade taxes, upload malicious files, or resell access to other businesses.</p>
      <h2 style={h2}>4. Your data</h2>
      <p>You own all business data you enter (invoices, customers, expenses). We are custodians, not owners. You may export your data at any time and delete your account at any time.</p>
      <h2 style={h2}>5. Payments</h2>
      <p>Online payments through TaxFlow NG are processed by Paystack, subject to Paystack&apos;s terms. Subscription fees are charged in advance. No refunds for partial periods.</p>
      <h2 style={h2}>6. Tax disclaimer</h2>
      <div style={{ background: '#fef3c7', borderRadius: 8, padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
        TaxFlow NG is a software tool, not a tax advisory service. VAT calculations and P&L reports are for reference only. You remain responsible for accurate FIRS filings. Consult a qualified accountant for specific advice.
      </div>
      <h2 style={h2}>7. Limitation of liability</h2>
      <p>We are not liable for losses from incorrect data entry, tax penalties from unreviewed reports, or hosting service interruptions. Our maximum liability is limited to subscription fees paid in the 3 months before any claim.</p>
      <h2 style={h2}>8. Termination</h2>
      <p>You may cancel at any time by emailing us. On termination you have 30 days to export your data. We may suspend accounts that violate these terms.</p>
      <h2 style={h2}>9. Governing law</h2>
      <p>These terms are governed by Nigerian law. Disputes shall be resolved in Nigerian courts.</p>
      <h2 style={h2}>Contact</h2>
      <p>Email <a href="mailto:support@taxcompliance.ng" style={{ color: '#c8952a' }}>support@taxcompliance.ng</a></p>
      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #ddd9cf', fontSize: 13 }}>
        <a href="/privacy" style={{ color: '#c8952a', marginRight: 20 }}>Privacy Policy</a>
        <Link href="/" style={{ color: '#9e9990' }}>Back to home</Link>
      </div>
    </div>
  )
}