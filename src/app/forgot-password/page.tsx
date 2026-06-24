'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch {}
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[400px] text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center">
            <Mail className="h-8 w-8 text-foreground" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground text-sm">
              We sent a password reset link to <strong>{email}</strong>.
            </p>
          </div>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Back to sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="space-y-2">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-3.5 w-3.5" />Back to sign in
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-muted-foreground text-sm">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Email</Label>
            <Input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11 rounded-xl bg-muted/30" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-medium text-sm bg-foreground text-background" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Send reset link</span><ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </form>
      </div>
    </div>
  )
}
