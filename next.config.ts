import type { NextConfig } from 'next'

const BACKEND = process.env.BACKEND_URL || 'https://nigerian-tax-compliance-backend.onrender.com'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source:      '/api/proxy/:path*',
        destination: `${BACKEND}/api/v1/:path*`,
      },
    ]
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/djtntuswd/**',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
  },

  // Silences the webpack/turbopack mismatch error in Next.js 16
  turbopack: {},

  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
}

export default nextConfig