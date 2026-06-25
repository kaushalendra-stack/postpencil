'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animations'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => {
    const token = searchParams.get('token')
    const id = searchParams.get('id')
    return (!token || !id) ? 'error' : 'loading'
  })
  const [message, setMessage] = useState(() => {
    const token = searchParams.get('token')
    const id = searchParams.get('id')
    return (!token || !id) ? 'Invalid verification link' : ''
  })

  useEffect(() => {
    const token = searchParams.get('token')
    const id = searchParams.get('id')
    if (!token || !id) return

    let cancelled = false
    fetch(`/api/auth/verify-email?token=${token}&id=${id}`)
      .then(async (res) => {
        if (cancelled) return
        if (res.redirected) { setStatus('success'); setMessage('Email verified successfully!'); return }
        const data = await res.json()
        if (cancelled) return
        if (res.ok) { setStatus('success'); setMessage(data.message || 'Email verified successfully!') }
        else { setStatus('error'); setMessage(data.error || 'Verification failed') }
      })
      .catch(() => { if (!cancelled) { setStatus('error'); setMessage('Something went wrong.') } })

    return () => { cancelled = true }
  }, [searchParams])

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        {status === 'loading' && (
          <FadeIn>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="mt-4 text-muted-foreground">Verifying your email...</p>
          </FadeIn>
        )}
        {status === 'success' && (
          <>
            <FadeIn><div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center"><CheckCircle className="h-8 w-8 text-emerald-500" /></div></FadeIn>
            <FadeIn delay={0.1}><div className="space-y-2"><h1 className="text-2xl font-bold">Email Verified</h1><p className="text-muted-foreground">{message}</p></div></FadeIn>
            <FadeIn delay={0.2}><Link href="/login"><Button className="w-full h-11 rounded-xl">Go to Login</Button></Link></FadeIn>
          </>
        )}
        {status === 'error' && (
          <>
            <FadeIn><div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center"><XCircle className="h-8 w-8 text-red-500" /></div></FadeIn>
            <FadeIn delay={0.1}><div className="space-y-2"><h1 className="text-2xl font-bold">Verification Failed</h1><p className="text-muted-foreground">{message}</p></div></FadeIn>
            <FadeIn delay={0.2}><Link href="/login"><Button variant="outline" className="w-full h-11 rounded-xl">Back to Login</Button></Link></FadeIn>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" /></div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
