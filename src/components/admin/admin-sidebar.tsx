'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  FileText,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  X,
  ArrowLeft,
  Shield,
  BarChart3,
  Activity,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface AdminSidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

const adminNavItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Reports', href: '/admin/reports', icon: AlertTriangle },
  { label: 'Content', href: '/admin/content', icon: FileText },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Activity', href: '/admin/activity', icon: Activity },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ mobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex h-full flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="px-4 py-5 border-b border-border">
        <div className="flex items-center justify-between">
          <Link href="/home" onClick={onMobileClose} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-sm">Admin Panel</span>
          </Link>
          <button
            onClick={() => router.push('/home')}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
            title="Back to app"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Main</p>
        {adminNavItems.slice(0, 5).map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          )
        })}

        <div className="pt-4 pb-2">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">More</p>
        </div>

        {adminNavItems.slice(5).map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-3 py-3 space-y-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {session?.user && (
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="text-xs">{session.user.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">@{(session.user as any).username || 'user'}</p>
            </div>
            <Link
              href="/logout"
              onClick={onMobileClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:w-[240px] lg:flex-col lg:sticky lg:top-0 lg:h-screen lg:z-30">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] lg:hidden animate-in slide-in-from-left duration-200">
            <button onClick={onMobileClose} className="absolute right-3 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted z-50">
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
