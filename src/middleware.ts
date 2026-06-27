import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/explore',
  '/search',
  '/login',
  '/register',
  '/verify-email',
  '/pending-verification',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/cookies',
  '/guidelines',
]

const PUBLIC_API_ROUTES = [
  '/api/auth/',
  '/api/posts',
  '/api/tags',
  '/api/search',
  '/api/users/',
]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_ROUTES.includes(pathname)) return true
  if (pathname.startsWith('/post/') || pathname.startsWith('/user/') || pathname.startsWith('/discuss/')) return true
  return false
}

function isPublicApiRoute(pathname: string): boolean {
  return PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)

    if (pathname.startsWith('/api/auth/')) {
      const { allowed, remaining, resetTime } = checkRateLimit(`auth:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 })
      if (!allowed) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 }, {
          headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(resetTime) },
        })
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

    if (isPublicApiRoute(pathname) && request.method === 'GET') {
      return NextResponse.next()
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (pathname.startsWith('/api/admin')) {
      const tokenRole = (token as unknown as { role?: string })?.role
      if (tokenRole !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    return NextResponse.next()
  }

  if (isPublicRoute(pathname)) {
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/home', request.url))
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (pathname === '/admin') {
    const tokenRole = (token as unknown as { role?: string })?.role
    if (tokenRole !== 'admin') {
      return NextResponse.redirect(new URL('/home', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.svg|logo.png|logo_transparent.png|apple-touch-icon.png|og.png).*)'],
}
