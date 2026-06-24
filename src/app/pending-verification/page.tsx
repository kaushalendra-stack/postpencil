'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Mail, CheckCircle, RotateCw, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function PendingContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [countdown, setCountdown] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
    setCanResend(true)
  }, [countdown])

  const handleResend = async () => {
    if (!canResend || !email) return
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
      setCountdown(30)
      setCanResend(false)
    } catch {}
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
          <Mail className="h-8 w-8 text-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Verify your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a verification link to <strong>{email || 'your email'}</strong>.
          </p>
        </div>
        {sent && (
          <div className="flex items-center justify-center gap-2 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4" />Verification email resent!
          </div>
        )}
        <Button variant="outline" onClick={handleResend} disabled={!canResend} className="w-full h-11 rounded-xl">
          {canResend ? <><RotateCw className="h-4 w-4 mr-2" />Resend verification email</> : `Resend in ${countdown}s`}
        </Button>
        <p className="text-xs text-muted-foreground">Check your spam folder if you don&apos;t see it</p>
        <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to sign in</Link>
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
