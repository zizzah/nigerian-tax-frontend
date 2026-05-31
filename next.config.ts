import type { NextConfig } from 'next'

const BACKEND =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'   // ← hardcoded fallback, never undefined

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

  turbopack: {},
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
}

export default nextConfig