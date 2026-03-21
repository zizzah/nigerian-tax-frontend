import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'https://nigerian-tax-compliance-backend.onrender.com'

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const backendPath = path.join('/')
  const search     = request.nextUrl.search
  const url        = `${BACKEND}/api/v1/${backendPath}${search}`

  // Forward all headers except host
  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value)
    }
  })

  const init: RequestInit = {
    method:  request.method,
    headers,
    body:    ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
    // @ts-expect-error — duplex is required for streaming bodies in Node
    duplex: 'half',
  }

  try {
    const res = await fetch(url, init)

    // Forward response headers back to the client
    const responseHeaders = new Headers()
    res.headers.forEach((value, key) => {
      // Skip headers that Next.js manages
      if (!['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
        responseHeaders.set(key, value)
      }
    })

    return new NextResponse(res.body, {
      status:  res.status,
      headers: responseHeaders,
    })
  } catch (err) {
    console.error('[proxy] fetch error:', err)
    return NextResponse.json(
      { detail: 'Backend unreachable. Please try again.' },
      { status: 502 }
    )
  }
}

export const GET     = handler
export const POST    = handler
export const PUT     = handler
export const PATCH   = handler
export const DELETE  = handler
export const OPTIONS = handler