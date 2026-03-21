export default function DashboardLoading() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#9e9990', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 28, height: 28, border: '3px solid #f0ede6', borderTop: '3px solid #c8952a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: 14 }}>Loading...</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}