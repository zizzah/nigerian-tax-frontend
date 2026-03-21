import type { NextConfig } from 'next'

const BACKEND = process.env.BACKEND_URL || 'https://nigerian-tax-compliance-backend.onrender.com'

const nextConfig: NextConfig = {
  // Proxy all /api/proxy/* requests to Render backend
  async rewrites() {
    return [
      {
        source:      '/api/proxy/:path*',
        destination: `${BACKEND}/api/v1/:path*`,
      },
    ]
  },

  // Allow Next.js Image component to load from Cloudinary
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/djtntuswd/**',   // your Cloudinary cloud name
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
  },

  // Production optimizations
  poweredByHeader: false,           // Remove X-Powered-By: Next.js header
  compress: true,                   // Enable gzip compression
  reactStrictMode: true,            // Catch bugs early

  // Silence noisy build warnings about known packages
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    return config
  },
}

export default nextConfig