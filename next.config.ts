import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination:
          "https://nigerian-tax-compliance-backend.onrender.com/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;