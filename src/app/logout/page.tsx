'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { LogOut, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FadeIn } from '@/components/ui/animations'

export default function LogoutPage() {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut({ redirect: false })
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-[400px] text-center space-y-6">
        <FadeIn>
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <LogOut className="h-8 w-8 text-destructive" />
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Sign out</h1>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to sign out of your account?
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <div className="space-y-3">
            <Button
              onClick={handleLogout}
              disabled={loading}
              className="w-full h-11 rounded-xl font-medium text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-[0.98] transition-all"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </>
              )}
            </Button>
            <Link
              href="/home"
              className="inline-flex items-center justify-center gap-1.5 w-full h-11 rounded-xl font-medium text-sm border border-border hover:bg-accent transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
