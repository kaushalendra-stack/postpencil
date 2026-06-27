'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import {
  Home, Compass, Bell, Bookmark, Settings, HelpCircle,
  Sun, Moon, LogOut, ChevronDown, X, Upload,
  User, MessageSquare, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

const navItems = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Discuss', href: '/discuss', icon: MessageSquare },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
]

const supportChildren = [
  { label: 'Settings', href: '/settings', icon: Settings },
  { label: 'Help Center', href: '/help', icon: HelpCircle },
]

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [supportOpen, setSupportOpen] = useState(false)

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  const isSettingsActive = supportChildren.some((child) =>
    pathname.startsWith(child.href)
  )

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center px-4 py-5">
        <Link href="/home" onClick={onMobileClose} className="flex items-center gap-2">
          <img src="/logo.svg" alt="PostPencil" className="h-12 w-auto dark:brightness-0 dark:invert" />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-accent text-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={active ? 2.2 : 1.8} />
              {item.label}
            </Link>
          )
        })}

        <Link
          href={`/user/${(session?.user as any)?.username || ''}`}
          onClick={onMobileClose}
          className={cn(
            'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
            pathname === `/user/${(session?.user as any)?.username}` ? 'bg-accent text-foreground font-semibold' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
          )}
        >
          <User className="h-[22px] w-[22px] shrink-0" strokeWidth={pathname === `/user/${(session?.user as any)?.username}` ? 2.2 : 1.8} />
          <span className="text-[15px]">Profile</span>
        </Link>
        {(session?.user as any)?.role === 'admin' && (
          <Link
            href="/admin"
            onClick={onMobileClose}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              pathname === '/admin' || pathname.startsWith('/admin/')
                ? 'bg-orange-500/10 text-orange-500 font-semibold'
                : 'text-orange-500/70 hover:bg-orange-500/10 hover:text-orange-500'
            )}
          >
            <Shield className="h-5 w-5 shrink-0" strokeWidth={pathname.startsWith('/admin') ? 2.2 : 1.8} />
            Admin Panel
          </Link>
        )}
        <div>
          <button
            onClick={() => setSupportOpen(!supportOpen)}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              isSettingsActive
                ? 'bg-accent text-foreground font-semibold'
                : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
            )}
          >
            <Settings className="h-5 w-5 shrink-0" strokeWidth={isSettingsActive ? 2.2 : 1.8} />
            <span className="flex-1 text-left">Settings & Support</span>
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200 shrink-0', supportOpen && 'rotate-180')} />
          </button>
          {supportOpen && (
            <div className="ml-4 mt-0.5 border-l border-border/50 pl-2 space-y-0.5">
              {supportChildren.map((child) => {
                const Icon = child.icon
                const active = pathname.startsWith(child.href)
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150',
                      active ? 'bg-accent/80 text-foreground' : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {child.label}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="border-t border-border/50 px-2 py-3 space-y-1.5">
        <Link
          href="/upload"
          onClick={onMobileClose}
          className="flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-3 py-2.5 text-sm font-semibold hover:bg-foreground/90 active:scale-[0.98] transition-all"
        >
          <Upload className="h-4 w-4" />
          New Resource
        </Link>

        <button
          onClick={() => {
            const next = theme === 'dark' ? 'light' : 'dark'
            setTheme(next)
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-all"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        {session?.user && (
          <div
            className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-accent/60 cursor-pointer transition-all"
            >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={session.user.image ?? undefined} />
              <AvatarFallback className="text-xs font-semibold">
                {session.user.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 xl:block">
              <p className="font-semibold text-sm truncate">{session.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">@{(session.user as any).username || 'user'}</p>
            </div>
            <LogOut className="h-4 w-4 text-muted-foreground shrink-0 xl:block" 
            onClick={async () => {
              onMobileClose()
              signOut({ callbackUrl: '/login' })
            }}
          />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-border/50 lg:bg-background lg:sticky lg:top-0 lg:h-screen lg:z-30">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-background lg:hidden animate-in slide-in-from-left duration-200">
            <button onClick={onMobileClose} className="absolute right-3 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </div>
        </>
      )}
    </>
  )
}
