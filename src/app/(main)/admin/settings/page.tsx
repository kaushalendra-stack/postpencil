'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Settings, User, Shield, Bell, Palette, Mail, ExternalLink, LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function AdminSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const sections = [
    {
      title: 'Account',
      items: [
        { label: 'Profile Settings', description: 'Manage your admin profile', icon: User, href: '/settings' },
        { label: 'Security', description: 'Password and security settings', icon: Shield, href: '/settings' },
      ],
    },
    {
      title: 'Platform',
      items: [
        { label: 'User Management', description: 'Manage all platform users', icon: User, href: '/admin/users' },
        { label: 'Content Moderation', description: 'Review reports and content', icon: Shield, href: '/admin/reports' },
        { label: 'Support Tickets', description: 'Respond to user messages', icon: Mail, href: '/admin/messages' },
      ],
    },
    {
      title: 'Quick Links',
      items: [
        { label: 'View Site', description: 'Open the main application', icon: ExternalLink, href: '/home' },
        { label: 'Help Center', description: 'View help documentation', icon: Settings, href: '/help' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Admin panel settings and configuration</p>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session?.user?.image ?? undefined} />
              <AvatarFallback className="text-lg">{session?.user?.name?.charAt(0)?.toUpperCase() ?? 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{session?.user?.name}</h3>
              <p className="text-sm text-muted-foreground">@{(session?.user as any)?.username}</p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{section.title}</h2>
              <div className="rounded-xl border border-border bg-card divide-y divide-border/50">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className="flex items-center gap-4 w-full p-4 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 shrink-0">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <svg className="h-4 w-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* App Version */}
        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">PostPencil Admin Panel v1.0.0</p>
        </div>
      </div>
    </div>
  )
}
