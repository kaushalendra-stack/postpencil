import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/logo.svg' || pathname === '/logo.png' || pathname === '/og.png' || pathname === '/apple-touch-icon.png' || pathname === '/robots.txt' || pathname === '/sitemap.xml' || pathname === '/manifest.json') {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)

    if (pathname.startsWith('/api/auth/')) {
      const isInternal = ['/api/auth/session', '/api/auth/csrf', '/api/auth/providers'].some((r) => pathname.startsWith(r))
      if (!isInternal) {
        const { allowed, resetTime } = checkRateLimit(`auth:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 })
        if (!allowed) {
          return NextResponse.json({ error: 'Too many requests' }, {
            status: 429,
            headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(resetTime) },
          })
        }
      }
    } else if (pathname.startsWith('/api/upload')) {
      const { allowed } = checkRateLimit(`upload:${ip}`, { windowMs: 60 * 60 * 1000, maxRequests: 20 })
      if (!allowed) {
        return NextResponse.json({ error: 'Upload limit reached' }, { status: 429 })
      }
    } else {
      const { allowed } = checkRateLimit(`api:${ip}`, { windowMs: 60 * 1000, maxRequests: 60 })
      if (!allowed) {
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|logo.png|logo_transparent.png|apple-touch-icon.png|og.png).*)'],
}
