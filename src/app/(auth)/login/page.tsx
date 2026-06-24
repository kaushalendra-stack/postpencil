'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function LoginForm() {
  const searchParams = useSearchParams()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showVerified, setShowVerified] = useState(false)

  useEffect(() => {
    if (searchParams.get('verified') === 'true') setShowVerified(true)
    if (searchParams.get('error') === 'invalid-credentials') setError('Invalid email/username or password')
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      // Step 1: Check if credentials are valid AND email is verified
      const checkRes = await fetch('/api/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      })
      const checkData = await checkRes.json()

      // If credentials are correct but email is NOT verified → redirect
      if (checkData.verified === false && checkData.email) {
        window.location.href = `/pending-verification?email=${encodeURIComponent(checkData.email)}`
        return
      }

      // If credentials are wrong (no email returned) → show error
      if (checkData.verified === false && !checkData.email) {
        setError('Invalid email/username or password')
        setLoading(false)
        return
      }

      // Step 2: Credentials correct AND verified → sign in
      const result = await signIn('credentials', {
        identifier,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError('Invalid email/username or password')
      } else {
        window.location.href = '/home'
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-white/[0.04] rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="inline-flex items-center gap-2"><img src="/logo.svg" alt="PostPencil" className="h-12 w-auto brightness-0 invert" /></Link>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-white leading-tight tracking-tight">Share knowledge.<br /><span className="text-zinc-400">Learn together.</span></h2>
            <p className="text-zinc-400 text-lg max-w-md leading-relaxed">Join thousands of students sharing notes, resources, and study materials.</p>
            <div className="flex gap-8 pt-4">
              <div><p className="text-3xl font-bold text-white">10K+</p><p className="text-sm text-zinc-500">Resources</p></div>
              <div><p className="text-3xl font-bold text-white">5K+</p><p className="text-sm text-zinc-500">Students</p></div>
              <div><p className="text-3xl font-bold text-white">500+</p><p className="text-sm text-zinc-500">Colleges</p></div>
            </div>
          </div>
          <p className="text-zinc-600 text-sm">&copy; {new Date().getFullYear()} PostPencil</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-10 text-center"><Link href="/" className="inline-flex items-center gap-2"><img src="/logo.svg" alt="PostPencil" className="h-12 w-auto dark:brightness-0 dark:invert" /></Link></div>
          <div className="space-y-2 mb-8"><h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1><p className="text-muted-foreground text-sm">Sign in to your account to continue</p></div>
          {showVerified && <div className="mb-4 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-600 flex items-center gap-2"><CheckCircle className="h-4 w-4" />Email verified! You can now sign in.</div>}
          {error && <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          <div className="space-y-3 mb-6">
            <button onClick={() => signIn('google', { callbackUrl: '/home' })} disabled={loading} className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium transition-all active:scale-[0.98]"><svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continue with Google</button>
            <button onClick={() => signIn('github', { callbackUrl: '/home' })} disabled={loading} className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium transition-all active:scale-[0.98]"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>Continue with GitHub</button>
          </div>
          <div className="relative mb-6"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-3 text-muted-foreground tracking-wider">or</span></div></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5"><Label className="text-sm font-medium">Email or Username</Label><Input placeholder="name@example.com or johndoe" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="h-11 rounded-xl bg-muted/30" /></div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><Label className="text-sm font-medium">Password</Label><Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link></div>
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-11 rounded-xl bg-muted/30 pr-10" />
                <button type="button" className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-medium text-sm bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98] transition-all" disabled={loading}>{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="h-4 w-4 ml-1" /></>}</Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">Don&apos;t have an account? <Link href="/register" className="font-medium text-foreground hover:underline underline-offset-4">Create one</Link></p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  )
}
