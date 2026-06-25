'use client'

import { AuthGuard } from '@/components/auth/auth-guard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AuthGuard>
        {children}
      </AuthGuard>
    </div>
  )
}
