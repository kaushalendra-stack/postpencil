import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const PUBLIC_PAGE_ROUTES = new Set([
  '/',
  '/home',
  '/explore',
  '/search',
  '/login',
  '/register',
  '/logout',
  '/verify-email',
  '/pending-verification',
  '/forgot-password',
  '/reset-password',
  '/privacy',
  '/terms',
  '/cookies',
  '/guidelines',
  '/help',
  '/discuss',
])

const PUBLIC_GET_API_ROUTES = new Set([
  '/api/posts',
  '/api/tags',
  '/api/search',
])

const AUTH_POST_ROUTES = [
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/check-verification',
  '/api/auth/callback',
  '/api/auth/signout',
  '/api/auth/signin',
]

const AUTH_PUBLIC_ROUTES = [
  '/api/auth/session',
  '/api/auth/csrf',
  '/api/auth/providers',
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/callback',
]

function isPublicPage(pathname: string): boolean {
  if (PUBLIC_PAGE_ROUTES.has(pathname)) return true
  if (pathname.startsWith('/post/') || pathname.startsWith('/user/') || pathname.startsWith('/discuss/')) return true
  return false
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/_next') || pathname === '/favicon.ico' || pathname === '/logo.svg' || pathname === '/logo.png' || pathname === '/og.png' || pathname === '/apple-touch-icon.png' || pathname === '/robots.txt' || pathname === '/sitemap.xml' || pathname === '/manifest.json') {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  })

  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)

    const isAuthInternal = request.method === 'GET' && AUTH_PUBLIC_ROUTES.some((r) => pathname.startsWith(r))

    if (pathname.startsWith('/api/auth/') && !isAuthInternal) {
      const { allowed, resetTime } = checkRateLimit(`auth:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 })
      if (!allowed) {
        return NextResponse.json({ error: 'Too many requests' }, {
          status: 429,
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

    if (request.method === 'POST' && AUTH_POST_ROUTES.some((r) => pathname.startsWith(r))) {
      return NextResponse.next()
    }

    if (request.method === 'GET' && AUTH_PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
      return NextResponse.next()
    }

    if (request.method === 'GET') {
      if (PUBLIC_GET_API_ROUTES.has(pathname) || pathname.startsWith('/api/posts/') || pathname.startsWith('/api/tags') || pathname.startsWith('/api/search') || pathname.startsWith('/api/users/')) {
        return NextResponse.next()
      }
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

  if (isPublicPage(pathname)) {
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

  if (pathname.startsWith('/admin')) {
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
