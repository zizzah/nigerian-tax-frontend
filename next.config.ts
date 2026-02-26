import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Rewrites have been intentionally removed.
  //
  // Previously, this file had a rewrite routing /api/proxy/* directly to the
  // backend. That caused the backend's own redirects to be forwarded to the
  // browser, which then hit the backend directly and got CORS-blocked.
  //
  // All proxying is now handled by the route handler at:
  //   src/app/api/proxy/[...path]/route.ts
  //
  // That handler uses `redirect: 'follow'` so Node follows any backend
  // redirects server-side — the browser only ever talks to localhost:3000.
};

export default nextConfig;