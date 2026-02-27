# Run this in PowerShell from your project root:
# C:\Users\USER\nigerian-tax-compliance\nigerian-tax-frontend

# Step 1: Stop dev server first (Ctrl+C if running)

# Step 2: Rename middleware.ts to proxy.ts
if (Test-Path "src\middleware.ts") {
    Copy-Item "src\middleware.ts" "src\proxy.ts"
    Remove-Item "src\middleware.ts"
    Write-Host "Renamed middleware.ts -> proxy.ts" -ForegroundColor Green
}

# Step 3: Clear Next.js cache
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "Cleared .next cache" -ForegroundColor Green
}

# Step 4: Write the new route.ts
$routeDir = "src\app\api\proxy\[...path]"
New-Item -ItemType Directory -Force -Path $routeDir | Out-Null

$routeContent = @'
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = 'https://nigerian-tax-compliance-backend.onrender.com'

const HOP_BY_HOP = new Set([
  'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailers', 'transfer-encoding', 'upgrade', 'host',
])

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
  const pathname = path.join('/').replace(/\/$/, '')
  const search = req.nextUrl.search ?? ''
  const url = `${BACKEND}/api/v1/${pathname}${search}`

  console.log(`[proxy] ${req.method} ${url}`)

  const headers = new Headers()
  req.headers.forEach((v, k) => {
    if (!HOP_BY_HOP.has(k.toLowerCase())) headers.set(k, v)
  })

  const needsBody = !['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  let body: BodyInit | undefined
  let streaming = false

  if (needsBody) {
    const ct = req.headers.get('content-type') ?? ''
    if (ct.includes('multipart/form-data')) {
      body = req.body as ReadableStream
      streaming = true
    } else {
      const ab = await req.arrayBuffer()
      body = Buffer.from(new Uint8Array(ab))
    }
  }

  let res: Response
  try {
    const fetchOptions: RequestInit & { duplex?: string } = {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      cache: 'no-store',
    }
    if (streaming) fetchOptions.duplex = 'half'

    res = await fetch(url, fetchOptions)
    console.log(`[proxy] ${req.method} ${url} -> ${res.status}`)
  } catch (e) {
    console.error('[proxy] fetch error', url, e)
    return NextResponse.json({ detail: 'Backend unreachable' }, { status: 502, headers: cors() })
  }

  // Rewrite any redirects back through the proxy so CORS is never triggered
  if ([301, 302, 307, 308].includes(res.status)) {
    const location = (res.headers.get('location') ?? '').replace(
      `${BACKEND}/api/v1`,
      '/api/proxy'
    )
    const rh = cors()
    rh.set('Location', location)
    console.log(`[proxy] redirect ${res.status} -> ${location}`)
    return new NextResponse(null, { status: res.status, headers: rh })
  }

  const rh = new Headers()
  res.headers.forEach((v, k) => {
    const l = k.toLowerCase()
    if (!HOP_BY_HOP.has(l) && l !== 'content-encoding') rh.set(k, v)
  })
  cors().forEach((v, k) => rh.set(k, v))

  return new NextResponse(await res.arrayBuffer(), {
    status: res.status,
    headers: rh,
  })
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const PATCH  = handler
export const DELETE = handler
'@

Set-Content -Path "$routeDir\route.ts" -Value $routeContent -Encoding UTF8
Write-Host "Written new route.ts" -ForegroundColor Green
Write-Host ""
Write-Host "Done! Now run: npm run dev" -ForegroundColor Cyan