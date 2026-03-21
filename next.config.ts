import type { NextConfig } from 'next'

const BACKEND = process.env.BACKEND_URL || 'https://nigerian-tax-compliance-backend.onrender.com'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // All /api/proxy/* requests get forwarded to the Render backend
        source:      '/api/proxy/:path*',
        destination: `${BACKEND}/api/v1/:path*`,
      },
    ]
  },

  async headers() {
    return [
      {
        // Allow the frontend to talk to the backend (CORS handled here)
        source: '/api/proxy/:path*',
        headers: [
          { key: 'X-Forwarded-Host', value: 'nigerian-tax-compliance-backend.onrender.com' },
        ],
      },
    ]
  },
}

export default nextConfig