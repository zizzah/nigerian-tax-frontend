/**
 * API Proxy Route Handler
 * Location: app/api/proxy/[...path]/route.ts
 *
 * Forwards all requests from /api/proxy/* to the FastAPI backend,
 * attaching the auth token from cookies automatically.
 *
 * This runs server-side, so the Authorization header is never exposed
 * to the browser and CORS is not an issue.
 */
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Build the target URL: /api/proxy/products/123 → /api/v1/products/123/
  const path = params.path.join('/')
  const search = request.nextUrl.search  // preserve query params e.g. ?limit=50
  const targetUrl = `${BACKEND_URL}/api/v1/${path}/${search}`

  // Get auth token from cookies (server-side, secure)
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  // Build forwarded headers
  const headers: Record<string, string> = {
    'Content-Type': request.headers.get('Content-Type') || 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Read body for POST/PUT/PATCH
  let body: string | undefined
  if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
    body = await request.text()
  }

  // Forward the request to FastAPI
  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
    // Don't follow redirects — let FastAPI handle it
    redirect: 'manual',
  })

  // Read response body
  const responseBody = await backendResponse.text()

  // Forward status + headers back to the client
  const responseHeaders = new Headers()
  const contentType = backendResponse.headers.get('Content-Type')
  if (contentType) {
    responseHeaders.set('Content-Type', contentType)
  }

  return new NextResponse(responseBody, {
    status: backendResponse.status,
    headers: responseHeaders,
  })
}

// Export all HTTP methods
export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler