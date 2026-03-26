import { NextRequest, NextResponse } from 'next/server'

// ── Public paths — no auth required ──────────────────────────────────────────
const PUBLIC_PATHS = [
  '/',                    // Landing page — MUST be public
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/pay',                 // Payment pages are public (customers visit them)
  '/api/proxy',
]

// ── Auth-only paths — redirect to login if not authenticated ──────────────────
// Everything under /dashboard, /invoices, /customers, etc.
const AUTH_PREFIX = [
  '/dashboard',
  '/invoices',
  '/customers',
  '/products',
  '/payments',
  '/expenses',
  '/analytics',
  '/reports',
  '/reminders',
  '/targets',
  '/documents',
  '/settings',
  '/reconciliation'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('access_token')?.value

  // 1. Always allow public paths through
  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )
  if (isPublic) {
    // If user is already logged in and visits /login or /register,
    // redirect them straight to /dashboard — no login page flicker
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // 2. Static assets and Next internals — always allow
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next()
  }

  // 3. Protected routes — require auth token
  const isProtected = AUTH_PREFIX.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
  )

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url)
    // Only set redirect param for non-root protected paths
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirect', pathname)
    }
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // Run on all paths except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}