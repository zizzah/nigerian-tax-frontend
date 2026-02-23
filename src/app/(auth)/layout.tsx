'use client'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-container">
      <div className="auth-content">
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">₦</div>
          </div>
          <h1 className="auth-title">TaxFlow NG</h1>
          <p className="auth-subtitle">Nigerian Business Tax Platform</p>
        </div>
        {children}
      </div>

      <style jsx>{`
        .auth-container {
          min-height: 100vh;
          background: linear-gradient(180deg, #f4f2eb 0%, #faf9f6 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .auth-content {
          width: 100%;
          max-width: 420px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: #c8952a;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Fraunces', serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f0e0b;
        }

        .auth-title {
          font-family: 'Fraunces', serif;
          font-size: 28px;
          font-weight: 700;
          color: #0f0e0b;
          margin-bottom: 4px;
        }

        .auth-subtitle {
          font-size: 14px;
          color: #6b6560;
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 16px;
          }

          .auth-header {
            margin-bottom: 24px;
          }

          .logo-icon {
            width: 36px;
            height: 36px;
            font-size: 20px;
          }

          .auth-title {
            font-size: 24px;
          }

          .auth-subtitle {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  )
}
