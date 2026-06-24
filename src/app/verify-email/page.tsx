'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const id = searchParams.get('id')

    if (!token || !id) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    fetch(`/api/auth/verify-email?token=${token}&id=${id}`)
      .then(async (res) => {
        if (res.redirected) {
          setStatus('success')
          setMessage('Email verified successfully!')
        } else {
          const data = await res.json()
          if (res.ok) {
            setStatus('success')
            setMessage(data.message || 'Email verified successfully!')
          } else {
            setStatus('error')
            setMessage(data.error || 'Verification failed')
          }
        }
      })
      .catch(() => {
        setStatus('error')
        setMessage('Something went wrong.')
      })
  }, [searchParams])

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-6 text-center">
        {status === 'loading' && (
          <>
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Verifying your email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Email Verified</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Link href="/login">
              <Button className="w-full h-11 rounded-xl">Go to Login</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-muted-foreground">{message}</p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full h-11 rounded-xl">Back to Login</Button>
            </Link>
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
