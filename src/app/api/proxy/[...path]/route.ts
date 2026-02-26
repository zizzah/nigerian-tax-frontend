/**
 * src/app/api/proxy/[...path]/route.ts
 *
 * Universal proxy — forwards every request from the browser to the backend.
 * The browser only ever talks to localhost:3000; Node.js talks to the backend.
 *
 * Route: /api/proxy/<anything>  →  BACKEND_URL/api/v1/<anything>
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://nigerian-tax-compliance-backend.onrender.com'

const BACKEND_PREFIX = `${BACKEND}/api/v1`

// Hop-by-hop headers that must NOT be forwarded
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
])

function getCorsHeaders(): Headers {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Credentials', 'true')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept')
  return headers
}

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params
  const targetPath = (pathSegments ?? []).join('/')
  const search = req.nextUrl.search ?? ''
  const targetUrl = `${BACKEND_PREFIX}/${targetPath}${search}`

  // Forward all headers except hop-by-hop
  const forwardHeaders = new Headers()
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value)
    }
  })

  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  const body = hasBody ? await req.arrayBuffer() : undefined

  let response: Response

  try {
    response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ? Buffer.from(body) : undefined,
      redirect: 'follow', // Node follows redirects server-side; browser never sees backend URL
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[proxy] fetch error', targetUrl, err)
    return NextResponse.json(
      { detail: 'Proxy could not reach backend.' },
      { status: 502, headers: getCorsHeaders() }
    )
  }

  // Build clean response headers
  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (!HOP_BY_HOP.has(lower) && lower !== 'content-encoding') {
      responseHeaders.set(key, value)
    }
  })

  // Merge in CORS headers
  getCorsHeaders().forEach((value, key) => {
    responseHeaders.set(key, value)
  })

  const responseBody = await response.arrayBuffer()

  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

// OPTIONS preflight
export async function OPTIONS() {
  const headers = getCorsHeaders()
  headers.set('Access-Control-Max-Age', '86400')
  return new NextResponse(null, { status: 200, headers })
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler