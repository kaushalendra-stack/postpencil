const rateLimit = new Map<string, { count: number; resetTime: number }>()

const WINDOW_MS = 60 * 1000
const MAX_REQUESTS = 60

const AUTH_WINDOW_MS = 15 * 60 * 1000
const AUTH_MAX_REQUESTS = 10

const UPLOAD_WINDOW_MS = 60 * 60 * 1000
const UPLOAD_MAX_REQUESTS = 20

export function checkRateLimit(
  key: string,
  options?: { windowMs?: number; maxRequests?: number }
): { allowed: boolean; remaining: number; resetTime: number } {
  const windowMs = options?.windowMs ?? WINDOW_MS
  const maxRequests = options?.maxRequests ?? MAX_REQUESTS
  const now = Date.now()

  const entry = rateLimit.get(key)

  if (!entry || now > entry.resetTime) {
    rateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime }
  }

  entry.count++
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime }
}

export function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`
}

export function getAuthRateLimit(ip: string) {
  return checkRateLimit(`auth:${ip}`, { windowMs: AUTH_WINDOW_MS, maxRequests: AUTH_MAX_REQUESTS })
}

export function getUploadRateLimit(ip: string) {
  return checkRateLimit(`upload:${ip}`, { windowMs: UPLOAD_WINDOW_MS, maxRequests: UPLOAD_MAX_REQUESTS })
}

export function getApiRateLimit(ip: string) {
  return checkRateLimit(`api:${ip}`, { windowMs: WINDOW_MS, maxRequests: MAX_REQUESTS })
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const parts = forwarded.split(',').map((p) => p.trim())
    return parts[parts.length - 1] || '127.0.0.1'
  }
  return '127.0.0.1'
}
