'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  const S = {
    h2: { fontFamily: 'Fraunces, serif', fontSize: 20, fontWeight: 600, color: '#0f0e0b', marginTop: 36, marginBottom: 12 } as React.CSSProperties,
    ul: { paddingLeft: 24 } as React.CSSProperties,
  }
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px', fontFamily: "'DM Sans', sans-serif", color: '#2c2a24', lineHeight: 1.8 }}>
      <Link  href="/" style={{ color: '#c8952a', textDecoration: 'none', fontSize: 14, display: 'block', marginBottom: 32 }}>← Back to home</Link>

      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 32, fontWeight: 700, color: '#0f0e0b', marginBottom: 6 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: '#9e9990', marginBottom: 40 }}>Last updated: March 2026 · Applies to TaxFlow NG</p>

      <p>TaxFlow NG is committed to protecting your personal data in compliance with the <strong>Nigeria Data Protection Regulation (NDPR) 2019</strong> and the <strong>Nigeria Data Protection Act 2023</strong>.</p>

      <h2 style={S.h2}>Data we collect</h2>
      <ul style={S.ul}>
        <li>Account information: email address, phone number, password (stored as a one-way hash — we cannot read it)</li>
        <li>Business information: business name, CAC/RC number, TIN, address, bank details you enter</li>
        <li>Financial records: invoices, payments, expenses, customer names and contact details</li>
        <li>Usage data: pages visited, features used, error reports (anonymised)</li>
      </ul>

      <h2 style={S.h2}>How we use your data</h2>
      <ul style={S.ul}>
        <li>To provide the TaxFlow NG invoicing and tax compliance service</li>
        <li>To send invoice emails and payment reminders to your customers on your instruction</li>
        <li>To process online payments via Paystack</li>
        <li>To fix bugs and improve the platform</li>
        <li>To send you service notices (not marketing without your consent)</li>
      </ul>
      <p style={{ background: '#d4eddf', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#1a6b4a' }}>
        We do <strong>not</strong> sell your data. We do <strong>not</strong> use your financial data to train AI models.
      </p>

      <h2 style={S.h2}>Third-party processors</h2>
      <ul style={S.ul}>
        <li><strong>Paystack</strong> — online payment processing (see paystack.com/privacy)</li>
        <li><strong>Neon</strong> — database hosting, encrypted at rest, stored in the US</li>
        <li><strong>Cloudinary</strong> — logo and document file storage</li>
        <li><strong>Sentry</strong> — anonymised error monitoring only</li>
        <li><strong>Groq</strong> — AI analysis for the Sales Targets advisor feature only</li>
      </ul>

      <h2 style={S.h2}>Data retention</h2>
      <p>We retain your data for as long as your account is active. On account deletion, personal data is removed within 30 days. Financial records (invoices, payments) may be retained for up to 6 years as required by Nigerian tax law (FIRS regulations).</p>

      <h2 style={S.h2}>Your rights under the NDPR</h2>
      <ul style={S.ul}>
        <li><strong>Access</strong> — request a copy of all data we hold about you</li>
        <li><strong>Rectification</strong> — correct inaccurate information</li>
        <li><strong>Erasure</strong> — request deletion (subject to legal retention requirements)</li>
        <li><strong>Portability</strong> — export your data in CSV or JSON format</li>
        <li><strong>Objection</strong> — object to any processing of your data</li>
      </ul>
      <p>Email <a href="mailto:support@taxcompliance.ng" style={{ color: '#c8952a' }}>support@taxcompliance.ng</a> to exercise any of these rights. We will respond within 30 days.</p>

      <h2 style={S.h2}>Security measures</h2>
      <ul style={S.ul}>
        <li>HTTPS encryption for all data in transit</li>
        <li>Bcrypt password hashing (passwords never stored in plain text)</li>
        <li>SSL-encrypted database connections</li>
        <li>Short-lived JWT tokens (30 minute expiry)</li>
        <li>Rate limiting on authentication endpoints</li>
      </ul>

      <h2 style={S.h2}>Contact</h2>
      <p>
        <strong>Data Controller:</strong> TaxFlow NG<br />
        <strong>Email:</strong> <a href="mailto:support@taxcompliance.ng" style={{ color: '#c8952a' }}>support@taxcompliance.ng</a><br />
        <strong>NDPC complaints:</strong> <a href="https://ndpc.gov.ng" style={{ color: '#c8952a' }} target="_blank" rel="noopener noreferrer">ndpc.gov.ng</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #ddd9cf', fontSize: 13, color: '#9e9990' }}>
        <Link href="/terms" style={{ color: '#c8952a', marginRight: 20 }}>Terms of Service</Link>
        <Link href="/" style={{ color: '#9e9990' }}>Back to home</Link>
      </div>
    </div>
  )
}