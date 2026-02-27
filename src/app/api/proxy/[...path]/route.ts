import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'https://nigerian-tax-compliance-backend.onrender.com'
const HOP = new Set(['connection','keep-alive','proxy-authenticate','proxy-authorization','te','trailers','transfer-encoding','upgrade','host'])

function cors() {
  const h = new Headers()
  h.set('Access-Control-Allow-Origin', '*')
  h.set('Access-Control-Allow-Credentials', 'true')
  h.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  h.set('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
  return h
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: cors() })
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const pathname = path.join('/')
  const search = req.nextUrl.search ?? ''

  const needsBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  let bodyBuffer: Buffer | undefined
  let streaming = false

  if (needsBody) {
    const ct = req.headers.get('content-type') ?? ''
    if (ct.includes('multipart/form-data')) {
      streaming = true
    } else {
      const ab = await req.arrayBuffer()
      bodyBuffer = Buffer.from(new Uint8Array(ab))
    }
  }

  const headers = new Headers()
  req.headers.forEach((v, k) => { if (!HOP.has(k.toLowerCase())) headers.set(k, v) })

  // Try both with and without trailing slash
  const urls = [
    BACKEND + '/api/v1/' + pathname.replace(/\/$/, '') + '/' + search,
    BACKEND + '/api/v1/' + pathname.replace(/\/$/, '') + search,
  ]

  let res: Response | undefined
  for (const url of urls) {
    console.log('[proxy]', req.method, url)
    try {
      const opts: RequestInit & { duplex?: string } = {
        method: req.method,
        headers,
        redirect: 'follow',
        cache: 'no-store',
      }
      if (needsBody) {
        if (streaming) {
          opts.body = req.body as ReadableStream
          opts.duplex = 'half'
        } else {
          opts.body = bodyBuffer
        }
      }
      res = await fetch(url, opts)
      console.log('[proxy]', req.method, url, '->', res.status)
      if (res.status !== 404) break
    } catch (e) {
      console.error('[proxy] error', url, e)
    }
  }

  if (!res) {
    return NextResponse.json({ detail: 'Backend unreachable' }, { status: 502, headers: cors() })
  }

  const rh = new Headers()
  res.headers.forEach((v, k) => { const l = k.toLowerCase(); if (!HOP.has(l) && l !== 'content-encoding') rh.set(k, v) })
  cors().forEach((v, k) => rh.set(k, v))
  return new NextResponse(await res.arrayBuffer(), { status: res.status, headers: rh })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler