'use client'

import { Suspense } from 'react'
import { AuthGuard } from '@/components/auth/auth-guard'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AuthGuard>
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </AuthGuard>
    </div>
  )
}
