'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './sidebar'
import { TopBar } from './topbar'
import { MobileNav } from './mobile-nav'
import { Footer } from './footer'

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password']

interface MainLayoutProps {
  children: React.ReactNode
  title?: string
  showBack?: boolean
  hideTopBar?: boolean
}

export function MainLayout({ children, title, showBack = false, hideTopBar = false }: MainLayoutProps) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (status === 'loading' && !isPublic) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (isPublic) return <>{children}</>
  if (!session) return null

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        {!hideTopBar && <TopBar title={title} onMenuClick={() => setMobileOpen(true)} showBack={showBack} />}
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
        <Footer />
      </div>
      <MobileNav />
    </div>
  )
}
