'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, CheckCircle, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function ResetContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const id = searchParams.get('id')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to reset password'); return }
      setSuccess(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch { setError('Something went wrong.') }
    setLoading(false)
  }

  if (!token || !id) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[400px] text-center space-y-6">
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-muted-foreground">This password reset link is invalid or has expired.</p>
          <Link href="/forgot-password"><Button className="w-full h-11 rounded-xl">Request new link</Button></Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[400px] text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold">Password Reset</h1>
          <p className="text-muted-foreground">Your password has been reset. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground text-sm">Enter your new password below.</p>
        </div>
        {error && <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">New Password</Label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} placeholder="Enter new password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl bg-muted/30 pr-10" />
              <button type="button" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Confirm Password</Label>
            <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11 rounded-xl bg-muted/30" />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl font-medium text-sm bg-foreground text-background" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Reset password</span><ArrowRight className="h-4 w-4 ml-1" /></>}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground hover:underline underline-offset-4">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" /></div>}>
      <ResetContent />
    </Suspense>
  )
}
