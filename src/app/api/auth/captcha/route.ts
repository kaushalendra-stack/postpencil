import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'CAPTCHA token required' }, { status: 400 })
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json({ success: true })
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await res.json()

    if (!data.success) {
      return NextResponse.json({ success: false, error: 'CAPTCHA verification failed' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: true })
  }
}
