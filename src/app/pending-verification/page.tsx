'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, RotateCw, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FadeIn } from '@/components/ui/animations'

function PendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [sent, setSent] = useState(false)
  const [emailStatus, setEmailStatus] = useState<'checking' | 'sent' | 'failed'>('checking')

  // Check if initial email was sent on page load
  useEffect(() => {
    if (!email) return
    let cancelled = false
    fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
      .then(r => r.json().then(d => {
        if (cancelled) return
        setEmailStatus(r.ok ? 'sent' : 'failed')
        if (r.ok) setSent(true)
      }))
      .catch(() => { if (!cancelled) setEmailStatus('failed') })
    return () => { cancelled = true }
  }, [email])

  // Start countdown only after email status is determined
  useEffect(() => {
    if (emailStatus === 'checking') return
    if (countdown <= 0) return
    const timer = setTimeout(() => {
      if (countdown <= 1) setCanResend(true)
      setCountdown((c) => c - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown, emailStatus])

  const handleResend = async () => {
    if (!canResend || !email) return
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setSent(true)
        setCountdown(30)
        setCanResend(false)
      }
    } catch {}
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        <FadeIn>
          <div className="mx-auto w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
            {emailStatus === 'checking' ? (
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
            ) : emailStatus === 'sent' ? (
              <Mail className="h-8 w-8 text-foreground" />
            ) : (
              <AlertCircle className="h-8 w-8 text-red-500" />
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              {emailStatus === 'checking' ? 'Sending email...' : 'Verify your email'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {emailStatus === 'checking'
                ? 'Please wait while we send the verification link.'
                : emailStatus === 'sent'
                ? <>We sent a verification link to <strong>{email || 'your email'}</strong>.</>
                : 'Failed to send verification email. Please try again.'}
            </p>
          </div>
        </FadeIn>

        {sent && emailStatus === 'sent' && (
          <FadeIn delay={0.15}>
            <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" />Email sent successfully!
            </div>
          </FadeIn>
        )}

        {emailStatus === 'failed' && (
          <FadeIn delay={0.15}>
            <div className="flex items-center justify-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />Could not send email. Try again.
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.2}>
          <Button
            variant="outline"
            onClick={handleResend}
            disabled={emailStatus === 'checking' || (!canResend && emailStatus !== 'failed')}
            className="w-full h-11 rounded-xl"
          >
            {emailStatus === 'checking'
              ? 'Sending...'
              : canResend || emailStatus === 'failed'
              ? <><RotateCw className="h-4 w-4 mr-2" />Resend verification email</>
              : `Resend in ${countdown}s`}
          </Button>
        </FadeIn>

        <FadeIn delay={0.25}>
          <p className="text-xs text-muted-foreground">Check your spam folder if you don&apos;t see it</p>
        </FadeIn>
        <FadeIn delay={0.3}>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />Back to sign in
          </Link>
        </FadeIn>
      </div>
    </div>
  )
}

export default function PendingVerificationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" /></div>}>
      <PendingContent />
    </Suspense>
  )
}
