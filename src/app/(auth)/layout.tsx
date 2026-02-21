export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(180deg, #f4f2eb 0%, #faf9f6 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
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
          </div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: '28px', fontWeight: 700, color: '#0f0e0b', marginBottom: '4px' }}>
            🇳🇬 TaxFlow NG
          </h1>
          <p style={{ fontSize: '14px', color: '#6b6560' }}>Nigerian Business Tax Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
