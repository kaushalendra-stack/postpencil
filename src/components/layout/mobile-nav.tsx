'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bell, Bookmark, Plus, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/use-notifications'

const navItems = [
  { label: 'Home', href: '/home', icon: Home },
  { label: 'Explore', href: '/explore', icon: Compass },
  { label: 'Discuss', href: '/discuss', icon: MessageSquare },
  { label: 'Alerts', href: '/notifications', icon: Bell },
  { label: 'Saved', href: '/bookmarks', icon: Bookmark },
]

export function MobileNav() {
  const pathname = usePathname()
  const { data: notifData } = useNotifications()
  const unreadCount = notifData?.unreadCount || 0

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="fixed bottom-3 left-3 right-3 z-40 lg:hidden">
      <div className="flex items-center justify-around bg-background/90 backdrop-blur-xl border border-border/50 rounded-2xl px-2 py-2 shadow-lg shadow-black/5">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-150 min-w-[52px] relative',
                active ? 'bg-accent text-foreground' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.label === 'Alerts' && unreadCount > 0 && (
                <span className="absolute top-0.5 right-1 bg-primary text-primary-foreground text-[8px] font-bold rounded-full h-3.5 min-w-3.5 flex items-center justify-center px-0.5">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )
        })}
        <Link
          href="/upload"
          aria-label="Upload resource"
          className="flex items-center justify-center h-10 w-10 rounded-full bg-foreground text-background shadow-md active:scale-95 transition-transform -mt-3"
        >
          <Plus className="h-5 w-5" strokeWidth={2.5} />
        </Link>
      </div>
    </nav>
  )
}
