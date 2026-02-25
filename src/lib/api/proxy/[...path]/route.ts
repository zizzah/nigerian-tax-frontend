/**
 * src/app/api/proxy/[...path]/route.ts
 *
 * Universal proxy — forwards every request from the browser to the backend.
 * This sidesteps CORS entirely: the browser talks only to localhost:3000,
 * and Next.js talks server-to-server to the backend on Render.
 *
 * Route: /api/proxy/<anything>  →  BACKEND_URL/api/v1/<anything>
 * e.g.  /api/proxy/businesses/  →  https://…render.com/api/v1/businesses/
 * 
 * FIX: Changed redirect handling to 'manual' to prevent browser from making
 * direct requests to backend (which would fail CORS). We now properly
 * handle redirects server-side and return the appropriate response to browser.
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
  // Don't forward the original host header
  'host',
])

/**
 * Create CORS headers for the response
 */
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
  { params }: { params: { path: string[] } }
) {
  // Build the target URL:  /api/proxy/businesses/?foo=bar  →  BACKEND/api/v1/businesses/?foo=bar
  const pathSegments = (await params).path ?? []
  const targetPath = pathSegments.join('/')

  // Preserve query string
  const search = req.nextUrl.search ?? ''
  const targetUrl = `${BACKEND_PREFIX}/${targetPath}${search}`

  // Forward all original headers except hop-by-hop ones
  const forwardHeaders = new Headers()
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value)
    }
  })

  // Forward the body for mutation methods
  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  const body = hasBody ? await req.arrayBuffer() : undefined

  let response: Response

  try {
    // FIX: Use 'manual' redirect handling to prevent browser from making direct request to backend
    // This ensures all communication goes through the proxy with proper CORS headers
    response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body ? Buffer.from(body) : undefined,
      redirect: 'manual', // CRITICAL FIX: Don't let browser follow redirects
      // Prevent Node from caching; the client handles its own caching
      cache: 'no-store',
    })
  } catch (err) {
    console.error('[proxy] fetch error', targetUrl, err)
    const corsHeaders = getCorsHeaders()
    return NextResponse.json(
      { detail: 'Proxy could not reach backend. Check NEXT_PUBLIC_API_BASE_URL.' },
      { status: 502, headers: corsHeaders }
    )
  }

  // Handle redirect responses (3xx status)
  // When backend returns a redirect, we need to handle it properly
  if (response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
    console.log('[proxy] Redirect detected:', response.status, response.headers.get('location'))
    
    // For 301/302/307/308 redirects, we need to get the Location header
    const location = response.headers.get('location')
    
    // If it's a redirect to the backend, we should NOT follow it
    // Instead, return the redirect status to the browser with CORS headers
    // The browser will handle it, but since we're using 'manual', we need to
    // check if the redirect is to our proxy or to the backend directly
    
    // If redirect is to backend domain, we need to handle it specially
    if (location && location.includes('nigerian-tax-compliance-backend.onrender.com')) {
      // The backend is redirecting to its own domain - this shouldn't happen normally
      // But if it does, we need to convert the redirect to a proxy-friendly response
      
      // Build a new URL pointing to our proxy
      const proxyPath = location.replace(`${BACKEND}/api/v1`, '/api/proxy')
      const corsHeaders = getCorsHeaders()
      
      // Return a 200 with the redirect info so the frontend can handle it
      return NextResponse.json(
        { 
          detail: 'Redirect detected',
          redirect_to: proxyPath,
          message: 'Please use the proxy path instead'
        },
        { status: 200, headers: corsHeaders }
      )
    }
    
    // For any other redirect, just return it with CORS headers
    const corsHeaders = getCorsHeaders()
    return new NextResponse(null, {
      status: response.status,
      headers: corsHeaders,
    })
  }

  // Build response headers, stripping hop-by-hop + content-encoding
  // (Node already decoded the body for us)
  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (!HOP_BY_HOP.has(lower) && lower !== 'content-encoding') {
      responseHeaders.set(key, value)
    }
  })

  // Add CORS headers so the browser is happy (the response comes from localhost)
  const corsHeaders = getCorsHeaders()
  corsHeaders.forEach((value, key) => {
    if (!responseHeaders.has(key)) {
      responseHeaders.set(key, value)
    }
  })

  const responseBody = await response.arrayBuffer()

  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

// OPTIONS preflight — return 200 immediately with CORS headers
export async function OPTIONS() {
  const corsHeaders = getCorsHeaders()
  corsHeaders.set('Access-Control-Max-Age', '86400')
  
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export const GET     = handler
export const POST    = handler
export const PUT     = handler
export const PATCH   = handler
export const DELETE  = handler
