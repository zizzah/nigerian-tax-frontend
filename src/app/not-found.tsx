import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f2eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ width: 56, height: 56, background: '#c8952a', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fraunces, serif', fontSize: 28, fontWeight: 700, color: '#0f0e0b', margin: '0 auto 24px' }}>
          ₦
        </div>

        {/* 404 */}
        <div style={{ fontFamily: 'Fraunces, serif', fontSize: 80, fontWeight: 700, color: '#c8952a', lineHeight: 1, marginBottom: 16 }}>
          404
        </div>

        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 26, fontWeight: 600, color: '#0f0e0b', marginBottom: 12 }}>
          Page not found
        </h1>
        <p style={{ fontSize: 15, color: '#6b6560', lineHeight: 1.7, marginBottom: 36 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#c8952a', color: '#0f0e0b', borderRadius: 10, fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
          <Link href="/"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: '#fff', color: '#2c2a24', borderRadius: 10, fontWeight: 500, fontSize: 14, textDecoration: 'none', border: '1px solid #ddd9cf' }}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}