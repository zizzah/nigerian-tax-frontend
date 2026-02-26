/**
 * src/app/api/proxy/[...path]/route.ts
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://nigerian-tax-compliance-backend.onrender.com'

const BACKEND_PREFIX = `${BACKEND}/api/v1`

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailers', 'transfer-encoding', 'upgrade', 'host',
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

  const forwardHeaders = new Headers()
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value)
    }
  })

  const hasBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)

  // Use req.body (ReadableStream) directly.
  // DO NOT use req.arrayBuffer() + Buffer.from() — it detaches the ArrayBuffer
  // and crashes on file uploads with "Cannot perform ArrayBuffer.prototype.slice
  // on a detached ArrayBuffer".
  const body = hasBody ? req.body : undefined

  let response: Response

  try {
    response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body,
      redirect: 'follow',
      cache: 'no-store',
      // @ts-expect-error — required for streaming body in Node 18+ fetch
      duplex: 'half',
    })
  } catch (err) {
    console.error('[proxy] fetch error', targetUrl, err)
    return NextResponse.json(
      { detail: 'Proxy could not reach backend.' },
      { status: 502, headers: getCorsHeaders() }
    )
  }

  const responseHeaders = new Headers()
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (!HOP_BY_HOP.has(lower) && lower !== 'content-encoding') {
      responseHeaders.set(key, value)
    }
  })
  getCorsHeaders().forEach((value, key) => responseHeaders.set(key, value))

  const responseBody = await response.arrayBuffer()

  return new NextResponse(responseBody, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

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