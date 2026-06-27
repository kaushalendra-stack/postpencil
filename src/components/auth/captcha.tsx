'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface CaptchaProps {
  onVerify: (token: string) => void
  action?: string
}

export function Captcha({ onVerify, action }: CaptchaProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState(false)

  const renderWidget = useCallback(() => {
    const container = containerRef.current
    if (!container || !window.turnstile) return

    try {
      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey!,
        action: action || 'default',
        theme: 'auto',
        callback: (token: string) => onVerify(token),
        'error-callback': () => setError(true),
        'expired-callback': () => onVerify(''),
      })
    } catch {
      setError(true)
    }
  }, [siteKey, action, onVerify])

  useEffect(() => {
    if (!siteKey) return

    const existing = document.querySelector('script[src*="turnstile"]')
    if (existing) {
      setScriptLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => setError(true)
    document.head.appendChild(script)
  }, [siteKey])

  useEffect(() => {
    if (scriptLoaded && containerRef.current && !widgetIdRef.current) {
      const check = setInterval(() => {
        if (window.turnstile) {
          clearInterval(check)
          renderWidget()
        }
      }, 100)

      const timeout = setTimeout(() => clearInterval(check), 5000)
      return () => { clearInterval(check); clearTimeout(timeout) }
    }
  }, [scriptLoaded, renderWidget])

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch {}
      }
    }
  }, [])

  if (!siteKey) return null

  if (error) return null

  return <div ref={containerRef} className="flex justify-center" />
}

export async function verifyCaptcha(token: string): Promise<boolean> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  if (!siteKey) return true
  if (!token) return false

  try {
    const res = await fetch('/api/auth/captcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}
